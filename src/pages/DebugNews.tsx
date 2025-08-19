import { useNews } from '@/hooks/useNews';
import { useEffect } from 'react';

const DebugNews = () => {
  const { news, loading, error, categories, selectedCategory } = useNews();

  useEffect(() => {
    console.log('=== DebugNews 组件状态 ===');
    console.log('news.length:', news.length);
    console.log('loading:', loading);
    console.log('error:', error);
    console.log('selectedCategory:', selectedCategory);
    console.log('categories:', categories);
    console.log('news前3条:', news.slice(0, 3));
  }, [news, loading, error, selectedCategory, categories]);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>新闻调试页面</h1>
      <div>
        <p>加载状态: {loading ? '是' : '否'}</p>
        <p>错误信息: {error || '无'}</p>
        <p>新闻数量: {news.length}</p>
        <p>当前分类: {selectedCategory}</p>
        <p>分类数量: {categories.length}</p>
      </div>
      
      {news.length > 0 && (
        <div>
          <h2>前5条新闻:</h2>
          {news.slice(0, 5).map((item, index) => (
            <div key={item.id} style={{ border: '1px solid #ccc', margin: '10px', padding: '10px' }}>
              <h3>{index + 1}. {item.title}</h3>
              <p>来源: {item.source}</p>
              <p>分类: {item.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DebugNews;