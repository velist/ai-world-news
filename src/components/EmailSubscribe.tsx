import React, { useState } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface EmailSubscribeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmailSubscribe: React.FC<EmailSubscribeProps> = ({ isOpen, onClose }) => {
  const { isZh } = useLanguage();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      setErrorMessage(isZh ? '请输入有效的邮箱地址' : 'Please enter a valid email address');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      // Brevo MCP API 集成 - 专为 AI 系统优化
      const mcpApiKey = import.meta.env.VITE_BREVO_MCP_API_KEY;
      const listId = import.meta.env.VITE_BREVO_LIST_ID;
      
      if (!mcpApiKey || !listId) {
        throw new Error('Brevo MCP configuration missing');
      }
      
      // 使用 MCP 协议的端点
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'api-key': mcpApiKey,
          'Content-Type': 'application/json',
          'X-MCP-Protocol': 'v1', // MCP 协议标识
          'X-Application': 'AI-News-Website', // 应用标识
        },
        body: JSON.stringify({
          email: email,
          listIds: [parseInt(listId)],
          updateEnabled: true,
          attributes: {
            FNAME: '', // 可选：名字字段
            LNAME: '', // 可选：姓氏字段
            SOURCE: 'AI-News-Website', // 追踪来源
            SUBSCRIBE_DATE: new Date().toISOString(), // 订阅时间
          }
        })
      });

      if (response.ok) {
        setSubmitStatus('success');
        setEmail('');
        
        // 3秒后自动关闭
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
        }, 3000);
      } else {
        const errorData = await response.json();
        if (errorData.code === 'duplicate_parameter') {
          setErrorMessage(isZh ? '该邮箱已经订阅过了' : 'This email is already subscribed');
        } else {
          setErrorMessage(isZh ? '订阅失败，请稍后再试' : 'Subscription failed, please try again later');
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(isZh ? '网络错误，请稍后再试' : 'Network error, please try again later');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRssClick = () => {
    window.open('/rss.xml', '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* 弹窗内容 */}
        <div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 弹窗头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {isZh ? '订阅AI新闻' : 'Subscribe to AI News'}
                </h2>
                <p className="text-sm text-gray-500">
                  {isZh ? '获取最新AI资讯推送' : 'Get latest AI news updates'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* 弹窗内容 */}
          <div className="p-6">
            {submitStatus === 'success' ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {isZh ? '订阅成功！' : 'Subscription Successful!'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {isZh ? '感谢您的订阅，我们会将最新AI新闻发送到您的邮箱。' : 'Thank you for subscribing! We will send the latest AI news to your email.'}
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {isZh ? '关闭' : 'Close'}
                </button>
              </div>
            ) : (
              <>
                {/* 邮箱订阅表单 */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      {isZh ? '邮箱地址' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={isZh ? '请输入您的邮箱地址' : 'Enter your email address'}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  {submitStatus === 'error' && (
                    <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
                      <AlertCircle className="w-5 h-5" />
                      <span className="text-sm">{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isZh ? '订阅中...' : 'Subscribing...'}</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        <span>{isZh ? '立即订阅' : 'Subscribe Now'}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* RSS订阅选项 */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-4">
                      {isZh ? '或者使用RSS阅读器订阅' : 'Or subscribe with RSS reader'}
                    </p>
                    <button
                      onClick={handleRssClick}
                      className="flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.199 24C19.199 13.467 10.533 4.8 0 4.8V0c13.165 0 24 10.835 24 24h-4.801zM3.291 17.415c1.814 0 3.293 1.479 3.293 3.295 0 1.813-1.479 3.29-3.293 3.29-1.814 0-3.292-1.477-3.292-3.29 0-1.816 1.478-3.295 3.292-3.295zM12.906 24c0-6.627-5.373-12-12-12v-2.4c8.159 0 14.4 6.242 14.4 14.4h-2.4z"/>
                      </svg>
                      <span>{isZh ? 'RSS订阅' : 'RSS Feed'}</span>
                    </button>
                  </div>
                </div>

                {/* 订阅说明 */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {isZh ? '订阅须知' : 'Subscription Information'}
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• {isZh ? '每日推送最新AI新闻' : 'Daily latest AI news updates'}</li>
                    <li>• {isZh ? '可以随时取消订阅' : 'Unsubscribe anytime'}</li>
                    <li>• {isZh ? '不会发送垃圾邮件' : 'No spam emails'}</li>
                    <li>• {isZh ? '保护您的隐私' : 'Protect your privacy'}</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};