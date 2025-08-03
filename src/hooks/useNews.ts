import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('AI');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async (bypassCache = false) => {
      setLoading(true);
      setError(null);
      
      try {
        // 从静态JSON文件获取新闻数据 - 添加时间戳防止缓存
        const timestamp = bypassCache ? Date.now() : Math.floor(Date.now() / (5 * 60 * 1000)); // 5分钟缓存
        const response = await fetch(`/news-data.json?t=${timestamp}`, {
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
          setNews(data.data);
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

  // 修复过滤逻辑：全部显示所有新闻，其他分类只显示对应分类的新闻
  const filteredNews = selectedCategory === '全部' 
    ? news 
    : news.filter(item => item.category === selectedCategory);

  // 添加"全部"分类作为首选项，将"AI模型"改为"AI"
  const categories = ['全部', 'AI', '科技', '经济', '深度分析'];

  return {
    news: filteredNews,
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
              setNews(data.data);
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