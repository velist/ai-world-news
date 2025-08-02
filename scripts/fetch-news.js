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
  
  let allNews = [];
  
  // 尝试NewsAPI
  if (newsApiKey) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+deep+learning&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`
      );
      
      if (response.ok) {
        const data = await response.json();
        allNews = [...allNews, ...data.articles];
      }
    } catch (error) {
      console.error('NewsAPI error:', error);
    }
  }
  
  // 尝试NewsData
  if (newsdataApiKey && allNews.length < 10) {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=artificial+intelligence&category=technology&language=en&size=10`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedNews = data.results?.map((item) => ({
          title: item.title,
          description: item.description,
          content: item.content || item.description,
          urlToImage: item.image_url,
          source: { name: item.source_id },
          publishedAt: item.pubDate,
          url: item.link
        })) || [];
        
        allNews = [...allNews, ...formattedNews];
      }
    } catch (error) {
      console.error('NewsData error:', error);
    }
  }
  
  return allNews.slice(0, 20); // 限制数量
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
    
    // 获取原始新闻
    const rawNews = await fetchNews();
    console.log(`获取到 ${rawNews.length} 条新闻`);
    
    if (rawNews.length === 0) {
      console.log('没有获取到新闻数据，使用默认数据');
      const defaultNews = [
        {
          id: `news_${Date.now()}_0`,
          title: "人工智能技术持续发展",
          summary: "AI技术在各个领域都有新的突破和应用",
          content: "人工智能技术正在快速发展，从机器学习到深度学习，从自然语言处理到计算机视觉，AI正在改变我们的生活方式。",
          imageUrl: "/placeholder.svg",
          source: "AI Tech News",
          publishedAt: new Date().toISOString(),
          category: "AI 模型",
          originalUrl: "#",
          aiInsight: "AI技术的快速发展将继续推动各行业的数字化转型，未来几年我们将看到更多创新应用的出现。"
        }
      ];
      
      // 保存默认新闻数据
      const publicDir = path.join(process.cwd(), 'public');
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir, { recursive: true });
      }
      
      const newsData = {
        success: true,
        data: defaultNews,
        timestamp: new Date().toISOString(),
        total: defaultNews.length
      };
      
      fs.writeFileSync(
        path.join(publicDir, 'news-data.json'),
        JSON.stringify(newsData, null, 2),
        'utf8'
      );
      
      console.log('已保存默认新闻数据到 public/news-data.json');
      return;
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
    
    // 保存新闻数据到public目录
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const newsData = {
      success: true,
      data: validNews,
      timestamp: new Date().toISOString(),
      total: validNews.length
    };
    
    fs.writeFileSync(
      path.join(publicDir, 'news-data.json'),
      JSON.stringify(newsData, null, 2),
      'utf8'
    );
    
    console.log('新闻数据已保存到 public/news-data.json');
    
  } catch (error) {
    console.error('获取新闻时出错:', error);
    process.exit(1);
  }
}

main();