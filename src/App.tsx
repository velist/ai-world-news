import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { UpdateNotification } from "@/components/UpdateNotification";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NewsDetailPage from "./pages/NewsDetailPage";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

// 微信环境检测和优化
const useWeChatOptimization = () => {
  useEffect(() => {
    const isWeChat = /micromessenger/i.test(navigator.userAgent);
    
    if (isWeChat) {
      console.log('检测到微信环境，启用微信优化');
      
      // 禁用Service Worker在微信环境中可能导致的问题
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          for(let registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // 微信环境下强制刷新缓存
      if (window.performance && window.performance.navigation.type === 1) {
        // 页面是通过刷新加载的
        const timestamp = Date.now();
        const currentUrl = new URL(window.location.href);
        if (!currentUrl.searchParams.has('_wechat_refresh')) {
          currentUrl.searchParams.set('_wechat_refresh', timestamp.toString());
          window.location.replace(currentUrl.toString());
        }
      }
      
      // 微信分享优化 - 确保页面正确加载
      document.addEventListener('WeixinJSBridgeReady', function() {
        console.log('微信JS-SDK已就绪');
      });
      
      // 处理微信返回按钮
      window.addEventListener('popstate', function(e) {
        console.log('微信环境popstate事件', e.state);
        // 强制刷新确保内容正确显示
        setTimeout(() => {
          if (!document.body.innerHTML.trim()) {
            window.location.reload();
          }
        }, 100);
      });
    }
  }, []);
};

const App = () => {
  useWeChatOptimization();
  
  return (
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
  );
};

export default App;
