# 🚀 AI推 - 自动化部署指南

## 📋 部署概述

本项目已配置自动化部署流程，支持一键提交代码到GitHub并触发部署。

## 🛠️ 部署方式

### 1. 自动化部署（推荐）

```bash
# 标准部署
npm run deploy

# 快速部署（带预设消息）
npm run deploy:quick

# 修复部署（带修复标识）
npm run deploy:fix

# 自定义提交消息
npm run deploy "你的自定义提交消息"
```

### 2. 手动部署

```bash
# 1. 添加更改
git add .

# 2. 提交更改
git commit -m "你的提交消息"

# 3. 推送到远程
git push origin main
```

## 🔧 部署流程

自动化部署脚本会执行以下步骤：

1. **检查Git状态** - 确认是否有待提交的更改
2. **生成新闻数据**（可选）- 更新最新新闻内容
3. **构建项目**（可选）- 编译生产版本
4. **提交代码** - 自动生成提交信息并提交
5. **推送到GitHub** - 推送到远程仓库
6. **等待部署** - 等待部署系统处理
7. **验证部署** - 检查网站是否正常访问

## 📁 重要文件

- `scripts/auto-deploy.cjs` - 自动化部署脚本
- `package.json` - 包含部署命令配置
- `.github/workflows/` - GitHub Actions配置（如果有）

## 🌐 部署地址

- **生产环境**: https://news.aipush.fun/
- **调试工具**: https://news.aipush.fun/wechat-debug.html
- **测试页面**: https://news.aipush.fun/wechat-share-test-fixed.html

## ⚙️ 配置选项

在 `scripts/auto-deploy.cjs` 中可以配置：

```javascript
const config = {
  autoPush: true,        // 是否自动推送
  buildProject: true,    // 是否构建项目
  generateNews: false,   // 是否生成新闻数据
  commitPrefix: '🚀 自动部署',  // 提交信息前缀
  branch: 'main'         // 目标分支
};
```

## 🔍 故障排除

### 推送失败
```bash
# 如果推送失败，先拉取最新更改
git pull origin main --no-edit
git push origin main
```

### 部署验证失败
- 等待几分钟后手动访问网站
- 检查GitHub Actions状态
- 查看部署日志

### 权限问题
- 确保有仓库的推送权限
- 检查Git配置是否正确

## 📝 提交信息规范

自动生成的提交信息格式：
```
🚀 自动部署 - 2025/1/8 17:30:00

✅ 自动提交更改:
- 代码优化和功能更新
- 修复问题和改进
- 部署配置更新

🕒 提交时间: 2025/1/8 17:30:00
```

## 🎯 最佳实践

1. **部署前检查**
   - 确保代码无语法错误
   - 本地测试功能正常
   - 检查重要文件是否包含

2. **提交频率**
   - 功能完成后及时部署
   - 重要修复立即部署
   - 避免过于频繁的小改动

3. **回滚策略**
   - 保持Git历史清晰
   - 重要版本打标签
   - 必要时可回滚到稳定版本

## 📞 支持

如果遇到部署问题，请：
1. 检查控制台输出的错误信息
2. 查看GitHub仓库的Actions状态
3. 手动验证网站功能是否正常

---

**最后更新**: 2025年1月8日  
**维护者**: AI推开发团队
