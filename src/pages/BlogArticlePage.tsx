import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useLanguage } from '@/contexts/LanguageContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  User,
  Share2,
  BookOpen,
  Tag,
  ThumbsUp,
  MessageCircle,
  Eye
} from 'lucide-react';

interface BlogArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  publishedAt: string;
  readTime: number;
  author: string;
  tags: string[];
  views: number;
  likes: number;
  comments: number;
  featured?: boolean;
}

const BlogArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { isZh } = useLanguage();
  const [article, setArticle] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // 页面访问统计
    if (typeof window !== 'undefined' && (window as any)._hmt) {
      (window as any)._hmt.push(['_trackPageview', `/blog/${slug}`]);
    }
  }, [slug]);

  useEffect(() => {
    // 模拟获取文章数据
    const fetchArticle = async () => {
      setLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 模拟文章数据 - 实际项目中这里应该调用API
      const mockArticles: { [key: string]: BlogArticle } = {
        'website-introduction': {
          id: 'website-introduction',
          title: isZh ? 'AI推平台介绍：让AI资讯触手可及' : 'AI Push Platform Introduction: Making AI News Accessible',
          content: isZh ? `
# AI推：让AI资讯触手可及

AI推致力于成为全球领先的人工智能新闻资讯平台，通过先进的AI技术为用户提供最新、准确、有价值的AI科技资讯。

## 平台概览

### 什么是AI推？

AI推(news.aipush.fun)是一个专业的人工智能新闻资讯平台，我们使用先进的AI技术自动聚合、翻译和分析全球AI相关新闻。平台致力于为AI从业者、研究人员、投资人和技术爱好者提供最及时、准确、有价值的人工智能资讯。

### 核心优势

- **AI驱动的智能内容聚合** - 使用先进算法自动筛选优质内容
- **实时多语言翻译服务** - 无缝中英文切换，消除语言障碍
- **专业的AI内容分析和点评** - 深度解读技术动态和行业趋势

### 服务对象

- **AI从业者和研究人员** - 获取最新技术动态和研究进展
- **科技媒体和投资人** - 掌握行业发展趋势和投资机会
- **技术爱好者和学习者** - 学习AI知识，了解技术应用

## 核心功能

### AI智能聚合
使用先进AI算法自动聚合全球优质AI新闻资讯，确保内容的时效性和权威性。

### 智能翻译
AI驱动的多语言翻译，中英文无缝切换，让全球AI资讯触手可及。

### 实时更新
7×24小时持续监控，第一时间推送最新资讯，让您始终走在AI发展前沿。

### 可信来源
精选400+权威媒体源，确保信息准确可靠，为您的决策提供强有力支撑。

### 移动优化
完美适配移动设备，支持微信内浏览分享，随时随地获取AI资讯。

### 数据分析
深度数据分析，洞察AI行业发展趋势，为您提供有价值的行业洞察。

## 平台数据

- **400+** 权威媒体源
- **10K+** 日活用户
- **20+** 支持语言
- **24h** 实时更新

## 技术架构

### 前端技术
- React 18 + TypeScript
- Vite + SWC 快速构建
- Tailwind CSS 响应式设计
- React Router 路由管理
- React Helmet 异步SEO优化

### AI技术
- 智能内容聚合算法
- 多语言翻译引擎
- 内容质量评估系统
- 个性化推荐算法
- 实时数据分析

### 安全与性能
- CDN全球加速
- HTTPS安全传输
- 数据加密保护
- 防DDoS攻击
- 实时监控告警

### 移动端优化
- PWA渐进式应用
- 微信浏览器适配
- 触摸友好界面
- 离线阅读支持
- 社交分享优化

## 为什么选择AI推？

### 专业专注
专注AI领域，深度挖掘有价值的技术资讯和行业动态

### 智能高效
AI技术驱动，自动化处理海量信息，提供精准筛选

### 用户至上
以用户需求为导向，持续优化产品体验和服务质量

## 开始使用AI推

立即体验专业的AI新闻资讯服务，让您时刻掌握人工智能发展动态。

感谢您选择AI推，让我们一起探索人工智能的无限可能！

---

*访问 [news.aipush.fun](https://news.aipush.fun) 开始您的AI资讯之旅*
          ` : `
# AI Push: Making AI News Accessible

AI Push is committed to becoming the world's leading artificial intelligence news platform, providing the latest, accurate, and valuable AI technology information through advanced AI technology.

## Platform Overview

### What is AI Push?

AI Push (news.aipush.fun) is a professional artificial intelligence news platform. We use advanced AI technology to automatically aggregate, translate, and analyze global AI-related news. The platform is dedicated to providing the most timely, accurate, and valuable AI information for AI professionals, researchers, investors, and tech enthusiasts.

### Core Advantages

- **AI-driven smart content aggregation** - Advanced algorithms automatically filter quality content
- **Real-time multilingual translation** - Seamless Chinese-English switching, eliminating language barriers
- **Professional AI content analysis** - In-depth interpretation of technology trends and industry dynamics

### Target Users

- **AI professionals and researchers** - Get the latest technology trends and research progress
- **Tech media and investors** - Master industry development trends and investment opportunities
- **Tech enthusiasts and learners** - Learn AI knowledge and understand technology applications

## Key Features

### AI Smart Aggregation
Advanced AI algorithms automatically aggregate global quality AI news, ensuring content timeliness and authority.

### Smart Translation
AI-driven multilingual translation, seamless Chinese-English switching, making global AI information accessible.

### Real-time Updates
24/7 continuous monitoring, first-time push of latest information, keeping you at the forefront of AI development.

### Trusted Sources
Curated 400+ authoritative sources, ensuring accurate and reliable information for strong decision support.

### Mobile Optimized
Perfect mobile adaptation, supports WeChat browsing and sharing, access AI news anytime, anywhere.

### Data Analytics
Deep data analysis, insights into AI industry trends, providing valuable industry insights.

## Platform Statistics

- **400+** Media Sources
- **10K+** Daily Users
- **20+** Languages
- **24h** Real-time Updates

## Technology Stack

### Frontend Technology
- React 18 + TypeScript
- Vite + SWC fast build
- Tailwind CSS responsive design
- React Router routing management
- React Helmet async SEO optimization

### AI Technology
- Smart content aggregation algorithms
- Multilingual translation engine
- Content quality assessment system
- Personalized recommendation algorithms
- Real-time data analysis

### Security & Performance
- CDN global acceleration
- HTTPS secure transmission
- Data encryption protection
- Anti-DDoS attacks
- Real-time monitoring alerts

### Mobile Optimization
- PWA progressive application
- WeChat browser adaptation
- Touch-friendly interface
- Offline reading support
- Social sharing optimization

## Why Choose AI Push?

### Professional Focus
Focused on AI field, deeply exploring valuable tech news and industry trends

### Smart & Efficient
AI-driven technology, automated processing of massive information with precise filtering

### User-Centric
User-oriented approach, continuously optimizing product experience and service quality

## Start Using AI Push

Experience professional AI news service now and stay updated with AI development trends.

Thank you for choosing AI Push. Let's explore the infinite possibilities of AI together!

---

*Visit [news.aipush.fun](https://news.aipush.fun) to start your AI news journey*
          `,
          excerpt: isZh 
            ? '全面了解AI推平台的核心功能、技术特色和服务优势，探索专业的人工智能新闻资讯平台如何为用户提供价值。'
            : 'Comprehensive overview of AI Push platform\'s core features, technical advantages, and service benefits, exploring how a professional AI news platform delivers value to users.',
          category: isZh ? '平台介绍' : 'Platform Introduction',
          publishedAt: '2025-08-07',
          readTime: 12,
          author: 'AI推编辑部',
          tags: ['平台介绍', 'AI推', '产品功能'],
          views: 2580,
          likes: 178,
          comments: 45,
          featured: true
        },
        'chatgpt-vs-wenxin': {
          id: 'chatgpt-vs-wenxin',
          title: isZh ? 'ChatGPT vs 文心一言：2025年中文大模型对比分析' : 'ChatGPT vs Wenxin: 2025 Chinese LLM Comparison',
          content: isZh ? `
# ChatGPT vs 文心一言：2025年中文大模型对比分析

随着人工智能技术的飞速发展，大语言模型(LLM)已成为AI领域最受关注的技术之一。在众多大模型中，OpenAI的ChatGPT和百度的文心一言无疑是最具代表性的两个产品。本文将从多个维度深度对比这两款产品在2025年的表现。

## 技术架构对比

### ChatGPT技术特点

ChatGPT基于Transformer架构，采用了大规模预训练+指令微调+人类反馈强化学习(RLHF)的技术路线：

- **模型规模**：GPT-4o拥有约1.8万亿参数
- **训练数据**：包含网页、书籍、学术论文等多源数据
- **多模态能力**：支持文本、图像、音频输入输出
- **API接口**：提供完善的开发者API生态

### 文心一言技术特点

文心一言基于百度自研的ERNIE架构，针对中文语境进行了专门优化：

- **模型规模**：ERNIE 4.0约2600亿参数  
- **中文优化**：专门针对中文语料和文化背景训练
- **知识增强**：集成了百度搜索和知识图谱
- **本土化**：更好理解中文语言习惯和文化内涵

## 中文理解能力对比

### 语言理解准确性

在中文理解方面，两个模型各有优势：

**文心一言优势：**
- 对中文语言习惯和表达方式理解更准确
- 能够理解中国特有的文化背景和语境
- 在处理中文诗词、成语、典故方面表现出色

**ChatGPT优势：**
- 逻辑推理能力更强
- 多轮对话连贯性更好
- 创意写作和内容生成质量较高

### 专业领域表现

在专业领域的中文处理能力上：

1. **法律领域**：文心一言对中国法律条文理解更准确
2. **医疗健康**：ChatGPT在医学知识的逻辑性和准确性方面稍胜一筹
3. **教育培训**：两者在中文教学内容生成方面各有千秋
4. **商业咨询**：ChatGPT在商业分析逻辑方面更强，文心一言在本土商业环境理解方面更优

## API接口和开发生态

### ChatGPT API

- **接口丰富**：提供完整的API接口体系
- **文档完善**：开发文档详细，社区活跃
- **价格透明**：按token计费，价格相对透明
- **使用限制**：在中国大陆访问存在一定限制

### 文心一言API

- **本土支持**：在中国大陆可以正常访问使用
- **集成优势**：与百度云生态深度结合
- **企业服务**：提供专门的企业级服务和定制化方案
- **价格优势**：在某些使用场景下成本更低

## 实际应用场景分析

### 内容创作领域

**ChatGPT适用场景：**
- 创意写作和小说创作
- 技术文档和教程编写  
- 多语言内容翻译
- 代码生成和调试

**文心一言适用场景：**
- 中文营销文案撰写
- 传统文化内容创作
- 本土化产品说明书
- 中文客服对话系统

### 企业应用

**ChatGPT企业应用：**
- 国际化企业的多语言客服
- 技术型公司的代码助手
- 创意产业的内容生成
- 教育培训的课程开发

**文心一言企业应用：**
- 本土企业的智能客服
- 政府机构的文件处理
- 传统行业的数字化转型
- 中文搜索和信息检索

## 性能测试结果

我们对两个模型进行了多维度测试：

### 响应速度对比

| 测试场景 | ChatGPT | 文心一言 |
|---------|---------|---------|
| 简单问答 | 1.2秒 | 0.8秒 |
| 长文生成 | 15秒 | 12秒 |
| 代码生成 | 3秒 | 4秒 |
| 图像分析 | 5秒 | 6秒 |

### 准确性评估

| 领域 | ChatGPT准确率 | 文心一言准确率 |
|------|-------------|-------------|
| 中文理解 | 85% | 92% |
| 逻辑推理 | 90% | 82% |
| 专业知识 | 88% | 85% |
| 创意写作 | 89% | 86% |

## 成本效益分析

### 使用成本对比

**ChatGPT成本结构：**
- GPT-4: $0.03/1K tokens (输入) + $0.06/1K tokens (输出)
- GPT-3.5: $0.002/1K tokens
- 适合中高频使用的场景

**文心一言成本结构：**
- 基础版：0.008元/千tokens
- 专业版：0.12元/千tokens  
- 在大规模使用时成本优势明显

### ROI分析

从投资回报角度看：
- **ChatGPT**：适合对创新性和逻辑性要求较高的应用
- **文心一言**：适合需要深度本土化的中文应用场景

## 未来发展趋势

### 技术演进方向

**ChatGPT发展趋势：**
- 多模态能力持续增强
- 推理能力进一步提升
- 与更多工具和平台集成
- 个性化定制能力增强

**文心一言发展趋势：**
- 中文能力持续优化
- 与百度生态深度融合
- 行业专用模型推出
- 本土化服务不断完善

## 总结与建议

### 选择建议

**推荐使用ChatGPT的场景：**
- 国际化业务需求
- 需要强逻辑推理能力
- 创意内容生成为主
- 技术开发辅助工具

**推荐使用文心一言的场景：**
- 纯中文业务环境
- 需要深度本土化
- 与百度生态集成
- 成本敏感型应用

### 未来展望

随着技术的不断发展，两个模型都在各自的优势领域持续进化。对于开发者和企业用户来说，最重要的是根据具体业务需求选择最适合的工具。

在可预见的未来，我们很可能会看到：
- 模型能力的进一步提升
- 成本的持续降低  
- 更多垂直领域的专用模型
- 多模态能力的全面普及

无论选择哪个模型，关键是要结合自身的业务特点和技术需求，做出最适合的选择。

---

*本文基于2025年8月的最新数据和测试结果，随着技术快速发展，相关信息可能会有所变化。建议读者关注官方最新动态。*
          ` : `
# ChatGPT vs Wenxin: 2025 Chinese LLM Comparison

As AI technology rapidly evolves, Large Language Models (LLMs) have become one of the most watched technologies in the AI field. Among numerous large models, OpenAI's ChatGPT and Baidu's Wenxin Yiyan are undoubtedly two of the most representative products. This article will provide an in-depth comparison of these two products' performance in 2025 across multiple dimensions.

## Technical Architecture Comparison

### ChatGPT Technical Features

ChatGPT is based on the Transformer architecture, adopting a technical approach of large-scale pre-training + instruction fine-tuning + Reinforcement Learning from Human Feedback (RLHF):

- **Model Scale**: GPT-4o has approximately 1.8 trillion parameters
- **Training Data**: Includes multi-source data such as web pages, books, and academic papers
- **Multimodal Capabilities**: Supports text, image, and audio input/output
- **API Interface**: Provides comprehensive developer API ecosystem

### Wenxin Yiyan Technical Features

Wenxin Yiyan is based on Baidu's self-developed ERNIE architecture, specifically optimized for Chinese contexts:

- **Model Scale**: ERNIE 4.0 has approximately 260 billion parameters
- **Chinese Optimization**: Specially trained for Chinese corpus and cultural background
- **Knowledge Enhancement**: Integrated with Baidu Search and knowledge graphs
- **Localization**: Better understanding of Chinese language habits and cultural connotations

## Chinese Language Understanding Comparison

### Language Understanding Accuracy

In Chinese understanding, both models have their respective advantages:

**Wenxin Yiyan Advantages:**
- More accurate understanding of Chinese language habits and expressions
- Better comprehension of China-specific cultural backgrounds and contexts
- Excellent performance in handling Chinese poetry, idioms, and classical allusions

**ChatGPT Advantages:**
- Stronger logical reasoning capabilities
- Better coherence in multi-turn conversations
- Higher quality in creative writing and content generation

## Conclusion and Recommendations

Both models continue to evolve in their respective strength areas. For developers and enterprise users, the most important thing is to choose the most suitable tool based on specific business needs.

In the foreseeable future, we are likely to see:
- Further improvement in model capabilities
- Continued cost reduction
- More specialized models for vertical domains
- Comprehensive adoption of multimodal capabilities

Regardless of which model you choose, the key is to make the most suitable choice based on your business characteristics and technical requirements.

---

*This article is based on the latest data and test results from August 2025. As technology develops rapidly, relevant information may change. Readers are advised to follow the latest official updates.*
          `,
          excerpt: isZh 
            ? '深度对比两大主流AI大语言模型在中文理解、创作能力、API接口等方面的表现差异，为开发者和企业用户提供选型参考。'
            : 'In-depth comparison of two mainstream AI language models in Chinese understanding, creative capabilities, API interfaces, providing reference for developers and enterprise users.',
          category: isZh ? '技术解读' : 'Tech Analysis',
          publishedAt: '2025-08-07',
          readTime: 8,
          author: 'AI推编辑部',
          tags: ['ChatGPT', '文心一言', '大模型对比'],
          views: 1234,
          likes: 89,
          comments: 23,
          featured: true
        }
      };

      const foundArticle = mockArticles[slug || ''];
      setArticle(foundArticle || null);
      setLoading(false);
    };

    if (slug) {
      fetchArticle();
    }
  }, [slug, isZh]);

  const handleBack = () => {
    navigate('/blog');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: article?.title,
        text: article?.excerpt,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // 这里可以添加toast提示
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    // 这里可以调用API记录点赞
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isZh 
      ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-muted-foreground">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>{isZh ? '正在加载文章...' : 'Loading article...'}</span>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-muted-foreground">
            {isZh ? '文章不存在' : 'Article Not Found'}
          </h2>
          <p className="text-muted-foreground">
            {isZh ? '抱歉，您访问的文章不存在或已被删除。' : 'Sorry, the article you are looking for does not exist or has been deleted.'}
          </p>
          <Button onClick={handleBack}>
            {isZh ? '返回博客' : 'Back to Blog'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{article.title} | AI推博客</title>
        <meta name="description" content={article.excerpt} />
        <meta name="keywords" content={article.tags.join(', ')} />
        
        {/* Open Graph */}
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://news.aipush.fun/blog/${article.id}`} />
        <meta property="og:image" content="https://news.aipush.fun/wechat-share-300.png" />
        
        {/* Article specific */}
        <meta property="article:published_time" content={article.publishedAt} />
        <meta property="article:author" content={article.author} />
        <meta property="article:section" content={article.category} />
        {article.tags.map(tag => (
          <meta key={tag} property="article:tag" content={tag} />
        ))}
        
        {/* Schema.org */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "headline": article.title,
            "description": article.excerpt,
            "author": {
              "@type": "Organization",
              "name": article.author
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI推",
              "url": "https://news.aipush.fun"
            },
            "datePublished": article.publishedAt,
            "url": `https://news.aipush.fun/blog/${article.id}`,
            "mainEntityOfPage": `https://news.aipush.fun/blog/${article.id}`,
            "articleSection": article.category,
            "keywords": article.tags.join(", ")
          })}
        </script>
        
        <link rel="canonical" href={`https://news.aipush.fun/blog/${article.id}`} />
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
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="flex items-center space-x-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{isZh ? '分享' : 'Share'}</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          {/* Article Header */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="text-sm">
                {article.category}
              </Badge>
              {article.featured && (
                <Badge variant="outline" className="text-sm bg-yellow-50 border-yellow-200 text-yellow-800">
                  {isZh ? '精选' : 'Featured'}
                </Badge>
              )}
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              {article.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {article.excerpt}
            </p>

            {/* Article Meta */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.publishedAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{article.readTime} {isZh ? '分钟阅读' : 'min read'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>{formatNumber(article.views)} {isZh ? '阅读' : 'views'}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Article Content */}
          <Card className="p-8">
            <CardContent className="p-0">
              <div className="prose prose-lg prose-slate max-w-none dark:prose-invert">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({...props}) => <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground" {...props} />,
                    h2: ({...props}) => <h2 className="text-2xl font-semibold mt-6 mb-3 text-foreground" {...props} />,
                    h3: ({...props}) => <h3 className="text-xl font-semibold mt-4 mb-2 text-foreground" {...props} />,
                    h4: ({...props}) => <h4 className="text-lg font-medium mt-3 mb-2 text-foreground" {...props} />,
                    p: ({...props}) => <p className="mb-4 leading-relaxed text-foreground" {...props} />,
                    ul: ({...props}) => <ul className="list-disc list-inside mb-4 space-y-2 text-foreground" {...props} />,
                    ol: ({...props}) => <ol className="list-decimal list-inside mb-4 space-y-2 text-foreground" {...props} />,
                    li: ({...props}) => <li className="text-foreground" {...props} />,
                    strong: ({...props}) => <strong className="font-semibold text-foreground" {...props} />,
                    em: ({...props}) => <em className="italic text-foreground" {...props} />,
                    blockquote: ({...props}) => <blockquote className="border-l-4 border-primary/30 pl-4 my-4 italic text-muted-foreground bg-muted/30 py-2 rounded-r" {...props} />,
                    code: ({className, children, ...props}) => {
                      const match = /language-(\w+)/.exec(className || '');
                      return match ? (
                        <pre className="bg-muted p-4 rounded-lg overflow-x-auto my-4">
                          <code className={`language-${match[1]} text-sm`} {...props}>
                            {children}
                          </code>
                        </pre>
                      ) : (
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono" {...props}>
                          {children}
                        </code>
                      );
                    },
                    table: ({...props}) => <table className="w-full border-collapse border border-border my-4" {...props} />,
                    th: ({...props}) => <th className="border border-border px-4 py-2 bg-muted font-semibold text-left" {...props} />,
                    td: ({...props}) => <td className="border border-border px-4 py-2" {...props} />,
                    hr: ({...props}) => <hr className="my-8 border-border" {...props} />
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Article Actions */}
          <div className="flex items-center justify-between py-6 border-y border-border">
            <div className="flex items-center space-x-4">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center space-x-2"
              >
                <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{liked ? formatNumber(article.likes + 1) : formatNumber(article.likes)}</span>
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{formatNumber(article.comments)}</span>
              </Button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share2 className="w-4 h-4" />
              <span>{isZh ? '分享文章' : 'Share Article'}</span>
            </Button>
          </div>

          {/* Author Info */}
          <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="p-0">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">{article.author}</h4>
                  <p className="text-muted-foreground">
                    {isZh 
                      ? 'AI推专业编辑团队，致力于为读者提供最新、最准确的人工智能资讯和深度分析。'
                      : 'AI Push professional editorial team, dedicated to providing readers with the latest and most accurate AI news and in-depth analysis.'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Articles Placeholder */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">
              {isZh ? '相关文章' : 'Related Articles'}
            </h3>
            <div className="text-muted-foreground">
              {isZh ? '更多相关文章即将推出...' : 'More related articles coming soon...'}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogArticlePage;