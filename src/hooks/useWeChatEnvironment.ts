import { useEffect } from 'react';

/**
 * 微信环境专用优化Hook
 * 处理微信内嵌浏览器的特殊行为，包括：
 * - 路由处理优化
 * - 缓存控制
 * - 页面加载优化
 * - 分享链接处理
 */
export const useWeChatEnvironment = () => {
  useEffect(() => {
    const isWeChat = /micromessenger/i.test(navigator.userAgent);
    
    if (!isWeChat) return;
    
    console.log('🔧 微信环境优化已启用');
    
    // 1. 微信环境专用路由处理
    const handleWeChatRouting = () => {
      // 检查是否有分享链接参数
      const urlParams = new URLSearchParams(window.location.search);
      const sharedNewsId = urlParams.get('news_id');
      
      if (sharedNewsId && !window.location.pathname.includes('/news/')) {
        // 如果有分享参数但不在正确路径，重定向到新闻详情页
        const targetUrl = `/news/${sharedNewsId}`;
        console.log('🔄 检测到分享链接，重定向到:', targetUrl);
        window.location.replace(targetUrl);
        return true;
      }
      
      return false;
    };
    
    // 2. 微信环境缓存控制
    const controlWeChatCache = () => {
      // 为微信环境添加特殊的缓存控制
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', 'Cache-Control');
      meta.setAttribute('content', 'no-cache, no-store, must-revalidate');
      document.head.appendChild(meta);
      
      const pragma = document.createElement('meta');
      pragma.setAttribute('http-equiv', 'Pragma');
      pragma.setAttribute('content', 'no-cache');
      document.head.appendChild(pragma);
      
      const expires = document.createElement('meta');
      expires.setAttribute('http-equiv', 'Expires');
      expires.setAttribute('content', '0');
      document.head.appendChild(expires);
    };
    
    // 3. 微信环境页面加载优化
    const optimizePageLoading = () => {
      // 监听页面显示事件，处理微信切换标签页后的状态
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          console.log('📱 页面重新可见，检查状态');
          // 检查页面是否正确加载
          if (document.body.innerHTML.trim().length < 100) {
            console.log('⚠️ 页面内容异常，准备重新加载');
            setTimeout(() => {
              window.location.reload();
            }, 100);
          }
        }
      });
      
      // 处理微信返回按钮
      window.addEventListener('popstate', (e) => {
        console.log('🔙 微信返回按钮事件');
        setTimeout(() => {
          if (!document.body.innerHTML.trim()) {
            console.log('🔄 返回后页面为空，重新加载');
            window.location.reload();
          }
        }, 50);
      });
    };
    
    // 4. 微信环境专用URL处理
    const optimizeURLHandling = () => {
      // 确保微信环境下的URL格式正确
      const currentUrl = window.location.href;
      
      // 检查是否有微信缓存破坏参数，如果有则清理
      const urlObj = new URL(currentUrl);
      const hasCacheParams = Array.from(urlObj.searchParams.keys()).some(key => 
        key.includes('_wechat_cache_bust') || key.includes('_wechat_refresh') || key.includes('_wechat_backup_redirect')
      );
      
      if (hasCacheParams) {
        // 如果有缓存破坏参数，确保页面正常加载
        console.log('🧹 检测到缓存参数，确保页面正常加载');
        const maxRetries = 3;
        let retryCount = 0;
        
        const checkPageLoaded = () => {
          if (document.readyState === 'complete') {
            if (document.body.innerHTML.trim().length > 100) {
              console.log('✅ 页面加载成功');
              return;
            }
            
            if (retryCount < maxRetries) {
              retryCount++;
              console.log(`🔄 页面内容异常，第${retryCount}次重试`);
              setTimeout(checkPageLoaded, 500 * retryCount);
            } else {
              console.log('❌ 多次重试失败，强制跳转到首页');
              window.location.replace('/');
            }
          } else {
            setTimeout(checkPageLoaded, 100);
          }
        };
        
        checkPageLoaded();
      }
    };
    
    // 执行所有优化
    if (!handleWeChatRouting()) {
      controlWeChatCache();
      optimizePageLoading();
      optimizeURLHandling();
    }
    
    // 5. 微信JS-SDK就绪处理
    if (typeof window.WeixinJSBridge !== 'undefined') {
      console.log('📱 微信JS-SDK已就绪');
    } else {
      document.addEventListener('WeixinJSBridgeReady', () => {
        console.log('📱 微信JS-SDK已就绪');
      });
    }
    
  }, []);
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