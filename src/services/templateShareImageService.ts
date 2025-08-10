/**
 * 基于用户提供模板的分享图生成服务
 * 直接使用模板图片，只替换标题、内容和二维码
 */

interface TemplateNewsData {
  id: string;
  title: string;
  content: string;
  publishedAt?: string;
  source?: string;
}

export class TemplateShareImageService {
  private static instance: TemplateShareImageService;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private templateImage: HTMLImageElement | null = null;
  
  // 基于实际模板的坐标配置（需要根据实际模板调整）
  private readonly config = {
    width: 800,  // 模板实际宽度
    height: 1280, // 模板实际高度
    
    // 标题区域 (模板顶部白色文字区域)
    titleArea: {
      x: 80,
      y: 80,
      width: 640,
      maxLines: 1,
      fontSize: 42,
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      fontWeight: 'bold',
      color: '#ffffff',
      textAlign: 'center' as CanvasTextAlign
    },
    
    // 内容区域 (模板中间白色卡片区域)
    contentArea: {
      x: 100,  // 白色卡片内的左边距
      y: 300,  // 白色卡片顶部位置
      width: 600, // 可用文字宽度
      height: 350, // 可用文字高度
      maxLines: 8,
      fontSize: 26,
      fontFamily: '"Microsoft YaHei", "PingFang SC", sans-serif',
      fontWeight: 'normal',
      color: '#333333',
      lineHeight: 40,
      textAlign: 'left' as CanvasTextAlign
    },
    
    // 二维码区域 (模板左下角灰色区域)
    qrCodeArea: {
      x: 190,   // 二维码中心X (根据实际模板调整)
      y: 1120,  // 二维码中心Y (根据实际模板调整)
      size: 140 // 二维码尺寸
    }
  };

  private constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  public static getInstance(): TemplateShareImageService {
    if (!TemplateShareImageService.instance) {
      TemplateShareImageService.instance = new TemplateShareImageService();
    }
    return TemplateShareImageService.instance;
  }

  /**
   * 生成基于模板的分享图 - 直接使用用户模板
   */
  async generateShareImage(newsData: TemplateNewsData): Promise<string> {
    try {
      // 1. 加载并绘制模板背景
      await this.loadAndDrawTemplate();
      
      // 2. 在指定位置替换标题
      this.drawTitle(newsData.title);
      
      // 3. 在白色卡片区域替换内容
      this.drawContent(newsData.content);
      
      // 4. 替换二维码
      await this.drawQRCode(newsData.id);
      
      return this.canvas.toDataURL('image/jpeg', 0.9);
      
    } catch (error) {
      console.error('分享图生成失败:', error);
      throw new Error('分享图生成失败，请稍后重试');
    }
  }

  /**
   * 加载并绘制模板背景图
   */
  private async loadAndDrawTemplate(): Promise<void> {
    if (!this.templateImage) {
      this.templateImage = await this.loadImageWithTimeout('/share-template-blank.jpg', 10000);
    }
    
    // 设置画布尺寸为模板图片的实际尺寸
    this.canvas.width = this.templateImage.width;
    this.canvas.height = this.templateImage.height;
    
    // 更新配置以匹配实际尺寸
    this.config.width = this.templateImage.width;
    this.config.height = this.templateImage.height;
    
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    // 直接绘制模板图片作为背景
    this.ctx.drawImage(this.templateImage, 0, 0);
  }

  /**
   * 在模板顶部绘制标题
   */
  private drawTitle(title: string): void {
    const { titleArea } = this.config;
    
    // 设置标题样式
    this.ctx.fillStyle = titleArea.color;
    this.ctx.font = `${titleArea.fontWeight} ${titleArea.fontSize}px ${titleArea.fontFamily}`;
    this.ctx.textAlign = titleArea.textAlign;
    this.ctx.textBaseline = 'middle';
    
    // 标题长度限制，根据模板宽度调整
    let displayTitle = title;
    const maxTitleLength = Math.floor(this.config.width / 30); // 动态计算最大长度
    if (title.length > maxTitleLength) {
      displayTitle = title.substring(0, maxTitleLength - 3) + '...';
    }
    
    // 居中绘制标题
    const centerX = this.config.width / 2;
    this.ctx.fillText(displayTitle, centerX, titleArea.y);
  }

  /**
   * 在白色卡片区域绘制内容
   */
  private drawContent(content: string): void {
    const { contentArea } = this.config;
    
    // 设置内容样式
    this.ctx.fillStyle = contentArea.color;
    this.ctx.font = `${contentArea.fontWeight} ${contentArea.fontSize}px ${contentArea.fontFamily}`;
    this.ctx.textAlign = contentArea.textAlign;
    this.ctx.textBaseline = 'top';
    
    // 内容长度限制
    const maxContentLength = 180;
    let displayContent = content;
    if (content.length > maxContentLength) {
      displayContent = content.substring(0, maxContentLength) + '...';
    }
    
    // 文字换行处理
    const lines = this.wrapText(displayContent, contentArea.width);
    
    // 绘制文字行，限制最大行数
    const maxLines = Math.min(lines.length, contentArea.maxLines);
    for (let i = 0; i < maxLines; i++) {
      const y = contentArea.y + i * contentArea.lineHeight;
      this.ctx.fillText(lines[i], contentArea.x, y);
    }
  }

  /**
   * 在指定位置绘制二维码，替换模板中的占位符
   */
  private async drawQRCode(newsId: string): Promise<void> {
    const { qrCodeArea } = this.config;
    
    // 构建新闻URL
    let newsUrl: string;
    if (typeof window !== 'undefined' && window.location) {
      newsUrl = window.location.href;
    } else {
      newsUrl = `https://news.aipush.fun/#/news/${newsId}`;
    }
    
    // 二维码API列表
    const qrApis = [
      `https://api.qrserver.com/v1/create-qr-code/?size=${qrCodeArea.size}x${qrCodeArea.size}&data=${encodeURIComponent(newsUrl)}&format=png&margin=1&ecc=H&color=000000&bgcolor=ffffff`,
      `https://quickchart.io/qr?text=${encodeURIComponent(newsUrl)}&size=${qrCodeArea.size}&format=png&ecLevel=H&margin=1&dark=000000&light=ffffff`,
      `https://chart.googleapis.com/chart?chs=${qrCodeArea.size}x${qrCodeArea.size}&cht=qr&chl=${encodeURIComponent(newsUrl)}&choe=UTF-8&chld=H|1`
    ];
    
    let qrGenerated = false;
    
    for (const apiUrl of qrApis) {
      try {
        const qrImage = await this.loadImageWithTimeout(apiUrl, 5000);
        
        // 在模板指定位置绘制二维码，覆盖原有的占位区域
        const qrX = qrCodeArea.x - qrCodeArea.size / 2;
        const qrY = qrCodeArea.y - qrCodeArea.size / 2;
        
        // 绘制二维码
        this.ctx.drawImage(qrImage, qrX, qrY, qrCodeArea.size, qrCodeArea.size);
        
        qrGenerated = true;
        break;
      } catch (error) {
        continue;
      }
    }
    
    // 如果二维码生成失败，绘制简单占位符
    if (!qrGenerated) {
      this.drawQRCodePlaceholder();
    }
  }

  /**
   * 绘制二维码占位符
   */
  private drawQRCodePlaceholder(): void {
    const { qrCodeArea } = this.config;
    
    const qrX = qrCodeArea.x - qrCodeArea.size / 2;
    const qrY = qrCodeArea.y - qrCodeArea.size / 2;
    
    // 白色背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(qrX, qrY, qrCodeArea.size, qrCodeArea.size);
    
    // 黑色边框
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(qrX, qrY, qrCodeArea.size, qrCodeArea.size);
    
    // 文字提示
    this.ctx.fillStyle = '#666666';
    this.ctx.font = 'bold 20px "Microsoft YaHei"';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('二维码', qrCodeArea.x, qrCodeArea.y);
  }

  /**
   * 文字换行处理
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    
    for (let i = 0; i < text.length; i++) {
      const testLine = currentLine + text[i];
      const metrics = this.ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && currentLine !== '') {
        lines.push(currentLine);
        currentLine = text[i];
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
   * 下载分享图
   */
  downloadShareImage(dataUrl: string, filename: string = 'ai-news-share.jpg'): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

export const templateShareImageService = TemplateShareImageService.getInstance();