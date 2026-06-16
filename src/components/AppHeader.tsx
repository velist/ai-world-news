import { Menu } from "lucide-react";
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
    <header className="sticky top-0 z-100" style={{
      background: 'rgba(249, 247, 244, 0.94)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '2px solid hsl(var(--foreground))'
    }}>
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        {/* Left: Menu + Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 transition-colors duration-150 hover:bg-muted md:hidden"
            aria-label="菜单"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-serif font-black tracking-tight" style={{ fontFamily: "'Noto Serif SC', serif" }}>
              AI<span style={{ color: '#C44D34' }}>推</span>
            </span>
            <span className="hidden sm:inline text-[10px] font-mono tracking-widest uppercase text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
              {isZh ? '实时资讯' : 'LIVE NEWS'}
            </span>
          </div>
        </div>

        {/* Right: WeChat + Language */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyWechat}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider uppercase border transition-colors duration-150 hover:bg-foreground hover:text-background"
            style={{
              borderColor: 'hsl(var(--border))',
              fontFamily: "'DM Mono', monospace",
              fontSize: '10px'
            }}
          >
            {isZh ? '加入社群' : 'JOIN'}
          </button>
          <LanguageSwitcher />
        </div>
      </div>

      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 px-4 py-2 shadow-lg z-50 text-sm font-mono"
          style={{
            background: '#C44D34',
            color: 'white',
            fontFamily: "'DM Mono', monospace",
            fontSize: '11px'
          }}
        >
          {isZh ? '微信号 forxy9 已复制，打开微信搜索！' : 'WeChat ID forxy9 copied!'}
        </div>
      )}
    </header>
  );
};