import { useEffect } from 'react';
import { isWeChatEnvironment } from './useWeChatEnvironment';
import { wechatService } from '../services/wechatService';
import { subscriptionShareService } from '../services/subscriptionShareService';

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
        console.log('开始配置微信分享...');
        
        // 使用智能分享服务（自动检测权限并选择最佳方案）
        await subscriptionShareService.configureShare({
          title: config.title,
          desc: config.desc,
          link: config.link,
          imgUrl: config.imgUrl
        });

        // 同时保留原有的服务作为备用
        // 如果确认有完整JS-SDK权限，也可以调用原服务
        // await wechatService.initWeChatSDK();
        // wechatService.configureShare(config);

        console.log('微信分享配置完成');

      } catch (error) {
        console.error('微信分享配置失败，使用降级方案:', error);
        
        // 最终降级方案：纯Meta标签设置
        setupFallbackShare();
      }
    }, 100);

    const setupFallbackShare = () => {
      console.log('使用最基础的Meta标签分享方案');
      
      // 确保图片URL包含时间戳
      const imgUrl = config.imgUrl.includes('?') 
        ? `${config.imgUrl}&t=${Date.now()}` 
        : `${config.imgUrl}?t=${Date.now()}`;

      // 基础Meta标签设置
      const setMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      const setNameMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      // 设置页面标题
      document.title = config.title;

      // Open Graph标签
      setMeta('og:type', 'website');
      setMeta('og:title', config.title);
      setMeta('og:description', config.desc);
      setMeta('og:image', imgUrl);
      setMeta('og:url', config.link);
      setMeta('og:site_name', 'AI推');
      
      // 基础Meta标签
      setNameMeta('description', config.desc);
      setNameMeta('title', config.title);
      
      // 微信专用标签
      setNameMeta('wxcard:title', config.title);
      setNameMeta('wxcard:desc', config.desc);
      setNameMeta('wxcard:imgUrl', imgUrl);
      setNameMeta('wxcard:link', config.link);

      // Twitter Card
      setNameMeta('twitter:card', 'summary_large_image');
      setNameMeta('twitter:title', config.title);
      setNameMeta('twitter:description', config.desc);
      setNameMeta('twitter:image', imgUrl);

      console.log('基础分享标签设置完成');
    };

    return () => clearTimeout(timer);
  }, [config.title, config.desc, config.link, config.imgUrl, isWeChat]);

  return {
    isWeChat,
    shareConfig: config,
    wechatService,
    subscriptionShareService
  };
};