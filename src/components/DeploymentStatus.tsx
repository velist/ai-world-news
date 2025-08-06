import { useState, useEffect } from 'react';

export const DeploymentStatus = () => {
  const [status, setStatus] = useState('checking');
  const [debugAccessible, setDebugAccessible] = useState(false);
  
  useEffect(() => {
    const checkDeployment = async () => {
      try {
        // 检查调试页面是否可访问
        const response = await fetch('/debug', { method: 'HEAD' });
        if (response.ok) {
          setStatus('success');
          setDebugAccessible(true);
        } else {
          setStatus('deploying');
        }
      } catch (error) {
        setStatus('deploying');
      }
    };
    
    checkDeployment();
    // 每30秒检查一次
    const interval = setInterval(checkDeployment, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: '#f8f9fa', 
      padding: '10px', 
      borderRadius: '5px',
      zIndex: 9999,
      fontSize: '12px',
      border: '1px solid #dee2e6'
    }}>
      <strong>🚀 部署状态:</strong>
      {status === 'success' ? (
        <span style={{ color: 'green' }}> ✅ 成功</span>
      ) : (
        <span style={{ color: 'orange' }}> 🔄 部署中...</span>
      )}
      <br />
      <small>
        {debugAccessible ? (
          <span>✅ 调试页面可访问</span>
        ) : (
          <span>⏳ 等待部署完成...</span>
        )}
      </small>
    </div>
  );
};