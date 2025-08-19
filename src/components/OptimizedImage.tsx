import React, { useState, useRef, useEffect } from 'react';

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
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  loading = 'lazy',
  onLoad,
  onError,
  fallbackSrc
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  
  // 智能备用图片生成
  const generateFallbackImage = (title: string): string => {
    if (fallbackSrc) return fallbackSrc;
    
    const titleLower = title.toLowerCase();
    
    // AI相关图片
    if (titleLower.includes('ai') || titleLower.includes('artificial intelligence') || 
        titleLower.includes('machine learning') || titleLower.includes('chatgpt') || 
        titleLower.includes('openai') || titleLower.includes('claude') || titleLower.includes('人工智能') ||
        titleLower.includes('大模型') || titleLower.includes('llm') || titleLower.includes('深度学习')) {
      return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format';
    }
    
    // 机器人和自动化
    if (titleLower.includes('robot') || titleLower.includes('automation') || 
        titleLower.includes('机器人') || titleLower.includes('自动化') ||
        titleLower.includes('自动驾驶') || titleLower.includes('self-driving')) {
      return 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=600&fit=crop&auto=format';
    }
    
    // 科技和技术
    if (titleLower.includes('tech') || titleLower.includes('computer') || 
        titleLower.includes('software') || titleLower.includes('app') || 
        titleLower.includes('科技') || titleLower.includes('技术') ||
        titleLower.includes('芯片') || titleLower.includes('gpu') || titleLower.includes('处理器')) {
      return 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&auto=format';
    }
    
    // 数据和代码
    if (titleLower.includes('data') || titleLower.includes('code') || 
        titleLower.includes('programming') || titleLower.includes('开发') ||
        titleLower.includes('数据') || titleLower.includes('代码') || titleLower.includes('编程')) {
      return 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=600&fit=crop&auto=format';
    }
    
    // 默认AI新闻图片
    return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=600&fit=crop&auto=format';
  };
  
  // 生成不同尺寸的图片URL
  const generateSrcSet = (originalSrc: string, width?: number) => {
    if (!width) return undefined;
    const widths = [width * 0.5, width, width * 1.5, width * 2];
    return widths
      .map(w => `${originalSrc}?w=${Math.round(w)}&q=${quality} ${Math.round(w)}w`)
      .join(', ');
  };
  
  // 生成WebP格式的图片URL
  const generateWebPUrl = (originalSrc: string): string => {
    if (originalSrc.includes('?')) {
      return `${originalSrc}&f=webp`;
    }
    return `${originalSrc}?f=webp`;
  };
  
  // 检测浏览器对WebP的支持
  const [supportsWebP, setSupportsWebP] = useState(false);
  
  useEffect(() => {
    const webp = new Image();
    webp.onload = webp.onerror = () => {
      setSupportsWebP(webp.height === 2);
    };
    webp.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  }, []);
  
  // 选择最优的图片格式
  const getOptimalSrc = (originalSrc: string): string => {
    return supportsWebP ? generateWebPUrl(originalSrc) : originalSrc;
  };
  
  // 懒加载逻辑
  useEffect(() => {
    if (priority || loading === 'eager') {
      setCurrentSrc(getOptimalSrc(src));
      return;
    }
    
    if (!imgRef.current) return;
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCurrentSrc(getOptimalSrc(src));
          observerRef.current?.unobserve(entry.target);
        }
      },
      { rootMargin: '50px' }
    );
    
    observerRef.current.observe(imgRef.current);
    
    return () => {
      observerRef.current?.disconnect();
    };
  }, [src, priority, loading, supportsWebP]);
  
  // 图片加载处理
  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };
  
  const handleError = () => {
    console.warn(`图片加载失败: ${currentSrc}, 重试次数: ${retryCount}`);
    
    // 防止无限重试，最多重试2次
    if (retryCount < 2) {
      const fallbackUrl = generateFallbackImage(alt);
      
      // 检查是否已经在使用备用图片，避免循环
      if (currentSrc !== fallbackUrl) {
        setRetryCount(prev => prev + 1);
        setCurrentSrc(fallbackUrl);
        setImageState('loading');
        return;
      }
    }
    
    // 最终失败，显示错误状态
    setImageState('error');
    onError?.();
  };
  
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
      
      {/* 主图片 */}
      {currentSrc && (
        <picture>
          {supportsWebP && (
            <source
              srcSet={generateSrcSet(generateWebPUrl(src), width)}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          <img
            ref={imgRef}
            src={currentSrc}
            srcSet={generateSrcSet(src, width)}
            sizes={sizes}
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
          />
        </picture>
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