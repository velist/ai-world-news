/**
 * 海报分享服务
 * 生成包含二维码的新闻分享海报
 */

interface NewsData {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
}

interface PosterConfig {
  width: number;
  height: number;
  backgroundColor: string;
  brandColor: string;
  textColor: string;
  accentColor: string;
}

export class PosterShareService {
  private static instance: PosterShareService;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  private defaultConfig: PosterConfig = {
    width: 750,
    height: 1334,
    backgroundColor: '#ffffff',
    brandColor: '#2c3e50',
    textColor: '#333333',
    accentColor: '#3498db'
  };

  private constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  public static getInstance(): PosterShareService {
    if (!PosterShareService.instance) {
      PosterShareService.instance = new PosterShareService();
    }
    return PosterShareService.instance;
  }

  /**
   * 生成新闻分享海报
   */
  async generateNewsPoster(newsData: NewsData): Promise<string> {
    const config = this.defaultConfig;
    
    // 设置画布尺寸
    this.canvas.width = config.width;
    this.canvas.height = config.height;

    // 清空画布
    this.ctx.fillStyle = config.backgroundColor;
    this.ctx.fillRect(0, 0, config.width, config.height);

    try {
      // 1. 绘制背景渐变
      await this.drawBackground();

      // 2. 绘制品牌标识
      await this.drawBrandHeader();

      // 3. 绘制新闻图片
      if (newsData.imageUrl) {
        await this.drawNewsImage(newsData.imageUrl);
      }

      // 4. 绘制标题
      await this.drawTitle(newsData.title);

      // 5. 绘制摘要
      await this.drawSummary(newsData.summary);

      // 6. 绘制元信息
      await this.drawMetaInfo(newsData);

      // 7. 生成并绘制二维码
      await this.drawQRCode(newsData.id);

      // 8. 绘制底部信息
      await this.drawFooter();

      // 返回base64图片
      return this.canvas.toDataURL('image/png', 0.9);

    } catch (error) {
      console.error('生成海报失败:', error);
      throw new Error('海报生成失败');
    }
  }

  /**
   * 绘制背景渐变
   */
  private async drawBackground(): Promise<void> {
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, '#f8f9fa');
    gradient.addColorStop(1, '#ffffff');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制品牌标识
   */
  private async drawBrandHeader(): Promise<void> {
    const headerHeight = 120;
    
    // 绘制品牌背景
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, headerHeight);

    // 绘制品牌文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AI推', this.canvas.width / 2, 70);

    // 绘制副标题
    this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.fillText('实时AI新闻推送', this.canvas.width / 2, 100);
  }

  /**
   * 绘制新闻图片
   */
  private async drawNewsImage(imageUrl: string): Promise<void> {
    try {
      const img = await this.loadImage(imageUrl);
      const imageY = 140;
      const imageHeight = 300;
      const imageWidth = this.canvas.width - 60;
      const imageX = 30;

      // 绘制图片背景
      this.ctx.fillStyle = '#f0f0f0';
      this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

      // 计算图片缩放比例
      const scale = Math.min(imageWidth / img.width, imageHeight / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const offsetX = (imageWidth - scaledWidth) / 2;
      const offsetY = (imageHeight - scaledHeight) / 2;

      // 绘制图片
      this.ctx.drawImage(
        img,
        imageX + offsetX,
        imageY + offsetY,
        scaledWidth,
        scaledHeight
      );

      // 绘制图片边框
      this.ctx.strokeStyle = '#e0e0e0';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);

    } catch (error) {
      console.warn('加载新闻图片失败，使用默认占位符');
      await this.drawImagePlaceholder();
    }
  }

  /**
   * 绘制图片占位符
   */
  private async drawImagePlaceholder(): Promise<void> {
    const imageY = 140;
    const imageHeight = 300;
    const imageWidth = this.canvas.width - 60;
    const imageX = 30;

    // 绘制占位符背景
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

    // 绘制占位符图标
    this.ctx.fillStyle = '#dee2e6';
    this.ctx.font = '72px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('📰', this.canvas.width / 2, imageY + imageHeight / 2 + 20);

    // 绘制边框
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(imageX, imageY, imageWidth, imageHeight);
  }

  /**
   * 绘制标题
   */
  private async drawTitle(title: string): Promise<void> {
    const startY = 480;
    const maxWidth = this.canvas.width - 60;
    const lineHeight = 50;

    this.ctx.fillStyle = this.defaultConfig.brandColor;
    this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'left';

    // 自动换行
    const lines = this.wrapText(title, maxWidth, 36);
    lines.forEach((line, index) => {
      this.ctx.fillText(line, 30, startY + index * lineHeight);
    });
  }

  /**
   * 绘制摘要
   */
  private async drawSummary(summary: string): Promise<void> {
    const startY = 620;
    const maxWidth = this.canvas.width - 60;
    const lineHeight = 40;

    this.ctx.fillStyle = this.defaultConfig.textColor;
    this.ctx.font = '28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'left';

    // 限制摘要长度并自动换行
    const truncatedSummary = summary.length > 120 ? summary.substring(0, 120) + '...' : summary;
    const lines = this.wrapText(truncatedSummary, maxWidth, 28);
    
    lines.slice(0, 4).forEach((line, index) => { // 最多4行
      this.ctx.fillText(line, 30, startY + index * lineHeight);
    });
  }

  /**
   * 绘制元信息
   */
  private async drawMetaInfo(newsData: NewsData): Promise<void> {
    const startY = 800;
    
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'left';

    const publishDate = new Date(newsData.publishedAt).toLocaleDateString('zh-CN');
    const metaText = `${newsData.source} | ${newsData.category} | ${publishDate}`;
    
    this.ctx.fillText(metaText, 30, startY);
  }

  /**
   * 生成并绘制二维码
   */
  private async drawQRCode(newsId: string): Promise<void> {
    const qrSize = 200;
    const qrX = this.canvas.width - qrSize - 30;
    const qrY = 850;

    // 生成新闻链接
    const newsUrl = `https://news.aipush.fun/#/news/${newsId}`;
    
    try {
      // 使用在线二维码生成服务
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(newsUrl)}&format=png&margin=10`;
      const qrImg = await this.loadImage(qrCodeUrl);
      
      // 绘制二维码背景
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);
      
      // 绘制二维码
      this.ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      
      // 绘制二维码边框
      this.ctx.strokeStyle = '#e0e0e0';
      this.ctx.lineWidth = 2;
      this.ctx.strokeRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20);

    } catch (error) {
      console.warn('生成二维码失败，使用文字替代');
      await this.drawQRCodePlaceholder(qrX, qrY, qrSize, newsUrl);
    }

    // 绘制二维码说明
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('扫码阅读完整新闻', qrX + qrSize / 2, qrY + qrSize + 30);
  }

  /**
   * 绘制二维码占位符
   */
  private async drawQRCodePlaceholder(x: number, y: number, size: number, url: string): Promise<void> {
    // 绘制占位符背景
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(x, y, size, size);

    // 绘制占位符文字
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('二维码', x + size / 2, y + size / 2 - 10);
    this.ctx.fillText('生成中...', x + size / 2, y + size / 2 + 10);

    // 绘制边框
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, size, size);
  }

  /**
   * 绘制底部信息
   */
  private async drawFooter(): Promise<void> {
    const footerY = this.canvas.height - 80;
    
    // 绘制分割线
    this.ctx.strokeStyle = '#e0e0e0';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(30, footerY - 30);
    this.ctx.lineTo(this.canvas.width - 30, footerY - 30);
    this.ctx.stroke();

    // 绘制底部文字
    this.ctx.fillStyle = '#999999';
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AI推 - 专业的AI新闻资讯平台', this.canvas.width / 2, footerY);
    this.ctx.fillText('news.aipush.fun', this.canvas.width / 2, footerY + 25);
  }

  /**
   * 文字自动换行
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const words = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of words) {
      const testLine = currentLine + char;
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * 加载图片
   */
  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  /**
   * 下载海报
   */
  downloadPoster(dataUrl: string, filename: string = 'news-poster.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * 分享海报到微信
   */
  async shareToWeChat(dataUrl: string): Promise<void> {
    try {
      // 将base64转换为blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // 检查是否支持原生分享
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([blob], 'poster.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'news-poster.png', { type: 'image/png' });
        await navigator.share({
          title: '来自AI推的新闻分享',
          files: [file]
        });
      } else {
        // 降级方案：提示用户保存图片
        this.showShareTip(dataUrl);
      }
    } catch (error) {
      console.error('分享失败:', error);
      this.showShareTip(dataUrl);
    }
  }

  /**
   * 显示分享提示
   */
  private showShareTip(dataUrl: string): void {
    // 创建模态框显示海报和分享提示
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: white;
      padding: 20px;
      border-radius: 10px;
      max-width: 90%;
      max-height: 90%;
      text-align: center;
      overflow: auto;
    `;

    const img = document.createElement('img');
    img.src = dataUrl;
    img.style.cssText = `
      max-width: 100%;
      height: auto;
      margin-bottom: 20px;
    `;

    const tip = document.createElement('p');
    tip.textContent = '长按图片保存，然后在微信中发送图片即可分享';
    tip.style.cssText = `
      margin: 10px 0;
      color: #666;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '关闭';
    closeBtn.style.cssText = `
      padding: 10px 20px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    `;

    closeBtn.onclick = () => document.body.removeChild(modal);

    content.appendChild(img);
    content.appendChild(tip);
    content.appendChild(closeBtn);
    modal.appendChild(content);
    document.body.appendChild(modal);
  }
}

// 导出单例实例
export const posterShareService = PosterShareService.getInstance();
