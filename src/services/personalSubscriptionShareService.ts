// 个人订阅号专用分享服务 - 无需API权限
// 针对个人订阅号无法调用微信API的情况优化

interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

export class PersonalSubscriptionShareService {
  private static instance: PersonalSubscriptionShareService;
  
  private constructor() {}

  public static getInstance(): PersonalSubscriptionShareService {
    if (!PersonalSubscriptionShareService.instance) {
      PersonalSubscriptionShareService.instance = new PersonalSubscriptionShareService();
    }
    return PersonalSubscriptionShareService.instance;
  }

  /**
   * 检测微信环境
   */
  isWeChatEnvironment(): boolean {
    return /micromessenger/i.test(navigator.userAgent);
  }

  /**
   * 智能分享配置 - 个人订阅号专用
   * 使用Meta标签和页面信息优化分享效果
   */
  async configureShare(shareConfig: ShareConfig): Promise<void> {
    if (!this.isWeChatEnvironment()) {
      console.log('非微信环境，跳过分享配置');
      return;
    }

    console.log('🔧 个人订阅号分享配置开始');

    // 1. 设置页面基础信息
    this.setupPageMeta(shareConfig);

    // 2. 尝试基础JS-SDK配置（如果可用）
    await this.tryBasicJSSDK(shareConfig);

    // 3. 设置结构化数据
    this.setupStructuredData(shareConfig);

    console.log('✅ 个人订阅号分享配置完成');
  }

  /**
   * 设置页面Meta标签
   */
  private setupPageMeta(shareConfig: ShareConfig): void {
    // 清理并设置页面标题
    document.title = shareConfig.title;

    // 移除旧的meta标签
    this.removeOldMetaTags();

    // 确保图片URL正确且符合微信要求
    const optimizedImageUrl = this.optimizeImageUrl(shareConfig.imgUrl);
    
    // 设置基础meta标签
    this.setMetaTag('name', 'description', shareConfig.desc);
    this.setMetaTag('name', 'keywords', this.generateKeywords(shareConfig.title));

    // Open Graph 标签（微信分享主要依赖）- 顺序很重要
    this.setMetaTag('property', 'og:type', 'article');
    this.setMetaTag('property', 'og:title', shareConfig.title);
    this.setMetaTag('property', 'og:description', shareConfig.desc);
    this.setMetaTag('property', 'og:url', shareConfig.link);
    this.setMetaTag('property', 'og:site_name', 'AI推');
    
    // 图片标签 - 针对微信优化
    this.setMetaTag('property', 'og:image', optimizedImageUrl);
    this.setMetaTag('property', 'og:image:secure_url', optimizedImageUrl);
    this.setMetaTag('property', 'og:image:width', '300');
    this.setMetaTag('property', 'og:image:height', '300');
    this.setMetaTag('property', 'og:image:type', 'image/png');
    this.setMetaTag('property', 'og:image:alt', shareConfig.title);

    // 微信专用标签（重要）
    this.setMetaTag('name', 'wechat:title', shareConfig.title);
    this.setMetaTag('name', 'wechat:desc', shareConfig.desc);
    this.setMetaTag('name', 'wechat:image', optimizedImageUrl);
    
    // 微信分享的隐式标签
    this.setMetaTag('name', 'wxcard:title', shareConfig.title);
    this.setMetaTag('name', 'wxcard:desc', shareConfig.desc);
    this.setMetaTag('name', 'wxcard:imgUrl', optimizedImageUrl);
    this.setMetaTag('name', 'wxcard:link', shareConfig.link);

    // Schema.org 微数据
    this.setMetaTag('itemprop', 'name', shareConfig.title);
    this.setMetaTag('itemprop', 'description', shareConfig.desc);
    this.setMetaTag('itemprop', 'image', optimizedImageUrl);
    this.setMetaTag('itemprop', 'url', shareConfig.link);

    // Twitter Card（增强兼容性）
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:site', '@aipush_news');
    this.setMetaTag('name', 'twitter:title', shareConfig.title);
    this.setMetaTag('name', 'twitter:description', shareConfig.desc);
    this.setMetaTag('name', 'twitter:image', optimizedImageUrl);

    // 添加微信特殊要求的标签
    this.setMetaTag('name', 'format-detection', 'telephone=no');
    this.setMetaTag('name', 'x5-orientation', 'portrait');
    this.setMetaTag('name', 'x5-fullscreen', 'true');
    
    // 强制刷新页面缓存，帮助微信重新抓取
    this.setMetaTag('http-equiv', 'Cache-Control', 'no-cache, no-store, must-revalidate');
    this.setMetaTag('http-equiv', 'Pragma', 'no-cache');
    this.setMetaTag('http-equiv', 'Expires', '0');

    console.log('📋 Meta标签配置完成，优化图片URL:', optimizedImageUrl);
    console.log('🔧 所有标签:', this.getAllMetaTags());
  }

  /**
   * 尝试基础JS-SDK配置（无需API调用）
   */
  private async tryBasicJSSDK(shareConfig: ShareConfig): Promise<void> {
    if (typeof (window as any).wx === 'undefined') {
      console.log('微信JS-SDK未加载');
      return;
    }

    const wx = (window as any).wx;

    try {
      // 使用固定配置（个人订阅号通常无法获取有效签名）
      wx.config({
        debug: false,
        appId: 'wx9334c03d16a456a1', // 使用真实AppId
        timestamp: Math.floor(Date.now() / 1000),
        nonceStr: this.generateNonceStr(),
        signature: 'invalid_signature_for_personal_account',
        jsApiList: [
          'onMenuShareAppMessage',
          'onMenuShareTimeline',
          'updateAppMessageShareData',
          'updateTimelineShareData'
        ]
      });

      wx.ready(() => {
        console.log('✅ JS-SDK基础配置完成');
        this.setupBasicShare(shareConfig);
      });

      wx.error((res: any) => {
        console.log('⚠️ JS-SDK配置失败，使用Meta标签方案:', res);
        // 失败是正常的，Meta标签已经设置
      });

    } catch (error) {
      console.log('JS-SDK配置异常:', error);
    }
  }

  /**
   * 设置基础分享（如果JS-SDK可用）
   */
  private setupBasicShare(shareConfig: ShareConfig): void {
    const wx = (window as any).wx;
    const imgUrl = this.optimizeImageUrl(shareConfig.imgUrl);

    const shareData = {
      title: shareConfig.title,
      desc: shareConfig.desc,
      link: shareConfig.link,
      imgUrl: imgUrl,
      success: () => console.log('分享成功'),
      cancel: () => console.log('分享取消')
    };

    try {
      // 尝试新接口
      wx.updateAppMessageShareData && wx.updateAppMessageShareData(shareData);
      wx.updateTimelineShareData && wx.updateTimelineShareData({
        title: shareData.title,
        link: shareData.link,
        imgUrl: shareData.imgUrl
      });

      // 兼容旧接口
      wx.onMenuShareAppMessage && wx.onMenuShareAppMessage(shareData);
      wx.onMenuShareTimeline && wx.onMenuShareTimeline({
        title: shareData.title,
        link: shareData.link,
        imgUrl: shareData.imgUrl
      });

      console.log('📱 JS-SDK分享配置尝试完成');
    } catch (error) {
      console.log('JS-SDK分享配置失败:', error);
    }
  }

  /**
   * 设置结构化数据
   */
  private setupStructuredData(shareConfig: ShareConfig): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": shareConfig.title,
      "description": shareConfig.desc,
      "url": shareConfig.link,
      "image": [this.optimizeImageUrl(shareConfig.imgUrl)],
      "datePublished": new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "AI推"
      },
      "publisher": {
        "@type": "Organization",
        "name": "AI推",
        "url": "https://news.aipush.fun",
        "logo": {
          "@type": "ImageObject",
          "url": "https://news.aipush.fun/favicon.svg"
        }
      }
    });

    // 移除旧的结构化数据
    const oldScript = document.querySelector('script[type="application/ld+json"]');
    if (oldScript) {
      oldScript.remove();
    }

    document.head.appendChild(script);
    console.log('🔍 结构化数据设置完成');
  }

  /**
   * 工具方法
   */
  private setMetaTag(type: 'name' | 'property' | 'itemprop' | 'http-equiv', key: string, content: string): void {
    let meta = document.querySelector(`meta[${type}="${key}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(type, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private getAllMetaTags(): Record<string, string> {
    const metaTags: Record<string, string> = {};
    document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"], meta[name^="wechat:"], meta[name^="wxcard:"], meta[itemprop]').forEach(meta => {
      const key = meta.getAttribute('property') || meta.getAttribute('name') || meta.getAttribute('itemprop');
      const content = meta.getAttribute('content');
      if (key && content) {
        metaTags[key] = content;
      }
    });
    return metaTags;
  }

  private removeOldMetaTags(): void {
    const metaSelectors = [
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'meta[name^="wechat:"]',
      'meta[itemprop="name"]',
      'meta[itemprop="description"]',
      'meta[itemprop="image"]',
      'meta[name="description"]',
      'meta[name="keywords"]'
    ];

    metaSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  private optimizeImageUrl(imgUrl: string): string {
    // 使用已部署的PNG分享图片（确保可访问性）
    const defaultShareImage = 'https://news.aipush.fun/wechat-share-300.png';
    
    if (!imgUrl) {
      return defaultShareImage;
    }

    // 确保HTTPS
    if (imgUrl.startsWith('http://')) {
      imgUrl = imgUrl.replace('http://', 'https://');
    }
    
    // 如果是相对路径，转换为绝对路径
    if (imgUrl.startsWith('/')) {
      imgUrl = `https://news.aipush.fun${imgUrl}`;
    }
    
    // 移除时间戳参数，微信分享不支持带参数的图片
    imgUrl = imgUrl.split('?')[0];
    
    // 对于新闻文章，统一使用默认分享图片（保持品牌一致性）
    if (imgUrl.includes('news.aipush.fun') || imgUrl.includes('placeholder') || imgUrl.includes('wechat-share') || imgUrl.includes('cat-share')) {
      return defaultShareImage;
    }
    
    // 确保图片URL有效且为可访问格式
    if (!imgUrl.includes('http') || imgUrl.endsWith('.svg')) {
      return defaultShareImage;
    }
    
    return imgUrl;
  }

  private generateKeywords(title: string): string {
    const keywords = ['AI', '人工智能', '新闻', '资讯', '科技'];
    const titleWords = title.split(/[，。！？\s]+/).slice(0, 3);
    return keywords.concat(titleWords).join(',');
  }

  private generateNonceStr(): string {
    return Math.random().toString(36).substr(2, 15);
  }

  /**
   * 显示分享提示
   */
  showShareTip(): void {
    if (!this.isWeChatEnvironment()) return;

    const tip = document.createElement('div');
    tip.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      animation: fadeInOut 3s ease;
    `;
    tip.innerHTML = '点击右上角 "..." 可以分享到朋友圈';

    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0%, 100% { opacity: 0; }
        10%, 90% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(tip);

    setTimeout(() => {
      tip.remove();
      style.remove();
    }, 3000);
  }
}

// 导出单例实例
export const personalSubscriptionShareService = PersonalSubscriptionShareService.getInstance();