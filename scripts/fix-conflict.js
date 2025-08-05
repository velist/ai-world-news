import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ES模块环境下获取__dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取有冲突的文件
const filePath = path.join(__dirname, '..', 'public', 'news-data.json');
const content = fs.readFileSync(filePath, 'utf8');

// 移除Git合并冲突标记
const cleanContent = content.replace(/<<<<<<< HEAD[\s\S]*?=======/g, '')
                           .replace(/>>>>>>> [^\n]+/g, '');

// 解析JSON
const data = JSON.parse(cleanContent);

// 重新保存
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('已修复合并冲突，保存到 news-data.json');