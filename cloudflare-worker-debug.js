// 微信分享调试监控Worker
// 专门用于记录和监控微信分享的所有请求和响应

const WECHAT_CONFIG = {
  appId: 'wx9334c03d16a456a1',
  appSecret: '25ba6ec50d763e2d35c5cbccb0bc02e5'
};

// 调试日志存储
let debugLogs = [];
let memoryCache = { token: null, ticket: null };

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const timestamp = new Date().toISOString();
  const clientIP = request.headers.get('cf-connecting-ip') || 'unknown';
  
  // 记录每个请求
  logDebugInfo('REQUEST', {
    timestamp,
    ip: clientIP,
    path: url.pathname,
    method: request.method,
    userAgent: request.headers.get('user-agent'),
    referer: request.headers.get('referer')
  });
  
  // 处理CORS预检请求
  if (request.method === 'OPTIONS') {
    return createCorsResponse();
  }

  // 调试日志查看端点
  if (url.pathname === '/debug/logs' && request.method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit')) || 50;
    const logs = debugLogs.slice(-limit);
    
    return new Response(JSON.stringify({
      total: debugLogs.length,
      logs: logs,
      timestamp: new Date().toISOString()
    }, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 清除日志端点
  if (url.pathname === '/debug/clear' && request.method === 'POST') {
    const oldCount = debugLogs.length;
    debugLogs = [];
    
    return createSuccessResponse({
      message: `清除了 ${oldCount} 条日志记录`,
      timestamp: new Date().toISOString()
    });
  }

  // 微信签名API端点
  if (url.pathname === '/api/wechat/signature' && request.method === 'GET') {
    const targetUrl = url.searchParams.get('url');
    const debug = url.searchParams.get('debug') === 'true';
    
    logDebugInfo('SIGNATURE_REQUEST', {
      targetUrl,
      debug,
      timestamp
    });
    
    if (!targetUrl) {
      const error = { error: 'URL参数必须', timestamp };
      logDebugInfo('SIGNATURE_ERROR', error);
      return createErrorResponse(error.error, 400);
    }

    try {
      const config = await generateWeChatConfig(decodeURIComponent(targetUrl), debug);
      
      logDebugInfo('SIGNATURE_SUCCESS', {
        appId: config.appId,
        timestamp: config.timestamp,
        hasSignature: !!config.signature,
        signatureLength: config.signature ? config.signature.length : 0,
        url: targetUrl
      });
      
      return createSuccessResponse(config);
    } catch (error) {
      logDebugInfo('SIGNATURE_ERROR', {
        error: error.message,
        stack: error.stack,
        url: targetUrl,
        timestamp
      });
      
      // 返回详细错误信息用于调试
      return createErrorResponse(`微信签名生成失败: ${error.message}`, 500);
    }
  }

  // 状态检查端点
  if (url.pathname === '/api/wechat/status' && request.method === 'GET') {
    const status = {
      status: 'ok',
      timestamp: Date.now(),
      appId: WECHAT_CONFIG.appId,
      cacheStatus: {
        hasToken: !!memoryCache.token,
        hasTicket: !!memoryCache.ticket,
        tokenExpired: memoryCache.token ? memoryCache.token.expire_time < Date.now() : true,
        ticketExpired: memoryCache.ticket ? memoryCache.ticket.expire_time < Date.now() : true
      },
      debugLogsCount: debugLogs.length
    };
    
    logDebugInfo('STATUS_CHECK', status);
    return createSuccessResponse(status);
  }

  // 测试HTML页面
  if (url.pathname === '/test' && request.method === 'GET') {
    return new Response(generateTestHTML(), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  logDebugInfo('NOT_FOUND', { path: url.pathname, method: request.method });
  return new Response('Not Found', { status: 404 });
}

/**
 * 生成微信JS-SDK配置
 */
async function generateWeChatConfig(url, debug = false) {
  logDebugInfo('CONFIG_START', { url, debug });
  
  try {
    const ticket = await getJSAPITicket(debug);
    const nonceStr = generateNonceStr();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = await generateSignature(ticket, nonceStr, timestamp, url, debug);

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

    if (debug) {
      config.debugInfo = {
        ticket: ticket.substring(0, 20) + '...',
        signatureInput: `jsapi_ticket=${ticket}&noncestr=${nonceStr}&timestamp=${timestamp}&url=${url}`,
        url: url
      };
    }

    logDebugInfo('CONFIG_SUCCESS', { 
      appId: config.appId, 
      timestamp: config.timestamp,
      signatureLength: signature.length,
      hasDebugInfo: !!config.debugInfo
    });
    
    return config;
  } catch (error) {
    logDebugInfo('CONFIG_ERROR', { error: error.message, stack: error.stack });
    throw error;
  }
}

/**
 * 获取access_token
 */
async function getAccessToken(debug = false) {
  if (memoryCache.token && memoryCache.token.expire_time > Date.now()) {
    logDebugInfo('TOKEN_CACHED', { expiresIn: memoryCache.token.expire_time - Date.now() });
    return memoryCache.token.access_token;
  }

  logDebugInfo('TOKEN_FETCHING', { debug });
  
  try {
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`
    );

    const data = await response.json();
    
    logDebugInfo('TOKEN_RESPONSE', { 
      hasError: !!data.errcode,
      errcode: data.errcode,
      errmsg: data.errmsg,
      hasToken: !!data.access_token,
      expiresIn: data.expires_in
    });
    
    if (data.errcode) {
      throw new Error(`获取access_token失败: ${data.errmsg} (错误码: ${data.errcode})`);
    }

    memoryCache.token = {
      access_token: data.access_token,
      expire_time: Date.now() + (data.expires_in - 300) * 1000
    };
    
    return data.access_token;
  } catch (error) {
    logDebugInfo('TOKEN_ERROR', { error: error.message });
    throw error;
  }
}

/**
 * 获取jsapi_ticket
 */
async function getJSAPITicket(debug = false) {
  if (memoryCache.ticket && memoryCache.ticket.expire_time > Date.now()) {
    logDebugInfo('TICKET_CACHED', { expiresIn: memoryCache.ticket.expire_time - Date.now() });
    return memoryCache.ticket.ticket;
  }

  logDebugInfo('TICKET_FETCHING', { debug });
  
  try {
    const accessToken = await getAccessToken(debug);
    const response = await fetch(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${accessToken}&type=jsapi`
    );

    const data = await response.json();
    
    logDebugInfo('TICKET_RESPONSE', { 
      errcode: data.errcode,
      errmsg: data.errmsg,
      hasTicket: !!data.ticket,
      expiresIn: data.expires_in
    });
    
    if (data.errcode !== 0) {
      throw new Error(`获取jsapi_ticket失败: ${data.errmsg} (错误码: ${data.errcode})`);
    }

    memoryCache.ticket = {
      ticket: data.ticket,
      expire_time: Date.now() + (data.expires_in - 300) * 1000
    };
    
    return data.ticket;
  } catch (error) {
    logDebugInfo('TICKET_ERROR', { error: error.message });
    throw error;
  }
}

/**
 * 生成签名
 */
async function generateSignature(jsapiTicket, nonceStr, timestamp, url, debug = false) {
  const params = [
    `jsapi_ticket=${jsapiTicket}`,
    `noncestr=${nonceStr}`,
    `timestamp=${timestamp}`,
    `url=${url}`
  ];

  const sortedParams = params.sort();
  const paramString = sortedParams.join('&');
  
  logDebugInfo('SIGNATURE_GENERATION', {
    paramString: debug ? paramString : paramString.substring(0, 100) + '...',
    paramsCount: params.length,
    debug
  });
  
  try {
    const signature = await sha1(paramString);
    logDebugInfo('SIGNATURE_GENERATED', { 
      signatureLength: signature.length,
      signature: debug ? signature : signature.substring(0, 10) + '...'
    });
    return signature;
  } catch (error) {
    logDebugInfo('SIGNATURE_SHA1_ERROR', { error: error.message });
    throw error;
  }
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
 * 记录调试信息
 */
function logDebugInfo(type, data) {
  const logEntry = {
    type,
    timestamp: new Date().toISOString(),
    data
  };
  
  debugLogs.push(logEntry);
  
  // 保持最近1000条日志
  if (debugLogs.length > 1000) {
    debugLogs = debugLogs.slice(-500);
  }
  
  console.log(`[${type}]`, data);
}

/**
 * 生成测试HTML页面
 */
function generateTestHTML() {
  return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>微信分享调试测试站</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; }
        .btn { padding: 10px 20px; margin: 5px; background: #007cba; color: white; border: none; border-radius: 4px; cursor: pointer; }
        .btn:hover { background: #005a8b; }
        .log { background: #f8f8f8; padding: 10px; margin: 10px 0; border-left: 4px solid #007cba; white-space: pre-wrap; font-family: monospace; font-size: 12px; max-height: 400px; overflow-y: auto; }
        .error { border-left-color: #dc3545; }
        .success { border-left-color: #28a745; }
        .info { border-left-color: #17a2b8; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 微信分享调试测试站</h1>
        
        <div style="margin: 20px 0;">
            <button class="btn" onclick="testSignatureAPI()">测试签名API</button>
            <button class="btn" onclick="testWeChatConfig()">测试微信配置</button>
            <button class="btn" onclick="loadDebugLogs()">查看调试日志</button>
            <button class="btn" onclick="clearLogs()">清除日志</button>
        </div>
        
        <div id="results"></div>
        <div id="logs"></div>
    </div>

    <script src="https://res.wx.qq.com/open/js/jweixin-1.6.0.js"></script>
    <script>
        const baseUrl = window.location.origin;
        
        async function testSignatureAPI() {
            log('🔄 测试签名API...', 'info');
            try {
                const testUrl = window.location.href;
                const response = await fetch(baseUrl + '/api/wechat/signature?url=' + encodeURIComponent(testUrl) + '&debug=true');
                const data = await response.json();
                log('✅ 签名API响应: ' + JSON.stringify(data, null, 2), 'success');
                return data;
            } catch (error) {
                log('❌ 签名API错误: ' + error.message, 'error');
                return null;
            }
        }
        
        async function testWeChatConfig() {
            log('🔄 测试微信JS-SDK配置...', 'info');
            const config = await testSignatureAPI();
            if (!config) return;
            
            if (typeof wx !== 'undefined') {
                wx.config({
                    debug: true,
                    appId: config.appId,
                    timestamp: config.timestamp,
                    nonceStr: config.nonceStr,
                    signature: config.signature,
                    jsApiList: config.jsApiList
                });
                
                wx.ready(() => {
                    log('✅ 微信JS-SDK配置成功！', 'success');
                });
                
                wx.error((res) => {
                    log('❌ 微信JS-SDK配置失败: ' + JSON.stringify(res), 'error');
                });
            } else {
                log('⚠️ 微信JS-SDK未加载', 'info');
            }
        }
        
        async function loadDebugLogs() {
            log('🔄 加载调试日志...', 'info');
            try {
                const response = await fetch(baseUrl + '/debug/logs?limit=20');
                const data = await response.json();
                log('📋 最近20条调试日志:\\n' + JSON.stringify(data, null, 2), 'info');
            } catch (error) {
                log('❌ 加载日志错误: ' + error.message, 'error');
            }
        }
        
        async function clearLogs() {
            try {
                const response = await fetch(baseUrl + '/debug/clear', { method: 'POST' });
                const data = await response.json();
                log('✅ ' + data.message, 'success');
            } catch (error) {
                log('❌ 清除日志错误: ' + error.message, 'error');
            }
        }
        
        function log(message, type = 'info') {
            const logsDiv = document.getElementById('logs');
            const logDiv = document.createElement('div');
            logDiv.className = 'log ' + type;
            logDiv.textContent = new Date().toLocaleTimeString() + ' - ' + message;
            logsDiv.appendChild(logDiv);
            logsDiv.scrollTop = logsDiv.scrollHeight;
        }
        
        // 页面加载时自动测试
        window.onload = function() {
            log('📱 微信分享调试测试站已加载', 'info');
            log('🌍 当前URL: ' + window.location.href, 'info');
            log('📱 User Agent: ' + navigator.userAgent, 'info');
            
            // 自动测试API状态
            fetch(baseUrl + '/api/wechat/status')
                .then(r => r.json())
                .then(data => log('📊 Worker状态: ' + JSON.stringify(data, null, 2), 'success'))
                .catch(e => log('❌ 状态检查失败: ' + e.message, 'error'));
        };
    </script>
</body>
</html>
`;
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
  return new Response(JSON.stringify({ error: message, timestamp: new Date().toISOString() }), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function createCorsResponse() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}