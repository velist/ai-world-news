import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isWeChatEnvironment } from '@/hooks/useWeChatEnvironment';

/**
 * 微信环境Hash路由处理器
 * 专门处理微信环境下Hash路由的参数提取和重定向
 */
export const WeChatHashRouterHandler = () => {
  const navigate = useNavigate();
  const isWeChat = isWeChatEnvironment();

  useEffect(() => {
    if (!isWeChat) return;

    const hash = window.location.hash;
    console.log('🔍 WeChatHashRouterHandler检查:', { hash, pathname: window.location.pathname });

    // 检查是否为新闻详情的Hash路由
    if (hash && hash.startsWith('#/news/')) {
      const match = hash.match(/#\/news\/(.+)/);
      if (match && match[1]) {
        const newsId = match[1];
        console.log('🔍 从Hash中提取新闻ID:', newsId);
        
        // 重定向到标准路径，HashRouter会正确处理
        navigate(`/news/${newsId}`, { replace: true });
      }
    }
  }, [navigate, isWeChat]);

  return null; // 这个组件不渲染任何内容
};