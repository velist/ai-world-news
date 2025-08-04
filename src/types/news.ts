export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  source: string;
  publishedAt: string;
  category: string;
  originalUrl?: string;
  aiInsight?: string;
  // 用于存储原始英文内容（如果有的话）
  originalTitle?: string;
  originalSummary?: string;
  originalContent?: string;
}

export interface NewsCategory {
  id: string;
  name: string;
  color: string;
}

export const DEFAULT_CATEGORIES: NewsCategory[] = [
  { id: 'ai', name: 'AI 模型', color: 'ai-color' },
  { id: 'tech', name: '科技', color: 'tech-color' },
  { id: 'economy', name: '经济', color: 'economy-color' },
  { id: 'analysis', name: '深度分析', color: 'analysis-color' },
];