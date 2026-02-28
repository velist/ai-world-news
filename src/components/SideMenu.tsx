import React from 'react';
import { X, Menu, Newspaper, FileText, MessageCircle, ExternalLink, BookOpen, Info, Settings, Mail, Home } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuClick: (item: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onMenuClick }) => {
  const { isZh } = useLanguage();
  const navigate = useNavigate();

  const navigationItems = [
    { id: 'home', icon: Home, label: isZh ? '首页' : 'Home', description: isZh ? '返回新闻主页' : 'Back to news home', path: '/', isExternal: false },
    { id: 'blog', icon: BookOpen, label: isZh ? 'AI博客' : 'AI Blog', description: isZh ? '深度AI技术解读' : 'In-depth AI analysis', path: '/blog', isExternal: false },
    { id: 'about', icon: Info, label: isZh ? '关于我们' : 'About Us', description: isZh ? '了解AI推团队' : 'Learn about AI Push', path: '/about', isExternal: false },
    { id: 'services', icon: Settings, label: isZh ? '服务介绍' : 'Services', description: isZh ? '我们提供的服务' : 'Services we provide', path: '/services', isExternal: false },
    { id: 'contact', icon: Mail, label: isZh ? '联系我们' : 'Contact Us', description: isZh ? '获取帮助和支持' : 'Get help and support', path: '/contact', isExternal: false }
  ];

  const menuItems = [
    { id: 'daily-briefing', icon: Newspaper, label: isZh ? 'AI专题简报' : 'AI Topic Briefing', description: isZh ? '实时AI新闻精选' : 'Real-time AI News Selection', isExternal: true },
    { id: 'disclaimer', icon: FileText, label: isZh ? '免责声明' : 'Disclaimer', description: isZh ? '网站使用条款' : 'Website Terms', isExternal: true }
  ];

  const handleItemClick = (item: any) => {
    if (item.isExternal) {
      onMenuClick(item.id);
    } else {
      navigate(item.path);
      onClose();
    }
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(74, 69, 64, 0.4)' }}
          onClick={onClose}
        />
      )}

      {/* Side panel */}
      <div
        className="fixed top-0 left-0 h-full w-80 z-50 transform transition-transform duration-300 ease-in-out"
        style={{
          background: '#FDFBF9',
          boxShadow: isOpen ? '4px 0 24px rgba(74, 69, 64, 0.12)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6" style={{ background: '#4A4540', color: '#FDFBF9' }}>
          <div className="flex items-center space-x-2">
            <Menu className="w-5 h-5" />
            <h2 className="text-lg font-semibold">{isZh ? '菜单' : 'Menu'}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full transition-colors" style={{ color: '#FDFBF9' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Navigation */}
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide px-2 mb-3" style={{ color: '#B0A89E' }}>
              {isZh ? '网站导航' : 'Navigation'}
            </div>
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group"
                  onMouseEnter={(e) => e.currentTarget.style.background = '#EDE7E0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#8A837A' }} />
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: '#4A4540' }}>{item.label}</div>
                    <div className="text-sm" style={{ color: '#B0A89E' }}>{item.description}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: '1px solid #E8E2DA' }} />

          {/* Features */}
          <div className="space-y-1">
            <div className="text-xs font-medium uppercase tracking-wide px-2 mb-3" style={{ color: '#B0A89E' }}>
              {isZh ? '功能菜单' : 'Features'}
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg transition-colors text-left group"
                  onMouseEnter={(e) => e.currentTarget.style.background = '#EDE7E0'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" style={{ color: '#8A837A' }} />
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: '#4A4540' }}>{item.label}</div>
                    <div className="text-sm" style={{ color: '#B0A89E' }}>{item.description}</div>
                  </div>
                  <ExternalLink className="w-4 h-4" style={{ color: '#B0A89E' }} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4" style={{ borderTop: '1px solid #E8E2DA' }}>
          <div className="flex items-center space-x-2 text-sm" style={{ color: '#B0A89E' }}>
            <MessageCircle className="w-4 h-4" />
            <span>{isZh ? '有问题请联系我们' : 'Contact us for questions'}</span>
          </div>
        </div>
      </div>
    </>
  );
};
