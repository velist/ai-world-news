// Cloudflare Workers版本的微信签名服务 - 修复版
// 部署到 Cloudflare Workers 用于生成微信JS-SDK签名

const WECHAT_CONFIG = {
  appId: 'wx9334c03d16a456a1',
  appSecret: '25ba6ec50d763e2d35c5cbccb0bc02e5'
};

// 缓存变量
let memoryCache = {
  token: null,
  ticket: null
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
  const signature = await generateSignature(ticket, nonceStr, timestamp, url);

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

  console.log('微信配置生成成功:', { appId: config.appId, timestamp: config.timestamp, signature: config.signature });
  return config;
}

/**
 * 获取access_token
 */
async function getAccessToken() {
  // 尝试从缓存获取
  if (memoryCache.token && memoryCache.token.expire_time > Date.now()) {
    console.log('使用缓存的access_token');
    return memoryCache.token.access_token;
  }

  console.log('获取新的access_token');
  const response = await fetch(
    `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`
  );

  const data = await response.json();
  
  if (data.errcode) {
    throw new Error(`获取access_token失败: ${data.errmsg}`);
  }

  memoryCache.token = {
    access_token: data.access_token,
    expire_time: Date.now() + (data.expires_in - 300) * 1000 // 提前5分钟过期
  };
  
  console.log('access_token获取成功');
  return data.access_token;
}

/**
 * 获取jsapi_ticket
 */
async function getJSAPITicket() {
  // 尝试从缓存获取
  if (memoryCache.ticket && memoryCache.ticket.expire_time > Date.now()) {
    console.log('使用缓存的jsapi_ticket');
    return memoryCache.ticket.ticket;
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

  memoryCache.ticket = {
    ticket: data.ticket,
    expire_time: Date.now() + (data.expires_in - 300) * 1000 // 提前5分钟过期
  };
  
  console.log('jsapi_ticket获取成功');
  return data.ticket;
}

/**
 * 生成签名 - 修复版
 */
async function generateSignature(jsapiTicket, nonceStr, timestamp, url) {
  const params = [
    `jsapi_ticket=${jsapiTicket}`,
    `noncestr=${nonceStr}`,
    `timestamp=${timestamp}`,
    `url=${url}`
  ];

  const sortedParams = params.sort();
  const paramString = sortedParams.join('&');
  
  console.log('签名字符串:', paramString);
  
  // 使用Web Crypto API计算SHA-1 - 修复版
  const signature = await sha1(paramString);
  console.log('生成的签名:', signature);
  return signature;
}

/**
 * SHA-1哈希函数 - 修复版
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
使用说明：
1. 在Cloudflare Workers编辑器中删除所有现有代码
2. 复制此文件的全部内容并粘贴
3. 点击"保存并部署"
4. 等待部署完成
*/