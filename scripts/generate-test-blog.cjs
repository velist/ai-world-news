#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 从主脚本导入必要的函数
const scriptPath = path.join(__dirname, 'auto-blog-generator.cjs');
const scriptContent = fs.readFileSync(scriptPath, 'utf8');

// 提取generateSingleArticle函数 (简化版)
async function generateTestBlog() {
  try {
    // 读取数据
    const newsDataPath = path.join(__dirname, '..', 'public', 'news-data.json');
    const blogDataPath = path.join(__dirname, '..', 'public', 'blog-data.json');
    
    const newsData = JSON.parse(await fs.promises.readFile(newsDataPath, 'utf8'));
    const blogData = JSON.parse(await fs.promises.readFile(blogDataPath, 'utf8'));
    
    const newsArray = newsData.data || newsData;
    
    // 选择第一条AI新闻作为测试
    const testNews = newsArray.find(news => {
      const text = `${news.title} ${news.summary || news.content || ''}`.toLowerCase();
      return text.includes('ai') || text.includes('人工智能') || text.includes('chatgpt');
    });
    
    if (!testNews) {
      console.log('未找到合适的AI新闻进行测试');
      return;
    }
    
    console.log('正在为以下新闻生成博客:');
    console.log('标题:', testNews.title);
    console.log('来源:', testNews.source);
    
    // 简化的文章生成逻辑
    const article = generateSimpleArticle(testNews);
    
    console.log('\n生成的博客预览:');
    console.log('ID:', article.id);
    console.log('中文标题:', article.title);
    console.log('英文标题:', article.titleEn);
    console.log('中文摘要:', article.excerpt);
    console.log('英文摘要:', article.excerptEn);
    console.log('分类:', article.category, '/', article.categoryEn);
    console.log('中文标签:', article.tags.join(', '));
    console.log('英文标签:', article.tagsEn.join(', '));
    
    // 保存到新的测试文件
    const testBlogData = [...blogData.slice(0, 10), article]; // 只保留前10篇 + 新生成的
    await fs.promises.writeFile(
      path.join(__dirname, '..', 'public', 'blog-data-test.json'),
      JSON.stringify(testBlogData, null, 2),
      'utf8'
    );
    
    console.log('\n✅ 测试博客已生成并保存到 blog-data-test.json');
    
  } catch (error) {
    console.error('生成测试博客失败:', error);
  }
}

// 简化的文章生成函数
function generateSimpleArticle(news) {
  const originalTitle = news.title || '';
  
  // 生成ID
  const articleId = originalTitle.toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50) + '-' + Date.now().toString(36);
  
  // 智能生成英文标题
  const titleEn = generateEnglishTitle(originalTitle);
  
  // 智能生成摘要
  const excerptZh = generateChineseExcerpt(originalTitle);
  const excerptEn = generateEnglishExcerpt(originalTitle);
  
  // 生成标签
  const tags = generateSimpleTags(originalTitle);
  
  return {
    id: articleId,
    title: originalTitle.length > 50 ? originalTitle.substring(0, 47) + '...' : originalTitle,
    titleEn: titleEn,
    excerpt: excerptZh,
    excerptEn: excerptEn,
    category: '技术解读',
    categoryEn: 'Tech Analysis',
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: Math.floor(Math.random() * 10) + 8,
    author: 'AI推编辑部',
    authorEn: 'AI Push Editorial Team',
    tags: tags.zh,
    tagsEn: tags.en,
    views: Math.floor(Math.random() * 2000) + 500,
    likes: Math.floor(Math.random() * 200) + 50,
    comments: Math.floor(Math.random() * 50) + 10,
    featured: Math.random() > 0.7,
    keywords: tags.zh.slice(0, 4),
    keywordsEn: tags.en.slice(0, 4),
    sourceNews: {
      id: news.id,
      title: news.title,
      url: news.originalUrl || '#',
      publishedAt: news.publishedAt
    }
  };
}

function generateEnglishTitle(chineseTitle) {
  const termMap = {
    '人工智能': 'Artificial Intelligence',
    'AI': 'AI',
    'ChatGPT': 'ChatGPT', 
    'GPT': 'GPT',
    'OpenAI': 'OpenAI',
    '谷歌': 'Google',
    '微软': 'Microsoft',
    '百度': 'Baidu',
    '腾讯': 'Tencent',
    '阿里': 'Alibaba',
    '大模型': 'Large Language Model',
    '发布': 'Launches',
    '推出': 'Introduces',
    '更新': 'Updates',
    '突破': 'Breakthrough',
    '创新': 'Innovation'
  };
  
  let englishTitle = chineseTitle;
  
  // 替换常见术语
  Object.entries(termMap).forEach(([chinese, english]) => {
    const regex = new RegExp(chinese, 'g');
    englishTitle = englishTitle.replace(regex, english);
  });
  
  // 如果仍然主要是中文，使用模板
  if (/[\u4e00-\u9fa5]/.test(englishTitle)) {
    const keyTerm = extractKeyTerm(chineseTitle);
    const templates = [
      `Latest AI Technology: ${keyTerm}`,
      `AI Innovation Update: ${keyTerm}`,
      `Breaking AI News: ${keyTerm}`,
      `New Development in AI: ${keyTerm}`
    ];
    englishTitle = templates[Math.floor(Math.random() * templates.length)];
  }
  
  return englishTitle.length > 80 ? englishTitle.substring(0, 77) + '...' : englishTitle;
}

function generateChineseExcerpt(title) {
  const keyTerm = extractKeyTerm(title);
  const templates = [
    `本文深度分析${keyTerm}的最新技术突破，探讨其在人工智能领域的创新意义和实际应用前景。`,
    `${keyTerm}技术的新进展为AI行业带来了重大变革，本文详细解读其技术特点和市场影响。`,
    `通过对${keyTerm}的深入研究，我们发现了人工智能技术发展的新趋势和机遇。`,
    `${keyTerm}的最新发展为AI领域注入了新活力，本文提供全面深入的分析解读。`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateEnglishExcerpt(title) {
  const keyTerm = extractKeyTerm(title);
  const templates = [
    `This article provides an in-depth analysis of ${keyTerm}'s latest technological breakthrough and its innovative significance in the AI field.`,
    `The new developments in ${keyTerm} technology bring major changes to the AI industry, exploring its technical features and market impact.`,
    `Through comprehensive research on ${keyTerm}, we uncover new trends and opportunities in artificial intelligence development.`,
    `The latest developments in ${keyTerm} inject new vitality into the AI field, providing comprehensive analysis and insights.`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateSimpleTags(title) {
  const text = title.toLowerCase();
  const zhTags = ['技术解读'];
  const enTags = ['Tech Analysis'];
  
  // 基于内容添加标签
  if (text.includes('ai') || text.includes('人工智能')) {
    zhTags.push('人工智能');
    enTags.push('Artificial Intelligence');
  }
  
  if (text.includes('gpt') || text.includes('chatgpt')) {
    zhTags.push('GPT');
    enTags.push('Large Language Model');
  }
  
  if (text.includes('google') || text.includes('谷歌')) {
    zhTags.push('谷歌');
    enTags.push('Google AI');
  }
  
  if (text.includes('openai')) {
    zhTags.push('OpenAI');
    enTags.push('OpenAI');
  }
  
  // 添加一些随机的相关标签
  const additionalZh = ['AI技术', '科技创新', '机器学习', '深度学习'];
  const additionalEn = ['AI Technology', 'Tech Innovation', 'Machine Learning', 'Future Technology'];
  
  const randomZh = additionalZh.sort(() => 0.5 - Math.random()).slice(0, 2);
  const randomEn = additionalEn.sort(() => 0.5 - Math.random()).slice(0, 2);
  
  return {
    zh: [...zhTags, ...randomZh],
    en: [...enTags, ...randomEn]
  };
}

function extractKeyTerm(title) {
  const aiTerms = ['ChatGPT', 'GPT', 'OpenAI', 'Google', 'Microsoft', 'AI', '人工智能', '机器学习', '深度学习', '大模型'];
  
  for (const term of aiTerms) {
    if (title.includes(term)) {
      return term;
    }
  }
  
  const words = title.split(/[，。！？\s]+/).filter(word => word.length > 1);
  return words[0] || 'AI技术';
}

generateTestBlog();