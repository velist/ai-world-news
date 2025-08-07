import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, 
  TrendingUp, 
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Users,
  Star,
  Tag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: number;
  author: string;
  tags: string[];
  featured?: boolean;
}

const BlogPage = () => {
  const { isZh } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', '/blog']);
    }
  }, []);

  // 模拟博客文章数据
  const blogPosts: BlogPost[] = [
    {
      id: 'website-introduction',
      title: isZh ? 'AI推平台介绍：让AI资讯触手可及' : 'AI Push Platform Introduction: Making AI News Accessible',
      excerpt: isZh 
        ? '全面了解AI推平台的核心功能、技术特色和服务优势，探索专业的人工智能新闻资讯平台如何为用户提供价值。'
        : 'Comprehensive overview of AI Push platform\'s core features, technical advantages, and service benefits, exploring how a professional AI news platform delivers value to users.',
      category: isZh ? '平台介绍' : 'Platform Introduction',
      publishedAt: '2025-08-07',
      readTime: 12,
      author: 'AI推编辑部',
      tags: ['平台介绍', 'AI推', '产品功能'],
      featured: true
    },
    {
      id: 'chatgpt-vs-wenxin',
      title: isZh ? 'ChatGPT vs 文心一言：2025年中文大模型对比分析' : 'ChatGPT vs Wenxin: 2025 Chinese LLM Comparison',
      excerpt: isZh 
        ? '深度对比两大主流AI大语言模型在中文理解、创作能力、API接口等方面的表现差异，为开发者和企业用户提供选型参考。'
        : 'In-depth comparison of two mainstream AI language models in Chinese understanding, creative capabilities, API interfaces, providing reference for developers and enterprise users.',
      category: isZh ? '技术解读' : 'Tech Analysis',
      publishedAt: '2025-08-07',
      readTime: 8,
      author: 'AI推编辑部',
      tags: ['ChatGPT', '文心一言', '大模型对比'],
      featured: true
    },
    {
      id: 'sora-video-analysis',
      title: isZh ? 'Sora视频生成技术深度解读：原理与应用前景' : 'Sora Video Generation: Technical Deep Dive',
      excerpt: isZh
        ? '全面解析OpenAI Sora视频生成模型的技术原理、训练方法和实际应用场景，探讨视频AI的未来发展趋势。'
        : 'Comprehensive analysis of OpenAI Sora video generation model technology, training methods, and application scenarios.',
      category: isZh ? '技术解读' : 'Tech Analysis', 
      publishedAt: '2025-08-06',
      readTime: 12,
      author: 'AI推编辑部',
      tags: ['Sora', '视频生成', 'OpenAI'],
      featured: true
    },
    {
      id: 'china-ai-industry-2025',
      title: isZh ? '2025年中国AI产业发展报告：市场规模与投资趋势' : 'China AI Industry 2025: Market Scale & Investment Trends',
      excerpt: isZh
        ? '基于最新统计数据，深入分析中国人工智能产业的发展现状、市场规模、投资热点和未来机遇。'
        : 'Based on latest statistics, analyzing China AI industry development, market scale, investment hotspots and future opportunities.',
      category: isZh ? '行业分析' : 'Industry Analysis',
      publishedAt: '2025-08-05',
      readTime: 15,
      author: 'AI推编辑部',
      tags: ['产业报告', '投资分析', '中国AI'],
      featured: false
    },
    {
      id: 'ai-medical-applications',
      title: isZh ? 'AI在医疗诊断中的应用现状与未来展望' : 'AI in Medical Diagnosis: Current Status & Future',
      excerpt: isZh
        ? '详细介绍人工智能在医疗影像诊断、病理分析、药物研发等领域的最新应用成果和发展前景。'
        : 'Detailed introduction to AI applications in medical imaging diagnosis, pathology analysis, drug development and prospects.',
      category: isZh ? '行业分析' : 'Industry Analysis',
      publishedAt: '2025-08-04',
      readTime: 10,
      author: 'AI推编辑部',
      tags: ['医疗AI', '影像诊断', '行业应用'],
      featured: false
    },
    {
      id: 'ai-regulation-policy',
      title: isZh ? '中国AI监管政策最新解读：算法备案与数据安全' : 'China AI Regulation: Algorithm Filing & Data Security',
      excerpt: isZh
        ? '解读最新的AI监管政策法规，分析算法备案要求、数据安全规范对AI企业和开发者的影响。'
        : 'Interpreting latest AI regulatory policies, analyzing algorithm filing requirements and data security impact on AI companies.',
      category: isZh ? '政策解读' : 'Policy Analysis',
      publishedAt: '2025-08-03',
      readTime: 6,
      author: 'AI推编辑部',
      tags: ['政策法规', '算法监管', '数据安全'],
      featured: false
    },
    {
      id: 'ai-startups-2025',
      title: isZh ? '2025年AI独角兽企业盘点：估值与融资分析' : '2025 AI Unicorns: Valuation & Funding Analysis',
      excerpt: isZh
        ? '盘点2025年最具潜力的AI独角兽企业，分析其估值情况、融资轮次和技术优势。'
        : 'Overview of most promising AI unicorns in 2025, analyzing valuations, funding rounds and technical advantages.',
      category: isZh ? '投资动态' : 'Investment',
      publishedAt: '2025-08-02',
      readTime: 9,
      author: 'AI推编辑部',
      tags: ['独角兽', '融资分析', '企业估值'],
      featured: false
    }
  ];

  const categories = [
    { id: 'all', name: isZh ? '全部' : 'All', count: blogPosts.length },
    { id: 'tech', name: isZh ? '技术解读' : 'Tech Analysis', count: 2 },
    { id: 'industry', name: isZh ? '行业分析' : 'Industry Analysis', count: 2 },
    { id: 'policy', name: isZh ? '政策解读' : 'Policy Analysis', count: 1 },
    { id: 'investment', name: isZh ? '投资动态' : 'Investment', count: 1 }
  ];

  const featuredPosts = blogPosts.filter(post => post.featured);
  const recentPosts = blogPosts.filter(post => !post.featured);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // 这里可以实现实际的搜索逻辑
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handlePostClick = (postId: string) => {
    navigate(`/blog/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isZh 
      ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <Helmet>
        <title>{isZh ? 'AI博客 - 深度解读人工智能技术与趋势 | AI推' : 'AI Blog - In-depth AI Technology & Trends | AI Push'}</title>
        <meta 
          name="description" 
          content={isZh 
            ? "AI推博客提供专业的人工智能技术解读、行业分析、政策解读和投资动态。涵盖ChatGPT、大模型、机器学习等热门AI话题的深度分析文章。"
            : "AI Push blog provides professional AI technology analysis, industry insights, policy interpretation and investment trends. In-depth articles covering ChatGPT, LLMs, machine learning and hot AI topics."
          } 
        />
        <meta 
          name="keywords" 
          content={isZh 
            ? "AI博客,人工智能博客,ChatGPT分析,大模型对比,AI技术解读,机器学习教程,AI行业报告,人工智能趋势"
            : "AI Blog,Artificial Intelligence Blog,ChatGPT Analysis,LLM Comparison,AI Technology Analysis,Machine Learning Tutorial,AI Industry Report"
          } 
        />
        
        {/* Open Graph */}
        <meta property="og:title" content={isZh ? 'AI博客 - 深度解读人工智能技术与趋势' : 'AI Blog - In-depth AI Technology & Trends'} />
        <meta property="og:description" content={isZh ? "专业的AI技术解读和行业分析博客" : "Professional AI technology analysis and industry insights blog"} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://news.aipush.fun/blog" />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        
        {/* Schema.org结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": isZh ? "AI推博客" : "AI Push Blog",
            "description": isZh ? "专业的人工智能技术解读和行业分析博客" : "Professional AI technology analysis and industry insights blog",
            "url": "https://news.aipush.fun/blog",
            "publisher": {
              "@type": "Organization",
              "name": "AI推",
              "url": "https://news.aipush.fun"
            },
            "mainEntityOfPage": {
              "@type": "CollectionPage",
              "name": isZh ? "AI博客文章" : "AI Blog Posts"
            }
          })}
        </script>
        
        <link rel="canonical" href="https://news.aipush.fun/blog" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center space-y-6">
              <Badge variant="outline" className="text-sm px-4 py-2">
                <BookOpen className="w-4 h-4 mr-2" />
                {isZh ? "AI技术博客" : "AI Tech Blog"}
              </Badge>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-purple-600 to-secondary bg-clip-text text-transparent">
                {isZh ? "深度解读AI世界" : "Deep Dive into AI World"}
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                {isZh 
                  ? "探索人工智能的最新技术、行业趋势和政策动态。我们为AI从业者、研究人员和技术爱好者提供专业、深度的分析文章。"
                  : "Explore the latest AI technologies, industry trends, and policy developments. We provide professional, in-depth analysis for AI professionals, researchers, and tech enthusiasts."
                }
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder={isZh ? "搜索AI技术、公司、趋势..." : "Search AI tech, companies, trends..."}
                    className="pl-12 pr-4 py-3 text-lg"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-16 space-y-16">
          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-primary">{blogPosts.length}+</div>
                <p className="text-sm text-muted-foreground">
                  {isZh ? "精品文章" : "Quality Articles"}
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-primary">10K+</div>
                <p className="text-sm text-muted-foreground">
                  {isZh ? "月度读者" : "Monthly Readers"}
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-primary">4</div>
                <p className="text-sm text-muted-foreground">
                  {isZh ? "专业分类" : "Categories"}
                </p>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent className="p-0 space-y-2">
                <div className="text-2xl font-bold text-primary">24h</div>
                <p className="text-sm text-muted-foreground">
                  {isZh ? "更新频率" : "Update Frequency"}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Featured Posts */}
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-3xl font-bold">
                {isZh ? "精选文章" : "Featured Posts"}
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card 
                  key={post.id} 
                  className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handlePostClick(post.id)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className="text-xs">
                        {post.category}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-800">
                        <Star className="w-3 h-3 mr-1" />
                        {isZh ? "精选" : "Featured"}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl leading-tight hover:text-primary">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(post.publishedAt)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{post.readTime} {isZh ? '分钟' : 'min'}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                        {isZh ? "阅读更多" : "Read More"}
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Categories & Recent Posts */}
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories Filter */}
            <div className="lg:col-span-1">
              <Card className="p-6">
                <CardHeader className="p-0 pb-4">
                  <CardTitle className="text-lg">
                    {isZh ? "文章分类" : "Categories"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-primary/10 text-primary border border-primary/20'
                          : 'hover:bg-muted'
                      }`}
                    >
                      <span className="font-medium">{category.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recent Posts */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-3xl font-bold">
                    {isZh ? "最新文章" : "Recent Posts"}
                  </h2>
                </div>

                <div className="space-y-6">
                  {recentPosts.map((post) => (
                    <Card 
                      key={post.id} 
                      className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                      onClick={() => handlePostClick(post.id)}
                    >
                      <div className="flex flex-col md:flex-row md:items-start space-y-4 md:space-y-0 md:space-x-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <Badge variant="secondary" className="text-xs">
                              {post.category}
                            </Badge>
                            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(post.publishedAt)}</span>
                              <Clock className="w-4 h-4 ml-2" />
                              <span>{post.readTime} {isZh ? '分钟' : 'min'}</span>
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold leading-tight hover:text-primary">
                            {post.title}
                          </h3>
                          
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {post.excerpt}
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePostClick(post.id);
                          }}
                        >
                          {isZh ? "阅读" : "Read"}
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-8">
            <div className="text-center space-y-6">
              <h2 className="text-3xl font-bold">
                {isZh ? "订阅我们的博客" : "Subscribe to Our Blog"}
              </h2>
              
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {isZh 
                  ? "第一时间获取最新的AI技术解读、行业分析和政策动态"
                  : "Get the latest AI technology insights, industry analysis, and policy updates first"
                }
              </p>

              <div className="max-w-md mx-auto flex space-x-2">
                <Input
                  type="email"
                  placeholder={isZh ? "输入您的邮箱地址" : "Enter your email address"}
                  className="flex-1"
                />
                <Button>
                  {isZh ? "订阅" : "Subscribe"}
                </Button>
              </div>

              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  <span>
                    {isZh ? "已有 2,000+ 订阅者" : "2,000+ Subscribers"}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {isZh ? "每周更新" : "Weekly Updates"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;