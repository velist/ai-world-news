import { useEffect } from 'react';
import { isWeChatEnvironment } from './useWeChatEnvironment';

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

    // 动态设置微信分享配置
    const setupWeChatShare = () => {
      // 检查微信JS-SDK是否可用
      if (typeof window !== 'undefined' && (window as any).wx) {
        const wx = (window as any).wx;
        
        // 配置微信分享到朋友圈
        wx.ready(() => {
          wx.updateTimelineShareData({
            title: config.title, // 分享标题
            link: config.link, // 分享链接
            imgUrl: config.imgUrl, // 分享图标
            success: () => {
              console.log('微信朋友圈分享配置成功');
            }
          });

          // 配置微信分享给朋友
          wx.updateAppMessageShareData({
            title: config.title, // 分享标题
            desc: config.desc, // 分享描述
            link: config.link, // 分享链接
            imgUrl: config.imgUrl, // 分享图标
            success: () => {
              console.log('微信分享给朋友配置成功');
            }
          });
        });
      } else {
        // 如果没有JS-SDK，使用meta标签方式
        console.log('使用meta标签进行微信分享配置');
        
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
        updateMetaTag('og:image', config.imgUrl);
        updateMetaTag('og:url', config.link);
        
        updateNameMetaTag('description', config.desc);
        updateNameMetaTag('title', config.title);
        
        updateItemPropTag('name', config.title);
        updateItemPropTag('description', config.desc);
        updateItemPropTag('image', config.imgUrl);
      }
    };

    // 延迟执行以确保页面完全加载
    const timer = setTimeout(setupWeChatShare, 100);

    return () => clearTimeout(timer);
  }, [config.title, config.desc, config.link, config.imgUrl, isWeChat]);

  return {
    isWeChat,
    shareConfig: config
  };
};