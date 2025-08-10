/**
 * 头条风格海报生成服务 - 完全按照参考图样式
 * 布局：日期 + 标题 + 作者 + 二维码 + 品牌logo
 */

interface SimpleNewsData {
  id: string;
  title: string;
  summary: string;
  publishedAt?: string;
  source?: string;
}

export class SimplePosterService {
  private static instance: SimplePosterService;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  
  // 完全按照头条样式的配置
  private readonly templateConfig = {
    width: 750,
    height: 1334,
    backgroundColor: '#f5f5f5',
    textColor: '#333333',
    dateColor: '#666666',
    authorColor: '#666666',
    padding: 40,
    qrSize: 100
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
   * 生成头条风格海报
   */
  async generateSimplePoster(newsData: SimpleNewsData): Promise<string> {
    const config = this.templateConfig;
    
    // 设置高质量画布
    this.canvas.width = config.width;
    this.canvas.height = config.height;
    
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    try {
      // 1. 浅灰色背景
      this.drawBackground();
      
      // 2. 顶部日期 (08/06 格式)
      this.drawDate(newsData.publishedAt);
      
      // 3. 大标题
      this.drawTitle(newsData.title);
      
      // 4. 作者信息 (头像 + 名称)
      this.drawAuthor(newsData.source);
      
      // 5. 底部二维码区域
      await this.drawQRCodeArea(newsData.id);
      
      // 6. 右下角头条logo
      this.drawBrandLogo();
      
      return this.canvas.toDataURL('image/png', 1.0);
      
    } catch (error) {
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
   * 绘制顶部日期 (08/06 格式)
   */
  private drawDate(publishedAt?: string): void {
    const { padding, dateColor } = this.templateConfig;
    
    // 格式化日期为 MM/dd
    let dateStr = '08/06'; // 默认值
    if (publishedAt) {
      const date = new Date(publishedAt);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      dateStr = `${month}/${day}`;
    }
    
    this.ctx.fillStyle = dateColor;
    this.ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'left';
    
    // 绘制大号日期
    this.ctx.fillText(dateStr.split('/')[0], padding, padding + 80); // 月份
    
    // 绘制分割线
    this.ctx.fillStyle = '#333333';
    this.ctx.fillRect(padding, padding + 100, 80, 4);
    
    // 绘制日期
    this.ctx.fillStyle = dateColor;
    this.ctx.fillText(dateStr.split('/')[1], padding, padding + 160); // 日期
  }

  /**
   * 绘制标题 - 大字体粗体
   */
  private drawTitle(title: string): void {
    const { width, padding, textColor } = this.templateConfig;
    
    this.ctx.fillStyle = textColor;
    this.ctx.font = 'bold 48px "Microsoft YaHei", "PingFang SC", sans-serif';
    this.ctx.textAlign = 'left';
    
    // 标题换行处理
    const maxWidth = width - padding * 2;
    const lines = this.wrapText(title, maxWidth);
    
    const startY = 350; // 从标题区域开始
    lines.slice(0, 4).forEach((line, index) => {
      this.ctx.fillText(line, padding, startY + index * 65);
    });
  }

  /**
   * 绘制作者信息 (新闻媒体样式，无头像)
   */
  private drawAuthor(source?: string): void {
    const { padding, authorColor } = this.templateConfig;
    
    const authorY = 680;
    
    // 绘制作者名称 (无头像，适合新闻媒体)
    this.ctx.fillStyle = authorColor;
    this.ctx.font = '28px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'left';
    
    const authorName = source || 'AI推-专注AI科技新闻';
    this.ctx.fillText(authorName, padding, authorY);
  }

  /**
   * 绘制二维码区域 - 修复版本，使用当前页面URL
   */
  private async drawQRCodeArea(newsId: string): Promise<void> {
    const { width, padding, qrSize } = this.templateConfig;
    
    const qrY = 950;
    const qrX = padding;
    
    // 使用当前页面URL或构建正确的新闻URL
    let newsUrl: string;
    if (typeof window !== 'undefined' && window.location) {
      // 如果在浏览器环境中，使用当前页面URL
      newsUrl = window.location.href;
    } else {
      // 备用方案：构建URL
      newsUrl = `https://news.aipush.fun/#/news/${newsId}`;
    }
    
    // 使用最可靠的二维码API，增加错误纠正级别
    const qrApis = [
      `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(newsUrl)}&format=png&margin=1&ecc=H&color=000000&bgcolor=ffffff`,
      `https://quickchart.io/qr?text=${encodeURIComponent(newsUrl)}&size=${qrSize}&format=png&ecLevel=H&margin=1&dark=000000&light=ffffff`,
      `https://chart.googleapis.com/chart?chs=${qrSize}x${qrSize}&cht=qr&chl=${encodeURIComponent(newsUrl)}&choe=UTF-8&chld=H|1`
    ];
    
    let qrGenerated = false;
    
    for (const apiUrl of qrApis) {
      try {
        const img = await this.loadImageWithTimeout(apiUrl, 5000);
        
        // 绘制二维码
        this.ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        
        qrGenerated = true;
        break;
      } catch (error) {
        continue;
      }
    }
    
    // 如果所有API都失败，绘制高质量占位符
    if (!qrGenerated) {
      this.drawQRPlaceholder(qrX, qrY, qrSize);
    }
    
    // 绘制二维码说明文字
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '24px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'left';
    
    const textX = qrX + qrSize + 20;
    this.ctx.fillText('长按识别二维码', textX, qrY + 35);
    this.ctx.fillText('阅读文章', textX, qrY + 70);
  }

  /**
   * 绘制高质量二维码占位符
   */
  private drawQRPlaceholder(x: number, y: number, size: number): void {
    // 白色背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x, y, size, size);
    
    // 黑色边框
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, size, size);
    
    // 绘制简化的二维码图案
    this.ctx.fillStyle = '#000000';
    const cellSize = size / 21;
    
    // 左上角定位符
    this.drawFinderPattern(x + cellSize, y + cellSize, cellSize * 7);
    
    // 右上角定位符
    this.drawFinderPattern(x + cellSize * 13, y + cellSize, cellSize * 7);
    
    // 左下角定位符
    this.drawFinderPattern(x + cellSize, y + cellSize * 13, cellSize * 7);
    
    // 中间的一些装饰点
    for (let row = 9; row < 12; row++) {
      for (let col = 9; col < 12; col++) {
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
  }

  /**
   * 绘制二维码定位符
   */
  private drawFinderPattern(x: number, y: number, size: number): void {
    const cellSize = size / 7;
    
    // 外框
    this.ctx.fillRect(x, y, size, size);
    
    // 内部白色
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x + cellSize, y + cellSize, cellSize * 5, cellSize * 5);
    
    // 中心黑点
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(x + cellSize * 2, y + cellSize * 2, cellSize * 3, cellSize * 3);
  }

  /**
   * 绘制右下角品牌logo - AI推风格
   */
  private drawBrandLogo(): void {
    const { width, height } = this.templateConfig;
    
    // 红色背景矩形 (调整宽度以容纳更多文字)
    this.ctx.fillStyle = '#ff4757';
    this.ctx.fillRect(width - 160, height - 100, 140, 80);
    
    // 白色"AI推"文字
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AI推', width - 90, height - 70);
    
    // 网址文字
    this.ctx.font = '12px "Microsoft YaHei", sans-serif';
    this.ctx.fillText('news.aipush.fun', width - 90, height - 45);
  }

  /**
   * 文字换行处理
   */
  private wrapText(text: string, maxWidth: number): string[] {
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
   * 带超时的图片加载
   */
  private loadImageWithTimeout(src: string, timeout: number = 5000): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      const timer = setTimeout(() => {
        reject(new Error('图片加载超时'));
      }, timeout);
      
      img.onload = () => {
        clearTimeout(timer);
        resolve(img);
      };
      
      img.onerror = () => {
        clearTimeout(timer);
        reject(new Error('图片加载失败'));
      };
      
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
}

export const simplePosterService = SimplePosterService.getInstance();