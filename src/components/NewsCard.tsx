import { Clock, ExternalLink, Share2, Bookmark, BookmarkCheck } from "lucide-react";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";
import { generateWeChatShareUrl } from "@/hooks/useWeChatEnvironment";
import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";

interface NewsCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
  className?: string;
  onImageError?: () => void;
}

export const NewsCard = ({
  id,
  title,
  summary,
  imageUrl,
  source,
  publishedAt,
  category,
  className = "",
}: NewsCardProps) => {
  const { getLocalizedCategory } = useNewsTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const displayTitle = title;
  // 正文质量检查：如果摘要和标题完全相同或太短，不显示
  const hasSummary = summary && summary.trim() !== title.trim() && summary.trim().length > 15 && !title.startsWith(summary.trim());

  // 检查收藏状态
  useEffect(() => {
    try {
      const bookmarks = localStorage.getItem('bookmarked-news');
      if (bookmarks) {
        const bookmarkList = JSON.parse(bookmarks);
        setIsBookmarked(Array.isArray(bookmarkList) && bookmarkList.some(item => item.id === id));
      }
    } catch (error) {
      console.error('检查收藏状态失败:', error);
    }
  }, [id]);

  // 处理收藏
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const bookmarks = localStorage.getItem('bookmarked-news');
      let bookmarkList = bookmarks ? JSON.parse(bookmarks) : [];
      if (!Array.isArray(bookmarkList)) bookmarkList = [];

      if (isBookmarked) {
        bookmarkList = bookmarkList.filter((item: any) => item.id !== id);
        setIsBookmarked(false);
      } else {
        bookmarkList.unshift({ id, title, summary, imageUrl, source, publishedAt, category });
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarked-news', JSON.stringify(bookmarkList));
    } catch (error) {
      console.error('收藏操作失败:', error);
    }
  };

  // 莫兰迪分类色
  const getCategoryStyle = (cat: string) => {
    const c = (cat || '').toLowerCase();
    if (c.includes('中国') || c.includes('国内') || c.includes('china'))
      return { color: '#C4A7A0', background: 'rgba(196, 167, 160, 0.12)', border: '1px solid rgba(196, 167, 160, 0.25)' };
    if (c.includes('国际') || c.includes('国外') || c.includes('international'))
      return { color: '#9EADB8', background: 'rgba(158, 173, 184, 0.12)', border: '1px solid rgba(158, 173, 184, 0.25)' };
    if (c.includes('科技') || c.includes('tech'))
      return { color: '#A3B0A0', background: 'rgba(163, 176, 160, 0.12)', border: '1px solid rgba(163, 176, 160, 0.25)' };
    if (c.includes('趣味') || c.includes('fun') || c.includes('趣闻'))
      return { color: '#B5A5B8', background: 'rgba(181, 165, 184, 0.12)', border: '1px solid rgba(181, 165, 184, 0.25)' };
    return { color: '#C5B9A8', background: 'rgba(197, 185, 168, 0.12)', border: '1px solid rgba(197, 185, 168, 0.25)' };
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '';
      const diff = Math.abs(new Date().getTime() - date.getTime());
      const minutes = Math.floor(diff / (1000 * 60));
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      if (minutes < 60) return `${minutes}分钟前`;
      if (hours < 24) return `${hours}小时前`;
      return `${days}天前`;
    } catch {
      return '';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const shareUrl = generateWeChatShareUrl(id);
    const shareText = `${displayTitle} - AI推`;

    if (navigator.share) {
      navigator.share({ title: shareText, text: (summary || '').substring(0, 100), url: shareUrl }).catch(() => {
        // fallback to copy
        if (navigator.clipboard) {
          navigator.clipboard.writeText(shareUrl).then(() => alert('链接已复制'));
        }
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => alert('链接已复制到剪贴板'));
    }
  };

  const catStyle = getCategoryStyle(category);

  return (
    <Link to={`/news/${id}`} className="block">
      <article
        ref={cardRef}
        className={`group cursor-pointer transition-all duration-200 ${className}`}
        style={{
          padding: '24px 0',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        {/* Meta: category · source · time */}
        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
          <span
            className="text-xs font-medium px-2.5 py-0.5 rounded-full"
            style={catStyle}
          >
            {getLocalizedCategory(category)}
          </span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--muted-foreground))' }} />
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{source}</span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--muted-foreground))' }} />
          <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>{formatTime(publishedAt)}</span>
        </div>

        {/* Title */}
        <h2
          className="text-base sm:text-lg font-semibold leading-relaxed mb-2 line-clamp-2 transition-colors duration-200"
          style={{ color: 'hsl(var(--foreground))' }}
        >
          {displayTitle}
        </h2>

        {/* Summary - only if different from title */}
        {hasSummary && (
          <p
            className="text-sm leading-relaxed line-clamp-3"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            {summary}
          </p>
        )}

        {/* Action buttons (visible on hover) */}
        <div className="flex items-center gap-3 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleBookmark}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
            style={{
              color: isBookmarked ? '#C4A7A0' : 'hsl(var(--muted-foreground))',
              background: isBookmarked ? 'rgba(196, 167, 160, 0.12)' : 'transparent'
            }}
          >
            {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
            <span>{isBookmarked ? '已收藏' : '收藏'}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1 text-xs px-2 py-1 rounded-md transition-colors"
            style={{ color: 'hsl(var(--muted-foreground))' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>分享</span>
          </button>
        </div>
      </article>
    </Link>
  );
};
