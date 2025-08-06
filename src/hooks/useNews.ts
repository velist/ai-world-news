import { useState, useEffect, useMemo } from 'react';
import { NewsItem } from '@/types/news';
import { useContentFilter } from './useContentFilter';
import { useNewsTranslation } from './useNewsTranslation';

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部'); // 默认选择"全部"分类
  const [error, setError] = useState<string | null>(null);
  const { filterNews } = useContentFilter();
  const { getLocalizedNewsArray, getLocalizedCategory } = useNewsTranslation();

  useEffect(() => {
    const fetchNews = async (bypassCache = false) => {
      setLoading(true);
      setError(null);
      
      try {
        // 检测是否为微信浏览器
        const isWeChat = /micromessenger/i.test(navigator.userAgent);
        
        // 从静态JSON文件获取新闻数据 - 强制破坏缓存立即获取最新数据
        const forceTimestamp = Date.now();
        const cacheParam = `?t=${forceTimestamp}&r=${Math.random()}&v=${Math.floor(forceTimestamp/1000)}&bust=true`;
        
        const response = await fetch(`/news-data.json${cacheParam}`, {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data?.success && data?.data) {
          console.log(`获取到原始新闻数据: ${data.data.length} 条`);
          
          // 应用内容过滤，移除政治敏感内容
          const filteredData = filterNews(data.data);
          console.log(`内容过滤后新闻数据: ${filteredData.length} 条 (被过滤掉 ${data.data.length - filteredData.length} 条)`);
          
          // 按时间降序排序 - 最新的在前面
          const sortedData = filteredData.sort((a, b) => {
            const timeA = new Date(a.publishedAt).getTime();
            const timeB = new Date(b.publishedAt).getTime();
            return timeB - timeA; // 降序：最新的在前面
          });
          
          console.log('排序后前10条新闻完整时间:', sortedData.slice(0, 10).map((item, index) => ({ 
            index: index + 1,
            title: item.title.substring(0, 40), 
            time: item.publishedAt,
            timeNum: new Date(item.publishedAt).getTime(),
            source: item.source,
            contentLength: item.content?.length || 0
          })));
          
          // 应用语言本地化
          const localizedData = getLocalizedNewsArray(sortedData);
          setNews(localizedData);
        } else {
          setError('新闻数据格式错误');
        }
      } catch (err) {
        console.error('Network error:', err);
        setError('网络连接错误，请检查网络设置');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    
    // 设置定时刷新新闻（每5分钟检查一次，更频繁）
    const interval = setInterval(() => fetchNews(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 使用useMemo确保排序逻辑正确执行，依赖news和selectedCategory
  const sortedFilteredNews = useMemo(() => {
    console.log('重新计算排序后的新闻', { newsCount: news.length, selectedCategory });
    
    // 修复过滤逻辑：全部显示所有新闻，其他分类只显示对应分类的新闻
    const filteredNews = selectedCategory === getLocalizedCategory('全部') 
      ? news 
      : news.filter(item => {
          // 将原始分类映射到本地化分类进行比较
          const localizedItemCategory = getLocalizedCategory(item.category);
          return localizedItemCategory === selectedCategory;
        });

    // 对过滤后的新闻重新排序，确保时间顺序正确
    const sorted = [...filteredNews].sort((a, b) => {
      const timeA = new Date(a.publishedAt).getTime();
      const timeB = new Date(b.publishedAt).getTime();
      return timeB - timeA; // 降序：最新的在前面
    });
    
    console.log('排序后前3条新闻时间:', sorted.slice(0, 3).map(item => ({ 
      title: item.title.substring(0, 30), 
      time: item.publishedAt 
    })));
    
    // 紧急调试：检查前10条时间是否正确
    console.log('🚨 前端最终前10条新闻时间检查:', sorted.slice(0, 10).map((item, index) => ({
      index: index + 1,
      title: item.title.substring(0, 40),
      time: item.publishedAt,
      timestamp: new Date(item.publishedAt).getTime(),
      source: item.source
    })));
    
    return sorted;
  }, [news, selectedCategory, getLocalizedCategory]);

// 添加"全部"分类作为首选项，匹配后端的四分类体系
  const rawCategories = ['全部', '中国AI', '国际AI', '科技新闻', 'AI趣味新闻'];
  const categories = rawCategories.map(cat => getLocalizedCategory(cat));

  return {
    news: sortedFilteredNews,
    loading,
    error,
    categories,
    selectedCategory,
    setSelectedCategory,
    refreshNews: () => {
      setLoading(true);
      setError(null);
      // 立即触发新的获取，绕过所有缓存
      setTimeout(async () => {
        try {
          const response = await fetch(`/news-data.json?t=${Date.now()}`, {
            cache: 'no-cache',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data?.success && data?.data) {
              // 应用内容过滤，移除政治敏感内容
              const filteredData = filterNews(data.data);
              // 按时间降序排序 - 最新的在前面
              const sortedData = filteredData.sort((a, b) => {
                const timeA = new Date(a.publishedAt).getTime();
                const timeB = new Date(b.publishedAt).getTime();
                return timeB - timeA; // 降序：最新的在前面
              });
              // 应用语言本地化
              const localizedData = getLocalizedNewsArray(sortedData);
              setNews(localizedData);
            }
          } else {
            setError('刷新失败');
          }
        } catch (err) {
          setError('刷新失败');
        } finally {
          setLoading(false);
        }
      }, 100);
    }
  };
};