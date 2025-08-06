import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isWeChatEnvironment } from '@/hooks/useWeChatEnvironment';

/**
 * 微信环境Hash路由处理器
 * 专门处理微信环境下Hash路由的参数提取和重定向
 */
export const WeChatHashRouterHandler = () => {
  const navigate = useNavigate();
  const isWeChat = isWeChatEnvironment();
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!isWeChat || processed) return;

    const hash = window.location.hash;
    const pathname = window.location.pathname;
    
    console.log('🔍 WeChatHashRouterHandler启动:', { 
      hash, 
      pathname, 
      isWeChat, 
      fullUrl: window.location.href 
    });

    // 检查是否为新闻详情的Hash路由
    if (hash && hash.startsWith('#/news/')) {
      const match = hash.match(/#\/news\/(.+)/);
      if (match && match[1]) {
        const newsId = match[1];
        console.log('✅ 成功从Hash中提取新闻ID:', { 
          originalHash: hash, 
          extractedId: newsId,
          targetPath: `/news/${newsId}`
        });
        
        // 延迟执行重定向，确保组件完全加载
        setTimeout(() => {
          console.log('🚀 开始重定向到:', `/news/${newsId}`);
          navigate(`/news/${newsId}`, { replace: true });
          setProcessed(true);
        }, 100);
      } else {
        console.error('❌ Hash路由格式不正确:', hash);
      }
    } else if (hash) {
      console.log('ℹ️ 检测到Hash路由但不是新闻格式:', hash);
    } else {
      console.log('ℹ️ 当前没有Hash路由');
    }
  }, [navigate, isWeChat, processed]);

  return null; // 这个组件不渲染任何内容
};