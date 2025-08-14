import { useState, useEffect, useMemo, useCallback } from 'react';
import { NewsItem } from '@/types/news';
import { useContentFilter } from './useContentFilter';
import { useNewsTranslation } from './useNewsTranslation';

// 新闻数据缓存管理
class NewsCache {
  private cache: Map<string, { data: NewsItem[], timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

  set(key: string, data: NewsItem[]) {
    this.cache.set(key, { data: [...data], timestamp: Date.now() });
  }

  get(key: string): NewsItem[] | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return [...cached.data];
  }

  clear() {
    this.cache.clear();
  }
}

const newsCache = new NewsCache();

// 优化的数据获取函数
const fetchNewsData = async (bypassCache = false): Promise<NewsItem[]> => {
  const cacheKey = 'news-data';
  
  // 尝试从缓存获取数据
  if (!bypassCache) {
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
      console.log('使用缓存数据:', cachedData.length, '条');
      return cachedData;
    }
  }

  // 检测是否为微信浏览器
  const isWeChat = /micromessenger/i.test(navigator.userAgent);
  
  // 增强的缓存破坏策略
  const timestamp = Date.now();
  const cacheParams = new URLSearchParams({
    t: timestamp.toString(),
    v: '2', // 版本号
    ...(bypassCache && { force: '1' })
  });
  
  const url = `/news-data.json?${cacheParams}`;
  
  try {
    const response = await fetch(url, {
      cache: 'no-cache',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...(isWeChat && { 'User-Agent': 'WeChat' })
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data?.success && data?.data && Array.isArray(data.data)) {
      // 缓存数据
      newsCache.set(cacheKey, data.data);
      return data.data;
    } else {
      throw new Error('新闻数据格式错误');
    }
  } catch (error) {
    console.error('获取新闻数据失败:', error);
    
    // 尝试获取备用缓存数据
    const fallbackData = newsCache.get(cacheKey);
    if (fallbackData) {
      console.log('使用备用缓存数据');
      return fallbackData;
    }
    
    throw error;
  }
};

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  const { filterNews } = useContentFilter();
  const { getLocalizedNewsArray, getLocalizedCategory } = useNewsTranslation();

  // 优化的数据处理函数
  const processNewsData = useCallback((rawData: NewsItem[]) => {
    console.log(`获取到原始新闻数据: ${rawData.length} 条`);
    
    // 应用内容过滤，移除政治敏感内容
    const filteredData = filterNews(rawData);
    console.log(`内容过滤后新闻数据: ${filteredData.length} 条 (被过滤掉 ${rawData.length - filteredData.length} 条)`);
    
    // 按时间降序排序 - 最新的在前面
    const sortedData = filteredData.sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      return timeB - timeA; // 降序：最新的在前面
    });
    
    // 应用语言本地化
    const localizedData = getLocalizedNewsArray(sortedData);
    
    console.log('处理后前5条新闻:', localizedData.slice(0, 5).map((item, index) => ({ 
      index: index + 1,
      title: item.title.substring(0, 40), 
      time: item.publishedAt,
      source: item.source
    })));
    
    return localizedData;
  }, [filterNews, getLocalizedNewsArray]);

  // 主要的数据获取函数
  const loadNews = useCallback(async (bypassCache = false) => {
    // 防抖：如果刚刚获取过数据，则跳过
    const now = Date.now();
    if (!bypassCache && now - lastFetchTime < 30000) { // 30秒内不重复获取
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const rawData = await fetchNewsData(bypassCache);
      const processedData = processNewsData(rawData);
      
      setNews(processedData);
      setLastFetchTime(now);
    } catch (err) {
      console.error('Network error:', err);
      setError(err instanceof Error ? err.message : '网络连接错误，请检查网络设置');
    } finally {
      setLoading(false);
    }
  }, [processNewsData, lastFetchTime]);

  // 初始化数据加载
  useEffect(() => {
    loadNews();
    
    // 设置定时刷新新闻（每5分钟检查一次）
    const interval = setInterval(() => {
      loadNews(true);
    }, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
    };
  }, [loadNews]);

  // 优化的过滤和排序逻辑
  const sortedFilteredNews = useMemo(() => {
    console.log('重新计算排序后的新闻', { newsCount: news.length, selectedCategory });
    
    // 过滤逻辑：全部显示所有新闻，其他分类只显示对应分类的新闻
    const filteredNews = selectedCategory === getLocalizedCategory('全部') 
      ? news 
      : news.filter(item => {
          const localizedItemCategory = getLocalizedCategory(item.category);
          return localizedItemCategory === selectedCategory;
        });

    // 确保时间排序正确
    const sorted = [...filteredNews].sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      return timeB - timeA;
    });
    
    return sorted;
  }, [news, selectedCategory, getLocalizedCategory]);

  // 分类定义
  const rawCategories = ['全部', '中国AI', '国际AI', '科技新闻', 'AI趣味新闻'];
  const categories = useMemo(() => 
    rawCategories.map(cat => getLocalizedCategory(cat)), 
    [getLocalizedCategory]
  );

  // 强制刷新函数
  const refreshNews = useCallback(() => {
    newsCache.clear(); // 清理缓存
    loadNews(true);
  }, [loadNews]);

  return {
    news: sortedFilteredNews,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    refreshNews,
    lastFetchTime
  };
};