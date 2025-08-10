/**
 * 基于模板的分享图生成服务
 * 使用蓝色渐变背景模板，包含标题内容区和底部二维码/品牌区
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
  
  // 模板配置
  private readonly config = {
    width: 800,
    height: 1200,
    
    // 内容区域配置
    contentArea: {
      x: 75,
      y: 240,
      width: 650,
      height: 450,
      borderRadius: 30,
      backgroundColor: '#ffffff',
      padding: 40
    },
    
    // 底部区域配置
    bottomArea: {
      y: 1030,
      qrCode: {
        x: 103,
        y: 1033,
        width: 170,
        height: 170,
        backgroundColor: '#666666',
        borderRadius: 8
      },
      mascot: {
        x: 530,
        y: 1060
      },
      brand: {
        x: 640,
        y: 1120,
        text: 'AI推',
        subtitle: '国内外AI新闻推送'
      }
    },
    
    // 文字配置
    fonts: {
      title: {
        size: 50,
        color: '#ffffff',
        family: '"Microsoft YaHei", "PingFang SC", sans-serif',
        lineHeight: 70
      },
      content: {
        size: 28,
        color: '#333333',
        family: '"Microsoft YaHei", "PingFang SC", sans-serif',
        lineHeight: 42
      },
      qrText: {
        size: 18,
        color: '#666666',
        family: '"Microsoft YaHei", sans-serif'
      },
      brand: {
        size: 28,
        color: '#333333',
        family: '"Microsoft YaHei", sans-serif',
        weight: 'bold'
      },
      brandSubtitle: {
        size: 18,
        color: '#666666',
        family: '"Microsoft YaHei", sans-serif'
      }
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
   * 生成基于模板的分享图
   */
  async generateShareImage(newsData: TemplateNewsData): Promise<string> {
    // 设置画布尺寸
    this.canvas.width = this.config.width;
    this.canvas.height = this.config.height;
    
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    
    try {
      // 1. 绘制背景（蓝色渐变）
      await this.drawBackground();
      
      // 2. 绘制标题区域
      this.drawTitleArea(newsData.title);
      
      // 3. 绘制内容卡片
      this.drawContentCard(newsData.content);
      
      // 4. 绘制底部二维码区域
      await this.drawBottomArea(newsData.id);
      
      // 5. 绘制吉祥物和品牌信息
      this.drawBrandArea();
      
      return this.canvas.toDataURL('image/jpeg', 0.9);
      
    } catch (error) {
      console.error('分享图生成失败:', error);
      throw new Error('分享图生成失败，请稍后重试');
    }
  }

  /**
   * 绘制蓝色渐变背景
   */
  private async drawBackground(): Promise<void> {
    // 创建径向渐变
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.config.height);
    gradient.addColorStop(0, '#4A90E2');
    gradient.addColorStop(0.5, '#357ABD');
    gradient.addColorStop(1, '#7FB3D3');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.config.width, this.config.height);
    
    // 添加装饰性曲线
    this.drawDecorativeCurves();
  }

  /**
   * 绘制装饰性曲线
   */
  private drawDecorativeCurves(): void {
    this.ctx.save();
    
    // 底部波浪曲线
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 800);
    this.ctx.quadraticCurveTo(400, 900, 800, 850);
    this.ctx.lineTo(800, 1200);
    this.ctx.lineTo(0, 1200);
    this.ctx.closePath();
    this.ctx.fill();
    
    // 右侧装饰曲线
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    this.ctx.beginPath();
    this.ctx.moveTo(600, 0);
    this.ctx.quadraticCurveTo(750, 300, 650, 600);
    this.ctx.lineTo(800, 600);
    this.ctx.lineTo(800, 0);
    this.ctx.closePath();
    this.ctx.fill();
    
    this.ctx.restore();
  }

  /**
   * 绘制标题区域
   */
  private drawTitleArea(title: string): void {
    const { fonts } = this.config;
    
    // 处理标题长度，如果太长则截取
    let displayTitle = title;
    if (title.length > 12) {
      displayTitle = title.substring(0, 12);
    }
    
    this.ctx.fillStyle = fonts.title.color;
    this.ctx.font = `bold ${fonts.title.size}px ${fonts.title.family}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    // 居中绘制标题
    this.ctx.fillText(displayTitle, this.config.width / 2, 140);
  }

  /**
   * 绘制内容卡片
   */
  private drawContentCard(content: string): void {
    const { contentArea, fonts } = this.config;
    
    // 绘制白色圆角背景
    this.drawRoundedRect(
      contentArea.x,
      contentArea.y,
      contentArea.width,
      contentArea.height,
      contentArea.borderRadius,
      contentArea.backgroundColor
    );
    
    // 处理内容文字
    const maxContentLength = 120; // 最大字符数
    let displayContent = content;
    if (content.length > maxContentLength) {
      displayContent = content.substring(0, maxContentLength) + '...';
    }
    
    // 绘制内容文字
    this.ctx.fillStyle = fonts.content.color;
    this.ctx.font = `${fonts.content.size}px ${fonts.content.family}`;
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    // 文字换行处理
    const lines = this.wrapText(
      displayContent,
      contentArea.width - contentArea.padding * 2,
      fonts.content.size
    );
    
    const startY = contentArea.y + contentArea.padding;
    lines.slice(0, 10).forEach((line, index) => {
      this.ctx.fillText(
        line,
        contentArea.x + contentArea.padding,
        startY + index * fonts.content.lineHeight
      );
    });
  }

  /**
   * 绘制底部区域（二维码）
   */
  private async drawBottomArea(newsId: string): Promise<void> {
    const { bottomArea } = this.config;
    
    // 绘制二维码背景
    this.drawRoundedRect(
      bottomArea.qrCode.x,
      bottomArea.qrCode.y,
      bottomArea.qrCode.width,
      bottomArea.qrCode.height,
      bottomArea.qrCode.borderRadius,
      bottomArea.qrCode.backgroundColor
    );
    
    // 生成并绘制二维码
    try {
      await this.drawQRCode(newsId);
    } catch (error) {
      // 如果二维码生成失败，绘制文字占位符
      this.drawQRPlaceholder();
    }
    
    // 绘制二维码说明文字
    this.ctx.fillStyle = this.config.fonts.qrText.color;
    this.ctx.font = `${this.config.fonts.qrText.size}px ${this.config.fonts.qrText.family}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      '长按识别二维码阅读新闻',
      bottomArea.qrCode.x + bottomArea.qrCode.width / 2,
      bottomArea.qrCode.y + bottomArea.qrCode.height + 25
    );
  }

  /**
   * 绘制二维码
   */
  private async drawQRCode(newsId: string): Promise<void> {
    const { bottomArea } = this.config;
    const qrSize = 120; // 二维码实际尺寸
    
    // 构建新闻URL
    let newsUrl: string;
    if (typeof window !== 'undefined' && window.location) {
      newsUrl = window.location.href;
    } else {
      newsUrl = `https://news.aipush.fun/#/news/${newsId}`;
    }
    
    // 二维码API列表
    const qrApis = [
      `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(newsUrl)}&format=png&margin=1&ecc=H`,
      `https://quickchart.io/qr?text=${encodeURIComponent(newsUrl)}&size=${qrSize}&format=png&ecLevel=H&margin=1`
    ];
    
    for (const apiUrl of qrApis) {
      try {
        const img = await this.loadImageWithTimeout(apiUrl, 5000);
        
        // 居中绘制二维码
        const qrX = bottomArea.qrCode.x + (bottomArea.qrCode.width - qrSize) / 2;
        const qrY = bottomArea.qrCode.y + (bottomArea.qrCode.height - qrSize) / 2;
        
        this.ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        return;
      } catch (error) {
        continue;
      }
    }
    
    throw new Error('所有二维码API都失败');
  }

  /**
   * 绘制二维码占位符
   */
  private drawQRPlaceholder(): void {
    const { bottomArea, fonts } = this.config;
    
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = `bold 24px ${fonts.qrText.family}`;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    
    this.ctx.fillText(
      '二维码',
      bottomArea.qrCode.x + bottomArea.qrCode.width / 2,
      bottomArea.qrCode.y + bottomArea.qrCode.height / 2
    );
  }

  /**
   * 绘制品牌区域
   */
  private drawBrandArea(): void {
    const { bottomArea, fonts } = this.config;
    
    // 绘制吉祥物占位符（橙色圆形）
    this.ctx.fillStyle = '#FF8C42';
    this.ctx.beginPath();
    this.ctx.arc(bottomArea.mascot.x, bottomArea.mascot.y, 25, 0, 2 * Math.PI);
    this.ctx.fill();
    
    // 绘制品牌名称
    this.ctx.fillStyle = fonts.brand.color;
    this.ctx.font = `bold ${fonts.brand.size}px ${fonts.brand.family}`;
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AI推', bottomArea.brand.x, bottomArea.brand.y);
    
    // 绘制品牌副标题
    this.ctx.fillStyle = fonts.brandSubtitle.color;
    this.ctx.font = `${fonts.brandSubtitle.size}px ${fonts.brandSubtitle.family}`;
    this.ctx.fillText('国内外AI新闻推送', bottomArea.brand.x, bottomArea.brand.y + 25);
  }

  /**
   * 绘制圆角矩形
   */
  private drawRoundedRect(
    x: number, 
    y: number, 
    width: number, 
    height: number, 
    radius: number, 
    fillStyle: string
  ): void {
    this.ctx.save();
    this.ctx.fillStyle = fillStyle;
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.restore();
  }

  /**
   * 文字换行处理
   */
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
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