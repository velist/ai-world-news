import { ArrowLeft, Clock, ExternalLink, Share2, MessageSquare, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNewsTranslation } from "@/hooks/useNewsTranslation";
import { simplePosterService } from "@/services/simplePosterServiceNew";
import { useState } from "react";

interface NewsDetailProps {
  id?: string; // 新闻ID，用于生成分享链接
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
  const [isGeneratingPoster, setIsGeneratingPoster] = useState(false);

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
      // 微信环境：显示分享选项
      showShareOptions(shareUrl, shareText);
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

  // 生成简洁海报分享 - 极速版本
  const handlePosterShare = async () => {
    if (isGeneratingPoster) return;

    setIsGeneratingPoster(true);
    try {
      const newsData = {
        id: id || `news_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 优先使用真实ID
        title: displayTitle,
        summary: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        publishedAt: publishedAt,
        source: source
      };

      // 使用极简版海报生成服务
      const imageResult = await simplePosterService.generateSimplePoster(newsData);

      // 显示简洁分享模态框
      showSimpleShareModal(imageResult, newsData);
      
    } catch (error) {
      alert(isZh ? '海报生成失败，请稍后重试' : 'Failed to generate poster, please try again');
    } finally {
      setIsGeneratingPoster(false);
    }
  };

  // 显示AI生成的分享图片模态框
  const showShareImageModal = async (imageData: string, newsData: any): Promise<void> => {
    return new Promise((resolve) => {
      // 创建遮罩层
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
      `;

      const container = document.createElement('div');
      container.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 15px;
        max-width: 90%;
        max-height: 90%;
        text-align: center;
        overflow: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      `;

      // 生成状态显示
      const statusDiv = document.createElement('div');
      statusDiv.style.cssText = `
        margin-bottom: 20px;
        padding: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 8px;
        font-weight: bold;
      `;
      statusDiv.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 10px;">
          <span>🤖</span>
          <span>AI增强分享图片生成完成</span>
          <span>✨</span>
        </div>
      `;

      // 图片显示
      const img = document.createElement('img');
      img.src = imageData;
      img.style.cssText = `
        max-width: 100%;
        height: auto;
        margin: 20px 0;
        border-radius: 10px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      `;

      // 服务状态显示
      const serviceStatus = enhancedShareImageService.getServiceStatus();
      const statusInfo = document.createElement('div');
      statusInfo.style.cssText = `
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        font-size: 14px;
        text-align: left;
      `;
      statusInfo.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 10px; color: #333;">📊 生成统计</div>
        <div>• 总请求数: ${serviceStatus.performance.totalRequests}</div>
        <div>• 平均用时: ${serviceStatus.performance.averageTime}ms</div>
        <div>• AI成功率: ${serviceStatus.performance.aiSuccessRate}</div>
        <div>• 可用AI服务: ${serviceStatus.mcp.totalServices}个</div>
      `;

      // 操作按钮
      const buttonContainer = document.createElement('div');
      buttonContainer.style.cssText = `
        display: flex;
        gap: 10px;
        justify-content: center;
        flex-wrap: wrap;
        margin-top: 20px;
      `;

      // 微信分享按钮
      const wechatBtn = document.createElement('button');
      wechatBtn.textContent = '📱 微信分享';
      wechatBtn.style.cssText = `
        padding: 12px 24px;
        background: linear-gradient(135deg, #1aad19 0%, #2dc653 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s;
      `;
      wechatBtn.onmouseover = () => wechatBtn.style.transform = 'scale(1.05)';
      wechatBtn.onmouseout = () => wechatBtn.style.transform = 'scale(1)';
      wechatBtn.onclick = async () => {
        try {
          // 尝试原生分享API
          if (navigator.share) {
            const response = await fetch(imageData);
            const blob = await response.blob();
            const file = new File([blob], 'ai-news-share.png', { type: 'image/png' });
            
            await navigator.share({
              title: newsData.title,
              text: '来自AI推的智能新闻分享',
              files: [file]
            });
          } else {
            // 降级到显示提示
            alert('长按图片保存，然后在微信中发送');
          }
        } catch (error) {
          console.warn('原生分享失败:', error);
          alert('长按图片保存，然后在微信中发送');
        }
      };

      // 下载按钮
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = '💾 保存图片';
      downloadBtn.style.cssText = `
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s;
      `;
      downloadBtn.onmouseover = () => downloadBtn.style.transform = 'scale(1.05)';
      downloadBtn.onmouseout = () => downloadBtn.style.transform = 'scale(1)';
      downloadBtn.onclick = () => {
        const link = document.createElement('a');
        link.download = `ai-news-${newsData.id}.png`;
        link.href = imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };

      // 关闭按钮
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '❌ 关闭';
      closeBtn.style.cssText = `
        padding: 12px 24px;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-weight: bold;
        transition: transform 0.2s;
      `;
      closeBtn.onmouseover = () => closeBtn.style.transform = 'scale(1.05)';
      closeBtn.onmouseout = () => closeBtn.style.transform = 'scale(1)';
      closeBtn.onclick = () => {
        document.body.removeChild(overlay);
        resolve();
      };

      // 组装元素
      buttonContainer.appendChild(wechatBtn);
      buttonContainer.appendChild(downloadBtn);
      buttonContainer.appendChild(closeBtn);
      
      container.appendChild(statusDiv);
      container.appendChild(img);
      container.appendChild(statusInfo);
      container.appendChild(buttonContainer);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      // 点击遮罩关闭
      overlay.onclick = (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
          resolve();
        }
      };
    });
  };

  // 显示简洁分享模态框 - 无参数版本
  const showSimpleShareModal = (imageData: string, newsData: any): void => {
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const container = document.createElement('div');
    container.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 90%;
      max-height: 90%;
      text-align: center;
      overflow: auto;
    `;

    // 成功提示
    const successDiv = document.createElement('div');
    successDiv.style.cssText = `
      margin-bottom: 15px;
      color: #28a745;
      font-weight: bold;
      font-size: 18px;
    `;
    successDiv.textContent = '✅ 海报生成成功！';

    // 图片显示
    const img = document.createElement('img');
    img.src = imageData;
    img.style.cssText = `
      max-width: 100%;
      height: auto;
      margin: 15px 0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;

    // 操作按钮容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      gap: 10px;
      justify-content: center;
      margin-top: 15px;
    `;

    // 保存按钮
    const saveBtn = document.createElement('button');
    saveBtn.textContent = '💾 保存图片';
    saveBtn.style.cssText = `
      padding: 10px 20px;
      background: #007AFF;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    saveBtn.onclick = () => {
      simplePosterService.downloadPoster(imageData, `${newsData.title.substring(0, 20)}.png`);
    };

    // 关闭按钮
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '❌ 关闭';
    closeBtn.style.cssText = `
      padding: 10px 20px;
      background: #6c757d;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-weight: bold;
    `;
    closeBtn.onclick = () => {
      document.body.removeChild(overlay);
    };

    // 组装元素
    buttonContainer.appendChild(saveBtn);
    buttonContainer.appendChild(closeBtn);
    
    container.appendChild(successDiv);
    container.appendChild(img);
    container.appendChild(buttonContainer);
    overlay.appendChild(container);
    document.body.appendChild(overlay);

    // 点击遮罩关闭
    overlay.onclick = (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    };
  };

  // 显示分享选项
  const showShareOptions = (shareUrl: string, shareText: string) => {
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

    // 创建分享选项内容
    const shareContent = document.createElement('div');
    shareContent.style.cssText = `
      background: white;
      border-radius: 16px;
      padding: 24px;
      margin: 20px;
      max-width: 350px;
      text-align: center;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      position: relative;
    `;

    shareContent.innerHTML = `
      <h3 style="margin: 0 0 20px 0; color: #1D1D1F; font-size: 20px; font-weight: 600;">选择分享方式</h3>

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <button id="posterShareBtn" style="
          background: linear-gradient(135deg, #007AFF 0%, #AF52DE 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.2s;
        " onmouseover="this.style.transform='scale(1.02)'" onmouseout="this.style.transform='scale(1)'">
          <span style="font-size: 18px;">🎨</span>
          生成海报分享 (推荐)
        </button>

        <button id="linkShareBtn" style="
          background: #F2F2F7;
          color: #1D1D1F;
          border: 1px solid #E5E5EA;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s;
        " onmouseover="this.style.background='#E5E5EA'" onmouseout="this.style.background='#F2F2F7'">
          <span style="font-size: 18px;">🔗</span>
          复制链接分享
        </button>
      </div>

      <p style="margin: 16px 0 0 0; color: #8E8E93; font-size: 14px;">
        海报分享不会被微信拦截，推荐使用
      </p>

      <button id="closeBtn" style="
        position: absolute;
        top: 12px;
        right: 12px;
        background: none;
        border: none;
        font-size: 24px;
        color: #8E8E93;
        cursor: pointer;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
      " onmouseover="this.style.background='#F2F2F7'" onmouseout="this.style.background='none'">
        ×
      </button>
    `;

    overlay.appendChild(shareContent);
    document.body.appendChild(overlay);

    // 事件处理
    const posterBtn = document.getElementById('posterShareBtn');
    const linkBtn = document.getElementById('linkShareBtn');
    const closeBtn = document.getElementById('closeBtn');

    posterBtn?.addEventListener('click', async () => {
      document.body.removeChild(overlay);
      await handlePosterShare();
    });

    linkBtn?.addEventListener('click', async () => {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        alert('链接已复制到剪贴板！');
      }
      document.body.removeChild(overlay);
    });

    closeBtn?.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

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
      {/* 微信分享缩略图 - 隐藏但必须存在于DOM中 */}
      <img 
        src={imageUrl || `https://news.aipush.fun/wechat-share-300.png?v=2025080702`}
        alt={title}
        style={{ 
          position: 'absolute', 
          left: '-9999px', 
          width: '300px', 
          height: '300px',
          opacity: 0
        }}
      />
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
                  disabled={isGeneratingPoster}
                >
                  {isGeneratingPoster ? (
                    <>
                      <ImageIcon className="w-5 h-5 animate-spin" />
                      <span className="font-medium">{isZh ? '生成中...' : 'Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-5 h-5" />
                      <span className="font-medium">{isZh ? '分享文章' : 'Share Article'}</span>
                    </>
                  )}
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