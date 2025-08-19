// 分享功能增强 - 移除弹窗，直接生成分享图
(function() {
    'use strict';
    
    console.log('🎯 分享功能增强脚本开始初始化');
    
    // 立即劫持所有可能的分享相关函数
    function hijackAllShareFunctions() {
        // 保存原有的事件监听器函数，用于完全替换
        const originalAddEventListener = EventTarget.prototype.addEventListener;
        
        // 重写addEventListener，拦截所有分享相关的事件监听
        EventTarget.prototype.addEventListener = function(type, listener, options) {
            if (type === 'click' && typeof listener === 'function') {
                // 创建包装函数，检查是否是分享相关的点击
                const wrappedListener = function(event) {
                    const target = event.target;
                    const isShareClick = (
                        target.closest('[data-share]') ||
                        target.closest('.share-button') ||
                        target.closest('button[title*="分享"]') ||
                        target.closest('button[aria-label*="分享"]') ||
                        target.textContent?.includes('分享') ||
                        target.innerHTML?.includes('分享') ||
                        target.id?.includes('share') ||
                        (typeof target.className === 'string' && target.className.includes('share')) ||
                        (target.className && target.className.toString && target.className.toString().includes('share'))
                    );
                    
                    if (isShareClick) {
                        console.log('🚫 拦截到分享点击事件，阻止原有处理器');
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        
                        // 立即触发我们的分享逻辑
                        handleDirectShare(target);
                        return false;
                    }
                    
                    // 非分享相关的点击，正常处理
                    return listener.call(this, event);
                };
                
                return originalAddEventListener.call(this, type, wrappedListener, options);
            }
            
            return originalAddEventListener.call(this, type, listener, options);
        };
        
        // 立即禁用可能存在的分享函数
        const shareMethodsToBlock = [
            'showShareOptions',
            'showShareModal', 
            'openShareDialog',
            'displayShareMenu',
            'shareContent'
        ];
        
        shareMethodsToBlock.forEach(methodName => {
            if (window[methodName]) {
                console.log(`🚫 禁用原有分享函数: ${methodName}`);
                window[methodName] = () => {
                    console.log(`🚫 ${methodName} 已被拦截`);
                    return false;
                };
            }
        });
        
        console.log('✅ 所有分享函数已被劫持');
    }
    
    // 直接处理分享逻辑
    async function handleDirectShare(button) {
        console.log('🎯 开始直接分享处理');
        
        try {
            // 等待templateShareService加载
            await waitForTemplateService();
            
            // 提取新闻数据
            const newsData = extractNewsData();
            if (!newsData) {
                showErrorMessage('无法提取新闻数据');
                return;
            }
            
            // 显示生成状态
            showGeneratingStatus(button);
            
            // 生成分享图
            const shareImageUrl = await window.templateShareService.generateShareImage(newsData);
            
            // 直接显示分享图
            showShareImageDirect(shareImageUrl, newsData);
            
        } catch (error) {
            console.error('❌ 直接分享处理失败:', error);
            showErrorMessage('分享图生成失败，请重试');
        }
    }
    
    // 等待templateShareService服务
    function waitForTemplateService() {
        return new Promise((resolve) => {
            function check() {
                if (window.templateShareService) {
                    resolve();
                } else {
                    setTimeout(check, 50);
                }
            }
            check();
        });
    }
    
    // 提取当前页面的新闻数据
    function extractNewsData() {
        // 尝试从 URL 获取新闻ID
        const urlPath = window.location.hash || window.location.pathname;
        const newsIdMatch = urlPath.match(/news[\/:]([a-zA-Z0-9_-]+)/);
        const newsId = newsIdMatch ? newsIdMatch[1] : 'news_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 从页面提取标题
        let title = document.title;
        const h1 = document.querySelector('h1');
        const titleSelectors = [
            'h1',
            '.news-title', 
            '.article-title', 
            '[data-title]',
            'h2',
            '.title'
        ];
        
        for (const selector of titleSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent.trim() && element.textContent.trim().length > 5) {
                title = element.textContent.trim();
                break;
            }
        }
        
        // 清理标题
        title = title.replace(/\s*[\|\-]\s*AI推.*$/, '').trim();
        if (!title || title.length < 5) {
            title = 'AI新闻分享';
        }
        
        // 从页面提取实际内容
        let summary = '';
        const contentSelectors = [
            '.news-content p:not(:empty)',
            '.article-content p:not(:empty)',
            '[data-content] p:not(:empty)',
            'main p:not(:empty)',
            '.content p:not(:empty)',
            'article p:not(:empty)',
            'p:not(:empty)'
        ];
        
        // 查找最适合的内容段落
        for (const selector of contentSelectors) {
            const elements = document.querySelectorAll(selector);
            for (const element of elements) {
                const text = element.textContent.trim();
                // 跳过太短或明显是导航/元数据的内容
                if (text.length > 50 && 
                    !text.match(/^(\d{4}年\d{1,2}月\d{1,2}日|Published|Author|Source|Tags|标签|来源|作者|发布时间)/) &&
                    !text.includes('返回') &&
                    !text.includes('分享') &&
                    !text.includes('点击') &&
                    !text.includes('Copyright')) {
                    summary = text;
                    console.log('✅ 找到内容:', summary.substring(0, 100) + '...');
                    break;
                }
            }
            if (summary) break;
        }
        
        // 如果没有找到内容，使用标题对应的默认内容
        if (!summary || summary.length < 30) {
            if (title.includes('AI') || title.includes('人工智能')) {
                summary = '最新AI技术发展动态，人工智能领域的前沿资讯和深度分析。包括最新的模型发布、技术突破和行业趋势，为您带来最及时的AI新闻报道。';
            } else {
                summary = '最新科技资讯和深度分析，带您了解科技前沿动态和行业趋势。及时获取最新的技术发展和市场情报，为您的决策提供有价值的参考。';
            }
        }
        
        console.log('✅ 提取到的新闻数据:', { title: title.substring(0, 50), summary: summary.substring(0, 100) });
        
        return {
            id: newsId,
            title: title,
            summary: summary.length > 140 ? summary.substring(0, 140) + '...' : summary,
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
        
        setTimeout(() => {
            button.style.opacity = '1';
            button.style.pointerEvents = 'auto';
            if (button.textContent === '生成中...') {
                button.textContent = originalText;
            }
        }, 3000);
    }
    
    // 直接显示分享图 - 增大显示尺寸
    function showShareImageDirect(imageUrl, newsData) {
        const existingImage = document.querySelector('.direct-share-image');
        if (existingImage) {
            existingImage.remove();
        }
        
        const shareContainer = document.createElement('div');
        shareContainer.className = 'direct-share-image';
        shareContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 10000;
            background: white;
            padding: 10px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            max-width: 98vw;
            max-height: 98vh;
            overflow: auto;
        `;
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = '分享图';
        img.style.cssText = `
            width: 90vw;
            max-width: 600px;
            height: auto;
            display: block;
            margin: 0 auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
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
            padding: 8px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
        `;
        
        closeBtn.onclick = () => {
            shareContainer.remove();
            overlay.remove();
        };
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
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
        
        console.log('✅ 分享图已直接生成并显示（增大尺寸）');
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
    
    // 立即启动劫持
    hijackAllShareFunctions();
    
    // 页面加载完成后再次确保劫持生效
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(hijackAllShareFunctions, 100);
        });
    } else {
        setTimeout(hijackAllShareFunctions, 100);
    }
    
})();

console.log('🔥 终极分享功能劫持脚本已加载 - 直接生成模板分享图');