import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Globe, 
  Zap, 
  Shield,
  Users,
  BookOpen,
  Smartphone,
  Languages,
  BarChart3,
  ExternalLink,
  Heart,
  Star
} from 'lucide-react';

const WebsiteIntroPage = () => {
  const { isZh } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', '/website-intro']);
    }
  }, []);

  const handleBack = () => {
    navigate('/blog');
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: isZh ? "AI智能聚合" : "AI Smart Aggregation",
      description: isZh ? "使用先进AI算法自动聚合全球优质AI新闻资讯" : "Advanced AI algorithms automatically aggregate global quality AI news"
    },
    {
      icon: <Languages className="w-6 h-6" />,
      title: isZh ? "智能翻译" : "Smart Translation",
      description: isZh ? "AI驱动的多语言翻译，中英文无缝切换" : "AI-powered multilingual translation, seamless Chinese-English switching"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: isZh ? "实时更新" : "Real-time Updates",
      description: isZh ? "7×24小时持续监控，第一时间推送最新资讯" : "24/7 continuous monitoring, first-time push of latest information"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: isZh ? "可信来源" : "Trusted Sources",
      description: isZh ? "精选400+权威媒体源，确保信息准确可靠" : "Curated 400+ authoritative sources, ensuring accurate and reliable information"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: isZh ? "移动优化" : "Mobile Optimized",
      description: isZh ? "完美适配移动设备，支持微信内浏览分享" : "Perfect mobile adaptation, supports WeChat browsing and sharing"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: isZh ? "数据分析" : "Data Analytics",
      description: isZh ? "深度数据分析，洞察AI行业发展趋势" : "Deep data analysis, insights into AI industry trends"
    }
  ];

  const stats = [
    { number: "400+", label: isZh ? "权威媒体源" : "Media Sources" },
    { number: "10K+", label: isZh ? "日活用户" : "Daily Users" },
    { number: "20+", label: isZh ? "支持语言" : "Languages" },
    { number: "24h", label: isZh ? "实时更新" : "Real-time" }
  ];

  return (
    <>
      <Helmet>
        <title>{isZh ? 'AI推网站介绍 - 专业的人工智能新闻资讯平台' : 'AI Push Website Introduction - Professional AI News Platform'}</title>
        <meta 
          name="description" 
          content={isZh 
            ? "AI推(news.aipush.fun)是专业的人工智能新闻资讯平台。我们使用先进AI技术聚合全球优质内容，提供实时更新、智能翻译、多语言支持等服务。为AI从业者、研究人员和技术爱好者提供最新的人工智能资讯。"
            : "AI Push (news.aipush.fun) is a professional artificial intelligence news platform. We use advanced AI technology to aggregate global quality content, providing real-time updates, smart translation, and multilingual support for AI professionals, researchers, and tech enthusiasts."
          } 
        />
        <meta 
          name="keywords" 
          content={isZh 
            ? "AI推,人工智能新闻,AI新闻平台,智能聚合,实时更新,AI资讯,机器学习新闻,深度学习资讯,ChatGPT新闻,OpenAI新闻"
            : "AI Push,Artificial Intelligence News,AI News Platform,Smart Aggregation,Real-time Updates,AI Information,Machine Learning News,Deep Learning News,ChatGPT News,OpenAI News"
          } 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={isZh ? 'AI推网站介绍 - 专业的人工智能新闻资讯平台' : 'AI Push Website Introduction - Professional AI News Platform'} />
        <meta property="og:description" content={isZh ? "了解AI推平台的核心功能、技术特色和服务优势" : "Learn about AI Push platform features, technology, and service advantages"} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content="https://news.aipush.fun/website-intro" />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": isZh ? "AI推网站介绍" : "AI Push Website Introduction",
            "description": isZh ? "专业的人工智能新闻资讯平台介绍" : "Professional AI news platform introduction",
            "author": {
              "@type": "Organization",
              "name": "AI推编辑部"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI推",
              "url": "https://news.aipush.fun"
            },
            "datePublished": "2025-08-07",
            "url": "https://news.aipush.fun/website-intro",
            "mainEntityOfPage": "https://news.aipush.fun/website-intro"
          })}
        </script>
        
        <link rel="canonical" href="https://news.aipush.fun/website-intro" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{isZh ? '返回博客' : 'Back to Blog'}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
            <Badge variant="outline" className="text-sm px-4 py-2">
              <BookOpen className="w-4 h-4 mr-2" />
              {isZh ? "网站介绍" : "Website Introduction"}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
              {isZh ? "AI推：让AI资讯触手可及" : "AI Push: Making AI News Accessible"}
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {isZh 
                ? "AI推致力于成为全球领先的人工智能新闻资讯平台，通过先进的AI技术为用户提供最新、准确、有价值的AI科技资讯。"
                : "AI Push is committed to becoming the world's leading artificial intelligence news platform, providing the latest, accurate, and valuable AI technology information through advanced AI technology."
              }
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/')}
                className="text-lg px-8"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
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

        <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
          {/* Platform Overview */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              {isZh ? "平台概览" : "Platform Overview"}
            </h2>
            
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-0 space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full mb-4">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-4">
                    {isZh ? "什么是AI推？" : "What is AI Push?"}
                  </h3>
                </div>
                
                <p className="text-blue-800 leading-relaxed text-lg">
                  {isZh 
                    ? "AI推(news.aipush.fun)是一个专业的人工智能新闻资讯平台，我们使用先进的AI技术自动聚合、翻译和分析全球AI相关新闻。平台致力于为AI从业者、研究人员、投资人和技术爱好者提供最及时、准确、有价值的人工智能资讯。"
                    : "AI Push (news.aipush.fun) is a professional artificial intelligence news platform. We use advanced AI technology to automatically aggregate, translate, and analyze global AI-related news. The platform is dedicated to providing the most timely, accurate, and valuable AI information for AI professionals, researchers, investors, and tech enthusiasts."
                  }
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 mt-8">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-900">
                      {isZh ? "核心优势" : "Core Advantages"}
                    </h4>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-start space-x-2">
                        <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{isZh ? "AI驱动的智能内容聚合" : "AI-driven smart content aggregation"}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{isZh ? "实时多语言翻译服务" : "Real-time multilingual translation"}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Star className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{isZh ? "专业的AI内容分析和点评" : "Professional AI content analysis"}</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-blue-900">
                      {isZh ? "服务对象" : "Target Users"}
                    </h4>
                    <ul className="space-y-2 text-blue-800">
                      <li className="flex items-start space-x-2">
                        <Users className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{isZh ? "AI从业者和研究人员" : "AI professionals and researchers"}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Users className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{isZh ? "科技媒体和投资人" : "Tech media and investors"}</span>
                      </li>
                      <li className="flex items-start space-x-2">
                        <Users className="w-4 h-4 mt-0.5 text-blue-600" />
                        <span>{isZh ? "技术爱好者和学习者" : "Tech enthusiasts and learners"}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Key Features */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "核心功能" : "Key Features"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "AI推通过创新技术和专业服务，为用户提供卓越的AI资讯体验"
                  : "AI Push provides exceptional AI information experience through innovative technology and professional services"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 text-primary rounded-lg">
                      {feature.icon}
                    </div>
                    <h4 className="font-semibold text-lg">{feature.title}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Platform Stats */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              {isZh ? "平台数据" : "Platform Statistics"}
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <Card key={index} className="p-6 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
                  <CardContent className="p-0 space-y-2">
                    <div className="text-3xl font-bold text-primary">{stat.number}</div>
                    <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Technology Stack */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              {isZh ? "技术架构" : "Technology Stack"}
            </h2>
            
            <Card className="p-8">
              <CardContent className="p-0 space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center space-x-2">
                      <Zap className="w-5 h-5 text-primary" />
                      <span>{isZh ? "前端技术" : "Frontend Technology"}</span>
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• React 18 + TypeScript</li>
                      <li>• Vite + SWC 快速构建</li>
                      <li>• Tailwind CSS 响应式设计</li>
                      <li>• React Router 路由管理</li>
                      <li>• React Helmet 异步SEO优化</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      <span>{isZh ? "AI技术" : "AI Technology"}</span>
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• 智能内容聚合算法</li>
                      <li>• 多语言翻译引擎</li>
                      <li>• 内容质量评估系统</li>
                      <li>• 个性化推荐算法</li>
                      <li>• 实时数据分析</li>
                    </ul>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center space-x-2">
                      <Shield className="w-5 h-5 text-primary" />
                      <span>{isZh ? "安全与性能" : "Security & Performance"}</span>
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• CDN全球加速</li>
                      <li>• HTTPS安全传输</li>
                      <li>• 数据加密保护</li>
                      <li>• 防DDoS攻击</li>
                      <li>• 实时监控告警</li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center space-x-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <span>{isZh ? "移动端优化" : "Mobile Optimization"}</span>
                    </h4>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• PWA渐进式应用</li>
                      <li>• 微信浏览器适配</li>
                      <li>• 触摸友好界面</li>
                      <li>• 离线阅读支持</li>
                      <li>• 社交分享优化</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Why Choose AI Push */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold text-center">
              {isZh ? "为什么选择AI推？" : "Why Choose AI Push?"}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 text-center bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-0 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 text-white rounded-lg">
                    <Heart className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-green-900">
                    {isZh ? "专业专注" : "Professional Focus"}
                  </h4>
                  <p className="text-green-800 text-sm leading-relaxed">
                    {isZh 
                      ? "专注AI领域，深度挖掘有价值的技术资讯和行业动态"
                      : "Focused on AI field, deeply exploring valuable tech news and industry trends"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-0 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500 text-white rounded-lg">
                    <Zap className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-purple-900">
                    {isZh ? "智能高效" : "Smart & Efficient"}
                  </h4>
                  <p className="text-purple-800 text-sm leading-relaxed">
                    {isZh 
                      ? "AI技术驱动，自动化处理海量信息，提供精准筛选"
                      : "AI-driven technology, automated processing of massive information with precise filtering"
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="p-6 text-center bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                <CardContent className="p-0 space-y-4">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-500 text-white rounded-lg">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-lg text-orange-900">
                    {isZh ? "用户至上" : "User-Centric"}
                  </h4>
                  <p className="text-orange-800 text-sm leading-relaxed">
                    {isZh 
                      ? "以用户需求为导向，持续优化产品体验和服务质量"
                      : "User-oriented approach, continuously optimizing product experience and service quality"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Call to Action */}
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

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/')}
                  className="text-lg px-8"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {isZh ? "免费开始使用" : "Start Free Trial"}
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate('/services')}
                  className="text-lg px-8"
                >
                  {isZh ? "查看服务介绍" : "View Services"}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                {isZh 
                  ? "感谢您选择AI推，让我们一起探索人工智能的无限可能！"
                  : "Thank you for choosing AI Push. Let's explore the infinite possibilities of AI together!"
                }
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebsiteIntroPage;