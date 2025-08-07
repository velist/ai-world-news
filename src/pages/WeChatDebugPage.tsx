import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { personalSubscriptionShareService } from '@/services/personalSubscriptionShareService';

interface DebugLog {
  type: string;
  timestamp: string;
  message: string;
  data?: any;
}

export const WeChatDebugPage = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [testing, setTesting] = useState(false);
  const [workerUrl, setWorkerUrl] = useState('https://wechat-signature-api.vee5208.workers.dev');

  const addLog = (type: string, message: string, data?: any) => {
    const log: DebugLog = {
      type,
      timestamp: new Date().toLocaleTimeString(),
      message,
      data
    };
    setLogs(prev => [...prev.slice(-49), log]); // 保持最近50条
  };

  const testWorkerAPI = async () => {
    setTesting(true);
    addLog('info', '🔄 开始测试Worker API...');
    
    try {
      // 测试状态端点
      const statusResponse = await fetch(`${workerUrl}/api/wechat/status`);
      const statusData = await statusResponse.json();
      addLog('success', '✅ Worker状态检查成功', statusData);
      
      // 测试签名端点
      const testUrl = window.location.href;
      const signatureResponse = await fetch(`${workerUrl}/api/wechat/signature?url=${encodeURIComponent(testUrl)}&debug=true`);
      const signatureData = await signatureResponse.json();
      
      if (signatureData.error) {
        addLog('error', '❌ 签名生成失败', signatureData);
      } else {
        addLog('success', '✅ 签名生成成功', {
          appId: signatureData.appId,
          timestamp: signatureData.timestamp,
          hasSignature: !!signatureData.signature,
          signatureLength: signatureData.signature?.length || 0
        });
      }
      
    } catch (error: any) {
      addLog('error', '❌ API测试失败', { error: error.message });
    }
    
    setTesting(false);
  };

  const testWeChatSDK = async () => {
    addLog('info', '🔄 测试微信JS-SDK...');
    
    if (typeof (window as any).wx === 'undefined') {
      addLog('warning', '⚠️ 微信JS-SDK未加载，正在加载...');
      
      // 动态加载微信JS-SDK
      const script = document.createElement('script');
      script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
      script.onload = () => {
        addLog('success', '✅ 微信JS-SDK加载完成');
        performWeChatTest();
      };
      script.onerror = () => {
        addLog('error', '❌ 微信JS-SDK加载失败');
      };
      document.head.appendChild(script);
    } else {
      performWeChatTest();
    }
  };

  const performWeChatTest = async () => {
    try {
      const testUrl = window.location.href;
      const response = await fetch(`${workerUrl}/api/wechat/signature?url=${encodeURIComponent(testUrl)}&debug=true`);
      const config = await response.json();
      
      if (config.error) {
        addLog('error', '❌ 获取微信配置失败', config);
        return;
      }
      
      const wx = (window as any).wx;
      
      addLog('info', '🔧 配置微信JS-SDK...', {
        appId: config.appId,
        timestamp: config.timestamp,
        hasSignature: !!config.signature
      });
      
      wx.config({
        debug: true, // 开启调试模式
        appId: config.appId,
        timestamp: config.timestamp,
        nonceStr: config.nonceStr,
        signature: config.signature,
        jsApiList: config.jsApiList
      });
      
      wx.ready(() => {
        addLog('success', '✅ 微信JS-SDK配置成功！可以使用分享功能');
      });
      
      wx.error((res: any) => {
        addLog('error', '❌ 微信JS-SDK配置失败', res);
      });
      
    } catch (error: any) {
      addLog('error', '❌ 微信SDK测试失败', { error: error.message });
    }
  };

  const testMetaTagShare = () => {
    addLog('info', '🔄 测试Meta标签分享方案...');
    
    const shareConfig = {
      title: '微信分享测试 - AI推',
      desc: '这是一个微信分享功能的测试页面，用于验证个人订阅号的分享配置。',
      link: window.location.href,
      imgUrl: 'https://news.aipush.fun/wechat-share-300.png'
    };
    
    try {
      personalSubscriptionShareService.configureShare(shareConfig);
      addLog('success', '✅ Meta标签分享配置完成', shareConfig);
      
      // 显示当前页面的meta标签
      const metaTags: any = {};
      document.querySelectorAll('meta[property^="og:"], meta[name^="twitter:"]').forEach(meta => {
        const key = meta.getAttribute('property') || meta.getAttribute('name');
        const content = meta.getAttribute('content');
        if (key && content) {
          metaTags[key] = content;
        }
      });
      
      addLog('info', '📋 当前页面Meta标签', metaTags);
      
    } catch (error: any) {
      addLog('error', '❌ Meta标签配置失败', { error: error.message });
    }
  };

  const loadWorkerLogs = async () => {
    try {
      const response = await fetch(`${workerUrl}/debug/logs?limit=10`);
      const data = await response.json();
      addLog('info', '📋 Worker调试日志', data);
    } catch (error: any) {
      addLog('error', '❌ 加载Worker日志失败', { error: error.message });
    }
  };

  const clearAllLogs = () => {
    setLogs([]);
    addLog('info', '🗑️ 本地日志已清除');
  };

  useEffect(() => {
    addLog('info', '🚀 微信分享调试页面已加载');
    addLog('info', '📱 用户代理', { userAgent: navigator.userAgent });
    addLog('info', '🌍 当前URL', { url: window.location.href });
    addLog('info', '📱 是否微信环境', { isWeChat: /micromessenger/i.test(navigator.userAgent) });
  }, []);

  return (
    <>
      <Helmet>
        <title>微信分享调试 - AI推测试站</title>
        <meta name="description" content="微信分享功能调试和监控页面，用于测试个人订阅号的分享配置。" />
        <meta property="og:title" content="微信分享调试 - AI推测试站" />
        <meta property="og:description" content="微信分享功能调试和监控页面，用于测试个人订阅号的分享配置。" />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        <meta property="og:url" content={window.location.href} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              🔧 微信分享调试测试站
            </h1>
            
            {/* Worker URL配置 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Worker API地址:
              </label>
              <input
                type="text"
                value={workerUrl}
                onChange={(e) => setWorkerUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* 测试按钮 */}
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                onClick={testWorkerAPI}
                disabled={testing}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {testing ? '测试中...' : '测试Worker API'}
              </button>
              
              <button
                onClick={testWeChatSDK}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                测试微信JS-SDK
              </button>
              
              <button
                onClick={testMetaTagShare}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
              >
                测试Meta标签分享
              </button>
              
              <button
                onClick={loadWorkerLogs}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                查看Worker日志
              </button>
              
              <button
                onClick={clearAllLogs}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                清除日志
              </button>
            </div>
            
            {/* 日志显示 */}
            <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-96 overflow-y-auto font-mono text-sm">
              <div className="mb-2 text-gray-400">
                === 调试日志 (最近{logs.length}条) ===
              </div>
              {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${getLogColor(log.type)}`}>
                  <span className="text-gray-400">[{log.timestamp}]</span>{' '}
                  <span className="text-white">{log.message}</span>
                  {log.data && (
                    <div className="mt-1 ml-4 text-gray-300 whitespace-pre-wrap">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-400">暂无日志记录...</div>
              )}
            </div>
            
            {/* 使用说明 */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">📖 使用说明:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• 在微信中打开此页面进行测试</li>
                <li>• 点击各种测试按钮查看详细的调试信息</li>
                <li>• Worker日志会记录所有API调用和响应</li>
                <li>• 分享时查看控制台和日志了解详细过程</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

function getLogColor(type: string): string {
  switch (type) {
    case 'error': return 'text-red-400';
    case 'success': return 'text-green-400';
    case 'warning': return 'text-yellow-400';
    case 'info': return 'text-blue-400';
    default: return 'text-gray-300';
  }
}