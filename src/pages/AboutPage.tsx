import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import { Bot, Target, Users, Zap, Globe, Shield, Clock, Award } from 'lucide-react';

const AboutPage = () => {
  const { isZh } = useLanguage();

  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', '/about']);
    }
  }, []);

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: isZh ? "智能聚合" : "AI Aggregation",
      description: isZh ? "使用先进AI算法聚合全球优质AI新闻资讯" : "Advanced AI algorithms aggregate global quality AI news"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: isZh ? "多语言支持" : "Multi-language",
      description: isZh ? "智能翻译技术，打破语言壁垒，服务全球用户" : "Smart translation breaks language barriers, serving global users"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: isZh ? "实时更新" : "Real-time Updates",
      description: isZh ? "7x24小时持续监控，确保最新资讯即时送达" : "24/7 continuous monitoring for instant news delivery"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: isZh ? "可信来源" : "Trusted Sources",
      description: isZh ? "精选权威媒体来源，确保信息准确性和可靠性" : "Curated authoritative sources ensure accuracy and reliability"
    }
  ];

  const milestones = [
    {
      year: "2024年12月",
      title: isZh ? "平台启动" : "Platform Launch",
      description: isZh ? "AI推新闻平台正式上线，开始为用户提供AI资讯服务" : "AI Push platform officially launched"
    },
    {
      year: "2025年1月",
      title: isZh ? "功能升级" : "Feature Upgrade",
      description: isZh ? "新增微信适配、多语言翻译等核心功能" : "Added WeChat compatibility and multi-language translation"
    },
    {
      year: "2025年8月",
      title: isZh ? "用户突破" : "User Milestone",
      description: isZh ? "注册用户突破10,000名，日活跃用户超过3,000" : "Over 10,000 registered users, 3,000+ daily active users"
    }
  ];

  const teamValues = [
    {
      icon: <Target className="w-5 h-5" />,
      title: isZh ? "专业专注" : "Professional Focus",
      description: isZh ? "专注AI领域，提供最专业的新闻资讯服务" : "Focused on AI field with professional news service"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: isZh ? "用户至上" : "User-Centric",
      description: isZh ? "以用户需求为导向，持续优化产品体验" : "User-driven approach with continuous product optimization"
    },
    {
      icon: <Award className="w-5 h-5" />,
      title: isZh ? "创新进取" : "Innovation",
      description: isZh ? "拥抱新技术，不断创新产品功能和服务模式" : "Embracing new technologies with continuous innovation"
    }
  ];

  return (
    <>
      <Helmet>
        <title>{isZh ? '关于我们 - AI推' : 'About Us - AI Push'}</title>
        <meta 
          name="description" 
          content={isZh 
            ? "AI推是专业的人工智能新闻资讯平台，致力于为用户提供最新、准确的AI科技新闻。我们使用智能算法聚合全球优质内容，支持多语言翻译，让您随时掌握AI发展动态。"
            : "AI Push is a professional artificial intelligence news platform dedicated to providing users with the latest and accurate AI technology news. We use intelligent algorithms to aggregate global quality content with multi-language support."
          } 
        />
        <meta 
          name="keywords" 
          content={isZh 
            ? "AI推,关于我们,人工智能新闻,AI资讯平台,团队介绍,公司简介,AI科技媒体"
            : "AI Push,About Us,Artificial Intelligence News,AI News Platform,Team Introduction,Company Profile"
          } 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={isZh ? '关于我们 - AI推' : 'About Us - AI Push'} />
        <meta property="og:description" content={isZh ? "了解AI推团队和我们的使命：为全球用户提供最优质的AI新闻资讯服务" : "Learn about AI Push team and our mission to provide quality AI news service"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://news.aipush.fun/about" />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        
        {/* Schema.org结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "AboutPage",
            "name": isZh ? "关于AI推" : "About AI Push",
            "description": isZh ? "AI推是专业的人工智能新闻资讯平台" : "AI Push is a professional AI news platform",
            "url": "https://news.aipush.fun/about",
            "mainEntity": {
              "@type": "Organization",
              "name": "AI推",
              "alternateName": "AI Push",
              "url": "https://news.aipush.fun",
              "description": isZh ? "专业的AI新闻资讯平台，实时推送人工智能科技新闻" : "Professional AI news platform providing real-time AI technology news",
              "foundingDate": "2024-12",
              "areaServed": "Worldwide",
              "knowsAbout": ["Artificial Intelligence", "Machine Learning", "AI News", "Technology"],
              "sameAs": [
                "https://news.aipush.fun"
              ]
            }
          })}
        </script>
        
        <link rel="canonical" href="https://news.aipush.fun/about" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="text-sm px-4 py-2">
                {isZh ? "关于我们" : "About Us"}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                {isZh ? "让AI资讯触手可及" : "Making AI News Accessible"}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {isZh 
                  ? "AI推致力于成为全球领先的人工智能新闻资讯平台，通过智能聚合技术为用户提供最新、准确、有价值的AI科技资讯。"
                  : "AI Push is committed to becoming the world's leading artificial intelligence news platform, providing the latest, accurate, and valuable AI technology information through intelligent aggregation technology."
                }
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isZh ? "我们的使命" : "Our Mission"}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {isZh 
                    ? "通过先进的人工智能技术，打造全球最优质的AI新闻资讯平台，让每个用户都能轻松获取最新的AI科技动态，促进人工智能知识的普及和发展。"
                    : "Through advanced artificial intelligence technology, we create the world's highest quality AI news platform, enabling every user to easily access the latest AI technology trends and promote the popularization and development of AI knowledge."
                  }
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <CardContent className="p-0 space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {isZh ? "我们的愿景" : "Our Vision"}
                  </h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {isZh 
                    ? "成为连接全球AI社区的重要桥梁，让AI新闻资讯无国界、无语言障碍，推动人工智能技术在全球范围内的交流与合作。"
                    : "To become an important bridge connecting the global AI community, making AI news borderless and language-barrier-free, and promoting global exchange and cooperation in AI technology."
                  }
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Core Features */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "核心特色" : "Core Features"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "我们通过创新技术和专业团队，为用户提供卓越的AI新闻资讯服务体验"
                  : "We provide exceptional AI news service experience through innovative technology and professional team"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
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

          {/* Development Milestones */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "发展历程" : "Development Milestones"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "见证AI推从创立到成长的每一个重要时刻"
                  : "Witness every important moment from AI Push's founding to growth"
                }
              </p>
            </div>

            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-4 h-4 bg-primary rounded-full mt-2"></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {milestone.year}
                      </Badge>
                      <h4 className="font-semibold text-lg">{milestone.title}</h4>
                    </div>
                    <p className="text-muted-foreground">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Values */}
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">
                {isZh ? "团队价值观" : "Team Values"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "指引我们前进的核心价值观念"
                  : "Core values that guide our progress"
                }
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {teamValues.map((value, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent className="p-0 space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-secondary/20 text-secondary rounded-lg">
                        {value.icon}
                      </div>
                      <h4 className="font-semibold text-lg">{value.title}</h4>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">
                {isZh ? "联系我们" : "Contact Us"}
              </h2>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "我们重视每一位用户的意见和建议，欢迎与我们取得联系"
                  : "We value every user's opinions and suggestions. Feel free to contact us"
                }
              </p>

              <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="flex items-center space-x-2">
                  <Globe className="w-5 h-5 text-primary" />
                  <span className="font-medium">
                    {isZh ? "官网：" : "Website: "}
                    <a href="https://news.aipush.fun" className="text-primary hover:underline">
                      news.aipush.fun
                    </a>
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-muted-foreground">
                    {isZh ? "7×24小时在线服务" : "24/7 Online Service"}
                  </span>
                </div>
              </div>

              <Separator />

              <p className="text-sm text-muted-foreground">
                {isZh 
                  ? "感谢您选择AI推，让我们一起探索人工智能的无限可能！"
                  : "Thank you for choosing AI Push. Let's explore the infinite possibilities of AI together!"
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutPage;