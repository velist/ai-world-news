import React, { useState } from 'react';
import { Share2, Download, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { posterShareService } from '@/services/posterShareService';
import { useLanguage } from '@/contexts/LanguageContext';

interface NewsData {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
}

interface PosterShareButtonProps {
  newsData: NewsData;
  className?: string;
}

export const PosterShareButton: React.FC<PosterShareButtonProps> = ({
  newsData,
  className = ''
}) => {
  const { isZh } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);

  const handleGeneratePoster = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      console.log('🎨 开始生成分享海报...');
      
      // 生成海报
      const dataUrl = await posterShareService.generateNewsPoster(newsData);
      setPosterUrl(dataUrl);
      
      console.log('✅ 海报生成成功');
      
      // 自动分享到微信
      await posterShareService.shareToWeChat(dataUrl);
      
    } catch (error) {
      console.error('❌ 海报生成失败:', error);
      alert(isZh ? '海报生成失败，请稍后重试' : 'Failed to generate poster, please try again');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadPoster = () => {
    if (posterUrl) {
      const filename = `news-poster-${newsData.id}.png`;
      posterShareService.downloadPoster(posterUrl, filename);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      {/* 生成海报按钮 */}
      <Button
        onClick={handleGeneratePoster}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
      >
        {isGenerating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
        {isGenerating 
          ? (isZh ? '生成中...' : 'Generating...') 
          : (isZh ? '生成海报分享' : 'Generate Poster')
        }
      </Button>

      {/* 下载按钮 */}
      {posterUrl && (
        <Button
          onClick={handleDownloadPoster}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          {isZh ? '下载海报' : 'Download'}
        </Button>
      )}
    </div>
  );
};

// 简化版海报分享按钮（用于列表页面）
export const SimplePosterShareButton: React.FC<{
  newsData: NewsData;
  size?: 'sm' | 'md' | 'lg';
}> = ({ newsData, size = 'md' }) => {
  const { isZh } = useLanguage();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleShare = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const dataUrl = await posterShareService.generateNewsPoster(newsData);
      await posterShareService.shareToWeChat(dataUrl);
    } catch (error) {
      console.error('分享失败:', error);
      alert(isZh ? '分享失败，请稍后重试' : 'Share failed, please try again');
    } finally {
      setIsGenerating(false);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6 p-1',
    md: 'w-8 h-8 p-1.5',
    lg: 'w-10 h-10 p-2'
  };

  return (
    <Button
      onClick={handleShare}
      disabled={isGenerating}
      variant="ghost"
      size="sm"
      className={`${sizeClasses[size]} rounded-full hover:bg-purple-100 hover:text-purple-600 transition-colors`}
      title={isZh ? '生成海报分享' : 'Generate poster share'}
    >
      {isGenerating ? (
        <Loader2 className="w-full h-full animate-spin" />
      ) : (
        <ImageIcon className="w-full h-full" />
      )}
    </Button>
  );
};

// 海报预览组件
export const PosterPreview: React.FC<{
  newsData: NewsData;
  onClose: () => void;
}> = ({ newsData, onClose }) => {
  const { isZh } = useLanguage();
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    const generatePreview = async () => {
      try {
        const dataUrl = await posterShareService.generateNewsPoster(newsData);
        setPosterUrl(dataUrl);
      } catch (error) {
        console.error('预览生成失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    generatePreview();
  }, [newsData]);

  const handleShare = async () => {
    if (posterUrl) {
      await posterShareService.shareToWeChat(posterUrl);
    }
  };

  const handleDownload = () => {
    if (posterUrl) {
      posterShareService.downloadPoster(posterUrl, `news-poster-${newsData.id}.png`);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold">
            {isZh ? '分享海报预览' : 'Poster Preview'}
          </h3>
          <Button onClick={onClose} variant="ghost" size="sm">
            ✕
          </Button>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">{isZh ? '生成中...' : 'Generating...'}</span>
            </div>
          ) : posterUrl ? (
            <>
              <img 
                src={posterUrl} 
                alt="News Poster" 
                className="w-full h-auto rounded-lg shadow-lg"
              />
              <div className="flex gap-2 mt-4">
                <Button onClick={handleShare} className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  {isZh ? '分享到微信' : 'Share to WeChat'}
                </Button>
                <Button onClick={handleDownload} variant="outline">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-8">
              {isZh ? '生成失败，请重试' : 'Generation failed, please retry'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
