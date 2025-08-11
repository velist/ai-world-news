// 最终版本的模板分享服务 - 基于测试结果8.jpg的完美效果
class TemplateShareService {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 800;
        this.canvas.height = 1200;
    }

    async generateShareImage(newsData) {
        try {
            await this.loadTemplateBackground();
            this.overlayTitleText(newsData.title);
            this.overlayContentText(newsData.summary);
            await this.overlayQRCode(newsData.id);
            return this.canvas.toDataURL('image/jpeg', 0.92);
        } catch (error) {
            console.error('分享图生成失败:', error);
            throw error;
        }
    }

    async loadTemplateBackground() {
        const templatePaths = [
            '/新闻图分享示意-空白.jpg',  // 绝对路径
            '/share-template-blank.jpg',
            './新闻图分享示意-空白.jpg', // 相对路径备用
            './share-template-blank.jpg'
        ];
        
        for (const path of templatePaths) {
            try {
                console.log(`🔍 尝试加载模板: ${path}`);
                const templateImg = await this.loadImageWithTimeout(path, 10000); // 增加超时时间
                this.ctx.drawImage(templateImg, 0, 0, 800, 1200);
                console.log(`✅ 模板加载成功: ${path}`);
                return;
            } catch (error) {
                console.warn(`⚠️ 模板加载失败: ${path} - ${error.message}`);
                continue;
            }
        }
        
        console.error('❌ 所有模板加载失败，使用备用背景');
        // 所有模板加载失败，使用备用背景
        this.drawFallbackBackground();
    }

    drawFallbackBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 1200);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(1, '#7FB3D3');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 800, 1200);
        
        // 白色内容卡片
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(80, 240, 640, 480);
    }

    overlayTitleText(title) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        const titleY = 130;
        let fontSize = 42;
        if (title.length > 30) fontSize = 36;
        else if (title.length > 20) fontSize = 42;
        
        this.ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`;
        
        const maxWidth = 640;
        const titleWidth = this.ctx.measureText(title).width;
        
        if (titleWidth > maxWidth) {
            // 智能分行：优先在冒号处分行
            let splitIndex = title.indexOf('：');
            if (splitIndex === -1 || splitIndex > title.length * 0.7) {
                splitIndex = Math.floor(title.length / 2);
            } else {
                splitIndex += 1;
            }
            
            const line1 = title.substring(0, splitIndex).trim();
            const line2 = title.substring(splitIndex).trim();
            
            // 检查分行后的宽度，必要时减小字体
            const line1Width = this.ctx.measureText(line1).width;
            const line2Width = this.ctx.measureText(line2).width;
            
            if (line1Width > maxWidth || line2Width > maxWidth) {
                fontSize = Math.max(32, fontSize - 6);
                this.ctx.font = `bold ${fontSize}px "Microsoft YaHei", "PingFang SC", sans-serif`;
            }
            
            this.ctx.fillText(line1, 400, titleY - 25);
            this.ctx.fillText(line2, 400, titleY + 25);
        } else {
            this.ctx.fillText(title, 400, titleY);
        }
    }

    overlayContentText(content) {
        // 内容文字 - 显示在白色卡片内
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '30px "Microsoft YaHei", "PingFang SC", sans-serif'; // 稍微减小字体
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        // 根据模板调整内容位置 - 白色卡片内部
        const contentX = 120; // 靠左对齐
        const contentY = 300; // 稍微上移以匹配模板
        const maxWidth = 560; // 限制最大宽度
        const lineHeight = 42; // 稍微减小行高
        
        let displayContent = content.length > 150 ? content.substring(0, 150) + '...' : content; // 缩短内容
        const lines = this.wrapText(displayContent, maxWidth);
        
        // 最多显示7行，确保不超出白色卡片范围
        lines.slice(0, 7).forEach((line, index) => {
            this.ctx.fillText(line, contentX, contentY + (index * lineHeight));
        });
    }

    async overlayQRCode(newsId) {
        // 最终精确位置 - 基于测试结果8.jpg的完美效果
        const qrSize = 170;
        const qrX = 80;   // 最终调整后的X坐标
        const qrY = 984;  // 最终调整后的Y坐标
        const newsUrl = `https://news.aipush.fun/#/news/${newsId}`;
        
        const qrApis = [
            `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(newsUrl)}&format=png&margin=0&ecc=H&color=000000&bgcolor=ffffff`,
            `https://quickchart.io/qr?text=${encodeURIComponent(newsUrl)}&size=${qrSize}&format=png&ecLevel=H&margin=0&dark=000000&light=ffffff`,
            `https://chart.googleapis.com/chart?chs=${qrSize}x${qrSize}&cht=qr&chl=${encodeURIComponent(newsUrl)}&choe=UTF-8&chld=H|0`
        ];
        
        for (const apiUrl of qrApis) {
            try {
                const qrImg = await this.loadImageWithTimeout(apiUrl, 6000);
                this.ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
                return;
            } catch (error) {
                continue;
            }
        }
        
        // 所有API都失败，绘制占位符
        this.ctx.fillStyle = '#cccccc';
        this.ctx.fillRect(qrX, qrY, qrSize, qrSize);
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '18px "Microsoft YaHei"';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('二维码', qrX + qrSize/2, qrY + qrSize/2);
    }

    wrapText(text, maxWidth) {
        const lines = [];
        let currentLine = '';
        
        for (let i = 0; i < text.length; i++) {
            const testLine = currentLine + text[i];
            if (this.ctx.measureText(testLine).width > maxWidth && currentLine !== '') {
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

    loadImageWithTimeout(src, timeout) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const timer = setTimeout(() => reject(new Error('图片加载超时')), timeout);
            
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
}

// 导出服务实例
window.templateShareService = new TemplateShareService();
console.log('✅ 最终版模板分享服务已加载');