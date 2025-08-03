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
  const newsApiKey = process.env.NEWS_API_KEY;
  const newsdataApiKey = process.env.NEWSDATA_API_KEY;
  const gnewsApiKey = process.env.GNEWS_API_KEY;
  const currentsApiKey = process.env.CURRENTS_API_KEY;
  
  let allNews = [];
  
  // 计算24小时前的时间戳，确保获取最新新闻
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const fromDate = yesterday.toISOString().split('T')[0]; // YYYY-MM-DD 格式
  
  // 尝试NewsAPI - 获取最近24小时的新闻
  if (newsApiKey) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+deep+learning+OR+ChatGPT+OR+OpenAI+OR+Google+AI+OR+claude+OR+gemini&language=en&sortBy=publishedAt&from=${fromDate}&pageSize=100&apiKey=${newsApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          allNews = [...allNews, ...data.articles];
          console.log(`NewsAPI 获取到 ${data.articles.length} 条新闻`);
        } else {
          console.log('NewsAPI 没有返回文章数据');
        }
      } else {
        console.error(`NewsAPI 请求失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('NewsAPI error:', error);
    }
  }
  
  // 尝试NewsData - 获取最近的新闻
  if (newsdataApiKey && allNews.length < 50) {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=artificial+intelligence+OR+AI+OR+machine+learning+OR+ChatGPT&category=technology&language=en&size=50&timeframe=24`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const formattedNews = data.results.map((item) => ({
            title: item.title,
            description: item.description,
            content: item.content || item.description,
            urlToImage: item.image_url,
            source: { name: item.source_id },
            publishedAt: item.pubDate,
            url: item.link
          }));
          
          allNews = [...allNews, ...formattedNews];
          console.log(`NewsData 获取到 ${formattedNews.length} 条新闻`);
        } else {
          console.log('NewsData 没有返回结果数据');
        }
      } else {
        console.error(`NewsData 请求失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('NewsData error:', error);
    }
  }
  
  // 尝试GNews - 获取最近的新闻
  if (gnewsApiKey && allNews.length < 80) {
    try {
      const response = await fetch(
        `https://gnews.io/api/v4/search?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+ChatGPT+OR+OpenAI&lang=en&country=us&max=50&from=${fromDate}T00:00:00Z&apikey=${gnewsApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.articles && data.articles.length > 0) {
          const formattedNews = data.articles.map((item) => ({
            title: item.title,
            description: item.description,
            content: item.content || item.description,
            urlToImage: item.image,
            source: { name: item.source.name },
            publishedAt: item.publishedAt,
            url: item.url
          }));
          
          allNews = [...allNews, ...formattedNews];
          console.log(`GNews 获取到 ${formattedNews.length} 条新闻`);
        } else {
          console.log('GNews 没有返回文章数据');
        }
      } else {
        console.error(`GNews 请求失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('GNews error:', error);
    }
  }
  
  // 尝试Currents API - 获取最近的新闻
  if (currentsApiKey && allNews.length < 100) {
    try {
      const response = await fetch(
        `https://api.currentsapi.services/v1/search?keywords=artificial+intelligence+AI+machine+learning+ChatGPT&language=en&start_date=${fromDate}&apiKey=${currentsApiKey}`
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
          console.log(`Currents API 获取到 ${formattedNews.length} 条新闻`);
        } else {
          console.log('Currents API 没有返回新闻数据');
        }
      } else {
        console.error(`Currents API 请求失败: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Currents API error:', error);
    }
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

// 分类新闻
function categorizeNews(title, content) {
  const titleLower = title.toLowerCase();
  const contentLower = (content || '').toLowerCase();
  
  if (titleLower.includes('gpt') || titleLower.includes('llm') || titleLower.includes('model')) {
    return 'AI 模型';
  } else if (titleLower.includes('chip') || titleLower.includes('gpu') || titleLower.includes('nvidia')) {
    return '科技';
  } else if (titleLower.includes('economy') || titleLower.includes('market') || titleLower.includes('revenue')) {
    return '经济';
  } else {
    return '深度分析';
  }
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
          
          return {
            id: `news_${Date.now()}_${index}`,
            title: translatedTitle,
            summary: translatedSummary,
            content: translatedContent,
            imageUrl: item.urlToImage || `/placeholder.svg`,
            source: item.source.name,
            publishedAt: item.publishedAt,
            category: categorizeNews(item.title, item.content || item.description || ''),
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
    
  } catch (error) {
    console.error('获取新闻时出错:', error);
    process.exit(1);
  }
}

main();