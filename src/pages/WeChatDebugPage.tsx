import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isWeChatEnvironment } from '@/hooks/useWeChatEnvironment';

interface ConsoleLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

/**
 * 微信环境调试页面
 * 提供控制台查看和路由调试功能
 */
export const WeChatDebugPage = () => {
  const [logs, setLogs] = useState<ConsoleLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const navigate = useNavigate();

  // 捕获控制台日志
  useEffect(() => {
    const originalConsoleLog = console.log;
    const originalConsoleWarn = console.warn;
    const originalConsoleError = console.error;

    const addLog = (level: 'info' | 'warn' | 'error', args: any[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');

      setLogs(prev => [{
        timestamp: new Date().toLocaleTimeString(),
        level,
        message,
        data: args.length > 1 ? args : undefined
      }, ...prev].slice(0, 50)); // 保留最近50条日志
    };

    console.log = (...args) => {
      originalConsoleLog(...args);
      addLog('info', args);
    };

    console.warn = (...args) => {
      originalConsoleWarn(...args);
      addLog('warn', args);
    };

    console.error = (...args) => {
      originalConsoleError(...args);
      addLog('error', args);
    };

    return () => {
      console.log = originalConsoleLog;
      console.warn = originalConsoleWarn;
      console.error = originalConsoleError;
    };
  }, []);

  // 收集调试信息
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      isWeChat: isWeChatEnvironment(),
      url: window.location.href,
      pathname: window.location.pathname,
      hash: window.location.hash,
      search: window.location.search,
      timestamp: new Date().toISOString(),
      screen: {
        width: window.screen.width,
        height: window.screen.height
      },
      window: {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight
      }
    };

    setDebugInfo(info);
    console.log('🔍 调试信息:', info);
  }, []);

  // 处理Hash路由测试
  const testHashRoute = () => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#/news/')) {
      const match = hash.match(/#\/news\/(.+)/);
      if (match && match[1]) {
        console.log('🧪 测试Hash路由解析:', { hash, newsId: match[1] });
        navigate(`/news/${match[1]}`, { replace: true });
      } else {
        console.error('❌ Hash路由格式错误:', hash);
      }
    } else {
      console.warn('⚠️ 当前不是Hash路由:', hash);
    }
  };

  // 测试不同新闻ID
  const testNewsId = (newsId: string) => {
    console.log('🧪 测试新闻ID:', newsId);
    navigate(`/news/${newsId}`, { replace: true });
  };

  // 清空日志
  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', fontSize: '14px' }}>
      <div style={{ 
        position: 'fixed', 
        top: '10px', 
        right: '10px', 
        zIndex: 9999,
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => setIsVisible(!isVisible)}
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isVisible ? '隐藏' : '显示'}控制台
        </button>
        <button
          onClick={testHashRoute}
          style={{
            padding: '8px 16px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          测试Hash路由
        </button>
      </div>

      {isVisible && (
        <div style={{
          position: 'fixed',
          top: '60px',
          right: '10px',
          width: '90%',
          maxWidth: '500px',
          height: '70vh',
          background: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          zIndex: 9998,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: '10px',
            background: '#e9ecef',
            borderBottom: '1px solid #dee2e6',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ margin: 0 }}>调试控制台</h3>
            <button
              onClick={clearLogs}
              style={{
                padding: '4px 8px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '3px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              清空
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h4>调试信息:</h4>
              <pre style={{ fontSize: '12px', background: '#f1f3f4', padding: '8px', borderRadius: '3px' }}>
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
            <div style={{ marginBottom: '20px' }}>
              <h4>快速测试:</h4>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => testNewsId('123')}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  测试ID: 123
                </button>
                <button
                  onClick={() => testNewsId('news_1754498333503_0')}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  测试真实ID
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{ padding: '4px 8px', fontSize: '12px' }}
                >
                  返回首页
                </button>
              </div>
            </div>
            <div>
              <h4>控制台日志:</h4>
              <div style={{ 
                background: '#ffffff', 
                border: '1px solid #dee2e6', 
                borderRadius: '3px',
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {logs.length === 0 ? (
                  <div style={{ padding: '10px', color: '#6c757d' }}>暂无日志</div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: '8px',
                        borderBottom: '1px solid #f1f3f4',
                        fontSize: '12px',
                        borderLeft: `3px solid ${
                          log.level === 'error' ? '#dc3545' : 
                          log.level === 'warn' ? '#ffc107' : '#28a745'
                        }`
                      }}
                    >
                      <div style={{ color: '#6c757d', marginBottom: '4px' }}>
                        [{log.timestamp}] {log.level.toUpperCase()}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{log.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div>
        <h1>微信环境调试页面</h1>
        <p>当前URL: {window.location.href}</p>
        <p>当前路径: {window.location.pathname}</p>
        <p>当前Hash: {window.location.hash}</p>
        <p>是否微信环境: {isWeChatEnvironment() ? '是' : '否'}</p>
        
        <div style={{ marginTop: '20px' }}>
          <h2>测试功能:</h2>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
            <button
              onClick={testHashRoute}
              style={{ padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              测试当前Hash路由
            </button>
            <button
              onClick={() => testNewsId('123')}
              style={{ padding: '10px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              测试新闻ID: 123
            </button>
            <button
              onClick={() => testNewsId('news_1754498333503_0')}
              style={{ padding: '10px 20px', background: '#ffc107', color: 'black', border: 'none', borderRadius: '4px' }}
            >
              测试真实新闻ID
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              返回首页
            </button>
          </div>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h2>调试信息:</h2>
          <pre style={{ 
            background: '#f8f9fa', 
            padding: '15px', 
            borderRadius: '4px', 
            overflowX: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h2>使用说明:</h2>
          <ul>
            <li>点击右上角"显示控制台"按钮查看实时日志</li>
            <li>使用测试按钮验证不同路由场景</li>
            <li>所有控制台输出都会被捕获并显示</li>
            <li>调试信息包含完整的浏览器环境信息</li>
          </ul>
        </div>
      </div>
    </div>
  );
};