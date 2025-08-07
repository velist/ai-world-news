import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Rss, 
  Globe2, 
  Smartphone, 
  Filter, 
  Clock, 
  Zap, 
  Languages, 
  Shield,
  Search,
  Bell,
  BarChart3,
  Users
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ServicesPage = () => {
  const { isZh } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', '/services']);
    }
  }, []);

  const mainServices = [
    {
      icon: <Rss className="w-8 h-8" />,
      title: isZh ? "AI新闻聚合" : "AI News Aggregation",
      description: isZh ? "智能聚合全球优质AI新闻资讯，一站式获取最新科技动态" : "Intelligently aggregate global quality AI news for one-stop access to latest tech trends",
      features: [
        isZh ? "全球400+权威媒体源" : "400+ Global Authoritative Sources",
        isZh ? "智能去重与分类" : "Smart Deduplication & Categorization", 
        isZh ? "实时内容更新" : "Real-time Content Updates",
        isZh ? "质量评分算法" : "Quality Scoring Algorithm"
      ],
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      iconBg: "bg-blue-500"
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: isZh ? "智能翻译" : "Smart Translation",
      description: isZh ? "AI驱动的多语言翻译服务，打破语言壁垒，连接全球AI社区" : "AI-powered multilingual translation service connecting global AI community",
      features: [
        isZh ? "支持20+种语言" : "20+ Languages Supported",
        isZh ? "AI专业术语优化" : "AI Terminology Optimization",
        isZh ? "上下文感知翻译" : "Context-Aware Translation",
        isZh ? "文化本土化适配" : "Cultural Localization"
      ],
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200", 
      iconBg: "bg-purple-500"
    },
    {
      icon: <Filter className="w-8 h-8" />,
      title: isZh ? "智能分类推荐" : "Smart Classification",
      description: isZh ? "基于用户兴趣和行为的个性化内容推荐系统" : "Personalized content recommendation based on user interests and behavior",
      features: [
        isZh ? "AI模型新闻分类" : "AI Model News Classification",
        isZh ? "个性化推荐算法" : "Personalized Recommendation",
        isZh ? "用户画像分析" : "User Profile Analysis", 
        isZh ? "兴趣标签管理" : "Interest Tag Management"
      ],
      bgColor: "from-green-50 to-emerald-50",
      borderColor: "border-green-200",
      iconBg: "bg-green-500"
    }
  ];

  const technicalFeatures = [
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: isZh ? "移动端优化" : "Mobile Optimized",
      description: isZh ? "完美适配各种移动设备，支持微信内浏览" : "Perfect adaptation for mobile devices, WeChat browser support"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: isZh ? "极速加载" : "Lightning Fast",
      description: isZh ? "CDN加速，首屏加载时间<2秒" : "CDN acceleration, <2s first screen loading"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: isZh ? "数据安全" : "Data Security", 
      description: isZh ? "企业级安全防护，用户隐私严格保护" : "Enterprise-level security, strict privacy protection"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: isZh ? "智能搜索" : "Smart Search",
      description: isZh ? "AI语义搜索，快速找到相关内容" : "AI semantic search for quick content discovery"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: isZh ? "实时推送" : "Real-time Push", 
      description: isZh ? "重要新闻即时推送，不错过热点" : "Instant push for important news, never miss trends"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: isZh ? "数据分析" : "Data Analytics",
      description: isZh ? "深度数据分析，洞察行业趋势" : "Deep data analysis for industry insights"
    }
  ];

  const usagePlan = [
    {
      name: isZh ? "免费版" : "Free Plan",
      price: isZh ? "免费" : "Free",
      description: isZh ? "适合个人用户日常阅读" : "Perfect for individual daily reading",
      features: [
        isZh ? "每日50篇文章" : "50 articles per day",
        isZh ? "基础分类浏览" : "Basic category browsing", 
        isZh ? "移动端访问" : "Mobile access",
        isZh ? "标准搜索功能" : "Standard search"
      ],
      buttonText: isZh ? "立即使用" : "Start Free",
      popular: false
    },
    {
      name: isZh ? "专业版" : "Pro Plan",
      price: isZh ? "¥29/月" : "$4.99/mo",
      description: isZh ? "适合AI从业者和研究人员" : "Ideal for AI professionals and researchers",
      features: [
        isZh ? "无限文章阅读" : "Unlimited articles",
        isZh ? "高级筛选功能" : "Advanced filtering",
        isZh ? "邮件订阅推送" : "Email subscription",
        isZh ? "优先客服支持" : "Priority support",
        isZh ? "API接口访问" : "API access"
      ],
      buttonText: isZh ? "选择专业版" : "Choose Pro",
      popular: true
    },
    {
      name: isZh ? "企业版" : "Enterprise",
      price: isZh ? "联系咨询" : "Contact",
      description: isZh ? "适合企业团队和机构用户" : "For enterprise teams and institutions", 
      features: [
        isZh ? "定制化内容源" : "Custom content sources",
        isZh ? "私有化部署" : "Private deployment",
        isZh ? "团队协作功能" : "Team collaboration",
        isZh ? "专属客服经理" : "Dedicated account manager",
        isZh ? "数据导出分析" : "Data export & analysis"
      ],
      buttonText: isZh ? "联系销售" : "Contact Sales",
      popular: false
    }
  ];

  return (
    <>
      <Helmet>
        <title>{isZh ? '服务介绍 - AI推' : 'Services - AI Push'}</title>
        <meta 
          name="description" 
          content={isZh 
            ? "AI推提供专业的AI新闻聚合、智能翻译、个性化推荐等服务。支持多语言、移动端优化、实时推送，是AI从业者获取资讯的首选平台。"
            : "AI Push provides professional AI news aggregation, smart translation, personalized recommendation services. Multi-language support, mobile optimization, real-time push - the preferred platform for AI professionals."
          } 
        />
        <meta 
          name="keywords" 
          content={isZh 
            ? "AI新闻聚合,智能翻译,个性化推荐,AI资讯平台,人工智能新闻服务,实时推送,移动端优化"
            : "AI News Aggregation,Smart Translation,Personalized Recommendation,AI News Platform,AI News Service,Real-time Push,Mobile Optimization"
          } 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={isZh ? '服务介绍 - AI推' : 'Services - AI Push'} />
        <meta property="og:description" content={isZh ? "专业的AI新闻聚合服务，智能翻译，个性化推荐" : "Professional AI news aggregation, smart translation, personalized recommendation"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://news.aipush.fun/services" />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        
        {/* Schema.org结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": isZh ? "AI推新闻聚合服务" : "AI Push News Aggregation Service",
            "description": isZh ? "专业的AI新闻聚合、智能翻译、个性化推荐服务" : "Professional AI news aggregation, smart translation, personalized recommendation service",
            "provider": {
              "@type": "Organization", 
              "name": "AI推",
              "url": "https://news.aipush.fun"
            },
            "areaServed": "Worldwide",
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": "https://news.aipush.fun",
              "serviceType": "AI News Service"
            }
          })}
        </script>
        
        <link rel="canonical" href="https://news.aipush.fun/services" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="text-sm px-4 py-2">
                {isZh ? "服务介绍" : "Our Services"}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                {isZh ? "专业AI资讯服务" : "Professional AI News Service"}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {isZh 
                  ? "基于先进AI技术的新闻聚合平台，为您提供个性化、多语言、实时更新的人工智能资讯服务"
                  : "Advanced AI-powered news aggregation platform providing personalized, multilingual, real-time AI information services"
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/')}
                  className="text-lg px-8"
                >
                  {isZh ? "立即体验" : "Try Now"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/about')}
                  className="text-lg px-8"
                >
                  {isZh ? "了解更多" : "Learn More"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
          {/* Main Services */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "核心服务" : "Core Services"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "我们通过创新技术为您提供全面的AI新闻资讯解决方案"
                  : "We provide comprehensive AI news solutions through innovative technology"
                }
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {mainServices.map((service, index) => (
                <Card key={index} className={`p-6 bg-gradient-to-br ${service.bgColor} ${service.borderColor} hover:shadow-lg transition-all`}>
                  <CardHeader className="p-0 pb-6">
                    <div className={`w-16 h-16 ${service.iconBg} text-white rounded-xl flex items-center justify-center mb-4`}>
                      {service.icon}
                    </div>
                    <CardTitle className="text-xl font-bold">
                      {service.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 space-y-4">
                    <p className="text-muted-foreground leading-relaxed">
                      {service.description}
                    </p>
                    <div className="space-y-2">
                      {service.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="text-sm font-medium">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technical Features */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "技术特性" : "Technical Features"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "先进的技术架构确保最佳的用户体验和服务稳定性"
                  : "Advanced technical architecture ensures optimal user experience and service stability"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technicalFeatures.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        {feature.icon}
                      </div>
                      <h4 className="font-semibold text-lg">{feature.title}</h4>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Usage Plans */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "使用方案" : "Usage Plans"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "选择最适合您需求的服务方案，享受专业的AI资讯服务"
                  : "Choose the service plan that best fits your needs and enjoy professional AI news service"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {usagePlan.map((plan, index) => (
                <Card key={index} className={`p-6 relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1">
                        {isZh ? "推荐" : "Popular"}
                      </Badge>
                    </div>
                  )}
                  
                  <CardContent className="p-0 space-y-6">
                    <div className="text-center space-y-2">
                      <h4 className="font-bold text-xl">{plan.name}</h4>
                      <div className="text-3xl font-bold text-primary">{plan.price}</div>
                      <p className="text-muted-foreground text-sm">{plan.description}</p>
                    </div>

                    <div className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                      onClick={() => {
                        if (plan.name.includes('免费') || plan.name.includes('Free')) {
                          navigate('/');
                        } else {
                          navigate('/contact');
                        }
                      }}
                    >
                      {plan.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">
                {isZh ? "开始使用AI推" : "Start Using AI Push"}
              </h2>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "立即体验专业的AI新闻资讯服务，让您时刻掌握人工智能发展动态"
                  : "Experience professional AI news service now and stay updated with AI development trends"
                }
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {isZh ? "已有 10,000+ 用户信赖" : "Trusted by 10,000+ Users"}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">
                    {isZh ? "7×24小时服务" : "24/7 Service"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/')}
                  className="text-lg px-8"
                >
                  {isZh ? "免费开始使用" : "Start Free Trial"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/contact')}
                  className="text-lg px-8"
                >
                  {isZh ? "联系我们" : "Contact Us"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;