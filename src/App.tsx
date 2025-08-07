import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { UpdateNotification } from "@/components/UpdateNotification";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useWeChatEnvironment } from "@/hooks/useWeChatEnvironment";
import { ErrorBoundary, useGlobalErrorHandler } from "@/components/ErrorBoundary";
import { WeChatHashRouterHandler } from "@/components/WeChatHashRouterHandler";
import { isWeChatBrowser } from "@/utils/browserDetection";
import { normalizeUrl, extractPathFromQuery, restoreUrlHistory } from "@/utils/urlNormalization";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NewsDetailPage from "./pages/NewsDetailPage";
import NotFound from "./pages/NotFound";
import { WeChatDebugPage } from "./pages/WeChatDebugPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ContactPage from "./pages/ContactPage";
import BlogPage from "./pages/BlogPage";
import BlogArticlePage from "./pages/BlogArticlePage";
import WebsiteIntroPage from "./pages/WebsiteIntroPage";
import GPT5PricingAnalysisPage from "./pages/GPT5PricingAnalysisPage";

const queryClient = new QueryClient();

const App = () => {
  // 启用微信环境优化
  const { isWeChat } = useWeChatEnvironment();
  const [hasError, setHasError] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // 根据环境选择路由器
  const Router = isWeChatBrowser() ? HashRouter : BrowserRouter;
  
  // 启用全局错误处理
  useGlobalErrorHandler();
  
  // URL规范化初始化
  useEffect(() => {
    const initializeApp = () => {
      try {
        // 恢复URL历史记录（仅普通环境）
        if (!isWeChatBrowser()) {
          restoreUrlHistory();
        }
        
        // 规范化URL（仅微信环境，且避免在首页执行）
        if (isWeChatBrowser() && window.location.pathname !== '/') {
          normalizeUrl();
        }
        
        console.log('应用初始化完成:', {
          isWeChat: isWeChatBrowser(),
          currentPath: window.location.pathname,
          currentHash: window.location.hash,
          routerType: isWeChatBrowser() ? 'HashRouter' : 'BrowserRouter'
        });
        
        setIsInitialized(true);
      } catch (error) {
        console.error('应用初始化失败:', error);
        setHasError(true);
      }
    };
    
    // 延迟初始化，确保DOM完全加载
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
      initializeApp();
    }
    
    return () => {
      document.removeEventListener('DOMContentLoaded', initializeApp);
    };
  }, []);
  
  // 微信环境专用错误监控
  useEffect(() => {
    if (isWeChat) {
      const handleError = (event: ErrorEvent) => {
        console.error('微信环境错误:', event.error);
        setHasError(true);
      };
      
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [isWeChat]);
  
  // 显示加载状态
  if (!isInitialized) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">正在初始化应用...</p>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  
  if (hasError) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">页面出现错误</h1>
            <p className="text-gray-600 mb-4">正在为您返回首页...</p>
            <button 
              onClick={() => window.location.href = '/'}
              className="text-blue-500 hover:text-blue-700 underline"
            >
              点击这里返回首页
            </button>
          </div>
        </div>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <UpdateNotification />
              <Router>
                <WeChatHashRouterHandler />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/news/:id" element={<NewsDetailPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogArticlePage />} />
                  <Route path="/website-intro" element={<WebsiteIntroPage />} />
                  <Route path="/debug" element={<WeChatDebugPage />} />
                  <Route path="/gpt5-pricing-analysis" element={<GPT5PricingAnalysisPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
            </TooltipProvider>
          </LanguageProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
