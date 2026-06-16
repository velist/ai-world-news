/**
 * Grok AI 新闻抓取脚本
 * 每天调用一次 Grok API，获取最新 AI 新闻
 * 替代原有的多 API 聚合方案
 *
 * 用法: node scripts/fetch-news-grok.js
 */

import fs from 'fs';
import path from 'path';

// ===== 配置（从环境变量读取，CI 中用 GitHub Secrets）=====
const CONFIG = {
  GROK_API_BASE: process.env.GROK_API_BASE || 'https://jiuuij.de5.net/v1',
  GROK_API_KEY: process.env.GROK_API_KEY || '',
  GROK_MODEL: process.env.GROK_MODEL || 'grok-4.20-multi-agent-xhigh',
  OUTPUT_FILE: path.join(process.cwd(), 'public', 'news-data.json'),
  VERSION_FILE: path.join(process.cwd(), 'public', 'version.json'),
  MAX_RESULTS: 15,
};

// 启动检查
if (!CONFIG.GROK_API_KEY) {
  console.error('❌ GROK_API_KEY 环境变量未设置！');
  console.error('请在 GitHub Secrets 或 .env 中配置 GROK_API_KEY');
  process.exit(1);
}

// ===== AI 新闻搜索提示词 =====
const SEARCH_PROMPTS = [
  {
    query: 'latest AI news today June 2026: artificial intelligence breakthroughs, major AI company announcements, new model releases, AI policy',
    category: '国际AI',
    lang: 'en',
  },
  {
    query: 'China AI news today 2026: 中国人工智能 大模型 百度 阿里 腾讯 华为 智谱 DeepSeek 月之暗面 最新进展',
    category: '中国AI',
    lang: 'zh',
  },
  {
    query: 'AI technology news today 2026: AI芯片 GPU AI框架 开发工具 AI编程 IDE 编程助手 coding agent',
    category: '科技新闻',
    lang: 'en',
  },
  {
    query: 'AI creative fun news June 2026: AI绘画 AI写作 AI音乐 Midjourney AI创作 AI娱乐 viral AI applications',
    category: 'AI趣味新闻',
    lang: 'en',
  },
];

// ===== 调用 Grok API =====
async function grokChat(messages) {
  const response = await fetch(`${CONFIG.GROK_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${CONFIG.GROK_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.GROK_MODEL,
      messages,
      max_tokens: 4000,
      temperature: 0.3,
      stream: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Grok API error ${response.status}: ${text.substring(0, 200)}`);
  }

  const text = await response.text();

  // 处理 SSE 流式响应 (data: {...}\n\n)
  if (text.startsWith('data: ')) {
    const lines = text.split('\n');
    let fullContent = '';
    for (const line of lines) {
      if (line.startsWith('data: ')) {
        try {
          const chunk = JSON.parse(line.substring(6));
          fullContent += chunk.choices?.[0]?.delta?.content || '';
        } catch {}
      }
    }
    return fullContent;
  }

  // 普通 JSON 响应
  try {
    const data = JSON.parse(text);
    return data.choices?.[0]?.message?.content || '';
  } catch {
    return text;
  }
}

// ===== 搜索 AI 新闻 =====
async function searchAINews(prompt, category) {
  console.log(`  🔍 搜索 ${category}...`);

  const content = await grokChat([
    {
      role: 'system',
      content: `你是 AI 新闻搜索助手。搜索最新的 AI 新闻，返回 JSON 格式。

返回格式：
{
  "articles": [
    {
      "title": "新闻标题（中文，简洁准确）",
      "summary": "新闻摘要（中文，120-150字，包含关键信息）",
      "content": "详细内容（中文，200-300字）",
      "source": "新闻来源名称",
      "publishedAt": "2026-06-16T00:00:00Z",
      "originalUrl": "https://来源URL",
      "aiInsight": "AI 视角深度点评（中文，100-150字）：分析这条新闻对 AI 行业的意义、影响和趋势"
    }
  ]
}

要求：
1. 标题紧凑，20-40字，突出核心信息
2. 摘要 120-150 字，独立成段
3. 来源标注真实媒体名
4. 发布日期必须是 2026年6月
5. 内容如果无法获取详情，基于标题和摘要合理推断
6. 返回至少 4-6 条新闻
7. 所有文字必须是中文`
    },
    {
      role: 'user',
      content: `搜索最新 AI 新闻：${prompt.query}。分类：${category}。返回 JSON。`
    }
  ]);

  try {
    const parsed = JSON.parse(content);
    return (parsed.articles || []).map((article, i) => ({
      id: `grok_${Date.now()}_${category}_${i}`,
      title: article.title || '无标题',
      summary: article.summary || '',
      content: article.content || article.summary || '',
      imageUrl: pickImageForCategory(category),
      source: article.source || 'AI新闻',
      publishedAt: article.publishedAt || new Date().toISOString(),
      category: category,
      originalUrl: article.originalUrl || '',
      aiInsight: article.aiInsight || '',
    }));
  } catch (e) {
    console.error(`  ⚠️ JSON 解析失败: ${e.message}`);
    return [];
  }
}

// ===== 分类图片 =====
function pickImageForCategory(category) {
  const images = {
    '中国AI': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
    '国际AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop',
    '科技新闻': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
    'AI趣味新闻': 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=400&fit=crop',
  };
  return images[category] || images['国际AI'];
}

// ===== 主流程 =====
async function main() {
  console.log('🤖 Grok AI 新闻抓取');
  console.log(`⏰ ${new Date().toISOString()}`);
  console.log('');

  const allNews = [];

  for (const prompt of SEARCH_PROMPTS) {
    try {
      const articles = await searchAINews(prompt, prompt.category);
      console.log(`  ✅ ${prompt.category}: ${articles.length} 条`);
      allNews.push(...articles);
      // API 限流延迟
      await new Promise(r => setTimeout(r, 2000));
    } catch (e) {
      console.error(`  ❌ ${prompt.category}: ${e.message}`);
    }
  }

  console.log(`\n📰 总计: ${allNews.length} 条新闻`);

  if (allNews.length === 0) {
    console.error('❌ 未获取到任何新闻');
    process.exit(1);
  }

  // 去重 + 排序
  const seen = new Set();
  const unique = allNews.filter(item => {
    const key = item.title.toLowerCase().substring(0, 50);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  unique.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  // 保存
  const publicDir = path.dirname(CONFIG.OUTPUT_FILE);
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

  const output = {
    success: true,
    timestamp: new Date().toISOString(),
    total: unique.length,
    source: 'grok-ai-search',
    data: unique,
  };

  fs.writeFileSync(CONFIG.OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');
  console.log(`💾 已保存 ${unique.length} 条新闻到 public/news-data.json`);

  // 更新版本
  const version = {
    version: '2.0.0',
    buildTime: new Date().toISOString(),
    lastUpdate: new Date().toISOString(),
    updateInterval: '24小时',
    source: 'Grok AI Search',
  };
  fs.writeFileSync(CONFIG.VERSION_FILE, JSON.stringify(version, null, 2), 'utf8');
  console.log('📌 版本已更新');

  console.log('✅ 完成');
}

main().catch(e => {
  console.error('❌ 失败:', e.message);
  process.exit(1);
});