import { useState } from 'react';
import { AppHeader } from '@/components/AppHeader';
import { CategoryTabs } from '@/components/CategoryTabs';
import { NewsCard } from '@/components/NewsCard';
import { NewsDetail } from '@/components/NewsDetail';
import { useNews } from '@/hooks/useNews';
import { NewsItem } from '@/types/news';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { news, loading, categories, selectedCategory, setSelectedCategory } = useNews();
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>正在加载最新新闻...</span>
            </div>
          </div>
        )}

        {/* News Grid */}
        {!loading && (
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
        {!loading && news.length === 0 && (
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
