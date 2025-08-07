#!/bin/bash

# 手动部署到 GitHub Pages 的脚本

echo "🚀 开始部署到 GitHub Pages..."

# 1. 确保在正确的分支上
git checkout main

# 2. 构建项目
echo "📦 构建项目..."
npm run build

# 3. 切换到 gh-pages 分支
echo "🔄 切换到 gh-pages 分支..."
git checkout gh-pages

# 4. 复制 dist 目录内容到根目录
echo "📁 复制构建文件..."
cp -r dist/* .

# 5. 添加所有更改
echo "📤 提交更改..."
git add .
git commit -m "🚀 部署最新版本 - $(date)"

# 6. 推送到 GitHub
echo "⬆️ 推送到 GitHub..."
git push origin gh-pages

# 7. 切换回 main 分支
git checkout main

echo "✅ 部署完成！"