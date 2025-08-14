# GitHub Actions 权限修复指南

**问题描述：** GitHub Actions中的Auto Blog Generation工作流执行失败，错误信息为：
```
remote: Permission to velist/ai-world-news.git denied to github-actions[bot].
fatal: unable to access 'https://github.com/velist/ai-world-news/': The requested URL returned error: 403
```

**失败原因：** GitHub Actions的GITHUB_TOKEN权限不足，无法向仓库推送代码更改。

## 🔧 解决方案

### 方法1：修改仓库权限设置（推荐）

1. **访问仓库设置**
   - 打开 https://github.com/velist/ai-world-news
   - 点击 `Settings` 选项卡
   - 在左侧菜单中找到 `Actions` 下的 `General`

2. **修改工作流权限**
   - 滚动到页面底部的 `Workflow permissions` 部分
   - 选择 `Read and write permissions`
   - 勾选 `Allow GitHub Actions to create and approve pull requests`
   - 点击 `Save` 按钮

### 方法2：使用Personal Access Token（备选）

如果方法1不可行，可以创建Personal Access Token：

1. **创建PAT Token**
   - 访问 https://github.com/settings/tokens
   - 点击 `Generate new token (classic)`
   - 设置过期时间，选择必要的权限：
     - `repo` (完整仓库访问权限)
     - `workflow` (工作流权限)
   - 点击 `Generate token` 并复制token值

2. **添加Repository Secret**
   - 回到项目仓库 https://github.com/velist/ai-world-news
   - 进入 `Settings` > `Secrets and variables` > `Actions`
   - 点击 `New repository secret`
   - Name: `AUTO_BLOG_TOKEN`
   - Value: 粘贴刚才创建的token
   - 点击 `Add secret`

3. **修改工作流文件**
   - 需要将工作流中的 `token: ${{ secrets.GITHUB_TOKEN }}` 
   - 修改为 `token: ${{ secrets.AUTO_BLOG_TOKEN }}`

## 📊 当前状态检查

根据最近的GitHub Actions运行记录：

✅ **成功的工作流：**
- 获取AI新闻并更新 (新闻数据获取正常)
- 新闻数据更新后自动部署 (部署功能正常)
- Build and Deploy (构建和部署正常)

❌ **失败的工作流：**
- Auto Blog Generation (博客生成因权限问题失败)

## 🎯 修复验证

修复权限设置后，可以通过以下方式验证：

1. **手动触发工作流**
   ```bash
   gh workflow run auto-blog.yml
   ```

2. **查看最新运行状态**
   ```bash
   gh run list --limit 5
   ```

3. **检查特定运行的详细信息**
   ```bash
   gh run view --log
   ```

## 💡 技术细节

**问题出现的技术原因：**
- GitHub在2021年更新了GITHUB_TOKEN的默认权限
- 新的默认设置只提供读权限，不包含写权限
- Auto Blog Generation需要向仓库提交更改，因此需要写权限

**自动博客生成的流程：**
1. 从news-data.json读取AI新闻数据
2. 使用AI算法筛选和生成博客文章
3. 更新blog-data.json文件
4. 生成静态HTML页面用于SEO优化
5. 提交更改到GitHub仓库
6. 触发自动部署流程

## 🚀 预期效果

权限修复后，Auto Blog Generation工作流将能够：

- ✅ 每天自动执行（UTC 1:00和7:00）
- ✅ 成功生成2-3篇新的博客文章
- ✅ 自动提交更改并触发部署
- ✅ 保持博客内容的持续更新

---

**修复负责人：** Claude Code AI助手  
**文档创建时间：** 2025年8月14日  
**状态：** 等待用户执行权限设置修改  