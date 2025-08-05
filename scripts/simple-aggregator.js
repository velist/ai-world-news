console.log('开始聚合AI新闻...');

import Parser from 'rss-parser';
import crypto from 'crypto';
import { generateAISummary } from './ai-summary.js';
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
  },
];

// AI核心关键词 - 专注于AI技术和模型
const AI_CORE_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '神经网络',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别', '模式识别',
  '知识图谱', '智能驾驶', '自动驾驶', '无人驾驶', 'AI芯片', 'AI框架',
  'Transformer', 'BERT', 'ResNet', 'CNN', 'RNN', 'LSTM', 'GAN', '扩散模型',
  'Agent', '智能体', '多模态', '推理', '训练', '微调', '预训练'
];

// AI模型和产品名称
const AI_MODELS = [
  // 国际模型
  'ChatGPT', 'GPT-4', 'GPT-3', 'Claude', 'Gemini', 'Llama', 'Mistral',
  'Midjourney', 'Stable Diffusion', 'DALL-E', 'Sora', 'o1', 'o3',
  
  // 中国模型
  '文心一言', '通义千问', '讯飞星火', '悟道', '紫东太初', '羲和', '混元', 
  '豆包', '天工', '商量', '日日新', 'SenseChat', 'GLM', '清言',
  'QWEN', '智谱', 'DeepSeek', '月之暗面', '零一万物', '百川智能', '阶跃星辰'
];

// AI公司和研究机构
const AI_COMPANIES = [
  // 国际公司
  'OpenAI', 'Google', 'Microsoft', 'Meta', 'Facebook', 'Apple', 'Amazon',
  'NVIDIA', 'AMD', 'Intel', 'Anthropic', 'Cohere', 'Character.AI',
  
  // 中国公司
  '百度', '阿里', '腾讯', '字节', '华为', '智谱', '商汤', '旷视', '依图', '云从', 
  '科大讯飞', '360', '猎豹', '寒武纪', '地平线', 'Momenta', 'Minimax'
];

// AI技术和概念
const AI_TECHNOLOGIES = [
  'IDE', '集成开发环境', '编程', '代码生成', '代码补全', '软件开发',
  '计算机编程', '程序设计', '软件工程', '开发工具', '开发环境',
  '自动化编程', '智能编程', 'AI编程', '代码助手', '编程助手'
];

// 需要排除的内容（政治、经济、普通科技等）
const EXCLUDE_KEYWORDS = [
  // 政治相关
  '政策', '监管', '法规', '政府', '国家战略', '白宫', '总统',
  
  // 经济相关
  '市场份额', '销量', '营收', '利润', '融资', '上市', '股价', '市值',
  '投资', '募资', '轮融资', '估值', '收购', '兼并',
  
  // 普通科技产品 (但不影响AI新闻)
  '平板', '笔记本', '电脑', '显示器', '键盘', '鼠标', '耳机',
  '充电器', '电池', '内存', '硬盘', '处理器', '显卡', '主板',
  'Android', 'iOS', 'Windows', 'macOS',
  
  // 汽车相关 (但不影响AI自动驾驶新闻)
  '电动汽车', '新能源车', '充电桩', '电池技术', '汽车', '车辆',
  '手车互联',
  
  // 其他不需要的内容
  '娱乐', '游戏', '体育', '音乐', '电影', '电视', '明星', '网红'
];

// 使用智谱清言API进行AI判断
async function isAINewsWithAI(title, content) {
  const text = `标题：${title}\n内容：${content || ''}`;
  
  try {
    const zhipuAIKey = process.env.ZHIPUAI_API_KEY;
    if (!zhipuAIKey) {
      // 如果没有智谱清言API密钥，使用传统方法
      return isAINewsTraditional(title, content);
    }
    
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zhipuAIKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的AI新闻内容审核专家。请判断以下新闻内容是否与人工智能（AI）相关。如果是AI相关新闻，请只回复"true"；如果不是AI相关新闻，请只回复"false"。注意：只判断是否与AI技术、AI应用、AI研究、AI产业等相关，不要包括普通的科技新闻、数码产品新闻、商业新闻等。'
          },
          {
            role: 'user',
            content: text
          }
        ],
        max_tokens: 10,
        temperature: 0.1
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const result = data.choices[0]?.message?.content?.trim().toLowerCase();
      return result === 'true';
    } else {
      console.error('智谱清言API调用失败:', response.status, response.statusText);
      return isAINewsTraditional(title, content);
    }
  } catch (error) {
    console.error('AI判断错误:', error);
    return isAINewsTraditional(title, content);
  }
}

// 传统关键词匹配方法（作为备用）
function isAINewsTraditional(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 首先检查是否包含需要排除的关键词
  const hasExcluded = EXCLUDE_KEYWORDS.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  if (hasExcluded) {
    return false;
  }
  
  // 检查是否包含AI核心关键词
  const hasAICore = AI_CORE_KEYWORDS.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 检查是否包含AI模型
  const hasAIModels = AI_MODELS.some(model => 
    text.includes(model) || text.toLowerCase().includes(model.toLowerCase())
  );
  
  // 检查是否包含AI公司
  const hasAICompanies = AI_COMPANIES.some(company => 
    text.includes(company) || text.toLowerCase().includes(company.toLowerCase())
  );
  
  // 检查是否包含AI技术
  const hasAITech = AI_TECHNOLOGIES.some(tech => 
    text.includes(tech) || text.toLowerCase().includes(tech.toLowerCase())
  );
  
  // 必须至少包含一种AI相关内容
  return hasAICore || hasAIModels || hasAICompanies || hasAITech;
}

// 判断是否为AI新闻（主函数）
async function isAINews(title, content) {
  return await isAINewsWithAI(title, content);
}

// 判断新闻类别
async function getNewsCategory(title, content) {
  const isAI = await isAINews(title, content);
  if (!isAI) {
    return null; // 不是AI新闻，不包含在系统中
  }
  
  const text = (title + ' ' + (content || '')).toLowerCase();
  
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
  
  // 检查是否为AI趣味新闻
  const funAIKeywords = [
    '有趣', '好玩', '新奇', '神奇', '惊人', '震撼', '创意', '趣味',
    'AI绘画', 'AI写作', 'AI作曲', 'AI游戏', 'AI娱乐', 'AI聊天',
    'ChatGPT写诗', 'AI作画', 'AI生成图片', 'AI创作', 'AI设计'
  ];
  
  const isFunAI = funAIKeywords.some(keyword => 
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
  
  // 分类逻辑 - 优先级调整
  if (isChineseAI) {
    return '国内AI';
  }
  
  if (isFunAI) {
    return 'AI趣味新闻';
  }
  
  if (isTechNews) {
    return '科技新闻';
  }
  
  return '国外AI';
}

// 清理内容
function cleanContent(content) {
  if (!content) return '';
  
  // 移除HTML标签
  let cleaned = content.replace(/<[^>]*>/g, '');
  
  // 移除多余的空白字符
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  
  // 如果内容是"点击查看原文>"或其他无用信息，返回空字符串
  if (cleaned === '点击查看原文>' || cleaned.length < 10) {
    return '';
  }
  
  return cleaned;
}

// 标准化日期格式
function standardizeDate(dateString) {
  if (!dateString) return new Date().toISOString();
  
  try {
    const date = new Date(dateString);
    // 检查日期是否有效
    if (isNaN(date.getTime())) {
      return new Date().toISOString();
    }
    // 统一返回ISO 8601格式
    return date.toISOString();
  } catch (error) {
    console.error('日期解析错误:', error);
    return new Date().toISOString();
  }
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
  const imgMatch = (item.content || '').match(/<img[^>]+src=\"([^\">]+)\"/);
  if (imgMatch) return imgMatch[1];
  
  if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
    return item.enclosure.url;
  }
  
  return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop';
}

// 生成AI洞察
async function generateAIInsight(title, content) {
  try {
    const siliconflowKey = process.env.SILICONFLOW_API_KEY;
    if (!siliconflowKey) {
      // 如果没有API密钥，使用简化的关键词匹配
      return generateSimpleInsight(title, content);
    }
    
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
      return data.choices[0]?.message?.content || generateSimpleInsight(title, content);
    } else {
      return generateSimpleInsight(title, content);
    }
  } catch (error) {
    console.error('AI insight generation error:', error);
    return generateSimpleInsight(title, content);
  }
}

// 改进的AI洞察生成（备用方案）
function generateSimpleInsight(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 基于关键词的智能分析
  let insight = '';
  let techAspect = '';
  let industryImpact = '';
  let futureTrend = '';
  
  // 技术发展分析
  if (text.includes('chatgpt') || text.includes('gpt')) {
    techAspect = 'ChatGPT技术的发展展示了大语言模型在自然语言理解和生成方面的突破性进展';
    industryImpact = '这将推动AI在内容创作、客户服务、教育等多个行业的广泛应用';
    futureTrend = '未来ChatGPT类产品将更加智能化，能够处理更复杂的多模态任务';
  } else if (text.includes('大模型') || text.includes('llm')) {
    techAspect = '大语言模型技术的进步标志着AI理解和生成能力的显著提升';
    industryImpact = '这对知识工作、创意产业和智能助手市场将产生深远影响';
    futureTrend = '预计未来大模型将向更高效、更专业化的方向发展';
  } else if (text.includes('芯片') || text.includes('半导体') || text.includes('nvidia')) {
    techAspect = 'AI芯片技术的发展直接影响着AI计算能力和效率的提升';
    industryImpact = '这将加速AI在数据中心、边缘计算和消费电子领域的部署';
    futureTrend = '未来AI芯片将更加注重能效比和专用化设计';
  } else if (text.includes('自动驾驶') || text.includes('智能驾驶')) {
    techAspect = '自动驾驶技术融合了计算机视觉、深度学习和传感器技术';
    industryImpact = '这将革命性地改变交通运输行业和城市规划模式';
    futureTrend = '未来自动驾驶将向更高级别的无人驾驶和智慧交通发展';
  } else if (text.includes('机器人') || text.includes('智能体') || text.includes('agent')) {
    techAspect = '智能机器人和Agent技术结合了AI决策、运动控制和环境感知能力';
    industryImpact = '这将在制造业、服务业和家庭生活中创造新的应用场景';
    futureTrend = '未来机器人将更加智能化、人性化，能够承担更复杂的任务';
  } else if (text.includes('编程') || text.includes('代码') || text.includes('ide') || text.includes('开发')) {
    techAspect = 'AI编程助手技术展现了代码理解、生成和优化的强大能力';
    industryImpact = '这将显著提升软件开发效率，降低编程门槛';
    futureTrend = '未来AI将更深度参与软件开发全流程，推动编程范式变革';
  } else if (text.includes('百度') || text.includes('阿里') || text.includes('腾讯') || text.includes('华为')) {
    techAspect = '中国科技巨头在AI领域的布局体现了技术自主创新的重要性';
    industryImpact = '这将推动中国AI产业的快速发展和国际竞争力提升';
    futureTrend = '未来中国AI企业将在全球AI生态系统中发挥更重要作用';
  } else if (text.includes('openai') || text.includes('google') || text.includes('microsoft') || text.includes('meta') || text.includes('facebook') || text.includes('apple') || text.includes('amazon') || text.includes('nvidia') || text.includes('anthropic')) {
    techAspect = '国际AI巨头的技术突破引领着全球AI发展方向';
    industryImpact = '这将影响全球AI产业格局和技术标准制定';
    futureTrend = '未来国际AI竞争将更加激烈，技术创新速度将持续加快';
  } else {
    techAspect = '该技术发展体现了AI在特定领域的应用创新';
    industryImpact = '这将为相关行业带来新的机遇和挑战';
    futureTrend = '未来AI技术将更加成熟，应用场景将不断扩展';
  }
  
  // 构建综合分析
  insight = `从技术发展角度看，${techAspect}。从行业影响来看，${industryImpact}。未来趋势方面，${futureTrend}。这一发展对于推动AI技术进步和产业应用具有重要意义。`;
  
  return insight;
}

// 处理单个新闻项
async function processNewsItem(item, source) {
  const content = cleanContent(item.contentSnippet || item.content || '');
  
  // 检查内容质量
  if (!isHighQualityContent(item.title, content, source)) {
    return null;
  }
  
  // 如果内容为空，尝试从其他字段获取
  let summary = content;
  let finalContent = content;
  if (!summary) {
    // 尝试从标题生成简单摘要
    summary = item.title || '无标题';
    // 如果没有内容，使用标题作为内容
    finalContent = item.title || '无标题';
  }
  
  const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  
  const category = await getNewsCategory(item.title, item.content);
  
  // 如果不是AI相关新闻，则跳过
  if (!category) {
    return null;
  }
  
  // 使用AI生成高质量摘要
  console.log(`正在为新闻生成AI摘要: ${item.title}`);
  const aiSummary = await generateAISummary(item.title, item.link, finalContent);
  
  // 生成AI点评
  const aiInsight = await generateAIInsight(item.title, finalContent);
  
  return {
    id: generateId(item.title, item.pubDate),
    title: item.title || '无标题',
    summary: aiSummary || truncatedSummary, // 优先使用AI生成的摘要
    content: finalContent,
    imageUrl: extractImageUrl(item),
    source: source.name,
    publishedAt: standardizeDate(item.pubDate),
    category: category,
    originalUrl: item.link,
    aiInsight: aiInsight
  };
}

// 检查内容质量
function isHighQualityContent(title, content, source) {
  // 检查标题质量
  if (!title || title.length < 5) {
    return false;
  }
  
  // 检查内容质量 - 但如果标题足够详细，允许内容为空
  if (!content || content.trim().length < 20) {
    // 如果标题包含足够的信息（超过15个字符且包含AI关键词），允许通过
    if (title.length > 15) {
      const aiKeywords = ['AI', '人工智能', '大模型', 'ChatGPT', 'GPT', '混元', '文心一言', '通义千问', 
                         '智谱', 'Agent', '智能体', '开源', '模型', 'LLM', 'DeepSeek', '月之暗面'];
      const hasAIKeyword = aiKeywords.some(keyword => 
        title.toLowerCase().includes(keyword.toLowerCase())
      );
      if (hasAIKeyword) {
        console.log(`标题包含AI关键词，允许通过: ${title}`);
        return true;
      }
    }
    return false;
  }
  
  // 排除无意义的标题模式
  const meaninglessPatterns = [
    /^让.*/,
    /^爱的.*/,
    /^所有的.*/,
    /^具身智能.*/, // 很多无内容的视频标题
    /^刚刚.*/,
    /^今日.*/,
    /^最新.*/,
  ];
  
  if (meaninglessPatterns.some(pattern => pattern.test(title))) {
    return false;
  }
  
  // 排除特定来源的无内容新闻
  const excludeSources = ['InfoQ中文'];
  if (excludeSources.includes(source.name) && content.trim().length < 50) {
    return false;
  }
  
  return true;
}

// 主函数
async function main() {
  console.log('开始聚合RSS AI新闻...');
  
  const allNews = [];
  const seenTitles = new Set();
  
  // 读取现有的新闻数据
  const fs = await import('fs').then(m => m.promises);
  let existingNews = [];
  
  try {
    const existingData = await fs.readFile('public/news-data.json', 'utf8');
    const parsedData = JSON.parse(existingData);
    if (parsedData.success && parsedData.data) {
      existingNews = parsedData.data;
      console.log(`读取到 ${existingNews.length} 条现有新闻，将重新分类处理`);
      
      // 重新处理现有新闻的分类
      for (const item of existingNews) {
        const newCategory = await getNewsCategory(item.title, item.content);
        
        // 如果不是AI相关新闻，则跳过
        if (!newCategory) {
          continue;
        }
        
        // 更新分类
        item.category = newCategory;
        
        // 添加到去重集合
        const titleKey = item.title.toLowerCase().trim();
        seenTitles.add(titleKey);
      }
      
      // 添加重新分类的现有新闻到总列表
      allNews.push(...existingNews);
    }
  } catch (error) {
    console.log('没有找到现有新闻数据，将创建新的数据文件');
  }
  
  // 获取RSS新闻
  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在爬取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      // 过滤AI新闻并处理
      const newsItems = [];
      for (const item of feed.items.slice(0, 15)) {
        try {
          const processedItem = await processNewsItem(item, source);
          if (processedItem) {
            newsItems.push(processedItem);
          }
        } catch (error) {
          console.error(`处理新闻项失败: ${item.title}`, error.message);
        }
      }
      
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
  
  // 重新标准化所有新闻的时间戳
  const finalNews = allNews.map(item => ({
    ...item,
    publishedAt: standardizeDate(item.publishedAt)
  }));
  
  finalNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  const data = {
    success: true,
    timestamp: new Date().toISOString(),
    total: finalNews.length,
    data: finalNews
  };
  
  // 保存文件
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

// 测试分类逻辑
async function testClassification() {
  console.log('=== 分类测试 ===');
  
  // 测试用例
  const testCases = [
    {
      title: '比亚迪方程豹豹 5 天神版、钛 3 全系车型 OTA 升级推送：泊车辅助进化、智能座舱升级',
      content: 'IT之家 8 月 4 日消息，据比亚迪集团-方程豹事业部总经理熊甜波分享，方程豹豹 5 天神版、钛 3 全系车型开启 OTA 推送，新版本泊车辅助进化、智能座舱升级，同时有多项功能新增及优化。',
      expected: null
    },
    {
      title: '华为 nova Flip 小折叠手机获鸿蒙 HarmonyOS 5.1 版本升级：界面焕新、互联能力升级等',
      content: '华为 nova Flip 小折叠手机的鸿蒙 HarmonyOS 5.1 版本今日开始分批推送给花粉 Beta 版尝鲜报名入选成功的用户，新版本采用全新系统架构，带来智能、流畅、安全、便捷的全场景智能体验。',
      expected: null
    },
    {
      title: '华为发布全新AI大模型：基于HarmonyOS生态，支持手机端侧推理',
      content: '华为今日发布全新AI大模型，基于HarmonyOS生态系统，支持手机端侧推理，在自然语言处理方面有重大突破，标志着中国在AI技术领域的又一重要进展。',
      expected: '国内AI'
    },
    {
      title: '豆包大模型升级：支持200K上下文，性能超越GPT-4',
      content: '字节跳动旗下的豆包大模型今日发布重大升级，新版本支持200K长上下文，在多项基准测试中性能超越GPT-4，标志着中国AI技术的重要突破。',
      expected: '国内AI'
    },
    {
      title: '智谱AI发布新一代GLM-4大模型：多项性能指标领先',
      content: '智谱AI今日正式发布GLM-4大模型，在自然语言理解、逻辑推理、代码生成等方面均有显著提升，成为中国AI领域的又一重要成果。',
      expected: '国内AI'
    },
    {
      title: 'OpenAI发布GPT-5：性能大幅提升，支持多模态输入',
      content: 'OpenAI今日宣布发布GPT-5模型，在推理能力、多模态理解、创造性思维等方面都有重大突破，再次引领全球AI技术发展。',
      expected: '国外AI'
    },
    {
      title: '荣耀 6 月香港市场份额 20.2% 破历史新高，首超苹果进入 TOP2',
      content: '荣耀终端股份有限公司销售与服务总裁王班今日分享"战报"：荣耀 6 月香港市场份额 20.2% 突破历史新高，首次超越苹果进入市场份额 TOP2。',
      expected: null
    },
    {
      title: 'VS Code推出AI编程助手：支持代码生成和调试',
      content: '微软宣布为VS Code推出全新的AI编程助手，支持代码生成、智能调试、代码优化等功能，大大提升开发效率。',
      expected: '科技新闻'
    },
    {
      title: 'AI绘画工具Midjourney推出新功能：可以生成更真实的艺术作品',
      content: 'Midjourney今日发布更新，其AI绘画工具现在可以生成更加真实和细腻的艺术作品，为创意工作者提供更多可能性。',
      expected: 'AI趣味新闻'
    }
  ];
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    const actualCategory = await getNewsCategory(testCase.title, testCase.content);
    
    console.log(`测试用例 ${i + 1}:`);
    console.log(`  标题: ${testCase.title.substring(0, 60)}...`);
    console.log(`  实际分类: ${actualCategory}`);
    console.log(`  期望分类: ${testCase.expected}`);
    console.log(`  结果: ${actualCategory === testCase.expected ? '✅ 通过' : '❌ 失败'}`);
    console.log('');
  }
}

// 运行
main().then(() => {
  console.log('\n=== 运行分类测试 ===');
  testClassification();
}).catch(console.error);