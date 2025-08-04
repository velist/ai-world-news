import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, ExternalLink, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";

interface NewsCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
  onClick: () => void;
}

export const NewsCard = ({
  id,
  title,
  summary,
  imageUrl,
  source,
  publishedAt,
  category,
  onClick,
}: NewsCardProps) => {
  const { getLocalizedCategory } = useNewsTranslation();
  
  // 直接使用传入的标题和摘要（已经在useNews中本地化）
  const displayTitle = title;
  const displaySummary = summary;
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes}分钟前`;
    } else if (hours < 24) {
      return `${hours}小时前`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}天前`;
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    
    const shareUrl = `https://news.aipush.fun/?news=${id}`;
    const shareText = `${displayTitle} - 来自AI推趣新闻`;
    
    // 检测是否在微信浏览器中
    const isWechat = /micromessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
      // 微信环境：提示用户点击右上角菜单分享
      alert('请点击右上角菜单按钮，选择"分享给朋友"或"分享到朋友圈"');
      return;
    }
    
    // 检查是否支持原生分享API
    if (navigator.share) {
      navigator.share({
        title: shareText,
        text: displaySummary.substring(0, 100) + '...',
        url: shareUrl,
      }).catch(console.error);
    } else {
      // 降级方案：复制链接
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).then(() => {
          alert('链接已复制到剪贴板！');
        });
      } else {
        // 再次降级：打开分享窗口
        const encodedText = encodeURIComponent(shareText);
        const encodedUrl = encodeURIComponent(shareUrl);
        
        // 尝试打开不同的分享平台
        const shareOptions = [
          { name: '微博', url: `https://service.weibo.com/share/share.php?url=${encodedUrl}&title=${encodedText}` },
          { name: 'QQ', url: `https://connect.qq.com/widget/shareqq/index.html?url=${encodedUrl}&title=${encodedText}` },
          { name: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}` }
        ];
        
        // 简单的选择对话框
        const choice = confirm('选择分享方式：\n确定 - 复制链接\n取消 - 打开微博分享');
        if (choice) {
          // 复制链接
          const input = document.createElement('input');
          input.value = shareUrl;
          document.body.appendChild(input);
          input.select();
          document.execCommand('copy');
          document.body.removeChild(input);
          alert('链接已复制到剪贴板！');
        } else {
          // 打开微博分享
          window.open(shareOptions[0].url, '_blank', 'width=600,height=400');
        }
      }
    }
  };

  return (
    <Card 
      className="cursor-pointer overflow-hidden bg-gradient-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 group"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={displayTitle}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // 图片加载失败时使用占位符
              const target = e.target as HTMLImageElement;
              target.src = "/placeholder.svg";
            }}
          />
          <div className="absolute top-3 left-3">
            <Badge className={getCategoryStyle(category)}>
              {getLocalizedCategory(category)}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Button
              size="sm"
              variant="secondary"
              className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {displayTitle}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">
          {displaySummary}
        </p>
        
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <ExternalLink className="w-3 h-3" />
            <span className="font-medium">{source}</span>
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{formatTime(publishedAt)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};