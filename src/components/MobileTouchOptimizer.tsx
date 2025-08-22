import React, { useEffect, useRef } from 'react';

interface MobileTouchOptimizerProps {
  children: React.ReactNode;
  enablePullToRefresh?: boolean;
  preventOverscroll?: boolean;
  preventScrollReset?: boolean;
  onPullToRefresh?: () => void;
}

export const MobileTouchOptimizer: React.FC<MobileTouchOptimizerProps> = ({
  children,
  enablePullToRefresh = false,
  preventOverscroll = true,
  preventScrollReset = false,
  onPullToRefresh
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number>(0);
  const isScrollingRef = useRef<boolean>(false);
  const pullDistanceRef = useRef<number>(0);
  const isPullingRef = useRef<boolean>(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let requestId: number;

    // 处理触摸开始
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      isScrollingRef.current = false;
    };

    // 处理触摸移动
    const handleTouchMove = (e: TouchEvent) => {
      if (!e.touches.length) return;

      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartYRef.current;
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;

      // 标记正在滚动
      isScrollingRef.current = true;

      // 防止过度滚动（橡皮筋效果）
      if (preventOverscroll) {
        // 在顶部向下拉
        if (scrollTop <= 0 && deltaY > 0) {
          if (enablePullToRefresh) {
            // 下拉刷新逻辑
            pullDistanceRef.current = Math.min(deltaY, 150); // 最大下拉距离150px
            isPullingRef.current = true;
            
            // 创建或更新下拉指示器
            let refreshIndicator = document.getElementById('pull-to-refresh-indicator');
            if (!refreshIndicator) {
              refreshIndicator = document.createElement('div');
              refreshIndicator.id = 'pull-to-refresh-indicator';
              refreshIndicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 8px 16px;
                border-radius: 0 0 8px 8px;
                font-size: 14px;
                z-index: 1000;
                transition: all 0.3s ease;
                opacity: 0;
                pointer-events: none;
              `;
              document.body.appendChild(refreshIndicator);
            }
            
            const progress = Math.min(pullDistanceRef.current / 80, 1); // 80px触发刷新
            refreshIndicator.style.opacity = progress.toString();
            refreshIndicator.textContent = progress >= 1 ? '松开刷新' : '下拉刷新';
            
            if (pullDistanceRef.current < 150) {
              e.preventDefault();
            }
          } else {
            e.preventDefault();
          }
        }
        
        // 在底部向上推
        if (scrollTop + windowHeight >= documentHeight && deltaY < 0) {
          e.preventDefault();
        }
      }

      // 取消之前的requestAnimationFrame
      if (requestId) {
        cancelAnimationFrame(requestId);
      }

      // 使用requestAnimationFrame优化滚动性能
      requestId = requestAnimationFrame(() => {
        // 这里可以添加自定义滚动逻辑
      });
    };

    // 处理触摸结束
    const handleTouchEnd = () => {
      // 处理下拉刷新
      if (isPullingRef.current && enablePullToRefresh) {
        const refreshIndicator = document.getElementById('pull-to-refresh-indicator');
        if (pullDistanceRef.current >= 80 && onPullToRefresh) {
          // 触发刷新
          onPullToRefresh();
          if (refreshIndicator) {
            refreshIndicator.textContent = '正在刷新...';
            setTimeout(() => {
              refreshIndicator.style.opacity = '0';
              setTimeout(() => {
                refreshIndicator.remove();
              }, 300);
            }, 1000);
          }
        } else {
          // 取消刷新
          if (refreshIndicator) {
            refreshIndicator.style.opacity = '0';
            setTimeout(() => {
              refreshIndicator.remove();
            }, 300);
          }
        }
      }
      
      // 重置状态
      pullDistanceRef.current = 0;
      isPullingRef.current = false;
      
      // 延迟重置滚动状态
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    };

    // 处理滚动事件，防止滚动期间的意外重置
    const handleScroll = (e: Event) => {
      // 如果是编程式滚动（如scrollTo），不要干预
      if (!isScrollingRef.current) {
        return;
      }
    };

    // 添加事件监听器
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 清理函数
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
      
      if (requestId) {
        cancelAnimationFrame(requestId);
      }
    };
  }, [enablePullToRefresh, preventOverscroll]);

  return (
    <div
      ref={containerRef}
      className="mobile-touch-optimizer"
      style={{
        // iOS Safari 硬件加速滚动
        WebkitOverflowScrolling: 'touch',
        // 优化触摸行为
        touchAction: 'pan-y',
        // 防止过度滚动
        overscrollBehavior: preventOverscroll ? 'contain' : 'auto',
        // 启用GPU加速
        transform: 'translateZ(0)',
        // 优化回流和重绘
        willChange: 'scroll-position'
      }}
    >
      {children}
    </div>
  );
};