import { ArrowLeft, Clock, ExternalLink, Share2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
            {title}
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
            alt={title}
            className="w-full h-64 md:h-80 object-cover"
          />
        </div>

        {/* Article Content */}
        <Card className="bg-gradient-card border border-border/50 shadow-soft">
          <CardContent className="p-6">
            <div className="prose prose-lg max-w-none">
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">
                {content}
              </div>
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

        {/* Original Link */}
        {originalUrl && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => window.open(originalUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
              <span>阅读原文</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};