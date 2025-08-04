import { Sparkles, Globe, Users, Menu } from "lucide-react";
import { useState } from "react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useLanguage } from "@/contexts/LanguageContext";

interface AppHeaderProps {
  onMenuClick: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({ onMenuClick }) => {
  const [showToast, setShowToast] = useState(false);
  const { isZh } = useLanguage();

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText('forxy9');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      // 降级方案：创建临时input元素
      const input = document.createElement('input');
      input.value = 'forxy9';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-hero rounded-b-3xl shadow-large">
      <div className="absolute inset-0 bg-black/10" />
      
      {/* 菜单按钮 - 左上角 */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={onMenuClick}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all duration-200 group"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
      
      {/* 语言切换器 - 右上角 */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>
      
      <div className="relative px-4 py-8 text-center text-white">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="w-6 h-6" />
          <h1 className="text-2xl md:text-3xl font-bold">
            {isZh ? '实时AI新闻推送系统' : 'Real-time AI News System'}
          </h1>
        </div>
        
        <div className="flex items-center justify-center space-x-2 opacity-90 mb-3">
          <Globe className="w-4 h-4" />
          <p className="text-sm md:text-base">
            {isZh ? '国际新闻推送 · AI翻译 · AI点评' : 'Global News · AI Translation · AI Analysis'}
          </p>
        </div>

        {/* AI交流群入口 */}
        <div className="flex items-center justify-center space-x-2">
          <Users className="w-4 h-4" />
          <button 
            onClick={handleCopyWechat}
            className="text-sm hover:text-blue-200 transition-colors underline decoration-dotted underline-offset-2"
          >
            {isZh ? '点击加入AI交流社群，一起成长' : 'Join AI Community for Growth'}
          </button>
        </div>
        
        {/* Toast提示 */}
        {showToast && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-top-2">
            {isZh ? '复制成功，打开微信搜索！' : 'Copied! Search in WeChat!'}
          </div>
        )}
        
        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-1 h-1 bg-white/40 rounded-full animate-pulse delay-300" />
        <div className="absolute bottom-6 right-8 w-1 h-1 bg-white/50 rounded-full animate-pulse delay-700" />
      </div>
    </div>
  );
};