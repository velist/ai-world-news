/**
 * 极简海报生成服务 - 固定模板，超高速生成
 * 只包含：标题 + 摘要 + 二维码 + 品牌信息
 */

interface SimpleNewsData {
  id: string;
  title: string;
  summary: string;
}

export class SimplePosterService {
  private static instance: SimplePosterService;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // 固定模板配置
  private readonly templateConfig = {
    width: 600,
    height: 800,
    backgroundColor: '#ffffff',
    borderColor: '#4285f4',
    borderWidth: 3,
    textColor: '#333333',
    brandColor: '#666666',
    padding: 40,
    qrSize: 120
  };

  private constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  public static getInstance(): SimplePosterService {
    if (!SimplePosterService.instance) {
      SimplePosterService.instance = new SimplePosterService();
    }
    return SimplePosterService.instance;
  }

  /**
   * 生成简洁海报 - 极速版本
   */
  async generateSimplePoster(newsData: SimpleNewsData): Promise<string> {
    const config = this.templateConfig;
    
    // 设置画布
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    
    // 高质量渲染设置
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    try {
      // 1. 绘制白色背景
      this.drawBackground();
      
      // 2. 绘制边框
      this.drawBorder();
      
      // 3. 绘制标题
      this.drawTitle(newsData.title);
      
      // 4. 绘制摘要
      this.drawSummary(newsData.summary);
      
      // 5. 绘制二维码
      await this.drawQRCode(newsData.id);
      
      // 6. 绘制品牌信息
      this.drawBrandInfo();
      
      return this.canvas.toDataURL('image/png', 1.0);
      
    } catch (error) {
      // 静默错误处理，不输出给用户
      throw new Error('海报生成失败');
    }
  }

  /**
   * 绘制背景
   */
  private drawBackground(): void {
    const { width, height, backgroundColor } = this.templateConfig;
    
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, width, height);
  }

  /**
   * 绘制边框
   */
  private drawBorder(): void {
    const { width, height, borderColor, borderWidth, padding } = this.templateConfig;
    
    this.ctx.strokeStyle = borderColor;
    this.ctx.lineWidth = borderWidth;
    this.ctx.strokeRect(
      padding / 2, 
      padding / 2, 
      width - padding, 
      height - padding
    );
  }

  /**
   * 绘制标题
   */
  private drawTitle(title: string): void {
    const { width, padding, textColor } = this.templateConfig;
    
    this.ctx.fillStyle = textColor;
    this.ctx.font = 'bold 36px "Microsoft YaHei", "PingFang SC", sans-serif';
    this.ctx.textAlign = 'center';
    
    // 标题换行处理
    const maxWidth = width - padding * 2;
    const lines = this.wrapText(title, maxWidth, 36);
    
    const startY = padding + 60;
    lines.slice(0, 2).forEach((line, index) => {
      this.ctx.fillText(line, width / 2, startY + index * 50);
    });
  }

  /**
   * 绘制摘要
   */
  private drawSummary(summary: string): void {
    const { width, padding, textColor } = this.templateConfig;
    
    // 限制摘要长度
    const truncatedSummary = summary.length > 150 ? 
      summary.substring(0, 147) + '...' : summary;
    
    this.ctx.fillStyle = textColor;
    this.ctx.font = '24px "Microsoft YaHei", "PingFang SC", sans-serif';
    this.ctx.textAlign = 'center';
    
    // 摘要换行处理
    const maxWidth = width - padding * 2;
    const lines = this.wrapText(truncatedSummary, maxWidth, 24);
    
    const startY = padding + 200;
    lines.slice(0, 6).forEach((line, index) => {
      this.ctx.fillText(line, width / 2, startY + index * 35);
    });
  }

  /**
   * 绘制二维码
   */
  private async drawQRCode(newsId: string): Promise<void> {
    const { width, qrSize } = this.templateConfig;
    
    const qrX = (width - qrSize) / 2;
    const qrY = 520;
    
    // 构建URL
    const newsUrl = `https://news.aipush.fun/#/news/${newsId}`;
    
    // 只使用最快最稳定的API
    const qrApiUrl = `https://www.erweicaihong.cn/api?text=${encodeURIComponent(newsUrl)}&size=${qrSize}&key=27e94730-7484-11f0-a569-f7f8300803ea`;
    
    try {
      const qrImage = await this.loadImage(qrApiUrl);
      
      // 绘制白色背景
      this.ctx.fillStyle = '#ffffff';
      this.ctx.fillRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10);
      
      // 绘制二维码
      this.ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
      
      // 绘制边框
      this.ctx.strokeStyle = '#cccccc';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2);
      
    } catch (error) {
      // 绘制简单占位符（不向用户输出错误）
      this.drawQRPlaceholder(qrX, qrY, qrSize);
    }
  }

  /**
   * 绘制简单二维码占位符
   */
  private drawQRPlaceholder(x: number, y: number, size: number): void {
    // 白色背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
    
    // 简单格子图案
    this.ctx.fillStyle = '#333333';
    const cellSize = size / 15;
    
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        if ((row + col) % 2 === 0) {
          this.ctx.fillRect(
            x + col * cellSize,
            y + row * cellSize,
            cellSize,
            cellSize
          );
        }
      }
    }
    
    // 边框
    this.ctx.strokeStyle = '#cccccc';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);
  }

  /**
   * 绘制品牌信息
   */
  private drawBrandInfo(): void {
    const { width, brandColor } = this.templateConfig;
    
    this.ctx.fillStyle = brandColor;
    this.ctx.font = '20px "Microsoft YaHei", "PingFang SC", sans-serif';
    this.ctx.textAlign = 'center';
    
    this.ctx.fillText('AI推-专注AI科技新闻', width / 2, 720);
  }

  /**
   * 文字换行处理
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const characters = text.split('');
    const lines: string[] = [];
    let currentLine = '';

    for (const char of characters) {
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
      img.onerror = () => reject(new Error('图片加载失败'));
      
      // 3秒超时
      setTimeout(() => reject(new Error('加载超时')), 3000);
      
      img.src = src;
    });
  }

  /**
   * 下载海报
   */
  downloadPoster(dataUrl: string, filename: string = 'simple-news-poster.png'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const simplePosterService = SimplePosterService.getInstance();