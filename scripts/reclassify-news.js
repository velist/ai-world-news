import fs from 'fs';
import path from 'path';

// 复制改进后的分类函数
function categorizeNewsTraditional(title, content) {
  const text = (title + ' ' + (content || '')).toLowerCase();
  
  // 需要排除的内容（政治、经济、普通科技等）
  const excludeKeywords = [
    // 政治相关
    '政策', '监管', '法规', '政府', '国家战略', '白宫', '总统',
    
    // 经济相关
    '市场份额', '销量', '营收', '利润', '融资', '上市', '股价', '市值',
    '投资', '募资', '轮融资', '估值', '收购', '兼并',
    
    // 普通科技产品
    '手机', '平板', '笔记本', '电脑', '显示器', '键盘', '鼠标', '耳机',
    '充电器', '电池', '内存', '硬盘', '处理器', '显卡', '主板',
    '鸿蒙', 'HarmonyOS', 'Android', 'iOS', 'Windows', 'macOS',
    
    // 汽车相关（非AI自动驾驶）
    '电动汽车', '新能源车', '充电桩', '电池技术', '汽车', '车辆',
    'OTA升级', '泊车辅助', '智能座舱', '手车互联',
    
    // 其他不需要的内容
    '娱乐', '游戏', '体育', '音乐', '电影', '电视', '明星', '网红'
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
    'AI', 'artificial intelligence', '人工智能', 'machine learning', '深度学习', 
    'ChatGPT', 'GPT', '大模型', 'LLM', 'natural language processing', '计算机视觉',
    '强化学习', '生成式AI', 'AIGC', '神经网络', '算法', '数据科学', '自动化',
    '机器人', '语音识别', '图像识别', '模式识别', '知识图谱', '智能驾驶', '自动驾驶',
    '无人驾驶', 'AI芯片', 'AI框架', 'Transformer', 'BERT', 'ResNet', 'CNN', 
    'RNN', 'LSTM', 'GAN', '扩散模型', 'Agent', '智能体', '多模态', '推理', '训练', '微调', '预训练'
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
  
  // AI公司和研究机构
  const aiCompanies = [
    // 国际公司
    'OpenAI', 'Google', 'Microsoft', 'Meta', 'Facebook', 'Apple', 'Amazon',
    'NVIDIA', 'AMD', 'Intel', 'Anthropic', 'Cohere', 'Character.AI',
    
    // 中国公司
    '百度', '阿里', '腾讯', '字节', '华为', '智谱', '商汤', '旷视', '依图', '云从', 
    '科大讯飞', '360', '猎豹', '寒武纪', '地平线', 'Momenta', 'Minimax'
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
  
  // 必须至少包含一种AI相关内容
  if (!hasAICore && !hasAIModels && !hasAICompanies && !hasAITech) {
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
    '月之暗面', '零一万物', '百川智能', '阶跃星辰', 'Minimax',
    '中科院', '清华大学', '北京大学', '浙江大学', '上海交通大学', 
    '复旦大学', '南京大学', '中国科学技术大学', '哈尔滨工业大学', '西安交通大学',
    '中国AI', '国产AI', '中文AI', '华人AI团队', '国内大模型', '本土AI', '自主AI'
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
  
  // 分类逻辑 - 修正优先级，趣味新闻优先级较高
  // 1. 首先判断是否为中国AI（优先级最高，避免被国外关键词误分类）
  if (isChineseAI && !isFunAI) {
    return '中国AI';
  }
  
  // 2. 判断是否为趣味新闻（优先级高于国际AI）
  if (isFunAI) {
    return 'AI趣味新闻';
  }
  
  // 3. 然后判断是否为国外AI
  if (isForeignAI) {
    return '国际AI';
  }
  
  // 4. 判断是否为科技新闻
  if (isTechNews) {
    return '科技新闻';
  }
  
  // 5. 默认分类为国际AI
  return '国际AI';
}

async function reclassifyNews() {
  console.log('开始重新分类历史新闻数据...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const newsFilePath = path.join(publicDir, 'news-data.json');
  
  if (!fs.existsSync(newsFilePath)) {
    console.error('新闻数据文件不存在');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(newsFilePath, 'utf8'));
  
  if (!data.data || !Array.isArray(data.data)) {
    console.error('新闻数据格式错误');
    return;
  }
  
  console.log(`原始新闻数量: ${data.data.length}`);
  
  let reclassifiedCount = 0;
  let removedCount = 0;
  
  const processedNews = data.data.map((news, index) => {
    const originalCategory = news.category;
    const newCategory = categorizeNewsTraditional(news.title, news.content || news.summary);
    
    if (newCategory === null) {
      console.log(`❌ 移除非AI新闻: ${news.title.substring(0, 50)}...`);
      removedCount++;
      return null;
    }
    
    if (originalCategory !== newCategory) {
      console.log(`🔄 重新分类: ${news.title.substring(0, 50)}...`);
      console.log(`   ${originalCategory} → ${newCategory}`);
      reclassifiedCount++;
    }
    
    return {
      ...news,
      category: newCategory
    };
  }).filter(news => news !== null);
  
  console.log(`\n📊 重新分类统计:`);
  console.log(`- 重新分类: ${reclassifiedCount} 条`);
  console.log(`- 移除非AI: ${removedCount} 条`);
  console.log(`- 最终保留: ${processedNews.length} 条`);
  
  // 保存更新的数据
  const updatedData = {
    ...data,
    data: processedNews,
    total: processedNews.length,
    timestamp: new Date().toISOString(),
    note: `重新分类清理 - 移除${removedCount}条非AI新闻，重新分类${reclassifiedCount}条新闻`
  };
  
  fs.writeFileSync(newsFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log('\n✅ 新闻数据重新分类完成并保存');
}

reclassifyNews().catch(console.error);