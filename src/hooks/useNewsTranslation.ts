import { useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export const useNewsTranslation = () => {
  const { isZh } = useLanguage();

  const getLocalizedCategory = useCallback((category: string) => {
    if (!category) return isZh ? '其他' : 'Other';
    
    const categoryMap: Record<string, { zh: string; en: string }> = {
      'ai': { zh: 'AI', en: 'AI' },
      'ai模型': { zh: 'AI', en: 'AI' },
      'ai 模型': { zh: 'AI', en: 'AI' },
      '中国AI': { zh: '中国AI', en: 'China AI' },
      '中国ai': { zh: '中国AI', en: 'China AI' },
      '国内ai': { zh: '中国AI', en: 'China AI' },
      '国内AI': { zh: '中国AI', en: 'China AI' },
      '国际AI': { zh: '国际AI', en: 'International AI' },
      '国际ai': { zh: '国际AI', en: 'International AI' },
      '国外ai': { zh: '国际AI', en: 'International AI' },
      '国外AI': { zh: '国际AI', en: 'International AI' },
      '科技新闻': { zh: '科技新闻', en: 'Tech News' },
      '科技': { zh: '科技新闻', en: 'Tech News' },
      'tech': { zh: '科技新闻', en: 'Tech News' },
      'AI趣味新闻': { zh: 'AI趣味新闻', en: 'AI Fun News' },
      'ai趣味新闻': { zh: 'AI趣味新闻', en: 'AI Fun News' },
      '趣味新闻': { zh: 'AI趣味新闻', en: 'AI Fun News' },
      'economy': { zh: '经济', en: 'Economy' },
      '经济': { zh: '经济', en: 'Economy' },
      'analysis': { zh: '深度分析', en: 'Analysis' },
      '深度分析': { zh: '深度分析', en: 'Analysis' },
      '全部': { zh: '全部', en: 'All' }
    };

    const normalizedCategory = category.toLowerCase();
    const mapping = categoryMap[normalizedCategory] || categoryMap[category] || { zh: category, en: category };
    
    return isZh ? mapping.zh : mapping.en;
  }, [isZh]);

  // 简单的中文到英文翻译函数（基于常见模式和公司名称）
  const translateToSimpleEnglish = useCallback((text: string): string => {
    if (!text) return text;
    
    // 检查是否主要是中文内容
    const chineseCharCount = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
    const totalCharCount = text.length;
    
    if (chineseCharCount < totalCharCount * 0.3) {
      // 如果中文字符少于30%，直接返回原文
      return text;
    }
    
    // 提取公司名称
    const extractCompanyName = (text: string): string => {
      // 英文公司名称
      const englishCompanies = ['Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla', 'OpenAI', 'Nvidia', 'AMD', 'Intel', 'IBM', 'Oracle', 'Salesforce', 'Adobe', 'Netflix', 'Uber', 'Airbnb', 'PayPal', 'Twitter', 'LinkedIn', 'Spotify', 'Zoom', 'Shopify', 'Palantir', 'Snowflake', 'MongoDB', 'ServiceNow', 'BMW', 'Mercedes', 'Volkswagen', 'Audi', 'Ford', 'GM', 'Toyota', 'Honda', 'Samsung', 'LG', 'Sony', 'Panasonic', 'Huawei', 'Xiaomi'];
      
      for (const company of englishCompanies) {
        if (text.includes(company)) {
          return company;
        }
      }
      
      // 中文公司名称映射
      const chineseCompanies: { [key: string]: string } = {
        '阿里巴巴': 'Alibaba',
        '阿里': 'Alibaba',
        '腾讯': 'Tencent', 
        '百度': 'Baidu',
        '字节跳动': 'ByteDance',
        '华为': 'Huawei',
        '小米': 'Xiaomi',
        '滴滴': 'Didi',
        '美团': 'Meituan',
        '京东': 'JD.com',
        '网易': 'NetEase',
        '新浪': 'Sina',
        '搜狐': 'Sohu',
        '宝马': 'BMW',
        '奔驰': 'Mercedes-Benz',
        '大众': 'Volkswagen',
        '奥迪': 'Audi',
        '福特': 'Ford',
        '通用': 'GM',
        '丰田': 'Toyota',
        '本田': 'Honda',
        '三星': 'Samsung',
        '索尼': 'Sony',
        '松下': 'Panasonic'
      };
      
      for (const [chinese, english] of Object.entries(chineseCompanies)) {
        if (text.includes(chinese)) {
          return english;
        }
      }
      
      return '';
    };
    
    // 提取产品/主题类型
    const extractProductType = (text: string): string => {
      if (text.includes('模型') || text.includes('Model') || text.includes('GPT') || text.includes('ChatGPT')) return 'AI Model';
      if (text.includes('芯片') || text.includes('Chip') || text.includes('处理器')) return 'Chip';
      if (text.includes('软件') || text.includes('Software') || text.includes('系统')) return 'Software';
      if (text.includes('应用') || text.includes('App') || text.includes('程序')) return 'App';
      if (text.includes('平台') || text.includes('Platform')) return 'Platform';
      if (text.includes('服务') || text.includes('Service')) return 'Service';
      if (text.includes('投资') || text.includes('融资') || text.includes('资金')) return 'Investment';
      if (text.includes('合作') || text.includes('协议') || text.includes('伙伴')) return 'Partnership';
      if (text.includes('收购') || text.includes('并购') || text.includes('交易')) return 'Acquisition';
      if (text.includes('财报') || text.includes('业绩') || text.includes('收入')) return 'Earnings';
      if (text.includes('股价') || text.includes('股票') || text.includes('市值')) return 'Stock';
      return 'Product';
    };
    
    const companyName = extractCompanyName(text);
    const productType = extractProductType(text);
    
    // 根据内容生成英文标题
    if (text.includes('发布') || text.includes('推出') || text.includes('上线')) {
      return companyName ? `${companyName} Launches New ${productType}` : `New ${productType} Launch`;
    } else if (text.includes('投资') || text.includes('融资')) {
      return companyName ? `${companyName} Investment News` : `${productType} Investment`;
    } else if (text.includes('合作') || text.includes('协议')) {
      return companyName ? `${companyName} Partnership` : `${productType} Partnership`;
    } else if (text.includes('收购') || text.includes('并购')) {
      return companyName ? `${companyName} Acquisition` : `${productType} Acquisition`;
    } else if (text.includes('增长') || text.includes('上涨') || text.includes('提升')) {
      return companyName ? `${companyName} Growth` : `${productType} Growth`;
    } else if (text.includes('下跌') || text.includes('下降') || text.includes('减少')) {
      return companyName ? `${companyName} Decline` : `${productType} Decline`;
    } else if (text.includes('AI') || text.includes('人工智能') || text.includes('智能')) {
      return companyName ? `${companyName} AI Development` : 'AI Development';
    } else if (text.includes('技术') || text.includes('创新')) {
      return companyName ? `${companyName} Technology` : 'Technology Innovation';
    } else {
      return companyName ? `${companyName} News` : 'Tech News Update';
    }
  }, []); // translateToSimpleEnglish 不依赖外部变量

  // 获取新闻的本地化内容 - 中文用户看翻译，英文用户看处理后的英文版本
  const getLocalizedNews = useCallback((news: any) => {
    if (!news) return null;
    
    if (isZh) {
      // 中文用户：直接使用当前的翻译内容
      return news;
    } else {
      // 英文用户：由于数据源都是中文翻译，需要进行反向处理
      // 检查原始URL来判断是否为英文来源
      const isEnglishSource = news.originalUrl && (
        news.originalUrl.includes('.com') || 
        news.originalUrl.includes('.org') || 
        news.originalUrl.includes('.net') ||
        /\b(bloomberg|reuters|techcrunch|verge|wired|cnet|zdnet|fortune|forbes|wsj|nytimes|washingtonpost|bbc|cnn|nbc|abc|cbs|npr|ap|axios|politico|guardian|ft|economist|time|newsweek|businessinsider|benzinga|seekingalpha|cnbc|yahoo|investing|siliconangle|winbuzzer|cointelegraph|hotair)\b/i.test(news.originalUrl)
      );
      
      return {
        ...news,
        title: isEnglishSource ? translateToSimpleEnglish(news.title) : news.title,
        summary: isEnglishSource ? translateToSimpleEnglish(news.summary || '') : news.summary,
        content: news.content, // 内容保持原样
        isTranslatedContent: true, // 标记为翻译内容
        isEnglishSource: isEnglishSource // 标记来源类型
      };
    }
  }, [isZh, translateToSimpleEnglish]);

  const getLocalizedNewsArray = useCallback((newsArray: any[]) => {
    if (!newsArray || !Array.isArray(newsArray)) return [];
    return newsArray.map(news => getLocalizedNews(news));
  }, [getLocalizedNews]);

  return {
    getLocalizedCategory,
    getLocalizedNews,
    getLocalizedNewsArray
  };
};