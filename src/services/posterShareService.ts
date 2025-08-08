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
    brandColor: '#007AFF',
    textColor: '#1D1D1F', 
    accentColor: '#FF3B30'
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
   * 生成新闻分享海报 - 高质量版本
   */
  async generateNewsPoster(newsData: NewsData): Promise<string> {
    const config = this.defaultConfig;
    
    // 设置高DPI画布尺寸，提升图片质量
    const dpiScale = 2; // 2倍DPI
    const scaledWidth = config.width * dpiScale;
    const scaledHeight = config.height * dpiScale;
    
    // 设置画布尺寸
    this.canvas.width = scaledWidth;
    this.canvas.height = scaledHeight;
    
    // 设置画布样式尺寸
    this.canvas.style.width = `${config.width}px`;
    this.canvas.style.height = `${config.height}px`;
    
    // 缩放上下文以匹配DPI
    this.ctx.scale(dpiScale, dpiScale);
    
    // 启用高质量渲染
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';
    this.ctx.textRenderingOptimization = 'optimizeQuality';
    
    // 清空画布并设置高质量背景
    this.ctx.fillStyle = config.backgroundColor;
    this.ctx.fillRect(0, 0, config.width, config.height);

    try {
      console.log('🎨 开始生成高质量海报，DPI缩放:', dpiScale);
      
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

      // 返回高质量base64图片
      const quality = 0.95; // 95%质量
      const imageData = this.canvas.toDataURL('image/png');
      
      console.log('✅ 高质量海报生成完成');
      return imageData;

    } catch (error) {
      console.error('海报生成失败:', error);
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

    // 尝试多个图片源
    const imageSources = [];
    if (imageUrl) {
      imageSources.push(imageUrl);
      // 如果是相对路径，尝试添加域名
      if (!imageUrl.startsWith('http')) {
        imageSources.push(`https://news.aipush.fun${imageUrl}`);
      }
    }

    // 添加备用图片
    imageSources.push('/wechat-share-300.png');
    imageSources.push('https://news.aipush.fun/wechat-share-300.png');

    let imageLoaded = false;

    for (const src of imageSources) {
      try {
        console.log('尝试加载图片:', src);
        const img = await this.loadImage(src);

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

        imageLoaded = true;
        console.log('图片加载成功:', src);
        break;
      } catch (error) {
        console.warn('图片加载失败:', src, error);
        continue;
      }
    }

    // 如果所有图片都加载失败，使用占位符
    if (!imageLoaded) {
      console.warn('所有图片源都加载失败，使用占位符');
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

    // 绘制占位符背景 - 更现代的渐变
    const gradient = this.ctx.createLinearGradient(0, imageY, imageWidth, imageY + imageHeight);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(0.5, '#764ba2');
    gradient.addColorStop(1, '#f093fb');
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);

    // 绘制几何装饰元素
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

    // 大圆
    this.ctx.beginPath();
    this.ctx.arc(imageWidth * 0.8, imageY + imageHeight * 0.3, 80, 0, 2 * Math.PI);
    this.ctx.fill();

    // 小圆
    this.ctx.beginPath();
    this.ctx.arc(imageWidth * 0.2, imageY + imageHeight * 0.7, 40, 0, 2 * Math.PI);
    this.ctx.fill();

    // 绘制AI推LOGO
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('AI推', this.canvas.width / 2, imageY + imageHeight / 2 - 10);

    // 绘制副标题
    this.ctx.font = '20px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    this.ctx.fillText('智能新闻推送', this.canvas.width / 2, imageY + imageHeight / 2 + 30);

    // 添加渐变遮罩
    const maskGradient = this.ctx.createLinearGradient(0, imageY + imageHeight - 100, 0, imageY + imageHeight);
    maskGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    maskGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    this.ctx.fillStyle = maskGradient;
    this.ctx.fillRect(imageX, imageY, imageWidth, imageHeight);
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

    // 绘制标题 - 增大字体
    const titleY = contentY + 50;
    this.ctx.fillStyle = this.appleColors.darkGray;
    this.ctx.font = 'bold 42px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'left';

    const maxWidth = this.canvas.width - padding * 2;
    const titleLines = this.wrapText(newsData.title, maxWidth, 42);
    const maxTitleLines = 2; // 最多2行标题，字体更大

    titleLines.slice(0, maxTitleLines).forEach((line, index) => {
      this.ctx.fillText(line, padding, titleY + index * 52);
    });

    // 绘制摘要 - 增大字体
    const summaryY = titleY + Math.min(titleLines.length, maxTitleLines) * 52 + 30;
    this.ctx.fillStyle = this.appleColors.gray;
    this.ctx.font = '28px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';

    // 限制摘要长度
    const truncatedSummary = newsData.summary.length > 100 ?
      newsData.summary.substring(0, 100) + '...' : newsData.summary;

    const summaryLines = this.wrapText(truncatedSummary, maxWidth, 28);
    const maxSummaryLines = 2; // 最多2行摘要，字体更大

    summaryLines.slice(0, maxSummaryLines).forEach((line, index) => {
      this.ctx.fillText(line, padding, summaryY + index * 38);
    });

    // 绘制元信息 - 增大字体
    const metaY = contentY + contentHeight - 40;
    this.ctx.fillStyle = this.appleColors.blue;
    this.ctx.font = '22px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';

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

    // 二维码区域 - 显著增大尺寸
    const qrSize = 140; // 进一步增大二维码尺寸
    const qrX = this.canvas.width - qrSize - padding;
    const qrY = bottomY + (bottomHeight - qrSize) / 2;

    // 生成真正的二维码
    await this.drawRealQRCode(qrX, qrY, qrSize, newsId);

    // 绘制提示文字 - 增大字体
    this.ctx.fillStyle = this.appleColors.darkGray;
    this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText('扫码阅读完整新闻', padding, bottomY + 50);

    this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.fillStyle = this.appleColors.blue;
    this.ctx.fillText('news.aipush.fun', padding, bottomY + 85);

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
   * 生成并绘制真正的二维码 - 高质量版本
   */
  private async drawRealQRCode(x: number, y: number, size: number, newsId: string): Promise<void> {
    try {
      // 构建新闻URL - 确保URL正确且可访问
      const baseUrl = 'https://news.aipush.fun';
      const newsUrl = `${baseUrl}/#/news/${newsId}`;
      
      console.log('生成二维码URL:', newsUrl);

      // 使用多个高质量二维码API源，优先选择最稳定的
      const qrApis = [
        // 彩虹二维码 - 新增的高质量API
        {
          url: `https://www.erweicaihong.cn/api?text=${encodeURIComponent(newsUrl)}&size=${size}&key=27e94730-7484-11f0-a569-f7f8300803ea`,
          name: '彩虹二维码'
        },
        // QR Server - 最稳定，支持高分辨率
        {
          url: `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(newsUrl)}&format=png&margin=1&ecc=H&color=000000&bgcolor=ffffff`,
          name: 'QRServer'
        },
        // Quick Chart - 备用选择，质量很好
        {
          url: `https://quickchart.io/qr?text=${encodeURIComponent(newsUrl)}&size=${size}&margin=1&format=png&ecLevel=H`,
          name: 'QuickChart'
        },
        // 联图 - 国内API，速度快
        {
          url: `https://qr.liantu.com/api.php?text=${encodeURIComponent(newsUrl)}&m=1&e=H&p=1&w=${size}&h=${size}`,
          name: '联图'
        },
        // Google Charts - 谷歌服务，质量最高
        {
          url: `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodeURIComponent(newsUrl)}&choe=UTF-8&chld=H|1`,
          name: 'Google Charts'
        }
      ];

      for (const api of qrApis) {
        try {
          console.log(`尝试${api.name}二维码API:`, api.url);
          
          const qrImage = new Image();
          qrImage.crossOrigin = 'anonymous';

          const success = await new Promise<boolean>((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('二维码加载超时'));
            }, 8000); // 增加到8秒超时

            qrImage.onload = () => {
              clearTimeout(timeout);
              
              // 验证图片尺寸
              if (qrImage.width < 50 || qrImage.height < 50) {
                reject(new Error('二维码图片尺寸异常'));
                return;
              }

              // 绘制高质量白色背景，增加更多边距
              this.ctx.fillStyle = '#ffffff';
              this.ctx.fillRect(x - 12, y - 12, size + 24, size + 24);

              // 绘制二维码图片，保持高清晰度
              this.ctx.imageSmoothingEnabled = false; // 关闭平滑处理保持像素清晰
              this.ctx.drawImage(qrImage, x, y, size, size);

              // 绘制精美边框，增强视觉效果
              this.ctx.strokeStyle = '#333333';
              this.ctx.lineWidth = 3;
              this.ctx.strokeRect(x - 6, y - 6, size + 12, size + 12);

              // 添加内边框
              this.ctx.strokeStyle = '#ffffff';
              this.ctx.lineWidth = 1;
              this.ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);

              console.log(`✅ ${api.name}二维码生成成功`);
              resolve(true);
            };

            qrImage.onerror = (error) => {
              clearTimeout(timeout);
              reject(new Error(`${api.name}图片加载失败: ${error}`));
            };

            qrImage.src = api.url;
          });

          if (success) {
            return; // 成功则返回
          }
        } catch (error) {
          console.warn(`${api.name}二维码API失败:`, error);
          continue; // 尝试下一个API
        }
      }

      // 所有API都失败，使用高质量占位符
      console.warn('所有二维码API都失败，使用高质量占位符');
      this.drawHighQualityQRCodePlaceholder(x, y, size, newsUrl);
    } catch (error) {
      console.warn('二维码生成失败，使用占位符:', error);
      this.drawHighQualityQRCodePlaceholder(x, y, size, `https://news.aipush.fun/#/news/${newsId}`);
    }
  }

  /**
   * 绘制高质量二维码占位符
   */
  private drawHighQualityQRCodePlaceholder(x: number, y: number, size: number, url: string): void {
    // 绘制二维码背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(x - 12, y - 12, size + 24, size + 24);

    // 绘制二维码图案 - 使用更高精度的网格
    this.ctx.fillStyle = '#000000';

    const cellSize = size / 29; // 29x29 网格更接近真实二维码
    const pattern = this.generateHighQualityQRPattern();

    // 关闭抗锯齿保持像素清晰
    this.ctx.imageSmoothingEnabled = false;

    for (let row = 0; row < 29; row++) {
      for (let col = 0; col < 29; col++) {
        if (pattern[row] && pattern[row][col]) {
          this.ctx.fillRect(
            Math.floor(x + col * cellSize),
            Math.floor(y + row * cellSize),
            Math.ceil(cellSize),
            Math.ceil(cellSize)
          );
        }
      }
    }

    // 绘制精美边框，与真实二维码保持一致
    this.ctx.strokeStyle = '#333333';
    this.ctx.lineWidth = 3;
    this.ctx.strokeRect(x - 6, y - 6, size + 12, size + 12);

    // 添加内边框
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(x - 1, y - 1, size + 2, size + 2);

    // 添加URL提示文字（更小字体）
    this.ctx.fillStyle = '#666666';
    this.ctx.font = '10px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('扫码访问新闻', x + size / 2, y + size + 28);
    
    // 显示完整URL（截断显示）
    const displayUrl = url.length > 30 ? url.substring(0, 27) + '...' : url;
    this.ctx.fillStyle = '#999999';
    this.ctx.font = '8px -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif';
    this.ctx.fillText(displayUrl, x + size / 2, y + size + 40);
  }

  /**
   * 生成高质量二维码图案
   */
  private generateHighQualityQRPattern(): number[][] {
    const size = 29;
    const pattern: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    // 绘制定位标记（左上、右上、左下）- Version 3 QR Code标准
    this.drawQRFinderPattern(pattern, 0, 0);
    this.drawQRFinderPattern(pattern, 0, 21);
    this.drawQRFinderPattern(pattern, 21, 0);

    // 绘制时序图案
    for (let i = 8; i < 21; i++) {
      pattern[6][i] = i % 2;
      pattern[i][6] = i % 2;
    }

    // 绘制对齐图案（Version 3特有）
    this.drawAlignmentPattern(pattern, 22, 22);

    // 绘制格式信息
    this.drawFormatInformation(pattern);

    // 绘制数据区域（更真实的图案）
    this.fillDataArea(pattern);

    return pattern;
  }

  /**
   * 绘制QR码定位标记
   */
  private drawQRFinderPattern(pattern: number[][], startRow: number, startCol: number): void {
    // 7x7 定位标记
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const r = startRow + row;
        const c = startCol + col;
        if (r < 29 && c < 29) {
          // 外框
          if (row === 0 || row === 6 || col === 0 || col === 6) {
            pattern[r][c] = 1;
          }
          // 内部留白
          else if (row === 1 || row === 5 || col === 1 || col === 5) {
            pattern[r][c] = 0;
          }
          // 内部中心点
          else {
            pattern[r][c] = 1;
          }
        }
      }
    }

    // 绘制分隔符（白色边界）
    for (let i = 0; i < 8; i++) {
      // 下边界
      if (startRow + 7 < 29) {
        if (startCol + i < 29) pattern[startRow + 7][startCol + i] = 0;
      }
      // 右边界
      if (startCol + 7 < 29) {
        if (startRow + i < 29) pattern[startRow + i][startCol + 7] = 0;
      }
    }
  }

  /**
   * 绘制对齐图案
   */
  private drawAlignmentPattern(pattern: number[][], centerRow: number, centerCol: number): void {
    for (let row = -2; row <= 2; row++) {
      for (let col = -2; col <= 2; col++) {
        const r = centerRow + row;
        const c = centerCol + col;
        if (r >= 0 && r < 29 && c >= 0 && c < 29) {
          if (Math.abs(row) === 2 || Math.abs(col) === 2 || (row === 0 && col === 0)) {
            pattern[r][c] = 1;
          } else {
            pattern[r][c] = 0;
          }
        }
      }
    }
  }

  /**
   * 绘制格式信息
   */
  private drawFormatInformation(pattern: number[][]): void {
    // 简化的格式信息图案
    const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 0];
    
    // 水平格式信息
    for (let i = 0; i < 6; i++) {
      pattern[8][i] = formatBits[i];
    }
    pattern[8][7] = formatBits[6];
    pattern[8][8] = formatBits[7];
    for (let i = 7; i < 15; i++) {
      pattern[8][29 - 15 + i] = formatBits[i];
    }

    // 垂直格式信息
    for (let i = 0; i < 8; i++) {
      pattern[29 - 1 - i][8] = formatBits[i];
    }
    for (let i = 8; i < 15; i++) {
      pattern[15 - i][8] = formatBits[i];
    }
  }

  /**
   * 填充数据区域
   */
  private fillDataArea(pattern: number[][]): void {
    // 使用更智能的数据填充算法
    for (let row = 0; row < 29; row++) {
      for (let col = 0; col < 29; col++) {
        if (pattern[row][col] === 0 && !this.isReservedPosition(row, col)) {
          // 使用伪随机但确定性的算法
          const hash = (row * 31 + col * 17 + (row + col) * 13) % 7;
          pattern[row][col] = hash < 3 ? 1 : 0;
        }
      }
    }
  }

  /**
   * 检查是否为保留位置
   */
  private isReservedPosition(row: number, col: number): boolean {
    // 定位标记区域
    if ((row < 9 && col < 9) || (row < 9 && col > 19) || (row > 19 && col < 9)) {
      return true;
    }
    
    // 时序线
    if (row === 6 || col === 6) {
      return true;
    }
    
    // 对齐图案区域
    if (Math.abs(row - 22) <= 2 && Math.abs(col - 22) <= 2) {
      return true;
    }
    
    // 格式信息区域
    if (row === 8 && (col < 9 || col > 19)) {
      return true;
    }
    if (col === 8 && (row < 9 || row > 19)) {
      return true;
    }
    
    return false;
  }

  /**
   * 生成增强版二维码图案
   */
  private generateEnhancedQRPattern(): number[][] {
    const size = 25;
    const pattern: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));

    // 绘制定位标记（左上、右上、左下）- 更大更清晰
    this.drawEnhancedFinderPattern(pattern, 0, 0);
    this.drawEnhancedFinderPattern(pattern, 0, 17);
    this.drawEnhancedFinderPattern(pattern, 17, 0);

    // 绘制时序图案
    for (let i = 8; i < 17; i++) {
      pattern[6][i] = i % 2;
      pattern[i][6] = i % 2;
    }

    // 绘制数据区域（更真实的图案）
    const dataPattern = this.generateDataPattern(size);
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (pattern[row][col] === 0 && !this.isEnhancedReservedArea(row, col)) {
          pattern[row][col] = dataPattern[row][col];
        }
      }
    }

    return pattern;
  }

  /**
   * 绘制增强版定位标记
   */
  private drawEnhancedFinderPattern(pattern: number[][], startRow: number, startCol: number): void {
    // 7x7 定位标记
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 7; col++) {
        const r = startRow + row;
        const c = startCol + col;
        if (r < 25 && c < 25) {
          // 外框
          if (row === 0 || row === 6 || col === 0 || col === 6) {
            pattern[r][c] = 1;
          }
          // 内部中心点
          else if (row >= 2 && row <= 4 && col >= 2 && col <= 4) {
            pattern[r][c] = 1;
          }
        }
      }
    }
  }

  /**
   * 生成更真实的数据图案
   */
  private generateDataPattern(size: number): number[][] {
    const pattern: number[][] = Array(size).fill(0).map(() => Array(size).fill(0));
    
    // 使用确定性但看起来随机的图案
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        // 使用数学函数生成看似随机但固定的图案
        const value = (row * 31 + col * 17 + row * col * 7) % 3;
        pattern[row][col] = value === 0 ? 1 : 0;
      }
    }
    
    return pattern;
  }

  /**
   * 检查是否为增强版保留区域
   */
  private isEnhancedReservedArea(row: number, col: number): boolean {
    // 定位标记区域
    if ((row < 9 && col < 9) || (row < 9 && col > 15) || (row > 15 && col < 9)) {
      return true;
    }
    // 时序线
    if (row === 6 || col === 6) {
      return true;
    }
    return false;
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
