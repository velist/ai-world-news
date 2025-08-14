import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useI18nSEO } from '@/hooks/useI18n';

interface I18nSEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  currentPath?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'blog';
  articleMeta?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
}

export const I18nSEO: React.FC<I18nSEOProps> = ({
  title,
  description,
  keywords,
  currentPath = '/',
  ogImage,
  ogType = 'website',
  articleMeta
}) => {
  const { generateI18nMeta, generateHreflang } = useI18nSEO();
  
  const seoData = generateI18nMeta({
    title,
    description,
    keywords,
    currentPath,
    ogImage,
    ogType
  });
  
  const hreflangData = generateHreflang(currentPath);
  
  return (
    <Helmet>
      {/* 基础Meta标签 */}
      <title>{seoData.title}</title>
      <meta name="description" content={seoData.description} />
      <meta name="keywords" content={seoData.keywords} />
      <link rel="canonical" href={seoData.canonical} />
      
      {/* 多语言支持 */}
      {hreflangData.map(({ hreflang, href }) => (
        <link key={hreflang} rel="alternate" hrefLang={hreflang} href={href} />
      ))}\n      
      {/* Open Graph */}
      <meta property="og:title" content={seoData.openGraph.title} />
      <meta property="og:description" content={seoData.openGraph.description} />
      <meta property="og:url" content={seoData.openGraph.url} />
      <meta property="og:type" content={seoData.openGraph.type} />
      <meta property="og:image" content={seoData.openGraph.image} />
      <meta property="og:locale" content={seoData.openGraph.locale} />
      <meta property="og:site_name" content={seoData.openGraph.site_name} />
      
      {/* 文章特定的Meta标签 */}
      {articleMeta && ogType === 'article' && (
        <>
          {articleMeta.publishedTime && (
            <meta property="article:published_time" content={articleMeta.publishedTime} />
          )}
          {articleMeta.modifiedTime && (
            <meta property="article:modified_time" content={articleMeta.modifiedTime} />
          )}
          {articleMeta.author && (
            <meta property="article:author" content={articleMeta.author} />
          )}
          {articleMeta.section && (
            <meta property="article:section" content={articleMeta.section} />
          )}
          {articleMeta.tags && articleMeta.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter卡片 */}
      <meta name="twitter:card" content={seoData.twitter.card} />
      <meta name="twitter:title" content={seoData.twitter.title} />
      <meta name="twitter:description" content={seoData.twitter.description} />
      <meta name="twitter:image" content={seoData.twitter.image} />
      
      {/* 结构化数据 */}
      <script type="application/ld+json">
        {JSON.stringify(seoData.structuredData)}
      </script>
      
      {/* 多语言相关的其他Meta标签 */}
      <meta httpEquiv="content-language" content={seoData.openGraph.locale.replace('_', '-')} />
      <meta name="language" content={seoData.openGraph.locale.replace('_', '-')} />
      
      {/* 移动端优化 */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={seoData.openGraph.site_name} />
    </Helmet>
  );
};