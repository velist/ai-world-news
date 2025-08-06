import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { UpdateNotification } from "@/components/UpdateNotification";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useWeChatEnvironment } from "@/hooks/useWeChatEnvironment";
import Index from "./pages/Index";
import NewsDetailPage from "./pages/NewsDetailPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // 启用微信环境优化
  useWeChatEnvironment();
  
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
