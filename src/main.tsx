import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// 微信环境检测
const isWeChat = /micromessenger/i.test(navigator.userAgent);

// Register Service Worker - 但在微信环境中跳过
if ('serviceWorker' in navigator && !isWeChat) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
        
        // 检查更新
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // 新的Service Worker已安装，提示用户刷新
                window.dispatchEvent(new CustomEvent('sw-update-available'));
              }
            });
          }
        });
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
} else if (isWeChat) {
  console.log('微信环境检测到，跳过Service Worker注册');
  
  // 在微信环境中清理可能存在的Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(function(registrations) {
      for(let registration of registrations) {
        registration.unregister().then(function(boolean) {
          console.log('微信环境下注销Service Worker:', boolean);
        });
      }
    });
  }
}

createRoot(document.getElementById("root")!).render(<App />);
