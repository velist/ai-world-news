console.log('启动定时新闻聚合服务...');

import Parser from 'rss-parser';
import crypto from 'crypto';
import { promises as fs } from 'fs';

const parser = new Parser();

// RSS源配置
const RSS_SOURCES = [
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    category: 'AI'
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: '科技'
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com/feed',
    category: '科技'
  },
  {
    name: 'InfoQ中文',
    url: 'https://www.infoq.cn/feed',
    category: '科技'
  },
  {
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
    category: '科技'
  }
];

// AI关键词
const AI_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '智能',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别'
];

// 判断是否为AI新闻
function isAINews(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  return AI_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) ||
    text.includes(keyword)
  );
}

// 判断是否为国内AI新闻
function isDomesticAINews(title, content, source) {
  if (!isAINews(title, content)) return false;
  
  const domesticSources = ['36氪', '钛媒体', 'InfoQ中文', 'IT之家'];
  const domesticKeywords = ['中国', '国内', '百度', '阿里', '腾讯', '字节', '华为', '小米', '京东', '美团', '滴滴', '网易', '新浪', '搜狐', '携程'];
  
  const text = (title + ' ' + (content || '')).toLowerCase();
  const isDomesticSource = domesticSources.includes(source.name);
  const hasDomesticKeywords = domesticKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return isDomesticSource || hasDomesticKeywords;
}

// 清理内容
function cleanContent(content) {
  if (!content) return '';
  return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// 生成ID
function generateId(title, pubDate) {
  const hash = crypto.createHash('md5')
    .update(title + (pubDate || Date.now()))
    .digest('hex');
  return `news_${Date.now()}_${hash.substring(0, 8)}`;
}

// 提取图片
function extractImageUrl(item) {
  const imgMatch = (item.content || '').match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';
}

// 生成AI洞察
function generateAIInsight(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  if (text.includes('chatgpt') || text.includes('gpt')) {
    return '这篇新闻涉及ChatGPT相关技术发展，反映了大语言模型在各个领域的应用趋势和商业化进程。';
  } else if (text.includes('机器学习') || text.includes('深度学习')) {
    return '该新闻展示了机器学习/深度学习技术的最新进展，对AI技术发展具有重要意义。';
  } else if (text.includes('创业') || text.includes('融资')) {
    return '此新闻反映了AI行业的投资热点和创业趋势，值得关注行业动态。';
  } else if (text.includes('政策') || text.includes('监管')) {
    return '该新闻涉及AI相关政策法规，对行业发展环境和监管框架有重要影响。';
  } else {
    return '这篇新闻反映了AI领域的最新发展动态，对了解行业趋势具有重要参考价值。';
  }
}

// 处理单个新闻项
function processNewsItem(item, source) {
  const summary = cleanContent(item.contentSnippet || item.content || '');
  const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  
  let category;
  if (isAINews(item.title, item.content)) {
    category = isDomesticAINews(item.title, item.content, source) ? '国内AI' : '国外AI';
  } else {
    category = source.category;
  }
  
  return {
    id: generateId(item.title, item.pubDate),
    title: item.title || '无标题',
    summary: truncatedSummary,
    content: cleanContent(item.content || item.contentSnippet || ''),
    imageUrl: extractImageUrl(item),
    source: source.name,
    publishedAt: item.pubDate || new Date().toISOString(),
    category: category,
    originalUrl: item.link,
    aiInsight: generateAIInsight(item.title, item.contentSnippet || item.content)
  };
}

// 聚合新闻
async function aggregateNews() {
  console.log(`[${new Date().toLocaleString()}] 开始聚合AI新闻...`);
  
  const allNews = [];
  const seenTitles = new Set();
  
  for (const source of RSS_SOURCES) {
    try {
      console.log(`[${new Date().toLocaleString()}] 正在爬取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const newsItems = feed.items
        .filter(item => isAINews(item.title, item.contentSnippet || item.content))
        .map(item => processNewsItem(item, source))
        .slice(0, 10);
      
      console.log(`[${new Date().toLocaleString()}] ${source.name} 获取到 ${newsItems.length} 条AI相关新闻`);
      
      for (const item of newsItems) {
        const titleKey = item.title.toLowerCase().trim();
        if (!seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          allNews.push(item);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`[${new Date().toLocaleString()}] 爬取 ${source.name} 失败:`, error.message);
    }
  }
  
  allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  const data = {
    success: true,
    timestamp: new Date().toISOString(),
    total: allNews.length,
    data: allNews
  };
  
  try {
    await fs.writeFile('public/news-data.json', JSON.stringify(data, null, 2), 'utf8');
    console.log(`[${new Date().toLocaleString()}] 新闻数据已保存到 news-data.json，共 ${allNews.length} 条新闻`);
    return allNews.length;
  } catch (error) {
    console.error(`[${new Date().toLocaleString()}] 保存文件失败:`, error.message);
    return 0;
  }
}

// 定时任务
class NewsAggregator {
  constructor() {
    this.interval = null;
    this.isRunning = false;
  }

  start() {
    if (this.isRunning) {
      console.log('新闻聚合服务已在运行中');
      return;
    }

    console.log('启动新闻聚合服务...');
    this.isRunning = true;

    // 立即执行一次
    this.runAggregation();

    // 每30分钟执行一次
    this.interval = setInterval(() => {
      this.runAggregation();
    }, 30 * 60 * 1000);

    console.log('新闻聚合服务已启动，每30分钟自动更新一次');
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isRunning = false;
    console.log('新闻聚合服务已停止');
  }

  async runAggregation() {
    if (this.isRunning) {
      console.log(`[${new Date().toLocaleString()}] 开始定时新闻聚合...`);
      try {
        const count = await aggregateNews();
        console.log(`[${new Date().toLocaleString()}] 定时聚合完成，获取 ${count} 条新闻`);
        
        // 聚合完成后自动生成RSS feed
        await generateRSSFiles();
        console.log(`[${new Date().toLocaleString()}] RSS feed已更新`);
      } catch (error) {
        console.error(`[${new Date().toLocaleString()}] 定时聚合失败:`, error.message);
      }
    }
  }
}

// 生成RSS文件
async function generateRSSFiles() {
  try {
    const fs = await import('fs').then(m => m.promises);
    
    // 读取新闻数据
    const newsDataPath = 'public/news-data.json';
    let newsItems = [];
    
    if (await fs.access(newsDataPath).catch(() => false)) {
      const newsData = JSON.parse(await fs.readFile(newsDataPath, 'utf8'));
      newsItems = newsData.data || [];
    }
    
    // 生成RSS feed
    const rssFeed = generateRSSFeed(newsItems);
    await fs.writeFile('public/rss.xml', rssFeed, 'utf8');
    
    // 生成JSON feed
    const jsonFeed = generateJSONFeed(newsItems);
    await fs.writeFile('public/feed.json', JSON.stringify(jsonFeed, null, 2), 'utf8');
    
    // 生成站点地图
    const sitemap = generateSitemap(newsItems);
    await fs.writeFile('public/sitemap.xml', sitemap, 'utf8');
    
    console.log(`RSS feed已更新，包含 ${newsItems.length} 条新闻`);
  } catch (error) {
    console.error('生成RSS文件失败:', error.message);
  }
}

// 生成RSS feed
function generateRSSFeed(newsItems) {
  const siteUrl = 'https://ai-world-news.com';
  const siteTitle = 'AI世界新闻';
  const siteDescription = '最新AI资讯与深度报道';
  
  const items = newsItems.slice(0, 20).map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.summary || item.content}]]></description>
      <link>${item.originalUrl}</link>
      <guid>${item.id}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <source url="${siteUrl}">${item.source}</source>
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <description><![CDATA[${siteDescription}]]></description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}

// 生成JSON feed
function generateJSONFeed(newsItems) {
  const siteUrl = 'https://ai-world-news.com';
  
  return {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'AI世界新闻',
    description: '最新AI资讯与深度报道',
    home_page_url: siteUrl,
    feed_url: `${siteUrl}/feed.json`,
    items: newsItems.slice(0, 20).map(item => ({
      id: item.id,
      title: item.title,
      content_text: item.content,
      summary: item.summary,
      url: item.originalUrl,
      image: item.imageUrl,
      date_published: item.publishedAt,
      author: {
        name: item.source
      }
    }))
  };
}

// 生成站点地图
function generateSitemap(newsItems) {
  const siteUrl = 'https://ai-world-news.com';
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/rss.xml</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${siteUrl}/feed.json</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  
  // 添加最新新闻到站点地图
  newsItems.slice(0, 50).forEach(item => {
    sitemap += `
  <url>
    <loc>${item.originalUrl}</loc>
    <lastmod>${new Date(item.publishedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
  });
  
  sitemap += '\n</urlset>';
  return sitemap;
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  const aggregator = new NewsAggregator();
  
  // 处理进程退出
  process.on('SIGINT', () => {
    console.log('\n收到SIGINT信号，正在停止服务...');
    aggregator.stop();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log('\n收到SIGTERM信号，正在停止服务...');
    aggregator.stop();
    process.exit(0);
  });

  // 启动服务
  aggregator.start();

  // 保持进程运行
  console.log('新闻聚合服务正在运行，按 Ctrl+C 停止...');
}

export { NewsAggregator, aggregateNews };