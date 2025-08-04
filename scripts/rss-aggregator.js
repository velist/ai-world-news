import Parser from 'rss-parser';
const parser = new Parser();

// RSS源配置
const RSS_SOURCES = [
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    category: 'AI',
    keywords: ['AI', '人工智能', '机器学习', '深度学习', '神经网络', 'ChatGPT', 'GPT', '大模型', 'LLM']
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: '科技',
    keywords: ['AI', '人工智能', '机器学习', '创业', '科技', '融资', '投资']
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com/feed',
    category: '科技',
    keywords: ['AI', '人工智能', '科技', '互联网', '创新']
  },
  {
    name: 'InfoQ中文',
    url: 'https://www.infoq.cn/feed',
    category: '科技',
    keywords: ['AI', '人工智能', '机器学习', '技术', '开发', '架构']
  },
  {
    name: '虎嗅网',
    url: 'https://www.huxiu.com/rss/0.xml',
    category: '科技',
    keywords: ['AI', '人工智能', '科技', '商业', '创新']
  }
];

// AI相关关键词
const AI_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', '神经网络', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '智能',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别',
  'OpenAI', '百度AI', '腾讯AI', '阿里AI', '字节跳动', '商汤科技', '科大讯飞',
  'Claude', 'Gemini', 'Llama', 'Mistral', 'Anthropic', 'Google AI', 'Microsoft AI'
];

// 判断新闻是否与AI相关
function isAINews(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  return AI_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) ||
    text.includes(keyword)
  );
}

// 清理和标准化新闻内容
function cleanNewsContent(item, source) {
  // 移除HTML标签
  const cleanContent = (content) => {
    if (!content) return '';
    return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  };

  // 提取摘要
  const extractSummary = (content, maxLength = 200) => {
    if (!content) return '';
    const cleanText = cleanContent(content);
    return cleanText.length > maxLength 
      ? cleanText.substring(0, maxLength) + '...' 
      : cleanText;
  };

  // 生成唯一ID
  const generateId = (title, pubDate) => {
    const hash = crypto
      .createHash('md5')
      .update(title + (pubDate || Date.now()))
      .digest('hex');
    return `news_${Date.now()}_${hash.substring(0, 8)}`;
  };

  // 标准化分类
  const normalizeCategory = (category) => {
    if (isAINews(item.title, item.content)) {
      return 'AI';
    }
    return category || '科技';
  };

  return {
    id: generateId(item.title, item.pubDate),
    title: item.title || '无标题',
    summary: extractSummary(item.contentSnippet || item.content),
    content: cleanContent(item.content || item.contentSnippet || ''),
    imageUrl: extractImageUrl(item),
    source: source.name,
    publishedAt: item.pubDate || new Date().toISOString(),
    category: normalizeCategory(source.category),
    originalUrl: item.link,
    aiInsight: generateAIInsight(item.title, item.contentSnippet || item.content)
  };
}

// 提取图片URL
function extractImageUrl(item) {
  // 尝试从content中提取图片
  const imgMatch = (item.content || '').match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  
  // 尝试从enclosure中提取
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  // 默认图片
  return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';
}

// 生成AI洞察
function generateAIInsight(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 根据关键词生成不同的洞察
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

// 爬取单个RSS源
async function fetchRSSSource(source) {
  try {
    console.log(`正在爬取 ${source.name}...`);
    const feed = await parser.parseURL(source.url);
    
    const newsItems = feed.items
      .filter(item => isAINews(item.title, item.contentSnippet || item.content))
      .map(item => cleanNewsContent(item, source))
      .slice(0, 10); // 每个源最多取10条

    console.log(`${source.name} 获取到 ${newsItems.length} 条AI相关新闻`);
    return newsItems;
  } catch (error) {
    console.error(`爬取 ${source.name} 失败:`, error.message);
    return [];
  }
}

// 主要的新闻聚合函数
async function aggregateNews() {
  console.log('开始聚合AI新闻...');
  
  const allNews = [];
  const seenTitles = new Set(); // 用于去重
  
  for (const source of RSS_SOURCES) {
    const newsItems = await fetchRSSSource(source);
    
    for (const item of newsItems) {
      // 简单去重：基于标题
      const titleKey = item.title.toLowerCase().trim();
      if (!seenTitles.has(titleKey)) {
        seenTitles.add(titleKey);
        allNews.push(item);
      }
    }
    
    // 添加延迟，避免请求过于频繁
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // 按发布时间排序
  allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  console.log(`总共获取到 ${allNews.length} 条AI新闻`);
  return allNews;
}

// 保存新闻到JSON文件
async function saveNewsToFile(news, filename = 'news-data.json') {
  const fs = await import('fs').then(m => m.promises);
  const path = await import('path');
  
  const data = {
    success: true,
    timestamp: new Date().toISOString(),
    total: news.length,
    data: news
  };
  
  try {
    await fs.writeFile(
      path.join(__dirname, '..', 'public', filename),
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log(`新闻数据已保存到 ${filename}`);
  } catch (error) {
    console.error('保存文件失败:', error.message);
  }
}

// 主函数
async function main() {
  try {
    const news = await aggregateNews();
    await saveNewsToFile(news);
    console.log('新闻聚合完成！');
  } catch (error) {
    console.error('新闻聚合失败:', error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  aggregateNews,
  fetchRSSSource,
  isAINews,
  saveNewsToFile
};