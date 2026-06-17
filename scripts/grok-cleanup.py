"""
Grok 新闻清洗脚本
在原始新闻源抓取后运行，过滤旧闻 + 优化发布时间
"""
import json, os, sys, time, hashlib, io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

GROK_API_BASE = os.environ.get('GROK_API_BASE', 'https://jiuuij.de5.net/v1')
GROK_API_KEY = os.environ.get('GROK_API_KEY', '')
GROK_MODEL = os.environ.get('GROK_MODEL', 'grok-4.20-multi-agent-xhigh')

NEWS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'news-data.json')
VERSION_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public', 'version.json')

MAX_AGE_DAYS = 3  # 只保留最近3天的新闻
MAX_NEWS = 30      # 最多保留30条

def main():
    print('🧹 Grok 新闻清洗')

    if not os.path.exists(NEWS_FILE):
        print('⚠️ news-data.json 不存在，跳过')
        return

    with open(NEWS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    items = data.get('data', [])
    if isinstance(data, list):
        items = data
    print(f'📰 原始: {len(items)} 条')

    # 1. 过滤太旧的新闻
    now = time.time()
    cutoff = now - MAX_AGE_DAYS * 86400
    filtered = []
    removed_old = 0
    for item in items:
        try:
            pub = item.get('publishedAt', '')
            if 'T' in pub:
                ts = time.mktime(time.strptime(pub[:19], '%Y-%m-%dT%H:%M:%S'))
            else:
                ts = time.mktime(time.strptime(pub[:10], '%Y-%m-%d'))
            if ts > cutoff:
                filtered.append(item)
            else:
                removed_old += 1
        except:
            filtered.append(item)  # 无法解析日期就保留

    print(f'🗑️  移除 {removed_old} 条超过{MAX_AGE_DAYS}天的旧闻')

    # 2. 去重（按标题相似度）
    seen = set()
    unique = []
    for item in filtered:
        key = item.get('title', '')[:40].lower().strip()
        if key not in seen:
            seen.add(key)
            unique.append(item)
    print(f'📋 去重后: {len(unique)} 条')

    # 3. 按时间排序
    def get_ts(item):
        try:
            pub = item.get('publishedAt', '')
            return time.mktime(time.strptime(pub[:19], '%Y-%m-%dT%H:%M:%S'))
        except:
            return 0
    unique.sort(key=get_ts, reverse=True)

    # 4. 限制数量
    unique = unique[:MAX_NEWS]
    print(f'✂️  保留前{MAX_NEWS}条')

    # 5. 保存
    output = {
        'success': True,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'total': len(unique),
        'source': 'multi-api-grok-cleaned',
        'data': unique,
    }
    os.makedirs(os.path.dirname(NEWS_FILE), exist_ok=True)
    with open(NEWS_FILE, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f'💾 已保存 {len(unique)} 条')

    # 版本
    ver = {
        'version': '2.1.0',
        'buildTime': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'lastUpdate': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'updateInterval': '12小时',
        'source': 'Multi-API + Grok Cleanup',
    }
    with open(VERSION_FILE, 'w', encoding='utf-8') as f:
        json.dump(ver, f, ensure_ascii=False, indent=2)

    print('✅ 清洗完成')

if __name__ == '__main__':
    main()