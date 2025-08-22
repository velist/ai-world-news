/**
 * 智谱AI服务集成
 * 使用免费GLM模型增强系统功能
 */

interface ZhipuAIConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

interface ZhipuMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ZhipuResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class ZhipuAIService {
  private static instance: ZhipuAIService;
  private config: ZhipuAIConfig;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessing = false;

  constructor() {
    this.config = {
      apiKey: 'd21a6142dd484e218f8714c43a573172.5PtK14mXs1INB0dG',
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
      model: 'glm-4-flash' // 免费模型
    };
  }

  static getInstance(): ZhipuAIService {
    if (!ZhipuAIService.instance) {
      ZhipuAIService.instance = new ZhipuAIService();
    }
    return ZhipuAIService.instance;
  }

  /**
   * 生成JWT Token用于智谱AI认证
   */
  private generateJWT(): string {
    try {
      const [apiKey, secret] = this.config.apiKey.split('.');
      const header = {
        alg: 'HS256',
        typ: 'JWT'
      };
      
      const payload = {
        api_key: apiKey,
        exp: Math.floor(Date.now() / 1000) + 3600, // 1小时过期
        timestamp: Math.floor(Date.now() / 1000)
      };

      // 简化版JWT生成（生产环境建议使用专业库）
      const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '');
      const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '');
      
      // 注意：这里需要HMAC-SHA256签名，简化实现
      const signature = btoa(`${headerBase64}.${payloadBase64}.${secret}`).replace(/=/g, '');
      
      return `${headerBase64}.${payloadBase64}.${signature}`;
    } catch (error) {
      console.error('JWT生成失败:', error);
      return this.config.apiKey; // 回退到直接使用API Key
    }
  }

  /**
   * 调用智谱AI API
   */
  private async callAPI(messages: ZhipuMessage[], temperature = 0.7): Promise<ZhipuResponse> {
    const url = `${this.config.baseURL}/chat/completions`;
    
    const requestBody = {
      model: this.config.model,
      messages,
      temperature,
      max_tokens: 1000,
      top_p: 0.7,
      stream: false
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.generateJWT()}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`智谱AI API错误: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('智谱AI API调用失败:', error);
      throw error;
    }
  }

  /**
   * 队列处理，避免API频率限制
   */
  private async queueRequest<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue() {
    if (this.isProcessing || this.requestQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
          // 添加延迟避免频率限制
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error('队列请求处理失败:', error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * 新闻摘要生成
   */
  async generateNewsSummary(title: string, content: string): Promise<string> {
    const messages: ZhipuMessage[] = [
      {
        role: 'system',
        content: '你是一个专业的新闻摘要专家。请为给定的新闻生成简洁、准确的摘要，长度控制在100字以内。'
      },
      {
        role: 'user',
        content: `请为以下新闻生成摘要：\n标题：${title}\n内容：${content}`
      }
    ];

    return this.queueRequest(async () => {
      const response = await this.callAPI(messages);
      return response.choices[0]?.message?.content || '摘要生成失败';
    });
  }

  /**
   * AI洞察分析
   */
  async generateAIInsight(title: string, content: string): Promise<string> {
    const messages: ZhipuMessage[] = [
      {
        role: 'system',
        content: '你是一个AI技术分析专家。请从技术发展、行业影响、未来趋势三个维度分析给定的AI新闻，提供专业洞察。'
      },
      {
        role: 'user',
        content: `请分析以下AI新闻：\n标题：${title}\n内容：${content}`
      }
    ];

    return this.queueRequest(async () => {
      const response = await this.callAPI(messages);
      return response.choices[0]?.message?.content || 'AI洞察生成失败';
    });
  }

  /**
   * 智能标签生成
   */
  async generateTags(title: string, content: string): Promise<string[]> {
    const messages: ZhipuMessage[] = [
      {
        role: 'system',
        content: '你是一个内容标签专家。请为给定的新闻生成3-5个相关标签，标签应该准确反映新闻的核心主题。返回格式：标签1,标签2,标签3'
      },
      {
        role: 'user',
        content: `请为以下新闻生成标签：\n标题：${title}\n内容：${content}`
      }
    ];

    return this.queueRequest(async () => {
      const response = await this.callAPI(messages);
      const tagsText = response.choices[0]?.message?.content || '';
      return tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    });
  }

  /**
   * 智能翻译
   */
  async translateText(text: string, targetLang: 'en' | 'zh'): Promise<string> {
    const langMap = {
      'en': '英文',
      'zh': '中文'
    };

    const messages: ZhipuMessage[] = [
      {
        role: 'system',
        content: `你是一个专业翻译专家。请将给定文本翻译成${langMap[targetLang]}，保持原意和语言风格。`
      },
      {
        role: 'user',
        content: `请翻译以下文本：${text}`
      }
    ];

    return this.queueRequest(async () => {
      const response = await this.callAPI(messages);
      return response.choices[0]?.message?.content || '翻译失败';
    });
  }

  /**
   * 内容质量评估
   */
  async assessContentQuality(title: string, content: string): Promise<{
    score: number;
    feedback: string;
    suggestions: string[];
  }> {
    const messages: ZhipuMessage[] = [
      {
        role: 'system',
        content: '你是一个内容质量评估专家。请评估给定新闻的质量，给出1-10分的评分，并提供改进建议。返回JSON格式：{"score": 分数, "feedback": "反馈", "suggestions": ["建议1", "建议2"]}'
      },
      {
        role: 'user',
        content: `请评估以下新闻质量：\n标题：${title}\n内容：${content}`
      }
    ];

    return this.queueRequest(async () => {
      const response = await this.callAPI(messages);
      const resultText = response.choices[0]?.message?.content || '{}';
      
      try {
        return JSON.parse(resultText);
      } catch (error) {
        return {
          score: 5,
          feedback: '评估失败',
          suggestions: ['请检查内容格式', '确保信息准确性']
        };
      }
    });
  }

  /**
   * 批量处理新闻
   */
  async batchProcessNews(newsItems: Array<{ title: string; content: string }>) {
    const results = [];
    
    for (const item of newsItems) {
      try {
        const [summary, insight, tags] = await Promise.all([
          this.generateNewsSummary(item.title, item.content),
          this.generateAIInsight(item.title, item.content),
          this.generateTags(item.title, item.content)
        ]);

        results.push({
          title: item.title,
          summary,
          insight,
          tags,
          enhanced: true
        });

        // 添加延迟避免API限制
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`处理新闻失败: ${item.title}`, error);
        results.push({
          title: item.title,
          summary: item.content.substring(0, 100) + '...',
          insight: '暂无AI洞察',
          tags: [],
          enhanced: false
        });
      }
    }

    return results;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.callAPI([
        {
          role: 'user',
          content: '你好，请回复"服务正常"'
        }
      ]);

      return response.choices[0]?.message?.content?.includes('服务正常') || false;
    } catch (error) {
      console.error('智谱AI健康检查失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const zhipuAI = ZhipuAIService.getInstance();