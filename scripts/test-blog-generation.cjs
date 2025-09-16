#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function testBlogGeneration() {
  try {
    // 读取数据
    const newsDataPath = path.join(__dirname, '..', 'public', 'news-data.json');
    const blogDataPath = path.join(__dirname, '..', 'public', 'blog-data.json');
    
    const newsData = JSON.parse(await fs.promises.readFile(newsDataPath, 'utf8'));
    const blogData = JSON.parse(await fs.promises.readFile(blogDataPath, 'utf8'));
    
    console.log('新闻数据数量:', (newsData.data || newsData).length);
    console.log('博客数据数量:', blogData.length);
    
    // 检查现有博客标题
    const existingTitles = new Set(blogData.map(article => article.title.toLowerCase()));
    console.log('现有博客标题数量:', existingTitles.size);
    
    // 筛选AI相关新闻
    const aiKeywords = [
      'AI', 'ChatGPT', 'GPT', 'OpenAI', 'Google', 'DeepMind', 'Microsoft', 'Anthropic',
      '人工智能', '机器学习', '深度学习', '大模型', '自然语言处理', '计算机视觉',
      '语音识别', '神经网络', 'Transformer', 'LLM', '生成式AI', 'AGI'
    ];
    
    const newsArray = newsData.data || newsData;
    const aiNews = newsArray.filter(news => {
      const text = `${news.title} ${news.summary || news.content || ''}`.toLowerCase();
      return aiKeywords.some(keyword => text.includes(keyword.toLowerCase()));
    });
    
    console.log('AI相关新闻数量:', aiNews.length);
    
    // 检查有多少是新的
    const newNews = aiNews.filter(news => {
      return !existingTitles.has(news.title.toLowerCase());
    });
    
    console.log('未制作博客的AI新闻数量:', newNews.length);
    
    if (newNews.length > 0) {
      console.log('可以生成博客的新闻标题:');
      newNews.slice(0, 5).forEach((news, i) => {
        console.log(`${i+1}. ${news.title}`);
      });
    }
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testBlogGeneration();