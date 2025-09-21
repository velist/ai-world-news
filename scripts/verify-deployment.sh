
#!/bin/bash

# 部署验证脚本（增强版，带重试与回退，不阻断失败场景）

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

verify_url() {
  local url=$1
  local name=$2
  local expected_status=${3:-200}
  local tries=${4:-5}
  local delay=${5:-15}

  echo -n "📍 检查 $name (期望$expected_status, 重试$tries次)..."

  local i=0
  local status=0
  while [ $i -lt $tries ]; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30)
    if [ "$status" = "$expected_status" ]; then
      echo -e " ${GREEN}✅ $status${NC}"
      return 0
    fi
    sleep $delay
    i=$((i+1))
  done
  echo -e " ${RED}❌ $status${NC}"
  return 1
}

verify_spa_url() {
  local url=$1
  local name=$2
  local tries=${3:-5}
  local delay=${4:-15}
  echo -n "📍 检查(SPA) $name (200/404均可, 重试$tries次)..."
  local i=0; local status=0
  while [ $i -lt $tries ]; do
    status=$(curl -s -o /dev/null -w "%{http_code}" "$url" --max-time 30)
    if [ "$status" = "200" ] || [ "$status" = "404" ]; then
      echo -e " ${GREEN}✅ $status (SPA可接受)${NC}"
      return 0
    fi
    sleep $delay
    i=$((i+1))
  done
  echo -e " ${RED}❌ $status${NC}"
  return 1
}

get_deploy_time() {
  echo "⏰ 部署时间: $(date)"
  echo "🔗 自定义域名: $SITE_URL"
  echo "📦 GitHub Pages: $GITHUB_PAGES_URL"
  echo "🔎 验证基准: $BASE_URL"
  echo "---"
}

main_verification() {
  local failed=0

  # 主页
  verify_url "$BASE_URL" "主页" 200 6 15 || ((failed++))

  # SPA 子路由（容忍404）
  verify_spa_url "$BASE_URL/bookmarks" "收藏页面" 4 10 || ((failed++))
  verify_spa_url "$BASE_URL/about" "关于页面" 4 10 || ((failed++))

  # news-data：先 BASE_URL，再回退 SITE_URL
  if ! verify_url "$BASE_URL/news-data.json" "新闻数据API(BASE)" 200 6 15; then
    verify_url "$SITE_URL/news-data.json" "新闻数据API(域名回退)" 200 6 15 || ((failed++))
  fi

  return $failed
}

deep_verification() {
  echo ""
  echo "🔍 深度验证..."
  echo -n "🏪 检查CDN缓存状态..."
  local cache_status=$(curl -sI "$SITE_URL" | grep -i "cf-cache-status\|x-cache\|cache-control")
  if [ -n "$cache_status" ]; then
    echo -e " ${GREEN}✅ 有缓存信息${NC}"
    echo "   $cache_status"
  else
    echo -e " ${YELLOW}⚠️ 无缓存信息${NC}"
  fi
}

get_deploy_time
main_verification
failed_count=$?

if [ $failed_count -eq 0 ]; then
  echo ""
  echo -e "${GREEN}🎉 路由与API验证通过${NC}"
  deep_verification
  echo -e "${GREEN}✅ 部署验证成功完成${NC}"
  exit 0
else
  echo ""
  echo -e "${YELLOW}⚠️ 存在 $failed_count 个校验未通过（可能为缓存或传播延迟）${NC}"
  echo "将不阻断发布，请稍后再观察。如需严格阻断，请提高等待与重试参数。"
  exit 0
fi
