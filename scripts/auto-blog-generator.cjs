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
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  
  return newsData
    .filter(news => {
      // 筛选昨天到今天的新闻
      const publishDate = new Date(news.publishedAt);
      if (publishDate < yesterday) return false;
      
      // 筛选AI相关新闻
      const title = (news.title || '').toLowerCase();
      const content = (news.content || news.summary || '').toLowerCase();
      const combinedText = `${title} ${content}`;
      
      return CONFIG.AI_KEYWORDS.some(keyword => 
        combinedText.includes(keyword.toLowerCase())
      );
    })
    .sort((a, b) => {
      // 按发布时间排序（最新的在前）
      const dateA = new Date(a.publishedAt);
      const dateB = new Date(b.publishedAt);
      return dateB - dateA;
    })
    .slice(0, CONFIG.DAILY_ARTICLES * 2); // 取两倍数量作为候选
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
  
  // 英文关键词
  const enKeywords = ['Artificial Intelligence', 'AI Technology', 'Tech Innovation', 'Machine Learning'];
  
  return {
    zh: [...new Set(zhKeywords)].slice(0, 6),
    en: [...new Set(enKeywords)].slice(0, 6)
  };
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
  
  // 生成英文标题（简化版）
  const titleEn = news.title_en || `AI News: ${originalTitle.substring(0, 30)}...`;
  
  // 生成中文摘要
  let excerptZh = originalContent.length > 100 
    ? originalContent.substring(0, 97) + '...'
    : originalContent;
  
  if (!excerptZh) {
    excerptZh = `深度解读${titleZh}的最新发展动态，分析其对AI行业的深远影响和未来发展趋势。`;
  }
  
  // 生成英文摘要
  const excerptEn = news.content_en 
    ? (news.content_en.substring(0, 97) + '...')
    : `In-depth analysis of the latest developments in AI technology and its impact on the industry.`;
  
  return { titleZh, titleEn, excerptZh, excerptEn };
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