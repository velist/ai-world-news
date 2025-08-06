import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { NewsDetail } from '@/components/NewsDetail';
import { NewsItem } from '@/types/news';
import { Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { generateWeChatShareUrl, isWeChatEnvironment } from '@/hooks/useWeChatEnvironment';

const NewsDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isZh } = useLanguage();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // 限制重试次数，避免无限循环
  const MAX_RETRIES = 2;
  const RETRY_DELAY = 1500;

  // 检测是否为微信浏览器
  const isWeChat = isWeChatEnvironment();

  // 微信环境下从Hash中提取新闻ID
  useEffect(() => {
    if (isWeChat && !id && window.location.hash) {
      const hash = window.location.hash;
      const match = hash.match(/#\/news\/(.+)/);
      if (match && match[1]) {
        console.log('🔍 从Hash中提取新闻ID:', match[1]);
        // 使用提取的ID重新导航
        navigate(`/news/${match[1]}`, { replace: true });
        return;
      }
    }
  }, [id, isWeChat, navigate]);

  useEffect(() => {
    const fetchNewsById = async () => {
      console.log('🔍 NewsDetailPage参数检查:', { id, isWeChat, hash: window.location.hash });
      
      if (!id) {
        setError(isZh ? '新闻ID无效' : 'Invalid news ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // 简化缓存破坏参数
        const cacheParam = `?t=${Date.now()}`;
        const response = await fetch(`/news-data.json${cacheParam}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        
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
        setRetryCount(0); // 重置重试计数
      } catch (error) {
        console.error('Error fetching news:', error, 'Retry count:', retryCount);
        
        // 在微信浏览器中限制重试
        if (isWeChat && retryCount < MAX_RETRIES) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
          return;
        }
        
        setError(error instanceof Error ? error.message : (isZh ? '获取新闻失败' : 'Failed to fetch news'));
      } finally {
        setLoading(false);
      }
    };

    fetchNewsById();
  }, [id, isZh, retryCount, isWeChat]);

  const handleBack = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="text-center">
            {isZh ? '正在加载新闻...' : 'Loading news...'}
            {isWeChat && retryCount > 0 && (
              <div className="text-xs mt-2 opacity-75">
                {isZh ? `重试中 (${retryCount}/3)` : `Retrying (${retryCount}/3)`}
              </div>
            )}
          </span>
          {isWeChat && (
            <div className="text-xs text-center opacity-60 max-w-xs">
              {isZh ? '微信浏览器首次加载可能较慢，请稍候...' : 'First loading in WeChat may be slow, please wait...'}
            </div>
          )}
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
        <title>{news.title} - AI推</title>
        <meta name="description" content={news.summary} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={generateWeChatShareUrl(news.id)} />
        <meta property="og:title" content={news.title} />
        <meta property="og:description" content={news.summary} />
        <meta property="og:image" content={news.imageUrl || `https://news.aipush.fun/share-icon.svg`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="AI推" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={generateWeChatShareUrl(news.id)} />
        <meta property="twitter:title" content={news.title} />
        <meta property="twitter:description" content={news.summary} />
        <meta property="twitter:image" content={news.imageUrl || `https://news.aipush.fun/share-icon.svg`} />
        
        {/* Article specific */}
        <meta property="article:published_time" content={news.publishedAt} />
        <meta property="article:author" content={news.source} />
        <meta property="article:section" content={news.category} />
        
        {/* 微信分享专用 */}
        <meta name="weixin:card" content="summary_large_image" />
        <meta name="weixin:title" content={news.title} />
        <meta name="weixin:description" content={news.summary} />
        <meta name="weixin:image" content={news.imageUrl || `https://news.aipush.fun/share-icon.svg`} />
        
        {/* 微信环境优化 */}
        {isWeChat && (
          <meta name="weixin:optimized" content="true" />
        )}
      </Helmet>
      
      <NewsDetail
        {...news}
        onBack={handleBack}
      />
    </>
  );
};

export default NewsDetailPage;