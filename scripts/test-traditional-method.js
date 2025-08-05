#!/usr/bin/env node

// 测试传统关键词匹配方法
console.log('开始测试传统关键词匹配方法...\n');

function testTraditionalMethod() {
  const testCases = [
    {
      title: '性感内衣模特大赛开幕，明星云集',
      content: '今日，某知名内衣品牌举办的性感内衣模特大赛正式开幕，众多明星和模特云集现场。',
      expected: false
    },
    {
      title: '新款游戏主机发布，性能大幅提升',
      content: '某知名游戏公司今日发布了新款游戏主机，性能相比上一代有大幅提升，支持8K游戏。',
      expected: false
    },
    {
      title: 'ChatGPT推出新功能：支持代码生成',
      content: 'OpenAI今日宣布ChatGPT推出新功能，现在可以自动生成代码，大大提升开发效率。',
      expected: true
    },
    {
      title: '华为发布全新AI大模型：基于HarmonyOS生态',
      content: '华为今日发布全新AI大模型，基于HarmonyOS生态系统，支持手机端侧推理，在自然语言处理方面有重大突破。',
      expected: true
    },
    {
      title: '比亚迪汽车销量创新高',
      content: '比亚迪公布最新销量数据，本月销量再创新高，在新能源汽车市场占据重要地位。',
      expected: false
    },
    {
      title: 'AI芯片技术突破：能效比提升50%',
      content: '某半导体公司宣布AI芯片技术取得重大突破，新芯片能效比提升50%，为AI计算提供更强动力。',
      expected: true
    }
  ];

  // AI关键词
  const AI_KEYWORDS = [
    'AI', '人工智能', '机器学习', '深度学习', 'ChatGPT', 'GPT', '大模型', 'LLM',
    '自然语言处理', '计算机视觉', '强化学习', '生成式AI', 'AIGC', '神经网络',
    '算法', '数据科学', '自动化', '机器人', '语音识别', '图像识别', '模式识别',
    '智能驾驶', '自动驾驶', '无人驾驶', 'AI芯片', 'AI框架', 'Agent', '智能体'
  ];
  
  // 排除关键词
  const EXCLUDE_KEYWORDS = [
    '性感', '内衣', '游戏', '娱乐', '体育', '音乐', '电影', '电视', '明星', '网红'
  ];
  
  function isAINewsTraditional(title, content) {
    const text = (title + ' ' + (content || '')).toLowerCase();
    
    // 检查是否包含需要排除的关键词
    const hasExcluded = EXCLUDE_KEYWORDS.some(keyword => 
      text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    if (hasExcluded) {
      return false;
    }
    
    // 检查是否包含AI关键词
    const hasAI = AI_KEYWORDS.some(keyword => 
      text.includes(keyword) || text.toLowerCase().includes(keyword.toLowerCase())
    );
    
    return hasAI;
  }
  
  console.log('使用传统关键词匹配方法进行测试...\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`测试用例 ${i + 1}:`);
    console.log(`  标题: ${testCase.title}`);
    console.log(`  内容: ${testCase.content.substring(0, 100)}...`);
    
    const result = isAINewsTraditional(testCase.title, testCase.content);
    const passed = result === testCase.expected;
    
    console.log(`  传统判断: ${result ? '是AI新闻' : '不是AI新闻'}`);
    console.log(`  期望结果: ${testCase.expected ? '是AI新闻' : '不是AI新闻'}`);
    console.log(`  测试结果: ${passed ? '✅ 通过' : '❌ 失败'}`);
    console.log('');
  }
}

// 运行测试
testTraditionalMethod();