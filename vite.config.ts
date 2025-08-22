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
    // 优化构建性能
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : [],
      },
      mangle: {
        safari10: true
      }
    },
    // 调整chunk大小警告阈值 - 降低以提高性能
    chunkSizeWarningLimit: 500,
    // 优化资源大小
    cssCodeSplit: true,
    sourcemap: mode === 'development',
    rollupOptions: {
      output: {
        // 添加时间戳到文件名，确保缓存更新
        entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
        // 手动代码分割策略
        manualChunks: {
          // React 相关
          'react-vendor': ['react', 'react-dom'],
          // 路由
          'router': ['react-router-dom'],
          // UI组件库 - 按使用频率分组
          'ui-core': [
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu'
          ],
          'ui-extended': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-label',
            '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-progress',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-scroll-area',
            '@radix-ui/react-select',
            '@radix-ui/react-separator',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toggle',
            '@radix-ui/react-toggle-group'
          ],
          // 查询库
          'query': ['@tanstack/react-query'],
          // 图表库 - 懒加载，不在首页加载
          'charts': ['chart.js', 'recharts'],
          // Markdown处理
          'markdown': ['react-markdown', 'remark-gfm'],
          // 工具库
          'utils': ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          // 表单处理
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          // 其他第三方库
          'vendor-misc': ['lucide-react', 'sonner', 'cmdk', 'input-otp', 'vaul']
        }
      }
    },
    // 确保输出路径使用正斜杠
    outDir: 'dist'
  },
  plugins: [
    react({
      // SWC优化选项
      plugins: []
    }),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  // 优化依赖预构建
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      'lucide-react'
    ],
    exclude: [
      // 排除大型依赖，让它们按需加载
      'chart.js',
      'recharts',
      'react-markdown'
    ]
  },
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