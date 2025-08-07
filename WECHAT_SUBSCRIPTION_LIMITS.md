# 个人订阅号微信分享权限检查指南

## 🔍 权限确认步骤

### 1. 登录微信公众平台检查
访问：https://mp.weixin.qq.com

#### 检查项目：
- **账号类型**：设置 → 公众号设置 → 账号信息
- **认证状态**：是否有认证标识
- **功能权限**：开发 → 接口权限 → 查看可用接口列表

### 2. JS接口安全域名设置
路径：设置 → 公众号设置 → 功能设置 → JS接口安全域名

**如果看到此选项**：✅ 可以配置微信分享
**如果没有此选项**：❌ 不支持JS-SDK分享

## 📋 三种解决方案

### 方案一：测试当前权限（推荐先试）
如果你的订阅号有JS接口安全域名设置选项，可以直接按照之前的配置进行：

1. 设置JS接口安全域名：`news.aipush.fun`
2. 配置IP白名单
3. 部署微信签名API
4. 测试分享功能

### 方案二：降级到Meta标签分享
如果没有JS-SDK权限，使用纯Meta标签方案：

```html
<!-- 这些标签会被微信自动识别 -->
<meta property="og:title" content="分享标题" />
<meta property="og:description" content="分享描述" />
<meta property="og:image" content="分享图片URL" />
<meta property="og:url" content="当前页面URL" />
```

### 方案三：申请认证服务号
如果需要完整功能，可以考虑：
- 个人也可以申请认证服务号（需要一定条件）
- 或寻找已认证的服务号合作

## 🧪 快速测试方法

### 1. 检查开发者工具权限
```javascript
// 在微信开发者工具中运行
wx.config({
  debug: true,
  appId: 'wx9334c03d16a456a1',
  timestamp: Math.floor(Date.now() / 1000),
  nonceStr: 'test',
  signature: 'test',
  jsApiList: ['updateTimelineShareData']
});
```

如果提示"没有权限"，说明订阅号不支持此接口。

### 2. 实际分享测试
1. 在微信中打开你的网页
2. 点击右上角"..."菜单
3. 选择分享到朋友圈或发送给朋友
4. 查看分享卡片是否显示正确内容

## 📱 Meta标签优化方案

即使没有JS-SDK权限，也可以通过优化Meta标签实现较好的分享效果：

```html
<!-- 基础 Open Graph 标签 -->
<meta property="og:type" content="website" />
<meta property="og:title" content="AI推 - 专业AI新闻资讯平台" />
<meta property="og:description" content="获取最新AI技术动态，深度解读人工智能发展趋势" />
<meta property="og:image" content="https://news.aipush.fun/share-image.png" />
<meta property="og:url" content="https://news.aipush.fun" />

<!-- 微信专用标签 -->
<meta name="wxcard:title" content="AI推 - 专业AI新闻资讯平台" />
<meta name="wxcard:desc" content="获取最新AI技术动态，深度解读人工智能发展趋势" />
<meta name="wxcard:imgUrl" content="https://news.aipush.fun/share-image.png" />

<!-- Twitter Card（提高兼容性） -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="AI推 - 专业AI新闻资讯平台" />
<meta name="twitter:description" content="获取最新AI技术动态，深度解读人工智能发展趋势" />
<meta name="twitter:image" content="https://news.aipush.fun/share-image.png" />
```

## 🎯 现实情况评估

### 如果你的订阅号支持JS-SDK：
- ✅ 完全按照之前的配置方案执行
- ✅ 可以实现完整的自定义分享功能

### 如果不支持JS-SDK：
- ✅ Meta标签方案仍然有效
- ✅ 分享时会显示页面的Meta信息
- ❌ 无法动态修改分享内容
- ❌ 无法获取分享成功回调

## 📞 建议行动

1. **立即检查**：登录公众号后台查看是否有"JS接口安全域名"设置
2. **先试先行**：如果有权限，直接按原方案配置测试
3. **备选方案**：如果没有权限，启用增强的Meta标签方案
4. **长期考虑**：评估是否需要申请认证服务号

---

**结论**：个人订阅号可能有限制，但不是完全不能做分享功能，关键是要先确认你的具体权限范围。