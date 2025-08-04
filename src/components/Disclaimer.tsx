import React from 'react';
import { X, Shield, AlertTriangle, ExternalLink, FileText } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DisclaimerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Disclaimer: React.FC<DisclaimerProps> = ({ isOpen, onClose }) => {
  const { isZh } = useLanguage();

  const disclaimerSections = [
    {
      icon: Shield,
      title: isZh ? '内容来源声明' : 'Content Source Declaration',
      content: isZh ? 
        '本网站所有新闻内容均来源于权威新闻网站的公开API接口，包括但不限于Reuters、Bloomberg、TechCrunch、The Verge等国际知名媒体。我们仅作为信息中转和聚合平台，不对原始内容进行任何修改或编辑。' :
        'All news content on this website is sourced from authoritative news websites through public API interfaces, including but not limited to Reuters, Bloomberg, TechCrunch, The Verge and other internationally renowned media. We serve only as an information relay and aggregation platform without any modification or editing of original content.'
    },
    {
      icon: AlertTriangle,
      title: isZh ? 'AI翻译免责' : 'AI Translation Disclaimer',
      content: isZh ?
        '本网站使用AI技术对英文新闻进行中文翻译，AI翻译可能存在理解偏差、语境错误或专业术语翻译不准确的情况。翻译内容仅供参考，重要信息请以原文为准。我们建议用户在做出重要决策前，务必查阅原始英文报道。' :
        'This website uses AI technology to translate English news into Chinese. AI translation may have understanding deviations, contextual errors, or inaccurate professional terminology translation. Translated content is for reference only, and important information should be based on the original text. We recommend users to consult the original English reports before making important decisions.'
    },
    {
      icon: FileText,
      title: isZh ? '内容准确性声明' : 'Content Accuracy Statement',
      content: isZh ?
        '虽然我们努力确保信息的及时性和准确性，但由于网络传输、API接口延迟、第三方数据源更新等技术因素，内容可能存在延迟或错误。本网站不保证所提供信息的完整性、准确性、可靠性或时效性。' :
        'While we strive to ensure the timeliness and accuracy of information, content may be delayed or contain errors due to technical factors such as network transmission, API interface delays, and third-party data source updates. This website does not guarantee the completeness, accuracy, reliability, or timeliness of the information provided.'
    },
    {
      icon: ExternalLink,
      title: isZh ? '第三方链接责任' : 'Third-party Link Responsibility',
      content: isZh ?
        '本网站包含指向第三方网站的链接，这些链接仅为用户提供便利。我们对这些外部网站的内容、隐私政策、服务条款或其他做法不承担任何责任。用户访问第三方网站时，应自行了解并遵守该网站的相关条款。' :
        'This website contains links to third-party websites, which are provided solely for user convenience. We assume no responsibility for the content, privacy policies, terms of service, or other practices of these external websites. Users should understand and comply with the relevant terms of those websites when accessing third-party sites.'
    }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 头部 */}
        <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="w-6 h-6" />
            <h2 className="text-2xl font-bold">
              {isZh ? '免责声明' : 'Disclaimer'}
            </h2>
          </div>
          
          <p className="text-sm opacity-90">
            {isZh ? '使用本网站前，请仔细阅读以下声明' : 'Please read the following disclaimer carefully before using this website'}
          </p>
        </div>

        {/* 内容区域 */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {/* 重要提示 */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h3 className="font-semibold text-yellow-800">
                {isZh ? '重要提示' : 'Important Notice'}
              </h3>
            </div>
            <p className="text-sm text-yellow-700">
              {isZh ?
                '本网站提供的所有信息仅供参考和教育目的，不构成任何形式的投资建议、法律建议或其他专业建议。用户在使用本网站信息时应谨慎行事，并承担相应风险。' :
                'All information provided on this website is for reference and educational purposes only and does not constitute any form of investment advice, legal advice, or other professional advice. Users should exercise caution when using information from this website and bear corresponding risks.'
              }
            </p>
          </div>

          {/* 免责条款 */}
          <div className="space-y-6">
            {disclaimerSections.map((section, index) => {
              const Icon = section.icon;
              return (
                <div key={index} className="border border-gray-200 rounded-lg p-5">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-shrink-0 p-2 bg-blue-100 rounded-lg">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed ml-11">
                    {section.content}
                  </p>
                </div>
              );
            })}
          </div>

          {/* 联系信息 */}
          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="font-semibold text-gray-900 mb-2">
              {isZh ? '联系我们' : 'Contact Us'}
            </h3>
            <p className="text-sm text-gray-600 mb-3">
              {isZh ?
                '如果您对本免责声明有任何疑问，或者发现内容错误需要纠正，请通过以下方式联系我们：' :
                'If you have any questions about this disclaimer or find content errors that need correction, please contact us through:'
              }
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600">
                {isZh ? '微信：forxy9' : 'WeChat: forxy9'}
              </span>
            </div>
          </div>

          {/* 最后更新时间 */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              {isZh ? '最后更新时间：' : 'Last updated: '}
              {new Date().toLocaleDateString(isZh ? 'zh-CN' : 'en-US')}
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {isZh ? '我已阅读并理解' : 'I have read and understand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};