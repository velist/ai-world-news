import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppHeader } from '@/components/AppHeader';
import { CategoryTabs } from '@/components/CategoryTabs';
import { NewsCard } from '@/components/NewsCard';
import { SideMenu } from '@/components/SideMenu';
import { DailyBriefing } from '@/components/DailyBriefing';
import { Disclaimer } from '@/components/Disclaimer';
import { EmailSubscribe } from '@/components/EmailSubscribe';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { MobileNavigation, MobileGestureHint } from '@/components/MobileNavigation';
import { useNews } from '@/hooks/useNews';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollPosition } from '@/hooks/useScrollPosition';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { RefreshCw, Clock } from 'lucide-react';

const Index = () => {
  const { news, loading, error, categories, selectedCategory, setSelectedCategory, refreshNews } = useNews();
  const { isZh } = useLanguage();
  const { saveScrollPosition, restoreScrollPosition } = useScrollPosition({
    key: 'news-list-scroll',
    restoreOnMount: true,
    saveOnUnmount: true
  });
  const { debounce } = usePerformanceOptimization();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [dailyBriefingOpen, setDailyBriefingOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [emailSubscribeOpen, setEmailSubscribeOpen] = useState(false);

  useEffect(() => {
    if (!loading && !error && news.length > 0) {
      setLastUpdateTime(new Date());
    }
  }, [news, loading, error]);

  const handleRefresh = debounce(() => {
    saveScrollPosition();
    refreshNews();
    setLastUpdateTime(new Date());
    setTimeout(() => restoreScrollPosition(), 300);
  }, 1000);

  const handleMenuClick = (menuItem: string) => {
    setSideMenuOpen(false);
    switch (menuItem) {
      case 'daily-briefing': setDailyBriefingOpen(true); break;
      case 'rss-subscribe': setEmailSubscribeOpen(true); break;
      case 'disclaimer': setDisclaimerOpen(true); break;
    }
  };

  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return isZh ? '刚刚更新' : 'Just updated';
    if (minutes < 60) return isZh ? `${minutes}分钟前更新` : `Updated ${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return isZh ? `${hours}小时前更新` : `Updated ${hours}h ago`;
  };

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      <PerformanceMonitor onMetrics={(metrics) => console.log('性能指标:', metrics)} />
      <Helmet>
        <title>AI推 - 最新AI资讯聚合平台</title>
        <meta name="description" content="AI推为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        <link rel="canonical" href="https://news.aipush.fun/" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />
        <meta name="wxcard:title" content="AI推 - 最新AI资讯聚合平台" />
        <meta name="wxcard:desc" content="AI推为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        <meta name="wxcard:imgUrl" content={`${window.location.origin}/wechat-share-300.png?v=2025080802`} />
        <meta name="wxcard:link" content={window.location.origin} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:title" content="AI推 - 最新AI资讯聚合平台" />
        <meta property="og:description" content="AI推为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        <meta property="og:image" content={`${window.location.origin}/wechat-share-300.png?v=2025080802`} />
        <meta property="og:image:width" content="300" />
        <meta property="og:image:height" content="300" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:site_name" content="AI推" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.origin} />
        <meta property="twitter:title" content="AI推 - 最新AI资讯聚合平台" />
        <meta property="twitter:description" content="AI推为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        <meta property="twitter:image" content={`${window.location.origin}/wechat-share-300.png?v=2025080802`} />
      </Helmet>

      <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
        <AppHeader onMenuClick={() => setSideMenuOpen(true)} />

        {/* Side Menu */}
        <SideMenu isOpen={sideMenuOpen} onClose={() => setSideMenuOpen(false)} onMenuClick={handleMenuClick} />
        <DailyBriefing isOpen={dailyBriefingOpen} onClose={() => setDailyBriefingOpen(false)} />
        <Disclaimer isOpen={disclaimerOpen} onClose={() => setDisclaimerOpen(false)} />
        <EmailSubscribe isOpen={emailSubscribeOpen} onClose={() => setEmailSubscribeOpen(false)} />

        {/* Main Content - Single Column */}
        <div className="max-w-[680px] mx-auto px-6 pb-20">
          {/* Category Tabs */}
          <div className="pt-4 pb-2">
            <CategoryTabs
              categories={categories}
              activeCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </div>

          {/* Update Status */}
          {!error && !loading && (
            <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
              <div className="flex items-center space-x-2 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <Clock className="w-3.5 h-3.5" />
                <span className="text-xs">{formatUpdateTime(lastUpdateTime)}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-colors border disabled:opacity-50"
                style={{
                  color: 'hsl(var(--muted-foreground))',
                  borderColor: 'hsl(var(--border))',
                  background: 'transparent'
                }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>{isZh ? '刷新' : 'Refresh'}</span>
              </button>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex flex-col items-center justify-center py-16">
              <p className="font-medium mb-1" style={{ color: 'hsl(var(--destructive))' }}>
                {isZh ? '新闻获取失败' : 'Failed to fetch news'}
              </p>
              <p className="text-sm mb-4" style={{ color: 'hsl(var(--muted-foreground))' }}>{error}</p>
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--card))' }}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{isZh ? '重新获取' : 'Retry'}</span>
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center space-x-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{
                        background: '#C5B9A8',
                        animationDelay: `${i * 0.2}s`
                      }}
                    />
                  ))}
                </div>
                <span className="text-sm">{isZh ? '正在获取最新资讯...' : 'Loading latest AI news...'}</span>
              </div>
            </div>
          )}

          {/* News List - Vertical */}
          {!loading && !error && news.length > 0 && (
            <div className="mobile-scroll-container">
              {news.map((item, index) => (
                <div
                  key={`${item.id}-${index}`}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 40, 800)}ms` }}
                >
                  <NewsCard {...item} />
                </div>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && news.length === 0 && (
            <div className="text-center py-16">
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
                {isZh ? '暂无新闻' : 'No news available'}
              </h3>
              <p style={{ color: 'hsl(var(--muted-foreground))' }}>
                {isZh ? '请稍后再试，或切换其他分类查看' : 'Please try again later or switch to another category'}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation onMenuClick={() => setSideMenuOpen(true)} currentPath="/" />
        <MobileGestureHint />
      </div>
    </div>
  );
};

export default Index;
