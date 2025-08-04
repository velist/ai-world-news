import express from 'express';
import feedRouter from './routes/feed.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// 全局新闻数据缓存
let newsDataCache = null;
let dataLoaded = false;

// 启动时加载新闻数据
async function loadNewsData() {
  try {
    // 使用相对于项目根目录的路径
    const filePath = '../public/news-data.json';
    const absolutePath = join(__dirname, filePath);
    console.log('尝试加载新闻数据，路径:', absolutePath);
    
    const data = await fs.readFile(absolutePath, 'utf8');
    const parsed = JSON.parse(data);
    newsDataCache = parsed.data || [];
    dataLoaded = true;
    console.log('新闻数据加载成功，数量:', newsDataCache.length);
  } catch (error) {
    console.error('加载新闻数据失败:', error.message);
    newsDataCache = [];
  }
}

// 延迟加载数据，确保服务器完全启动
setTimeout(async () => {
  await loadNewsData();
}, 1000);

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 设置 CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// 路由 - 将新闻数据缓存传递给路由
app.use('/api', (req, res, next) => {
  req.newsDataCache = newsDataCache;
  req.dataLoaded = dataLoaded;
  console.log('请求处理 - 数据加载状态:', dataLoaded, '缓存数据数量:', newsDataCache ? newsDataCache.length : 0);
  next();
}, feedRouter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 主页
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// 错误处理
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`RSS feed available at: http://localhost:${PORT}/api/rss.xml`);
  console.log(`JSON feed available at: http://localhost:${PORT}/api/feed.json`);
  console.log(`Sitemap available at: http://localhost:${PORT}/api/sitemap.xml`);
});

export default app;