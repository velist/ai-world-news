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

// 请求限流控制
let isRequestInProgress = false;
let lastRequestTime = 0;
const REQUEST_THROTTLE_MS = 2000; // 2秒内只能发一次请求

// 优化的数据获取函数
const fetchNewsData = async (bypassCache = false): Promise<NewsItem[]> => {
  const cacheKey = 'news-data';
  
  // 防止并发请求
  if (isRequestInProgress) {
    console.log('请求正在进行中，等待完成...');
    // 等待当前请求完成
    while (isRequestInProgress) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    // 请求完成后尝试从缓存获取
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }
  
  // 限流检查
  const now = Date.now();
  if (now - lastRequestTime < REQUEST_THROTTLE_MS) {
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
      console.log('请求被限流，使用缓存数据:', cachedData.length, '条');
      return cachedData;
    }
  }
  
  // 尝试从缓存获取数据
  if (!bypassCache) {
    const cachedData = newsCache.get(cacheKey);
    if (cachedData) {
      console.log('使用缓存数据:', cachedData.length, '条');
      return cachedData;
    }
  }

  // 标记请求开始
  isRequestInProgress = true;
  lastRequestTime = now;
  
  // 检测是否为微信浏览器
  const isWeChat = /micromessenger/i.test(navigator.userAgent);
  
  // 优化缓存策略：只在强制刷新时添加时间戳
  const url = bypassCache ? `/news-data.json?t=${now}&v=2` : '/news-data.json';
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: bypassCache ? 'no-cache' : 'default',
      headers: {
        'Accept': 'application/json',
        ...(bypassCache && {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }),
        ...(isWeChat && { 'User-Agent': 'WeChat' })
      },
      // 添加超时控制
      signal: AbortSignal.timeout(10000) // 10秒超时
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error('服务器返回的不是JSON数据');
    }
    
    const data = await response.json();
    
    if (data?.success && data?.data && Array.isArray(data.data)) {
      // 缓存数据
      newsCache.set(cacheKey, data.data);
      return data.data;
    } else if (Array.isArray(data)) {
      // 兼容直接数组格式
      newsCache.set(cacheKey, data);
      return data;
    } else {
      throw new Error('新闻数据格式不正确');
    }
  } catch (error) {
    console.error('获取新闻数据失败:', error);
    
    // 尝试获取备用缓存数据
    const fallbackData = newsCache.get(cacheKey);
    if (fallbackData && fallbackData.length > 0) {
      console.log('使用备用缓存数据:', fallbackData.length, '条');
      return fallbackData;
    }
    
    // 如果是网络错误，抛出更友好的错误信息
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查网络连接后重试');
    }
    
    throw error;
  } finally {
    // 标记请求完成
    isRequestInProgress = false;
  }
};

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [rawNews, setRawNews] = useState<NewsItem[]>([]); // 存储原始数据
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

  // 主要的数据获取函数 - 增强防抖和错误处理
  const loadNews = useCallback(async (bypassCache = false) => {
    // 如果正在加载且不是强制刷新，则跳过
    if (loading && !bypassCache) {
      console.log('数据正在加载中，跳过重复请求');
      return;
    }

    // 防抖：如果刚刚获取过数据，则跳过
    const now = Date.now();
    if (!bypassCache && now - lastFetchTime < 10000) { // 减少到10秒防抖
      console.log('防抖限制，跳过请求');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const rawData = await fetchNewsData(bypassCache);
      
      if (!rawData || rawData.length === 0) {
        throw new Error('未获取到新闻数据');
      }
      
      const processedData = processNewsData(rawData);
      
      setRawNews(rawData); // 存储原始数据
      setNews(processedData);
      setLastFetchTime(now);
      
      console.log(`✅ 成功加载 ${processedData.length} 条新闻`);
    } catch (err) {
      console.error('❌ 新闻加载失败:', err);
      const errorMessage = err instanceof Error ? err.message : '网络连接错误，请检查网络设置';
      setError(errorMessage);
      
      // 如果有缓存数据，在错误时也尝试显示
      if (news.length === 0) {
        try {
          const fallbackData = newsCache.get('news-data');
          if (fallbackData && fallbackData.length > 0) {
            console.log('🔄 使用缓存数据作为备用');
            const processedFallback = processNewsData(fallbackData);
            setRawNews(fallbackData);
            setNews(processedFallback);
          }
        } catch (fallbackError) {
          console.error('备用数据处理失败:', fallbackError);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [processNewsData, lastFetchTime, loading, news.length]);

  // 语言变化时重新处理现有数据
  useEffect(() => {
    if (rawNews.length > 0) {
      console.log('🔄 语言或数据变化，重新处理新闻数据:', rawNews.length, '条');
      console.log('🔄 processNewsData依赖项已更新，开始重新处理...');
      const processedData = processNewsData(rawNews);
      console.log('🔄 处理完成，设置新闻数据:', processedData.length, '条');
      setNews(processedData);
    }
  }, [rawNews, processNewsData]);

  // 初始化数据加载
  useEffect(() => {
    loadNews();
    
    // 设置定时刷新新闻（每30分钟检查一次，减少频率）
    const interval = setInterval(() => {
      console.log('🔄 定时刷新新闻数据...');
      loadNews(true);
    }, 30 * 60 * 1000); // 改为30分钟
    
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