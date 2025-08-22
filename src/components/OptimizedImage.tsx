import React, { useState, useRef, useEffect, useCallback } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
  enableProxy?: boolean;
  retryAttempts?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = 800,
  height = 600,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc,
  enableProxy = true,
  retryAttempts = 2
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const [isProxyUsed, setIsProxyUsed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // 简化的图片URL处理
  const createProxyUrl = useCallback((originalSrc: string): string => {
    if (!originalSrc || originalSrc.startsWith('data:')) return originalSrc;
    
    // 暂时移除代理服务，直接使用原图
    return originalSrc;
  }, []);

  // 增强的SVG fallback生成器
  const generateAdvancedFallback = useCallback((title: string): string => {
    if (fallbackSrc) return fallbackSrc;
    
    const titleLower = title.toLowerCase();
    let bgGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    let emoji = '📰';
    let category = 'AI推新闻';
    
    // 基于内容类型的智能选择
    if (titleLower.includes('ai') || titleLower.includes('人工智能') || titleLower.includes('chatgpt')) {
      bgGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      emoji = '🤖';
      category = 'AI资讯';
    } else if (titleLower.includes('tech') || titleLower.includes('科技')) {
      bgGradient = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
      emoji = '💻';
      category = '科技新闻';
    } else if (titleLower.includes('robot') || titleLower.includes('机器人')) {
      bgGradient = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
      emoji = '🤖';
      category = '机器人';
    } else if (titleLower.includes('data') || titleLower.includes('数据')) {
      bgGradient = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
      emoji = '📊';
      category = '数据分析';
    }

    // 截取标题避免过长
    const shortTitle = title.length > 40 ? title.substring(0, 37) + '...' : title;
    
    const svg = `
      <svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="8" flood-color="rgba(0,0,0,0.3)"/>
          </filter>
        </defs>
        
        <rect width="${width}" height="${height}" fill="url(#bg)"/>
        
        <!-- 装饰性图案 -->
        <circle cx="${width * 0.85}" cy="${height * 0.15}" r="40" fill="rgba(255,255,255,0.1)"/>
        <circle cx="${width * 0.15}" cy="${height * 0.85}" r="30" fill="rgba(255,255,255,0.05)"/>
        
        <!-- 主要内容区域 -->
        <rect x="${width * 0.05}" y="${height * 0.35}" width="${width * 0.9}" height="${height * 0.45}" 
              rx="12" fill="rgba(255,255,255,0.95)" filter="url(#shadow)"/>
        
        <!-- 图标 -->
        <text x="${width * 0.5}" y="${height * 0.25}" text-anchor="middle" 
              font-size="36" font-family="Apple Color Emoji, Segoe UI Emoji, sans-serif">
          ${emoji}
        </text>
        
        <!-- 标题文本 -->
        <text x="${width * 0.5}" y="${height * 0.5}" text-anchor="middle" 
              font-size="16" font-weight="600" font-family="system-ui, sans-serif" fill="#1f2937">
          ${shortTitle}
        </text>
        
        <!-- 分类标签 -->
        <text x="${width * 0.5}" y="${height * 0.65}" text-anchor="middle" 
              font-size="12" font-family="system-ui, sans-serif" fill="#6b7280">
          ${category}
        </text>
        
        <!-- 底部品牌 -->
        <text x="${width * 0.5}" y="${height * 0.9}" text-anchor="middle" 
              font-size="10" font-family="system-ui, sans-serif" fill="rgba(255,255,255,0.8)">
          AI推 - 智能新闻推送
        </text>
      </svg>
    `;

    return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  }, [fallbackSrc, width, height]);
  
  // 生成不同尺寸的图片URL
  const generateSrcSet = (originalSrc: string, width?: number) => {
    if (!width) return undefined;
    const widths = [width * 0.5, width, width * 1.5, width * 2];
    return widths
      .map(w => `${originalSrc}?w=${Math.round(w)}&q=${quality} ${Math.round(w)}w`)
      .join(', ');
  };
  
  // 智能图片源选择
  const getOptimalSrc = useCallback(async (originalSrc: string): Promise<string> => {
    // 如果是data URL，直接返回
    if (originalSrc.startsWith('data:')) {
      return originalSrc;
    }

    // 如果启用代理且已经重试过，使用代理
    if (enableProxy && (retryCount > 0 || isProxyUsed)) {
      const proxyUrl = createProxyUrl(originalSrc);
      setIsProxyUsed(true);
      return proxyUrl;
    }

    return originalSrc;
  }, [enableProxy, retryCount, isProxyUsed, createProxyUrl]);

  // 懒加载逻辑
  useEffect(() => {
    const loadImage = async () => {
      const optimalSrc = await getOptimalSrc(src);
      setCurrentSrc(optimalSrc);
    };

    if (priority || loading === 'eager') {
      loadImage();
      return;
    }
    
    if (!imgRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadImage();
          observerRef.current?.unobserve(entry.target);
        }
      },
      { rootMargin: '100px' }
    );
    
    observerRef.current.observe(imgRef.current);
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, priority, loading, getOptimalSrc]);
  
  // 图片加载处理
  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };
  
  const handleError = useCallback(async () => {
    console.warn(`图片加载失败: ${currentSrc}, 重试次数: ${retryCount}/${retryAttempts}`);
    
    if (retryCount < retryAttempts) {
      setRetryCount(prev => prev + 1);
      
      // 尝试不同的加载策略
      let nextSrc: string;
      
      if (!isProxyUsed && enableProxy) {
        // 首次失败，尝试代理
        nextSrc = createProxyUrl(src);
        setIsProxyUsed(true);
        console.log(`🔄 尝试代理服务: ${nextSrc.substring(0, 80)}...`);
      } else {
        // 已经使用代理或不启用代理，生成fallback
        nextSrc = generateAdvancedFallback(alt);
        console.log(`🎨 使用高级fallback图片`);
      }
      
      setCurrentSrc(nextSrc);
      setImageState('loading');
      return;
    }
    
    // 达到最大重试次数，使用最终fallback
    const finalFallback = generateAdvancedFallback(alt);
    console.log(`🎯 使用最终fallback: SVG图片`);
    setCurrentSrc(finalFallback);
    setImageState('loaded');
    onError?.();
  }, [currentSrc, retryCount, retryAttempts, isProxyUsed, enableProxy, src, alt, generateAdvancedFallback, createProxyUrl, onError]);
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {/* Placeholder */}
      {imageState === 'loading' && placeholder !== 'empty' && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={
            placeholder === 'blur' && blurDataURL
              ? {
                  backgroundImage: `url(${blurDataURL})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(20px)',
                  transform: 'scale(1.1)'
                }
              : {}
          }
        />
      )}
      
      {/* 主图片 - 简化版本 */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          onLoad={handleLoad}
          onError={handleError}
          className={`
            transition-opacity duration-300
            ${imageState === 'loaded' ? 'opacity-100' : 'opacity-0'}
            object-cover w-full h-full
          `}
          style={{
            aspectRatio: width && height ? `${width}/${height}` : undefined
          }}
        />
      )}
      
      {/* 错误状态 */}
      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">图片加载失败</p>
          </div>
        </div>
      )}
      
      {/* 加载指示器 */}
      {imageState === 'loading' && currentSrc && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
};