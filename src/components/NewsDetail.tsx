import { ArrowLeft, Clock, ExternalLink, Share2, Copy, Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";
import { useState } from "react";
import { generateWeChatShareUrl } from "@/hooks/useWeChatEnvironment";

interface NewsDetailProps {
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
  originalUrl?: string;
  aiInsight?: string;
  isTranslatedContent?: boolean;
  onBack: () => void;
}

export const NewsDetail = ({
  id,
  title,
  content,
  imageUrl,
  source,
  publishedAt,
  category,
  originalUrl,
  aiInsight,
  isTranslatedContent,
  onBack,
}: NewsDetailProps) => {
  const { isZh } = useLanguage();
  const { getLocalizedCategory } = useNewsTranslation();
  const [copied, setCopied] = useState(false);

  const displayTitle = title;

  // 判断正文质量
  const getDisplayContent = () => {
    if (!content || content.trim().length === 0) {
      return null; // 无正文
    }
    // 正文和标题完全相同 → 不显示正文
    if (content.trim() === title.trim()) {
      return null;
    }
    // 正文太短且仅是标题片段
    if (content.trim().length < 15 && title.startsWith(content.trim())) {
      return null;
    }
    return content;
  };

  const displayContent = getDisplayContent();

  // 分类样式（莫兰迪色调）
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

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return isZh ? '时间未知' : 'Unknown';
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    } catch {
      return isZh ? '时间未知' : 'Unknown';
    }
  };

  // 简洁分享：复制链接 or 原生分享
  const handleShare = async () => {
    const shareUrl = id ? generateWeChatShareUrl(id) : window.location.href;
    const shareText = `${title} - AI推`;

    if (navigator.share) {
      try {
        await navigator.share({ title: shareText, text: (displayContent || title).substring(0, 100), url: shareUrl });
        return;
      } catch { /* fallback to copy */ }
    }

    // Fallback: copy link
    handleCopyLink();
  };

  const handleCopyLink = async () => {
    const shareUrl = id ? generateWeChatShareUrl(id) : window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const catStyle = getCategoryStyle(category);

  return (
    <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
      {/* Header bar */}
      <div className="sticky top-0 z-10 border-b" style={{
        background: 'rgba(253, 251, 249, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'hsl(var(--border))'
      }}>
        <div className="max-w-[680px] mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={onBack} className="flex items-center space-x-1.5 text-sm transition-colors"
            style={{ color: 'hsl(var(--muted-foreground))' }}>
            <ArrowLeft className="w-4 h-4" />
            <span>{isZh ? '返回' : 'Back'}</span>
          </button>
          <div className="flex items-center space-x-2">
            <button onClick={handleCopyLink}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all border"
              style={{
                color: copied ? '#A3B0A0' : 'hsl(var(--muted-foreground))',
                borderColor: copied ? 'rgba(163, 176, 160, 0.4)' : 'hsl(var(--border))',
                background: copied ? 'rgba(163, 176, 160, 0.1)' : 'transparent'
              }}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? (isZh ? '已复制' : 'Copied') : (isZh ? '复制链接' : 'Copy')}</span>
            </button>
            <button onClick={handleShare}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all border"
              style={{ color: 'hsl(var(--muted-foreground))', borderColor: 'hsl(var(--border))' }}>
              <Share2 className="w-3.5 h-3.5" />
              <span>{isZh ? '分享' : 'Share'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Article */}
      <article className="max-w-[680px] mx-auto px-6 py-8">
        {/* Meta */}
        <div className="flex items-center gap-2.5 mb-4 flex-wrap">
          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={catStyle}>
            {getLocalizedCategory(category)}
          </span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--muted-foreground))' }} />
          <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <ExternalLink className="w-3 h-3" />
            {source}
          </span>
          <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--muted-foreground))' }} />
          <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
            <Clock className="w-3 h-3" />
            {formatDate(publishedAt)}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight mb-6" style={{ color: 'hsl(var(--foreground))' }}>
          {displayTitle}
        </h1>

        {/* Translation notice */}
        {!isZh && isTranslatedContent && (
          <div className="mb-6 p-3 rounded-lg text-sm" style={{ background: 'rgba(158, 173, 184, 0.12)', color: '#9EADB8', border: '1px solid rgba(158, 173, 184, 0.25)' }}>
            This content is translated from Chinese.
          </div>
        )}

        {/* Content */}
        {displayContent ? (
          <div className="mb-8">
            <div className="text-base leading-[1.8] whitespace-pre-wrap" style={{ color: 'hsl(var(--foreground))', opacity: 0.85 }}>
              {displayContent}
            </div>
          </div>
        ) : (
          <div className="mb-8 py-6 text-center rounded-lg" style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>
            <p className="text-sm mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {isZh ? '本条资讯为快讯摘要，详细内容请查看原文' : 'This is a brief summary. Please read the original article for details.'}
            </p>
            {originalUrl && (
              <a href={originalUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors"
                style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--card))' }}>
                <ExternalLink className="w-3.5 h-3.5" />
                {isZh ? '阅读原文' : 'Read Original'}
              </a>
            )}
          </div>
        )}

        {/* AI Insight */}
        {aiInsight && (
          <div className="mb-8 p-5 rounded-lg" style={{ background: 'rgba(181, 165, 184, 0.08)', border: '1px solid rgba(181, 165, 184, 0.2)' }}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium" style={{ color: '#B5A5B8' }}>AI 观点</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--foreground))', opacity: 0.8 }}>
              {aiInsight}
            </p>
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid hsl(var(--border))' }} className="my-8" />

        {/* Source info & actions */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {isZh ? '来源' : 'Source'}
              </div>
              <div className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>{source}</div>
            </div>
            <div className="text-right">
              <div className="text-xs mb-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {isZh ? '发布时间' : 'Published'}
              </div>
              <div className="text-sm" style={{ color: 'hsl(var(--foreground))' }}>{formatDate(publishedAt)}</div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {originalUrl && (
              <a href={originalUrl} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ background: 'hsl(var(--foreground))', color: 'hsl(var(--card))' }}>
                <ExternalLink className="w-4 h-4" />
                {isZh ? '阅读原文' : 'Read Original'}
              </a>
            )}
            <button onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors border"
              style={{ color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' }}>
              <Share2 className="w-4 h-4" />
              {isZh ? '分享文章' : 'Share'}
            </button>
          </div>

          {/* Disclaimer */}
          <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {isZh
              ? '免责声明：本文内容来源于第三方媒体，不代表本平台立场。如涉及版权问题，请联系我们。'
              : 'Disclaimer: Content from third-party media. Does not represent our views. Contact us for copyright issues.'}
          </p>
        </div>
      </article>
    </div>
  );
};
