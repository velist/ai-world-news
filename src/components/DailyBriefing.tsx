import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Sparkles, ExternalLink, Loader2, X } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { useContentFilter } from '@/hooks/useContentFilter';

interface DailyBriefingProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BriefingItem {
  id: string;
  title: string;
  summary: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  timestamp: string;
}

export const DailyBriefing: React.FC<DailyBriefingProps> = ({ isOpen, onClose }) => {
  const { isZh } = useLanguage();
  const { filterAINews } = useContentFilter();
  const [briefingData, setBriefingData] = useState<BriefingItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const currentDate = new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    if (isOpen) {
      generateBriefing();
    }
  }, [isOpen]);

  const generateBriefing = async () => {
    setLoading(true);
    try {
      // 获取AI相关新闻并生成晨报
      const response = await fetch('/news-data.json?' + Date.now());
      const data = await response.json();
      
      if (data.success && data.data) {
        // 筛选AI相关新闻，最多10条
        const aiNews = filterAINews(data.data);
        
        const topNews = aiNews.map((news: any, index: number) => ({
          id: news.id || `briefing_${index}`,
          title: news.title || 'Untitled',
          summary: news.aiInsight ? 
            (news.aiInsight.length > 200 ? news.aiInsight.substring(0, 200) + '...' : news.aiInsight) :
            (news.summary || '暂无摘要'),
          category: news.category || 'AI',
          importance: index < 3 ? 'high' : index < 7 ? 'medium' : 'low' as const,
          timestamp: news.publishedAt || new Date().toISOString()
        }));
        
        setBriefingData(topNews);
      }
    } catch (error) {
      console.error('获取AI晨报数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImportanceLabel = (importance: string) => {
    switch (importance) {
      case 'high': return isZh ? '重要' : 'High';
      case 'medium': return isZh ? '一般' : 'Medium';
      case 'low': return isZh ? '关注' : 'Low';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-hero text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              {isZh ? 'AI 每日晨报' : 'Daily AI Briefing'}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 text-sm opacity-90">
            <Calendar className="w-4 h-4" />
            <span>{currentDate}</span>
            <Clock className="w-4 h-4 ml-4" />
            <span>{isZh ? 'AI智能生成' : 'AI Generated'}</span>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{isZh ? '正在生成AI专题晨报...' : 'Generating AI briefing...'}</span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 晨报介绍 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  {isZh 
                    ? '本AI专题晨报精选10条人工智能领域重要新闻，为您提供最新的技术趋势和行业动态。'
                    : 'This AI briefing features 10 selected important news from the artificial intelligence field, providing you with the latest technology trends and industry developments.'
                  }
                </p>
              </div>

              {/* 新闻列表 */}
              {briefingData.map((item, index) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                      <span className={`px-2 py-1 text-xs rounded-full border ${getImportanceColor(item.importance)}`}>
                        {getImportanceLabel(item.importance)}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {item.summary}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部信息 */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {isZh 
                ? '每日AI晨报由智能算法自动生成，持续关注人工智能领域最新动态'
                : 'Daily AI briefing is automatically generated by intelligent algorithms, continuously tracking the latest developments in artificial intelligence'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};