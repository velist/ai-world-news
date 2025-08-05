import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { NewsDetail } from '@/components/NewsDetail';
import { NewsItem } from '@/types/news';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isZh } = useLanguage();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewsById = async () => {
      if (!id) {
        setError(isZh ? '新闻ID无效' : 'Invalid news ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 从本地存储的新闻数据中查找
        const response = await fetch(`/news-data.json?t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(isZh ? '无法获取新闻数据' : 'Failed to fetch news data');
        }
        
        const newsResponse = await response.json();
        const allNews: NewsItem[] = newsResponse.data || newsResponse;
        const foundNews = allNews.find(item => item.id === id);
        
        if (!foundNews) {
          throw new Error(isZh ? '新闻不存在' : 'News not found');
        }
        
        setNews(foundNews);
      } catch (error) {
        console.error('Error fetching news:', error);
        setError(error instanceof Error ? error.message : (isZh ? '获取新闻失败' : 'Failed to fetch news'));
      } finally {
        setLoading(false);
      }
    };

    fetchNewsById();
  }, [id, isZh]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{isZh ? '正在加载新闻...' : 'Loading news...'}</span>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <p className="font-semibold">{error || (isZh ? '新闻未找到' : 'News not found')}</p>
          </div>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            {isZh ? '返回首页' : 'Back to Home'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{news.title} - AI推趣新闻</title>
        <meta name="description" content={news.summary} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`${window.location.origin}/news/${news.id}`} />
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={news.summary} />
        <meta property="og:image" content={news.imageUrl} />
        <meta property="og:site_name" content="AI推趣新闻" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={`${window.location.origin}/news/${news.id}`} />
        <meta property="twitter:title" content={news.title} />
        <meta property="twitter:description" content={news.summary} />
        <meta property="twitter:image" content={news.imageUrl} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={news.publishedAt} />
        <meta property="article:author" content={news.source} />
        <meta property="article:section" content={news.category} />
        
        {/* 微信分享专用 */}
        <meta name="weixin:card" content="summary_large_image" />
        <meta name="weixin:title" content={news.title} />
        <meta name="weixin:description" content={news.summary} />
        <meta name="weixin:image" content={news.imageUrl} />
      </Helmet>
      
      <NewsDetail
        {...news}
        onBack={handleBack}
      />
    </>
  );
};

export default NewsDetailPage;