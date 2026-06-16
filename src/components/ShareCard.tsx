/**
 * 分享卡片组件 · Editorial Swiss
 * 三种变体：微信分享 / 深色海报 / OpenGraph 横版
 */
import { useLanguage } from "@/contexts/LanguageContext";

interface ShareCardProps {
  variant: 'wechat' | 'dark' | 'og';
  title: string;
  summary: string;
  source: string;
  imageUrl?: string;
  className?: string;
}

export const ShareCard = ({ variant, title, summary, source, className = "" }: ShareCardProps) => {
  const { isZh } = useLanguage();

  if (variant === 'og') {
    return (
      <div className={`${className}`} style={{
        aspectRatio: '1.91/1',
        background: 'linear-gradient(160deg, hsl(38 20% 95%), hsl(0 0% 100%))',
        border: '1px solid hsl(var(--border))',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.02) 100%)',
          pointerEvents: 'none',
        }} />
        <div className="text-xs font-black tracking-tight mb-2" style={{ fontFamily: "'Noto Serif SC', serif", position: 'relative' }}>
          AI<span style={{ color: '#C44D34' }}>推</span>
        </div>
        <div className="text-sm sm:text-base font-serif font-bold leading-snug line-clamp-2 mb-1" style={{ fontFamily: "'Noto Serif SC', serif", position: 'relative' }}>
          {title}
        </div>
        <div className="text-[10px] font-mono tracking-wider uppercase text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace", position: 'relative' }}>
          {source} · news.aipush.fun
        </div>
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <div className={`${className}`} style={{
        background: '#1C1917',
        color: '#EBE7E2',
        border: '1px solid #1C1917',
        padding: '18px 20px',
        position: 'relative',
      }}>
        {/* Accent line */}
        <div style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, background: '#C44D34' }} />
        <div className="text-xs font-black tracking-tight mb-3" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          AI<span style={{ color: '#C44D34' }}>推</span>
        </div>
        <div className="text-sm sm:text-base font-serif font-bold leading-snug mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
          {title}
        </div>
        <div className="text-[11px] leading-relaxed mb-3" style={{ color: 'rgba(235,231,226,0.5)' }}>
          {summary}
        </div>
        <div className="text-[9px] font-mono tracking-widest uppercase" style={{ fontFamily: "'DM Mono', monospace", color: 'rgba(235,231,226,0.35)' }}>
          {source} · news.aipush.fun
        </div>
      </div>
    );
  }

  // Default: wechat variant
  return (
    <div className={`${className}`} style={{
      background: '#FFFFFF',
      border: '1px solid hsl(var(--border))',
      padding: '16px 18px',
      position: 'relative',
    }}>
      {/* Accent line */}
      <div style={{ position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, background: '#C44D34' }} />
      <div className="text-xs font-black tracking-tight mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        AI<span style={{ color: '#C44D34' }}>推</span>
        <span className="ml-2 text-[9px] font-mono tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
          {isZh ? '分享卡片' : 'SHARE'}
        </span>
      </div>
      <div className="text-sm sm:text-base font-serif font-bold leading-snug mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
        {title}
      </div>
      <div className="text-[11px] leading-relaxed text-muted-foreground line-clamp-2 mb-2">
        {summary}
      </div>
      <div className="text-[9px] font-mono tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
        {source} · news.aipush.fun
      </div>
    </div>
  );
};