import { ArrowLeft, Clock, ExternalLink, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";

interface NewsDetailProps {
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
  
  // 直接使用传入的标题（已经在useNews中本地化）
  const displayTitle = title;
  
  // 改进内容显示
  const improveContent = (content: string) => {
    if (!content) return isZh ? '正文内容获取中...' : 'Content loading...';
    
    // 检测内容是否过短或不完整
    if (content.length < 200) {
      // 如果内容很短，提供提示并建议查看原文
      const hint = isZh ? 
        '\n\n📝 内容较短，可能为摘要。点击下方"查看原文"获取完整内容。' : 
        '\n\n📝 Content may be abbreviated. Click "View Original" below for complete article.';
      return content + hint;
    }
    
    // 检测内容是否被截断（通常以省略号或特定模式结尾）
    if (content.endsWith('...') || content.endsWith('…') || 
        content.includes('以下是') || content.includes('The following is')) {
      const hint = isZh ? 
        '\n\n🔗 内容可能不完整，建议查看原始文章获取完整信息。' :
        '\n\n🔗 Content may be incomplete. Please check the original article for full information.';
      return content + hint;
    }
    
    return content;
  };
  
  const displayContent = improveContent(content);
  const getCategoryStyle = (category: string) => {
    const normalizedCategory = category.toLowerCase();
    if (normalizedCategory.includes('ai') || normalizedCategory.includes('ai模型') || normalizedCategory.includes('ai 模型')) {
      return 'bg-gradient-ai text-white border-0';
    } else if (normalizedCategory.includes('tech') || normalizedCategory.includes('科技')) {
      return 'bg-gradient-tech text-white border-0';
    } else if (normalizedCategory.includes('economy') || normalizedCategory.includes('经济')) {
      return 'bg-gradient-economy text-white border-0';
    } else if (normalizedCategory.includes('analysis') || normalizedCategory.includes('深度分析')) {
      return 'bg-gradient-analysis text-white border-0';
    } else {
      return 'bg-gradient-primary text-white border-0';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '时间未知';
      }
      
      // 为了保持发布日期的一致性，我们使用UTC日期而不进行时区转换
      // 这样可以确保无论在哪个时区查看，显示的发布日期都是一致的
      const utcYear = date.getUTCFullYear();
      const utcMonth = date.getUTCMonth();
      const utcDay = date.getUTCDate();
      const utcHours = date.getUTCHours();
      const utcMinutes = date.getUTCMinutes();
      
      // 创建一个本地日期对象，但使用UTC的年月日
      const displayDate = new Date(utcYear, utcMonth, utcDay, utcHours, utcMinutes);
      
      return displayDate.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '时间未知';
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `${title} - 来自AI推趣新闻`;
    
    // 检测是否在微信浏览器中
    const isWechat = /micromessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
      // 微信环境：创建友好的分享引导界面
      showWechatShareGuide(shareUrl, shareText);
      return;
    }
    
    // 检查是否支持原生分享API
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: content.substring(0, 100) + '...',
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('链接已复制到剪贴板！');
      }
    }
  };

  // 微信分享引导功能
  const showWechatShareGuide = (shareUrl: string, shareText: string) => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 9999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif;
    `;

    // 创建引导内容  
    const guideContent = document.createElement('div');
    guideContent.style.cssText = `
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin: 20px;
      max-width: 320px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    // 创建箭头指向右上角的动画
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: absolute;
      top: -40px;
      right: 20px;
      width: 0;
      height: 0;
      border-left: 20px solid transparent;
      border-right: 20px solid transparent;
      border-bottom: 40px solid #007AFF;
      animation: bounce 1s infinite;
    `;

    // 添加CSS动画
    const style = document.createElement('style');
    style.textContent = `
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
    `;
    document.head.appendChild(style);

    guideContent.innerHTML = `
      <div style="color: #007AFF; font-size: 24px; margin-bottom: 16px;">📤</div>
      <h3 style="margin: 0 0 16px 0; color: #333; font-size: 18px; font-weight: 600;">
        分享到微信
      </h3>
      <p style="margin: 0 0 20px 0; color: #666; font-size: 14px; line-height: 1.5;">
        请点击微信右上角的 <strong>"···"</strong> 菜单按钮<br>
        选择 <strong>"分享给朋友"</strong> 或 <strong>"分享到朋友圈"</strong>
      </p>
      <div style="display: flex; gap: 12px; margin-top: 20px;">
        <button id="wechat-copy-link" style="
          flex: 1;
          background: #f0f0f0;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          color: #333;
          cursor: pointer;
        ">复制链接</button>
        <button id="wechat-close-guide" style="
          flex: 1;
          background: #007AFF;
          border: none;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          color: white;
          cursor: pointer;
        ">知道了</button>
      </div>
    `;

    guideContent.appendChild(arrow);
    overlay.appendChild(guideContent);
    document.body.appendChild(overlay);

    // 绑定按钮事件
    const copyButton = guideContent.querySelector('#wechat-copy-link');
    const closeButton = guideContent.querySelector('#wechat-close-guide');

    copyButton?.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          copyButton.textContent = '已复制!';
          setTimeout(() => {
            document.body.removeChild(overlay);
            document.head.removeChild(style);
          }, 1000);
        });
      } else {
        // 兼容性处理
        const input = document.createElement('input');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        copyButton.textContent = '已复制!';
        setTimeout(() => {
          document.body.removeChild(overlay);
          document.head.removeChild(style);
        }, 1000);
      }
    });

    closeButton?.addEventListener('click', () => {
      document.body.removeChild(overlay);
      document.head.removeChild(style);
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
        document.head.removeChild(style);
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{isZh ? '返回' : 'Back'}</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{isZh ? '分享' : 'Share'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Article Header */}
        <div className="space-y-4">
          <Badge className={getCategoryStyle(category)}>
            {category}
          </Badge>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold leading-tight text-foreground">
              {displayTitle}
            </h1>
            {/* 翻译内容提示 */}
            {!isZh && isTranslatedContent && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-sm text-blue-800">
                  ℹ️ This content is translated from Chinese. Original English version not available.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>{source}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDate(publishedAt)}</span>
            </div>
          </div>
        </div>

        {/* Main Image */}
        <div className="overflow-hidden rounded-xl shadow-medium">
          <img 
            src={imageUrl} 
            alt={displayTitle}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>

        {/* Article Content */}
        <Card className="bg-gradient-card border border-border/50 shadow-soft">
          <CardContent className="p-6">
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {displayContent}
              </div>
              {/* 如果内容过短，提供原文链接提示 */}
              {content.length < 200 && originalUrl && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {isZh ? '内容较短，建议查看原文获取完整信息' : 'Content is brief, please check the original article for complete information'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Insight */}
        {aiInsight && (
          <Card className="bg-gradient-primary/5 border border-primary/20 shadow-soft">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">{isZh ? 'AI 观点解析' : 'AI Analysis'}</h3>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-foreground/90 leading-relaxed">
                {aiInsight}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Source Information Card */}
        <Card className="bg-gradient-card border border-border/50 shadow-soft">
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Card Header */}
              <div className="flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  {isZh ? '文章来源信息' : 'Source Information'}
                </h3>
              </div>
              
              <Separator />
              
              {/* Source Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isZh ? '来源媒体：' : 'Source Media:'}
                    </span>
                    <span className="text-sm text-foreground font-medium">
                      {source}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isZh ? 'API推送：' : 'API Push:'}
                    </span>
                    <span className="text-sm text-foreground">
                      {isZh ? 'AI新闻聚合系统' : 'AI News Aggregation'}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isZh ? '免责声明：' : 'Disclaimer:'}
                    </span>
                    <span className="text-sm text-foreground">
                      {isZh ? '观点不代表本站' : 'Views not ours'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">
                      {isZh ? '发布时间：' : 'Published:'}
                    </span>
                    <span className="text-sm text-foreground">
                      {formatDate(publishedAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="default"
                  size="lg"
                  className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  onClick={() => window.open(originalUrl, '_blank')}
                >
                  <ExternalLink className="w-5 h-5" />
                  <span className="font-medium">{isZh ? '阅读原文' : 'Read Original'}</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  className="flex items-center justify-center space-x-2 flex-1"
                  onClick={handleShare}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="font-medium">{isZh ? '分享文章' : 'Share Article'}</span>
                </Button>
              </div>
              
              {/* Disclaimer Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800 leading-relaxed">
                  {isZh 
                    ? '免责声明：本文内容来源于第三方媒体，不代表本平台立场。本平台仅提供信息存储空间服务，不拥有所有权，不承担相关法律责任。如涉及版权问题，请及时联系我们。'
                    : 'Disclaimer: This article content is from third-party media and does not represent the position of this platform. This platform only provides information storage space services, does not own ownership, and does not assume relevant legal responsibilities. For copyright issues, please contact us promptly.'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};