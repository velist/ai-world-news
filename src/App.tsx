import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { UpdateNotification } from "@/components/UpdateNotification";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useWeChatEnvironment } from "@/hooks/useWeChatEnvironment";
import { ErrorBoundary, useGlobalErrorHandler } from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
import Index from "./pages/Index";
import NewsDetailPage from "./pages/NewsDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 启用微信环境优化
  const { isWeChat } = useWeChatEnvironment();
  const [hasError, setHasError] = useState(false);
  
  // 启用全局错误处理
  useGlobalErrorHandler();
  
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
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/news/:id" element={<NewsDetailPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
