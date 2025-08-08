/**
 * Cloudflare Worker for WeChat Share Optimization
 * 专门为微信分享优化的服务端预渲染解决方案
 * 
 * 功能：
 * 1. 检测微信User-Agent
 * 2. 为微信用户返回预渲染的HTML页面
 * 3. 包含完整的Meta标签和新闻信息
 * 4. 绕过Hash路由限制
 */

// 新闻数据缓存
let newsDataCache = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const userAgent = request.headers.get('User-Agent') || '';
    
    // 检测是否为微信浏览器
    const isWeChat = /micromessenger/i.test(userAgent);
    
    console.log('请求信息:', {
      url: url.pathname,
      isWeChat,
      userAgent: userAgent.substring(0, 100)
    });

    // 只对微信浏览器的新闻详情页进行特殊处理
    if (isWeChat && url.pathname.includes('/news/')) {
      return await handleWeChatNewsRequest(request, url);
    }

    // 其他请求直接转发到原站点
    return await forwardToOrigin(request);
  }
};

/**
 * 处理微信浏览器的新闻请求
 */
async function handleWeChatNewsRequest(request, url) {
  try {
    // 从URL中提取新闻ID
    const newsId = extractNewsId(url);
    if (!newsId) {
      console.log('无法提取新闻ID，转发到原站点');
      return await forwardToOrigin(request);
    }

    console.log('处理微信新闻请求:', newsId);

    // 获取新闻数据
    const newsData = await getNewsData(newsId);
    if (!newsData) {
      console.log('新闻数据未找到，转发到原站点');
      return await forwardToOrigin(request);
    }

    // 生成预渲染的HTML页面
    const html = generateWeChatOptimizedHTML(newsData, url);
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300', // 5分钟缓存
        'X-WeChat-Optimized': 'true'
      }
    });

  } catch (error) {
    console.error('处理微信请求失败:', error);
    return await forwardToOrigin(request);
  }
}

/**
 * 从URL中提取新闻ID
 */
function extractNewsId(url) {
  // 支持多种URL格式
  const patterns = [
    /\/news\/([^\/\?#]+)/,           // /news/news_123
    /#\/news\/([^\/\?#]+)/,         // #/news/news_123
    /newsId=([^&]+)/,               // ?newsId=news_123
    /id=([^&]+)/                    // ?id=news_123
  ];

  for (const pattern of patterns) {
    const match = url.href.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * 获取新闻数据
 */
async function getNewsData(newsId) {
  try {
    // 检查缓存
    const now = Date.now();
    if (newsDataCache && (now - cacheTimestamp) < CACHE_DURATION) {
      const news = newsDataCache.find(item => item.id === newsId);
      if (news) {
        console.log('从缓存获取新闻数据:', newsId);
        return news;
      }
    }

    // 从原站点获取新闻数据
    console.log('从服务器获取新闻数据');
    const response = await fetch('https://news.aipush.fun/news-data.json', {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`获取新闻数据失败: ${response.status}`);
    }

    const data = await response.json();
    const allNews = data.data || data;
    
    // 更新缓存
    newsDataCache = allNews;
    cacheTimestamp = now;

    // 查找指定新闻
    const news = allNews.find(item => item.id === newsId);
    console.log('新闻查找结果:', newsId, !!news);
    
    return news;

  } catch (error) {
    console.error('获取新闻数据失败:', error);
    return null;
  }
}

/**
 * 生成微信优化的HTML页面
 */
function generateWeChatOptimizedHTML(newsData, url) {
  const title = newsData.title || '加载中...';
  const description = newsData.summary || newsData.content?.substring(0, 200) || '来自AI推的最新资讯';
  const imageUrl = newsData.imageUrl || 'https://news.aipush.fun/wechat-share-300.png';
  const shareUrl = url.href;
  const publishTime = newsData.publishedAt || new Date().toISOString();

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)} - AI推</title>
    
    <!-- 基础Meta标签 -->
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="keywords" content="AI,人工智能,新闻,资讯,${escapeHtml(title.split(' ').slice(0, 3).join(','))}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="${escapeHtml(shareUrl)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:width" content="300">
    <meta property="og:image:height" content="300">
    <meta property="og:image:type" content="image/png">
    <meta property="og:site_name" content="AI推">
    <meta property="og:locale" content="zh_CN">
    
    <!-- 微信专用标签 -->
    <meta name="wechat:title" content="${escapeHtml(title)}">
    <meta name="wechat:desc" content="${escapeHtml(description)}">
    <meta name="wechat:image" content="${escapeHtml(imageUrl)}">
    <meta name="wxcard:title" content="${escapeHtml(title)}">
    <meta name="wxcard:desc" content="${escapeHtml(description)}">
    <meta name="wxcard:imgUrl" content="${escapeHtml(imageUrl)}">
    <meta name="wxcard:link" content="${escapeHtml(shareUrl)}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
    
    <!-- Schema.org 结构化数据 -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${escapeHtml(title)}",
      "description": "${escapeHtml(description)}",
      "image": ["${escapeHtml(imageUrl)}"],
      "datePublished": "${publishTime}",
      "url": "${escapeHtml(shareUrl)}",
      "author": {
        "@type": "Organization",
        "name": "AI推"
      },
      "publisher": {
        "@type": "Organization",
        "name": "AI推",
        "url": "https://news.aipush.fun",
        "logo": {
          "@type": "ImageObject",
          "url": "https://news.aipush.fun/favicon.svg"
        }
      }
    }
    </script>
    
    <!-- 微信环境优化 -->
    <meta name="format-detection" content="telephone=no">
    <meta name="x5-orientation" content="portrait">
    <meta name="x5-fullscreen" content="true">
    
    <!-- 自动跳转到客户端应用 -->
    <script>
    // 延迟跳转，确保微信能够抓取到Meta标签
    setTimeout(function() {
      window.location.href = '${escapeHtml(shareUrl)}';
    }, 1000);
    </script>
    
    <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .loading {
      text-align: center;
      color: #666;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 10px;
      line-height: 1.4;
    }
    .description {
      color: #666;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .meta {
      font-size: 12px;
      color: #999;
      border-top: 1px solid #eee;
      padding-top: 10px;
    }
    </style>
</head>
<body>
    <div class="container">
        <div class="title">${escapeHtml(title)}</div>
        <div class="description">${escapeHtml(description)}</div>
        <div class="loading">正在跳转到完整页面...</div>
        <div class="meta">来源：AI推 | 发布时间：${new Date(publishTime).toLocaleString('zh-CN')}</div>
    </div>
</body>
</html>`;
}

/**
 * 转发请求到原站点
 */
async function forwardToOrigin(request) {
  const url = new URL(request.url);
  url.hostname = 'news.aipush.fun';
  
  return await fetch(url.toString(), {
    method: request.method,
    headers: request.headers,
    body: request.body
  });
}

/**
 * HTML转义
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
