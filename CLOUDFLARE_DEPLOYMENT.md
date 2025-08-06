# Cloudflare Pages + GitHub 部署配置

## 📋 部署配置

### 1. Cloudflare Pages 设置
在 Cloudflare Pages 控制台中：
- **构建命令**: `npm run build`
- **构建输出目录**: `dist`
- **Node.js 版本**: 18 或更高

### 2. 环境变量（可选）
在 Cloudflare Pages 设置中添加：
```
NODE_ENV = production
```

### 3. 路由配置
Cloudflare Pages 会自动处理 SPA 路由，但为了确保微信 Hash 路由正常工作，项目已配置：

- **Hash 路由支持**: `/#/news/123` 
- **直接路由支持**: `/news/123`
- **调试页面**: `/debug`

## 🚀 部署步骤

### 自动部署（推荐）
1. 确保 `dist/` 目录中的文件已提交到 GitHub
2. Cloudflare Pages 会自动检测并构建
3. 构建完成后会自动部署

### 手动触发部署
1. 在 Cloudflare Pages 控制台点击 "重新部署"
2. 或者推送新的 commit 到 GitHub

## 🧪 测试链接

部署完成后测试：
- **首页**: `https://news.aipush.fun/`
- **调试页面**: `https://news.aipush.fun/debug`
- **新闻详情**: `https://news.aipush.fun/news/news_1754498333503_0`
- **Hash路由**: `https://news.aipush.fun/#/news/news_1754498333503_0`

## 🔍 如果仍然遇到404

### 检查构建输出
确保 `dist/` 目录包含：
- `index.html`
- `assets/` 目录
- `news-data.json`

### 检查路由配置
Cloudflare Pages 默认支持 SPA，但如果遇到问题，可以：
1. 在项目根目录创建 `_headers` 文件（仅Cloudflare Pages）
2. 添加以下内容：
```
/*
  Content-Type: text/html
```

### 清除缓存
1. 在 Cloudflare Pages 控制台清除缓存
2. 或者在浏览器中强制刷新（Ctrl+F5）

## 📱 微信测试

在微信中测试：
1. 打开 `https://news.aipush.fun/debug`
2. 测试 Hash 路由 `https://news.aipush.fun/#/news/news_1754498333503_0`
3. 观察控制台输出