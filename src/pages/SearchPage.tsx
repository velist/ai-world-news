import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, Filter, X, TrendingUp, Clock } from 'lucide-react';
import { NewsCard } from '@/components/NewsCard';
import { MobileNavigation } from '@/components/MobileNavigation';
import { useNews } from '@/hooks/useNews';
import { useNewsTranslation } from '@/hooks/useNewsTranslation';

const SearchPage = () => {
  const { isZh } = useLanguage();
  const { news, categories } = useNews();
  const { getLocalizedCategory } = useNewsTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 从localStorage加载搜索历史
  useEffect(() => {
    const history = localStorage.getItem('search-history');
    if (history) {
      try {
        setSearchHistory(JSON.parse(history));
      } catch (error) {
        console.error('加载搜索历史失败:', error);
      }
    }
  }, []);

  // 保存搜索历史
  const saveSearchHistory = (term: string) => {
    if (!term.trim()) return;
    const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('search-history', JSON.stringify(newHistory));
  };

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('search-history');
  };

  // 搜索和过滤新闻
  const filteredNews = useMemo(() => {
    const normalizedTerm = searchTerm.trim().toLowerCase();
    let filtered = [...news];

    // 按搜索词过滤
    if (normalizedTerm) {
      filtered = filtered.filter(item => {
        const candidates = [
          item.title,
          item.summary,
          item.content ?? '',
          item.source ?? ''
        ].map(text => text.toLowerCase());
        return candidates.some(text => text.includes(normalizedTerm));
      });
    }

    // 按分类过滤（与首页一致，按本地化分类比较）
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => getLocalizedCategory(item.category) === selectedCategory);
    }

    const sortedNews = [...filtered];

    if (sortBy === 'date') {
      return sortedNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    }

    // 相关性排序：标题匹配优先，然后按发布时间
    return sortedNews.sort((a, b) => {
      if (normalizedTerm) {
        const aTitle = a.title.toLowerCase().includes(normalizedTerm);
        const bTitle = b.title.toLowerCase().includes(normalizedTerm);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
      }
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [news, searchTerm, selectedCategory, sortBy, getLocalizedCategory]);

  // 热门搜索词
  const popularSearches = [
    'GPT-4', 'Claude', '人工智能', 'OpenAI', '机器学习',
    '深度学习', 'AI应用', '自动驾驶', '聊天机器人', '大模型'
  ];

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim()) {
      saveSearchHistory(term.trim());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isZh ? 'AI推 - 搜索新闻' : 'AI Push - Search News'}</title>
        <meta name="description" content={isZh ? '搜索AI相关新闻和资讯' : 'Search AI-related news and information'} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={isZh ? '搜索AI新闻...' : 'Search AI news...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchTerm);
                }
              }}
              className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="p-1 hover:bg-muted rounded-sm"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {!searchTerm ? (
          // 搜索建议页面
          <div className="space-y-6">
            {/* 搜索历史 */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    {isZh ? '搜索历史' : 'Search History'}
                  </h3>
                  <button
                    onClick={clearSearchHistory}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    {isZh ? '清除' : 'Clear'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(term)}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-full text-sm"
                    >
                      <Clock className="h-3 w-3" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 热门搜索 */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isZh ? '热门搜索' : 'Popular Searches'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(term)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-full text-sm"
                  >
                    <TrendingUp className="h-3 w-3" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 最新新闻预览 */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">
                {isZh ? '最新新闻' : 'Latest News'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {news.slice(0, 6).map((item) => (
                  <NewsCard
                    key={item.id}
                    {...item}
                    onImageError={() => {}}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          // 搜索结果页面
          <div className="space-y-4">
            {/* 过滤器 */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-sm bg-background border border-input rounded px-2 py-1"
                >
                  <option value="all">{isZh ? '全部分类' : 'All Categories'}</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{isZh ? '排序:' : 'Sort:'}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'relevance' | 'date')}
                  className="text-sm bg-background border border-input rounded px-2 py-1"
                >
                  <option value="relevance">{isZh ? '相关性' : 'Relevance'}</option>
                  <option value="date">{isZh ? '时间' : 'Date'}</option>
                </select>
              </div>
            </div>

            {/* 搜索结果统计 */}
            <p className="text-sm text-muted-foreground">
              {isZh 
                ? `找到 ${filteredNews.length} 条相关新闻`
                : `Found ${filteredNews.length} relevant news items`}
            </p>

            {/* 搜索结果 */}
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {filteredNews.map((item) => (
                  <NewsCard
                    key={item.id}
                    {...item}
                    onImageError={() => {}}
                    className="h-full"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  {isZh ? '没有找到相关新闻' : 'No news found'}
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {isZh 
                    ? `没有找到包含 "${searchTerm}" 的新闻，试试其他关键词吧`
                    : `No news found containing "${searchTerm}". Try different keywords.`}
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 移动端导航 */}
      <MobileNavigation 
        currentPath="/search"
        onMenuClick={() => {
          console.log('Menu clicked');
        }}
      />
    </div>
  );
};

export default SearchPage;

