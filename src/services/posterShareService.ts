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
    brandColor: '#007AFF', // 苹果蓝
    textColor: '#1D1D1F', // 苹果深灰
    accentColor: '#FF3B30'  // 苹果红
  };

  // 苹果风格配色方案
  private appleColors = {
    blue: '#007AFF',
    green: '#34C759',
    orange: '#FF9500',
    red: '#FF3B30',
    purple: '#AF52DE',
    pink: '#FF2D92',
    yellow: '#FFCC00',
    teal: '#5AC8FA',
    indigo: '#5856D6',
    gray: '#8E8E93',
    darkGray: '#1D1D1F',
    lightGray: '#F2F2F7'
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
      // 按照新的布局结构绘制
      // 1. 绘制背景
      await this.drawBackground();

      // 2. 绘制顶部品牌区域（15%高度）
      await this.drawBrandHeader();

      // 3. 绘制图片区域（45%高度）
      await this.drawNewsImage(newsData.imageUrl);

      // 4. 绘制内容区域（25%高度）
      await this.drawContentArea(newsData);

      // 5. 绘制底部区域（15%高度）
      await this.drawBottomArea(newsData.id);

      // 返回base64图片
      return this.canvas.toDataURL('image/png', 0.9);

    } catch (error) {
      console.error('生成海报失败:', error);
      throw new Error('海报生成失败');
    }
  }

  /**
   * 绘制背景
   */
  private async drawBackground(): Promise<void> {
    // 使用苹果风格的渐变背景
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    gradient.addColorStop(0, this.appleColors.lightGray);
    gradient.addColorStop(0.5, '#ffffff');
    gradient.addColorStop(1, this.appleColors.lightGray);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * 绘制顶部品牌区域（15%高度）
   */
  private async drawBrandHeader(): Promise<void> {
    const headerHeight = this.canvas.height * 0.15; // 15%高度

    // 绘制品牌背景 - 使用苹果风格渐变
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop(0, this.appleColors.blue);
    gradient.addColorStop(0.5, this.appleColors.purple);
    gradient.addColorStop(1, this.appleColors.pink);

    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, headerHeight);

    // 绘制圆角效果
    this.ctx.save();
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = '#000000';
    // 左上角
    this.ctx.beginPath();
    this.ctx.arc(0, 0, 20, 0, Math.PI / 2);
    this.ctx.fill();
    // 右上角
    this.ctx.beginPath();
    this.ctx.arc(this.canvas.width, 0, 20, Math.PI / 2, Math.PI);
    this.ctx.fill();
    this.ctx.restore();

    // LOGO占位符 - 圆形
    const logoSize = 60;
    const logoX = this.canvas.width / 2;
    const logoY = headerHeight / 2;

    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    this.ctx.beginPath();
    this.ctx.arc(logoX, logoY, logoSize / 2, 0, 2 * Math.PI);
    this.ctx.fill();

    // 绘制品牌文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AI推', logoX, logoY + 8);

    // 绘制副标题
    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.fillText('智能新闻推送', logoX, logoY + 45);
  }

  /**
   * 绘制图片区域（45%高度）
   */
  private async drawNewsImage(imageUrl?: string): Promise<void> {
    const headerHeight = this.canvas.height * 0.15;
    const imageY = headerHeight;
    const imageHeight = this.canvas.height * 0.45; // 45%高度
    const imageWidth = this.canvas.width;
    const imageX = 0;

    try {
      if (imageUrl) {
        const img = await this.loadImage(imageUrl);

        // 绘制图片背景
        this.ctx.fillStyle = this.appleColors.lightGray;
        this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

        // 计算图片缩放比例（填充整个区域）
        const scale = Math.max(imageWidth / img.width, imageHeight / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const offsetX = (imageWidth - scaledWidth) / 2;
        const offsetY = (imageHeight - scaledHeight) / 2;

        // 裁剪区域
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(imageX, imageY, imageWidth, imageHeight);
        this.ctx.clip();

        // 绘制图片
        this.ctx.drawImage(
          img,
          imageX + offsetX,
          imageY + offsetY,
          scaledWidth,
          scaledHeight
        );

        this.ctx.restore();

        // 添加渐变遮罩增强可读性
        const maskGradient = this.ctx.createLinearGradient(0, imageY + imageHeight - 100, 0, imageY + imageHeight);
        maskGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
        maskGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        this.ctx.fillStyle = maskGradient;
        this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

      } else {
        await this.drawImagePlaceholder();
      }
    } catch (error) {
      console.warn('加载新闻图片失败，使用默认占位符');
      await this.drawImagePlaceholder();
    }
  }

  /**
   * 绘制图片占位符
   */
  private async drawImagePlaceholder(): Promise<void> {
    const headerHeight = this.canvas.height * 0.15;
    const imageY = headerHeight;
    const imageHeight = this.canvas.height * 0.45;
    const imageWidth = this.canvas.width;
    const imageX = 0;

    // 绘制占位符背景 - 苹果风格渐变
    const gradient = this.ctx.createLinearGradient(0, imageY, 0, imageY + imageHeight);
    gradient.addColorStop(0, this.appleColors.teal);
    gradient.addColorStop(1, this.appleColors.blue);
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

    // 绘制占位符图标
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.font = '80px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('📰', this.canvas.width / 2, imageY + imageHeight / 2 + 20);

    // 绘制占位符文字
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.fillText('新闻图片', this.canvas.width / 2, imageY + imageHeight / 2 + 60);
  }

  /**
   * 绘制内容区域（25%高度）
   */
  private async drawContentArea(newsData: NewsData): Promise<void> {
    const headerHeight = this.canvas.height * 0.15;
    const imageHeight = this.canvas.height * 0.45;
    const contentY = headerHeight + imageHeight;
    const contentHeight = this.canvas.height * 0.25; // 25%高度
    const padding = 30;

    // 绘制内容背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, contentY, this.canvas.width, contentHeight);

    // 绘制标题
    const titleY = contentY + 40;
    this.ctx.fillStyle = this.appleColors.darkGray;
    this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'left';

    const maxWidth = this.canvas.width - padding * 2;
    const titleLines = this.wrapText(newsData.title, maxWidth, 28);
    const maxTitleLines = 3; // 最多3行标题

    titleLines.slice(0, maxTitleLines).forEach((line, index) => {
      this.ctx.fillText(line, padding, titleY + index * 35);
    });

    // 绘制摘要
    const summaryY = titleY + Math.min(titleLines.length, maxTitleLines) * 35 + 20;
    this.ctx.fillStyle = this.appleColors.gray;
    this.ctx.font = '18px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';

    // 限制摘要长度
    const truncatedSummary = newsData.summary.length > 100 ?
      newsData.summary.substring(0, 100) + '...' : newsData.summary;

    const summaryLines = this.wrapText(truncatedSummary, maxWidth, 18);
    const maxSummaryLines = 3; // 最多3行摘要

    summaryLines.slice(0, maxSummaryLines).forEach((line, index) => {
      this.ctx.fillText(line, padding, summaryY + index * 25);
    });

    // 绘制元信息
    const metaY = contentY + contentHeight - 30;
    this.ctx.fillStyle = this.appleColors.blue;
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';

    const publishDate = new Date(newsData.publishedAt).toLocaleDateString('zh-CN');
    const metaText = `${newsData.source} • ${newsData.category} • ${publishDate}`;
    this.ctx.fillText(metaText, padding, metaY);
  }

  /**
   * 绘制底部区域（15%高度）
   */
  private async drawBottomArea(newsId: string): Promise<void> {
    const bottomY = this.canvas.height * 0.85; // 从85%开始
    const bottomHeight = this.canvas.height * 0.15; // 15%高度
    const padding = 30;

    // 绘制底部背景
    this.ctx.fillStyle = this.appleColors.lightGray;
    this.ctx.fillRect(0, bottomY, this.canvas.width, bottomHeight);

    // 二维码区域
    const qrSize = 80; // 减小二维码尺寸
    const qrX = this.canvas.width - qrSize - padding;
    const qrY = bottomY + (bottomHeight - qrSize) / 2;

    // 绘制二维码占位符（不再异步加载）
    this.drawQRCodePlaceholder(qrX, qrY, qrSize);

    // 绘制提示文字
    this.ctx.fillStyle = this.appleColors.darkGray;
    this.ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('扫码阅读完整新闻', padding, bottomY + 35);

    this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.fillStyle = this.appleColors.blue;
    this.ctx.fillText('news.aipush.fun', padding, bottomY + 60);

    // 绘制装饰元素
    this.ctx.fillStyle = this.appleColors.orange;
    this.ctx.beginPath();
    this.ctx.arc(padding + 200, bottomY + 45, 3, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.fillStyle = this.appleColors.green;
    this.ctx.beginPath();
    this.ctx.arc(padding + 220, bottomY + 35, 2, 0, 2 * Math.PI);
    this.ctx.fill();

    this.ctx.fillStyle = this.appleColors.pink;
    this.ctx.beginPath();
    this.ctx.arc(padding + 240, bottomY + 55, 2.5, 0, 2 * Math.PI);
    this.ctx.fill();
  }

  /**
   * 绘制二维码占位符
   */
  private drawQRCodePlaceholder(x: number, y: number, size: number): void {
    // 绘制二维码背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x - 5, y - 5, size + 10, size + 10);

    // 绘制二维码图案
    this.ctx.fillStyle = this.appleColors.darkGray;

    // 绘制简化的二维码图案
    const cellSize = size / 10;
    const pattern = [
      [1,1,1,1,1,0,0,1,1,1],
      [1,0,0,0,1,0,1,0,0,1],
      [1,0,1,0,1,1,0,1,0,1],
      [1,0,0,0,1,0,1,0,0,1],
      [1,1,1,1,1,0,0,1,1,1],
      [0,0,0,0,0,1,1,0,0,0],
      [0,1,0,1,0,0,1,0,1,0],
      [1,0,1,0,1,1,0,1,0,1],
      [0,1,0,1,0,0,1,0,1,0],
      [1,1,1,0,1,0,0,1,1,1]
    ];

    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 10; col++) {
        if (pattern[row][col]) {
          this.ctx.fillRect(
            x + col * cellSize,
            y + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }

    // 绘制圆角边框
    this.ctx.strokeStyle = this.appleColors.gray;
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - 5, y - 5, size + 10, size + 10);
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
