@echo off
echo 推送修复到远程仓库...
echo.

echo 当前Git状态:
git status

echo.
echo 尝试推送到远程...
git push origin main

echo.
echo 如果推送失败，请稍后重试或检查网络连接
pause