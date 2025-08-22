import { useEffect, useRef, useCallback } from 'react';

interface PerformanceConfig {
  enableVirtualization?: boolean;
  enableLazyLoading?: boolean;
  enablePrefetch?: boolean;
  debounceDelay?: number;
}

export const usePerformanceOptimization = (config: PerformanceConfig = {}) => {
  const {
    enableVirtualization = true,
    enableLazyLoading = true,
    enablePrefetch = true,
    debounceDelay = 300
  } = config;

  const rafRef = useRef<number>();
  const debounceRef = useRef<NodeJS.Timeout>();

  // 防抖函数
  const debounce = useCallback(<T extends any[]>(
    func: (...args: T) => void,
    delay: number = debounceDelay
  ) => {
    return (...args: T) => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => func(...args), delay);
    };
  }, [debounceDelay]);

  // 节流函数
  const throttle = useCallback(<T extends any[]>(
    func: (...args: T) => void,
    delay: number = debounceDelay
  ) => {
    let lastCall = 0;
    return (...args: T) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }, [debounceDelay]);

  // 使用requestAnimationFrame优化动画
  const requestAnimationFrame = useCallback((callback: () => void) => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = window.requestAnimationFrame(callback);
  }, []);

  // 预加载关键资源
  const preloadResource = useCallback((url: string, as: string = 'image') => {
    if (!enablePrefetch) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);

    // 清理函数
    return () => {
      try {
        document.head.removeChild(link);
      } catch (error) {
        // 忽略清理错误
      }
    };
  }, [enablePrefetch]);

  // 图片懒加载观察器
  const createLazyImageObserver = useCallback(() => {
    if (!enableLazyLoading || !('IntersectionObserver' in window)) {
      return null;
    }

    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              img.classList.remove('lazy');
              img.classList.add('lazy-loaded');
            }
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.1
      }
    );
  }, [enableLazyLoading]);

  // 内存使用监控
  const monitorMemoryUsage = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      const totalMB = memory.totalJSHeapSize / 1024 / 1024;
      
      console.log(`内存使用: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
      
      // 如果内存使用超过80%，触发垃圾回收提醒
      if (usedMB / totalMB > 0.8) {
        console.warn('内存使用率较高，建议清理组件缓存');
        // 可以触发一些清理操作
        if (window.gc) {
          window.gc();
        }
      }
    }
  }, []);

  // 优化图片加载
  const optimizeImageLoading = useCallback((img: HTMLImageElement) => {
    // 添加加载状态
    img.style.transition = 'opacity 0.3s ease-in-out';
    img.style.opacity = '0';

    const handleLoad = () => {
      img.style.opacity = '1';
      img.removeEventListener('load', handleLoad);
    };

    const handleError = () => {
      img.style.opacity = '1';
      // 可以设置默认图片
      img.removeEventListener('error', handleError);
    };

    img.addEventListener('load', handleLoad);
    img.addEventListener('error', handleError);
  }, []);

  // 批量DOM操作
  const batchDOMOperations = useCallback((operations: (() => void)[]) => {
    // 使用DocumentFragment减少回流
    requestAnimationFrame(() => {
      operations.forEach(operation => operation());
    });
  }, [requestAnimationFrame]);

  // 清理函数
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // 定期内存监控
  useEffect(() => {
    const interval = setInterval(monitorMemoryUsage, 60000); // 每分钟检查一次
    return () => clearInterval(interval);
  }, [monitorMemoryUsage]);

  return {
    debounce,
    throttle,
    requestAnimationFrame,
    preloadResource,
    createLazyImageObserver,
    monitorMemoryUsage,
    optimizeImageLoading,
    batchDOMOperations
  };
};