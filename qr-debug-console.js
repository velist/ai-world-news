// 🔧 Canvas二维码定位调试工具 - 可在浏览器Console直接运行
// 复制粘贴到浏览器开发者工具Console中执行

(function() {
    console.log('🚀 启动Canvas二维码定位调试工具');
    
    // 创建调试Canvas
    const debugCanvas = document.createElement('canvas');
    debugCanvas.width = 800;
    debugCanvas.height = 1200;
    debugCanvas.style.border = '2px solid #ff0000';
    debugCanvas.style.maxWidth = '400px';
    debugCanvas.id = 'qr-debug-canvas';
    
    const ctx = debugCanvas.getContext('2d');
    
    // 移除之前的调试Canvas
    const existingCanvas = document.getElementById('qr-debug-canvas');
    if (existingCanvas) {
        existingCanvas.remove();
    }
    
    // 添加到页面顶部
    document.body.insertBefore(debugCanvas, document.body.firstChild);
    
    // 创建调试信息面板
    const debugInfo = document.createElement('div');
    debugInfo.id = 'debug-info';
    debugInfo.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.9);
        color: #00ff00;
        padding: 15px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        white-space: pre-line;
    `;
    document.body.appendChild(debugInfo);
    
    function updateDebugInfo(info) {
        debugInfo.textContent = info;
        console.log('📊 调试信息:', info);
    }
    
    // 调试用的精确坐标配置
    const qrConfigs = [
        { name: '左下角标准位置', x: 60, y: 1060, size: 120, color: '#ff0000' },
        { name: '左下角紧贴边缘', x: 40, y: 1070, size: 120, color: '#00ff00' },
        { name: '左下角居中', x: 80, y: 1050, size: 120, color: '#0000ff' },
        { name: '稍微向右', x: 100, y: 1060, size: 120, color: '#ffff00' },
        { name: '原始位置参考', x: 100, y: 1032, size: 170, color: '#ff00ff' }
    ];
    
    async function loadTemplateAndDebug() {
        try {
            updateDebugInfo('正在加载模板图片...');
            
            // 加载模板图片
            const templateImg = new Image();
            templateImg.crossOrigin = 'anonymous';
            
            const templateLoaded = new Promise((resolve, reject) => {
                templateImg.onload = () => resolve(templateImg);
                templateImg.onerror = () => reject(new Error('模板加载失败'));
                
                // 尝试多个路径
                const paths = [
                    './新闻分享空白模板.jpg',
                    './新闻图分享示意-空白.jpg',
                    '../新闻分享空白模板.jpg'
                ];
                
                let pathIndex = 0;
                function tryNextPath() {
                    if (pathIndex < paths.length) {
                        templateImg.src = paths[pathIndex];
                        pathIndex++;
                    } else {
                        reject(new Error('所有模板路径都失败'));
                    }
                }
                
                templateImg.onerror = () => {
                    console.log(`路径失败: ${templateImg.src}`);
                    setTimeout(tryNextPath, 100);
                };
                
                tryNextPath();
            });
            
            const img = await templateLoaded;
            
            // 绘制模板背景
            ctx.drawImage(img, 0, 0, 800, 1200);
            updateDebugInfo(`✅ 模板加载成功: ${img.src}\n尺寸: ${img.width}x${img.height}`);
            
            // 绘制调试网格
            drawDebugGrid();
            
            // 测试不同的二维码位置
            testQRPositions();
            
        } catch (error) {
            console.error('调试失败:', error);
            updateDebugInfo(`❌ 调试失败: ${error.message}`);
            
            // 使用备用背景继续调试
            drawFallbackBackground();
            drawDebugGrid();
            testQRPositions();
        }
    }
    
    function drawFallbackBackground() {
        // 绘制蓝色渐变背景
        const gradient = ctx.createLinearGradient(0, 0, 0, 1200);
        gradient.addColorStop(0, '#4A90E2');
        gradient.addColorStop(0.5, '#357ABD');
        gradient.addColorStop(1, '#7FB3D3');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 800, 1200);
        
        // 绘制白色内容卡片
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(80, 240, 640, 480);
        
        updateDebugInfo('使用备用背景进行调试');
    }
    
    function drawDebugGrid() {
        // 绘制调试网格线
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        
        // 垂直线
        for (let x = 0; x <= 800; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, 1200);
            ctx.stroke();
        }
        
        // 水平线
        for (let y = 0; y <= 1200; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(800, y);
            ctx.stroke();
        }
        
        // 绘制关键区域标注
        ctx.font = '14px monospace';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.8)';
        ctx.fillText('标题区域 (0,0-800,240)', 10, 20);
        ctx.fillText('内容区域 (80,240-720,720)', 10, 260);
        ctx.fillText('底部区域 (0,950-800,1200)', 10, 970);
        
        // 标记品牌标识区域（右下角小猫）
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.lineWidth = 2;
        ctx.strokeRect(500, 1050, 250, 150);
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.fillText('品牌标识区域', 510, 1070);
        ctx.fillText('(需要避开)', 510, 1090);
    }
    
    function testQRPositions() {
        let debugText = '🎯 二维码位置测试结果:\n\n';
        
        qrConfigs.forEach((config, index) => {
            // 绘制测试矩形
            ctx.strokeStyle = config.color;
            ctx.lineWidth = 3;
            ctx.strokeRect(config.x, config.y, config.size, config.size);
            
            // 填充半透明背景
            ctx.fillStyle = config.color + '40';
            ctx.fillRect(config.x, config.y, config.size, config.size);
            
            // 绘制位置标签
            ctx.fillStyle = config.color;
            ctx.font = 'bold 12px monospace';
            ctx.fillText(`${index + 1}`, config.x - 15, config.y + 15);
            
            // 检查是否与品牌标识冲突
            const brandX = 500, brandY = 1050, brandW = 250, brandH = 150;
            const isConflict = !(config.x + config.size < brandX || 
                               config.x > brandX + brandW || 
                               config.y + config.size < brandY || 
                               config.y > brandY + brandH);
            
            debugText += `${index + 1}. ${config.name}\n`;
            debugText += `   坐标: (${config.x}, ${config.y})\n`;
            debugText += `   尺寸: ${config.size}x${config.size}\n`;
            debugText += `   冲突: ${isConflict ? '❌ 与品牌标识重叠' : '✅ 无冲突'}\n`;
            debugText += `   边界检查: ${config.y + config.size > 1200 ? '❌ 超出底边' : '✅ 在画布内'}\n\n`;
        });
        
        // 标注推荐位置
        const recommendedConfig = qrConfigs[0]; // 左下角标准位置
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 5;
        ctx.strokeRect(recommendedConfig.x - 2, recommendedConfig.y - 2, recommendedConfig.size + 4, recommendedConfig.size + 4);
        
        ctx.fillStyle = '#00ff00';
        ctx.font = 'bold 16px monospace';
        ctx.fillText('推荐', recommendedConfig.x + recommendedConfig.size + 10, recommendedConfig.y + 20);
        
        debugText += '🏆 推荐配置:\n';
        debugText += `坐标: (${recommendedConfig.x}, ${recommendedConfig.y})\n`;
        debugText += `尺寸: ${recommendedConfig.size}x${recommendedConfig.size}\n`;
        debugText += '特点: 完美避开品牌标识，协调美观';
        
        updateDebugInfo(debugText);
    }
    
    // 添加实时坐标显示
    debugCanvas.addEventListener('mousemove', (e) => {
        const rect = debugCanvas.getBoundingClientRect();
        const scaleX = debugCanvas.width / rect.width;
        const scaleY = debugCanvas.height / rect.height;
        
        const x = Math.round((e.clientX - rect.left) * scaleX);
        const y = Math.round((e.clientY - rect.top) * scaleY);
        
        // 更新鼠标位置显示
        const mouseInfo = document.getElementById('mouse-info') || document.createElement('div');
        mouseInfo.id = 'mouse-info';
        mouseInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            background: rgba(0,0,0,0.9);
            color: #00ff00;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            z-index: 9999;
        `;
        mouseInfo.textContent = `鼠标坐标: (${x}, ${y})`;
        
        if (!document.getElementById('mouse-info')) {
            document.body.appendChild(mouseInfo);
        }
    });
    
    // 开始调试
    console.log('🔧 开始加载模板并调试二维码位置...');
    loadTemplateAndDebug();
    
    // 返回调试工具对象
    window.qrDebugTool = {
        canvas: debugCanvas,
        ctx: ctx,
        configs: qrConfigs,
        reload: loadTemplateAndDebug,
        
        // 生成最终代码
        generateCode: function() {
            const recommended = qrConfigs[0];
            const code = `
// ✅ 修复后的二维码定位代码 (可直接替换到HTML文件中)
async overlayQRCode(newsId) {
    console.log('🔲 开始生成二维码 - 精确定位到左下角避开品牌标识');
    
    // 经过调试验证的最佳坐标
    const qrSize = ${recommended.size};      // 适中尺寸，与模板协调
    const qrX = ${recommended.x};          // 左边距${recommended.x}px，避开品牌标识
    const qrY = ${recommended.y};        // 从顶部${recommended.y}px，底部留出适当空间
    
    const newsUrl = \`https://news.aipush.fun/#/news/\${newsId}\`;
    console.log(\`🔗 二维码URL: \${newsUrl}\`);
    console.log(\`📍 二维码精确位置: (\${qrX}, \${qrY})，尺寸: \${qrSize}x\${qrSize}\`);
    
    const qrApis = [
        \`https://api.qrserver.com/v1/create-qr-code/?size=\${qrSize}x\${qrSize}&data=\${encodeURIComponent(newsUrl)}&format=png&margin=0&ecc=H&color=000000&bgcolor=ffffff\`,
        \`https://quickchart.io/qr?text=\${encodeURIComponent(newsUrl)}&size=\${qrSize}&format=png&ecLevel=H&margin=0&dark=000000&light=ffffff\`
    ];
    
    for (const apiUrl of qrApis) {
        try {
            console.log(\`🌐 尝试二维码API: \${apiUrl.split('?')[0]}\`);
            const qrImg = await this.loadImageWithTimeout(apiUrl, 6000);
            
            // 精确绘制到左下角位置
            this.ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
            console.log(\`✅ 二维码精确定位成功，完美避开品牌标识\`);
            return;
            
        } catch (error) {
            console.log(\`⚠️ 二维码API失败: \${error.message}\`);
            continue;
        }
    }
    
    // 失败时显示占位符
    console.log('⚠️ 所有二维码API都失败，显示占位符');
    this.ctx.fillStyle = '#cccccc';
    this.ctx.fillRect(qrX, qrY, qrSize, qrSize);
    this.ctx.fillStyle = '#666666';
    this.ctx.font = 'bold 16px "Microsoft YaHei"';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('二维码', qrX + qrSize/2, qrY + qrSize/2);
}`;
            
            console.log('📋 已生成修复代码:');
            console.log(code);
            
            // 复制到剪贴板
            if (navigator.clipboard) {
                navigator.clipboard.writeText(code).then(() => {
                    console.log('✅ 代码已复制到剪贴板');
                    alert('✅ 修复代码已复制到剪贴板！\n可以直接替换HTML文件中的overlayQRCode方法');
                });
            }
            
            return code;
        }
    };
    
    console.log('🎉 调试工具加载完成！');
    console.log('💡 使用方法:');
    console.log('   - 红色框区域需要避开（品牌标识）');
    console.log('   - 绿色粗边框是推荐位置');
    console.log('   - 鼠标移动可查看实时坐标');
    console.log('   - 执行 qrDebugTool.generateCode() 生成最终修复代码');
    
})();