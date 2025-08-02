import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import aiHeroImage from '@/assets/ai-hero.jpg';
import aiChipImage from '@/assets/ai-chip.jpg';
import techEconomyImage from '@/assets/tech-economy.jpg';

// Mock news data for demonstration
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'OpenAI发布全新GPT-5模型，性能提升显著',
    summary: 'OpenAI宣布推出最新的GPT-5大语言模型，在推理能力、创造性和安全性方面均有重大突破，预计将重塑AI应用格局。',
    content: `OpenAI今日正式发布了备受期待的GPT-5大语言模型，这是继GPT-4之后的又一重大技术突破。据官方介绍，GPT-5在多个关键指标上都实现了显著提升。

在推理能力方面，GPT-5在复杂数学问题和逻辑推理测试中的表现比GPT-4提升了约40%。模型能够更好地理解上下文，进行多步骤推理，并给出更准确的答案。

创造性方面，GPT-5在文本生成、代码编写和创意设计等任务中展现出了更强的原创性和多样性。测试显示，其生成的内容质量和创新度都有明显改善。

在安全性方面，OpenAI采用了全新的对齐技术和安全机制，大幅降低了模型生成有害内容的风险。同时，模型的可解释性也得到了增强，用户可以更好地理解模型的决策过程。

业界专家认为，GPT-5的发布将加速AI技术在各行各业的应用，特别是在教育、医疗、金融等领域将产生深远影响。`,
    imageUrl: aiHeroImage,
    source: 'TechCrunch',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    category: 'AI 模型',
    originalUrl: 'https://techcrunch.com',
    aiInsight: 'GPT-5的发布标志着大语言模型技术的又一次重大飞跃。其在推理能力和安全性方面的显著提升，将为AI应用带来更多可能性。特别是在垂直行业的应用场景中，更强的推理能力将使AI能够处理更复杂的任务，而改进的安全机制则为大规模商业部署提供了更强的保障。'
  },
  {
    id: '2',
    title: '英伟达发布新一代AI芯片，性能提升3倍',
    summary: '英伟达推出最新的H200 GPU，专为AI训练和推理设计，相比前一代产品性能提升达到300%，预计将推动AI计算成本大幅下降。',
    content: `英伟达公司今天发布了专为人工智能设计的新一代GPU芯片H200，这款芯片在AI训练和推理性能方面相比前一代H100实现了3倍的性能提升。

H200采用了全新的架构设计，集成了更多的AI专用计算单元，内存带宽也得到了大幅提升。在AI模型训练方面，H200能够将大型语言模型的训练时间缩短至原来的三分之一。

在推理性能方面，H200在处理复杂AI任务时的能效比也有显著改善，这将直接降低AI应用的运营成本。测试显示，使用H200进行AI推理的成本相比H100降低了约60%。

英伟达CEO黄仁勇表示，H200的发布将加速AI技术的普及，让更多企业能够负担得起大规模AI应用的部署成本。

业界分析师预测，H200的量产将进一步巩固英伟达在AI芯片市场的领导地位，同时也将推动整个AI行业的快速发展。`,
    imageUrl: aiChipImage,
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    category: '科技',
    originalUrl: 'https://reuters.com',
    aiInsight: '英伟达H200芯片的发布具有重要的战略意义。性能提升3倍不仅意味着计算效率的大幅改善，更重要的是成本的显著降低将使AI技术变得更加普及。这将加速AI从实验室走向实际应用，特别是对于中小企业而言，更低的部署成本将降低AI应用的门槛。'
  },
  {
    id: '3',
    title: 'AI技术推动全球经济增长，预计贡献15.7万亿美元',
    summary: '普华永道最新报告显示，到2030年AI技术将为全球GDP贡献15.7万亿美元，其中中国和美国将是最大受益者。',
    content: `普华永道发布的最新研究报告显示，人工智能技术正在成为推动全球经济增长的重要引擎。报告预测，到2030年，AI将为全球GDP增长贡献高达15.7万亿美元。

报告指出，AI技术的经济影响主要体现在两个方面：一是通过提高生产效率和产品质量来增加生产力；二是通过创造新的产品、服务和商业模式来刺激消费需求。

在地区分布方面，中国预计将获得最大的经济收益，AI技术有望为中国GDP增长贡献7万亿美元。美国紧随其后，预计贡献3.7万亿美元。欧洲、日本等发达经济体也将显著受益。

行业方面，制造业、金融服务、医疗保健和零售业将是AI技术应用的重点领域。其中，制造业的自动化和智能化改造预计将带来最大的经济效益。

报告还强调，要充分释放AI的经济潜力，各国政府需要在教育、基础设施和监管框架等方面进行相应的政策调整和投资。`,
    imageUrl: techEconomyImage,
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    category: '经济',
    originalUrl: 'https://ft.com',
    aiInsight: '15.7万亿美元的经济贡献预测凸显了AI技术的巨大潜力。这不仅仅是技术革新，更是经济结构的深层次变革。中国和美国作为AI技术的领导者，将在这场变革中占据有利地位。然而，要实现这一预测，需要政府、企业和社会各界的协同努力，特别是在人才培养和基础设施建设方面的投入。'
  },
  {
    id: '4',
    title: 'AI安全治理成为全球焦点，各国加强监管合作',
    summary: '随着AI技术快速发展，全球主要国家正在加强AI安全治理，建立国际合作机制，确保AI技术的安全和可控发展。',
    content: `随着人工智能技术的快速发展和广泛应用，AI安全治理已成为全球各国政府关注的重点议题。近期，多个国际组织和国家政府相继发布了AI安全治理相关的政策文件和监管框架。

欧盟率先通过了《人工智能法案》，这是全球首部全面的AI监管法律，将于2025年全面生效。该法案按照风险等级对AI系统进行分类管理，对高风险AI应用提出了严格的安全要求。

美国政府也发布了AI安全行政令，要求联邦机构制定AI安全标准，并建立AI安全测试和评估体系。同时，美国还在推动建立国际AI安全合作机制。

中国在AI治理方面也积极行动，发布了多项AI相关管理规定，包括算法推荐管理规定、深度合成管理规定等，初步构建了AI治理的政策框架。

联合国等国际组织也在积极推动AI全球治理，今年成立了AI咨询机构，旨在为各国提供AI治理的政策建议和技术支持。

专家认为，AI安全治理需要平衡创新发展和风险防控，既要避免过度监管阻碍技术进步，也要防范AI技术可能带来的各种风险。`,
    imageUrl: aiHeroImage,
    source: 'BBC',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    category: '深度分析',
    originalUrl: 'https://bbc.com',
    aiInsight: 'AI安全治理的全球化趋势反映了各国对AI技术双重性的深刻认识。一方面，AI技术带来巨大机遇；另一方面，也可能产生前所未有的风险。当前各国的监管方式显示了不同的治理理念，欧盟更注重权利保护，美国强调安全防控，中国则平衡发展与安全。未来需要在全球层面形成更多共识，建立有效的国际合作机制。'
  }
];

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('AI 模型');

  useEffect(() => {
    // Simulate API call
    const fetchNews = async () => {
      setLoading(true);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNews(MOCK_NEWS);
      setLoading(false);
    };

    fetchNews();
  }, []);

  const filteredNews = news.filter(item => 
    selectedCategory === 'AI 模型' ? true : item.category === selectedCategory
  );

  const categories = ['AI 模型', '科技', '经济', '深度分析'];

  return {
    news: filteredNews,
    loading,
    categories,
    selectedCategory,
    setSelectedCategory,
  };
};