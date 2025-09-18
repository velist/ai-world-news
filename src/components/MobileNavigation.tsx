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

  // 监听滚动，智能隐藏/显示导航栏
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 如果滚动距离很小，不隐藏导航栏
      if (currentScrollY < 100) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // 向下滚动隐藏，向上滚动显示
      if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }

      // 停止滚动后显示导航栏
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      setLastScrollY(currentScrollY);
    };

    // 使用节流优化性能
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [lastScrollY]);

  const navigationItems = [
    {
      id: 'home',
      icon: Home,
      label: isZh ? '首页' : 'Home',
      path: '/',
      active: currentPath === '/'
    },
    {
    },
    {
      id: 'bookmarks',
      icon: Bookmark,
      label: isZh ? '收藏' : 'Saved',
      path: '/bookmarks',
      active: currentPath.startsWith('/bookmarks')
    },
    {
      id: 'menu',
      icon: Menu,
      label: isZh ? '菜单' : 'Menu',
      path: '/menu',
      active: false,
      onClick: onMenuClick
    }
  ];

  return (
    <>
      {/* 底部导航栏 */}
      <nav 
        className={`
          fixed bottom-0 left-0 right-0 z-50
          bg-background/95 backdrop-blur-md border-t border-border
          transition-transform duration-300 ease-in-out
          ${isVisible ? 'translate-y-0' : 'translate-y-full'}
          md:hidden
        `}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          background: 'rgba(255, 255, 255, 0.95)',
          boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.onClick || (() => {
                  if (item.path !== currentPath) {
                    navigate(item.path);
                  }
                })}
                className={`
                  flex flex-col items-center justify-center
                  px-3 py-2 rounded-lg
                  transition-all duration-200 ease-in-out
                  min-w-[60px] touch-manipulation
                  ${item.active 
                    ? 'text-primary bg-primary/10 scale-105' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }
                `}
                style={{
                  // 优化触摸目标大小
                  minHeight: '48px',
                  WebkitTapHighlightColor: 'transparent'
                }}
              >
                <Icon className={`w-5 h-5 ${item.active ? 'stroke-2' : 'stroke-1.5'}`} />
                <span className={`text-xs mt-1 font-medium ${item.active ? 'font-semibold' : ''}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 底部安全区域占位 */}
      <div 
        className="md:hidden"
        style={{ 
          height: 'calc(60px + env(safe-area-inset-bottom))',
          minHeight: '60px'
        }}
      />
    </>
  );
};

// 移动端手势提示组件
export const MobileGestureHint: React.FC = () => {
  const { isZh } = useLanguage();
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    // 检查是否是第一次访问
    const hasSeenHint = localStorage.getItem('mobile-gesture-hint-seen');
    if (!hasSeenHint && /Mobi|Android/i.test(navigator.userAgent)) {
      setShowHint(true);
      // 5秒后自动隐藏
      setTimeout(() => {
        setShowHint(false);
        localStorage.setItem('mobile-gesture-hint-seen', 'true');
      }, 5000);
    }
  }, []);

  if (!showHint) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-50 md:hidden">
      <div className="bg-primary text-primary-foreground rounded-lg p-3 shadow-lg animate-slide-down">
        <p className="text-sm text-center">
          {isZh ? '📱 下拉可刷新，向上滑动查看更多新闻' : '📱 Pull down to refresh, swipe up for more news'}
        </p>
        <button
          onClick={() => {
            setShowHint(false);
            localStorage.setItem('mobile-gesture-hint-seen', 'true');
          }}
          className="absolute top-1 right-2 text-primary-foreground/80 hover:text-primary-foreground"
        >
          ×
        </button>
      </div>
    </div>
  );
};

