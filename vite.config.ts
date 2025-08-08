import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/', // 使用自定义域名，直接使用根路径
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    rollupOptions: {
      output: {
        // 添加时间戳到文件名，确保缓存更新，使用正斜杠路径
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`
      }
    },
    // 确保输出路径使用正斜杠
    outDir: 'dist'
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

// 生成RSS feed
function generateRSSFeed(newsItems) {
  const siteUrl = 'https://ai-world-news.com';
  const siteTitle = 'AI世界新闻';
  const siteDescription = '最新AI资讯与深度报道';
  
  const items = newsItems.slice(0, 20).map(item => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <description><![CDATA[${item.summary || item.content}]]></description>
      <link>${item.originalUrl}</link>
      <guid>${item.id}</guid>
      <pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate>
      <source url="${siteUrl}">${item.source}</source>
    </item>
  `).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title><![CDATA[${siteTitle}]]></title>
    <description><![CDATA[${siteDescription}]]></description>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
}