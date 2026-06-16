import { Bookmark, BookmarkCheck } from "lucide-react";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

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

// 分类色：铜棕/钢蓝/苔绿/灰紫
const CAT_STYLES: Record<string, { dot: string; bg: string; text: string }> = {
  cn:   { dot: '#B8612E', bg: 'rgba(184,97,46,0.06)', text: '#B8612E' },
  intl: { dot: '#4A6572', bg: 'rgba(74,101,114,0.06)', text: '#4A6572' },
  tech: { dot: '#5C6E4A', bg: 'rgba(92,110,74,0.06)', text: '#5C6E4A' },
  fun:  { dot: '#8B6B84', bg: 'rgba(139,107,132,0.06)', text: '#8B6B84' },
};

function getCatKey(cat: string): string {
  const c = (cat || '').toLowerCase();
  if (c.includes('中国') || c.includes('国内') || c.includes('china')) return 'cn';
  if (c.includes('国际') || c.includes('国外') || c.includes('international')) return 'intl';
  if (c.includes('科技') || c.includes('tech')) return 'tech';
  return 'fun';
}

function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const diff = Math.abs(Date.now() - date.getTime());
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 60) return `${mins}m`;
    if (hrs < 24) return `${hrs}h`;
    return `${days}d`;
  } catch { return ''; }
}

export const NewsCard = ({
  id, title, summary, source, publishedAt, category, className = "",
}: NewsCardProps) => {
  const { getLocalizedCategory } = useNewsTranslation();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const catKey = getCatKey(category);
  const catStyle = CAT_STYLES[catKey] || CAT_STYLES.intl;
  const hasSummary = summary && summary.trim() !== title.trim() && summary.trim().length > 15 && !title.startsWith(summary.trim());

  useEffect(() => {
    try {
      const bookmarks = localStorage.getItem('bookmarked-news');
      if (bookmarks) {
        const list = JSON.parse(bookmarks);
        setIsBookmarked(Array.isArray(list) && list.some((item: any) => item.id === id));
      }
    } catch {}
  }, [id]);

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const bookmarks = localStorage.getItem('bookmarked-news');
      let list = bookmarks ? JSON.parse(bookmarks) : [];
      if (!Array.isArray(list)) list = [];
      if (isBookmarked) {
        list = list.filter((item: any) => item.id !== id);
        setIsBookmarked(false);
      } else {
        list.unshift({ id, title, summary, imageUrl: '', source, publishedAt, category });
        setIsBookmarked(true);
      }
      localStorage.setItem('bookmarked-news', JSON.stringify(list));
    } catch {}
  };

  return (
    <Link to={`/news/${id}`} className="block group">
      <article className={`${className}`} style={{
        padding: '16px 0',
        borderBottom: '1px solid hsl(var(--border))',
      }}>
        {/* Meta row: category dot + source + time */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5" style={{
            fontSize: '10px',
            fontFamily: "'DM Mono', monospace",
            fontWeight: 500,
            letterSpacing: '0.06em',
            color: catStyle.text,
            textTransform: 'uppercase',
          }}>
            <span style={{
              display: 'inline-block',
              width: 7, height: 7,
              background: catStyle.dot,
            }} />
            {getLocalizedCategory(category)}
          </span>
          <span style={{ color: 'hsl(var(--border))', fontSize: '10px' }}>|</span>
          <span className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            {source}
          </span>
          <span className="text-[10px] font-mono text-muted-foreground"
            style={{ fontFamily: "'DM Mono', monospace" }}>
            {formatTime(publishedAt)}
          </span>
        </div>

        {/* Title - serif */}
        <h2 className="text-base sm:text-lg font-serif font-bold leading-snug line-clamp-2 mb-1.5"
          style={{ fontFamily: "'Noto Serif SC', 'Georgia', serif", letterSpacing: '-0.01em' }}>
          {title}
        </h2>

        {/* Summary */}
        {hasSummary && (
          <p className="text-[13px] leading-relaxed line-clamp-2 text-muted-foreground"
            style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
            {summary}
          </p>
        )}

        {/* Actions (hover) */}
        <div className="flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleBookmark}
            className="flex items-center gap-1 text-[10px] font-mono tracking-wider uppercase transition-colors"
            style={{
              fontFamily: "'DM Mono', monospace",
              color: isBookmarked ? '#C44D34' : 'hsl(var(--muted-foreground))'
            }}
          >
            {isBookmarked ? <BookmarkCheck className="w-3 h-3" /> : <Bookmark className="w-3 h-3" />}
            <span className="hidden sm:inline">{isBookmarked ? '已收藏' : '收藏'}</span>
          </button>
        </div>
      </article>
    </Link>
  );
};