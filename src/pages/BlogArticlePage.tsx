import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Eye,
  ArrowRight
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

// 动态生成文章内容的函数
const generateArticleContent = (articleData: any, isZh: boolean): string => {
  const title = isZh ? articleData.title : articleData.titleEn;
  const excerpt = isZh ? articleData.excerpt : articleData.excerptEn;
  const category = isZh ? articleData.category : articleData.categoryEn;
  const tags = isZh ? articleData.tags : articleData.tagsEn;
  const keywords = isZh ? articleData.keywords : articleData.keywordsEn;
  
  // 根据文章类型和内容生成对应的文章结构
  switch (articleData.id) {
    case 'website-introduction':
      return isZh ? `
# AI推：让AI资讯触手可及

${excerpt}

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

${excerpt}

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
      `;

    case 'chatgpt-vs-wenxin':
      return generateChatGPTComparisonContent(isZh);
      
    case 'sora-video-analysis':
      return generateSoraAnalysisContent(isZh);
      
    case 'china-ai-industry-2025':
      return generateChinaAIIndustryContent(isZh);
      
    case 'ai-medical-applications':
      return generateMedicalAIContent(isZh);
      
    case 'ai-regulation-policy':
      return generateRegulationPolicyContent(isZh);
      
    case 'ai-startups-2025':
      return generateAIStartupsContent(isZh);
      
    default:
      // 为其他文章生成通用内容
      return generateGenericContent(title, excerpt, category, tags, keywords, isZh);
  }
};

// 为不同类型文章生成内容的辅助函数
const generateChatGPTComparisonContent = (isZh: boolean): string => {
  return isZh ? `
# ChatGPT vs 文心一言：2025年中文大模型对比分析

随着人工智能技术的飞速发展，大语言模型(LLM)已成为AI领域最受关注的技术之一。在众多大模型中，OpenAI的ChatGPT和百度的文心一言无疑是最具代表性的两个产品。

## 技术架构对比

### ChatGPT技术特点
- **模型规模**：GPT-4o拥有约1.8万亿参数
- **训练数据**：包含网页、书籍、学术论文等多源数据
- **多模态能力**：支持文本、图像、音频输入输出
- **API接口**：提供完善的开发者API生态

### 文心一言技术特点
- **模型规模**：ERNIE 4.0约2600亿参数  
- **中文优化**：专门针对中文语料和文化背景训练
- **知识增强**：集成了百度搜索和知识图谱
- **本土化**：更好理解中文语言习惯和文化内涵

## 中文理解能力对比

**文心一言优势：**
- 对中文语言习惯和表达方式理解更准确
- 能够理解中国特有的文化背景和语境
- 在处理中文诗词、成语、典故方面表现出色

**ChatGPT优势：**
- 逻辑推理能力更强
- 多轮对话连贯性更好
- 创意写作和内容生成质量较高

## 实际应用场景分析

### 内容创作领域
不同的应用场景适合不同的模型选择。

### 企业应用
根据业务需求选择合适的模型。

## 性能测试结果

| 测试场景 | ChatGPT | 文心一言 |
|---------|---------|---------|
| 简单问答 | 1.2秒 | 0.8秒 |
| 长文生成 | 15秒 | 12秒 |
| 代码生成 | 3秒 | 4秒 |

## 总结与建议

两个模型都在各自的优势领域持续进化，关键是要结合自身的业务特点和技术需求，做出最适合的选择。
  ` : `
# ChatGPT vs Wenxin: 2025 Chinese LLM Comparison

As AI technology rapidly evolves, Large Language Models (LLMs) have become one of the most watched technologies in the AI field. Among numerous large models, OpenAI's ChatGPT and Baidu's Wenxin Yiyan are two of the most representative products.

## Technical Architecture Comparison

### ChatGPT Technical Features
- **Model Scale**: GPT-4o has approximately 1.8 trillion parameters
- **Training Data**: Includes multi-source data such as web pages, books, and academic papers
- **Multimodal Capabilities**: Supports text, image, and audio input/output
- **API Interface**: Provides comprehensive developer API ecosystem

### Wenxin Yiyan Technical Features
- **Model Scale**: ERNIE 4.0 has approximately 260 billion parameters
- **Chinese Optimization**: Specially trained for Chinese corpus and cultural background
- **Knowledge Enhancement**: Integrated with Baidu Search and knowledge graphs
- **Localization**: Better understanding of Chinese language habits and cultural connotations

## Chinese Language Understanding Comparison

**Wenxin Yiyan Advantages:**
- More accurate understanding of Chinese language habits and expressions
- Better comprehension of China-specific cultural backgrounds and contexts
- Excellent performance in handling Chinese poetry, idioms, and classical allusions

**ChatGPT Advantages:**
- Stronger logical reasoning capabilities
- Better coherence in multi-turn conversations
- Higher quality in creative writing and content generation

## Application Scenarios Analysis

### Content Creation
Different application scenarios suit different model choices.

### Enterprise Applications
Choose the appropriate model based on business needs.

## Performance Test Results

| Test Scenario | ChatGPT | Wenxin |
|--------------|---------|---------|
| Simple Q&A | 1.2s | 0.8s |
| Long Text | 15s | 12s |
| Code Gen | 3s | 4s |

## Conclusion and Recommendations

Both models continue to evolve in their respective strength areas. The key is to make the most suitable choice based on your business characteristics and technical requirements.
  `;
};

const generateSoraAnalysisContent = (isZh: boolean): string => {
  return isZh ? `
# Sora视频生成技术深度解读：原理与应用前景

OpenAI的Sora模型在视频生成领域取得了突破性进展，本文将深度解析其技术原理和应用前景。

## 技术原理

### 扩散模型架构
Sora基于扩散模型(Diffusion Model)，通过逐步去噪的方式生成高质量视频内容。

### 时空补丁技术
创新的时空补丁(Spacetime Patches)技术，将视频数据转换为统一的表示格式。

## 核心能力

### 长时间视频生成
能够生成最长60秒的高分辨率视频内容。

### 多样化场景理解
支持复杂的物理世界模拟和场景理解。

## 应用前景

### 内容创作
革命性改变视频内容创作流程。

### 教育培训
为教育行业提供新的内容生成方式。

### 娱乐产业
推动娱乐产业的数字化转型。

## 技术挑战

当前仍存在一些技术限制和挑战需要解决。

## 未来展望

随着技术的不断发展，视频AI将迎来更广阔的应用空间。
  ` : `
# Sora Video Generation: Technical Deep Dive & Applications

OpenAI's Sora model has achieved breakthrough progress in video generation. This article provides an in-depth analysis of its technical principles and application prospects.

## Technical Principles

### Diffusion Model Architecture
Sora is based on diffusion models, generating high-quality video content through step-by-step denoising.

### Spacetime Patches Technology
Innovative spacetime patches technology converts video data into unified representation format.

## Core Capabilities

### Long-form Video Generation
Capable of generating up to 60 seconds of high-resolution video content.

### Diverse Scene Understanding
Supports complex physical world simulation and scene understanding.

## Application Prospects

### Content Creation
Revolutionarily changes video content creation workflows.

### Education and Training
Provides new content generation methods for the education industry.

### Entertainment Industry
Drives digital transformation of the entertainment industry.

## Technical Challenges

There are still some technical limitations and challenges that need to be addressed.

## Future Outlook

As technology continues to develop, video AI will usher in broader application spaces.
  `;
};

const generateChinaAIIndustryContent = (isZh: boolean): string => {
  return isZh ? `
# 2025年中国AI产业发展报告：市场规模与投资趋势

基于最新统计数据，深入分析中国人工智能产业的发展现状、市场规模、投资热点和未来机遇。

## 市场规模分析

### 整体规模
2025年中国AI产业市场规模预计达到8000亿元。

### 细分领域
- 机器学习：占比35%
- 计算机视觉：占比25%
- 自然语言处理：占比20%
- 语音识别：占比12%
- 其他：占比8%

## 投资趋势

### 融资热点
- 大模型训练和推理
- 行业垂直应用
- AI芯片和硬件
- 数据服务平台

### 地域分布
北京、上海、深圳三地占据投资总额的70%以上。

## 政策环境

国家政策大力支持AI产业发展，为行业提供良好的发展环境。

## 技术发展

### 核心技术突破
在多个核心技术领域取得重要突破。

### 产业应用
AI技术在各行业的应用不断深化。

## 发展机遇

### 数字经济
AI成为数字经济发展的重要引擎。

### 产业升级
推动传统产业的智能化转型升级。

## 面临挑战

### 人才短缺
AI人才供需矛盾依然突出。

### 技术壁垒
核心技术自主创新能力有待提升。

## 未来展望

预计未来5年，中国AI产业将保持高速增长态势。
  ` : `
# China AI Industry 2025: Market Scale & Investment Trends

Based on latest statistics, analyzing China AI industry development, market scale, investment hotspots and future opportunities.

## Market Scale Analysis

### Overall Scale
China's AI industry market size is expected to reach 800 billion yuan in 2025.

### Segmented Areas
- Machine Learning: 35%
- Computer Vision: 25%
- Natural Language Processing: 20%
- Speech Recognition: 12%
- Others: 8%

## Investment Trends

### Investment Hotspots
- Large model training and inference
- Vertical industry applications
- AI chips and hardware
- Data service platforms

### Geographic Distribution
Beijing, Shanghai, and Shenzhen account for more than 70% of total investment.

## Policy Environment

National policies strongly support AI industry development, providing a favorable environment for the industry.

## Technology Development

### Core Technology Breakthroughs
Important breakthroughs have been made in multiple core technology areas.

### Industrial Applications
AI technology applications continue to deepen across various industries.

## Development Opportunities

### Digital Economy
AI becomes an important engine for digital economy development.

### Industry Upgrade
Driving intelligent transformation and upgrading of traditional industries.

## Challenges

### Talent Shortage
The contradiction between AI talent supply and demand remains prominent.

### Technology Barriers
Core technology independent innovation capability needs improvement.

## Future Outlook

It is expected that China's AI industry will maintain high-speed growth in the next five years.
  `;
};

const generateMedicalAIContent = (isZh: boolean): string => {
  return isZh ? `
# AI在医疗诊断中的应用现状与未来展望

人工智能在医疗诊断领域的应用正在快速发展，为医疗行业带来革命性变化。

## 应用现状

### 医疗影像诊断
AI在CT、MRI、X光等影像诊断中表现出色。

### 病理分析
智能病理分析系统提高诊断准确性和效率。

### 药物研发
AI加速新药研发流程，降低研发成本。

## 核心技术

### 深度学习
卷积神经网络在医学影像识别中的应用。

### 计算机视觉
用于医学影像的自动分析和诊断。

### 自然语言处理
处理医疗文本和电子病历。

## 成功案例

### 眼科诊断
AI在糖尿病视网膜病变诊断中的成功应用。

### 癌症筛查
肺癌、乳腺癌等恶性肿瘤的早期筛查。

### 心血管疾病
心电图分析和心血管风险评估。

## 面临挑战

### 数据质量
医疗数据的标准化和质量控制。

### 监管审批
医疗AI产品的审批流程复杂。

### 伦理问题
AI诊断的责任归属和伦理考量。

## 未来发展

### 精准医疗
个性化诊疗方案的制定。

### 远程医疗
AI支持的远程诊断和治疗。

### 预防医学
疾病风险预测和预防干预。

## 市场前景

预计未来几年医疗AI市场将快速增长。
  ` : `
# AI in Medical Diagnosis: Current Status & Future Prospects

AI applications in medical diagnosis are rapidly developing, bringing revolutionary changes to the healthcare industry.

## Current Applications

### Medical Imaging Diagnosis
AI excels in CT, MRI, X-ray and other imaging diagnoses.

### Pathology Analysis
Intelligent pathology analysis systems improve diagnostic accuracy and efficiency.

### Drug Development
AI accelerates new drug development processes and reduces R&D costs.

## Core Technologies

### Deep Learning
Application of convolutional neural networks in medical image recognition.

### Computer Vision
For automatic analysis and diagnosis of medical images.

### Natural Language Processing
Processing medical texts and electronic medical records.

## Success Cases

### Ophthalmology Diagnosis
Successful application of AI in diabetic retinopathy diagnosis.

### Cancer Screening
Early screening for lung cancer, breast cancer and other malignant tumors.

### Cardiovascular Disease
ECG analysis and cardiovascular risk assessment.

## Challenges

### Data Quality
Standardization and quality control of medical data.

### Regulatory Approval
Complex approval processes for medical AI products.

### Ethical Issues
Responsibility attribution and ethical considerations of AI diagnosis.

## Future Development

### Precision Medicine
Development of personalized treatment plans.

### Telemedicine
AI-supported remote diagnosis and treatment.

### Preventive Medicine
Disease risk prediction and preventive intervention.

## Market Prospects

The medical AI market is expected to grow rapidly in the coming years.
  `;
};

const generateRegulationPolicyContent = (isZh: boolean): string => {
  return isZh ? `
# 中国AI监管政策最新解读：算法备案与数据安全

解读最新的AI监管政策法规，分析算法备案要求、数据安全规范对AI企业和开发者的影响。

## 政策背景

### 监管需求
AI技术快速发展带来的监管挑战。

### 法律框架
建立完善的AI监管法律体系。

## 算法备案制度

### 备案要求
具有舆论属性或社会动员能力的算法推荐服务需要备案。

### 备案流程
详细的算法备案申请和审核流程。

### 合规要求
算法透明度和可解释性要求。

## 数据安全规范

### 数据分类
重要数据和核心数据的分类管理。

### 安全措施
数据处理的安全技术和管理措施。

### 跨境传输
数据跨境传输的安全评估。

## 对企业影响

### 合规成本
企业需要增加合规投入和人力成本。

### 技术调整
需要调整现有的算法和数据处理流程。

### 商业模式
可能需要调整部分商业模式。

## 行业响应

### 积极配合
各大AI企业积极配合监管要求。

### 技术创新
在合规框架下继续推进技术创新。

## 国际比较

### 欧盟AI法案
与欧盟AI监管政策的异同。

### 美国监管
美国AI监管政策的特点。

## 未来趋势

监管政策将继续完善，为AI产业健康发展保驾护航。
  ` : `
# China AI Regulation: Algorithm Filing & Data Security

Interpreting latest AI regulatory policies, analyzing algorithm filing requirements and data security impact on AI companies.

## Policy Background

### Regulatory Needs
Regulatory challenges brought by rapid AI technology development.

### Legal Framework
Establishing a comprehensive AI regulatory legal system.

## Algorithm Filing System

### Filing Requirements
Algorithm recommendation services with public opinion attributes or social mobilization capabilities need filing.

### Filing Process
Detailed algorithm filing application and review process.

### Compliance Requirements
Algorithm transparency and explainability requirements.

## Data Security Regulations

### Data Classification
Classified management of important data and core data.

### Security Measures
Security technologies and management measures for data processing.

### Cross-border Transfer
Security assessment of cross-border data transfer.

## Impact on Enterprises

### Compliance Costs
Companies need to increase compliance investment and human resource costs.

### Technical Adjustments
Need to adjust existing algorithms and data processing workflows.

### Business Models
May need to adjust some business models.

## Industry Response

### Active Cooperation
Major AI companies actively cooperate with regulatory requirements.

### Technical Innovation
Continue to promote technological innovation within the compliance framework.

## International Comparison

### EU AI Act
Similarities and differences with EU AI regulatory policies.

### US Regulation
Characteristics of US AI regulatory policies.

## Future Trends

Regulatory policies will continue to improve, ensuring healthy development of the AI industry.
  `;
};

const generateAIStartupsContent = (isZh: boolean): string => {
  return isZh ? `
# 2025年AI独角兽企业盘点：估值与融资分析

盘点2025年最具潜力的AI独角兽企业，分析其估值情况、融资轮次和技术优势。

## 独角兽概览

### 定义标准
估值超过10亿美元的AI初创企业。

### 数量统计
2025年全球AI独角兽企业达到150+家。

## 中国AI独角兽

### 头部企业
- 商汤科技：计算机视觉领域领先
- 旷视科技：AI+物联网解决方案
- 云从科技：人机协同智能平台
- 依图科技：AI芯片和算法

### 估值分析
中国AI独角兽平均估值持续上升。

## 国际AI独角兽

### 美国企业
OpenAI、Anthropic等领先企业。

### 欧洲企业
DeepMind、Stability AI等创新企业。

## 融资趋势

### 融资轮次
多数企业处于B轮到D轮阶段。

### 投资机构
红杉资本、腾讯投资等活跃机构。

### 融资用途
主要用于技术研发和市场拓展。

## 技术优势

### 核心技术
各企业在不同技术领域的专长。

### 专利布局
知识产权保护和专利申请情况。

## 商业模式

### 技术服务
为企业提供AI技术解决方案。

### 平台化
构建AI开放平台生态。

### 行业解决方案
针对特定行业的垂直解决方案。

## 发展挑战

### 商业化难题
从技术到商业化的转换挑战。

### 人才竞争
顶级AI人才的激烈竞争。

### 资金需求
持续的大规模资金投入需求。

## 未来展望

AI独角兽企业将在产业数字化转型中发挥重要作用。
  ` : `
# 2025 AI Unicorns: Valuation & Funding Analysis

Overview of most promising AI unicorns in 2025, analyzing valuations, funding rounds and technical advantages.

## Unicorn Overview

### Definition
AI startups valued at over $1 billion.

### Statistics
150+ global AI unicorn companies in 2025.

## Chinese AI Unicorns

### Leading Companies
- SenseTime: Leading in computer vision
- Megvii: AI+IoT solutions
- CloudWalk: Human-machine collaborative intelligence platform
- YITU: AI chips and algorithms

### Valuation Analysis
Average valuation of Chinese AI unicorns continues to rise.

## International AI Unicorns

### US Companies
Leading companies like OpenAI, Anthropic.

### European Companies
Innovative companies like DeepMind, Stability AI.

## Funding Trends

### Funding Rounds
Most companies are in Series B to D stages.

### Investment Institutions
Active institutions like Sequoia Capital, Tencent Investment.

### Funding Usage
Mainly for R&D and market expansion.

## Technical Advantages

### Core Technologies
Each company's expertise in different technical fields.

### Patent Layout
Intellectual property protection and patent applications.

## Business Models

### Technical Services
Providing AI technology solutions for enterprises.

### Platform Strategy
Building AI open platform ecosystems.

### Industry Solutions
Vertical solutions for specific industries.

## Development Challenges

### Commercialization
Challenges in converting from technology to commercialization.

### Talent Competition
Fierce competition for top AI talent.

### Capital Requirements
Continuous large-scale capital investment needs.

## Future Outlook

AI unicorn companies will play important roles in industrial digital transformation.
  `;
};

const generateGenericContent = (title: string, excerpt: string, category: string, tags: string[], keywords: string[], isZh: boolean): string => {
  const sections = isZh ? [
    '## 概述',
    '## 核心要点',
    '## 深度分析',
    '## 技术细节',
    '## 实际应用',
    '## 行业影响',
    '## 未来趋势',
    '## 总结与展望'
  ] : [
    '## Overview',
    '## Key Points',
    '## In-depth Analysis', 
    '## Technical Details',
    '## Practical Applications',
    '## Industry Impact',
    '## Future Trends',
    '## Summary & Outlook'
  ];
  
  return `
# ${title}

${excerpt}

${sections[0]}

本文将深入探讨${category}相关的重要议题，分析其对AI行业的深远影响。

${sections[1]}

- **技术创新**：${tags[0] || '人工智能'}技术的最新进展
- **市场动态**：行业发展的关键趋势
- **应用场景**：实际应用中的案例分析
- **发展机遇**：未来发展的潜在机会

${sections[2]}

从技术角度来看，${keywords[0] || 'AI技术'}正在经历快速发展和演进。这种发展不仅体现在技术能力的提升，更体现在应用场景的不断拓展。

${sections[3]}

### 核心技术架构
详细分析相关技术的架构设计和实现原理。

### 算法优化
探讨算法优化的方法和策略。

${sections[4]}

### 行业应用
在各个行业中的具体应用案例。

### 解决方案
针对不同场景的解决方案分析。

${sections[5]}

这些技术发展对整个AI行业产生了重要影响，推动了产业升级和商业模式创新。

${sections[6]}

### 发展方向
未来技术发展的主要方向。

### 市场预测
对市场发展趋势的预测分析。

${sections[7]}

综合来看，${category}领域正在经历重要的发展机遇期。随着技术的不断成熟和应用的不断深化，我们有理由相信这个领域将为AI产业带来更多创新和突破。

---

*本文基于最新行业数据和专业分析，为读者提供深入的洞察和参考。*
  `;
};

// RelatedArticles组件
interface RelatedArticlesProps {
  currentArticle: BlogArticle;
  isZh: boolean;
}

const RelatedArticles: React.FC<RelatedArticlesProps> = ({ currentArticle, isZh }) => {
  const [relatedArticles, setRelatedArticles] = useState<BlogArticle[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // 从blog-data.json获取相关文章
    const fetchRelatedArticles = async () => {
      try {
        const response = await fetch('/blog-data.json');
        const blogData = await response.json();
        
        // 过滤相关文章的逻辑
        const related = blogData
          .filter((article: any) => {
            // 排除当前文章
            if (article.id === currentArticle.id) return false;
            
            // 基于标签和分类的相似度计算
            const currentTags = isZh ? currentArticle.tags : [];
            const articleTags = isZh ? article.tags : article.tagsEn;
            const currentCategory = currentArticle.category;
            const articleCategory = isZh ? article.category : article.categoryEn;
            
            // 计算标签重叠度
            const tagOverlap = currentTags.filter(tag => articleTags.includes(tag)).length;
            const categoryMatch = currentCategory === articleCategory;
            
            // 相关性评分
            const relevanceScore = (categoryMatch ? 3 : 0) + tagOverlap;
            return relevanceScore > 0;
          })
          .map((article: any) => {
            // 转换为BlogArticle格式
            return {
              id: article.id,
              title: isZh ? article.title : article.titleEn,
              excerpt: isZh ? article.excerpt : article.excerptEn,
              category: isZh ? article.category : article.categoryEn,
              publishedAt: article.publishedAt,
              readTime: article.readTime,
              author: isZh ? article.author : article.authorEn,
              tags: isZh ? article.tags : article.tagsEn,
              views: article.views,
              likes: article.likes,
              comments: article.comments,
              featured: article.featured
            } as BlogArticle;
          })
          // 按相关性和日期排序
          .sort((a, b) => {
            const aDate = new Date(a.publishedAt).getTime();
            const bDate = new Date(b.publishedAt).getTime();
            return bDate - aDate;
          })
          .slice(0, 3); // 取前3篇
        
        setRelatedArticles(related);
      } catch (error) {
        console.error('Error loading related articles:', error);
      }
    };
    
    fetchRelatedArticles();
  }, [currentArticle, isZh]);

  const handleArticleClick = (articleId: string) => {
    navigate(`/blog/${articleId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isZh 
      ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold flex items-center space-x-2">
        <BookOpen className="w-6 h-6 text-primary" />
        <span>{isZh ? '相关文章' : 'Related Articles'}</span>
      </h3>
      
      <div className="grid md:grid-cols-1 gap-6">
        {relatedArticles.map((article) => (
          <Card 
            key={article.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary"
            onClick={() => handleArticleClick(article.id)}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {article.category}
                </Badge>
                <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{article.readTime} {isZh ? '分钟' : 'min'}</span>
                  </div>
                </div>
              </div>
              
              <h4 className="text-lg font-semibold leading-tight hover:text-primary transition-colors">
                <Link to={`/blog/${article.id}`} className="hover:underline">
                  {article.title}
                </Link>
              </h4>
              
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                {article.excerpt}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  {article.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-primary hover:text-primary/80 p-0 h-auto font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArticleClick(article.id);
                  }}
                >
                  {isZh ? '阅读更多' : 'Read More'}
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      
      {/* 查看更多博客按钮 */}
      <div className="text-center">
        <Button 
          variant="outline" 
          onClick={() => navigate('/blog')}
          className="flex items-center space-x-2"
        >
          <BookOpen className="w-4 h-4" />
          <span>{isZh ? '查看所有博客文章' : 'View All Blog Posts'}</span>
        </Button>
      </div>
    </div>
  );
};

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
    // 从blog-data.json获取文章数据
    const fetchArticle = async () => {
      setLoading(true);
      
      try {
        // 加载博客数据JSON文件
        const response = await fetch('/blog-data.json');
        const blogData = await response.json();
        
        // 查找对应的文章
        const foundArticleData = blogData.find((article: any) => article.id === slug);
        
        if (foundArticleData) {
          // 生成完整的文章内容
          const fullContent = generateArticleContent(foundArticleData, isZh);
          
          // 转换为BlogArticle格式
          const blogArticle: BlogArticle = {
            id: foundArticleData.id,
            title: isZh ? foundArticleData.title : foundArticleData.titleEn,
            content: fullContent,
            excerpt: isZh ? foundArticleData.excerpt : foundArticleData.excerptEn,
            category: isZh ? foundArticleData.category : foundArticleData.categoryEn,
            publishedAt: foundArticleData.publishedAt,
            readTime: foundArticleData.readTime,
            author: isZh ? foundArticleData.author : foundArticleData.authorEn,
            tags: isZh ? foundArticleData.tags : foundArticleData.tagsEn,
            views: foundArticleData.views,
            likes: foundArticleData.likes,
            comments: foundArticleData.comments,
            featured: foundArticleData.featured
          };
          
          setArticle(blogArticle);
        } else {
          setArticle(null);
        }
      } catch (error) {
        console.error('Error loading blog article:', error);
        setArticle(null);
      }
      
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
        
        {/* Schema.org结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://news.aipush.fun/blog/${article.id}`
            },
            "headline": article.title,
            "description": article.excerpt,
            "image": {
              "@type": "ImageObject",
              "url": "https://news.aipush.fun/wechat-share-300.png",
              "width": 300,
              "height": 300
            },
            "author": {
              "@type": "Organization",
              "name": article.author,
              "url": "https://news.aipush.fun"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI推",
              "logo": {
                "@type": "ImageObject",
                "url": "https://news.aipush.fun/favicon.svg",
                "width": 32,
                "height": 32
              },
              "url": "https://news.aipush.fun",
              "sameAs": [
                "https://github.com/ai-push",
                "https://twitter.com/aipushnews"
              ]
            },
            "datePublished": article.publishedAt,
            "dateModified": article.publishedAt,
            "url": `https://news.aipush.fun/blog/${article.id}`,
            "wordCount": article.readTime * 200,
            "keywords": article.tags.join(", "),
            "articleSection": article.category,
            "inLanguage": isZh ? "zh-CN" : "en-US",
            "about": {
              "@type": "Thing",
              "name": "人工智能",
              "sameAs": "https://zh.wikipedia.org/wiki/人工智能"
            },
            "mentions": article.tags.map(tag => ({
              "@type": "Thing",
              "name": tag
            })),
            "speakable": {
              "@type": "SpeakableSpecification",
              "cssSelector": [".article-title", ".article-excerpt"]
            },
            "interactionStatistic": [
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/ReadAction",
                "userInteractionCount": article.views
              },
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/LikeAction",
                "userInteractionCount": article.likes
              },
              {
                "@type": "InteractionCounter",
                "interactionType": "https://schema.org/CommentAction",
                "userInteractionCount": article.comments
              }
            ]
          })}
        </script>
        {/* Breadcrumb 结构化数据 */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": isZh ? "首页" : "Home",
                "item": "https://news.aipush.fun/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": isZh ? "博客" : "Blog",
                "item": "https://news.aipush.fun/blog"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": article.category,
                "item": `https://news.aipush.fun/blog?category=${encodeURIComponent(article.category)}`
              },
              {
                "@type": "ListItem",
                "position": 4,
                "name": article.title,
                "item": `https://news.aipush.fun/blog/${article.id}`
              }
            ]
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
          {/* Breadcrumb Navigation */}
          <div className="space-y-6">
            <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
              <ol className="flex items-center space-x-2">
                <li>
                  <a href="/" className="hover:text-foreground transition-colors">
                    {isZh ? '首页' : 'Home'}
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <span>›</span>
                  <a href="/blog" className="hover:text-foreground transition-colors">
                    {isZh ? '博客' : 'Blog'}
                  </a>
                </li>
                <li className="flex items-center space-x-2">
                  <span>›</span>
                  <span className="text-foreground font-medium">{article.category}</span>
                </li>
              </ol>
            </nav>
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

            <h1 className="text-4xl font-bold leading-tight article-title">
              {article.title}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed article-excerpt">
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
                    img: ({src, alt, title, ...props}) => {
                      // 优化图片SEO和加载性能
                      const optimizedSrc = src?.startsWith('http') ? src : `/images/${src}`;
                      const seoAlt = alt || `${article.title} - AI推技术解读图片`;
                      
                      return (
                        <img 
                          {...props}
                          src={optimizedSrc}
                          alt={seoAlt}
                          title={title || seoAlt}
                          loading="lazy"
                          className="max-w-full h-auto rounded-lg shadow-md my-4"
                          style={{ aspectRatio: 'auto' }}
                          onError={(e) => {
                            // 图片加载失败时的fallback
                            (e.target as HTMLImageElement).src = '/favicon.svg';
                            (e.target as HTMLImageElement).alt = '图片加载失败';
                          }}
                        />
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

          {/* Related Articles */}
          <RelatedArticles currentArticle={article} isZh={isZh} />
        </div>
      </div>
    </>
  );
};

export default BlogArticlePage;