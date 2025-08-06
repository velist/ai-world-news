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

  // 获取新闻的本地化内容 - 中文用户看翻译，英文用户看原文
  const getLocalizedNews = useCallback((news: any) => {
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
  }, [isZh]);

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