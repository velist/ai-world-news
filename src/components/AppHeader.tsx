import { Sparkles, Globe } from "lucide-react";

export const AppHeader = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-b-3xl shadow-large">
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative px-4 py-8 text-center text-white">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-bold">
            实时AI新闻推送系统
          </h1>
        </div>
        
        <div className="flex items-center justify-center space-x-2 opacity-90">
          <Globe className="w-4 h-4" />
          <p className="text-sm md:text-base">
            国际新闻推送 · AI翻译 · AI点评
          </p>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-2 h-2 bg-white/30 rounded-full animate-pulse" />
        <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-6 left-8 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-700" />
      </div>
    </div>
  );
};