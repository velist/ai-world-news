/**
 * AI图片生成系统监控面板
 * 实时显示各个AI服务的状态、性能指标和生成统计
 */

import React, { useState, useEffect } from 'react';
import { enhancedShareImageService } from '@/services/enhancedShareImageService';

interface ServiceStatus {
  id: string;
  name: string;
  isActive: boolean;
  load: number;
  successRate: number;
}

interface SystemStats {
  ai: {
    services: ServiceStatus[];
    stats: {
      aiSuccess: number;
      canvasSuccess: number;
      totalRequests: number;
      averageTime: number;
    };
  };
  mcp: {
    availableServices: string[];
    totalServices: number;
  };
  cache: {
    size: number;
    maxSize: number;
  };
  performance: {
    totalRequests: number;
    averageTime: number;
    aiSuccessRate: string;
  };
}

export const AIImageMonitoringDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateStats = () => {
      try {
        const currentStats = enhancedShareImageService.getServiceStatus();
        setStats(currentStats);
        setLastUpdate(new Date());
        setIsLoading(false);
      } catch (error) {
        console.error('获取监控数据失败:', error);
        setIsLoading(false);
      }
    };

    // 初始加载
    updateStats();

    // 每5秒更新一次
    const interval = setInterval(updateStats, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">⚠️</div>
          <div>无法加载监控数据</div>
        </div>
      </div>
    );
  }

  const getServiceStatusColor = (isActive: boolean, successRate: number) => {
    if (!isActive) return 'bg-red-500';
    if (successRate > 0.9) return 'bg-green-500';
    if (successRate > 0.7) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const getServiceStatusText = (isActive: boolean, successRate: number) => {
    if (!isActive) return '离线';
    if (successRate > 0.9) return '优秀';
    if (successRate > 0.7) return '良好';
    return '一般';
  };

  return (
    <div className="space-y-6 p-6">
      {/* 标题栏 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">🤖 AI图片生成系统监控</h1>
            <p className="text-blue-100">实时监控多AI服务状态与性能指标</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">最后更新</div>
            <div className="font-mono">{lastUpdate.toLocaleTimeString()}</div>
          </div>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <div className="text-sm text-gray-600">总请求数</div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.performance.totalRequests}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⚡</div>
            <div>
              <div className="text-sm text-gray-600">平均响应时间</div>
              <div className="text-2xl font-bold text-green-600">
                {stats.performance.averageTime}ms
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🎯</div>
            <div>
              <div className="text-sm text-gray-600">AI成功率</div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.performance.aiSuccessRate}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🔧</div>
            <div>
              <div className="text-sm text-gray-600">可用服务数</div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.mcp.totalServices}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI服务状态列表 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="mr-2">🤖</span>
          AI服务状态
        </h2>
        
        <div className="space-y-4">
          {stats.ai.services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div
                  className={`w-4 h-4 rounded-full ${getServiceStatusColor(
                    service.isActive,
                    service.successRate
                  )}`}
                ></div>
                <div>
                  <div className="font-semibold">{service.name}</div>
                  <div className="text-sm text-gray-600">
                    {getServiceStatusText(service.isActive, service.successRate)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <div className="text-center">
                  <div className="text-gray-600">成功率</div>
                  <div className="font-bold">
                    {(service.successRate * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">当前负载</div>
                  <div className="font-bold">{service.load}</div>
                </div>
                <div className="text-center">
                  <div className="text-gray-600">状态</div>
                  <div
                    className={`px-2 py-1 rounded text-white text-xs ${
                      service.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  >
                    {service.isActive ? '在线' : '离线'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 生成统计与缓存状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 生成统计 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">📈</span>
            生成统计
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">AI生成成功</span>
              <span className="font-bold text-green-600">
                {stats.ai.stats.aiSuccess}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Canvas生成成功</span>
              <span className="font-bold text-blue-600">
                {stats.ai.stats.canvasSuccess}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">总请求数</span>
              <span className="font-bold">
                {stats.ai.stats.totalRequests}
              </span>
            </div>
            
            {/* 成功率进度条 */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>AI生成成功率</span>
                <span>
                  {stats.ai.stats.totalRequests > 0
                    ? ((stats.ai.stats.aiSuccess / stats.ai.stats.totalRequests) * 100).toFixed(1)
                    : '0'}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: stats.ai.stats.totalRequests > 0
                      ? `${(stats.ai.stats.aiSuccess / stats.ai.stats.totalRequests) * 100}%`
                      : '0%'
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* 缓存状态 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center">
            <span className="mr-2">💾</span>
            缓存状态
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">缓存条目</span>
              <span className="font-bold">{stats.cache.size}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">最大容量</span>
              <span className="font-bold">{stats.cache.maxSize}</span>
            </div>
            
            {/* 缓存使用率进度条 */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>使用率</span>
                <span>
                  {((stats.cache.size / stats.cache.maxSize) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(stats.cache.size / stats.cache.maxSize) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="pt-4 border-t">
              <button
                onClick={() => {
                  enhancedShareImageService.clearCache();
                  // 触发数据更新
                  setStats(enhancedShareImageService.getServiceStatus());
                }}
                className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              >
                🗑️ 清理缓存
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MCP服务列表 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center">
          <span className="mr-2">🔗</span>
          MCP连接状态
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stats.mcp.availableServices.map((service, index) => (
            <div
              key={service}
              className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="text-2xl mb-2">
                {index === 0 ? '🎨' : index === 1 ? '🖼️' : index === 2 ? '🎯' : index === 3 ? '✨' : '🔧'}
              </div>
              <div className="font-semibold text-sm">{service}</div>
              <div className="text-xs text-green-600 mt-1">已连接</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIImageMonitoringDashboard;