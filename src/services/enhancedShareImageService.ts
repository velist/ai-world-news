/**
 * 增强版分享图片服务 - 集成MCP多AI轮询
 * 结合原有Canvas生成和AI图片生成的混合方案
 */

import { aiImageManager } from './aiImageManager';
import { mcpAdapter } from './mcpAdapter';
import { posterShareService } from './posterShareService';

interface ShareImageOptions {
  useAI?: boolean;
  style?: 'modern' | 'classic' | 'minimal' | 'colorful';
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  fallbackToCanvas?: boolean;
  cacheEnabled?: boolean;
}

interface NewsData {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  publishedAt: string;
  source: string;
  category: string;
}

export class EnhancedShareImageService {
  private static instance: EnhancedShareImageService;
  private imageCache: Map<string, string> = new Map();
  private generationStats = {
    aiSuccess: 0,
    canvasSuccess: 0,
    totalRequests: 0,
    averageTime: 0
  };

  private constructor() {
    this.initializeService();
  }

  public static getInstance(): EnhancedShareImageService {
    if (!EnhancedShareImageService.instance) {
      EnhancedShareImageService.instance = new EnhancedShareImageService();
    }
    return EnhancedShareImageService.instance;
  }

  private initializeService(): void {
    console.log('🚀 增强版分享图片服务初始化完成');
  }

  /**
   * 生成分享图片 - 主入口
   */
  async generateShareImage(newsData: NewsData, options: ShareImageOptions = {}): Promise<string> {
    const startTime = Date.now();
    this.generationStats.totalRequests++;

    // 设置默认选项
    const config = {
      useAI: true,
      style: 'modern' as const,
      priority: 'normal' as const,
      fallbackToCanvas: true,
      cacheEnabled: true,
      ...options
    };

    try {
      console.log(`🎨 开始生成分享图片 - 新闻ID: ${newsData.id}, 使用AI: ${config.useAI}`);
      
      // 生成缓存键
      const cacheKey = this.generateCacheKey(newsData, config);
      
      // 检查缓存
      if (config.cacheEnabled && this.imageCache.has(cacheKey)) {
        console.log('⚡ 缓存命中，直接返回');
        return this.imageCache.get(cacheKey)!;
      }

      let result: string;

      if (config.useAI) {
        // AI生成路径
        result = await this.generateWithAI(newsData, config, cacheKey);
      } else {
        // Canvas生成路径
        result = await this.generateWithCanvas(newsData);
      }

      // 缓存结果
      if (config.cacheEnabled && result) {
        this.imageCache.set(cacheKey, result);
      }

      // 更新统计
      const generationTime = Date.now() - startTime;
      this.updateStats(config.useAI && result !== '', generationTime);

      console.log(`✅ 图片生成完成，用时: ${generationTime}ms`);
      return result;

    } catch (error) {
      console.error('❌ 图片生成失败:', error);
      
      // 错误处理：尝试Canvas生成作为最后的降级方案
      if (config.fallbackToCanvas) {
        try {
          console.log('🔄 启用Canvas降级方案');
          const fallbackResult = await this.generateWithCanvas(newsData);
          this.updateStats(false, Date.now() - startTime);
          return fallbackResult;
        } catch (fallbackError) {
          console.error('❌ Canvas降级方案也失败:', fallbackError);
        }
      }

      throw error;
    }
  }

  /**
   * AI生成路径
   */
  private async generateWithAI(newsData: NewsData, config: ShareImageOptions, cacheKey: string): Promise<string> {
    try {
      const request = {
        newsData,
        style: config.style!,
        priority: config.priority!,
        cacheKey
      };

      const response = await aiImageManager.generateShareImage(request);
      
      if (response.success) {
        console.log(`🎯 AI生成成功 - 服务: ${response.serviceId}, 质量分: ${response.quality}`);
        this.generationStats.aiSuccess++;
        return response.base64Data || response.imageUrl;
      } else {
        throw new Error(`AI生成失败: ${response.error}`);
      }

    } catch (error) {
      console.warn('⚠️ AI生成失败，准备降级:', error);
      
      if (config.fallbackToCanvas) {
        return await this.generateWithCanvas(newsData);
      } else {
        throw error;
      }
    }
  }

  /**
   * Canvas生成路径（改进版）
   */
  private async generateWithCanvas(newsData: NewsData): Promise<string> {
    try {
      console.log('🖌️ 使用Canvas生成图片');
      const result = await posterShareService.generateNewsPoster(newsData);
      this.generationStats.canvasSuccess++;
      return result;
    } catch (error) {
      console.error('❌ Canvas生成失败:', error);
      throw error;
    }
  }

  /**
   * 批量预生成热门新闻图片
   */
  async preGenerateImages(newsList: NewsData[]): Promise<void> {
    console.log(`🔄 开始预生成${newsList.length}条新闻的分享图片`);
    
    const promises = newsList.slice(0, 10).map(news => // 限制并发数量
      this.generateShareImage(news, { 
        priority: 'low',
        style: 'modern',
        cacheEnabled: true
      }).catch(error => {
        console.warn(`预生成失败 - 新闻ID: ${news.id}`, error);
        return null;
      })
    );

    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
    
    console.log(`✅ 预生成完成: ${successCount}/${newsList.length} 成功`);
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(newsData: NewsData, config: ShareImageOptions): string {
    const key = `${newsData.id}-${config.style}-${config.useAI ? 'ai' : 'canvas'}`;
    return btoa(key).replace(/[/+=]/g, ''); // Base64编码并移除特殊字符
  }

  /**
   * 更新统计信息
   */
  private updateStats(isAISuccess: boolean, generationTime: number): void {
    if (isAISuccess) {
      this.generationStats.aiSuccess++;
    } else {
      this.generationStats.canvasSuccess++;
    }

    // 计算平均时间
    const alpha = 0.1;
    this.generationStats.averageTime = 
      this.generationStats.averageTime * (1 - alpha) + generationTime * alpha;
  }

  /**
   * 获取服务状态
   */
  getServiceStatus(): any {
    const aiStatus = aiImageManager.getServiceStatus();
    const mcpServices = mcpAdapter.getAvailableServices();
    
    return {
      ai: {
        services: aiStatus,
        stats: this.generationStats
      },
      mcp: {
        availableServices: mcpServices,
        totalServices: mcpServices.length
      },
      cache: {
        size: this.imageCache.size,
        maxSize: 1000 // 可配置
      },
      performance: {
        totalRequests: this.generationStats.totalRequests,
        averageTime: Math.round(this.generationStats.averageTime),
        aiSuccessRate: this.generationStats.totalRequests > 0 
          ? (this.generationStats.aiSuccess / this.generationStats.totalRequests * 100).toFixed(1) + '%'
          : '0%'
      }
    };
  }

  /**
   * 清理缓存
   */
  clearCache(): void {
    this.imageCache.clear();
    console.log('🧹 图片缓存已清理');
  }

  /**
   * 设置缓存大小限制
   */
  setCacheLimit(limit: number): void {
    if (this.imageCache.size > limit) {
      const entries = Array.from(this.imageCache.entries());
      const toDelete = entries.slice(0, entries.length - limit);
      toDelete.forEach(([key]) => this.imageCache.delete(key));
      console.log(`🗑️ 清理了${toDelete.length}个旧缓存条目`);
    }
  }

  /**
   * 智能风格选择
   */
  getOptimalStyle(newsData: NewsData): 'modern' | 'classic' | 'minimal' | 'colorful' {
    // 根据新闻类型智能选择风格
    const category = newsData.category.toLowerCase();
    
    if (category.includes('科技') || category.includes('ai')) {
      return 'modern';
    } else if (category.includes('商业') || category.includes('经济')) {
      return 'classic';
    } else if (category.includes('设计') || category.includes('艺术')) {
      return 'minimal';
    } else {
      return 'colorful';
    }
  }

  /**
   * 获取生成建议
   */
  getGenerationRecommendation(newsData: NewsData): ShareImageOptions {
    const currentHour = new Date().getHours();
    const isBusinessHours = currentHour >= 9 && currentHour <= 18;
    
    return {
      useAI: true,
      style: this.getOptimalStyle(newsData),
      priority: isBusinessHours ? 'normal' : 'low',
      fallbackToCanvas: true,
      cacheEnabled: true
    };
  }
}

// 导出单例实例
export const enhancedShareImageService = EnhancedShareImageService.getInstance();