import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  ExternalLink
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
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', '/blog']);
    }
  }, []);

  // 精选博客文章（有真实内容的）
  const curatedPosts: BlogPost[] = [
    {
      id: 'website-introduction',
      title: isZh ? 'AI推平台介绍：让AI资讯触手可及' : 'AI Push Platform Introduction',
      excerpt: isZh
        ? '全面了解AI推平台的核心功能、技术特色和服务优势，探索专业的人工智能新闻资讯平台。'
        : 'Comprehensive overview of AI Push platform core features and service benefits.',
      category: isZh ? '平台介绍' : 'Platform',
      publishedAt: '2025-08-07',
      readTime: 12,
      author: 'AI推编辑部',
      tags: isZh ? ['平台介绍', 'AI推'] : ['Platform', 'AI Push'],
      featured: true
    },
    {
      id: 'chatgpt-vs-wenxin',
      title: isZh ? 'ChatGPT vs 文心一言：中文大模型对比分析' : 'ChatGPT vs Wenxin: Chinese LLM Comparison',
      excerpt: isZh
        ? '深度对比两大主流AI大语言模型在中文理解、创作能力、API接口等方面的表现差异。'
        : 'In-depth comparison of two mainstream AI LLMs in Chinese understanding and capabilities.',
      category: isZh ? '技术解读' : 'Tech Analysis',
      publishedAt: '2025-08-07',
      readTime: 8,
      author: 'AI推编辑部',
      tags: ['ChatGPT', isZh ? '文心一言' : 'Wenxin', 'LLM'],
      featured: true
    },
    {
      id: 'sora-video-analysis',
      title: isZh ? 'Sora视频生成技术深度解读' : 'Sora Video Generation: Technical Deep Dive',
      excerpt: isZh
        ? '全面解析OpenAI Sora视频生成模型的技术原理和应用前景。'
        : 'Comprehensive analysis of OpenAI Sora video generation model.',
      category: isZh ? '技术解读' : 'Tech Analysis',
      publishedAt: '2025-08-06',
      readTime: 12,
      author: 'AI推编辑部',
      tags: ['Sora', 'OpenAI', isZh ? '视频生成' : 'Video Gen'],
      featured: true
    },
    {
      id: 'china-ai-industry-2025',
      title: isZh ? '中国AI产业发展报告：市场规模与投资趋势' : 'China AI Industry: Market & Investment Trends',
      excerpt: isZh
        ? '基于最新统计数据，深入分析中国人工智能产业的发展现状和未来机遇。'
        : 'Analyzing China AI industry development, market scale and future opportunities.',
      category: isZh ? '行业分析' : 'Industry Analysis',
      publishedAt: '2025-08-05',
      readTime: 15,
      author: 'AI推编辑部',
      tags: isZh ? ['产业报告', '中国AI'] : ['Industry Report', 'China AI'],
    },
    {
      id: 'ai-medical-applications',
      title: isZh ? 'AI在医疗诊断中的应用现状与展望' : 'AI in Medical Diagnosis: Status & Outlook',
      excerpt: isZh
        ? '人工智能在医疗影像诊断、病理分析、药物研发等领域的最新应用成果。'
        : 'AI applications in medical imaging, pathology, drug development and prospects.',
      category: isZh ? '行业分析' : 'Industry Analysis',
      publishedAt: '2025-08-04',
      readTime: 10,
      author: 'AI推编辑部',
      tags: isZh ? ['医疗AI', '行业应用'] : ['Medical AI', 'Applications'],
    },
    {
      id: 'ai-regulation-policy',
      title: isZh ? 'AI监管政策解读：算法备案与数据安全' : 'AI Regulation: Algorithm Filing & Data Security',
      excerpt: isZh
        ? '解读最新AI监管政策，分析算法备案要求和数据安全规范对行业的影响。'
        : 'Interpreting latest AI regulations and their impact on the industry.',
      category: isZh ? '政策解读' : 'Policy Analysis',
      publishedAt: '2025-08-03',
      readTime: 6,
      author: 'AI推编辑部',
      tags: isZh ? ['政策法规', '数据安全'] : ['Regulation', 'Data Security'],
    },
    {
      id: 'ai-startups-2025',
      title: isZh ? 'AI独角兽企业盘点：估值与融资分析' : 'AI Unicorns: Valuation & Funding Analysis',
      excerpt: isZh
        ? '盘点最具潜力的AI独角兽企业，分析估值、融资和技术优势。'
        : 'Overview of promising AI unicorns with valuation and funding analysis.',
      category: isZh ? '投资动态' : 'Investment',
      publishedAt: '2025-08-02',
      readTime: 9,
      author: 'AI推编辑部',
      tags: isZh ? ['独角兽', '融资分析'] : ['Unicorns', 'Funding'],
    }
  ];

  useEffect(() => {
    setBlogPosts(curatedPosts);
  }, [isZh]);

  const handlePostClick = (postId: string) => {
    navigate(`/blog/${postId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isZh
      ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCategoryStyle = (cat: string) => {
    if (cat.includes('技术') || cat.includes('Tech'))
      return { color: '#9EADB8', background: 'rgba(158, 173, 184, 0.12)', border: '1px solid rgba(158, 173, 184, 0.25)' };
    if (cat.includes('行业') || cat.includes('Industry'))
      return { color: '#A3B0A0', background: 'rgba(163, 176, 160, 0.12)', border: '1px solid rgba(163, 176, 160, 0.25)' };
    if (cat.includes('政策') || cat.includes('Policy'))
      return { color: '#B5A5B8', background: 'rgba(181, 165, 184, 0.12)', border: '1px solid rgba(181, 165, 184, 0.25)' };
    if (cat.includes('投资') || cat.includes('Investment'))
      return { color: '#C5B9A8', background: 'rgba(197, 185, 168, 0.12)', border: '1px solid rgba(197, 185, 168, 0.25)' };
    return { color: '#C4A7A0', background: 'rgba(196, 167, 160, 0.12)', border: '1px solid rgba(196, 167, 160, 0.25)' };
  };

  const featuredPosts = blogPosts.filter(post => post.featured);
  const otherPosts = blogPosts.filter(post => !post.featured);

  return (
    <>
      <Helmet>
        <title>{isZh ? 'AI博客 - 深度解读人工智能技术与趋势 | AI推' : 'AI Blog - In-depth AI Technology & Trends | AI Push'}</title>
        <meta name="description" content={isZh
          ? "AI推博客提供专业的人工智能技术解读、行业分析和政策动态。"
          : "AI Push blog provides professional AI technology analysis and industry insights."
        } />
        <link rel="canonical" href="https://news.aipush.fun/blog" />
      </Helmet>

      <div className="min-h-screen" style={{ background: 'hsl(var(--background))' }}>
        {/* Header */}
        <div className="py-12 sm:py-16" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
          <div className="max-w-[760px] mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-5"
              style={{ color: '#B5A5B8', background: 'rgba(181, 165, 184, 0.1)', border: '1px solid rgba(181, 165, 184, 0.2)' }}>
              <BookOpen className="w-3.5 h-3.5" />
              {isZh ? "AI 深度博客" : "AI Deep Blog"}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: 'hsl(var(--foreground))' }}>
              {isZh ? "深度解读 AI 世界" : "Deep Dive into AI"}
            </h1>

            <p className="text-base leading-relaxed max-w-xl mx-auto" style={{ color: 'hsl(var(--muted-foreground))' }}>
              {isZh
                ? "精选的人工智能技术解读、行业分析与趋势洞察"
                : "Curated AI technology analysis, industry insights and trend reports"
              }
            </p>
          </div>
        </div>

        <div className="max-w-[760px] mx-auto px-6 py-10">
          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-sm font-medium uppercase tracking-wider mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {isZh ? "精选文章" : "Featured"}
              </h2>
              <div className="space-y-4">
                {featuredPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group p-5 sm:p-6 rounded-lg cursor-pointer transition-all"
                    style={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                    }}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={getCategoryStyle(post.category)}>
                        {post.category}
                      </span>
                      <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--muted-foreground))' }} />
                      <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="w-[3px] h-[3px] rounded-full" style={{ background: 'hsl(var(--muted-foreground))' }} />
                      <span className="text-xs flex items-center gap-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                        <Clock className="w-3 h-3" />
                        {post.readTime} {isZh ? '分钟' : 'min'}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:opacity-75 transition-opacity" style={{ color: 'hsl(var(--foreground))' }}>
                      {post.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'hsl(var(--muted-foreground))' }}>
                      {post.excerpt}
                    </p>
                    <div className="flex items-center gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded"
                          style={{ color: 'hsl(var(--muted-foreground))', background: 'hsl(var(--muted))', opacity: 0.8 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Other Posts */}
          {otherPosts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-sm font-medium uppercase tracking-wider mb-6" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {isZh ? "更多文章" : "More Articles"}
              </h2>
              <div className="space-y-1">
                {otherPosts.map((post) => (
                  <article
                    key={post.id}
                    className="group flex items-center justify-between py-4 cursor-pointer transition-opacity hover:opacity-75"
                    style={{ borderBottom: '1px solid hsl(var(--border))' }}
                    onClick={() => handlePostClick(post.id)}
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={getCategoryStyle(post.category)}>
                          {post.category}
                        </span>
                        <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {formatDate(post.publishedAt)}
                        </span>
                      </div>
                      <h3 className="text-base font-medium truncate" style={{ color: 'hsl(var(--foreground))' }}>
                        {post.title}
                      </h3>
                    </div>
                    <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                      style={{ color: 'hsl(var(--muted-foreground))' }} />
                  </article>
                ))}
              </div>
            </div>
          )}

          {/* Back to home */}
          <div className="text-center pt-4">
            <button onClick={() => navigate('/')}
              className="inline-flex items-center gap-1.5 text-sm transition-opacity hover:opacity-75"
              style={{ color: 'hsl(var(--muted-foreground))' }}>
              <ExternalLink className="w-3.5 h-3.5" />
              {isZh ? '返回首页' : 'Back to Home'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
