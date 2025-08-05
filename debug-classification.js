// Debug classification
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

const AI_CORE_KEYWORDS = [
  'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
  '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '神经网络',
  '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别', '模式识别',
  '知识图谱', '智能驾驶', '自动驾驶', '无人驾驶', 'AI芯片', 'AI框架',
  'Transformer', 'BERT', 'ResNet', 'CNN', 'RNN', 'LSTM', 'GAN', '扩散模型',
  'Agent', '智能体', '多模态', '推理', '训练', '微调', '预训练'
];

function isAINews(title, content) {
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
  
  return hasAICore;
}

function getNewsCategory(title, content) {
  if (!isAINews(title, content)) {
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
    return '中国AI';
  }
  
  if (isFunAI) {
    return 'AI趣味新闻';
  }
  
  if (isTechNews) {
    return '科技新闻';
  }
  
  return '国际AI';
}

// 测试用例
console.log('=== 调试分类问题 ===');

const testCases = [
  {
    title: '华为发布全新AI大模型：基于HarmonyOS生态，支持手机端侧推理',
    expected: '中国AI'
  },
  {
    title: 'OpenAI发布GPT-5：性能大幅提升，支持多模态输入',
    expected: '国际AI'
  }
];

testCases.forEach((test, index) => {
  const actual = getNewsCategory(test.title, '');
  console.log(`测试用例 ${index + 1}:`);
  console.log(`  标题: ${test.title}`);
  console.log(`  实际分类: ${actual}`);
  console.log(`  期望分类: ${test.expected}`);
  console.log(`  结果: ${actual === test.expected ? '✅ 通过' : '❌ 失败'}`);
  
  // 调试信息
  const text = test.title.toLowerCase();
  console.log(`  调试信息:`);
  console.log(`    isAINews: ${isAINews(test.title, '')}`);
  console.log(`    包含华为: ${text.includes('华为')}`);
  console.log(`    包含OpenAI: ${text.includes('openai')}`);
  console.log(`    包含AI: ${text.includes('ai')}`);
  console.log(`    包含大模型: ${text.includes('大模型')}`);
  console.log('');
});