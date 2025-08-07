// Cloudflare Workers版本的微信签名服务
// 部署到 Cloudflare Workers 用于生成微信JS-SDK签名

const WECHAT_CONFIG = {
  appId: 'wx9334c03d16a456a1',
  appSecret: '25ba6ec50d763e2d35c5cbccb0bc02e5'
};

// 使用KV存储缓存token和ticket（可选，需要绑定KV namespace）
const CACHE_KEYS = {
  ACCESS_TOKEN: 'wechat_access_token',
  JSAPI_TICKET: 'wechat_jsapi_ticket'
};

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    });
  }

  // 微信签名API端点
  if (url.pathname === '/api/wechat/signature' && request.method === 'GET') {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return createErrorResponse('URL参数必须', 400);
    }

    try {
      const config = await generateWeChatConfig(decodeURIComponent(targetUrl));
      return createSuccessResponse(config);
    } catch (error) {
      console.error('生成微信配置失败:', error);
      return createErrorResponse('生成微信签名失败: ' + error.message, 500);
    }
  }

  // 状态检查端点
  if (url.pathname === '/api/wechat/status' && request.method === 'GET') {
    return createSuccessResponse({
      status: 'ok',
      timestamp: Date.now(),
      appId: WECHAT_CONFIG.appId
    });
  }

  return new Response('Not Found', { status: 404 });
}

/**
 * 生成微信JS-SDK配置
 */
async function generateWeChatConfig(url) {
  console.log('生成微信配置，URL:', url);
  
  const ticket = await getJSAPITicket();
  const nonceStr = generateNonceStr();
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(ticket, nonceStr, timestamp, url);

  const config = {
    appId: WECHAT_CONFIG.appId,
    timestamp: timestamp,
    nonceStr: nonceStr,
    signature: signature,
    jsApiList: [
      'updateAppMessageShareData',
      'updateTimelineShareData',
      'onMenuShareAppMessage',
      'onMenuShareTimeline',
      'hideMenuItems',
      'showMenuItems'
    ]
  };

  console.log('微信配置生成成功:', { appId: config.appId, timestamp: config.timestamp });
  return config;
}

/**
 * 获取access_token
 */
async function getAccessToken() {
  // 尝试从缓存获取
  const cached = await getCachedToken();
  if (cached && cached.expire_time > Date.now()) {
    console.log('使用缓存的access_token');
    return cached.access_token;
  }

  console.log('获取新的access_token');
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`
  );

  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }

  const tokenData = {
    access_token: data.access_token,
    expire_time: Date.now() + (data.expires_in - 300) * 1000 // 提前5分钟过期
  };

  // 缓存token
  await setCachedToken(tokenData);
  
  console.log('access_token获取成功');
  return data.access_token;
}

/**
 * 获取jsapi_ticket
 */
async function getJSAPITicket() {
  // 尝试从缓存获取
  const cached = await getCachedTicket();
  if (cached && cached.expire_time > Date.now()) {
    console.log('使用缓存的jsapi_ticket');
    return cached.ticket;
  }

  console.log('获取新的jsapi_ticket');
  const accessToken = await getAccessToken();
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
  );

  const data = await response.json();
  
  if (data.errcode !== 0) {
    throw new Error(`获取jsapi_ticket失败: ${data.errmsg}`);
  }

  const ticketData = {
    ticket: data.ticket,
    expire_time: Date.now() + (data.expires_in - 300) * 1000 // 提前5分钟过期
  };

  // 缓存ticket
  await setCachedTicket(ticketData);
  
  console.log('jsapi_ticket获取成功');
  return data.ticket;
}

/**
 * 生成签名
 */
function generateSignature(jsapiTicket, nonceStr, timestamp, url) {
  const params = [
    `jsapi_ticket=${jsapiTicket}`,
    `noncestr=${nonceStr}`,
    `timestamp=${timestamp}`,
    `url=${url}`
  ];

  const sortedParams = params.sort();
  const paramString = sortedParams.join('&');
  
  console.log('签名字符串:', paramString);
  
  // 使用Web Crypto API计算SHA-1
  return sha1(paramString);
}

/**
 * SHA-1哈希函数
 */
async function sha1(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * 生成随机字符串
 */
function generateNonceStr() {
  return Math.random().toString(36).substr(2, 15);
}

/**
 * 缓存相关函数（使用简单的内存缓存，生产环境建议使用KV）
 */
let memoryCache = {
  token: null,
  ticket: null
};

async function getCachedToken() {
  // 如果有KV binding，使用KV存储
  // if (typeof WECHAT_CACHE !== 'undefined') {
  //   const cached = await WECHAT_CACHE.get(CACHE_KEYS.ACCESS_TOKEN);
  //   return cached ? JSON.parse(cached) : null;
  // }
  
  return memoryCache.token;
}

async function setCachedToken(tokenData) {
  // if (typeof WECHAT_CACHE !== 'undefined') {
  //   await WECHAT_CACHE.put(CACHE_KEYS.ACCESS_TOKEN, JSON.stringify(tokenData), {
  //     expirationTtl: 7200 // 2小时
  //   });
  // }
  
  memoryCache.token = tokenData;
}

async function getCachedTicket() {
  // if (typeof WECHAT_CACHE !== 'undefined') {
  //   const cached = await WECHAT_CACHE.get(CACHE_KEYS.JSAPI_TICKET);
  //   return cached ? JSON.parse(cached) : null;
  // }
  
  return memoryCache.ticket;
}

async function setCachedTicket(ticketData) {
  // if (typeof WECHAT_CACHE !== 'undefined') {
  //   await WECHAT_CACHE.put(CACHE_KEYS.JSAPI_TICKET, JSON.stringify(ticketData), {
  //     expirationTtl: 7200 // 2小时
  //   });
  // }
  
  memoryCache.ticket = ticketData;
}

/**
 * 辅助函数
 */
function createSuccessResponse(data) {
  return new Response(JSON.stringify(data), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

function createErrorResponse(message, status = 500) {
  return new Response(JSON.stringify({ error: message }), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/* 
部署说明：

1. 创建Cloudflare Workers：
   - 登录Cloudflare Dashboard
   - 进入Workers & Pages
   - 创建新的Worker
   - 复制此代码到编辑器中

2. 部署域名设置：
   - 设置自定义域名，如：api.aipush.fun
   - 或使用Workers的默认域名

3. 环境变量（可选）：
   - 可以把AppId和AppSecret设置为环境变量
   - 在Workers设置中添加环境变量

4. KV存储（可选优化）：
   - 创建KV namespace用于缓存token
   - 在Worker中绑定KV namespace为WECHAT_CACHE
   - 取消注释KV相关代码

5. 测试：
   curl "https://your-worker.your-subdomain.workers.dev/api/wechat/signature?url=https://news.aipush.fun"
*/