import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

/**
 * 微信环境专用错误边界组件
 * 处理React组件错误，提供友好的错误恢复界面
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // 微信环境专用错误日志
    if (/micromessenger/i.test(navigator.userAgent)) {
      console.error('微信环境错误详情:', {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  isWeChatEnvironment = () => {
    return /micromessenger/i.test(navigator.userAgent);
  };

  isZhLanguage = () => {
    // 简单的语言检测，不使用hook
    const lang = navigator.language || 'zh-CN';
    return lang.startsWith('zh');
  };

  render() {
    const isZh = this.isZhLanguage();
    
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="text-center max-w-md mx-auto">
            <div className="text-6xl mb-4">😅</div>
            <h1 className="text-2xl font-bold mb-4 text-foreground">
              {isZh ? '页面遇到一点小问题' : 'Oops! Something went wrong'}
            </h1>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {isZh 
                ? '页面加载出现了异常，不过别担心，我们正在为您返回首页'
                : 'The page encountered an error, but don\'t worry, we\'ll take you back home'
              }
            </p>
            
            {this.isWeChatEnvironment() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  {isZh 
                    ? '💡 微信环境提示：如果问题持续，请尝试清除微信缓存或重新打开'
                    : '💡 WeChat tip: If the problem persists, try clearing WeChat cache or reopen'
                  }
                </p>
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                {isZh ? '返回首页' : 'Back to Home'}
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              >
                {isZh ? '重新加载页面' : 'Reload Page'}
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  {isZh ? '错误详情 (开发模式)' : 'Error Details (Dev Mode)'}
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto text-red-600">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 全局错误处理Hook
 * 用于捕获未处理的JavaScript错误
 */
export const useGlobalErrorHandler = () => {
  const isZh = navigator.language.startsWith('zh');
  
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // 微信环境专用错误处理
      if (/micromessenger/i.test(navigator.userAgent)) {
        console.error('微信环境全局错误:', {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          timestamp: new Date().toISOString()
        });
        
        // 3秒后自动跳转到首页
        setTimeout(() => {
          if (window.location.pathname !== '/') {
            console.log('微信环境错误，自动跳转到首页');
            window.location.href = '/';
          }
        }, 3000);
      }
    };
    
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // 微信环境专用Promise错误处理
      if (/micromessenger/i.test(navigator.userAgent)) {
        console.error('微信环境Promise错误:', {
          reason: event.reason,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isZh]);
};