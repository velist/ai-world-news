import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full transition-all duration-200 border"
      style={{
        color: 'hsl(var(--muted-foreground))',
        borderColor: 'hsl(var(--border))',
        background: 'hsl(var(--background))'
      }}
      title={language === 'zh' ? 'Switch to English' : '切换到中文'}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'hsl(var(--card))';
        e.currentTarget.style.color = 'hsl(var(--foreground))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'hsl(var(--background))';
        e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
      }}
    >
      <Languages className="w-3.5 h-3.5" />
      <span className="text-xs font-medium">
        {language === 'zh' ? 'EN' : '中'}
      </span>
    </button>
  );
};
