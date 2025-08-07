# 微信公众号配置指南

## 🔧 基本配置信息

- **AppID**: `wx9334c03d16a456a1`
- **AppSecret**: `25ba6ec50d763e2d35c5cbccb0bc02e5`
- **服务器部署**: Cloudflare Pages/Workers

## 📋 微信公众号平台配置步骤

### 1. 登录微信公众平台
访问：https://mp.weixin.qq.com
使用公众号管理员账号登录

### 2. 配置IP白名单

**导航路径**：开发 → 基本配置 → IP白名单

**Cloudflare IPv4 地址范围**（复制以下所有IP到白名单）：
```
173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22
```

**Cloudflare IPv6 地址范围**：
```
2400:cb00::/32
2606:4700::/32
2803:f800::/32
2405:b500::/32
2405:8100::/32
2a06:98c0::/29
2c0f:f248::/32
```

⚠️ **重要提示**：由于微信IP白名单有数量限制，如果IP过多，建议：
1. 先尝试添加主要的IP段：`104.16.0.0/13`、`172.64.0.0/13`、`198.41.128.0/17`
2. 如果不够用，联系微信技术支持申请扩容

### 3. 配置JS接口安全域名

**导航路径**：设置 → 公众号设置 → 功能设置 → JS接口安全域名

**设置域名**：
- `news.aipush.fun`
- `aipush.fun` (如果需要支持主域名)

**注意事项**：
- 域名不要加 `http://` 或 `https://`
- 不要加端口号
- 确保域名可以正常访问

### 4. 配置业务域名

**导航路径**：设置 → 公众号设置 → 功能设置 → 网页授权域名

**设置域名**：
- `news.aipush.fun`

### 5. 验证文件配置

微信会要求在域名根目录放置验证文件，确保：
- 验证文件可以通过 `https://news.aipush.fun/MP_verify_xxx.txt` 访问
- 文件内容与微信平台显示的一致

## 🚀 后端API部署

### Cloudflare Workers 部署示例

```javascript
// wechat-signature-worker.js
const WECHAT_CONFIG = {
  appId: 'wx9334c03d16a456a1',
  appSecret: '25ba6ec50d763e2d35c5cbccb0bc02e5'
};

let tokenCache = null;
let ticketCache = null;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  if (url.pathname === '/api/wechat/signature') {
    const targetUrl = url.searchParams.get('url');
    if (!targetUrl) {
      return new Response(JSON.stringify({error: 'URL参数必须'}), {
        status: 400,
        headers: {'Content-Type': 'application/json'}
      });
    }

    try {
      const config = await generateWeChatConfig(decodeURIComponent(targetUrl));
      return new Response(JSON.stringify(config), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    } catch (error) {
      return new Response(JSON.stringify({error: error.message}), {
        status: 500,
        headers: {'Content-Type': 'application/json'}
      });
    }
  }

  return new Response('Not Found', { status: 404 });
}

async function generateWeChatConfig(url) {
  const ticket = await getJSAPITicket();
  const nonceStr = Math.random().toString(36).substr(2, 15);
  const timestamp = Math.floor(Date.now() / 1000);
  const signature = generateSignature(ticket, nonceStr, timestamp, url);

  return {
    appId: WECHAT_CONFIG.appId,
    timestamp: timestamp,
    nonceStr: nonceStr,
    signature: signature
  };
}

// 其他辅助函数...
```

## 🧪 测试步骤

### 1. 本地开发测试
```bash
npm run dev
# 在浏览器开发工具中查看微信配置日志
```

### 2. 微信开发者工具测试
- 下载微信开发者工具
- 添加项目，选择公众号网页
- 在工具中测试分享功能

### 3. 真实微信环境测试
- 在微信中打开 `https://news.aipush.fun`
- 尝试分享页面到朋友圈和聊天
- 查看分享卡片是否显示正确

## ⚡ 问题排查

### 常见错误及解决方案

1. **invalid signature (签名错误)**
   - 检查IP白名单是否包含服务器IP
   - 确认URL参数正确（不含#锚点）
   - 验证签名算法实现

2. **config:fail (配置失败)**
   - 检查JS接口安全域名配置
   - 确认域名SSL证书有效
   - 验证appId是否正确

3. **网络请求失败**
   - 检查CORS设置
   - 确认API端点可以访问
   - 验证防火墙设置

## 📝 监控和日志

在生产环境中，建议添加以下监控：

```javascript
// 添加到API端点
console.log('WeChat API Request:', {
  timestamp: new Date().toISOString(),
  url: targetUrl,
  userAgent: request.headers.get('User-Agent')
});
```

---

**配置完成检查清单**：
- [ ] IP白名单已设置
- [ ] JS接口安全域名已配置  
- [ ] 业务域名已配置
- [ ] 验证文件已部署
- [ ] 后端API已部署
- [ ] 本地测试通过
- [ ] 真机微信测试通过