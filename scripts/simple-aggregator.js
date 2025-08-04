console.log('开始聚合AI新闻...');

import Parser from 'rss-parser';
import crypto from 'crypto';
const parser = new Parser();

// RSS源配置
const RSS_SOURCES = [
  {
    name: '机器之心',
    url: 'https://www.jiqizhixin.com/rss',
    category: 'AI'
  },
  {
    name: '36氪',
    url: 'https://36kr.com/feed',
    category: '科技'
  },
  {
    name: '钛媒体',
    url: 'https://www.tmtpost.com/feed',
    category: '科技'
  },
  {
    name: 'InfoQ中文',
    url: 'https://www.infoq.cn/feed',
    category: '科技'
  },
  {
    name: 'IT之家',
    url: 'https://www.ithome.com/rss/',
    category: '科技'
  }
];

// AI关键词
const AI_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '智能',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别'
];

// 判断是否为AI新闻
function isAINews(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  return AI_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) ||
    text.includes(keyword)
  );
}

// 判断是否为国内AI新闻
function isDomesticAINews(title, content, source) {
  if (!isAINews(title, content)) return false;
  
  const domesticSources = ['36氪', '钛媒体', 'InfoQ中文', 'IT之家'];
  const domesticKeywords = ['中国', '国内', '百度', '阿里', '腾讯', '字节', '华为', '小米', '京东', '美团', '滴滴', '网易', '新浪', '搜狐', '携程'];
  
  const text = (title + ' ' + (content || '')).toLowerCase();
  const isDomesticSource = domesticSources.includes(source.name);
  const hasDomesticKeywords = domesticKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return isDomesticSource || hasDomesticKeywords;
}

// 清理内容
function cleanContent(content) {
  if (!content) return '';
  return content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// 生成ID
function generateId(title, pubDate) {
  const hash = crypto.createHash('md5')
    .update(title + (pubDate || Date.now()))
    .digest('hex');
  return `news_${Date.now()}_${hash.substring(0, 8)}`;
}

// 提取图片
function extractImageUrl(item) {
  const imgMatch = (item.content || '').match(/<img[^>]+src="([^">]+)"/);
  if (imgMatch) return imgMatch[1];
  
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';
}

// 生成AI洞察
function generateAIInsight(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
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

// 处理单个新闻项
function processNewsItem(item, source) {
  const summary = cleanContent(item.contentSnippet || item.content || '');
  const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  
  let category;
  if (isAINews(item.title, item.content)) {
    category = isDomesticAINews(item.title, item.content, source) ? '国内AI' : '国外AI';
  } else {
    category = source.category;
  }
  
  return {
    id: generateId(item.title, item.pubDate),
    title: item.title || '无标题',
    summary: truncatedSummary,
    content: cleanContent(item.content || item.contentSnippet || ''),
    imageUrl: extractImageUrl(item),
    source: source.name,
    publishedAt: item.pubDate || new Date().toISOString(),
    category: category,
    originalUrl: item.link,
    aiInsight: generateAIInsight(item.title, item.contentSnippet || item.content)
  };
}

// 主函数
async function main() {
  console.log('开始聚合AI新闻...');
  
  const allNews = [];
  const seenTitles = new Set();
  
  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在爬取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const newsItems = feed.items
        .filter(item => isAINews(item.title, item.contentSnippet || item.content))
        .map(item => processNewsItem(item, source))
        .slice(0, 10);
      
      console.log(`${source.name} 获取到 ${newsItems.length} 条AI相关新闻`);
      
      for (const item of newsItems) {
        const titleKey = item.title.toLowerCase().trim();
        if (!seenTitles.has(titleKey)) {
          seenTitles.add(titleKey);
          allNews.push(item);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`爬取 ${source.name} 失败:`, error.message);
    }
  }
  
  allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  const data = {
    success: true,
    timestamp: new Date().toISOString(),
    total: allNews.length,
    data: allNews
  };
  
  // 保存文件
  const fs = await import('fs').then(m => m.promises);
  
  try {
    await fs.writeFile(
      'public/news-data.json',
      JSON.stringify(data, null, 2),
      'utf8'
    );
    console.log(`新闻数据已保存到 news-data.json，共 ${allNews.length} 条新闻`);
  } catch (error) {
    console.error('保存文件失败:', error.message);
  }
}

// 运行
main().catch(console.error);