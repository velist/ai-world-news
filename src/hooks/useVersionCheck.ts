import { useState, useEffect } from 'react';

interface VersionInfo {
  version: string;
  buildTime: string;
}

export const useVersionCheck = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [currentVersion, setCurrentVersion] = useState<string>('');

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // 获取当前版本信息
        const localVersion = localStorage.getItem('app_version');
        const buildTime = Date.now().toString();
        
        // 检查是否有新的构建版本
        const response = await fetch('/version.json?' + Date.now());
        if (response.ok) {
          const versionInfo: VersionInfo = await response.json();
          
          if (localVersion && localVersion !== versionInfo.version) {
            setHasUpdate(true);
          }
          
          setCurrentVersion(versionInfo.version);
          localStorage.setItem('app_version', versionInfo.version);
        } else {
          // 如果version.json不存在，使用构建时间作为版本
          const version = `build-${buildTime}`;
          if (localVersion && localVersion !== version) {
            setHasUpdate(true);
          }
          setCurrentVersion(version);
          localStorage.setItem('app_version', version);
        }
      } catch (error) {
        console.log('Version check failed:', error);
      }
    };

    // 监听Service Worker更新事件
    const handleSWUpdate = () => {
      setHasUpdate(true);
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    checkVersion();
    
    // 每5分钟检查一次版本更新
    const interval = setInterval(checkVersion, 5 * 60 * 1000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('sw-update-available', handleSWUpdate);
    };
  }, []);

  const refreshPage = () => {
    // 清除所有缓存并刷新页面
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.unregister();
        });
        // 清除所有缓存
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
            window.location.reload();
          });
        } else {
          window.location.reload();
        }
      });
    } else {
      window.location.reload();
    }
  };

  const dismissUpdate = () => {
    setHasUpdate(false);
  };

  return {
    hasUpdate,
    currentVersion,
    refreshPage,
    dismissUpdate
  };
};