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
      // 英文用户：优先使用原始英文内容，如果没有则使用翻译内容并添加说明
      const hasOriginalContent = news.originalTitle || news.originalSummary || news.originalContent;
      
      if (hasOriginalContent) {
        return {
          ...news,
          title: news.originalTitle || news.title,
          summary: news.originalSummary || news.summary,
          content: news.originalContent || news.content
        };
      } else {
        // 如果没有原始英文内容，为英文用户提供翻译内容但添加说明
        return {
          ...news,
          title: news.title,
          summary: news.summary,
          content: news.content,
          // 添加说明标识这是翻译内容
          isTranslatedContent: true
        };
      }
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