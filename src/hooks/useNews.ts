import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 从静态JSON文件获取新闻数据 - 适配GitHub Pages路径
        const basePath = import.meta.env.MODE === 'production' ? '/ai-world-news' : '';
        const response = await fetch(`${basePath}/news-data.json`);
        
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
    
    // 设置定时刷新新闻（每30分钟检查一次）
    const interval = setInterval(fetchNews, 30 * 60 * 1000);
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
      // 触发新的获取
      setTimeout(async () => {
        try {
          const basePath = import.meta.env.MODE === 'production' ? '/ai-world-news' : '';
          const response = await fetch(`${basePath}/news-data.json?t=` + Date.now());
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