import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { AppHeader } from '@/components/AppHeader';
import { CategoryTabs } from '@/components/CategoryTabs';
import { NewsCard } from '@/components/NewsCard';
import { SideMenu } from '@/components/SideMenu';
import { DailyBriefing } from '@/components/DailyBriefing';
import { Disclaimer } from '@/components/Disclaimer';
import { EmailSubscribe } from '@/components/EmailSubscribe';
import { useNews } from '@/hooks/useNews';
import { useLanguage } from '@/contexts/LanguageContext';
import { Loader2, RefreshCw, Clock } from 'lucide-react';

const Index = () => {
  const { news, loading, error, categories, selectedCategory, setSelectedCategory, refreshNews } = useNews();
  const { isZh } = useLanguage();
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [sideMenuOpen, setSideMenuOpen] = useState(false);
  const [dailyBriefingOpen, setDailyBriefingOpen] = useState(false);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [emailSubscribeOpen, setEmailSubscribeOpen] = useState(false);

  // 更新最后刷新时间
  useEffect(() => {
    if (!loading && !error && news.length > 0) {
      setLastUpdateTime(new Date());
    }
  }, [news, loading, error]);

  const handleRefresh = () => {
    refreshNews();
    setLastUpdateTime(new Date());
  };

  const handleMenuClick = (menuItem: string) => {
    setSideMenuOpen(false);
    switch (menuItem) {
      case 'daily-briefing':
        setDailyBriefingOpen(true);
        break;
      case 'rss-subscribe':
        setEmailSubscribeOpen(true);
        break;
      case 'disclaimer':
        setDisclaimerOpen(true);
        break;
    }
  };

  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) {
      return isZh ? '刚刚更新' : 'Just updated';
    } else if (minutes < 60) {
      return isZh ? `${minutes}分钟前更新` : `Updated ${minutes}m ago`;
    } else {
      const hours = Math.floor(minutes / 60);
      return isZh ? `${hours}小时前更新` : `Updated ${hours}h ago`;
    }
  };

  return (
    <>
      <Helmet>
        <title>AI推趣新闻 - 最新AI资讯聚合平台</title>
        <meta name="description" content="AI推趣新闻为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.origin} />
        <meta property="og:title" content="AI推趣新闻 - 最新AI资讯聚合平台" />
        <meta property="og:description" content="AI推趣新闻为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        <meta property="og:image" content={`${window.location.origin}/og-image.png`} />
        <meta property="og:site_name" content="AI推趣新闻" />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={window.location.origin} />
        <meta property="twitter:title" content="AI推趣新闻 - 最新AI资讯聚合平台" />
        <meta property="twitter:description" content="AI推趣新闻为您聚合最新的人工智能资讯、技术动态、深度分析和行业趋势，让您第一时间了解AI领域的最新发展。" />
        <meta property="twitter:image" content={`${window.location.origin}/og-image.png`} />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <AppHeader onMenuClick={() => setSideMenuOpen(true)} />
      
      {/* 侧边菜单 */}
      <SideMenu 
        isOpen={sideMenuOpen}
        onClose={() => setSideMenuOpen(false)}
        onMenuClick={handleMenuClick}
      />
      
      {/* 每日晨报弹窗 */}
      <DailyBriefing 
        isOpen={dailyBriefingOpen}
        onClose={() => setDailyBriefingOpen(false)}
      />
      
      {/* 免责声明弹窗 */}
      <Disclaimer 
        isOpen={disclaimerOpen}
        onClose={() => setDisclaimerOpen(false)}
      />
      
      {/* 邮箱订阅弹窗 */}
      <EmailSubscribe 
        isOpen={emailSubscribeOpen}
        onClose={() => setEmailSubscribeOpen(false)}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Category Tabs */}
        <div className="flex justify-center">
          <CategoryTabs
            categories={categories}
            activeCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Update Status and Refresh */}
        {!error && (
          <div className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-3">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatUpdateTime(lastUpdateTime)}</span>
              <span className="text-xs opacity-75">• {isZh ? '每5分钟自动刷新' : 'Auto refresh every 5min'}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">{isZh ? '刷新' : 'Refresh'}</span>
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4 text-center">
              <p className="font-semibold">{isZh ? '新闻获取失败' : 'Failed to fetch news'}</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{isZh ? '重新获取' : 'Retry'}</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>{isZh ? '正在获取最新AI新闻...' : 'Loading latest AI news...'}</span>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {news.map((item, index) => (
              <div
                key={item.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <NewsCard
                  {...item}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">{isZh ? '暂无新闻' : 'No news available'}</h3>
            <p className="text-muted-foreground">{isZh ? '请稍后再试，或切换其他分类查看' : 'Please try again later or switch to another category'}</p>
          </div>
        )}
        </div>
      </div>
    </>
  );
};

export default Index;
