import { useState, useEffect } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryTabs } from '@/components/CategoryTabs';
import { NewsCard } from '@/components/NewsCard';
import { NewsDetail } from '@/components/NewsDetail';
import { useNews } from '@/hooks/useNews';
import { NewsItem } from '@/types/news';
import { Loader2, RefreshCw, Clock } from 'lucide-react';

const Index = () => {
  const { news, loading, error, categories, selectedCategory, setSelectedCategory, refreshNews } = useNews();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());

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

  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) {
      return '刚刚更新';
    } else if (minutes < 60) {
      return `${minutes}分钟前更新`;
    } else {
      const hours = Math.floor(minutes / 60);
      return `${hours}小时前更新`;
    }
  };

  if (selectedNews) {
    return (
      <NewsDetail
        {...selectedNews}
        onBack={() => setSelectedNews(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      
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
              <span className="text-xs opacity-75">• 每5分钟自动刷新</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm">刷新</span>
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-red-500 mb-4 text-center">
              <p className="font-semibold">新闻获取失败</p>
              <p className="text-sm">{error}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>重新获取</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>正在获取最新AI新闻...</span>
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
                  onClick={() => setSelectedNews(item)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">暂无新闻</h3>
            <p className="text-muted-foreground">请稍后再试，或切换其他分类查看</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
