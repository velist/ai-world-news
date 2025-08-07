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

    // 设置基础meta标签
    this.setMetaTag('name', 'description', shareConfig.desc);
    this.setMetaTag('name', 'keywords', this.generateKeywords(shareConfig.title));

    // Open Graph 标签（微信分享主要依赖）
    this.setMetaTag('property', 'og:type', 'article');
    this.setMetaTag('property', 'og:title', shareConfig.title);
    this.setMetaTag('property', 'og:description', shareConfig.desc);
    this.setMetaTag('property', 'og:image', this.optimizeImageUrl(shareConfig.imgUrl));
    this.setMetaTag('property', 'og:url', shareConfig.link);
    this.setMetaTag('property', 'og:site_name', 'AI推');

    // 微信专用标签
    this.setMetaTag('name', 'wechat:title', shareConfig.title);
    this.setMetaTag('name', 'wechat:desc', shareConfig.desc);
    this.setMetaTag('name', 'wechat:image', this.optimizeImageUrl(shareConfig.imgUrl));

    // Twitter Card（增强兼容性）
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', shareConfig.title);
    this.setMetaTag('name', 'twitter:description', shareConfig.desc);
    this.setMetaTag('name', 'twitter:image', this.optimizeImageUrl(shareConfig.imgUrl));

    console.log('📋 Meta标签配置完成');
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
  private setMetaTag(type: 'name' | 'property', key: string, content: string): void {
    let meta = document.querySelector(`meta[${type}="${key}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(type, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private removeOldMetaTags(): void {
    const metaSelectors = [
      'meta[property^="og:"]',
      'meta[name^="twitter:"]',
      'meta[name^="wechat:"]',
      'meta[name="description"]',
      'meta[name="keywords"]'
    ];

    metaSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });
  }

  private optimizeImageUrl(imgUrl: string): string {
    if (!imgUrl) {
      return 'https://news.aipush.fun/wechat-share-300.png';
    }

    // 确保HTTPS
    if (imgUrl.startsWith('http://')) {
      imgUrl = imgUrl.replace('http://', 'https://');
    }

    // 添加时间戳避免缓存
    const separator = imgUrl.includes('?') ? '&' : '?';
    return `${imgUrl}${separator}t=${Date.now()}`;
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