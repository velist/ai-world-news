"""
Grok AI 新闻抓取脚本 (Python)
每天调用 Grok API，获取最新 AI 新闻，保存为 news-data.json
用法: python scripts/fetch-news-grok.py
"""
import json, os, sys, time, hashlib, io
from urllib.request import Request, urlopen
from urllib.error import URLError

# 修复 Windows GBK 编码问题
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# ===== 配置（从环境变量读取）=====
GROK_API_BASE = os.environ.get('GROK_API_BASE', 'https://jiuuij.de5.net/v1')
GROK_API_KEY = os.environ.get('GROK_API_KEY', '')
GROK_MODEL = os.environ.get('GROK_MODEL', 'grok-4.20-multi-agent-xhigh')
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'public')

if not GROK_API_KEY:
    print('❌ GROK_API_KEY 环境变量未设置！')
    sys.exit(1)

# ===== 搜索分类 =====
SEARCHES = [
    ('国际AI', 'latest AI international news today June 2026: OpenAI ChatGPT Anthropic Claude DeepSeek Gemini IPO breakthroughs announcements'),
    ('中国AI', 'latest China AI news today 2026: 中国人工智能 百度 阿里 腾讯 华为 智谱 DeepSeek 大模型 最新消息'),
    ('科技新闻', 'AI technology developer tools news June 2026: AI芯片 coding agent IDE 编程工具 AI框架 developer tools'),
    ('AI趣味新闻', 'AI creative fun viral news June 2026: AI绘画 Midjourney AI写作 AI音乐 AI创作 AI娱乐 applications'),
]

def grok_chat(messages, max_tokens=2000):
    """调用 Grok API"""
    body = json.dumps({
        'model': GROK_MODEL,
        'messages': messages,
        'max_tokens': max_tokens,
        'temperature': 0.3,
    }).encode('utf-8')
    req = Request(f'{GROK_API_BASE}/chat/completions', data=body, headers={
        'Authorization': f'Bearer {GROK_API_KEY}',
        'Content-Type': 'application/json',
    })
    try:
        with urlopen(req, timeout=120) as resp:
            text = resp.read().decode('utf-8')
    except URLError as e:
        raise Exception(f'API 请求失败: {e}')

    # 处理 SSE 流
    if text.startswith('data: '):
        content = ''
        for line in text.split('\n'):
            if line.startswith('data: ') and line[6:].strip() not in ('[DONE]', ''):
                try:
                    chunk = json.loads(line[6:])
                    content += chunk.get('choices', [{}])[0].get('delta', {}).get('content', '')
                except: pass
        return content

    # 普通 JSON
    try:
        return json.loads(text)['choices'][0]['message']['content']
    except:
        return text

def main():
    print(f'🤖 Grok AI 新闻抓取')
    print(f'⏰  {time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())}')
    print(f'📡 API: {GROK_API_BASE} | Model: {GROK_MODEL}')
    print()

    all_news = []
    nid = 0

    for category, query in SEARCHES:
        print(f'🔍 搜索 {category}...')
        try:
            result = grok_chat([
                {
                    'role': 'system',
                    'content': f'你是 AI 新闻搜索助手。搜索最新 AI 新闻，返回 JSON 数组格式。\n\n返回: [{{"title":"中文标题(20-40字)", "snippet":"中文摘要(100-150字)", "url":"来源URL", "source":"来源名称", "date":"2026-06-XX"}}]\n\n返回至少4条新闻，全部中文。'
                },
                {'role': 'user', 'content': f'搜索最新 AI 新闻：{query}。分类：{category}。只返回 JSON 数组。'}
            ], max_tokens=2000)

            # 提取 JSON 数组
            json_start = result.find('[')
            json_end = result.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                items = json.loads(result[json_start:json_end])
            else:
                items = json.loads(result) if isinstance(result, str) else result

            count = 0
            for item in items[:5]:
                nid += 1
                # 发布时间：用今天的 UTC 日期，hash 分散到 0-15 点
                # 0-15 UTC = 8-23 北京时间，确保不会跨到次日
                today = time.strftime('%Y-%m-%d', time.gmtime())
                h = int(hashlib.md5(item.get('title', '').encode()).hexdigest()[:2], 16) % 16
                m = int(hashlib.md5(item.get('title', '').encode()).hexdigest()[2:4], 16) % 60
                s = int(hashlib.md5(item.get('title', '').encode()).hexdigest()[4:6], 16) % 60
                pub_time = f'{today}T{h:02d}:{m:02d}:{s:02d}Z'
                all_news.append({
                    'id': f'grok_{nid:03d}',
                    'title': item.get('title', 'No title'),
                    'summary': item.get('snippet', ''),
                    'content': item.get('snippet', ''),
                    'imageUrl': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
                    'source': item.get('source') or (item.get('url', '').split('/')[2] if item.get('url') else 'AI News'),
                    'publishedAt': pub_time,
                    'category': category,
                    'originalUrl': item.get('url', ''),
                    'aiInsight': '',
                })
                count += 1
            print(f'  ✅ {category}: {count} 条')
        except Exception as e:
            print(f'  ⚠️ {category}: {e}')

        time.sleep(3)  # 限流

    if not all_news:
        print('\n❌ 未获取到任何新闻')
        sys.exit(1)

    print(f'\n📰 总计: {len(all_news)} 条')

    # 去重 + 排序
    seen = set()
    unique = []
    for item in all_news:
        key = item['title'][:50]
        if key not in seen:
            seen.add(key)
            unique.append(item)
    unique.sort(key=lambda x: x['publishedAt'], reverse=True)

    # 保存
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output = {
        'success': True,
        'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'total': len(unique),
        'source': 'grok-ai-search',
        'data': unique,
    }
    path = os.path.join(OUTPUT_DIR, 'news-data.json')
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)
    print(f'💾 已保存 {len(unique)} 条到 public/news-data.json')

    # 版本
    ver = {
        'version': '2.0.0',
        'buildTime': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'lastUpdate': time.strftime('%Y-%m-%dT%H:%M:%SZ', time.gmtime()),
        'updateInterval': '12小时',
        'source': 'Grok AI Search',
    }
    with open(os.path.join(OUTPUT_DIR, 'version.json'), 'w', encoding='utf-8') as f:
        json.dump(ver, f, ensure_ascii=False, indent=2)

    print('✅ 完成')

if __name__ == '__main__':
    main()