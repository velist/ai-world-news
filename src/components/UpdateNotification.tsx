import React from 'react';
import { RefreshCw, X } from 'lucide-react';
import { useVersionCheck } from '@/hooks/useVersionCheck';
import { useLanguage } from '@/contexts/LanguageContext';

export const UpdateNotification: React.FC = () => {
  const { hasUpdate, refreshPage, dismissUpdate } = useVersionCheck();
  const { language } = useLanguage();
  const isZh = language === 'zh';

  if (!hasUpdate) return null;

  return (
    <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 animate-in slide-in-from-top-2">
      <RefreshCw className="w-5 h-5" />
      <span className="text-sm font-medium">
        {isZh ? '发现新版本！点击刷新获取最新内容' : 'New version available! Click to refresh'}
      </span>
      <button
        onClick={refreshPage}
        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded text-sm transition-colors"
      >
        {isZh ? '刷新' : 'Refresh'}
      </button>
      <button
        onClick={dismissUpdate}
        className="hover:bg-white/20 p-1 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};