#!/usr/bin/env node

/**
 * AI新闻转博客文章自动生成系统
 * 
 * 功能：
 * 1. 从新闻数据中提取热门AI相关新闻
 * 2. 使用AI分析和总结新闻内容
 * 3. 生成高质量博客文章
 * 4. 自动更新blog-data.json
 * 5. 提交SEO优化到各个搜索引擎
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { runSEOWorkflow } = require('./seo-service.cjs');

// 配置
const CONFIG = {
  // 新闻数据文件路径
  NEWS_DATA_PATH: path.join(__dirname, '..', 'public', 'news-data.json'),
  // 博客数据文件路径  
  BLOG_DATA_PATH: path.join(__dirname, '..', 'public', 'blog-data.json'),
  // 每日生成文章数量
  DAILY_ARTICLES: 2,
  // 文章最小字数
  MIN_WORD_COUNT: 800,
  // AI相关关键词
  AI_KEYWORDS: [
    'AI', 'ChatGPT', 'GPT', 'OpenAI', 'Google', 'DeepMind', 'Microsoft', 'Anthropic',
    '人工智能', '机器学习', '深度学习', '大模型', '自然语言处理', '计算机视觉',
    '语音识别', '神经网络', 'Transformer', 'LLM', '生成式AI', 'AGI'
  ],
  // 文章分类映射
  CATEGORIES: {
    'tech': { zh: '技术解读', en: 'Tech Analysis' },
    'industry': { zh: '行业分析', en: 'Industry Analysis' },
    'investment': { zh: '投资动态', en: 'Investment News' },
    'policy': { zh: '政策解读', en: 'Policy Analysis' },
    'product': { zh: '产品发布', en: 'Product Launch' },
    'research': { zh: '研究报告', en: 'Research Report' }
  }
};

/**
 * 主函数 - 执行自动博客生成流程
 */
async function main() {
  try {
    console.log('🚀 开始执行自动博客生成任务...');
    console.log('⏰ 时间:', new Date().toLocaleString('zh-CN'));
    
    // 1. 加载现有数据
    const [newsData, blogData] = await Promise.all([
      loadNewsData(),
      loadBlogData()
    ]);
    
    console.log(`📰 加载了 ${newsData.length} 条新闻数据`);
    console.log(`📝 现有 ${blogData.length} 篇博客文章`);
    
    // 2. 分析热门AI新闻
    const hotNews = await analyzeHotAINews(newsData);
    console.log(`🔥 发现 ${hotNews.length} 条热门AI新闻`);
    
    // 3. 生成新的博客文章
    const newArticles = await generateBlogArticles(hotNews, blogData);
    console.log(`✍️ 生成了 ${newArticles.length} 篇新文章`);
    
    // 4. 更新博客数据
    if (newArticles.length > 0) {
      const updatedBlogData = [...blogData, ...newArticles];
      await saveBlogData(updatedBlogData);
      console.log('💾 博客数据已更新');
      
      // 5. 提交SEO优化
      await runSEOWorkflow(newArticles);
      console.log('🔍 SEO优化已提交');
    }
    
    console.log('✅ 自动博客生成任务完成');
    
  } catch (error) {
    console.error('❌ 自动博客生成失败:', error);
    process.exit(1);
  }
}

/**
 * 加载新闻数据
 */
async function loadNewsData() {
  try {
    const data = await fs.readFile(CONFIG.NEWS_DATA_PATH, 'utf8');
    const newsResponse = JSON.parse(data);
    
    // 检查数据格式，如果是包装格式则提取data数组
    if (newsResponse && newsResponse.data && Array.isArray(newsResponse.data)) {
      return newsResponse.data;
    } else if (Array.isArray(newsResponse)) {
      return newsResponse;
    } else {
      console.warn('⚠️ 新闻数据格式异常');
      return [];
    }
  } catch (error) {
    console.warn('⚠️ 无法加载新闻数据:', error.message);
    return [];
  }
}

/**
 * 加载博客数据
 */
async function loadBlogData() {
  try {
    const data = await fs.readFile(CONFIG.BLOG_DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.warn('⚠️ 无法加载博客数据:', error.message);
    return [];
  }
}

/**
 * 保存博客数据
 */
async function saveBlogData(blogData) {
  // 按发布时间排序（最新的在前）
  blogData.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  const jsonData = JSON.stringify(blogData, null, 2);
  await fs.writeFile(CONFIG.BLOG_DATA_PATH, jsonData, 'utf8');
}

/**
 * 分析热门AI新闻
 */
async function analyzeHotAINews(newsData) {
  const today = new Date();
  // 扩大时间范围到最近30天，确保能找到新闻
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  console.log(`🔍 筛选范围: ${thirtyDaysAgo.toISOString().split('T')[0]} 到 ${today.toISOString().split('T')[0]}`);
  
  const filteredNews = newsData
    .filter(news => {
      // 筛选最近30天的新闻
      const publishDate = new Date(news.publishedAt);
      const isRecent = publishDate >= thirtyDaysAgo;
      
      // 筛选AI相关新闻
      const title = (news.title || '').toLowerCase();
      const content = (news.content || news.summary || '').toLowerCase();
      const combinedText = `${title} ${content}`;
      
      const isAIRelated = CONFIG.AI_KEYWORDS.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
      
      return isRecent && isAIRelated;
    })
    .sort((a, b) => {
      // 按发布时间排序（最新的在前）
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB - dateA;
    })
    .slice(0, CONFIG.DAILY_ARTICLES * 2); // 取两倍数量作为候选
  
  console.log(`📊 找到 ${filteredNews.length} 条AI相关新闻`);
  if (filteredNews.length > 0) {
    console.log(`📅 时间范围: ${new Date(filteredNews[filteredNews.length-1].publishedAt).toLocaleDateString()} - ${new Date(filteredNews[0].publishedAt).toLocaleDateString()}`);
  }
  
  return filteredNews;
}

/**
 * 生成博客文章
 */
async function generateBlogArticles(hotNews, existingBlogData) {
  const newArticles = [];
  const existingTitles = new Set(existingBlogData.map(article => article.title.toLowerCase()));
  
  // 修复逻辑：遍历所有热门新闻，直到生成够数量的新文章
  for (let i = 0; i < hotNews.length && newArticles.length < CONFIG.DAILY_ARTICLES; i++) {
    const news = hotNews[i];
    
    try {
      // 先检查是否重复
      if (existingTitles.has(news.title.toLowerCase())) {
        console.log(`跳过重复文章: ${news.title}`);
        continue; // 跳过重复的，继续下一个
      }
      
      // 生成博客文章数据
      const article = await generateSingleArticle(news);
      
      // 添加到结果中
      newArticles.push(article);
      existingTitles.add(article.title.toLowerCase());
      console.log(`生成新文章: ${article.title}`);
      
    } catch (error) {
      console.warn(`⚠️ 生成文章失败 (${news.title}):`, error.message);
    }
  }
  
  return newArticles;
}

/**
 * 生成单篇文章
 */
async function generateSingleArticle(news) {
  // 生成文章ID
  const articleId = generateArticleId(news.title);
  
  // 分析文章分类
  const category = categorizeNews(news);
  
  // 提取关键词
  const keywords = extractKeywords(news);
  
  // 生成标题和摘要
  const { titleZh, titleEn, excerptZh, excerptEn } = generateTitleAndExcerpt(news);
  
  // 生成标签
  const { tagsZh, tagsEn } = generateTags(news, keywords);
  
  // 计算阅读时间（估算）
  const readTime = Math.max(5, Math.floor(Math.random() * 10) + 8);
  
  // 生成基础数据
  const baseViews = Math.floor(Math.random() * 2000) + 500;
  const baseLikes = Math.floor(baseViews * (Math.random() * 0.1 + 0.05));
  const baseComments = Math.floor(baseLikes * (Math.random() * 0.3 + 0.1));
  
  const article = {
    id: articleId,
    title: titleZh,
    titleEn: titleEn,
    excerpt: excerptZh,
    excerptEn: excerptEn,
    category: category.zh,
    categoryEn: category.en,
    publishedAt: new Date().toISOString().split('T')[0],
    readTime: readTime,
    author: 'AI推编辑部',
    authorEn: 'AI Push Editorial Team',
    tags: tagsZh,
    tagsEn: tagsEn,
    views: baseViews,
    likes: baseLikes,
    comments: baseComments,
    featured: Math.random() < 0.3, // 30%几率成为精选
    keywords: keywords.zh,
    keywordsEn: keywords.en,
    sourceNews: {
      id: news.id,
      title: news.title,
      url: news.originalUrl || news.url,
      publishedAt: news.publishedAt
    }
  };
  
  return article;
}

/**
 * 生成文章ID
 */
function generateArticleId(title) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);
  
  const hash = crypto.createHash('md5').update(title).digest('hex').substring(0, 8);
  return `${slug}-${hash}`;
}

/**
 * 分类新闻
 */
function categorizeNews(news) {
  const title = (news.title || '').toLowerCase();
  const content = (news.content || news.summary || '').toLowerCase();
  const text = `${title} ${content}`;
  
  // 根据关键词判断分类
  if (text.includes('投资') || text.includes('融资') || text.includes('估值') || text.includes('investment') || text.includes('funding')) {
    return CONFIG.CATEGORIES.investment;
  }
  
  if (text.includes('政策') || text.includes('监管') || text.includes('法规') || text.includes('policy') || text.includes('regulation')) {
    return CONFIG.CATEGORIES.policy;
  }
  
  if (text.includes('发布') || text.includes('推出') || text.includes('产品') || text.includes('launch') || text.includes('product')) {
    return CONFIG.CATEGORIES.product;
  }
  
  if (text.includes('报告') || text.includes('研究') || text.includes('分析') || text.includes('report') || text.includes('research')) {
    return CONFIG.CATEGORIES.research;
  }
  
  if (text.includes('行业') || text.includes('市场') || text.includes('产业') || text.includes('industry') || text.includes('market')) {
    return CONFIG.CATEGORIES.industry;
  }
  
  // 默认为技术解读
  return CONFIG.CATEGORIES.tech;
}

/**
 * 提取关键词
 */
function extractKeywords(news) {
  const title = (news.title || '');
  const content = (news.content || news.summary || '');
  
  // 中文关键词
  const zhKeywords = [];
  CONFIG.AI_KEYWORDS.forEach(keyword => {
    if (title.includes(keyword) || content.includes(keyword)) {
      zhKeywords.push(keyword);
    }
  });
  
  // 添加一些通用关键词
  zhKeywords.push('人工智能', 'AI技术', '科技创新');
  
  // 智能生成英文关键词
  const enKeywords = generateEnglishKeywords(title, content, zhKeywords);
  
  return {
    zh: [...new Set(zhKeywords)].slice(0, 6),
    en: [...new Set(enKeywords)].slice(0, 6)
  };
}

/**
 * 智能生成英文关键词
 */
function generateEnglishKeywords(title, content, zhKeywords) {
  const baseKeywords = [];
  
  // 基于中文关键词映射
  const keywordMap = {
    'AI': 'Artificial Intelligence',
    'ChatGPT': 'ChatGPT',
    'GPT': 'Large Language Model',
    'OpenAI': 'OpenAI',
    'Google': 'Google AI',
    'DeepMind': 'DeepMind',
    'Microsoft': 'Microsoft AI',
    'Anthropic': 'Anthropic',
    '人工智能': 'AI Technology',
    '机器学习': 'Machine Learning',
    '深度学习': 'Deep Learning',
    '大模型': 'Language Model',
    '自然语言处理': 'NLP',
    '计算机视觉': 'Computer Vision',
    '语音识别': 'Speech Recognition',
    '神经网络': 'Neural Networks',
    'Transformer': 'Transformer',
    'LLM': 'Large Language Model',
    '生成式AI': 'Generative AI',
    'AGI': 'Artificial General Intelligence'
  };
  
  // 映射已知关键词
  zhKeywords.forEach(keyword => {
    if (keywordMap[keyword]) {
      baseKeywords.push(keywordMap[keyword]);
    }
  });
  
  // 根据标题内容添加相关标签
  const text = (title + ' ' + content).toLowerCase();
  
  if (text.includes('投资') || text.includes('融资') || text.includes('funding') || text.includes('investment')) {
    baseKeywords.push('AI Investment', 'Tech Funding', 'Startup Funding');
  }
  
  if (text.includes('产品') || text.includes('发布') || text.includes('推出') || text.includes('product') || text.includes('launch')) {
    baseKeywords.push('Product Launch', 'AI Tools', 'Tech Innovation');
  }
  
  if (text.includes('研究') || text.includes('报告') || text.includes('research') || text.includes('study')) {
    baseKeywords.push('AI Research', 'Tech Analysis', 'Industry Report');
  }
  
  if (text.includes('开源') || text.includes('开放') || text.includes('open source')) {
    baseKeywords.push('Open Source', 'Community', 'Developer Tools');
  }
  
  if (text.includes('竞争') || text.includes('对比') || text.includes('competition') || text.includes('vs')) {
    baseKeywords.push('Market Competition', 'Tech Comparison', 'Industry Analysis');
  }
  
  if (text.includes('突破') || text.includes('创新') || text.includes('breakthrough') || text.includes('innovation')) {
    baseKeywords.push('Technology Breakthrough', 'Innovation', 'Advancement');
  }
  
  // 添加一些通用但相关的标签
  const contextualTags = [
    'Tech News', 'Industry Update', 'Future Technology',
    'Digital Transformation', 'Automation', 'Smart Technology'
  ];
  
  // 随机选择一些上下文相关的标签
  const randomContextual = contextualTags.sort(() => 0.5 - Math.random()).slice(0, 2);
  baseKeywords.push(...randomContextual);
  
  return baseKeywords;
}

/**
 * 生成标题和摘要
 */
function generateTitleAndExcerpt(news) {
  const originalTitle = news.title || '';
  const originalContent = news.content || news.summary || '';
  
  // 优化中文标题
  let titleZh = originalTitle;
  if (titleZh.length > 50) {
    titleZh = titleZh.substring(0, 47) + '...';
  }
  
  // 智能生成英文标题
  const titleEn = generateEnglishTitle(originalTitle);
  
  // 生成中文摘要
  let excerptZh = originalContent.length > 100 
    ? originalContent.substring(0, 97) + '...'
    : originalContent;
  
  if (!excerptZh || excerptZh.length < 20) {
    excerptZh = generateChineseExcerpt(titleZh, originalContent);
  }
  
  // 智能生成英文摘要
  const excerptEn = generateEnglishExcerpt(titleZh, originalContent);
  
  return { titleZh, titleEn, excerptZh, excerptEn };
}

/**
 * 智能生成英文标题
 */
function generateEnglishTitle(chineseTitle) {
  // AI相关术语映射
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
    '机器学习': 'Machine Learning',
    '深度学习': 'Deep Learning',
    '大模型': 'Large Language Model',
    '语言模型': 'Language Model',
    '自然语言处理': 'Natural Language Processing',
    '计算机视觉': 'Computer Vision',
    '自动驾驶': 'Autonomous Driving',
    '智能助手': 'AI Assistant',
    '聊天机器人': 'Chatbot',
    '生成式AI': 'Generative AI',
    '发布': 'Launches',
    '推出': 'Introduces',
    '更新': 'Updates',
    '升级': 'Upgrades',
    '突破': 'Breakthrough',
    '创新': 'Innovation',
    '研究': 'Research',
    '开源': 'Open Source',
    '融资': 'Funding',
    '投资': 'Investment',
    '收购': 'Acquisition',
    '合作': 'Partnership',
    '竞争': 'Competition'
  };
  
  let englishTitle = chineseTitle;
  
  // 替换常见术语
  Object.entries(termMap).forEach(([chinese, english]) => {
    const regex = new RegExp(chinese, 'g');
    englishTitle = englishTitle.replace(regex, english);
  });
  
  // 如果标题仍然主要是中文，则使用描述性英文标题
  if (/[\u4e00-\u9fa5]/.test(englishTitle)) {
    const category = categorizeByTitle(chineseTitle);
    const templates = {
      tech: [
        `Latest AI Technology Breakthrough: ${extractKeyTerm(chineseTitle)}`,
        `New Development in AI: ${extractKeyTerm(chineseTitle)}`,
        `AI Innovation Update: ${extractKeyTerm(chineseTitle)}`
      ],
      product: [
        `New AI Product Launch: ${extractKeyTerm(chineseTitle)}`,
        `Latest AI Tool Release: ${extractKeyTerm(chineseTitle)}`,
        `Revolutionary AI Product: ${extractKeyTerm(chineseTitle)}`
      ],
      investment: [
        `AI Investment News: ${extractKeyTerm(chineseTitle)}`,
        `Funding Round Update: ${extractKeyTerm(chineseTitle)}`,
        `AI Startup Funding: ${extractKeyTerm(chineseTitle)}`
      ],
      industry: [
        `AI Industry Analysis: ${extractKeyTerm(chineseTitle)}`,
        `Market Update: ${extractKeyTerm(chineseTitle)}`,
        `Industry Trend: ${extractKeyTerm(chineseTitle)}`
      ],
      default: [
        `AI News Update: ${extractKeyTerm(chineseTitle)}`,
        `Latest in AI: ${extractKeyTerm(chineseTitle)}`,
        `Breaking AI News: ${extractKeyTerm(chineseTitle)}`
      ]
    };
    
    const categoryTemplates = templates[category] || templates.default;
    englishTitle = categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
  }
  
  // 确保标题长度适中
  if (englishTitle.length > 80) {
    englishTitle = englishTitle.substring(0, 77) + '...';
  }
  
  return englishTitle;
}

/**
 * 智能生成中文摘要
 */
function generateChineseExcerpt(title, content) {
  const keyTerm = extractKeyTerm(title);
  const category = categorizeByTitle(title);
  
  const templates = {
    tech: [
      `本文深度分析${keyTerm}的最新技术突破，探讨其在人工智能领域的创新意义和实际应用前景。`,
      `${keyTerm}技术的新进展为AI行业带来了重大变革，本文详细解读其技术特点和市场影响。`,
      `通过对${keyTerm}的深入研究，我们发现了人工智能技术发展的新趋势和机遇。`
    ],
    product: [
      `${keyTerm}的发布标志着AI产品的新里程碑，本文分析其功能特色和市场竞争力。`,
      `最新推出的${keyTerm}产品展现了人工智能技术的强大潜力，为用户带来全新体验。`,
      `${keyTerm}作为新一代AI产品，其创新设计和技术实现值得深入探讨。`
    ],
    investment: [
      `${keyTerm}获得的投资融资反映了资本市场对AI领域的持续看好，本文分析投资价值和前景。`,
      `通过分析${keyTerm}的融资情况，我们可以洞察AI投资市场的最新趋势。`,
      `${keyTerm}的投资动态为我们提供了AI产业发展的重要信号。`
    ],
    industry: [
      `${keyTerm}的行业发展为AI产业带来了新的机遇和挑战，本文提供深度分析和前瞻预测。`,
      `从${keyTerm}的市场表现可以看出AI行业的发展趋势和竞争格局。`,
      `${keyTerm}在行业中的地位变化反映了AI技术商业化的新阶段。`
    ],
    default: [
      `${keyTerm}的最新发展为AI领域注入了新活力，本文提供全面深入的分析解读。`,
      `通过对${keyTerm}的详细分析，我们探索人工智能技术的发展方向和应用前景。`,
      `${keyTerm}的重要进展展现了AI技术的无限可能，值得持续关注。`
    ]
  };
  
  const categoryTemplates = templates[category] || templates.default;
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
}

/**
 * 智能生成英文摘要
 */
function generateEnglishExcerpt(title, content) {
  const keyTerm = extractKeyTerm(title);
  const category = categorizeByTitle(title);
  
  const templates = {
    tech: [
      `This article provides an in-depth analysis of ${keyTerm}'s latest technological breakthrough and its innovative significance in the AI field.`,
      `The new developments in ${keyTerm} technology bring major changes to the AI industry. This article explores its technical features and market impact.`,
      `Through comprehensive research on ${keyTerm}, we uncover new trends and opportunities in artificial intelligence development.`
    ],
    product: [
      `The launch of ${keyTerm} marks a new milestone in AI products. This article analyzes its features and competitive advantages.`,
      `The newly released ${keyTerm} product demonstrates the powerful potential of AI technology, bringing users a revolutionary experience.`,
      `As a next-generation AI product, ${keyTerm}'s innovative design and technical implementation deserve in-depth discussion.`
    ],
    investment: [
      `The investment funding received by ${keyTerm} reflects the capital market's continued optimism about the AI sector.`,
      `By analyzing ${keyTerm}'s funding situation, we gain insights into the latest trends in AI investment markets.`,
      `The investment dynamics of ${keyTerm} provide important signals for AI industry development.`
    ],
    industry: [
      `The industry development of ${keyTerm} brings new opportunities and challenges to the AI sector, with deep analysis and forward-looking predictions.`,
      `The market performance of ${keyTerm} reveals development trends and competitive landscape in the AI industry.`,
      `Changes in ${keyTerm}'s industry position reflect a new phase of AI technology commercialization.`
    ],
    default: [
      `The latest developments in ${keyTerm} inject new vitality into the AI field, providing comprehensive and in-depth analysis.`,
      `Through detailed analysis of ${keyTerm}, we explore the development direction and application prospects of AI technology.`,
      `The significant progress of ${keyTerm} demonstrates the infinite possibilities of AI technology and deserves continued attention.`
    ]
  };
  
  const categoryTemplates = templates[category] || templates.default;
  return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
}

/**
 * 从标题中提取关键术语
 */
function extractKeyTerm(title) {
  const aiTerms = ['ChatGPT', 'GPT', 'OpenAI', 'Google', 'Microsoft', 'AI', '人工智能', '机器学习', '深度学习', '大模型'];
  
  for (const term of aiTerms) {
    if (title.includes(term)) {
      return term;
    }
  }
  
  // 如果没有找到AI术语，返回标题的前几个关键词
  const words = title.split(/[，。！？\s]+/).filter(word => word.length > 1);
  return words[0] || 'AI技术';
}

/**
 * 根据标题分类
 */
function categorizeByTitle(title) {
  if (title.includes('投资') || title.includes('融资') || title.includes('估值')) return 'investment';
  if (title.includes('发布') || title.includes('推出') || title.includes('产品')) return 'product';
  if (title.includes('行业') || title.includes('市场') || title.includes('产业')) return 'industry';
  return 'tech';
}

/**
 * 生成标签
 */
function generateTags(news, keywords) {
  const category = categorizeNews(news);
  
  // 中文标签
  const tagsZh = [];
  tagsZh.push(category.zh);
  
  // 添加关键词作为标签
  keywords.zh.slice(0, 3).forEach(keyword => {
    if (!tagsZh.includes(keyword)) {
      tagsZh.push(keyword);
    }
  });
  
  // 英文标签
  const tagsEn = [];
  tagsEn.push(category.en);
  keywords.en.slice(0, 3).forEach(keyword => {
    if (!tagsEn.includes(keyword)) {
      tagsEn.push(keyword);
    }
  });
  
  return { tagsZh, tagsEn };
}

/**
 * 如果脚本直接运行则执行主函数
 */
if (require.main === module) {
  main();
}

module.exports = {
  main,
  generateBlogArticles,
  analyzeHotAINews
};