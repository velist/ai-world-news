import { useLanguage } from '@/contexts/LanguageContext';

export const useNewsTranslation = () => {
  const { isZh } = useLanguage();

  const getLocalizedCategory = (category: string) => {
    if (!category) return isZh ? '其他' : 'Other';
    
    const categoryMap: Record<string, { zh: string; en: string }> = {
      'ai': { zh: 'AI模型', en: 'AI Models' },
      'ai模型': { zh: 'AI模型', en: 'AI Models' },
      'ai 模型': { zh: 'AI模型', en: 'AI Models' },
      'tech': { zh: '科技', en: 'Technology' },
      '科技': { zh: '科技', en: 'Technology' },
      'economy': { zh: '经济', en: 'Economy' },
      '经济': { zh: '经济', en: 'Economy' },
      'analysis': { zh: '深度分析', en: 'Analysis' },
      '深度分析': { zh: '深度分析', en: 'Analysis' },
      '全部': { zh: '全部', en: 'All' }
    };

    const normalizedCategory = category.toLowerCase();
    const mapping = categoryMap[normalizedCategory] || categoryMap[category] || { zh: category, en: category };
    
    return isZh ? mapping.zh : mapping.en;
  };

  // 获取新闻的本地化内容 - 中文用户看翻译，英文用户看原文
  const getLocalizedNews = (news: any) => {
    if (!news) return null;
    
    if (isZh) {
      // 中文用户：直接使用当前的翻译内容
      return news;
    } else {
      // 英文用户：尝试获取原始英文内容
      return {
        ...news,
        title: news.originalTitle || news.title || 'Loading title...',
        summary: news.originalSummary || news.summary || 'No summary available',
        content: news.originalContent || news.content || 'No content available'
      };
    }
  };

  const getLocalizedNewsArray = (newsArray: any[]) => {
    if (!newsArray || !Array.isArray(newsArray)) return [];
    return newsArray.map(news => getLocalizedNews(news));
  };

  return {
    getLocalizedCategory,
    getLocalizedNews,
    getLocalizedNewsArray
  };
};