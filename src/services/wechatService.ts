// 微信分享服务
interface WeChatConfig {
  appId: string;
  timestamp: number;
  nonceStr: string;
  signature: string;
}

interface ShareData {
  title: string;
  desc: string;
  link: string;
  imgUrl: string;
}

export class WeChatService {
  private static instance: WeChatService;
  private isConfigured = false;
  private pendingCallbacks: (() => void)[] = [];

  private constructor() {}

  public static getInstance(): WeChatService {
    if (!WeChatService.instance) {
      WeChatService.instance = new WeChatService();
    }
    return WeChatService.instance;
  }

  /**
   * 获取微信配置签名
   */
  async getWeChatConfig(url: string): Promise<WeChatConfig> {
    try {
      // 调用Cloudflare Worker API获取签名配置
      const workerUrl = 'https://wechat-signature-api.vee5208.workers.dev/api/wechat/signature';
      const response = await fetch(`${workerUrl}?url=${encodeURIComponent(url)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`获取微信配置失败: ${response.status}`);
      }

      const config = await response.json();
      
      // 验证配置完整性
      if (!config.appId || !config.timestamp || !config.nonceStr || !config.signature) {
        throw new Error('微信配置参数不完整');
      }

      console.log('成功获取微信配置:', { appId: config.appId, timestamp: config.timestamp });
      return {
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature
      };
      
    } catch (error) {
      console.error('获取微信配置失败:', error);
      
      // 开发环境降级配置
      if (process.env.NODE_ENV === 'development') {
        console.warn('开发环境使用真实AppId但临时签名，生产环境请配置完整的后端API');
        return {
          appId: 'wx9334c03d16a456a1', // 使用真实的AppId
          timestamp: Math.floor(Date.now() / 1000),
          nonceStr: this.generateNonceStr(),
          signature: 'temp_signature_' + Date.now() // 临时签名，实际需要后端生成
        };
      }
      
      throw error;
    }
  }

  /**
   * 初始化微信JS-SDK
   */
  async initWeChatSDK(): Promise<void> {
    if (!this.isWeChatEnvironment() || this.isConfigured) {
      return;
    }

    try {
      const currentUrl = window.location.href.split('#')[0];
      const config = await this.getWeChatConfig(currentUrl);

      if (!(window as any).wx) {
        console.error('微信JS-SDK未加载');
        return;
      }

      const wx = (window as any).wx;

      // 配置微信JS-SDK
      wx.config({
        debug: process.env.NODE_ENV === 'development', // 开发环境开启调试
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: [
          'updateAppMessageShareData',
          'updateTimelineShareData',
          'onMenuShareAppMessage',
          'onMenuShareTimeline',
          'hideMenuItems',
          'showMenuItems',
          'hideAllNonBaseMenuItem',
          'showAllNonBaseMenuItem'
        ]
      });

      wx.ready(() => {
        console.log('微信JS-SDK配置成功');
        this.isConfigured = true;
        
        // 执行所有待处理的回调
        this.pendingCallbacks.forEach(callback => callback());
        this.pendingCallbacks = [];
      });

      wx.error((res: any) => {
        console.error('微信JS-SDK配置失败:', res);
        // 使用meta标签降级方案
        this.useFallbackShare();
      });

    } catch (error) {
      console.error('初始化微信SDK失败:', error);
      this.useFallbackShare();
    }
  }

  /**
   * 配置分享内容
   */
  configureShare(shareData: ShareData): void {
    if (!this.isWeChatEnvironment()) {
      return;
    }

    const executeShare = () => {
      const wx = (window as any).wx;
      if (!wx) return;

      // 确保图片URL包含时间戳
      const imgUrl = this.addTimestampToUrl(shareData.imgUrl);
      const finalShareData = { ...shareData, imgUrl };

      try {
        // 新版分享接口 (推荐)
        wx.updateAppMessageShareData({
          title: finalShareData.title,
          desc: finalShareData.desc,
          link: finalShareData.link,
          imgUrl: finalShareData.imgUrl,
          success: () => {
            console.log('分享给朋友配置成功');
          },
          fail: (res: any) => {
            console.error('分享给朋友配置失败:', res);
          }
        });

        wx.updateTimelineShareData({
          title: finalShareData.title,
          link: finalShareData.link,
          imgUrl: finalShareData.imgUrl,
          success: () => {
            console.log('分享到朋友圈配置成功');
          },
          fail: (res: any) => {
            console.error('分享到朋友圈配置失败:', res);
          }
        });

        // 兼容旧版接口
        wx.onMenuShareAppMessage({
          title: finalShareData.title,
          desc: finalShareData.desc,
          link: finalShareData.link,
          imgUrl: finalShareData.imgUrl,
          success: () => {
            console.log('旧版分享给朋友成功');
          }
        });

        wx.onMenuShareTimeline({
          title: finalShareData.title,
          link: finalShareData.link,
          imgUrl: finalShareData.imgUrl,
          success: () => {
            console.log('旧版分享到朋友圈成功');
          }
        });

      } catch (error) {
        console.error('配置分享失败:', error);
      }
    };

    if (this.isConfigured) {
      executeShare();
    } else {
      this.pendingCallbacks.push(executeShare);
      // 确保SDK初始化
      this.initWeChatSDK();
    }
  }

  /**
   * 降级分享方案 - 使用meta标签
   */
  private useFallbackShare(): void {
    console.log('使用meta标签降级分享方案');
    // 这里可以实现meta标签的设置逻辑
  }

  /**
   * 检查是否为微信环境
   */
  private isWeChatEnvironment(): boolean {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('micromessenger');
  }

  /**
   * 生成随机字符串
   */
  private generateNonceStr(): string {
    return Math.random().toString(36).substr(2, 15);
  }

  /**
   * 为URL添加时间戳
   */
  private addTimestampToUrl(url: string): string {
    if (!url) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${Date.now()}`;
  }

  /**
   * 隐藏微信菜单项
   */
  hideMenuItems(menuItems: string[]): void {
    if (!this.isWeChatEnvironment() || !this.isConfigured) return;

    const wx = (window as any).wx;
    if (wx) {
      wx.hideMenuItems({
        menuList: menuItems
      });
    }
  }

  /**
   * 显示微信菜单项
   */
  showMenuItems(menuItems: string[]): void {
    if (!this.isWeChatEnvironment() || !this.isConfigured) return;

    const wx = (window as any).wx;
    if (wx) {
      wx.showMenuItems({
        menuList: menuItems
      });
    }
  }
}

// 导出单例实例
export const wechatService = WeChatService.getInstance();