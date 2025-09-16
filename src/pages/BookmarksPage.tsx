import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bookmark, BookmarkCheck, Trash2, Search } from 'lucide-react';
import { NewsCard } from '@/components/NewsCard';
import { MobileNavigation } from '@/components/MobileNavigation';
import { NewsItem } from '@/types/news';

const BookmarksPage = () => {
  const { isZh } = useLanguage();
  const navigate = useNavigate();
  const [bookmarkedNews, setBookmarkedNews] = useState<NewsItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 从localStorage获取收藏的新闻
  useEffect(() => {
    const loadBookmarks = () => {
      try {
        const bookmarks = localStorage.getItem('bookmarked-news');
        if (bookmarks) {
          const parsedBookmarks = JSON.parse(bookmarks);
          setBookmarkedNews(Array.isArray(parsedBookmarks) ? parsedBookmarks : []);
        }
      } catch (error) {
        console.error('加载收藏新闻失败:', error);
        setBookmarkedNews([]);
      }
    };

    loadBookmarks();

    // 监听localStorage变化
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarked-news') {
        loadBookmarks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // 移除收藏
  const removeBookmark = (newsId: string) => {
    try {
      const updatedBookmarks = bookmarkedNews.filter(news => news.id !== newsId);
      setBookmarkedNews(updatedBookmarks);
      localStorage.setItem('bookmarked-news', JSON.stringify(updatedBookmarks));
    } catch (error) {
      console.error('移除收藏失败:', error);
    }
  };

  // 清空所有收藏
  const clearAllBookmarks = () => {
    if (window.confirm(isZh ? '确定要清空所有收藏吗？' : 'Clear all bookmarks?')) {
      setBookmarkedNews([]);
      localStorage.removeItem('bookmarked-news');
    }
  };

  // 搜索过滤
  const filteredNews = bookmarkedNews.filter(news =>
    news.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    news.source.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{isZh ? 'AI推 - 我的收藏' : 'AI Push - My Bookmarks'}</title>
        <meta name="description" content={isZh ? '查看我收藏的AI新闻和文章' : 'View my saved AI news and articles'} />
      </Helmet>

      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookmarkCheck className="h-6 w-6 text-primary" />
              <h1 className="text-lg font-semibold">{isZh ? '我的收藏' : 'My Bookmarks'}</h1>
            </div>
            {bookmarkedNews.length > 0 && (
              <button
                onClick={clearAllBookmarks}
                className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isZh ? '清空' : 'Clear'}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {bookmarkedNews.length === 0 ? (
          // 空状态
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Bookmark className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {isZh ? '暂无收藏' : 'No bookmarks yet'}
            </h3>
            <p className="text-muted-foreground max-w-md">
              {isZh 
                ? '在浏览新闻时点击收藏按钮，就可以在这里找到它们了' 
                : 'Bookmark news articles while browsing to find them here later'
              }
            </p>
            <button
              onClick={() => navigate('/')}
              className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              {isZh ? '去看新闻' : 'Browse News'}
            </button>
          </div>
        ) : (
          <>
            {/* 搜索栏 */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={isZh ? '搜索收藏的新闻...' : 'Search bookmarked news...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* 收藏统计 */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-muted-foreground">
                {filteredNews.length === bookmarkedNews.length
                  ? (isZh ? `共 ${bookmarkedNews.length} 条收藏` : `${bookmarkedNews.length} bookmarks total`)
                  : (isZh 
                      ? `显示 ${filteredNews.length} 条，共 ${bookmarkedNews.length} 条收藏`
                      : `Showing ${filteredNews.length} of ${bookmarkedNews.length} bookmarks`
                    )
                }
              </p>
            </div>

            {/* 新闻网格 */}
            {filteredNews.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                {filteredNews.map((news) => (
                  <div key={news.id} className="relative group">
                    <NewsCard
                      {...news}
                      onImageError={() => {}}
                      className="h-full"
                    />
                    {/* 移除收藏按钮 */}
                    <button
                      onClick={() => removeBookmark(news.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      title={isZh ? '移除收藏' : 'Remove bookmark'}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isZh ? '没有找到匹配的收藏新闻' : 'No matching bookmarked news found'}
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* 移动端导航 */}
      <MobileNavigation 
        currentPath="/bookmarks"
        onMenuClick={() => {
          // 这里可以添加菜单点击逻辑
          console.log('Menu clicked');
        }}
      />
    </div>
  );
};

export default BookmarksPage;


