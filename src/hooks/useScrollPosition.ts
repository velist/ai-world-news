import { useEffect, useRef, useCallback } from 'react';

interface UseScrollPositionOptions {
  key: string;
  restoreOnMount?: boolean;
  saveDelay?: number;
}

export const useScrollPosition = ({
  key,
  restoreOnMount = true,
  saveDelay = 100
}: UseScrollPositionOptions) => {
  const scrollPositionRef = useRef<number>(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const isRestoringRef = useRef(false);

  // 保存滚动位置到sessionStorage
  const saveScrollPosition = useCallback((position: number) => {
    scrollPositionRef.current = position;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`scroll-${key}`, position.toString());
    }
  }, [key]);

  // 获取保存的滚动位置
  const getSavedScrollPosition = useCallback((): number => {
    if (typeof window === 'undefined') return 0;
    const saved = sessionStorage.getItem(`scroll-${key}`);
    return saved ? parseInt(saved, 10) : 0;
  }, [key]);

  // 恢复滚动位置
  const restoreScrollPosition = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const savedPosition = getSavedScrollPosition();
    if (savedPosition > 0) {
      isRestoringRef.current = true;
      
      // 延迟恢复，确保DOM已渲染
      setTimeout(() => {
        window.scrollTo({
          top: savedPosition,
          behavior: 'auto' // 快速恢复，不使用平滑滚动
        });
        
        // 标记恢复完成
        setTimeout(() => {
          isRestoringRef.current = false;
        }, 50);
      }, 100);
    }
  }, [getSavedScrollPosition]);

  // 手动保存当前滚动位置
  const saveCurrentPosition = useCallback(() => {
    if (typeof window !== 'undefined' && !isRestoringRef.current) {
      saveScrollPosition(window.scrollY);
    }
  }, [saveScrollPosition]);

  // 清除保存的滚动位置
  const clearSavedPosition = useCallback(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(`scroll-${key}`);
    }
    scrollPositionRef.current = 0;
  }, [key]);

  // 监听滚动事件
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      // 如果正在恢复位置，忽略滚动事件
      if (isRestoringRef.current) return;

      const currentPosition = window.scrollY;
      
      // 清除之前的保存定时器
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // 延迟保存，避免频繁操作
      saveTimeoutRef.current = setTimeout(() => {
        saveScrollPosition(currentPosition);
      }, saveDelay);
    };

    // 监听滚动事件，使用passive提高性能
    window.addEventListener('scroll', handleScroll, { passive: true });

    // 页面卸载时保存位置
    const handleBeforeUnload = () => {
      saveCurrentPosition();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    // 清理函数
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [saveScrollPosition, saveDelay, saveCurrentPosition]);

  // 组件挂载时恢复位置
  useEffect(() => {
    if (restoreOnMount) {
      // 延迟恢复，确保页面完全加载
      const timer = setTimeout(() => {
        restoreScrollPosition();
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [restoreOnMount, restoreScrollPosition]);

  return {
    saveCurrentPosition,
    restoreScrollPosition,
    clearSavedPosition,
    getCurrentPosition: () => scrollPositionRef.current
  };
};