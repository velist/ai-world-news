// 个人订阅号专用分享服务
// 针对可能没有JS-SDK权限的个人订阅号优化

interface ShareConfig {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

export class SubscriptionAccountShareService {
  private static instance: SubscriptionAccountShareService;
  
  private constructor() {}

  public static getInstance(): SubscriptionAccountShareService {
    if (!SubscriptionAccountShareService.instance) {
      SubscriptionAccountShareService.instance = new SubscriptionAccountShareService();
    }
    return SubscriptionAccountShareService.instance;
  }

  /**
   * 检测微信环境和权限
   */
  detectWeChatCapabilities(): {
    isWeChat: boolean;
    hasJSSDK: boolean;
    canUseConfig: boolean;
  } {
    const isWeChat = /micromessenger/i.test(navigator.userAgent);
    const hasJSSDK = typeof (window as any).wx !== 'undefined';
    
    return {
      isWeChat,
      hasJSSDK,
      canUseConfig: hasJSSDK && isWeChat
    };
  }

  /**
   * 尝试使用JS-SDK配置（如果有权限）
   */
  async tryJSSDKConfig(shareConfig: ShareConfig): Promise<boolean> {
    const capabilities = this.detectWeChatCapabilities();
    
    if (!capabilities.canUseConfig) {
      console.log('当前环境不支持JS-SDK，使用Meta标签方案');
      return false;
    }

    try {
      // 尝试获取签名配置
      const config = await this.getSignatureConfig();
      const wx = (window as any).wx;

      wx.config({
        debug: false,
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareAppMessage',
          'onMenuShareTimeline'
        ]
      });

      return new Promise((resolve) => {
        wx.ready(() => {
          console.log('JS-SDK配置成功，使用高级分享功能');
          this.configureJSSDKShare(shareConfig);
          resolve(true);
        });

        wx.error((res: any) => {
          console.warn('JS-SDK配置失败，可能权限不足:', res);
          resolve(false);
        });
      });

    } catch (error) {
      console.warn('JS-SDK配置尝试失败:', error);
      return false;
    }
  }

  /**
   * 配置JS-SDK分享（如果有权限）
   */
  private configureJSSDKShare(shareConfig: ShareConfig): void {
    const wx = (window as any).wx;
    const imgUrl = this.addTimestamp(shareConfig.imgUrl);

    const shareData = {
      title: shareConfig.title,
      desc: shareConfig.desc,
      link: shareConfig.link,
      imgUrl: imgUrl,
      success: () => console.log('分享成功'),
      cancel: () => console.log('分享取消')
    };

    // 新接口
    wx.updateAppMessageShareData(shareData);
    wx.updateTimelineShareData({
      title: shareData.title,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      success: shareData.success,
      cancel: shareData.cancel
    });

    // 兼容旧接口
    wx.onMenuShareAppMessage(shareData);
    wx.onMenuShareTimeline({
      title: shareData.title,
      link: shareData.link,
      imgUrl: shareData.imgUrl,
      success: shareData.success,
      cancel: shareData.cancel
    });
  }

  /**
   * Meta标签分享方案（通用方案）
   */
  setupMetaTagShare(shareConfig: ShareConfig): void {
    console.log('设置Meta标签分享方案');

    // 优先使用PNG格式图片
    let imgUrl = shareConfig.imgUrl;
    if (imgUrl.includes('wechat-thumb.svg')) {
      imgUrl = imgUrl.replace('wechat-thumb.svg', 'wechat-share-300.png');
    }
    if (imgUrl.includes('wechat-thumb.png') && !imgUrl.includes('wechat-share-300.png')) {
      imgUrl = imgUrl.replace('wechat-thumb.png', 'wechat-share-300.png');
    }

    imgUrl = this.addTimestamp(imgUrl);

    // 确保图片尺寸符合微信要求（最小300x300）
    const optimizedImgUrl = this.optimizeImageForWeChat(imgUrl);

    // 更新页面标题
    document.title = shareConfig.title;

    // 设置各种Meta标签
    this.setMetaTag('property', 'og:type', 'website');
    this.setMetaTag('property', 'og:title', shareConfig.title);
    this.setMetaTag('property', 'og:description', shareConfig.desc);
    this.setMetaTag('property', 'og:image', optimizedImgUrl);
    this.setMetaTag('property', 'og:url', shareConfig.link);
    this.setMetaTag('property', 'og:site_name', 'AI推');

    // 微信专用标签
    this.setMetaTag('name', 'wxcard:title', shareConfig.title);
    this.setMetaTag('name', 'wxcard:desc', shareConfig.desc);
    this.setMetaTag('name', 'wxcard:imgUrl', optimizedImgUrl);
    this.setMetaTag('name', 'wxcard:link', shareConfig.link);

    // Twitter Card（提高兼容性）
    this.setMetaTag('name', 'twitter:card', 'summary_large_image');
    this.setMetaTag('name', 'twitter:title', shareConfig.title);
    this.setMetaTag('name', 'twitter:description', shareConfig.desc);
    this.setMetaTag('name', 'twitter:image', optimizedImgUrl);

    // 通用描述标签
    this.setMetaTag('name', 'description', shareConfig.desc);
    this.setMetaTag('name', 'keywords', this.generateKeywords(shareConfig.title));

    // Schema.org 结构化数据
    this.addStructuredData(shareConfig, optimizedImgUrl);

    console.log('Meta标签分享配置完成:', {
      title: shareConfig.title,
      desc: shareConfig.desc,
      image: optimizedImgUrl
    });
  }

  /**
   * 智能分享配置（自动选择最佳方案）
   */
  async configureShare(shareConfig: ShareConfig): Promise<void> {
    // 先尝试JS-SDK方案
    const jssdkSuccess = await this.tryJSSDKConfig(shareConfig);
    
    // 无论是否成功，都设置Meta标签作为降级保障
    this.setupMetaTagShare(shareConfig);

    if (jssdkSuccess) {
      console.log('✅ 使用JS-SDK高级分享功能');
    } else {
      console.log('📋 使用Meta标签分享方案');
    }

    // 设置分享提示
    this.setupShareHint();
  }

  /**
   * 添加分享提示（针对个人订阅号）
   */
  private setupShareHint(): void {
    // 创建分享提示元素
    const hint = document.createElement('div');
    hint.id = 'wechat-share-hint';
    hint.style.cssText = `
      position: fixed;
      bottom: -100px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 10000;
      transition: bottom 0.3s ease;
      display: none;
    `;
    hint.innerHTML = '点击右上角"..."菜单即可分享到朋友圈';
    
    document.body.appendChild(hint);

    // 监听分享按钮点击
    this.addShareButtonListener();
  }

  /**
   * 添加分享按钮监听（显示提示）
   */
  private addShareButtonListener(): void {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.matches('[data-share="true"], .share-btn, .share-button')) {
        this.showShareHint();
      }
    });
  }

  /**
   * 显示分享提示
   */
  private showShareHint(): void {
    const hint = document.getElementById('wechat-share-hint');
    if (hint && this.detectWeChatCapabilities().isWeChat) {
      hint.style.display = 'block';
      hint.style.bottom = '20px';
      
      setTimeout(() => {
        hint.style.bottom = '-100px';
        setTimeout(() => {
          hint.style.display = 'none';
        }, 300);
      }, 2000);
    }
  }

  // 辅助方法
  private setMetaTag(type: 'name' | 'property', key: string, content: string): void {
    let meta = document.querySelector(`meta[${type}="${key}"]`) as HTMLMetaElement;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute(type, key);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', content);
  }

  private addTimestamp(url: string): string {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}&v=2025080802`;
  }

  private optimizeImageForWeChat(imgUrl: string): string {
    // 确保图片URL使用HTTPS
    if (imgUrl.startsWith('http://')) {
      imgUrl = imgUrl.replace('http://', 'https://');
    }
    return imgUrl;
  }

  private generateKeywords(title: string): string {
    const keywords = ['AI', '人工智能', '新闻', '资讯', '技术'];
    return keywords.concat(title.split(/[，。！？\s]+/).slice(0, 3)).join(',');
  }

  private addStructuredData(shareConfig: ShareConfig, imgUrl: string): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": shareConfig.title,
      "description": shareConfig.desc,
      "url": shareConfig.link,
      "image": imgUrl,
      "publisher": {
        "@type": "Organization",
        "name": "AI推",
        "url": "https://news.aipush.fun"
      }
    });
    document.head.appendChild(script);
  }

  private async getSignatureConfig(): Promise<any> {
    const workerUrl = 'https://wechat-signature-api.vee5208.workers.dev/api/wechat/signature';
    const response = await fetch(`${workerUrl}?url=${encodeURIComponent(window.location.href)}`);
    if (!response.ok) throw new Error('获取签名失败');
    return response.json();
  }
}

// 导出单例实例
export const subscriptionShareService = SubscriptionAccountShareService.getInstance();

/*
使用方法：

// 在页面中调用
subscriptionShareService.configureShare({
  title: '页面标题',
  desc: '页面描述', 
  link: window.location.href,
  imgUrl: 'https://news.aipush.fun/share-image.png'
});

// 为分享按钮添加提示
<button data-share="true">分享</button>
*/