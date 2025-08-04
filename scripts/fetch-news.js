import fs from 'fs';
import path from 'path';

// 翻译函数
async function translateText(text, targetLang = 'zh') {
  try {
    // 使用硅基流动API进行翻译
    const siliconflowKey = process.env.SILICONFLOW_API_KEY;
    if (siliconflowKey) {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${siliconflowKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages: [
            {
              role: 'user',
              content: `请将以下英文翻译成中文，保持原意和专业性：\n\n${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.choices[0]?.message?.content || text;
      }
    }
    
    return text;
  } catch (error) {
    console.error('Translation error:', error);
    return text;
  }
}

// AI点评函数
async function generateAIInsight(title, content) {
  try {
    const siliconflowKey = process.env.SILICONFLOW_API_KEY;
    if (!siliconflowKey) return '';
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${siliconflowKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          {
            role: 'user',
            content: `作为AI科技新闻分析师，请对以下新闻进行深度点评分析，从技术发展、行业影响、未来趋势等角度提供洞察，字数在150-200字：

标题：${title}

内容：${content.substring(0, 1000)}...`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
    
    return '';
  } catch (error) {
    console.error('AI insight generation error:', error);
    return '';
  }
}

// 获取新闻数据
async function fetchNews() {
  const newsApiKey = process.env.NEWS_API_KEY; // newsapi.ai
  const newsApiOrgKey = process.env.NEWSAPI_ORG_KEY; // newsapi.org
  const newsdataApiKey = process.env.NEWSDATA_API_KEY;
  const gnewsApiKey = process.env.GNEWS_API_KEY;
  const currentsApiKey = process.env.CURRENTS_API_KEY;
  
  let allNews = [];
  
  // 计算24小时前的时间戳，确保获取最新新闻
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const fromDate = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD 格式
  
  console.log(`获取 ${fromDate} 以来的AI新闻...`);
  
  // 首先尝试NewsAPI.org - 这个API更稳定
  if (newsApiOrgKey) {
    try {
      console.log('正在尝试NewsAPI.org...');
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+deep+learning+OR+ChatGPT+OR+OpenAI+OR+Google+AI+OR+claude+OR+gemini&language=en&sortBy=publishedAt&from=${fromDate}&pageSize=50&apiKey=${newsApiOrgKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          allNews = [...allNews, ...data.articles];
          console.log(`✅ NewsAPI.org 获取到 ${data.articles.length} 条新闻`);
        } else {
          console.log('⚠️ NewsAPI.org 没有返回文章数据');
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ NewsAPI.org 请求失败: ${response.status} ${response.statusText}`, errorData);
      }
    } catch (error) {
      console.error('❌ NewsAPI.org 连接错误:', error.message);
    }
  } else {
    console.log('⚠️ NewsAPI.org 密钥未配置');
  }
  
  // 备用：尝试NewsAPI.ai - 获取最近的新闻
  if (newsApiKey && allNews.length < 30) {
    try {
      console.log('正在尝试NewsAPI.ai...');
      const response = await fetch(
        `https://newsapi.ai/api/v1/article/getArticles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: newsApiKey,
            query: {
              $query: {
                $and: [
                  {
                    $or: [
                      { conceptUri: "http://en.wikipedia.org/wiki/Artificial_intelligence" },
                      { conceptUri: "http://en.wikipedia.org/wiki/Machine_learning" },
                      { keywordLoc: "title", keyword: "AI" },
                      { keywordLoc: "title", keyword: "artificial intelligence" },
                      { keywordLoc: "title", keyword: "ChatGPT" },
                      { keywordLoc: "title", keyword: "OpenAI" }
                    ]
                  },
                  { lang: "eng" },
                  { dateStart: fromDate }
                ]
              }
            },
            resultType: "articles",
            articlesSortBy: "date",
            articlesCount: 30
          })
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.results && data.articles.results.length > 0) {
          const formattedNews = data.articles.results.map((item) => ({
            title: item.title,
            description: item.body?.substring(0, 200) + '...' || item.title,
            content: item.body || item.title,
            urlToImage: item.image,
            source: { name: item.source.title || 'NewsAPI.ai' },
            publishedAt: item.dateTime,
            url: item.url
          }));
          
          allNews = [...allNews, ...formattedNews];
          console.log(`✅ NewsAPI.ai 获取到 ${formattedNews.length} 条新闻`);
        } else {
          console.log('⚠️ NewsAPI.ai 没有返回文章数据');
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ NewsAPI.ai 请求失败: ${response.status} ${response.statusText}`, errorData);
      }
    } catch (error) {
      console.error('❌ NewsAPI.ai 连接错误:', error.message);
    }
  } else if (!newsApiKey && allNews.length < 30) {
    console.log('⚠️ NewsAPI.ai 密钥未配置');
  }
  
  // 备用：尝试NewsData API - 获取最近的新闻
  if (newsdataApiKey && allNews.length < 50) {
    try {
      console.log('正在尝试NewsData API...');
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=artificial%20intelligence%20OR%20AI%20OR%20machine%20learning%20OR%20ChatGPT%20OR%20OpenAI%20OR%20claude&category=technology&language=en&size=50`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          // 过滤最近24小时的新闻
          const recentResults = data.results.filter(item => {
            const publishedDate = new Date(item.pubDate);
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            return publishedDate > yesterday && item.title && item.description;
          });
          
          const formattedNews = recentResults.map((item) => ({
            title: item.title,
            description: item.description,
            content: item.content || item.description,
            urlToImage: item.image_url,
            source: { name: item.source_id || 'NewsData' },
            publishedAt: item.pubDate,
            url: item.link
          }));
          
          allNews = [...allNews, ...formattedNews];
          console.log(`✅ NewsData API 获取到 ${formattedNews.length} 条最新新闻`);
        } else {
          console.log('⚠️ NewsData API 没有返回结果数据');
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ NewsData API 请求失败: ${response.status} ${response.statusText}`, errorData);
      }
    } catch (error) {
      console.error('❌ NewsData API 连接错误:', error.message);
    }
  } else {
    console.log('⚠️ NewsData API 密钥未配置');
  }
  
  // 尝试GNews - 获取最近的新闻
  if (gnewsApiKey && allNews.length < 80) {
    try {
      console.log('正在尝试GNews API...');
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=artificial%20intelligence%20OR%20AI%20OR%20machine%20learning%20OR%20ChatGPT%20OR%20OpenAI&lang=en&country=us&max=50&from=${fromDate}T00:00:00Z&apikey=${gnewsApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          const formattedNews = data.articles.map((item) => ({
            title: item.title,
            description: item.description,
            content: item.content || item.description,
            urlToImage: item.image,
            source: { name: item.source.name || 'GNews' },
            publishedAt: item.publishedAt,
            url: item.url
          }));
          
          allNews = [...allNews, ...formattedNews];
          console.log(`✅ GNews 获取到 ${formattedNews.length} 条新闻`);
        } else {
          console.log('⚠️ GNews 没有返回文章数据');
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ GNews 请求失败: ${response.status} ${response.statusText}`, errorData);
      }
    } catch (error) {
      console.error('❌ GNews 连接错误:', error.message);
    }
  } else if (!gnewsApiKey) {
    console.log('⚠️ GNews API 密钥未配置');
  }
  
  // 尝试Currents API - 获取最近的新闻
  if (currentsApiKey && allNews.length < 100) {
    try {
      console.log('正在尝试Currents API...');
      const response = await fetch(
        `https://api.currentsapi.services/v1/search?keywords=artificial%20intelligence%20AI%20machine%20learning%20ChatGPT&language=en&start_date=${fromDate}&apiKey=${currentsApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.news && data.news.length > 0) {
          const formattedNews = data.news.map((item) => ({
            title: item.title,
            description: item.description,
            content: item.description,
            urlToImage: item.image,
            source: { name: item.author || 'Currents API' },
            publishedAt: item.published,
            url: item.url
          }));
          
          allNews = [...allNews, ...formattedNews];
          console.log(`✅ Currents API 获取到 ${formattedNews.length} 条新闻`);
        } else {
          console.log('⚠️ Currents API 没有返回新闻数据');
        }
      } else {
        const errorData = await response.json();
        console.error(`❌ Currents API 请求失败: ${response.status} ${response.statusText}`, errorData);
      }
    } catch (error) {
      console.error('❌ Currents API 连接错误:', error.message);
    }
  } else if (!currentsApiKey) {
    console.log('⚠️ Currents API 密钥未配置');
  }
  
  // 过滤最近48小时的新闻，确保时效性
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  const recentNews = allNews.filter(item => {
    const publishedDate = new Date(item.publishedAt);
    return publishedDate > twoDaysAgo && item.title && item.description;
  });
  
  console.log(`过滤后剩余 ${recentNews.length} 条最近2天的新闻`);
  
  // 去重和排序
  const uniqueNews = recentNews.filter((item, index, self) => 
    index === self.findIndex(t => t.title === item.title)
  );
  
  // 按发布时间排序，取最新的100条
  const sortedNews = uniqueNews.sort((a, b) => 
    new Date(b.publishedAt) - new Date(a.publishedAt)
  );
  
  console.log(`去重后有 ${uniqueNews.length} 条新闻，返回最新的100条`);
  return sortedNews.slice(0, 100);
}

// 使用智谱清言AI进行新闻分类
async function categorizeNewsWithAI(title, content, originalTitle = '', originalContent = '') {
  try {
    const zhipuApiKey = process.env.ZHIPU_API_KEY;
    if (!zhipuApiKey) {
      console.log('智谱清言API密钥未配置，使用传统关键词分类');
      return categorizeNewsTraditional(title, content);
    }

    const prompt = `请根据以下新闻内容，将其准确分类为以下5个类别之一：国内AI、国外AI、科技、经济、深度分析

分类规则：
1. **国内AI类别**：与中国公司、机构或个人相关的AI新闻，包括百度、阿里、腾讯、华为、字节、智谱、商汤等中国AI企业，以及中国政府AI政策、中国AI研究成果等
2. **国外AI类别**：与美国、欧洲等其他国家相关的AI新闻，包括OpenAI、Google、Microsoft、Meta、Anthropic等国外AI企业，以及国外AI研究进展
3. **科技类别**：硬件产品、软件应用、游戏、社交媒体、网络安全等传统科技内容（不含AI）
4. **经济类别**：股市、金融、加密货币、投资、经济政策等财经内容（不含AI相关投资）
5. **深度分析类别**：其他内容或需要深度分析的复杂话题

新闻标题：${title}
新闻内容：${content.substring(0, 800)}

请只回复一个类别名称：国内AI、国外AI、科技、经济 或 深度分析`;

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zhipuApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiCategory = data.choices[0]?.message?.content?.trim();
      
      // 验证AI返回的分类是否有效
      const validCategories = ['国内AI', '国外AI', '科技', '经济', '深度分析'];
      if (validCategories.includes(aiCategory)) {
        console.log(`AI分类结果: ${title.substring(0, 50)}... → ${aiCategory}`);
        return aiCategory;
      } else {
        console.log(`AI分类结果无效(${aiCategory})，使用传统分类`);
        return categorizeNewsTraditional(title, content);
      }
    } else {
      console.error('智谱清言API请求失败:', response.status);
      return categorizeNewsTraditional(title, content);
    }
  } catch (error) {
    console.error('AI分类出错:', error.message);
    return categorizeNewsTraditional(title, content);
  }
}

// 使用火山方舟AI进行新闻分类（备用）
async function categorizeNewsWithVolcEngine(title, content) {
  try {
    const volcApiKey = process.env.VOLC_API_KEY;
    if (!volcApiKey) {
      return categorizeNewsTraditional(title, content);
    }

    const prompt = `请根据以下新闻内容，将其准确分类为以下5个类别之一：国内AI、国外AI、科技、经济、深度分析

分类规则：
1. **国内AI类别**：与中国公司、机构或个人相关的AI新闻，包括百度、阿里、腾讯、华为、字节、智谱、商汤等中国AI企业，以及中国政府AI政策、中国AI研究成果等
2. **国外AI类别**：与美国、欧洲等其他国家相关的AI新闻，包括OpenAI、Google、Microsoft、Meta、Anthropic等国外AI企业，以及国外AI研究进展
3. **科技类别**：硬件产品、软件应用、游戏、社交媒体、网络安全等传统科技内容（不含AI）
4. **经济类别**：股市、金融、加密货币、投资、经济政策等财经内容（不含AI相关投资）
5. **深度分析类别**：其他内容或需要深度分析的复杂话题

新闻标题：${title}
新闻内容：${content.substring(0, 800)}

请只回复一个类别名称：国内AI、国外AI、科技、经济 或 深度分析`;

    const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${volcApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'ep-20241230140956-bxrzw',
        messages: [{
          role: 'user',
          content: prompt
        }],
        max_tokens: 50,
        temperature: 0.1
      })
    });

    if (response.ok) {
      const data = await response.json();
      const aiCategory = data.choices[0]?.message?.content?.trim();
      
      const validCategories = ['国内AI', '国外AI', '科技', '经济', '深度分析'];
      if (validCategories.includes(aiCategory)) {
        console.log(`火山方舟分类结果: ${title.substring(0, 50)}... → ${aiCategory}`);
        return aiCategory;
      }
    }
    
    return categorizeNewsTraditional(title, content);
  } catch (error) {
    console.error('火山方舟分类出错:', error.message);
    return categorizeNewsTraditional(title, content);
  }
}

// 传统关键词分类（备用方案）
function categorizeNewsTraditional(title, content) {
  const titleLower = title.toLowerCase();
  const contentLower = (content || '').toLowerCase();
  const fullText = titleLower + ' ' + contentLower;
  
  // AI相关关键词 - 这是最重要的分类，包含AI模型、AI应用、AI技术等
  const aiKeywords = [
    // AI模型和技术
    'artificial intelligence', 'ai', 'machine learning', 'deep learning',
    'gpt', 'chatgpt', 'llm', 'large language model', 'ai model', 'neural network',
    'openai', 'claude', 'gemini', 'llama', 'qwen', 'glm', 'baichuan', 'deepseek',
    'mistral', 'stable diffusion', 'midjourney', 'dall-e', 'transformer',
    'foundation model', 'generative ai', 'text generation', 'image generation',
    'multimodal', 'anthropic', 'google ai', 'microsoft ai', 'meta ai', 'alibaba ai',
    '智谱', 'chatglm', 'wenxin', 'tongyi', 'spark', 'ernie', 'pangu',
    'fine-tuning', 'pre-training', 'training data', 'ai training',
    'hugging face', 'pytorch', 'tensorflow', 'machine learning model',
    
    // AI应用和产品
    'ai assistant', 'ai chatbot', 'ai agent', 'ai application', 'ai software',
    'ai tool', 'ai platform', 'ai service', 'ai system', 'ai solution',
    'voice ai', 'ai voice', 'ai speech', 'ai video', 'ai image', 'ai text',
    'ai writing', 'ai coding', 'ai programming', 'copilot', 'ai search',
    
    // AI生活和应用场景
    'ai in healthcare', 'ai medicine', 'ai education', 'ai learning',
    'ai automation', 'ai robot', 'robotics', 'autonomous', 'self-driving',
    'ai finance', 'ai trading', 'ai analysis', 'ai recommendation',
    'ai translation', 'ai customer service', 'ai workplace', 'ai productivity',
    
    // AI公司和新闻
    'ai startup', 'ai company', 'ai investment', 'ai funding', 'ai research',
    'ai development', 'ai innovation', 'ai breakthrough', 'ai advancement',
    'ai ethics', 'ai safety', 'ai regulation', 'ai policy', 'ai governance'
  ];
  
  // 科技硬件相关（但排除AI相关的硬件）
  const techKeywords = [
    'smartphone', 'phone', 'iphone', 'android', 'samsung', 'huawei', 'xiaomi',
    'laptop', 'computer', 'pc', 'mac', 'windows', 'ios', 'software',
    'app', 'application', 'game', 'gaming', 'console', 'playstation',
    'xbox', 'nintendo', 'streaming', 'netflix', 'youtube', 'social media',
    'facebook', 'twitter', 'instagram', 'tiktok', 'internet', 'web',
    'browser', 'security', 'cybersecurity', 'privacy', 'data breach'
  ];
  
  // 经济商业相关（排除AI相关的商业新闻）
  const economyKeywords = [
    'stock market', 'wall street', 'nasdaq', 'dow jones', 'trading',
    'cryptocurrency', 'bitcoin', 'ethereum', 'blockchain', 'nft',
    'bank', 'banking', 'finance', 'financial', 'economy', 'economic',
    'inflation', 'recession', 'gdp', 'federal reserve', 'interest rate',
    'merger', 'acquisition', 'ipo', 'earnings', 'revenue', 'profit'
  ];
  
  // 优先检查AI关键词 - 这是最重要的分类
  for (const keyword of aiKeywords) {
    if (fullText.includes(keyword)) {
      return 'AI';
    }
  }
  
  // 检查科技关键词（但不包含AI）
  for (const keyword of techKeywords) {
    if (fullText.includes(keyword)) {
      return '科技';
    }
  }
  
  // 检查经济关键词（但不包含AI）
  for (const keyword of economyKeywords) {
    if (fullText.includes(keyword)) {
      return '经济';
    }
  }
  
  // 避免华为手机等硬件产品进入深度分析
  const hardwareKeywords = ['magic v5', 'honor', 'mate', 'pro max', 'ultra', 'fold', 'flip'];
  for (const keyword of hardwareKeywords) {
    if (fullText.includes(keyword)) {
      return '科技';
    }
  }
  
  // 默认分类为深度分析（但应该很少进入这里）
  return '深度分析';
}

// 验证和处理图片URL（简化版，避免太多HTTP请求）
async function validateAndProcessImage(imageUrl, title = '') {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return generateFallbackImage(title);
  }
  
  // 检查URL格式是否有效
  try {
    const url = new URL(imageUrl);
    // 检查是否是常见的图片扩展名或来自可信的图片服务
    const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const trustedDomains = ['images.unsplash.com', 'cdn.', 'img.', 'static.', 'media.'];
    
    const hasValidExtension = validImageExtensions.some(ext => 
      url.pathname.toLowerCase().includes(ext)
    );
    const isFromTrustedDomain = trustedDomains.some(domain => 
      url.hostname.includes(domain)
    );
    
    // 如果URL看起来有效，就使用它，否则使用备用图片
    if (hasValidExtension || isFromTrustedDomain || url.hostname.includes('unsplash')) {
      return imageUrl;
    } else {
      console.log(`图片URL可能无效: ${imageUrl}, 使用备用图片`);
      return generateFallbackImage(title);
    }
  } catch (error) {
    console.log(`图片URL格式错误: ${imageUrl}, 使用备用图片`);
    return generateFallbackImage(title);
  }
}

// 生成备用图片
function generateFallbackImage(title = '') {
  // 根据标题内容生成不同的备用图片
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('ai') || titleLower.includes('artificial intelligence') || 
      titleLower.includes('machine learning') || titleLower.includes('chatgpt') || 
      titleLower.includes('openai') || titleLower.includes('claude') || titleLower.includes('人工智能')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format';
  }
  
  if (titleLower.includes('robot') || titleLower.includes('automation') || 
      titleLower.includes('机器人') || titleLower.includes('自动化')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&auto=format';
  }
  
  if (titleLower.includes('tech') || titleLower.includes('computer') || 
      titleLower.includes('software') || titleLower.includes('app') || 
      titleLower.includes('科技') || titleLower.includes('技术')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format';
  }
  
  if (titleLower.includes('crypto') || titleLower.includes('bitcoin') || 
      titleLower.includes('finance') || titleLower.includes('stock') ||
      titleLower.includes('比特币') || titleLower.includes('金融') || titleLower.includes('股市')) {
    return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=600&fit=crop&auto=format';
  }
  
  // 默认科技新闻图片
  return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format';
}

// 判断是否为国内AI新闻
function isDomesticAINews(title, content, source) {
  const text = (title + ' ' + content).toLowerCase();
  const domesticSources = ['36氪', '钛媒体', 'InfoQ中文', 'IT之家', '机器之心', '新浪科技', '腾讯科技', '网易科技', '百度科技'];
  const domesticKeywords = ['中国', '国内', '百度', '阿里', '腾讯', '字节', '华为', '小米', '京东', '美团', '滴滴', '网易', '新浪', '搜狐', '携程', '智谱', '文心一言', '通义千问', '讯飞星火', '商汤', '旷视', '依图', '云从'];
  
  const isDomesticSource = domesticSources.some(s => source.toLowerCase().includes(s.toLowerCase()));
  const hasDomesticKeywords = domesticKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  return isDomesticSource || hasDomesticKeywords;
}

// 主分类函数，优先使用AI分类，失败时使用传统分类
async function categorizeNews(title, content, originalTitle = '', originalContent = '') {
  // 首先尝试智谱清言AI分类
  const aiCategory = await categorizeNewsWithAI(title, content, originalTitle, originalContent);
  if (aiCategory && aiCategory !== 'error') {
    // 如果是AI类别，进一步区分为国内AI还是国外AI
    if (aiCategory === 'AI') {
      return isDomesticAINews(title, content, '') ? '国内AI' : '国外AI';
    }
    return aiCategory;
  }
  
  // 如果智谱清言失败，尝试火山方舟
  const volcCategory = await categorizeNewsWithVolcEngine(title, content);
  if (volcCategory && volcCategory !== 'error') {
    // 如果是AI类别，进一步区分为国内AI还是国外AI
    if (volcCategory === 'AI') {
      return isDomesticAINews(title, content, '') ? '国内AI' : '国外AI';
    }
    return volcCategory;
  }
  
  // 最后使用传统关键词分类
  const traditionalCategory = categorizeNewsTraditional(title, content);
  // 如果是AI类别，进一步区分为国内AI还是国外AI
  if (traditionalCategory === 'AI') {
    return isDomesticAINews(title, content, '') ? '国内AI' : '国外AI';
  }
  return traditionalCategory;
}

async function main() {
  try {
    console.log('开始获取AI新闻数据...');
    
    // 首先尝试读取现有的新闻数据，用于保留历史内容
    let existingNews = [];
    const publicDir = path.join(process.cwd(), 'public');
    const newsFilePath = path.join(publicDir, 'news-data.json');
    
    if (fs.existsSync(newsFilePath)) {
      try {
        const existingData = JSON.parse(fs.readFileSync(newsFilePath, 'utf8'));
        if (existingData.data && Array.isArray(existingData.data)) {
          // 只保留48小时内的历史新闻
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          
          existingNews = existingData.data.filter(item => {
            const publishedDate = new Date(item.publishedAt);
            return publishedDate > twoDaysAgo;
          });
          console.log(`从现有数据中保留 ${existingNews.length} 条历史新闻`);
        }
      } catch (error) {
        console.error('读取现有新闻数据失败:', error);
      }
    }
    
    // 获取最新新闻
    const rawNews = await fetchNews();
    console.log(`获取到 ${rawNews.length} 条新闻`);
    
    if (rawNews.length === 0) {
      console.error('❌ 所有新闻源都无法获取数据！');
      console.error('请检查以下可能的原因：');
      console.error('1. API密钥是否正确设置');
      console.error('2. API配额是否用完');
      console.error('3. 网络连接是否正常');
      
      if (existingNews.length > 0) {
        console.log('使用现有历史数据，共', existingNews.length, '条');
        const newsData = {
          success: true,
          data: existingNews,
          timestamp: new Date().toISOString(),
          total: existingNews.length,
          note: '由于API获取失败，显示历史数据'
        };
        
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        
        fs.writeFileSync(newsFilePath, JSON.stringify(newsData, null, 2), 'utf8');
        console.log('已保存历史新闻数据到 public/news-data.json');
        return;
      } else {
        console.error('没有可用的历史数据，程序退出');
        process.exit(1);
      }
    }
    
    // 处理每条新闻
    const processedNews = await Promise.all(
      rawNews.map(async (item, index) => {
        try {
          // 翻译标题和摘要
          const translatedTitle = await translateText(item.title);
          const translatedSummary = await translateText(item.description || item.title);
          const translatedContent = item.content ? await translateText(item.content) : translatedSummary;
          
          // 生成AI点评
          const aiInsight = await generateAIInsight(translatedTitle, translatedContent);
          
          // 验证和处理图片
          const validImageUrl = await validateAndProcessImage(item.urlToImage, translatedTitle);
          
          return {
            id: `news_${Date.now()}_${index}`,
            title: translatedTitle,
            summary: translatedSummary,
            content: translatedContent,
            imageUrl: validImageUrl,
            source: item.source.name,
            publishedAt: item.publishedAt,
            category: await categorizeNews(translatedTitle, translatedContent, item.title, item.content || item.description || ''),
            originalUrl: item.url,
            aiInsight: aiInsight
          };
        } catch (error) {
          console.error(`处理新闻项 ${index} 时出错:`, error);
          return null;
        }
      })
    );
    
    // 过滤掉处理失败的新闻
    const validNews = processedNews.filter(item => item !== null);
    console.log(`成功处理 ${validNews.length} 条新闻`);
    
    // 合并新旧数据，去重
    const allCombinedNews = [...validNews, ...existingNews];
    const uniqueCombinedNews = allCombinedNews.filter((item, index, self) => 
      index === self.findIndex(t => t.title === item.title)
    );
    
    // 按发布时间排序，保留最新的150条
    const finalNews = uniqueCombinedNews.sort((a, b) => 
      new Date(b.publishedAt) - new Date(a.publishedAt)
    ).slice(0, 150);
    
    console.log(`最终保存 ${finalNews.length} 条新闻（新增 ${validNews.length} 条，历史 ${existingNews.length} 条）`);
    
    // 保存新闻数据到public目录
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const newsData = {
      success: true,
      data: finalNews,
      timestamp: new Date().toISOString(),
      total: finalNews.length,
      newArticles: validNews.length,
      historicalArticles: existingNews.length
    };
    
    fs.writeFileSync(newsFilePath, JSON.stringify(newsData, null, 2), 'utf8');
    console.log('新闻数据已保存到 public/news-data.json');
    
    // 更新版本信息
    const versionFilePath = path.join(publicDir, 'version.json');
    let versionData = {
      version: "1.0.2",
      buildTime: new Date().toISOString(),
      features: [
        "中英文语言切换",
        "自动版本检测",
        "缓存优化",
        "定时新闻更新",
        "AI内容过滤优化"
      ],
      lastUpdate: new Date().toISOString(),
      updateInterval: "1小时"
    };
    
    // 如果版本文件存在，读取现有数据
    if (fs.existsSync(versionFilePath)) {
      try {
        const existingVersion = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
        versionData = {
          ...existingVersion,
          buildTime: new Date().toISOString(),
          lastUpdate: new Date().toISOString()
        };
      } catch (error) {
        console.log('版本文件读取失败，创建新版本');
      }
    }
    
    fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2), 'utf8');
    console.log('版本信息已更新到 public/version.json');
    
  } catch (error) {
    console.error('获取新闻时出错:', error);
    process.exit(1);
  }
}

main();