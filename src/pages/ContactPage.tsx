import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  Globe,
  Send,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Bug,
  Heart
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ContactPage = () => {
  const { isZh } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'feedback'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', '/contact']);
    }
  }, []);

  const contactMethods = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: isZh ? "官方网站" : "Official Website",
      description: isZh ? "访问我们的官方网站获取最新资讯" : "Visit our official website for latest updates",
      value: "news.aipush.fun",
      action: () => window.open('https://news.aipush.fun', '_blank')
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: isZh ? "在线反馈" : "Online Feedback", 
      description: isZh ? "通过网站表单直接向我们发送反馈" : "Send feedback directly through website form",
      value: isZh ? "即时响应" : "Instant Response",
      action: () => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: isZh ? "服务时间" : "Service Hours",
      description: isZh ? "我们的在线服务时间" : "Our online service hours",
      value: isZh ? "7×24小时" : "24/7 Available",
      action: null
    }
  ];

  const feedbackTypes = [
    {
      value: 'feedback',
      icon: <Heart className="w-4 h-4" />,
      label: isZh ? "用户反馈" : "User Feedback",
      description: isZh ? "分享使用体验和建议" : "Share experience and suggestions"
    },
    {
      value: 'bug',
      icon: <Bug className="w-4 h-4" />,
      label: isZh ? "问题报告" : "Bug Report",
      description: isZh ? "报告网站问题或错误" : "Report website issues or bugs"
    },
    {
      value: 'feature',
      icon: <Lightbulb className="w-4 h-4" />,
      label: isZh ? "功能建议" : "Feature Request",
      description: isZh ? "提出新功能想法" : "Suggest new features"
    },
    {
      value: 'business',
      icon: <Mail className="w-4 h-4" />,
      label: isZh ? "商务合作" : "Business Inquiry",
      description: isZh ? "商务合作或媒体查询" : "Business cooperation or media inquiry"
    }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 基本表单验证
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: isZh ? "表单填写不完整" : "Form Incomplete",
        description: isZh ? "请填写所有必填字段" : "Please fill in all required fields",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: isZh ? "邮箱格式错误" : "Invalid Email",
        description: isZh ? "请输入正确的邮箱地址" : "Please enter a valid email address",
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    // 模拟表单提交（实际项目中应该调用API）
    try {
      // 这里可以集成真实的表单提交服务，如 Formspree、Netlify Forms 等
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: isZh ? "消息发送成功" : "Message Sent Successfully",
        description: isZh ? "感谢您的反馈！我们会尽快回复您。" : "Thank you for your feedback! We'll get back to you soon.",
      });

      // 重置表单
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        type: 'feedback'
      });

      // 统计提交事件
      if (typeof window !== 'undefined' && (window as any)._hmt) {
        (window as any)._hmt.push(['_trackEvent', 'contact', 'submit', formData.type]);
      }

    } catch (error) {
      toast({
        title: isZh ? "发送失败" : "Send Failed",
        description: isZh ? "网络错误，请稍后重试" : "Network error, please try again later",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{isZh ? '联系我们 - AI推' : 'Contact Us - AI Push'}</title>
        <meta 
          name="description" 
          content={isZh 
            ? "联系AI推团队，我们重视每一位用户的意见和建议。提供7×24小时在线服务，快速响应用户反馈、问题报告和商务合作咨询。"
            : "Contact AI Push team. We value every user's feedback and suggestions. 24/7 online service with quick response to user feedback, bug reports, and business inquiries."
          } 
        />
        <meta 
          name="keywords" 
          content={isZh 
            ? "联系我们,AI推,用户反馈,问题报告,商务合作,在线客服,技术支持"
            : "Contact Us,AI Push,User Feedback,Bug Report,Business Inquiry,Online Support,Technical Support"
          } 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={isZh ? '联系我们 - AI推' : 'Contact Us - AI Push'} />
        <meta property="og:description" content={isZh ? "联系AI推团队，7×24小时在线服务" : "Contact AI Push team, 24/7 online service"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://news.aipush.fun/contact" />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        
        {/* Schema.org结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": isZh ? "联系AI推" : "Contact AI Push",
            "description": isZh ? "联系AI推团队获取帮助和支持" : "Contact AI Push team for help and support",
            "url": "https://news.aipush.fun/contact",
            "mainEntity": {
              "@type": "Organization",
              "name": "AI推",
              "url": "https://news.aipush.fun",
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "Customer Service",
                "availableLanguage": ["Chinese", "English"],
                "hoursAvailable": "Mo-Su"
              }
            }
          })}
        </script>
        
        <link rel="canonical" href="https://news.aipush.fun/contact" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="text-sm px-4 py-2">
                {isZh ? "联系我们" : "Contact Us"}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                {isZh ? "我们重视您的声音" : "We Value Your Voice"}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {isZh 
                  ? "您的意见和建议是我们不断改进的动力。无论是使用反馈、问题报告还是商务合作，我们都期待与您沟通。"
                  : "Your opinions and suggestions drive our continuous improvement. Whether it's feedback, bug reports, or business cooperation, we look forward to communicating with you."
                }
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
          {/* Contact Methods */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "联系方式" : "Contact Methods"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "选择最适合您的联系方式，我们随时为您提供帮助"
                  : "Choose the most suitable contact method, we are always here to help"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => (
                <Card 
                  key={index} 
                  className={`p-6 text-center hover:shadow-lg transition-all ${method.action ? 'cursor-pointer' : ''}`}
                  onClick={method.action || undefined}
                >
                  <CardContent className="p-0 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg">
                      {method.icon}
                    </div>
                    <h4 className="font-semibold text-lg">{method.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {method.description}
                    </p>
                    <div className="font-medium text-primary">
                      {method.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div id="contact-form" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "在线反馈" : "Online Feedback"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "填写下面的表单，我们会尽快回复您的消息"
                  : "Fill out the form below and we'll get back to you as soon as possible"
                }
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Form */}
              <Card className="p-6">
                <CardHeader className="p-0 pb-6">
                  <CardTitle className="text-xl">
                    {isZh ? "发送消息" : "Send Message"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Feedback Type */}
                    <div className="space-y-3">
                      <label className="text-sm font-medium">
                        {isZh ? "反馈类型" : "Feedback Type"}
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {feedbackTypes.map((type) => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => handleInputChange('type', type.value)}
                            className={`p-3 text-left rounded-lg border transition-colors ${
                              formData.type === type.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border hover:bg-muted'
                            }`}
                          >
                            <div className="flex items-center space-x-2 mb-1">
                              {type.icon}
                              <span className="font-medium text-sm">{type.label}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {type.description}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium">
                        {isZh ? "姓名" : "Name"} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder={isZh ? "请输入您的姓名" : "Please enter your name"}
                        required
                      />
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="text-sm font-medium">
                        {isZh ? "邮箱地址" : "Email Address"} <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder={isZh ? "请输入您的邮箱地址" : "Please enter your email address"}
                        required
                      />
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        {isZh ? "主题" : "Subject"}
                      </label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => handleInputChange('subject', e.target.value)}
                        placeholder={isZh ? "请简要描述主题" : "Please briefly describe the subject"}
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        {isZh ? "详细内容" : "Message"} <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder={isZh ? "请详细描述您的问题、建议或想法..." : "Please describe your question, suggestion or idea in detail..."}
                        rows={6}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <Button 
                      type="submit" 
                      className="w-full" 
                      size="lg"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {isZh ? "发送中..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {isZh ? "发送消息" : "Send Message"}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* FAQ & Tips */}
              <div className="space-y-6">
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-6 h-6 text-blue-600" />
                      <h4 className="font-semibold text-blue-900">
                        {isZh ? "快速响应承诺" : "Quick Response Promise"}
                      </h4>
                    </div>
                    <p className="text-blue-800 text-sm leading-relaxed">
                      {isZh 
                        ? "我们承诺在24小时内回复所有用户反馈。对于紧急问题，我们会在2小时内给出初步回应。"
                        : "We promise to respond to all user feedback within 24 hours. For urgent issues, we will provide an initial response within 2 hours."
                      }
                    </p>
                  </CardContent>
                </Card>

                <Card className="p-6 bg-green-50 border-green-200">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-green-600" />
                      <h4 className="font-semibold text-green-900">
                        {isZh ? "反馈提示" : "Feedback Tips"}
                      </h4>
                    </div>
                    <ul className="text-green-800 text-sm space-y-2">
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          {isZh 
                            ? "问题报告请尽量提供详细的复现步骤"
                            : "For bug reports, please provide detailed reproduction steps"
                          }
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          {isZh 
                            ? "功能建议请说明具体的使用场景"
                            : "For feature requests, please explain specific use cases"
                          }
                        </span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>
                          {isZh 
                            ? "商务合作请提供详细的合作方案"
                            : "For business inquiries, please provide detailed cooperation plans"
                          }
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="p-6 bg-purple-50 border-purple-200">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-6 h-6 text-purple-600" />
                      <h4 className="font-semibold text-purple-900">
                        {isZh ? "感谢您的支持" : "Thank You for Your Support"}
                      </h4>
                    </div>
                    <p className="text-purple-800 text-sm leading-relaxed">
                      {isZh 
                        ? "您的每一条反馈都是我们前进的动力。让我们一起打造更好的AI资讯平台！"
                        : "Every piece of feedback from you is our driving force. Let's build a better AI news platform together!"
                      }
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactPage;