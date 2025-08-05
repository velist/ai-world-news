import React, { useState } from 'react';
import { X, Menu, Newspaper, FileText, MessageCircle, ExternalLink, Rss } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onMenuClick: (item: string) => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onMenuClick }) => {
  const { isZh } = useLanguage();

  const menuItems = [
    {
      id: 'daily-briefing',
      icon: Newspaper,
      label: isZh ? 'AI专题简报' : 'AI Topic Briefing',
      description: isZh ? '实时AI新闻精选' : 'Real-time AI News Selection'
    },
    {
      id: 'rss-subscribe',
      icon: Rss,
      label: isZh ? '邮件订阅' : 'Email Subscribe',
      description: isZh ? '订阅最新AI新闻推送' : 'Subscribe to AI News Updates'
    },
    {
      id: 'disclaimer',
      icon: FileText,
      label: isZh ? '免责声明' : 'Disclaimer',
      description: isZh ? '网站使用条款' : 'Website Terms'
    }
  ];

  return (
    <>
      {/* 遮罩层 */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* 侧边菜单 */}
      <div className={`
        fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* 菜单头部 */}
        <div className="flex items-center justify-between p-6 bg-gradient-hero text-white">
          <div className="flex items-center space-x-2">
            <Menu className="w-5 h-5" />
            <h2 className="text-lg font-semibold">
              {isZh ? '菜单' : 'Menu'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 菜单内容 */}
        <div className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onMenuClick(item.id)}
                className="w-full flex items-center space-x-3 p-4 rounded-lg hover:bg-gray-50 transition-colors text-left group"
              >
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900 group-hover:text-blue-600">
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.description}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </button>
            );
          })}
        </div>

        {/* 菜单底部 */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MessageCircle className="w-4 h-4" />
            <span>
              {isZh ? '有问题请联系我们' : 'Contact us for questions'}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};