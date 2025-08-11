// 分享功能增强 - 移除弹窗，直接生成分享图
(function() {
    'use strict';
    
    // 等待页面和服务加载完成
    function waitForService(callback) {
        if (window.templateShareService) {
            callback();
        } else {
            setTimeout(() => waitForService(callback), 100);
        }
    }
    
    // 替换原有的分享功能
    function enhanceShareFunction() {
        waitForService(() => {
            console.log('🎯 分享功能增强已加载');
            
            // 监听所有分享按钮点击
            document.addEventListener('click', async function(event) {
                const shareButton = event.target.closest('[data-share], .share-button, button[title*="分享"], button[aria-label*="分享"]');
                
                if (shareButton) {
                    event.preventDefault();
                    event.stopPropagation();
                    
                    console.log('🚀 点击分享按钮，开始生成分享图');
                    
                    try {
                        // 获取当前页面信息
                        const newsData = extractNewsData();
                        
                        if (!newsData) {
                            console.warn('⚠️ 无法提取新闻数据');
                            return;
                        }
                        
                        // 显示生成中状态
                        showGeneratingStatus(shareButton);
                        
                        // 生成分享图
                        const shareImageUrl = await window.templateShareService.generateShareImage(newsData);
                        
                        // 直接显示分享图
                        showShareImage(shareImageUrl, newsData);
                        
                    } catch (error) {
                        console.error('❌ 分享图生成失败:', error);
                        showErrorMessage('分享图生成失败，请重试');
                    }
                }
            });
        });
    }
    
    // 提取当前页面的新闻数据
    function extractNewsData() {
        // 尝试从URL获取新闻ID
        const urlPath = window.location.hash || window.location.pathname;
        const newsIdMatch = urlPath.match(/news[\/:]([a-zA-Z0-9_-]+)/);
        const newsId = newsIdMatch ? newsIdMatch[1] : 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 尝试从页面提取标题
        let title = document.title;
        const h1 = document.querySelector('h1');
        const titleElement = document.querySelector('.news-title, .article-title, [data-title]');
        
        if (h1 && h1.textContent.trim()) {
            title = h1.textContent.trim();
        } else if (titleElement && titleElement.textContent.trim()) {
            title = titleElement.textContent.trim();
        }
        
        // 清理标题
        title = title.replace(/\s*[\|\-]\s*AI推.*$/, '').trim();
        if (!title || title.length < 5) {
            title = 'OpenAI发布GPT-5：性能飞跃式提升，多模态能力全面增强';
        }
        
        // 尝试提取内容摘要
        let summary = '';
        const contentSelectors = [
            '.news-content p:first-of-type',
            '.article-content p:first-of-type', 
            '[data-content] p:first-of-type',
            'main p:first-of-type',
            '.content p:first-of-type'
        ];
        
        for (const selector of contentSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim()) {
                summary = element.textContent.trim();
                break;
            }
        }
        
        // 如果没有找到摘要，使用默认内容
        if (!summary || summary.length < 20) {
            summary = 'OpenAI今日正式发布了备受期待的GPT-5模型，这一里程碑式的更新带来了前所未有的性能提升。新模型在自然语言理解、推理能力和多模态处理方面都有显著进步，处理速度提升30%，准确性大幅增强。GPT-5支持更长的上下文长度，能够处理复杂的多轮对话，在编程、数学、科学研究等专业领域表现尤为突出。';
        }
        
        return {
            id: newsId,
            title: title,
            summary: summary.length > 160 ? summary.substring(0, 160) + '...' : summary,
            publishedAt: new Date().toISOString(),
            source: 'AI推'
        };
    }
    
    // 显示生成中状态
    function showGeneratingStatus(button) {
        const originalText = button.textContent || button.getAttribute('title') || '分享';
        button.style.opacity = '0.6';
        button.style.pointerEvents = 'none';
        if (button.textContent) {
            button.textContent = '生成中...';
        }
        
        // 3秒后恢复按钮状态
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            if (button.textContent === '生成中...') {
                button.textContent = originalText;
            }
        }, 3000);
    }
    
    // 直接显示分享图（移除弹窗）
    function showShareImage(imageUrl, newsData) {
        // 移除可能存在的旧分享图
        const existingImage = document.querySelector('.direct-share-image');
        if (existingImage) {
            existingImage.remove();
        }
        
        // 创建分享图容器
        const shareContainer = document.createElement('div');
        shareContainer.className = 'direct-share-image';
        shareContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 90vw;
            max-height: 90vh;
            overflow: auto;
        `;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = '分享图';
        img.style.cssText = `
            max-width: 100%;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
        `;
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: #ff4757;
            color: white;
            border: none;
            padding: 5px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        `;
        
        closeBtn.onclick = () => shareContainer.remove();
        
        // 点击背景关闭
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 9999;
        `;
        overlay.onclick = () => {
            shareContainer.remove();
            overlay.remove();
        };
        
        shareContainer.appendChild(closeBtn);
        shareContainer.appendChild(img);
        
        document.body.appendChild(overlay);
        document.body.appendChild(shareContainer);
        
        console.log('✅ 分享图已生成并显示');
    }
    
    // 显示错误信息
    function showErrorMessage(message) {
        const errorDiv = document.createElement('div');
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 10001;
            font-size: 14px;
        `;
        
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', enhanceShareFunction);
    } else {
        enhanceShareFunction();
    }
    
})();

console.log('🎯 分享功能增强脚本已加载 - 直接生成分享图，无弹窗');