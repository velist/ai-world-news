import fs from 'fs';
import path from 'path';
import { generateAISummary } from './ai-summary.js';

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
  
  // 计算48小时前的时间戳，确保能获取2天内的新闻
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const fromDate = twoDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD 格式
  
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
          // 过滤最近48小时的新闻
          const recentResults = data.results.filter(item => {
            const publishedDate = new Date(item.pubDate);
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            return publishedDate > twoDaysAgo && item.title && item.description;
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

    const prompt = `请根据以下新闻内容，将其准确分类为以下4个类别之一：中国AI、国际AI、科技新闻、AI趣味新闻

**严格的AI新闻分类规则**：

1. **中国AI类别**：专门报道中国AI公司、机构或个人的AI技术新闻，包括：
   - 中国AI企业（智谱、商汤、旷视、依图、云从、百度AI、阿里AI、腾讯AI、华为AI、科大讯飞等）
   - 中国AI模型（文心一言、通义千问、讯飞星火、DeepSeek、月之暗面、零一万物、百川智能等）
   - 中国AI研究成果、技术突破、产品发布
   - 中国AI政策、行业标准、人才培养

2. **国际AI类别**：专门报道国外AI公司、机构或个人的AI技术新闻，包括：
   - 国外AI企业（OpenAI、Google AI、Microsoft AI、Meta AI、Anthropic、Cohere等）
   - 国外AI模型（ChatGPT、GPT-4、Claude、Gemini、Llama、Mistral等）
   - 国外AI研究进展、技术突破、产品发布

3. **科技新闻类别**：报道AI技术基础设施、开发工具、应用场景的新闻，包括：
   - AI芯片、AI框架、开发工具、IDE、编程环境
   - AI技术在软件开发、编程辅助、代码生成中的应用
   - AI Agent、多模态技术、推理优化等技术层面内容

4. **AI趣味新闻类别**：报道AI在创意、娱乐、艺术等领域的趣味应用，包括：
   - AI绘画、AI写作、AI作曲、AI游戏、AI娱乐
   - AI创意作品、有趣应用、新奇体验

**需要排除的内容**：
- 股票、财经、投资、融资等商业新闻
- 政策、法规、政府等政治新闻
- 普通科技产品、手机、电脑等消费电子新闻
- 汽车、房地产、教育、医疗等非AI领域新闻

新闻标题：${title}
新闻内容：${content.substring(0, 800)}

请只回复一个类别名称：中国AI、国际AI、科技新闻 或 AI趣味新闻`;

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
      const validCategories = ['中国AI', '国际AI', '科技新闻', 'AI趣味新闻'];
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

    const prompt = `请根据以下新闻内容，将其准确分类为以下4个类别之一：中国AI、国际AI、科技新闻、AI趣味新闻

**严格的AI新闻分类规则**：

1. **中国AI类别**：专门报道中国AI公司、机构或个人的AI技术新闻，包括：
   - 中国AI企业（智谱、商汤、旷视、依图、云从、百度AI、阿里AI、腾讯AI、华为AI、科大讯飞等）
   - 中国AI模型（文心一言、通义千问、讯飞星火、DeepSeek、月之暗面、零一万物、百川智能等）
   - 中国AI研究成果、技术突破、产品发布
   - 中国AI政策、行业标准、人才培养

2. **国际AI类别**：专门报道国外AI公司、机构或个人的AI技术新闻，包括：
   - 国外AI企业（OpenAI、Google AI、Microsoft AI、Meta AI、Anthropic、Cohere等）
   - 国外AI模型（ChatGPT、GPT-4、Claude、Gemini、Llama、Mistral等）
   - 国外AI研究进展、技术突破、产品发布

3. **科技新闻类别**：报道AI技术基础设施、开发工具、应用场景的新闻，包括：
   - AI芯片、AI框架、开发工具、IDE、编程环境
   - AI技术在软件开发、编程辅助、代码生成中的应用
   - AI Agent、多模态技术、推理优化等技术层面内容

4. **AI趣味新闻类别**：报道AI在创意、娱乐、艺术等领域的趣味应用，包括：
   - AI绘画、AI写作、AI作曲、AI游戏、AI娱乐
   - AI创意作品、有趣应用、新奇体验

**需要排除的内容**：
- 股票、财经、投资、融资等商业新闻
- 政策、法规、政府等政治新闻
- 普通科技产品、手机、电脑等消费电子新闻
- 汽车、房地产、教育、医疗等非AI领域新闻

新闻标题：${title}
新闻内容：${content.substring(0, 800)}

请只回复一个类别名称：中国AI、国际AI、科技新闻 或 AI趣味新闻`;

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
      
      const validCategories = ['中国AI', '国际AI', '科技新闻', 'AI趣味新闻'];
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

// 传统关键词分类（备用方案）- 与RSS聚合器保持一致
function categorizeNewsTraditional(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 需要排除的内容（政治、经济、普通科技等）
  const excludeKeywords = [
    // 股票和财经相关
    '股票', '股市', '上证', '深证', '创业板', '科创板', '纳斯达克', '纽交所', '道琼斯',
    '股价', '市值', '涨停', '跌停', '财报', '收益', '盈利', '亏损', '财务报表',
    '投资', '融资', '募资', '轮融资', '估值', '收购', '兼并', '并购', 'IPO', '上市',
    '基金', '债券', '期货', '证券', '银行', '保险', '金融', '财经', '经济数据',
    '美联储', '央行', '利率', '通胀', 'GDP', '经济指标', '市场分析', '行业报告',
    '成本控制', '成本削减', '财务成本', '运营成本', '管理成本',
    '加密货币', '虚拟货币', '比特币', '以太坊', '数字货币', '稳定币', 'Stablecoin',
    '区块链', 'BlockChain', '代币', 'Token', '挖矿', 'Mining', '交易所', 'Exchange',
    'SEC', '证券交易委员会', '金融监管', '金融法规', '监管条例', '许可证', 'Licensing',
    
    // 政治相关（精确匹配，避免误伤AI技术新闻）
    '政府政策', '监管政策', '法规制定', '政府战略', '国家战略', '白宫', '总统', '国会', '议会',
    '选举投票', '选举结果', '投票法案', '法律制定', '法规条例', '官方规定', '部委行政', '行政机关',
    
    // 普通科技产品（非AI相关）
    '手机', '平板', '笔记本', '电脑', '显示器', '键盘', '鼠标', '耳机', '音响',
    '充电器', '电池', '内存', '硬盘', '处理器', '显卡', '主板', '路由器', '智能手表',
    '鸿蒙', 'HarmonyOS', 'Android', 'iOS', 'Windows', 'macOS', 'Linux', 'Ubuntu',
    'iPhone', 'iPad', 'MacBook', '三星', '小米', '华为手机', 'OPPO', 'vivo',
    
    // 汽车相关（非AI驾驶技术）
    '电动汽车', '新能源车', '充电桩', '电池技术', '汽车', '车辆', '传统汽车',
    '发动机', '变速箱', '底盘', '车身', '汽车制造', '汽车销售', '4S店',
    
    // 传统电子产品
    '电视', '冰箱', '空调', '洗衣机', '微波炉', '电饭煲', '智能家居',
    
    // 娱乐和生活方式
    '娱乐', '游戏', '体育', '音乐', '电影', '电视节目', '明星', '网红', '综艺',
    '美食', '旅游', '健身', '时尚', '购物', '电商', '快递', '物流', '外卖',
    
    // 其他非AI内容
    '房地产', '房价', '楼市', '教育', '学校', '大学', '医疗', '医院', '药品',
    '天气', '环境', '污染', '能源', '石油', '天然气', '电力', '煤炭'
  ];
  
  // 首先检查是否包含需要排除的关键词
  const hasExcluded = excludeKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasExcluded) {
    return null; // 排除非AI内容
  }
  
  // AI核心关键词 - 专注于AI技术和模型
  const aiCoreKeywords = [
    // 基础AI概念
    'AI', 'artificial intelligence', '人工智能', 'AGI', '通用人工智能',
    'machine learning', '机器学习', 'deep learning', '深度学习', 'neural network', '神经网络',
    
    // 大语言模型
    'LLM', 'large language model', '大语言模型', '大模型', '语言模型',
    'ChatGPT', 'GPT-4', 'GPT-3', 'Claude', 'Gemini', 'Llama', 'Mistral', 'Mixtral',
    
    // AI技术分支
    'natural language processing', 'NLP', '自然语言处理', 'computer vision', '计算机视觉',
    'reinforcement learning', '强化学习', 'generative AI', '生成式AI', 'AIGC',
    'speech recognition', '语音识别', 'image recognition', '图像识别', 'pattern recognition', '模式识别',
    
    // AI架构和算法
    'Transformer', 'BERT', 'ResNet', 'CNN', 'RNN', 'LSTM', 'GAN', '扩散模型', 'diffusion model',
    'attention mechanism', '注意力机制', 'backpropagation', '反向传播', 'gradient descent', '梯度下降',
    
    // AI应用领域
    'AI芯片', 'AI框架', 'AI平台', 'AI基础设施', 'AI系统', 'AI服务',
    'Agent', '智能体', 'AI agent', 'multi-agent', '多智能体', 'autonomous agent', '自主智能体',
    'multimodal', '多模态', 'multimodal AI', 'AI推理', 'AI训练', 'AI微调', 'AI预训练',
    'prompt engineering', '提示工程', 'fine-tuning', '微调', 'training', '训练', 'inference', '推理',
    
    // 专业AI应用
    'knowledge graph', '知识图谱', 'data science', '数据科学', 'algorithm', '算法',
    'autonomous driving', '自动驾驶', 'self-driving', '无人驾驶', 'intelligent driving', '智能驾驶',
    'robotics', '机器人', 'automation', '自动化', 'intelligent automation', '智能自动化'
  ];
  
  // AI模型和产品名称
  const aiModels = [
    // 国际模型
    'ChatGPT', 'GPT-4', 'GPT-3', 'Claude', 'Gemini', 'Llama', 'Mistral',
    'Midjourney', 'Stable Diffusion', 'DALL-E', 'Sora', 'o1', 'o3',
    
    // 中国模型
    '文心一言', '通义千问', '讯飞星火', '悟道', '紫东太初', '羲和', '混元', 
    '豆包', '天工', '商量', '日日新', 'SenseChat', 'GLM', '清言',
    'QWEN', '智谱', 'DeepSeek', '月之暗面', '零一万物', '百川智能', '阶跃星辰'
  ];
  
  // AI公司和研究机构（更加严格的定义）
  const aiCompanies = [
    // 纯AI公司
    'OpenAI', 'Anthropic', 'Cohere', 'Character.AI', 'Perplexity', 'Inflection',
    '智谱', '商汤', '旷视', '依图', '云从', 'Momenta', '地平线', '寒武纪', 
    'MiniMax', '月之暗面', '零一万物', '百川智能', '阶跃星辰', '生数科技',
    '面壁智能', '澜舟科技', '竹间智能', '思必驰', '云知声', '第四范式',
    '明略科技', '出门问问', '深鉴科技', '比特大陆', '比特大陆',
    
    // 大型科技公司的AI部门（需要配合AI关键词）
    'Google AI', 'Google DeepMind', 'Microsoft AI', 'Microsoft Research',
    'Meta AI', 'FAIR', 'Apple AI', 'Amazon AI', 'AWS AI', 'IBM Research',
    '百度AI', '阿里AI', '腾讯AI', '字节AI', '华为AI', '科大讯飞',
    
    // AI研究机构
    'DeepMind', 'OpenAI', '艾伦AI研究所', '斯坦福AI实验室', 'MIT CSAIL',
    '清华大学AI', '北京大学AI', '中科院自动化所', '中科院计算所'
  ];
  
  // AI技术和概念
  const aiTechnologies = [
    'IDE', '集成开发环境', '编程', '代码生成', '代码补全', '软件开发',
    '计算机编程', '程序设计', '软件工程', '开发工具', '开发环境',
    '自动化编程', '智能编程', 'AI编程', '代码助手', '编程助手'
  ];
  
  // 检查是否包含AI核心关键词
  const hasAICore = aiCoreKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 检查是否包含AI模型
  const hasAIModels = aiModels.some(model => 
    text.includes(model) || text.toLowerCase().includes(model.toLowerCase())
  );
  
  // 检查是否包含AI公司
  const hasAICompanies = aiCompanies.some(company => 
    text.includes(company) || text.toLowerCase().includes(company.toLowerCase())
  );
  
  // 检查是否包含AI技术
  const hasAITech = aiTechnologies.some(tech => 
    text.includes(tech) || text.toLowerCase().includes(tech.toLowerCase())
  );
  
  // 严格的AI内容验证逻辑
  const hasAIContent = hasAICore || hasAIModels;
  
  // 对于大型科技公司，必须同时包含AI关键词才通过
  const largeTechCompanies = ['Google', 'Microsoft', 'Meta', 'Apple', 'Amazon', 'Facebook', '百度', '阿里', '腾讯', '字节', '华为', '小米'];
  const hasLargeTechCompany = largeTechCompanies.some(company => 
    text.includes(company) || text.toLowerCase().includes(company.toLowerCase())
  );
  
  // 如果包含大型科技公司但没有AI内容，排除
  if (hasLargeTechCompany && !hasAIContent) {
    return null;
  }
  
  // 必须至少包含一种AI相关内容
  if (!hasAIContent && !hasAICompanies && !hasAITech) {
    return null; // 不是AI新闻
  }
  
  // 检查是否为AI趣味新闻 - 需要在国外AI检查之前
  const funAIKeywords = [
    '有趣', '好玩', '新奇', '神奇', '惊人', '震撼', '创意', '趣味',
    'AI绘画', 'AI写作', 'AI作曲', 'AI游戏', 'AI娱乐', 'AI聊天',
    'ChatGPT写诗', 'AI作画', 'AI生成图片', 'AI创作', 'AI设计', '比赛', '获奖',
    '娱乐', '创意', '艺术', '音乐', '诗歌', '小说', '故事'
  ];
  
  const isFunAI = funAIKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 首先检查是否为国外AI公司/产品 - 但排除趣味性内容
  const foreignAIKeywords = [
    // 美国AI公司
    'OpenAI', 'Google', 'Microsoft', 'Meta', 'Facebook', 'Apple', 'Amazon', 'Tesla',
    'NVIDIA', 'AMD', 'Intel', 'Anthropic', 'Cohere', 'Character.AI', 'Broadcom',
    'Palantir', 'Databricks', 'Snowflake', 'Salesforce', 'Oracle', 'IBM',
    // 国外AI产品和模型
    'ChatGPT', 'GPT-4', 'GPT-3', 'Claude', 'Gemini', 'Llama', 'Mistral',
    'Midjourney', 'Stable Diffusion', 'DALL-E', 'Sora', 'Copilot', 'Bard',
    // 其他国家AI公司
    'DeepMind', 'Stability AI', 'Hugging Face', 'Runway', 'Adept',
    // 明确的地理标识
    'Silicon Valley', 'San Francisco', 'Seattle', 'Austin', 'London', 'Europe'
  ];
  
  const isForeignAI = foreignAIKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 检查是否为中国AI相关
  const chineseAIKeywords = [
    '百度', '阿里', '腾讯', '字节', '华为', '智谱', '商汤', '旷视', '依图', '云从', 
    '科大讯飞', '文心一言', '通义千问', '讯飞星火', '悟道', '紫东太初', '羲和', '混元', 
    '豆包', '天工', '商量', '日日新', 'SenseChat', 'GLM', '清言', 'QWEN', 'DeepSeek',
    '月之暗面', '零一万物', '百川智能', '阶跃星辰', 'Minimax', 'MiniMax',
    '中科院', '清华大学', '北京大学', '浙江大学', '上海交通大学', 
    '复旦大学', '南京大学', '中国科学技术大学', '哈尔滨工业大学', '西安交通大学',
    '中国AI', '国产AI', '中文AI', '华人AI团队', '国内大模型', '本土AI', '自主AI',
    // 新增更多中国AI公司和产品
    '小米', '京东', '美团', '滴滴', '网易', '新浪', '搜狐', '携程', '快手', 'vivo', 'OPPO',
    '蚂蚁集团', '蚂蚁金服', '支付宝', '钉钉', '飞书', '企业微信',
    '昆仑万维', '面壁智能', '生数科技', '出门问问', '思必驰', '云知声',
    '第四范式', '明略科技', '澜舟科技', '竹间智能', '小冰公司', '微软小冰',
    '中文版', '中国版', '国内版', '中文模型', '国产模型', '自研模型',
    'WAIC', '世界人工智能大会', '中国人工智能学会', 'CAAI'
  ];
  
  const isChineseAI = chineseAIKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 检查是否为科技新闻（AI技术相关但不是纯模型新闻）
  const techKeywords = [
    'AI芯片', 'AI框架', 'IDE', '编程', '代码', '软件开发', '开发工具',
    'AI技术', 'AI应用', 'AI系统', 'AI平台', 'AI基础设施', 'Agent', '智能体'
  ];
  
  const isTechNews = techKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 严格的分类逻辑 - 确保AI内容纯净度
  // 1. 首先检查是否为AI趣味新闻（需要明确包含趣味关键词）
  if (isFunAI && (hasAICore || hasAIModels)) {
    return 'AI趣味新闻';
  }
  
  // 2. 判断是否为中国AI（需要明确的中国AI标识）
  if (isChineseAI && (hasAICore || hasAIModels)) {
    return '中国AI';
  }
  
  // 3. 判断是否为国际AI（需要明确的国外AI标识）
  if (isForeignAI && (hasAICore || hasAIModels)) {
    return '国际AI';
  }
  
  // 4. 判断是否为科技新闻（AI技术相关但不是纯模型新闻）
  if (isTechNews && (hasAICore || hasAIModels)) {
    return '科技新闻';
  }
  
  // 5. 如果没有任何明确分类但有AI内容，默认分类为国际AI
  if (hasAIContent) {
    return '国际AI';
  }
  
  // 6. 如果都不符合，排除该新闻
  return null;
}

// 验证和处理图片URL（优化版，减少不必要的替换）
async function validateAndProcessImage(imageUrl, title = '') {
  if (!imageUrl || imageUrl === '/placeholder.svg') {
    return generateFallbackImage(title);
  }
  
  // 检查URL格式是否有效
  try {
    const url = new URL(imageUrl);
    
    // 优化的图片验证逻辑 - 更加宽松
    // 1. 首先检查是否是明显的非图片URL（如html、php、aspx等）
    const nonImageExtensions = ['.html', '.htm', '.php', '.aspx', '.jsp', '.cgi', '.css', '.js'];
    const hasNonImageExtension = nonImageExtensions.some(ext => 
      url.pathname.toLowerCase().includes(ext)
    );
    
    if (hasNonImageExtension) {
      console.log(`图片URL可能是网页: ${imageUrl}, 使用备用图片`);
      return generateFallbackImage(title);
    }
    
    // 2. 检查是否来自可信的图片服务或新闻网站
    const trustedDomains = [
      'images.unsplash.com', 'cdn.', 'img.', 'static.', 'media.', 'image.',
      'ithome.com', '36kr.com', 'tmtpost.com', 'infoq.cn', 'jiqizhixin.com',
      'unsplash.com', 'pexels.com', 'gettyimages.com', 'baidu.com', 'qq.com',
      'sina.com.cn', 'sohu.com', '163.com', 'toutiao.com', 'ifeng.com',
      'githubusercontent.com', 'raw.githubusercontent.com'
    ];
    
    const isFromTrustedDomain = trustedDomains.some(domain => 
      url.hostname.includes(domain)
    );
    
    // 3. 检查是否是常见的图片扩展名
    const validImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg', '.avif'];
    const hasValidExtension = validImageExtensions.some(ext => 
      url.pathname.toLowerCase().includes(ext)
    );
    
    // 4. 检查路径中是否包含图片相关关键词
    const imageKeywords = ['image', 'img', 'picture', 'photo', 'upload', 'file', 'avatar', 'thumbnail', 'banner'];
    const hasImageKeywords = imageKeywords.some(keyword => 
      url.pathname.toLowerCase().includes(keyword)
    );
    
    // 5. 检查URL参数中是否包含图片尺寸
    const hasImageSize = url.searchParams.has('w') || url.searchParams.has('h') || 
                       url.searchParams.has('width') || url.searchParams.has('height');
    
    // 6. 检查URL中是否包含图片处理服务
    const hasImageProcessing = url.pathname.includes('resize') || url.pathname.includes('crop') ||
                               url.pathname.includes('format') || url.pathname.includes('quality');
    
    // 更加宽松的验证规则 - 只要满足以下条件之一就认为是有效图片
    const isValidImage = isFromTrustedDomain || 
                        hasValidExtension || 
                        hasImageKeywords || 
                        hasImageSize || 
                        hasImageProcessing;
    
    if (isValidImage) {
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

// 生成备用图片（优化版）
function generateFallbackImage(title = '') {
  // 根据标题内容生成不同的备用图片
  const titleLower = title.toLowerCase();
  
  // AI相关图片
  if (titleLower.includes('ai') || titleLower.includes('artificial intelligence') || 
      titleLower.includes('machine learning') || titleLower.includes('chatgpt') || 
      titleLower.includes('openai') || titleLower.includes('claude') || titleLower.includes('人工智能') ||
      titleLower.includes('大模型') || titleLower.includes('llm') || titleLower.includes('深度学习')) {
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format';
  }
  
  // 机器人和自动化
  if (titleLower.includes('robot') || titleLower.includes('automation') || 
      titleLower.includes('机器人') || titleLower.includes('自动化') ||
      titleLower.includes('自动驾驶') || titleLower.includes('self-driving')) {
    return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&auto=format';
  }
  
  // 科技和技术
  if (titleLower.includes('tech') || titleLower.includes('computer') || 
      titleLower.includes('software') || titleLower.includes('app') || 
      titleLower.includes('科技') || titleLower.includes('技术') ||
      titleLower.includes('芯片') || titleLower.includes('gpu') || titleLower.includes('处理器')) {
    return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format';
  }
  
  // 数据和代码
  if (titleLower.includes('data') || titleLower.includes('code') || 
      titleLower.includes('programming') || titleLower.includes('开发') ||
      titleLower.includes('数据') || titleLower.includes('代码') || titleLower.includes('编程')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format';
  }
  
  // 神经网络和算法
  if (titleLower.includes('neural') || titleLower.includes('network') || 
      titleLower.includes('algorithm') || titleLower.includes('算法') ||
      titleLower.includes('神经网络') || titleLower.includes('transformer')) {
    return 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=600&fit=crop&auto=format';
  }
  
  // 云计算和服务器
  if (titleLower.includes('cloud') || titleLower.includes('server') || 
      titleLower.includes('云') || titleLower.includes('服务器') ||
      titleLower.includes('计算') || titleLower.includes('infrastructure')) {
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&auto=format';
  }
  
  // 编程和开发
  if (titleLower.includes('编程') || titleLower.includes('development') || 
      titleLower.includes('software') || titleLower.includes('ide') ||
      titleLower.includes('framework') || titleLower.includes('library')) {
    return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format';
  }
  
  // 默认AI新闻图片
  return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format';
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
    return aiCategory;
  }
  
  // 如果智谱清言失败，尝试火山方舟
  const volcCategory = await categorizeNewsWithVolcEngine(title, content);
  if (volcCategory && volcCategory !== 'error') {
    return volcCategory;
  }
  
  // 最后使用传统关键词分类
  const traditionalCategory = categorizeNewsTraditional(title, content);
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
    
    // 过滤低质量摘要新闻
    const filteredNews = rawNews.filter(item => {
      // 需要排除的新闻源（低质量摘要）
      const excludeSources = ['BizToc', 'biztoc'];
      
      // 需要排除的标题特征（摘要类新闻）
      const excludeTitlePatterns = [
        /特斯拉为何向埃隆·马斯克授予.*美元的股票？/,
        /欧佩克\+增加石油产量将如何影响/,
        /为什么现在有数千名波音工人/,
        /特朗普对印度的新关税将产生什么影响/,
        /美联储就业报告为何导致/,
        /亚马逊为何关闭其Wondery播客工作室/,
        /人工智能如何改变航空公司票价策略/,
        /.*\？.*\？.*\？.*\？/ // 包含多个问号的摘要标题
      ];
      
      // 检查新闻源是否需要排除
      const isExcludedSource = excludeSources.some(source => 
        (item.source?.name && item.source.name.toLowerCase().includes(source.toLowerCase()))
      );
      
      if (isExcludedSource) {
        console.log(`❌ 排除低质量摘要新闻源: ${item.source?.name} - ${item.title.substring(0, 50)}...`);
        return false;
      }
      
      // 检查标题是否为摘要类新闻
      const isExcludedTitle = excludeTitlePatterns.some(pattern => 
        pattern.test(item.title)
      );
      
      if (isExcludedTitle) {
        console.log(`❌ 排除摘要类标题: ${item.title.substring(0, 50)}...`);
        return false;
      }
      
      return true;
    });
    
    console.log(`过滤后剩余 ${filteredNews.length} 条新闻（原始 ${rawNews.length} 条）`);
    
    // 处理每条新闻
    const processedNews = await Promise.all(
      filteredNews.map(async (item, index) => {
        try {
          // 翻译标题和摘要
          const translatedTitle = await translateText(item.title);
          const translatedSummary = await translateText(item.description || item.title);
          const translatedContent = item.content ? await translateText(item.content) : translatedSummary;
          
          // 使用AI生成高质量摘要
          console.log(`正在为新闻生成AI摘要: ${translatedTitle}`);
          const aiSummary = await generateAISummary(translatedTitle, item.url, translatedContent);
          
          // 生成AI点评
          const aiInsight = await generateAIInsight(translatedTitle, translatedContent);
          
          // 验证和处理图片
          const validImageUrl = await validateAndProcessImage(item.urlToImage, translatedTitle);
          
          return {
            id: `news_${Date.now()}_${index}`,
            title: translatedTitle,
            summary: aiSummary || translatedSummary, // 优先使用AI生成的摘要
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
    
    // 过滤掉处理失败的新闻和非AI新闻
    const validNews = processedNews.filter(item => item !== null && item.category !== null);
    console.log(`成功处理 ${validNews.length} 条AI新闻`);
    
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