// 测试API连接的简单脚本
import fs from 'fs';

async function testNewsAPI() {
  console.log('开始测试NewsAPI...');
  
  // 由于我们在本地没有API密钥，我们用免费的测试请求
  try {
    const response = await fetch('https://newsapi.org/v2/everything?q=ai&sortBy=publishedAt&pageSize=5&apiKey=test');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ NewsAPI连接成功，返回', data.articles?.length || 0, '条新闻');
      return true;
    } else {
      console.log('❌ NewsAPI返回错误:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ NewsAPI连接失败:', error.message);
    return false;
  }
}

async function testNewsDataAPI() {
  console.log('\n开始测试NewsData API...');
  
  try {
    const response = await fetch('https://newsdata.io/api/1/news?q=ai&category=technology&language=en&size=5&apikey=test');
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ NewsData API连接成功，返回', data.results?.length || 0, '条新闻');
      return true;
    } else {
      console.log('❌ NewsData API返回错误:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ NewsData API连接失败:', error.message);
    return false;
  }
}

async function testSiliconFlowAPI() {
  console.log('\n开始测试硅基流动API...');
  
  try {
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    const data = await response.json();
    
    if (response.status === 401) {
      console.log('✅ 硅基流动API连接正常（401错误说明接口可访问，只是密钥无效）');
      return true;
    } else if (response.ok) {
      console.log('✅ 硅基流动API连接成功');
      return true;
    } else {
      console.log('❌ 硅基流动API返回错误:', response.status, data.message || data.error);
      return false;
    }
  } catch (error) {
    console.log('❌ 硅基流动API连接失败:', error.message);
    return false;
  }
}

async function main() {
  console.log('=== API连接测试 ===\n');
  
  const newsAPIResult = await testNewsAPI();
  const newsDataResult = await testNewsDataAPI();
  const siliconFlowResult = await testSiliconFlowAPI();
  
  console.log('\n=== 测试结果汇总 ===');
  console.log('NewsAPI:', newsAPIResult ? '✅ 可访问' : '❌ 不可访问');
  console.log('NewsData API:', newsDataResult ? '✅ 可访问' : '❌ 不可访问');
  console.log('硅基流动API:', siliconFlowResult ? '✅ 可访问' : '❌ 不可访问');
  
  if (newsAPIResult || newsDataResult) {
    console.log('\n📰 至少有一个新闻API可用，问题可能在于API密钥配置');
  } else {
    console.log('\n🚫 所有新闻API都不可访问，可能是网络或服务问题');
  }
  
  if (siliconFlowResult) {
    console.log('🤖 AI翻译服务可访问');
  } else {
    console.log('🤖 AI翻译服务不可访问');
  }
}

main().catch(console.error);