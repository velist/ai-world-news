#!/usr/bin/env node

console.log('生成RSS feed...');

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

// XML转义函数
function escapeXml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
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
      <link>${escapeXml(item.originalUrl)}</link>
      <guid>${item.id}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <source url="${siteUrl}">${escapeXml(item.source)}</source>
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

// 主函数
function main() {
  try {
    // 读取新闻数据
    const newsDataPath = path.resolve('public/news-data.json');
    let newsItems = [];
    
    if (existsSync(newsDataPath)) {
      const newsData = JSON.parse(readFileSync(newsDataPath, 'utf8'));
      newsItems = newsData.data || [];
    }
    
    console.log(`找到 ${newsItems.length} 条新闻，生成RSS feed...`);
    
    // 生成RSS feed
    const rssFeed = generateRSSFeed(newsItems);
    writeFileSync('public/rss.xml', rssFeed, 'utf8');
    console.log('RSS feed已生成: public/rss.xml');
    
    // 生成JSON feed
    const jsonFeed = generateJSONFeed(newsItems);
    writeFileSync('public/feed.json', JSON.stringify(jsonFeed, null, 2), 'utf8');
    console.log('JSON feed已生成: public/feed.json');
    
    // 生成站点地图
    const sitemap = generateSitemap(newsItems);
    writeFileSync('public/sitemap.xml', sitemap, 'utf8');
    console.log('站点地图已生成: public/sitemap.xml');
    
    console.log('所有feed文件生成完成！');
    
  } catch (error) {
    console.error('生成RSS feed失败:', error.message);
    process.exit(1);
  }
}

// 运行
main();