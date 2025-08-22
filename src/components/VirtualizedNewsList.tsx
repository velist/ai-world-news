import React, { useMemo, useRef, useCallback } from 'react';
import { FixedSizeList as List } from 'react-window';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types/news';

interface VirtualizedNewsListProps {
  news: NewsItem[];
  className?: string;
  itemHeight?: number;
  containerHeight?: number;
  columns?: number;
}

interface NewsRowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    news: NewsItem[];
    columns: number;
    itemHeight: number;
  };
}

const NewsRow: React.FC<NewsRowProps> = React.memo(({ index, style, data }) => {
  const { news, columns, itemHeight } = data;
  const startIndex = index * columns;
  const rowItems = news.slice(startIndex, startIndex + columns);

  return (
    <div style={style}>
      <div 
        className="grid gap-6 px-4"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          height: itemHeight
        }}
      >
        {rowItems.map((item) => (
          <div 
            key={item.id}
            className="animate-fade-in"
          >
            <NewsCard {...item} />
          </div>
        ))}
      </div>
    </div>
  );
});

NewsRow.displayName = 'NewsRow';

export const VirtualizedNewsList: React.FC<VirtualizedNewsListProps> = ({
  news,
  className = '',
  itemHeight = 400,
  containerHeight = 600,
  columns = 3
}) => {
  const listRef = useRef<List>(null);

  // 计算需要的行数
  const rowCount = useMemo(() => {
    return Math.ceil(news.length / columns);
  }, [news.length, columns]);

  // 响应式列数计算
  const responsiveColumns = useMemo(() => {
    if (typeof window === 'undefined') return columns;
    
    const width = window.innerWidth;
    if (width < 768) return 1; // mobile
    if (width < 1024) return 2; // tablet
    return columns; // desktop
  }, [columns]);

  // 行数据
  const itemData = useMemo(() => ({
    news,
    columns: responsiveColumns,
    itemHeight
  }), [news, responsiveColumns, itemHeight]);

  // 滚动到顶部
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToItem(0, 'start');
  }, []);

  // 处理窗口大小变化
  React.useEffect(() => {
    const handleResize = () => {
      if (listRef.current) {
        // 强制重新计算列数
        listRef.current.resetAfterIndex(0);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 如果新闻数量很少，使用常规渲染
  if (news.length <= responsiveColumns * 3) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {news.map((item, index) => (
          <div
            key={item.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <NewsCard {...item} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      <List
        ref={listRef}
        height={containerHeight}
        itemCount={rowCount}
        itemSize={itemHeight + 24} // 添加gap空间
        itemData={itemData}
        overscanCount={2} // 预渲染额外的行数
        className="news-virtual-list"
      >
        {NewsRow}
      </List>
    </div>
  );
};

// 添加CSS样式
const virtualizedStyles = `
  .news-virtual-list {
    /* 自定义滚动条样式 */
    scrollbar-width: thin;
    scrollbar-color: #cbd5e0 #f7fafc;
  }

  .news-virtual-list::-webkit-scrollbar {
    width: 8px;
  }

  .news-virtual-list::-webkit-scrollbar-track {
    background: #f7fafc;
    border-radius: 4px;
  }

  .news-virtual-list::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 4px;
  }

  .news-virtual-list::-webkit-scrollbar-thumb:hover {
    background: #a0aec0;
  }

  /* 优化渲染性能 */
  .news-virtual-list * {
    transform: translateZ(0);
    will-change: transform;
  }
`;

// 注入样式
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = virtualizedStyles;
  document.head.appendChild(styleSheet);
}