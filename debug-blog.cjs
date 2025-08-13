const fs = require('fs');
const path = require('path');

// 读取新闻数据
const newsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'news-data.json'), 'utf8'));
const actualData = newsData.data || newsData;

// 读取现有博客数据  
const blogData = JSON.parse(fs.readFileSync(path.join(__dirname, 'public', 'blog-data.json'), 'utf8'));

const CONFIG = {
  AI_KEYWORDS: [
    'AI', 'ChatGPT', 'GPT', 'OpenAI', 'Google', 'DeepMind', 'Microsoft', 'Anthropic',
    '人工智能', '机器学习', '深度学习', '大模型', '自然语言处理', '计算机视觉',
    '语音识别', '神经网络', 'Transformer', 'LLM', '生成式AI', 'AGI'
  ],
  DAILY_ARTICLES: 2
};

const existingTitles = new Set(blogData.map(article => article.title.toLowerCase()));

// 模拟 analyzeHotAINews 逻辑
const today = new Date();
const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

const hotNews = actualData
  .filter(news => {
    // 筛选昨天到今天的新闻
    const publishDate = new Date(news.publishedAt);
    if (publishDate < yesterday) return false;
    
    // 筛选AI相关新闻
    const title = (news.title || '').toLowerCase();
    const content = (news.content || news.summary || '').toLowerCase();
    const combinedText = title + ' ' + content;
    
    return CONFIG.AI_KEYWORDS.some(keyword => 
      combinedText.includes(keyword.toLowerCase())
    );
  })
  .sort((a, b) => {
    const dateA = new Date(a.publishedAt);
    const dateB = new Date(b.publishedAt);
    return dateB - dateA;
  })
  .slice(0, CONFIG.DAILY_ARTICLES * 2);

console.log('热门AI新闻筛选结果:');
hotNews.forEach((news, i) => {
  const title = news.title.toLowerCase();
  const exists = existingTitles.has(title);
  console.log(`${i+1}. ${news.title}`);
  console.log(`   已存在: ${exists}`);
  console.log(`   发布时间: ${news.publishedAt}`);
  console.log('');
});

console.log('应该生成的文章数量:', Math.min(hotNews.length, CONFIG.DAILY_ARTICLES));

let newCount = 0;
for (let i = 0; i < Math.min(hotNews.length, CONFIG.DAILY_ARTICLES); i++) {
  const news = hotNews[i];
  const title = news.title.toLowerCase();
  
  if (!existingTitles.has(title)) {
    newCount++;
    console.log('可以生成文章:', news.title);
  } else {
    console.log('跳过重复文章:', news.title);
  }
}

console.log('最终应该生成:', newCount, '篇新文章');