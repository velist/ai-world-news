/**
 * MCP多AI轮询图片生成管理器
 * 支持多个AI服务的负载均衡、故障转移和质量优化
 */

interface AIService {
  id: string;
  name: string;
  endpoint: string;
  priority: number;
  maxConcurrent: number;
  timeout: number;
  isActive: boolean;
  currentLoad: number;
  successRate: number;
  avgResponseTime: number;
  lastHealthCheck: number;
}

interface ImageGenerationRequest {
  newsData: {
    id: string;
    title: string;
    summary: string;
    imageUrl?: string;
    publishedAt: string;
    source: string;
    category: string;
  };
  style: 'modern' | 'classic' | 'minimal' | 'colorful';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  cacheKey: string;
}

interface ImageGenerationResponse {
  success: boolean;
  imageUrl: string;
  base64Data?: string;
  generatedAt: number;
  serviceId: string;
  responseTime: number;
  quality: number;
  error?: string;
}

export class AIImageManager {
  private static instance: AIImageManager;
  private services: Map<string, AIService> = new Map();
  private requestQueue: ImageGenerationRequest[] = [];
  private activeRequests: Map<string, Promise<ImageGenerationResponse>> = new Map();
  private cache: Map<string, ImageGenerationResponse> = new Map();
  private healthCheckInterval: NodeJS.Timeout;

  // MCP支持的AI服务配置
  private readonly AI_SERVICES: AIService[] = [
    {
      id: 'dalle3',
      name: 'DALL·E 3',
      endpoint: '/api/ai/dalle3',
      priority: 1,
      maxConcurrent: 3,
      timeout: 30000,
      isActive: true,
      currentLoad: 0,
      successRate: 0.95,
      avgResponseTime: 15000,
      lastHealthCheck: Date.now()
    },
    {
      id: 'midjourney',
      name: 'Midjourney',
      endpoint: '/api/ai/midjourney',
      priority: 2,
      maxConcurrent: 5,
      timeout: 25000,
      isActive: true,
      currentLoad: 0,
      successRate: 0.92,
      avgResponseTime: 12000,
      lastHealthCheck: Date.now()
    },
    {
      id: 'stable-diffusion',
      name: 'Stable Diffusion',
      endpoint: '/api/ai/stable-diffusion',
      priority: 3,
      maxConcurrent: 8,
      timeout: 20000,
      isActive: true,
      currentLoad: 0,
      successRate: 0.88,
      avgResponseTime: 8000,
      lastHealthCheck: Date.now()
    },
    {
      id: 'flux',
      name: 'Flux AI',
      endpoint: '/api/ai/flux',
      priority: 4,
      maxConcurrent: 6,
      timeout: 15000,
      isActive: true,
      currentLoad: 0,
      successRate: 0.90,
      avgResponseTime: 10000,
      lastHealthCheck: Date.now()
    },
    {
      id: 'firefly',
      name: 'Adobe Firefly',
      endpoint: '/api/ai/firefly',
      priority: 5,
      maxConcurrent: 4,
      timeout: 18000,
      isActive: true,
      currentLoad: 0,
      successRate: 0.85,
      avgResponseTime: 14000,
      lastHealthCheck: Date.now()
    }
  ];

  private constructor() {
    this.initializeServices();
    this.startHealthChecks();
    this.startQueueProcessor();
  }

  public static getInstance(): AIImageManager {
    if (!AIImageManager.instance) {
      AIImageManager.instance = new AIImageManager();
    }
    return AIImageManager.instance;
  }

  /**
   * 初始化AI服务
   */
  private initializeServices(): void {
    this.AI_SERVICES.forEach(service => {
      this.services.set(service.id, { ...service });
    });
    console.log(`✅ AI图片生成管理器初始化完成，加载${this.services.size}个服务`);
  }

  /**
   * 生成分享图片 - 主入口方法
   */
  async generateShareImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    // 检查缓存
    const cached = this.cache.get(request.cacheKey);
    if (cached && (Date.now() - cached.generatedAt) < 3600000) { // 1小时缓存
      console.log(`🎯 缓存命中: ${request.cacheKey}`);
      return cached;
    }

    // 检查是否有相同的请求正在处理
    if (this.activeRequests.has(request.cacheKey)) {
      console.log(`⏳ 等待现有请求: ${request.cacheKey}`);
      return await this.activeRequests.get(request.cacheKey)!;
    }

    // 创建并发请求Promise
    const generationPromise = this.processImageGeneration(request);
    this.activeRequests.set(request.cacheKey, generationPromise);

    try {
      const result = await generationPromise;
      
      // 缓存成功的结果
      if (result.success) {
        this.cache.set(request.cacheKey, result);
        console.log(`✅ 图片生成成功，用时${Date.now() - startTime}ms，服务：${result.serviceId}`);
      }
      
      return result;
    } finally {
      this.activeRequests.delete(request.cacheKey);
    }
  }

  /**
   * 处理图片生成 - 多AI并发轮询
   */
  private async processImageGeneration(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const availableServices = this.getAvailableServices();
    
    if (availableServices.length === 0) {
      return {
        success: false,
        imageUrl: '',
        generatedAt: Date.now(),
        serviceId: 'none',
        responseTime: 0,
        quality: 0,
        error: '没有可用的AI服务'
      };
    }

    console.log(`🚀 开始多AI轮询生成，可用服务：${availableServices.map(s => s.name).join(', ')}`);

    // 根据优先级和负载选择最佳服务组合
    const selectedServices = this.selectOptimalServices(availableServices, request.priority);
    
    // 并发请求多个AI服务
    const promises = selectedServices.map(service => this.callAIService(service, request));
    
    try {
      // 使用Promise.race获取最快的响应，同时保持其他请求作为备用
      const fastestResult = await Promise.race(promises);
      
      if (fastestResult.success) {
        // 取消其他正在进行的请求
        this.updateServiceMetrics(fastestResult.serviceId, true, fastestResult.responseTime);
        return fastestResult;
      }
      
      // 如果最快的失败了，等待其他结果
      console.warn(`⚠️ 最快服务${fastestResult.serviceId}失败，等待备用服务`);
      
      const allResults = await Promise.allSettled(promises);
      const successResults = allResults
        .filter(result => result.status === 'fulfilled' && result.value.success)
        .map(result => (result as PromiseFulfilledResult<ImageGenerationResponse>).value);
      
      if (successResults.length > 0) {
        // 选择质量最高的结果
        const bestResult = successResults.sort((a, b) => b.quality - a.quality)[0];
        this.updateServiceMetrics(bestResult.serviceId, true, bestResult.responseTime);
        return bestResult;
      }
      
      // 所有服务都失败，返回降级方案
      return await this.fallbackGeneration(request);
      
    } catch (error) {
      console.error('❌ AI图片生成完全失败:', error);
      return await this.fallbackGeneration(request);
    }
  }

  /**
   * 选择最优服务组合
   */
  private selectOptimalServices(services: AIService[], priority: string): AIService[] {
    const maxServices = priority === 'urgent' ? 3 : priority === 'high' ? 2 : 1;
    
    return services
      .filter(service => service.currentLoad < service.maxConcurrent)
      .sort((a, b) => {
        // 综合评分：成功率 * 0.4 + (1/响应时间) * 0.3 + 优先级 * 0.3
        const scoreA = a.successRate * 0.4 + (1000/a.avgResponseTime) * 0.3 + (10-a.priority) * 0.03;
        const scoreB = b.successRate * 0.4 + (1000/b.avgResponseTime) * 0.3 + (10-b.priority) * 0.03;
        return scoreB - scoreA;
      })
      .slice(0, maxServices);
  }

  /**
   * 调用AI服务
   */
  private async callAIService(service: AIService, request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    const startTime = Date.now();
    
    // 增加负载计数
    service.currentLoad++;
    
    try {
      const prompt = this.buildPrompt(request);
      
      // 模拟MCP API调用
      const response = await this.makeAIRequest(service, prompt, request);
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: true,
        imageUrl: response.imageUrl,
        base64Data: response.base64Data,
        generatedAt: Date.now(),
        serviceId: service.id,
        responseTime,
        quality: this.assessImageQuality(response),
        error: undefined
      };
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateServiceMetrics(service.id, false, responseTime);
      
      return {
        success: false,
        imageUrl: '',
        generatedAt: Date.now(),
        serviceId: service.id,
        responseTime,
        quality: 0,
        error: error instanceof Error ? error.message : '未知错误'
      };
    } finally {
      service.currentLoad--;
    }
  }

  /**
   * 构建AI提示词
   */
  private buildPrompt(request: ImageGenerationRequest): string {
    const { newsData, style } = request;
    
    const stylePrompts = {
      modern: "现代简约风格，扁平化设计，清爽配色",
      classic: "经典商务风格，专业配色，传统布局",
      minimal: "极简主义风格，大量留白，突出重点",
      colorful: "色彩丰富，渐变背景，活力四射"
    };

    return `
创建一个高质量的新闻分享海报：
标题：${newsData.title}
摘要：${newsData.summary.substring(0, 100)}...
来源：${newsData.source}
类别：${newsData.category}

设计要求：
- ${stylePrompts[style]}
- 尺寸：750x1334像素，手机分享比例
- 包含清晰的二维码
- 品牌标识："AI推 - 智能新闻推送"
- 字体清晰易读，层次分明
- 高质量输出，适合社交分享

技术要求：
- 分辨率300DPI
- PNG格式
- 色彩模式RGB
- 文字抗锯齿
    `.trim();
  }

  /**
   * 模拟MCP AI请求
   */
  private async makeAIRequest(service: AIService, prompt: string, request: ImageGenerationRequest): Promise<any> {
    // 这里会实际调用MCP协议连接的AI服务
    // 现在先模拟实现
    
    const mockDelay = service.avgResponseTime + (Math.random() - 0.5) * 5000;
    await new Promise(resolve => setTimeout(resolve, mockDelay));
    
    // 模拟成功率
    if (Math.random() > service.successRate) {
      throw new Error(`${service.name}服务暂时不可用`);
    }
    
    return {
      imageUrl: `https://generated-images.cdn.com/${request.cacheKey}-${service.id}.png`,
      base64Data: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==`
    };
  }

  /**
   * 评估图片质量
   */
  private assessImageQuality(response: any): number {
    // 基于服务类型和响应时间评估质量分数 (0-100)
    let quality = 80; // 基础分数
    
    // 可以根据实际图片分析结果调整
    if (response.base64Data && response.base64Data.length > 50000) {
      quality += 10; // 文件大小合理
    }
    
    return Math.min(quality, 100);
  }

  /**
   * 降级生成方案
   */
  private async fallbackGeneration(request: ImageGenerationRequest): Promise<ImageGenerationResponse> {
    console.log('🔄 启用降级方案：使用本地Canvas生成');
    
    // 调用原有的posterShareService作为降级方案
    try {
      const { posterShareService } = await import('./posterShareService');
      const base64Data = await posterShareService.generateNewsPoster(request.newsData);
      
      return {
        success: true,
        imageUrl: '',
        base64Data,
        generatedAt: Date.now(),
        serviceId: 'fallback-canvas',
        responseTime: 2000,
        quality: 70,
        error: undefined
      };
    } catch (error) {
      return {
        success: false,
        imageUrl: '',
        generatedAt: Date.now(),
        serviceId: 'fallback-failed',
        responseTime: 0,
        quality: 0,
        error: '降级方案也失败了'
      };
    }
  }

  /**
   * 获取可用服务列表
   */
  private getAvailableServices(): AIService[] {
    return Array.from(this.services.values())
      .filter(service => service.isActive && service.currentLoad < service.maxConcurrent);
  }

  /**
   * 更新服务指标
   */
  private updateServiceMetrics(serviceId: string, success: boolean, responseTime: number): void {
    const service = this.services.get(serviceId);
    if (!service) return;

    // 更新成功率 (使用滑动平均)
    const alpha = 0.1;
    service.successRate = service.successRate * (1 - alpha) + (success ? 1 : 0) * alpha;
    
    // 更新平均响应时间
    if (success) {
      service.avgResponseTime = service.avgResponseTime * (1 - alpha) + responseTime * alpha;
    }
    
    console.log(`📊 服务${service.name}指标更新: 成功率${(service.successRate*100).toFixed(1)}%, 响应时间${service.avgResponseTime.toFixed(0)}ms`);
  }

  /**
   * 健康检查
   */
  private startHealthChecks(): void {
    this.healthCheckInterval = setInterval(async () => {
      for (const service of this.services.values()) {
        try {
          // 简单的健康检查请求
          const response = await fetch(service.endpoint + '/health', { 
            method: 'GET',
            timeout: 5000 
          });
          
          service.isActive = response.ok;
          service.lastHealthCheck = Date.now();
        } catch (error) {
          service.isActive = false;
          console.warn(`⚠️ 服务${service.name}健康检查失败:`, error);
        }
      }
    }, 30000); // 30秒检查一次
  }

  /**
   * 启动队列处理器
   */
  private startQueueProcessor(): void {
    // 实现请求队列处理逻辑
    setInterval(() => {
      if (this.requestQueue.length > 0) {
        console.log(`📝 处理队列中的${this.requestQueue.length}个请求`);
        // 处理队列逻辑
      }
    }, 1000);
  }

  /**
   * 获取服务状态
   */
  public getServiceStatus(): Array<{id: string, name: string, isActive: boolean, load: number, successRate: number}> {
    return Array.from(this.services.values()).map(service => ({
      id: service.id,
      name: service.name,
      isActive: service.isActive,
      load: service.currentLoad,
      successRate: service.successRate
    }));
  }

  /**
   * 清理资源
   */
  public destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    this.cache.clear();
    this.activeRequests.clear();
    console.log('🧹 AI图片管理器资源已清理');
  }
}

// 导出单例实例
export const aiImageManager = AIImageManager.getInstance();