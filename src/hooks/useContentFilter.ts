export const useContentFilter = () => {
  // 政治敏感关键词列表
  const politicalKeywords = [
    // 政治人物
    'trump', 'donald trump', 'biden', 'joe biden', 'putin', 'xi jinping', 'modi', 'erdogan',
    'netanyahu', 'macron', 'scholz', 'trudeau', 'zelenskyy', 'zelensky',
    // 政治话题
    'election', 'vote', 'voting', 'ballot', 'campaign', 'democracy', 'republican', 'democrat',
    'politics', 'political', 'government', 'congress', 'senate', 'parliament', 'legislation',
    'policy', 'regulation', 'sanctions', 'embassy', 'diplomatic', 'foreign policy',
    // 地缘政治
    'ukraine', 'russia', 'gaza', 'israel', 'palestine', 'iran', 'iraq', 'afghanistan',
    'taiwan', 'hong kong', 'tibet', 'xinjiang', 'south china sea', 'north korea',
    // 军事相关
    'military', 'army', 'navy', 'air force', 'defense', 'weapon', 'missile', 'nuclear',
    'war', 'conflict', 'battle', 'invasion', 'attack', 'terrorism', 'security threat',
    // 抗议示威
    'protest', 'demonstration', 'riot', 'march', 'rally', 'strike', 'activism',
    // 中文关键词
    '特朗普', '拜登', '普京', '习近平', '莫迪', '埃尔多安', '内塔尼亚胡', '马克龙',
    '选举', '投票', '竞选', '民主', '共和党', '民主党', '政治', '政府', '国会', '参议院',
    '议会', '立法', '政策', '法规', '制裁', '大使馆', '外交', '外交政策',
    '乌克兰', '俄罗斯', '加沙', '以色列', '巴勒斯坦', '伊朗', '伊拉克', '阿富汗',
    '台湾', '香港', '西藏', '新疆', '南海', '朝鲜',
    '军事', '军队', '海军', '空军', '国防', '武器', '导弹', '核武器',
    '战争', '冲突', '战斗', '入侵', '攻击', '恐怖主义', '安全威胁',
    '抗议', '示威', '暴动', '游行', '集会', '罢工', '激进主义'
  ];

  // AI相关关键词
  const aiKeywords = [
    'ai', 'artificial intelligence', 'machine learning', 'deep learning', 'neural network',
    'chatgpt', 'gpt', 'openai', 'anthropic', 'claude', 'gemini', 'bard', 'llm', 'llama',
    'transformer', 'bert', 'roberta', 'computer vision', 'nlp', 'natural language processing',
    'robotics', 'automation', 'algorithm', 'data science', 'big data', 'analytics',
    'tech', 'technology', 'innovation', 'startup', 'software', 'hardware', 'chip', 'semiconductor',
    'nvidia', 'amd', 'intel', 'google', 'microsoft', 'apple', 'meta', 'tesla', 'spacex',
    'ai模型', '人工智能', '机器学习', '深度学习', '神经网络', '自然语言处理',
    '计算机视觉', '机器人', '自动化', '算法', '数据科学', '大数据', '分析',
    '科技', '技术', '创新', '初创', '软件', '硬件', '芯片', '半导体'
  ];

  const isPoliticalContent = (text: string) => {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    return politicalKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  };

  const isAIRelated = (text: string) => {
    if (!text) return false;
    
    const lowerText = text.toLowerCase();
    return aiKeywords.some(keyword => 
      lowerText.includes(keyword.toLowerCase())
    );
  };

  const filterNews = (newsItems: any[]) => {
    return newsItems.filter(item => {
      // 检查标题、摘要、内容是否包含政治敏感内容
      const textToCheck = [
        item.title || '',
        item.summary || '',
        item.content || '',
        item.source || ''
      ].join(' ');

      // 如果包含政治敏感内容，过滤掉
      if (isPoliticalContent(textToCheck)) {
        return false;
      }

      return true;
    });
  };

  const filterAINews = (newsItems: any[]) => {
    return newsItems.filter(item => {
      const textToCheck = [
        item.title || '',
        item.summary || '',
        item.content || '',
        item.category || ''
      ].join(' ');

      // 必须是AI相关内容
      return isAIRelated(textToCheck);
    }).slice(0, 10); // 只取前10条
  };

  return {
    filterNews,
    filterAINews,
    isPoliticalContent,
    isAIRelated
  };
};