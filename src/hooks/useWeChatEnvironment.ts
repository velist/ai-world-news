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
    
    // 1. 微信环境专用路由处理（简化版本，避免重定向循环）
    const handleWeChatRouting = () => {
      const hash = window.location.hash;
      const path = window.location.pathname;
      
      // 检查是否是直接访问的Hash路由新闻详情页
      if (hash && hash.startsWith('#/news/')) {
        console.log('📱 微信环境检测到新闻Hash路由:', hash);
        
        // 不进行重定向，让React Router处理Hash路由
        // 这样避免了无限重定向循环
        console.log('🔒 保持Hash路由不变，由React Router处理');
        return false;
      }
      
      // 其他Hash路由保持原样，不进行规范化
      if (hash && hash !== '#') {
        console.log('🔒 微信环境保持Hash路由:', hash);
        return false;
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
 * 根据环境生成合适的分享链接
 */
export const generateWeChatShareUrl = (newsId: string): string => {
  // 无论当前环境如何，微信分享统一使用Hash路由
  return `https://news.aipush.fun/#/news/${newsId}`;
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