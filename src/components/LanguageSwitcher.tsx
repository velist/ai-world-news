import { Languages } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all duration-200 group"
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <Languages className="w-4 h-4" />
      <span className="text-sm font-medium">
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </button>
  );
};