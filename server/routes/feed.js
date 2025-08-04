import { Router } from 'express';
import { promises as fs } from 'fs';
import path from 'path';

const router = Router();

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

// RSS feed endpoint
router.get('/rss.xml', async (req, res) => {
  try {
    const newsDataPath = path.resolve('public/news-data.json');
    
    // 检查新闻数据文件是否存在
    if (await fs.access(newsDataPath).catch(() => false)) {
      const newsData = JSON.parse(await fs.readFile(newsDataPath, 'utf8'));
      const rssFeed = generateRSSFeed(newsData.data || []);
      
      res.setHeader('Content-Type', 'application/rss+xml');
      res.setHeader('Cache-Control', 'public, max-age=1800'); // 30分钟缓存
      res.send(rssFeed);
    } else {
      // 如果没有新闻数据，返回空的RSS feed
      const emptyFeed = generateRSSFeed([]);
      res.setHeader('Content-Type', 'application/rss+xml');
      res.send(emptyFeed);
    }
  } catch (error) {
    console.error('RSS feed generation error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// JSON feed endpoint (alternative to RSS)
router.get('/feed.json', async (req, res) => {
  try {
    const newsDataPath = path.resolve('public/news-data.json');
    
    if (await fs.access(newsDataPath).catch(() => false)) {
      const newsData = JSON.parse(await fs.readFile(newsDataPath, 'utf8'));
      
      const jsonFeed = {
        version: 'https://jsonfeed.org/version/1.1',
        title: 'AI世界新闻',
        description: '最新AI资讯与深度报道',
        home_page_url: 'https://ai-world-news.com',
        feed_url: 'https://ai-world-news.com/feed.json',
        items: (newsData.data || []).slice(0, 20).map(item => ({
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
      
      res.setHeader('Content-Type', 'application/feed+json');
      res.setHeader('Cache-Control', 'public, max-age=1800');
      res.json(jsonFeed);
    } else {
      res.json({
        version: 'https://jsonfeed.org/version/1.1',
        title: 'AI世界新闻',
        description: '最新AI资讯与深度报道',
        home_page_url: 'https://ai-world-news.com',
        feed_url: 'https://ai-world-news.com/feed.json',
        items: []
      });
    }
  } catch (error) {
    console.error('JSON feed generation error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 站点地图
router.get('/sitemap.xml', async (req, res) => {
  try {
    const newsDataPath = path.resolve('public/news-data.json');
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
`;
    
    if (await fs.access(newsDataPath).catch(() => false)) {
      const newsData = JSON.parse(await fs.readFile(newsDataPath, 'utf8'));
      
      // 添加最新新闻到站点地图
      (newsData.data || []).slice(0, 50).forEach(item => {
        sitemap += `
  <url>
    <loc>${item.originalUrl}</loc>
    <lastmod>${new Date(item.publishedAt).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
      });
    }
    
    sitemap += '\n</urlset>';
    
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1小时缓存
    res.send(sitemap);
  } catch (error) {
    console.error('Sitemap generation error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;