// 微信签名服务 API端点示例
// 这个文件展示如何在Node.js后端实现微信JSSDK签名生成

import express from 'express';
import crypto from 'crypto';
import axios from 'axios';

const router = express.Router();

// 微信配置 - 使用你提供的真实配置
const WECHAT_CONFIG = {
  appId: 'wx9334c03d16a456a1',
  appSecret: '25ba6ec50d763e2d35c5cbccb0bc02e5',
};

// Token和ticket缓存
let accessToken: string | null = null;
let jsapiTicket: string | null = null;
let tokenExpireTime = 0;
let ticketExpireTime = 0;

/**
 * 获取access_token
 */
async function getAccessToken(): Promise<string> {
  const now = Date.now();
  
  // 如果token未过期，直接返回
  if (accessToken && now < tokenExpireTime) {
    return accessToken;
  }

  try {
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${WECHAT_CONFIG.appId}&secret=${WECHAT_CONFIG.appSecret}`
    );

    if (response.data.errcode) {
      throw new Error(`获取access_token失败: ${response.data.errmsg}`);
    }

    accessToken = response.data.access_token;
    tokenExpireTime = now + (response.data.expires_in - 300) * 1000; // 提前5分钟过期

    console.log('获取access_token成功:', accessToken);
    return accessToken;
  } catch (error) {
    console.error('获取access_token失败:', error);
    throw error;
  }
}

/**
 * 获取jsapi_ticket
 */
async function getJSAPITicket(): Promise<string> {
  const now = Date.now();
  
  // 如果ticket未过期，直接返回
  if (jsapiTicket && now < ticketExpireTime) {
    return jsapiTicket;
  }

  try {
    const token = await getAccessToken();
    const response = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${token}&type=jsapi`
    );

    if (response.data.errcode !== 0) {
      throw new Error(`获取jsapi_ticket失败: ${response.data.errmsg}`);
    }

    jsapiTicket = response.data.ticket;
    ticketExpireTime = now + (response.data.expires_in - 300) * 1000; // 提前5分钟过期

    console.log('获取jsapi_ticket成功:', jsapiTicket);
    return jsapiTicket;
  } catch (error) {
    console.error('获取jsapi_ticket失败:', error);
    throw error;
  }
}

/**
 * 生成随机字符串
 */
function generateNonceStr(): string {
  return Math.random().toString(36).substr(2, 15);
}

/**
 * 生成时间戳
 */
function generateTimestamp(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * 生成签名
 */
function generateSignature(jsapiTicket: string, nonceStr: string, timestamp: number, url: string): string {
  // 签名算法：将参数按字典序排序，拼接成字符串，然后进行sha1加密
  const params = [
    `jsapi_ticket=${jsapiTicket}`,
    `noncestr=${nonceStr}`,
    `timestamp=${timestamp}`,
    `url=${url}`
  ];

  const sortedParams = params.sort();
  const paramString = sortedParams.join('&');
  
  console.log('签名字符串:', paramString);
  
  const signature = crypto
    .createHash('sha1')
    .update(paramString)
    .digest('hex');

  return signature;
}

/**
 * 微信JSSDK签名API端点
 */
router.get('/signature', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({
        error: 'URL参数不能为空'
      });
    }

    // URL解码
    const decodedUrl = decodeURIComponent(url as string);
    console.log('请求签名的URL:', decodedUrl);

    // 获取jsapi_ticket
    const ticket = await getJSAPITicket();
    
    // 生成签名参数
    const nonceStr = generateNonceStr();
    const timestamp = generateTimestamp();
    const signature = generateSignature(ticket, nonceStr, timestamp, decodedUrl);

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

    console.log('微信配置:', config);

    res.json(config);
  } catch (error) {
    console.error('生成微信签名失败:', error);
    res.status(500).json({
      error: '生成微信签名失败',
      message: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * 检查微信配置状态
 */
router.get('/status', (req, res) => {
  res.json({
    hasAccessToken: !!accessToken,
    hasJsapiTicket: !!jsapiTicket,
    tokenExpireTime: tokenExpireTime,
    ticketExpireTime: ticketExpireTime,
    currentTime: Date.now()
  });
});

/**
 * 清除缓存（用于调试）
 */
router.post('/clear-cache', (req, res) => {
  accessToken = null;
  jsapiTicket = null;
  tokenExpireTime = 0;
  ticketExpireTime = 0;
  
  res.json({
    message: '缓存已清除'
  });
});

export default router;

// 使用方法：
// app.use('/api/wechat', router);

/*
部署说明：

1. 环境变量配置：
   WECHAT_APP_ID=你的微信公众号AppId
   WECHAT_APP_SECRET=你的微信公众号AppSecret

2. 微信公众号配置：
   - 登录微信公众平台
   - 设置IP白名单（服务器IP地址）
   - 配置JS接口安全域名（你的网站域名）
   - 配置业务域名

3. 前端调用示例：
   const response = await fetch('/api/wechat/signature?url=' + encodeURIComponent(window.location.href));
   const config = await response.json();

4. 安全注意事项：
   - AppSecret不要泄露到前端
   - 使用HTTPS协议
   - 验证请求来源域名
   - 实施访问频率限制
*/