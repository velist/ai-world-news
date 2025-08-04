import { ArrowLeft, Clock, ExternalLink, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useTitleTranslation } from "@/hooks/useTitleTranslation";
import { useLanguage } from "@/contexts/LanguageContext";

interface NewsDetailProps {
  title: string;
  content: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
  originalUrl?: string;
  aiInsight?: string;
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
  onBack,
}: NewsDetailProps) => {
  const { improveTitle, improveSummary } = useTitleTranslation();
  const { isZh } = useLanguage();
  
  // 使用改进的标题
  const displayTitle = improveTitle(title);
  
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
    switch (category.toLowerCase()) {
      case 'ai模型':
      case 'ai 模型':
        return 'bg-gradient-ai text-white border-0';
      case '科技':
        return 'bg-gradient-tech text-white border-0';
      case '经济':
        return 'bg-gradient-economy text-white border-0';
      case '深度分析':
        return 'bg-gradient-analysis text-white border-0';
      default:
        return 'bg-gradient-primary text-white border-0';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: content.substring(0, 100) + '...',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
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
              <span>返回</span>
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="flex items-center space-x-2"
              >
                <Share2 className="w-4 h-4" />
                <span>分享</span>
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
          
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {displayTitle}
          </h1>
          
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
                <h3 className="text-lg font-semibold text-foreground">AI 观点解析</h3>
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