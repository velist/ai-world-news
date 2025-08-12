# AI推自动博客生成系统

## 概述

这个系统可以自动从AI相关新闻中生成高质量的博客文章，并自动提交SEO优化到各大搜索引擎。

## 功能特性

- 🔍 **智能新闻筛选**: 自动识别和筛选AI相关热门新闻
- ✍️ **自动文章生成**: 基于新闻内容生成结构化博客文章
- 📝 **多语言支持**: 同时生成中英文标题、摘要和标签
- 🏷️ **智能分类**: 自动将文章分类到合适的类别
- 🔖 **关键词提取**: 自动提取和生成SEO关键词
- 📊 **数据管理**: 自动更新blog-data.json文件
- 🔍 **SEO优化**: 自动提交到Google、Bing、百度等搜索引擎

## 安装和配置

### 1. 运行脚本

```bash
# 手动运行一次
npm run auto-blog

# 开发模式运行（更多日志输出）
npm run auto-blog:dev
```

### 2. 设置定时任务

#### Windows 任务计划程序

1. 打开"任务计划程序"
2. 创建基本任务
3. 设置触发器：每天上午9:00和下午3:00
4. 设置操作：
   - 程序: `node`
   - 参数: `scripts/auto-blog-generator.js`
   - 起始位置: `D:\1-AI三号\AI-NEWS-H5\ai-world-news`

#### Linux/macOS Cron

```bash
# 编辑crontab
crontab -e

# 添加以下行（每天9:00和15:00运行）
0 9,15 * * * cd /path/to/ai-world-news && npm run auto-blog
```

### 3. GitHub Actions 自动部署

创建 `.github/workflows/auto-blog.yml`:

```yaml
name: Auto Blog Generation

on:
  schedule:
    # 每天 UTC 1:00 和 7:00 运行（北京时间 9:00 和 15:00）
    - cron: '0 1,7 * * *'
  workflow_dispatch: # 允许手动触发

jobs:
  generate-blog:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Generate blog articles
      run: npm run auto-blog
      
    - name: Commit and push changes
      run: |
        git config --local user.email "action@github.com"
        git config --local user.name "GitHub Action"
        git add public/blog-data.json
        git commit -m "🤖 自动生成博客文章 $(date +%Y-%m-%d)" || exit 0
        git push
```

## 配置选项

编辑 `scripts/auto-blog-generator.js` 中的 `CONFIG` 对象来自定义设置：

```javascript
const CONFIG = {
  // 每日生成文章数量
  DAILY_ARTICLES: 2,
  
  // 文章最小字数
  MIN_WORD_COUNT: 800,
  
  // AI相关关键词（用于筛选新闻）
  AI_KEYWORDS: [
    'AI', 'ChatGPT', 'GPT', 'OpenAI', 'Google', 'DeepMind',
    '人工智能', '机器学习', '深度学习', '大模型'
    // 可以添加更多关键词
  ]
}
```

## 系统工作流程

1. **加载数据**: 读取现有的新闻数据和博客数据
2. **筛选新闻**: 根据时间和AI关键词筛选热门新闻
3. **生成文章**: 为每条新闻生成结构化的博客文章数据
4. **去重检查**: 避免生成重复的文章
5. **更新数据**: 将新文章添加到blog-data.json
6. **SEO提交**: 向各大搜索引擎提交新文章URL

## 生成的文章结构

每篇自动生成的文章包含：

```json
{
  "id": "article-unique-id",
  "title": "中文标题",
  "titleEn": "English Title",
  "excerpt": "中文摘要",
  "excerptEn": "English excerpt",
  "category": "技术解读",
  "categoryEn": "Tech Analysis",
  "publishedAt": "2025-08-12",
  "readTime": 8,
  "author": "AI推编辑部",
  "authorEn": "AI Push Editorial Team",
  "tags": ["AI技术", "OpenAI", "ChatGPT"],
  "tagsEn": ["AI Technology", "OpenAI", "ChatGPT"],
  "views": 1250,
  "likes": 89,
  "comments": 23,
  "featured": true,
  "keywords": ["人工智能", "AI技术", "科技创新"],
  "keywordsEn": ["Artificial Intelligence", "AI Technology", "Tech Innovation"],
  "sourceNews": {
    "id": "source-news-id",
    "title": "原始新闻标题",
    "url": "https://...",
    "publishedAt": "2025-08-12"
  }
}
```

## SEO优化

系统会自动：

1. **Google Search Console**: 提交新文章URL
2. **Bing Webmaster Tools**: 提交到Bing搜索
3. **百度站长工具**: 提交到百度搜索
4. **生成关键词**: 自动提取和优化SEO关键词
5. **结构化数据**: 确保articles包含正确的schema.org标记

## 监控和日志

系统运行时会输出详细的日志：

```
🚀 开始执行自动博客生成任务...
⏰ 时间: 2025/8/12 上午9:00:00
📰 加载了 1500 条新闻数据
📝 现有 25 篇博客文章
🔥 发现 8 条热门AI新闻
✍️ 生成了 2 篇新文章
💾 博客数据已更新
🔍 SEO优化已提交
✅ 自动博客生成任务完成
```

## 故障排除

### 常见问题

1. **新闻数据加载失败**
   - 检查 `public/news-data.json` 文件是否存在
   - 确认JSON格式正确

2. **博客数据保存失败**
   - 检查 `public/blog-data.json` 文件权限
   - 确认磁盘空间充足

3. **SEO提交失败**
   - 检查网络连接
   - 确认搜索引擎API密钥配置正确

### 调试模式

```bash
# 开启详细日志
npm run auto-blog:dev
```

## 高级配置

### 集成真实API

要使用真实的搜索引擎API，需要：

1. **Google Search Console API**
   - 获取API密钥和认证信息
   - 在代码中配置认证

2. **Bing Webmaster Tools API**
   - 注册Bing开发者账号
   - 获取API密钥

3. **百度站长工具API**
   - 注册百度开发者账号
   - 获取推送密钥

### 自定义文章模板

可以在 `generateSingleArticle` 函数中自定义文章生成逻辑：

```javascript
// 自定义标题生成
function generateCustomTitle(news) {
  // 你的自定义逻辑
}

// 自定义摘要生成
function generateCustomExcerpt(news) {
  // 你的自定义逻辑
}
```

## 性能优化

- 系统设计为轻量级，单次运行时间通常在10秒内
- 支持并发处理多篇文章
- 智能去重避免重复内容
- 缓存机制减少重复计算

## 贡献

欢迎提交改进建议和bug报告到项目仓库。