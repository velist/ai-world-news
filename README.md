# AI 世界新闻 - GitHub Pages 独立部署版

这是一个基于 React + TypeScript 的 AI 新闻聚合网站，通过 GitHub Actions 实现自动化新闻获取和部署。

## 🚀 特性

- ✅ **完全静态化** - 无需服务器，纯前端部署
- ✅ **自动更新** - GitHub Actions 定时获取最新 AI 新闻
- ✅ **多源聚合** - 支持 NewsAPI 和 NewsData 新闻源
- ✅ **智能翻译** - 使用硅基流动 API 将英文新闻翻译成中文
- ✅ **AI 点评** - 自动生成新闻的深度分析和见解
- ✅ **分类展示** - 按 AI 模型、科技、经济、深度分析分类
- ✅ **响应式设计** - 支持桌面和移动设备

## 📋 部署前准备

### 1. Fork 本仓库

点击右上角的 Fork 按钮，将仓库 fork 到你的 GitHub 账号下。

### 2. 配置 GitHub Secrets

在你的 GitHub 仓库中，进入 Settings → Secrets and variables → Actions，添加以下密钥：

#### 必需的密钥：
- `SILICONFLOW_API_KEY`: 硅基流动 API 密钥（用于翻译和 AI 点评）

#### 可选的密钥（至少配置一个新闻源）：
- `NEWS_API_KEY`: NewsAPI 密钥 (https://newsapi.org)
- `NEWSDATA_API_KEY`: NewsData 密钥 (https://newsdata.io)

#### 备用翻译服务（可选）：
- `TENCENT_SECRET_ID`: 腾讯云翻译 API ID
- `TENCENT_SECRET_KEY`: 腾讯云翻译 API 密钥

### 3. 启用 GitHub Pages

1. 进入仓库的 Settings → Pages
2. 在 Source 中选择 "Deploy from a branch"
3. 选择 `gh-pages` 分支和 `/ (root)` 目录
4. 点击 Save

### 4. 启用 GitHub Actions

1. 进入仓库的 Actions 页面
2. 如果提示启用 workflows，点击启用
3. 找到 "获取AI新闻并更新" workflow
4. 点击 "Enable workflow"

## 🔄 自动化流程

### 定时更新
GitHub Actions 会按照以下时间自动运行：
- 每天 UTC 时间：0点、6点、12点、18点
- 对应北京时间：8点、14点、20点、凌晨2点

### 手动触发
你也可以在 Actions 页面手动触发更新：
1. 进入 Actions 页面
2. 选择 "获取AI新闻并更新" workflow
3. 点击 "Run workflow" 按钮

### 工作流程
1. 获取最新 AI 相关新闻
2. 使用 AI 将英文翻译成中文
3. 生成每条新闻的 AI 深度点评
4. 保存数据到 `public/news-data.json`
5. 构建静态网站
6. 部署到 GitHub Pages

## 🛠️ 本地开发

```bash
# 克隆仓库
git clone https://github.com/你的用户名/ai-world-news.git
cd ai-world-news

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 手动获取新闻数据（需要配置环境变量）
npm run fetch-news

# 构建生产版本
npm run build
```

### 环境变量配置（本地开发）

创建 `.env` 文件：

```env
SILICONFLOW_API_KEY=your_siliconflow_api_key
NEWS_API_KEY=your_news_api_key
NEWSDATA_API_KEY=your_newsdata_api_key
```

## 📁 项目结构

```
├── .github/workflows/
│   └── fetch-news.yml          # GitHub Actions 工作流
├── scripts/
│   └── fetch-news.js           # 新闻获取脚本
├── public/
│   └── news-data.json          # 新闻数据文件
├── src/
│   ├── hooks/
│   │   └── useNews.ts          # 新闻数据钩子
│   ├── types/
│   │   └── news.ts             # 类型定义
│   └── ...                     # 其他前端代码
└── README.md
```

## 🔧 自定义配置

### 修改更新频率
编辑 `.github/workflows/fetch-news.yml` 中的 cron 表达式：

```yaml
schedule:
  - cron: '0 0,6,12,18 * * *'  # 每6小时更新一次
  # - cron: '0 */2 * * *'      # 每2小时更新一次
  # - cron: '0 0 * * *'        # 每天更新一次
```

### 修改新闻分类
编辑 `scripts/fetch-news.js` 中的 `categorizeNews` 函数来自定义分类逻辑。

### 修改UI
所有前端代码在 `src/` 目录下，使用 React + TypeScript + Tailwind CSS。

## 🌐 访问你的网站

部署成功后，可以通过以下URL访问：
`https://你的用户名.github.io/ai-world-news/`

## 📞 问题排查

### 常见问题

1. **Actions 运行失败**
   - 检查 Secrets 是否正确配置
   - 查看 Actions 日志获取详细错误信息

2. **网站无法访问**
   - 确保 GitHub Pages 已启用并配置为从 `gh-pages` 分支部署
   - 检查仓库是否为 public（或者是否有 GitHub Pro）

3. **新闻数据为空**
   - 检查 API 密钥是否有效
   - 查看 Actions 日志中的错误信息

4. **翻译或 AI 点评不工作**
   - 确保 `SILICONFLOW_API_KEY` 已正确配置
   - 检查 API 配额是否充足

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

## 获取 API 密钥指南

### 硅基流动 API（推荐）
1. 访问 [https://siliconflow.cn](https://siliconflow.cn)
2. 注册账号并实名认证
3. 在控制台获取 API Key
4. 新用户通常有免费额度

### NewsAPI
1. 访问 [https://newsapi.org](https://newsapi.org)
2. 注册免费账号
3. 获取 API Key
4. 免费版每天1000次请求

### NewsData
1. 访问 [https://newsdata.io](https://newsdata.io)
2. 注册免费账号  
3. 获取 API Key
4. 免费版每天200次请求

---

🎉 **恭喜！现在你拥有了一个完全自动化的 AI 新闻网站！**

---

## 原始项目信息

**Lovable项目URL**: https://lovable.dev/projects/f0e86346-2005-4c0b-8a57-7f213c6ca4d3

### 技术栈
- Vite
- TypeScript  
- React
- shadcn-ui
- Tailwind CSS
