import { Users, Menu } from "lucide-react";
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
    <header className="sticky top-0 z-100 border-b" style={{
      background: 'rgba(253, 251, 249, 0.92)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderColor: 'hsl(var(--border))'
    }}>
      <div className="max-w-[680px] mx-auto px-6 py-5 flex items-center justify-between">
        {/* Left: Menu + Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-full transition-colors duration-200"
            style={{ color: 'hsl(var(--foreground))' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--muted))'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <div className="text-xl font-semibold tracking-wide" style={{ color: 'hsl(var(--foreground))' }}>
              AI推
            </div>
            <div className="text-xs mt-0.5 tracking-wider" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {isZh ? '实时 AI 资讯聚合' : 'Real-time AI News'}
            </div>
          </div>
        </div>

        {/* Right: WeChat + Language + Badge */}
        <div className="flex items-center space-x-3">
          {/* WeChat group button */}
          <button
            onClick={handleCopyWechat}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all duration-200 border"
            style={{
              color: 'hsl(var(--muted-foreground))',
              borderColor: 'hsl(var(--border))',
              background: 'hsl(var(--background))'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'hsl(var(--card))';
              e.currentTarget.style.color = 'hsl(var(--foreground))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'hsl(var(--background))';
              e.currentTarget.style.color = 'hsl(var(--muted-foreground))';
            }}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isZh ? '加入社群' : 'Join'}</span>
          </button>

          {/* Language switcher */}
          <LanguageSwitcher />
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg shadow-lg z-50 text-sm"
          style={{
            background: 'hsl(110 8% 65%)',
            color: 'white'
          }}
        >
          {isZh ? '微信号 forxy9 已复制，打开微信搜索！' : 'WeChat ID forxy9 copied!'}
        </div>
      )}
    </header>
  );
};
