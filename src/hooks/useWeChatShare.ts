import { useEffect } from 'react';
import { isWeChatEnvironment } from './useWeChatEnvironment';
import { wechatService } from '../services/wechatService';

interface WeChatShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

export const useWeChatShare = (config: WeChatShareConfig) => {
  const isWeChat = isWeChatEnvironment();

  useEffect(() => {
    if (!isWeChat) return;

    // 延迟执行以确保页面完全加载
    const timer = setTimeout(async () => {
      try {
        // 初始化微信SDK
        await wechatService.initWeChatSDK();
        
        // 配置分享内容
        wechatService.configureShare({
          title: config.title,
          desc: config.desc,
          link: config.link,
          imgUrl: config.imgUrl
        });

        // 设置meta标签作为降级方案
        setupMetaTagFallback();

      } catch (error) {
        console.error('微信分享配置失败:', error);
        // 降级到meta标签方案
        setupMetaTagFallback();
      }
    }, 100);

    const setupMetaTagFallback = () => {
      console.log('设置meta标签分享信息');
      
      // 确保图片URL包含时间戳破坏缓存
      const imgUrl = config.imgUrl.includes('?') 
        ? `${config.imgUrl}&t=${Date.now()}` 
        : `${config.imgUrl}?t=${Date.now()}`;

      // 动态更新页面的meta标签
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const updateNameMetaTag = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const updateItemPropTag = (itemProp: string, content: string) => {
        let meta = document.querySelector(`meta[itemprop="${itemProp}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('itemprop', itemProp);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // 更新各种格式的meta标签
      updateMetaTag('og:title', config.title);
      updateMetaTag('og:description', config.desc);
      updateMetaTag('og:image', imgUrl);
      updateMetaTag('og:url', config.link);
      updateMetaTag('og:type', 'website');
      
      updateNameMetaTag('description', config.desc);
      updateNameMetaTag('title', config.title);
      
      updateItemPropTag('name', config.title);
      updateItemPropTag('description', config.desc);
      updateItemPropTag('image', imgUrl);
      
      // 微信专用标签
      updateNameMetaTag('wxcard:title', config.title);
      updateNameMetaTag('wxcard:desc', config.desc);
      updateNameMetaTag('wxcard:imgUrl', imgUrl);
      updateNameMetaTag('wxcard:link', config.link);

      // Twitter Card
      updateNameMetaTag('twitter:card', 'summary_large_image');
      updateNameMetaTag('twitter:title', config.title);
      updateNameMetaTag('twitter:description', config.desc);
      updateNameMetaTag('twitter:image', imgUrl);

      // 更新页面标题
      document.title = config.title;
    };

    return () => clearTimeout(timer);
  }, [config.title, config.desc, config.link, config.imgUrl, isWeChat]);

  return {
    isWeChat,
    shareConfig: config,
    wechatService
  };
};