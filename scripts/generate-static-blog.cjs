#!/usr/bin/env node

/**
 * 博客页面静态HTML生成器
 * 为SEO优化生成静态HTML页面
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const CONFIG = {
  BLOG_DATA_PATH: path.join(__dirname, '..', 'public', 'blog-data.json'),
  OUTPUT_DIR: path.join(__dirname, '..', 'public', 'blog'),
  TEMPLATE_PATH: path.join(__dirname, '..', 'index.html'),
  BASE_URL: 'https://news.aipush.fun'
};

/**
 * 生成博客页面静态HTML
 */
async function generateStaticBlogPages() {
  console.log('🚀 开始生成博客页面静态HTML...');
  
  try {
    // 1. 读取博客数据
    const blogData = JSON.parse(await fs.readFile(CONFIG.BLOG_DATA_PATH, 'utf8'));
    console.log(`📝 找到 ${blogData.length} 篇博客文章`);
    
    // 2. 读取HTML模板
    const template = await fs.readFile(CONFIG.TEMPLATE_PATH, 'utf8');
    
    // 3. 确保输出目录存在
    await fs.mkdir(CONFIG.OUTPUT_DIR, { recursive: true });
    
    // 4. 为每篇文章生成静态HTML
    for (const article of blogData) {
      await generateArticleHTML(template, article);
    }
    
    // 5. 生成博客列表页
    await generateBlogIndexHTML(template, blogData);
    
    console.log('✅ 博客页面静态HTML生成完成');
    
  } catch (error) {
    console.error('❌ 静态HTML生成失败:', error);
    throw error;
  }
}

/**
 * 生成单篇文章的HTML
 */
async function generateArticleHTML(template, article) {
  console.log(`  生成: ${article.id}`);
  
  // 生成SEO优化的HTML内容
  const seoTitle = `${article.title} | AI推博客`;
  const seoDescription = article.excerpt || `深度解读${article.title}的最新发展动态`;
  const canonicalUrl = `${CONFIG.BASE_URL}/blog/${article.id}`;
  const publishDate = article.publishedAt;
  
  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": article.title,
    "description": seoDescription,
    "image": `${CONFIG.BASE_URL}/favicon.svg`,
    "author": {
      "@type": "Organization",
      "name": article.author || "AI推编辑部"
    },
    "publisher": {
      "@type": "Organization",
      "name": "AI推",
      "logo": {
        "@type": "ImageObject",
        "url": `${CONFIG.BASE_URL}/favicon.svg`
      }
    },
    "datePublished": publishDate,
    "dateModified": publishDate,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "keywords": article.keywords ? article.keywords.join(", ") : "",
    "articleSection": article.category || "技术解读"
  };
  
  // 替换HTML模板中的SEO标签
  let html = template
    .replace(/<title>.*?<\/title>/i, `<title>${seoTitle}</title>`)
    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${seoDescription}"`)
    .replace(/<link rel="canonical" href=".*?"/, `<link rel="canonical" href="${canonicalUrl}"`)
    .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${article.title}"`)
    .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${seoDescription}"`)
    .replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${canonicalUrl}"`)
    .replace(/<meta name="twitter:title" content=".*?"/, `<meta name="twitter:title" content="${article.title}"`)
    .replace(/<meta name="twitter:description" content=".*?"/, `<meta name="twitter:description" content="${seoDescription}"`)
    .replace(/<meta name="twitter:url" content=".*?"/, `<meta name="twitter:url" content="${canonicalUrl}"`);
  
  // 添加结构化数据
  const structuredDataScript = `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
  html = html.replace('</head>', `${structuredDataScript}\n</head>`);
  
  // 为文章内容添加一些可见的HTML（帮助SEO）
  const contentPreview = `
    <noscript>
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1>${article.title}</h1>
        <p><strong>发布时间：</strong>${publishDate}</p>
        <p><strong>作者：</strong>${article.author}</p>
        <p><strong>分类：</strong>${article.category}</p>
        <p><strong>摘要：</strong>${seoDescription}</p>
        <p><strong>关键词：</strong>${article.keywords ? article.keywords.join(", ") : ""}</p>
        <p>本文需要JavaScript才能完整显示。请启用JavaScript后刷新页面。</p>
        <p><a href="${CONFIG.BASE_URL}/blog">返回博客列表</a></p>
      </div>
    </noscript>
  `;
  
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${contentPreview}`);
  
  // 保存文件
  const filename = `${article.id}.html`;
  const filepath = path.join(CONFIG.OUTPUT_DIR, filename);
  await fs.writeFile(filepath, html, 'utf8');
}

/**
 * 生成博客列表页HTML
 */
async function generateBlogIndexHTML(template, blogData) {
  console.log('  生成博客列表页...');
  
  const seoTitle = 'AI推博客 - 人工智能技术深度解读';
  const seoDescription = '专业的AI技术博客，深度解读ChatGPT、OpenAI、机器学习等人工智能前沿技术动态和行业分析。';
  const canonicalUrl = `${CONFIG.BASE_URL}/blog`;
  
  // 生成结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "AI推博客",
    "description": seoDescription,
    "url": canonicalUrl,
    "publisher": {
      "@type": "Organization",
      "name": "AI推团队",
      "logo": {
        "@type": "ImageObject",
        "url": `${CONFIG.BASE_URL}/favicon.svg`
      }
    },
    "blogPost": blogData.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title,
      "url": `${CONFIG.BASE_URL}/blog/${article.id}`,
      "datePublished": article.publishedAt,
      "author": {
        "@type": "Organization",
        "name": article.author || "AI推编辑部"
      }
    }))
  };
  
  // 替换HTML模板
  let html = template
    .replace(/<title>.*?<\/title>/i, `<title>${seoTitle}</title>`)
    .replace(/<meta name="description" content=".*?"/, `<meta name="description" content="${seoDescription}"`)
    .replace(/<link rel="canonical" href=".*?"/, `<link rel="canonical" href="${canonicalUrl}"`)
    .replace(/<meta property="og:title" content=".*?"/, `<meta property="og:title" content="${seoTitle}"`)
    .replace(/<meta property="og:description" content=".*?"/, `<meta property="og:description" content="${seoDescription}"`)
    .replace(/<meta property="og:url" content=".*?"/, `<meta property="og:url" content="${canonicalUrl}"`);
  
  // 添加结构化数据
  const structuredDataScript = `<script type="application/ld+json">${JSON.stringify(structuredData, null, 2)}</script>`;
  html = html.replace('</head>', `${structuredDataScript}\n</head>`);
  
  // 添加博客文章列表的noscript内容
  const blogListHtml = `
    <noscript>
      <div style="max-width: 800px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h1>AI推博客</h1>
        <p>${seoDescription}</p>
        <h2>最新文章</h2>
        ${blogData.slice(0, 10).map(article => `
          <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
            <h3><a href="/blog/${article.id}">${article.title}</a></h3>
            <p style="color: #666; font-size: 14px;">发布时间：${article.publishedAt} | 分类：${article.category}</p>
            <p>${article.excerpt}</p>
          </div>
        `).join('')}
        <p>需要JavaScript才能查看完整内容。请启用JavaScript后刷新页面。</p>
      </div>
    </noscript>
  `;
  
  html = html.replace('<div id="root"></div>', `<div id="root"></div>${blogListHtml}`);
  
  // 保存博客列表页
  const filepath = path.join(CONFIG.OUTPUT_DIR, 'index.html');
  await fs.writeFile(filepath, html, 'utf8');
}

// 如果直接运行脚本
if (require.main === module) {
  generateStaticBlogPages()
    .then(() => {
      console.log('✅ 静态HTML生成完成');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ 静态HTML生成失败:', error);
      process.exit(1);
    });
}

module.exports = {
  generateStaticBlogPages
};