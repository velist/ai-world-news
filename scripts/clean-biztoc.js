import fs from 'fs';
import path from 'path';

async function cleanBizTocNews() {
  console.log('开始清理BizToc低质量摘要新闻...');
  
  const publicDir = path.join(process.cwd(), 'public');
  const newsFilePath = path.join(publicDir, 'news-data.json');
  
  if (!fs.existsSync(newsFilePath)) {
    console.error('新闻数据文件不存在');
    return;
  }
  
  const data = JSON.parse(fs.readFileSync(newsFilePath, 'utf8'));
  
  if (!data.data || !Array.isArray(data.data)) {
    console.error('新闻数据格式错误');
    return;
  }
  
  console.log(`原始新闻数量: ${data.data.length}`);
  
  let removedCount = 0;
  
  // 需要排除的新闻源（低质量摘要）
  const excludeSources = ['BizToc', 'biztoc'];
  
  // 需要排除的标题特征（摘要类新闻）
  const excludeTitlePatterns = [
    /特斯拉为何向埃隆·马斯克授予.*美元的股票？/,
    /欧佩克\+增加石油产量将如何影响/,
    /为什么现在有数千名波音工人/,
    /特朗普对印度的新关税将产生什么影响/,
    /美联储就业报告为何导致/,
    /亚马逊为何关闭其Wondery播客工作室/,
    /人工智能如何改变航空公司票价策略/,
    /.*\？.*\？.*\？.*\？/ // 包含多个问号的摘要标题
  ];
  
  const cleanedNews = data.data.filter((news) => {
    // 检查新闻源是否需要排除
    const isExcludedSource = excludeSources.some(source => 
      (news.source && news.source.toLowerCase().includes(source.toLowerCase()))
    );
    
    if (isExcludedSource) {
      console.log(`❌ 移除BizToc摘要新闻: ${news.title.substring(0, 50)}...`);
      removedCount++;
      return false;
    }
    
    // 检查标题是否为摘要类新闻
    const isExcludedTitle = excludeTitlePatterns.some(pattern => 
      pattern.test(news.title)
    );
    
    if (isExcludedTitle) {
      console.log(`❌ 移除摘要类标题: ${news.title.substring(0, 50)}...`);
      removedCount++;
      return false;
    }
    
    return true;
  });
  
  console.log(`\n📊 清理统计:`);
  console.log(`- 移除BizToc等摘要新闻: ${removedCount} 条`);
  console.log(`- 最终保留: ${cleanedNews.length} 条`);
  
  // 保存更新的数据
  const updatedData = {
    ...data,
    data: cleanedNews,
    total: cleanedNews.length,
    timestamp: new Date().toISOString(),
    note: `清理BizToc摘要新闻 - 移除${removedCount}条低质量摘要新闻`
  };
  
  fs.writeFileSync(newsFilePath, JSON.stringify(updatedData, null, 2), 'utf8');
  console.log('\n✅ BizToc摘要新闻清理完成并保存');
}

cleanBizTocNews().catch(console.error);