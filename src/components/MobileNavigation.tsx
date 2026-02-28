import { Home, Bookmark, Menu } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';

interface MobileNavigationProps {
  onMenuClick?: () => void;
  currentPath?: string;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onMenuClick,
  currentPath: propCurrentPath
}) => {
  const { isZh } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = propCurrentPath || location.pathname;
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      if (currentScrollY < 100) { setIsVisible(true); setLastScrollY(currentScrollY); return; }
      if (currentScrollY > lastScrollY && currentScrollY > 200) setIsVisible(false);
      else if (currentScrollY < lastScrollY) setIsVisible(true);
      scrollTimeoutRef.current = setTimeout(() => setIsVisible(true), 2000);
      setLastScrollY(currentScrollY);
    };

    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) { requestAnimationFrame(() => { handleScroll(); ticking = false; }); ticking = true; }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => { window.removeEventListener('scroll', throttledHandleScroll); if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current); };
  }, [lastScrollY]);

  const navigationItems = [
    { id: 'home', icon: Home, label: isZh ? '首页' : 'Home', path: '/', active: currentPath === '/' },
    { id: 'bookmarks', icon: Bookmark, label: isZh ? '收藏' : 'Saved', path: '/bookmarks', active: currentPath.startsWith('/bookmarks') },
    { id: 'menu', icon: Menu, label: isZh ? '菜单' : 'Menu', path: '/menu', active: false, onClick: onMenuClick }
  ];

  return (
    <>
      <nav
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out md:hidden ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(253, 251, 249, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid #E0D8CF',
          boxShadow: '0 -2px 10px rgba(74, 69, 64, 0.06)'
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick || (() => { if (item.path !== currentPath) navigate(item.path); })}
                className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 min-w-[60px]"
                style={{
                  minHeight: '48px',
                  WebkitTapHighlightColor: 'transparent',
                  color: item.active ? '#4A4540' : '#B0A89E',
                  background: item.active ? 'rgba(74, 69, 64, 0.08)' : 'transparent',
                }}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'stroke-2' : 'stroke-[1.5]'}`} />
                <span className={`text-xs mt-1 ${item.active ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="md:hidden" style={{ height: 'calc(60px + env(safe-area-inset-bottom))', minHeight: '60px' }} />
    </>
  );
};

// 移动端手势提示组件
export const MobileGestureHint: React.FC = () => {
  const { isZh } = useLanguage();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const hasSeenHint = localStorage.getItem('mobile-gesture-hint-seen');
    if (!hasSeenHint && /Mobi|Android/i.test(navigator.userAgent)) {
      setShowHint(true);
      setTimeout(() => { setShowHint(false); localStorage.setItem('mobile-gesture-hint-seen', 'true'); }, 5000);
    }
  }, []);

  if (!showHint) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 md:hidden">
      <div className="rounded-lg p-3 shadow-lg" style={{ background: '#4A4540', color: '#FDFBF9' }}>
        <p className="text-sm text-center">
          {isZh ? '下拉可刷新，向上滑动查看更多新闻' : 'Pull down to refresh, swipe up for more news'}
        </p>
        <button
          onClick={() => { setShowHint(false); localStorage.setItem('mobile-gesture-hint-seen', 'true'); }}
          className="absolute top-1 right-2 opacity-80 hover:opacity-100"
          style={{ color: '#FDFBF9' }}
        >
          x
        </button>
      </div>
    </div>
  );
};
