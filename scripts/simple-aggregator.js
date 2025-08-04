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
  },
  ];

// AI关键词
const AI_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '智能',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别',
  '文心一言', '通义千问', '讯飞星火', '智谱', '商汤', '旷视', '依图', '云从', '科大讯飞'
];

// 判断是否为AI新闻
function isAINews(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 检查是否包含AI关键词
  const hasAIKeywords = AI_KEYWORDS.some(keyword => 
    text.toLowerCase().includes(keyword.toLowerCase()) ||
    text.includes(keyword)
  );
  
  if (!hasAIKeywords) {
    return false;
  }
  
  // 检查是否为汽车OTA升级新闻（这些通常不属于真正的AI新闻）
  const carBrands = ['比亚迪', '方程豹', '特斯拉', '蔚来', '小鹏', '理想', '奔驰', '宝马', '奥迪', '大众', '丰田', '本田'];
  const isCarBrand = carBrands.some(brand => 
    text.includes(brand) || text.toLowerCase().includes(brand.toLowerCase())
  );
  
  const carTechKeywords = ['OTA升级', '泊车辅助', '智能座舱', '手车互联', '升级推送'];
  const isCarTech = carTechKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 如果是汽车品牌的技术升级新闻，且不包含真正的AI技术创新，则不认为是AI新闻
  if (isCarBrand && isCarTech) {
    // 检查是否包含真正的AI技术创新关键词
    const realAIKeywords = ['大模型', '算法', '机器学习', '深度学习', '神经网络', '自然语言处理', '计算机视觉', '强化学习', '生成式AI', '文心一言', '通义千问', '讯飞星火', '智谱AI', '商汤AI', '旷视AI', '依图AI', '云从AI', '科大讯飞'];
    const hasRealAI = realAIKeywords.some(keyword => 
      text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return hasRealAI;
  }
  
  return true;
}

// 判断是否为国内AI新闻
function isDomesticAINews(title, content, source) {
  if (!isAINews(title, content)) return false;
  
  // 核心AI公司（专注于AI技术的公司）
  const coreAICompanies = ['百度', '阿里', '腾讯', '字节', '华为', '智谱', '商汤', '旷视', '依图', '云从', '科大讯飞', '360', '猎豹', '寒武纪', '地平线', 'Momenta', '小马智行', '文远知行', 'AutoX', '元戎启行', '轻舟智航', '智加科技', '图森未来'];
  
  // AI产品和服务
  const aiProducts = ['文心一言', '通义千问', '讯飞星火', '悟道', '紫东太初', '羲和', '混元', 'GLM', 'Claude中文版', '豆包', '天工', '商量', '日日新', 'SenseChat', '绝影', '若琪', '小冰', '小度', '天猫精灵', '小爱同学', '华为小艺', 'OPPO小布', 'vivo小V'];
  
  // AI相关关键词
  const aiKeywords = ['中国AI', '国产AI', '中文AI', '华人AI团队', 'AI大模型', 'AI芯片', 'AI算法', 'AI框架', 'AI平台', 'AI服务', 'AI解决方案', 'AI研究', 'AI技术', 'AI创新', 'AI突破', 'AI进展'];
  
  // 科研机构
  const researchInstitutions = ['中科院', '清华大学', '北京大学', '浙江大学', '上海交通大学', '复旦大学', '南京大学', '中国科学技术大学', '哈尔滨工业大学', '西安交通大学'];
  
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 检查是否为核心AI公司
  const hasCoreAICompany = coreAICompanies.some(company => 
    text.includes(company) || text.toLowerCase().includes(company.toLowerCase())
  );
  
  // 检查是否为AI产品
  const hasAIProduct = aiProducts.some(product => 
    text.includes(product) || text.toLowerCase().includes(product.toLowerCase())
  );
  
  // 检查是否包含AI关键词
  const hasAIKeywords = aiKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 检查是否包含科研机构
  const hasResearchInstitution = researchInstitutions.some(institution => 
    text.includes(institution) || text.toLowerCase().includes(institution.toLowerCase())
  );
  
  // 排除汽车OTA升级等非核心AI新闻
  const carTechKeywords = ['OTA升级', '泊车辅助', '智能座舱', '手车互联', '无人驾驶版', '无人机版', '方程豹', '豹'];
  const isCarTech = carTechKeywords.some(keyword => 
    text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
  );
  
  // 检查是否为汽车OTA升级新闻（主要包含功能更新而非AI技术创新）
  const isOTAUpdate = text.includes('OTA升级') || text.includes('OTA推送') || text.includes('升级推送');
  
  // 检查是否为汽车品牌新闻
  const carBrands = ['比亚迪', '方程豹', '特斯拉', '蔚来', '小鹏', '理想', '奔驰', '宝马', '奥迪', '大众', '丰田', '本田'];
  const isCarBrand = carBrands.some(brand => 
    text.includes(brand) || text.toLowerCase().includes(brand.toLowerCase())
  );
  
  // 如果是汽车科技新闻，且没有明显的AI技术创新内容，则归类为科技而非AI
  if ((isCarTech || isCarBrand) && !hasCoreAICompany && !hasAIProduct) {
    return false;
  }
  
  // 特别处理OTA升级新闻 - 如果主要是功能更新而非AI创新，则不归类为AI
  if (isOTAUpdate && !hasCoreAICompany && !hasAIProduct) {
    return false;
  }
  
  return hasCoreAICompany || hasAIProduct || hasAIKeywords || hasResearchInstitution;
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

// 简化的AI洞察生成（备用方案）
function generateSimpleInsight(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  if (text.includes('chatgpt') || text.includes('gpt')) {
    return '这篇新闻涉及ChatGPT相关技术发展，反映了大语言模型在各个领域的应用趋势和商业化进程。';
  } else if (text.includes('机器学习') || text.includes('深度学习')) {
    return '该新闻展示了机器学习/深度学习技术的最新进展，对AI技术发展具有重要意义。';
  } else if (text.includes('创业') || text.includes('融资')) {
    return '此新闻反映了AI行业的投资热点和创业趋势，值得关注行业动态。';
  } else if (text.includes('政策') || text.includes('监管')) {
    return '该新闻涉及AI相关政策法规，对行业发展环境和监管框架有重要影响。';
  } else if (text.includes('自动驾驶') || text.includes('无人驾驶')) {
    return '该新闻反映了自动驾驶技术的最新发展，对智能交通和汽车产业具有重要影响。';
  } else if (text.includes('芯片') || text.includes('半导体')) {
    return '此新闻涉及AI芯片技术发展，对算力基础设施和AI硬件创新具有重要意义。';
  } else if (text.includes('大模型') || text.includes('llm')) {
    return '该新闻展示了大语言模型技术的最新进展，对AI能力提升和应用拓展具有重要价值。';
  } else if (text.includes('机器人') || text.includes('robot')) {
    return '此新闻反映了机器人技术的最新发展，对智能制造和服务业自动化具有重要影响。';
  } else {
    return '这篇新闻反映了AI领域的最新发展动态，对了解行业趋势具有重要参考价值。';
  }
}

// 处理单个新闻项
async function processNewsItem(item, source) {
  const summary = cleanContent(item.contentSnippet || item.content || '');
  const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
  
  let category;
  if (isAINews(item.title, item.content)) {
    category = isDomesticAINews(item.title, item.content, source) ? '国内AI' : '国外AI';
  } else {
    category = source.category;
  }
  
  // 生成AI点评
  const aiInsight = await generateAIInsight(item.title, item.contentSnippet || item.content);
  
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
    aiInsight: aiInsight
  };
}


// 主函数
async function main() {
  console.log('开始聚合RSS国内AI新闻...');
  
  const allNews = [];
  const seenTitles = new Set();
  
  // 读取现有的国际新闻数据
  const fs = await import('fs').then(m => m.promises);
  let existingNews = [];
  
  try {
    const existingData = await fs.readFile('public/news-data.json', 'utf8');
    const parsedData = JSON.parse(existingData);
    if (parsedData.success && parsedData.data) {
      existingNews = parsedData.data;
      console.log(`读取到 ${existingNews.length} 条现有国际新闻`);
      
      // 将现有新闻添加到去重集合中
      existingNews.forEach(item => {
        const titleKey = item.title.toLowerCase().trim();
        seenTitles.add(titleKey);
      });
    }
  } catch (error) {
    console.log('没有找到现有新闻数据，将创建新的数据文件');
  }
  
  // 添加现有新闻到总列表
  allNews.push(...existingNews);
  
  // 获取RSS国内新闻
  for (const source of RSS_SOURCES) {
    try {
      console.log(`正在爬取 ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      
      const filteredItems = feed.items
        .filter(item => isAINews(item.title, item.contentSnippet || item.content))
        .slice(0, 10);
      
      // 异步处理每个新闻项
      const newsItems = [];
      for (const item of filteredItems) {
        try {
          const processedItem = await processNewsItem(item, source);
          newsItems.push(processedItem);
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
  
  allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  
  const data = {
    success: true,
    timestamp: new Date().toISOString(),
    total: allNews.length,
    data: allNews
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

// 运行
main().catch(console.error);