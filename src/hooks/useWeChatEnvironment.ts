import { useEffect, useState } from 'react';

/**
 * 微信环境专用优化Hook - 简化版本
 * 处理微信内嵌浏览器的特殊行为，包括：
 * - 分享链接处理
 * - 基础缓存控制
 * - 状态恢复
 */
export const useWeChatEnvironment = () => {
  const [isWeChat, setIsWeChat] = useState(false);
  const [pageState, setPageState] = useState(null);

  useEffect(() => {
    const isWeChatBrowser = /micromessenger/i.test(navigator.userAgent);
    setIsWeChat(isWeChatBrowser);
    
    if (!isWeChatBrowser) return;
    
    console.log('🔧 微信环境优化已启用');
    
    // 1. 微信环境专用路由处理（只处理分享链接）
    const handleWeChatRouting = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sharedNewsId = urlParams.get('news_id');
      
      if (sharedNewsId && !window.location.pathname.includes('/news/')) {
        const targetUrl = `/news/${sharedNewsId}`;
        console.log('🔄 检测到分享链接，重定向到:', targetUrl);
        window.location.replace(targetUrl);
        return true;
      }
      
      return false;
    };
    
    // 2. 简化的缓存控制
    const controlWeChatCache = () => {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Cache-Control');
      meta.setAttribute('content', 'no-cache, no-store, must-revalidate');
      document.head.appendChild(meta);
    };
    
    // 3. 页面状态恢复
    const restorePageState = () => {
      const savedState = sessionStorage.getItem('wechat_page_state');
      if (savedState) {
        try {
          const parsedState = JSON.parse(savedState);
          setPageState(parsedState);
          sessionStorage.removeItem('wechat_page_state');
          console.log('📱 页面状态已恢复');
        } catch (e) {
          console.error('Failed to restore page state:', e);
        }
      }
    };
    
    // 4. 页面卸载前保存状态
    const handleBeforeUnload = () => {
      const currentState = {
        path: window.location.pathname,
        timestamp: Date.now()
      };
      sessionStorage.setItem('wechat_page_state', JSON.stringify(currentState));
    };
    
    // 执行优化
    if (!handleWeChatRouting()) {
      controlWeChatCache();
      restorePageState();
    }
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 5. 微信JS-SDK就绪处理
    if (typeof window.WeixinJSBridge !== 'undefined') {
      console.log('📱 微信JS-SDK已就绪');
    } else {
      document.addEventListener('WeixinJSBridgeReady', () => {
        console.log('📱 微信JS-SDK已就绪');
      });
    }
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
    
  }, []);

  return { isWeChat, pageState };
};

/**
 * 微信环境专用分享URL生成器
 * 确保分享链接在微信环境中能正常打开
 */
export const generateWeChatShareUrl = (newsId: string): string => {
  return `https://news.aipush.fun/news/${newsId}`;
};

/**
 * 检测当前是否在微信环境中
 */
export const isWeChatEnvironment = (): boolean => {
  return /micromessenger/i.test(navigator.userAgent);
};

/**
 * 微信环境专用缓存破坏URL生成
 */
export const generateAntiCacheUrl = (baseUrl: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}_wechat_cache=${timestamp}_${random}`;
};