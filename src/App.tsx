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
import { useState, useEffect, Suspense, lazy } from "react";

// 实现路由懒加载 - 关键优化
// const Index = lazy(() => import("./pages/Index"));
// 临时直接导入Index用于调试
import Index from "./pages/Index";
const NewsDetailPage = lazy(() => import("./pages/NewsDetailPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const WeChatDebugPage = lazy(() => import("./pages/WeChatDebugPage"));
const DebugNews = lazy(() => import("./pages/DebugNews"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ServicesPage = lazy(() => import("./pages/ServicesPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogArticlePage = lazy(() => import("./pages/BlogArticlePage"));
const WebsiteIntroPage = lazy(() => import("./pages/WebsiteIntroPage"));
const GPT5PricingAnalysisPage = lazy(() => import("./pages/GPT5PricingAnalysisPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分钟数据新鲜时间
      cacheTime: 10 * 60 * 1000, // 10分钟缓存时间
      retry: 2,
      refetchOnWindowFocus: false, // 减少不必要的重新获取
    },
  },
});

// 加载组件
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
      <p className="text-gray-600">加载中...</p>
    </div>
  </div>
);

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
        <LoadingSpinner />
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
                <Suspense fallback={<LoadingSpinner />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/news/:id" element={<NewsDetailPage />} />
                    <Route path="/bookmarks" element={<BookmarksPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:slug" element={<BlogArticlePage />} />
                    <Route path="/website-intro" element={<WebsiteIntroPage />} />
                    <Route path="/debug" element={<WeChatDebugPage />} />
                    <Route path="/debug-news" element={<DebugNews />} />
                    <Route path="/gpt5-pricing-analysis" element={<GPT5PricingAnalysisPage />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </Router>
            </TooltipProvider>
          </LanguageProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
