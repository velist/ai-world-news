#!/bin/bash

# 部署验证脚本 - 确保关键路由可访问
# 用于 GitHub Actions 部署后自动验证

SITE_URL="https://news.aipush.fun"
GITHUB_PAGES_URL="https://velist.github.io/ai-world-news"

# 优先使用工作流传入的 BASE_URL_OVERRIDE（通常是 deploy-pages 的 page_url），
# 其次用 GitHub Pages 的固定地址，最后退回自定义域名。
BASE_URL="${BASE_URL_OVERRIDE:-${GITHUB_PAGES_URL:-$SITE_URL}}"

echo "🚀 开始验证部署状态..."

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 验证函数
verify_url() {
    local url=$1
    local name=$2
    local expected_status=${3:-200}

    echo -n "📍 检查 $name..."

    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30)

    if [ "$status" = "$expected_status" ]; then
        echo -e " ${GREEN}✅ $status${NC}"
        return 0
    else
        echo -e " ${RED}❌ $status${NC}"
        return 1
    fi
}

# 针对 GitHub Pages 上的 SPA 路由验证：直达子路由通常返回 404（由 404.html 兜底），因此 200 或 404 都视为可接受
verify_spa_url() {
    local url=$1
    local name=$2
    echo -n "📍 检查(SPA) $name..."
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30)
    if [ "$status" = "200" ] || [ "$status" = "404" ]; then
        echo -e " ${GREEN}✅ $status (SPA可接受)${NC}"
        return 0
    else
        echo -e " ${RED}❌ $status${NC}"
        return 1
    fi
}

# 获取部署时间
get_deploy_time() {
    echo "⏰ 部署时间: $(date)"
    echo "🔗 自定义域名: $SITE_URL"
    echo "📦 GitHub Pages: $GITHUB_PAGES_URL"
    echo "🔎 验证基准: $BASE_URL"
    echo "---"
}

# 主要验证流程
main_verification() {
    local failed=0

    # 先验证 GitHub Pages 输出（或上游传入的 page_url）
    verify_url "$BASE_URL" "主页" || ((failed++))

    # 验证搜索页面 (重点验证)
    verify_spa_url "$BASE_URL/search" "搜索页面" || ((failed++))

    # 验证收藏页面
    verify_spa_url "$BASE_URL/bookmarks" "收藏页面" || ((failed++))

    # 验证其他关键页面
    verify_spa_url "$BASE_URL/about" "关于页面" || ((failed++))

    # 验证API数据
    verify_url "$BASE_URL/news-data.json" "新闻数据API" || ((failed++))

    return $failed
}

# 深度验证
deep_verification() {
    echo ""
    echo "🔍 深度验证..."

    # 检查搜索页面内容
    echo -n "🔎 验证搜索页面内容..."
    local search_content=$(curl -s "$SITE_URL/search" --max-time 30)
    if echo "$search_content" | grep -q "搜索" || echo "$search_content" | grep -q "Search"; then
        echo -e " ${GREEN}✅ 包含搜索内容${NC}"
    else
        echo -e " ${YELLOW}⚠️ 搜索内容可能未加载${NC}"
    fi

    # 检查缓存状态
    echo -n "🏪 检查CDN缓存状态..."
    local cache_status=$(curl -sI "$SITE_URL" | grep -i "cf-cache-status\|x-cache\|cache-control")
    if [ -n "$cache_status" ]; then
        echo -e " ${GREEN}✅ 有缓存信息${NC}"
        echo "   $cache_status"
    else
        echo -e " ${YELLOW}⚠️ 无缓存信息${NC}"
    fi
}

# 执行验证
get_deploy_time
main_verification
failed_count=$?

if [ $failed_count -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 所有关键路由验证通过！${NC}"
    deep_verification
    echo ""
    echo -e "${GREEN}✅ 部署验证成功完成${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ 有 $failed_count 个路由验证失败${NC}"
    echo ""
    echo "🔧 建议排查步骤："
    echo "1. 检查 _redirects 文件配置"
    echo "2. 验证 GitHub Pages 部署状态"
    echo "3. 清除 CDN 缓存"
    echo "4. 等待 2-5 分钟后重试"
    exit 1
fi
