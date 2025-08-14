/**
 * SEO自动提交服务
 * 
 * 用于向各大搜索引擎自动提交网站URL，提高SEO效果
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const SEO_CONFIG = {
  // 网站基础URL
  BASE_URL: 'https://news.aipush.fun',
  
  // 百度推送API配置
  BAIDU_PUSH_URL: 'http://data.zz.baidu.com/urls',
  BAIDU_SITE: 'news.aipush.fun',
  BAIDU_TOKEN: process.env.BAIDU_PUSH_TOKEN || '', // 需要设置环境变量
  
  // Google Search Console API配置
  GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',
  
  // Bing提交配置
  BING_API_KEY: process.env.BING_API_KEY || '',
  
  // 搜索引擎提交间隔（毫秒）
  SUBMIT_DELAY: 1000
};

/**
 * 主要的SEO提交函数
 */
async function submitToSearchEngines(urls) {
  console.log(`🔍 开始提交 ${urls.length} 个URL到搜索引擎...`);
  
  const results = {
    baidu: { success: 0, failed: 0, errors: [] },
    google: { success: 0, failed: 0, errors: [] },
    bing: { success: 0, failed: 0, errors: [] }
  };
  
  // 百度提交
  try {
    const baiduResult = await submitToBaidu(urls);
    results.baidu = baiduResult;
  } catch (error) {
    console.error('百度提交失败:', error);
    results.baidu.errors.push(error.message);
  }
  
  // Google提交
  try {
    const googleResult = await submitToGoogle(urls);
    results.google = googleResult;
  } catch (error) {
    console.error('Google提交失败:', error);
    results.google.errors.push(error.message);
  }
  
  // Bing提交
  try {
    const bingResult = await submitToBing(urls);
    results.bing = bingResult;
  } catch (error) {
    console.error('Bing提交失败:', error);
    results.bing.errors.push(error.message);
  }
  
  // 输出结果
  console.log('📊 SEO提交结果汇总:');
  console.log(`  百度: ${results.baidu.success}成功 / ${results.baidu.failed}失败`);
  console.log(`  Google: ${results.google.success}成功 / ${results.google.failed}失败`);
  console.log(`  Bing: ${results.bing.success}成功 / ${results.bing.failed}失败`);
  
  return results;
}

/**
 * 提交到百度
 */
async function submitToBaidu(urls) {
  console.log('📤 提交到百度搜索...');
  
  if (!SEO_CONFIG.BAIDU_TOKEN) {
    console.warn('⚠️ 百度推送Token未配置，跳过百度提交');
    return { success: 0, failed: 0, errors: ['Token未配置'] };
  }
  
  const result = { success: 0, failed: 0, errors: [] };
  
  // 百度支持批量提交
  const batchSize = 100; // 百度每次最多提交100个URL
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const urlList = batch.join('\n');
    
    try {
      const response = await fetch(`${SEO_CONFIG.BAIDU_PUSH_URL}?site=${SEO_CONFIG.BAIDU_SITE}&token=${SEO_CONFIG.BAIDU_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain'
        },
        body: urlList
      });
      
      const data = await response.json();
      
      if (response.ok && data.success !== undefined) {
        result.success += data.success || 0;
        result.failed += (batch.length - (data.success || 0));
        console.log(`  批次 ${Math.floor(i / batchSize) + 1}: 成功${data.success || 0}个`);
      } else {
        result.failed += batch.length;
        result.errors.push(data.message || '未知错误');
        console.warn(`  批次 ${Math.floor(i / batchSize) + 1} 失败:`, data.message || '未知错误');
      }
      
    } catch (error) {
      result.failed += batch.length;
      result.errors.push(error.message);
      console.error(`  批次 ${Math.floor(i / batchSize) + 1} 异常:`, error.message);
    }
    
    // 添加延迟避免频率限制
    if (i + batchSize < urls.length) {
      await sleep(SEO_CONFIG.SUBMIT_DELAY);
    }
  }
  
  return result;
}

/**
 * 提交到Google Search Console
 */
async function submitToGoogle(urls) {
  console.log('📤 提交到Google搜索...');
  
  if (!SEO_CONFIG.GOOGLE_API_KEY) {
    console.warn('⚠️ Google API密钥未配置，跳过Google提交');
    return { success: 0, failed: 0, errors: ['API密钥未配置'] };
  }
  
  const result = { success: 0, failed: 0, errors: [] };
  
  // 使用Google Indexing API
  for (const url of urls) {
    try {
      console.log(`  提交: ${url}`);
      
      // 构造Google Indexing API请求
      const response = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SEO_CONFIG.GOOGLE_API_KEY}`
        },
        body: JSON.stringify({
          url: url,
          type: 'URL_UPDATED'
        })
      });
      
      if (response.ok) {
        result.success++;
        console.log(`  ✅ Google提交成功: ${url}`);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        result.failed++;
        result.errors.push(`URL提交失败 ${url}: ${errorData.error || response.statusText}`);
        console.warn(`  ❌ Google提交失败 ${url}:`, errorData.error || response.statusText);
      }
      
      await sleep(SEO_CONFIG.SUBMIT_DELAY);
      
    } catch (error) {
      result.failed++;
      result.errors.push(error.message);
      console.error(`  ❌ 提交异常 ${url}:`, error.message);
    }
  }
  
  return result;
}

/**
 * 提交到Bing
 */
async function submitToBing(urls) {
  console.log('📤 提交到Bing搜索...');
  
  if (!SEO_CONFIG.BING_API_KEY) {
    console.warn('⚠️ Bing API密钥未配置，跳过Bing提交');
    return { success: 0, failed: 0, errors: ['API密钥未配置'] };
  }
  
  const result = { success: 0, failed: 0, errors: [] };
  
  // Bing IndexNow API支持批量提交
  const batchSize = 10000; // IndexNow最大支持每次提交10,000个URL
  
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    
    try {
      console.log(`  批次 ${Math.floor(i / batchSize) + 1}: ${batch.length}个URL`);
      
      // 使用Bing IndexNow API
      const response = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'AI-Push-Bot/1.0'
        },
        body: JSON.stringify({
          host: SEO_CONFIG.BAIDU_SITE, // 使用网站域名
          key: SEO_CONFIG.BING_API_KEY,
          keyLocation: `https://${SEO_CONFIG.BAIDU_SITE}/${SEO_CONFIG.BING_API_KEY}.txt`,
          urlList: batch
        })
      });
      
      if (response.ok || response.status === 202) {
        // IndexNow返回200或202表示成功
        result.success += batch.length;
        console.log(`  ✅ Bing提交成功: ${batch.length}个URL`);
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        result.failed += batch.length;
        result.errors.push(`Batch ${Math.floor(i / batchSize) + 1} failed: ${response.status} ${errorText}`);
        console.warn(`  ❌ Bing批次 ${Math.floor(i / batchSize) + 1} 失败:`, response.status, errorText);
      }
      
    } catch (error) {
      result.failed += batch.length;
      result.errors.push(error.message);
      console.error(`  ❌ 批次 ${Math.floor(i / batchSize) + 1} 异常:`, error.message);
    }
    
    // 添加延迟避免频率限制
    if (i + batchSize < urls.length) {
      await sleep(SEO_CONFIG.SUBMIT_DELAY * 5); // IndexNow需要更长延迟
    }
  }
  
  return result;
}

/**
 * 生成站点地图
 */
async function generateSitemap() {
  console.log('🗺️ 生成站点地图...');
  
  try {
    // 读取博客数据
    const blogDataPath = path.join(__dirname, '..', 'public', 'blog-data.json');
    const blogData = JSON.parse(await fs.readFile(blogDataPath, 'utf8'));
    
    // 生成XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <!-- 主页 -->
  <url>
    <loc>${SEO_CONFIG.BASE_URL}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- 博客列表页 -->
  <url>
    <loc>${SEO_CONFIG.BASE_URL}/blog</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;
    
    // 按分类分组生成分类页面
    const categories = [...new Set(blogData.map(article => article.category))];
    for (const category of categories) {
      sitemap += `
  <!-- 分类: ${category} -->
  <url>
    <loc>${SEO_CONFIG.BASE_URL}/blog?category=${encodeURIComponent(category)}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
    
    // 添加博客文章
    for (const article of blogData) {
      const lastmod = article.publishedAt || new Date().toISOString().split('T')[0];
      const encodedId = encodeURIComponent(article.id);
      const priority = article.featured ? '0.8' : '0.7';
      
      sitemap += `
  <!-- 文章: ${article.title.substring(0, 50)}... -->
  <url>
    <loc>${SEO_CONFIG.BASE_URL}/blog/${encodedId}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
    <!-- 结构化数据信息 -->
    <image:image>
      <image:loc>https://news.aipush.fun/wechat-share-300.png</image:loc>
      <image:caption>${article.title}</image:caption>
    </image:image>`;
      
      // 如果文章是近24小时内发布的，添加新闻 sitemap 标记
      const publishDate = new Date(article.publishedAt);
      const now = new Date();
      const isRecent = (now.getTime() - publishDate.getTime()) < (24 * 60 * 60 * 1000);
      
      if (isRecent) {
        sitemap += `
    <news:news>
      <news:publication>
        <news:name>AI推</news:name>
        <news:language>zh-CN</news:language>
      </news:publication>
      <news:publication_date>${article.publishedAt}</news:publication_date>
      <news:title>${article.title}</news:title>
      <news:keywords>${article.keywords ? article.keywords.join(', ') : article.tags.join(', ')}</news:keywords>
    </news:news>`;
      }
      
      sitemap += `
  </url>`;
    }
    
    sitemap += `
</urlset>`;
    
    // 保存sitemap
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    await fs.writeFile(sitemapPath, sitemap, 'utf8');
    
    // 生成sitemap索引文件
    await generateSitemapIndex();
    
    console.log(`✅ 站点地图已生成: ${blogData.length + categories.length + 2} 个URL`);
    return sitemapPath;
    
  } catch (error) {
    console.error('❌ 站点地图生成失败:', error);
    throw error;
  }
}

/**
 * 生成sitemap索引文件
 */
async function generateSitemapIndex() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${SEO_CONFIG.BASE_URL}/sitemap.xml</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>
</sitemapindex>`;
  
  const indexPath = path.join(__dirname, '..', 'public', 'sitemap-index.xml');
  await fs.writeFile(indexPath, sitemapIndex, 'utf8');
  
  console.log('✅ Sitemap索引文件已生成');
}

/**
 * 提交站点地图到搜索引擎
 */
async function submitSitemap() {
  console.log('📤 提交站点地图...');
  
  const sitemapUrl = `${SEO_CONFIG.BASE_URL}/sitemap.xml`;
  
  // 构造搜索引擎ping URL
  const pingUrls = [
    `http://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `http://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
  ];
  
  const results = [];
  
  for (const pingUrl of pingUrls) {
    try {
      const response = await fetch(pingUrl);
      const status = response.ok ? '成功' : '失败';
      const engine = pingUrl.includes('google') ? 'Google' : 'Bing';
      
      console.log(`  ${engine}: ${status}`);
      results.push({ engine, status: response.ok, url: pingUrl });
      
      await sleep(1000);
      
    } catch (error) {
      console.error(`  ${pingUrl} 提交失败:`, error.message);
      results.push({ engine: 'Unknown', status: false, error: error.message });
    }
  }
  
  return results;
}

/**
 * 工具函数：延迟执行
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 主函数：完整的SEO工作流程
 */
async function runSEOWorkflow(blogArticles = []) {
  console.log('🚀 开始SEO优化工作流程...');
  
  try {
    // 1. 生成站点地图
    await generateSitemap();
    
    // 2. 提交站点地图
    const sitemapResults = await submitSitemap();
    
    // 3. 如果有新文章，直接提交URL
    if (blogArticles.length > 0) {
      const urls = blogArticles.map(article => `${SEO_CONFIG.BASE_URL}/blog/${article.id}`);
      const submitResults = await submitToSearchEngines(urls);
      
      return {
        sitemap: sitemapResults,
        urlSubmission: submitResults
      };
    }
    
    return {
      sitemap: sitemapResults,
      urlSubmission: null
    };
    
  } catch (error) {
    console.error('❌ SEO工作流程执行失败:', error);
    throw error;
  }
}

// 如果直接运行脚本
if (require.main === module) {
  runSEOWorkflow()
    .then(() => {
      console.log('✅ SEO优化工作流程完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ SEO优化工作流程失败:', error);
      process.exit(1);
    });
}

module.exports = {
  submitToSearchEngines,
  generateSitemap,
  submitSitemap,
  runSEOWorkflow
};