import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface PerformanceMonitorProps {
  onMetrics?: (metrics: Partial<PerformanceMetrics>) => void;
}

export const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ onMetrics }) => {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // 监控核心Web Vitals
    const observePerformance = () => {
      // FCP (First Contentful Paint)
      const observeFCP = () => {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (entry.name === 'first-contentful-paint') {
                metricsRef.current.fcp = entry.startTime;
                onMetrics?.(metricsRef.current);
              }
            }
          });
          observer.observe({ entryTypes: ['paint'] });
        } catch (error) {
          console.warn('FCP监控不支持:', error);
        }
      };

      // LCP (Largest Contentful Paint)
      const observeLCP = () => {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            metricsRef.current.lcp = lastEntry.startTime;
            onMetrics?.(metricsRef.current);
          });
          observer.observe({ entryTypes: ['largest-contentful-paint'] });
        } catch (error) {
          console.warn('LCP监控不支持:', error);
        }
      };

      // FID (First Input Delay)
      const observeFID = () => {
        try {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              metricsRef.current.fid = entry.processingStart - entry.startTime;
              onMetrics?.(metricsRef.current);
            }
          });
          observer.observe({ entryTypes: ['first-input'] });
        } catch (error) {
          console.warn('FID监控不支持:', error);
        }
      };

      // CLS (Cumulative Layout Shift)
      const observeCLS = () => {
        try {
          let clsValue = 0;
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            for (const entry of entries) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            metricsRef.current.cls = clsValue;
            onMetrics?.(metricsRef.current);
          });
          observer.observe({ entryTypes: ['layout-shift'] });
        } catch (error) {
          console.warn('CLS监控不支持:', error);
        }
      };

      // TTFB (Time to First Byte)
      const observeTTFB = () => {
        try {
          const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
          if (navEntries.length > 0) {
            const ttfb = navEntries[0].responseStart - navEntries[0].requestStart;
            metricsRef.current.ttfb = ttfb;
            onMetrics?.(metricsRef.current);
          }
        } catch (error) {
          console.warn('TTFB监控不支持:', error);
        }
      };

      // 启动所有监控
      observeFCP();
      observeLCP();
      observeFID();
      observeCLS();
      observeTTFB();
    };

    // 延迟启动性能监控，避免影响初始加载
    const timeoutId = setTimeout(observePerformance, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [onMetrics]);

  // 内存泄漏监控
  useEffect(() => {
    const checkMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / 1024 / 1024;
        const totalMB = memory.totalJSHeapSize / 1024 / 1024;
        
        // 如果内存使用超过100MB，发出警告
        if (usedMB > 100) {
          console.warn(`内存使用较高: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
        }
      }
    };

    // 每30秒检查一次内存使用
    const intervalId = setInterval(checkMemoryUsage, 30000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // 网络连接监控
  useEffect(() => {
    const handleOnline = () => console.log('网络连接已恢复');
    const handleOffline = () => console.warn('网络连接已断开');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null; // 不渲染任何UI
};