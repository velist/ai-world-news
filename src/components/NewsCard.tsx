import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Clock, ExternalLink, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OptimizedImage } from "@/components/OptimizedImage";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";
import { generateWeChatShareUrl } from "@/hooks/useWeChatEnvironment";
import { posterPreGenerationService } from "@/services/posterPreGenerationService";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

interface NewsCardProps {
  id: string;
  title: string;
  summary: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
}

export const NewsCard = ({
  id,
  title,
  summary,
  imageUrl,
  source,
  publishedAt,
  category,
}: NewsCardProps) => {
  const { getLocalizedCategory } = useNewsTranslation();
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 集成预生成服务
  useEffect(() => {
    if (cardRef.current) {
      const newsData = {
        id,
        title,
        summary,
        imageUrl,
        publishedAt,
        source,
        category
      };
      
      // 注册元素到可视性观察器
      posterPreGenerationService.observeNewsElement(cardRef.current, newsData);
      
      return () => {
        // 清理观察器
        if (cardRef.current) {
          posterPreGenerationService.unobserveNewsElement(cardRef.current);
        }
      };
    }
  }, [id, title, summary, imageUrl, publishedAt, source, category]);
  
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
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '时间未知';
      }
      
      // 计算时间差（毫秒）
      const diff = now.getTime() - date.getTime();
      const absDiff = Math.abs(diff);
      
      // 调试输出（开发环境）
      if (process.env.NODE_ENV === 'development') {
        console.log(`时间调试: ${displayTitle.substring(0, 30)} - ${timestamp} - diff: ${diff}ms - ${Math.floor(diff / (1000 * 60 * 60))}小时`);
      }
      
      // 如果时间差很小（小于1分钟），显示刚刚发布
      if (absDiff < 60 * 1000) {
        return '刚刚发布';
      }
      
      // 如果时间戳在未来（负数差值），说明可能是时区问题，使用绝对值计算
      const actualDiff = diff < 0 ? absDiff : diff;
      
      const minutes = Math.floor(actualDiff / (1000 * 60));
      const hours = Math.floor(actualDiff / (1000 * 60 * 60));
      const days = Math.floor(actualDiff / (1000 * 60 * 60 * 24));
      
      if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (hours < 24) {
        return `${hours}小时前`;
      } else {
        return `${days}天前`;
      }
    } catch (error) {
      console.error('Time formatting error:', error);
      return '时间未知';
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // 阻止卡片点击事件
    e.preventDefault(); // 阻止Link导航
    
    // 使用微信环境专用分享URL生成器
    const shareUrl = generateWeChatShareUrl(id);
    const shareText = `${displayTitle} - 来自AI推`;
    
    // 检测是否在微信浏览器中
    const isWechat = /micromessenger/i.test(navigator.userAgent);
    
    if (isWechat) {
      // 微信环境：创建友好的分享引导界面
      showWechatShareGuide(shareUrl, shareText);
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
    <Link to={`/news/${id}`} className="block">
      <Card 
        ref={cardRef}
        className="cursor-pointer overflow-hidden bg-gradient-card border border-border/50 shadow-soft hover:shadow-medium transition-all duration-300 transform hover:-translate-y-1 group"
      >
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={imageUrl} 
            alt={displayTitle}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // 增强的图片加载处理
              const target = e.target as HTMLImageElement;
              
              // 检查是否已经是备用图片，避免无限循环
              if (target.src.includes('unsplash.com/photo-1677442136019-21780ecad995')) {
                return;
              }
              
              const title = displayTitle.toLowerCase();
              
              // 优化的备用图片选择
              if (title.includes('ai') || title.includes('人工智能') || title.includes('大模型') || title.includes('chatgpt')) {
                target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format";
              } else if (title.includes('机器人') || title.includes('自动化') || title.includes('自动驾驶')) {
                target.src = "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&auto=format";
              } else if (title.includes('科技') || title.includes('技术') || title.includes('芯片')) {
                target.src = "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format";
              } else if (title.includes('数据') || title.includes('代码') || title.includes('编程')) {
                target.src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format";
              } else {
                target.src = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format";
              }
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
    </Link>
  );
};