import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  title,
  summary,
  imageUrl,
  source,
  publishedAt,
  category,
  onClick,
}: NewsCardProps) => {
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

  return (
    <Card 
      className="cursor-pointer overflow-hidden bg-gradient-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 group"
      onClick={onClick}
    >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-3 left-3">
            <Badge className={getCategoryStyle(category)}>
              {category}
            </Badge>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <h3 className="font-semibold text-lg leading-tight text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
          {summary}
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