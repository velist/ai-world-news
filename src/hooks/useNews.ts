import { useState, useEffect } from 'react';
import { NewsItem } from '@/types/news';
import { supabase } from '@/integrations/supabase/client';

export const useNews = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('AI 模型');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase.functions.invoke('fetch-news');
        
        if (error) {
          console.error('Error fetching news:', error);
          setError('获取新闻失败，请稍后重试');
          return;
        }
        
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
    
    // 设置定时刷新新闻（每15分钟）
    const interval = setInterval(fetchNews, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredNews = news.filter(item => 
    selectedCategory === 'AI 模型' ? true : item.category === selectedCategory
  );

  const categories = ['AI 模型', '科技', '经济', '深度分析'];

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
      setTimeout(() => {
        supabase.functions.invoke('fetch-news').then(({ data, error }) => {
          if (error) {
            setError('刷新失败');
          } else if (data?.success && data?.data) {
            setNews(data.data);
          }
          setLoading(false);
        });
      }, 100);
    }
  };
};