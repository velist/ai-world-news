import fetch from 'node-fetch';

// 从URL抓取原文内容
async function fetchFullContent(url) {
  try {
    console.log(`正在抓取原文: ${url}`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1'
      },
      timeout: 10000 // 10秒超时
    });

    if (!response.ok) {
      console.log(`HTTP错误: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    
    // 使用正则表达式提取内容，而不是依赖jsdom
    const content = extractContentFromHTML(html);
    
    if (!content || content.length < 100) {
      console.log('提取的内容太短或为空');
      return null;
    }

    console.log(`成功提取内容，长度: ${content.length}`);
    return content;

  } catch (error) {
    console.error(`抓取原文失败: ${error.message}`);
    return null;
  }
}

// 从HTML中提取正文内容
function extractContentFromHTML(html) {
  if (!html) return '';

  // 移除script和style标签
  let cleaned = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  
  // 尝试提取主要内容区域
  const contentPatterns = [
    // 机器之心
    /<div[^>]*class="[^"]*article-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // 36氪
    /<div[^>]*class="[^"]*common-width[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // 钛媒体
    /<div[^>]*class="[^"]*post-content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // InfoQ
    /<div[^>]*class="[^"]*content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // IT之家
    /<div[^>]*class="[^"]*post_content[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
    // 通用article标签
    /<article[^>]*>([\s\S]*?)<\/article>/gi,
    // 通用main标签
    /<main[^>]*>([\s\S]*?)<\/main>/gi
  ];

  let extractedContent = '';
  
  for (const pattern of contentPatterns) {
    const matches = cleaned.match(pattern);
    if (matches && matches.length > 0) {
      extractedContent = matches[0];
      break;
    }
  }

  // 如果没有找到特定的内容区域，使用body标签
  if (!extractedContent) {
    const bodyMatch = cleaned.match(/<body[^>]*>([\s\S]*?)<\/body>/gi);
    if (bodyMatch && bodyMatch.length > 0) {
      extractedContent = bodyMatch[0];
    } else {
      extractedContent = cleaned;
    }
  }

  // 移除HTML标签
  let textContent = extractedContent.replace(/<[^>]+>/g, ' ');
  
  // 解码HTML实体
  textContent = textContent
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x[0-9a-fA-F]+;/g, '')
    .replace(/&#[0-9]+;/g, '');

  return cleanExtractedContent(textContent);
}

// 清理提取的内容
function cleanExtractedContent(text) {
  if (!text) return '';

  let cleaned = text
    // 移除多余的空白字符
    .replace(/\s+/g, ' ')
    // 移除广告和无关信息
    .replace(/.*?关注.*?微信.*?|.*?订阅.*?|.*?分享.*?|.*?转载.*?/gi, '')
    .replace(/IT之家.*?消息.*?|36氪获悉.*?|钛媒体.*?消息.*?/gi, '')
    .replace(/.*?更多精彩内容.*?|.*?点击.*?查看.*?|.*?阅读原文.*?/gi, '')
    // 移除链接相关文本
    .replace(/https?:\/\/[^\s]+/g, '')
    // 移除版权信息
    .replace(/.*?版权.*?|.*?声明.*?|.*?免责.*?/gi, '')
    .trim();

  // 如果内容太长，截取前1500字符用于AI处理（节省免费token）
  if (cleaned.length > 1500) {
    cleaned = cleaned.substring(0, 1500);
  }

  return cleaned;
}

// 使用硅基流动AI生成摘要（免费模型）
async function generateSummaryWithSiliconFlow(title, content) {
  // 免费模型选择列表（按优先级排序）
  const freeModels = [
    'Qwen/Qwen2.5-7B-Instruct',    // 主选：最适合中文文本理解和生成
    'Qwen/Qwen3-8B',               // 备选：新版本模型
    'THUDM/GLM-4-9B-0414',         // 备选：GLM系列
    'internlm/internlm2_5-7b-chat' // 备选：书生模型
  ];

  for (const model of freeModels) {
    try {
      const siliconflowKey = process.env.SILICONFLOW_API_KEY;
      if (!siliconflowKey) {
        console.log('硅基流动API密钥未配置');
        return null;
      }

      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${siliconflowKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的新闻摘要编辑。请根据提供的新闻标题和内容，生成一个简洁、准确、吸引人的摘要，字数控制在120-150字以内。摘要应该突出新闻的核心信息和重要观点，使用简洁明了的语言。'
            },
            {
              role: 'user',
              content: `请为以下新闻生成摘要：

标题：${title}

内容：${content}

请生成一个120-150字的新闻摘要：`
            }
          ],
          max_tokens: 180, // 减少token使用
          temperature: 0.2 // 降低temperature以节省token
        })
      });

      if (response.ok) {
        const data = await response.json();
        const summary = data.choices[0]?.message?.content?.trim();
        
        if (summary && summary.length > 50) {
          console.log(`硅基流动生成摘要成功（模型：${model}），长度: ${summary.length}`);
          return summary;
        }
      } else {
        console.error(`硅基流动API调用失败（模型：${model}）: ${response.status} ${response.statusText}`);
        // 继续尝试下一个模型
        continue;
      }
    } catch (error) {
      console.error(`硅基流动摘要生成错误（模型：${model}）:`, error);
      // 继续尝试下一个模型
      continue;
    }
  }
  
  return null;
}

// 使用智谱清言AI生成摘要（GLM-4.5-flash免费模型）
async function generateSummaryWithZhipu(title, content) {
  try {
    const zhipuApiKey = process.env.ZHIPUAI_API_KEY;
    if (!zhipuApiKey) {
      console.log('智谱清言API密钥未配置');
      return null;
    }

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${zhipuApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'glm-4-flash', // GLM-4.5的flash模型（免费）
        messages: [
          {
            role: 'system',
            content: '你是一个专业的新闻摘要编辑。请根据提供的新闻标题和内容，生成一个简洁、准确、吸引人的摘要，字数控制在120-150字以内。摘要应该突出新闻的核心信息和重要观点，使用简洁明了的语言。'
          },
          {
            role: 'user',
            content: `请为以下新闻生成摘要：

标题：${title}

内容：${content}

请生成一个120-150字的新闻摘要：`
          }
        ],
        max_tokens: 180, // 减少token使用
        temperature: 0.2 // 降低temperature以节省token
      })
    });

    if (response.ok) {
      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim();
      
      if (summary && summary.length > 50) {
        console.log(`智谱清言生成摘要成功，长度: ${summary.length}`);
        return summary;
      }
    } else {
      console.error('智谱清言API调用失败:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('智谱清言摘要生成错误:', error);
  }
  
  return null;
}

// 生成传统摘要（备用方案）
function generateTraditionalSummary(title, content) {
  if (!content || content.length < 50) {
    return title;
  }

  // 简单的摘要生成：取前150字符
  let summary = content.substring(0, 150);
  
  // 尝试在句号处截断
  const lastPeriod = summary.lastIndexOf('。');
  const lastExclamation = summary.lastIndexOf('！');
  const lastQuestion = summary.lastIndexOf('？');
  
  const lastSentenceEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
  
  if (lastSentenceEnd > 50) {
    summary = summary.substring(0, lastSentenceEnd + 1);
  } else {
    summary += '...';
  }

  console.log(`使用传统方法生成摘要，长度: ${summary.length}`);
  return summary;
}

// 主要的AI摘要生成函数
export async function generateAISummary(title, originalUrl, existingContent = '') {
  try {
    console.log(`开始为新闻生成AI摘要: ${title}`);

    // 首先尝试抓取原文
    let fullContent = null;
    if (originalUrl && originalUrl !== '#' && !originalUrl.includes('javascript:')) {
      fullContent = await fetchFullContent(originalUrl);
    }

    // 如果没有抓取到原文，使用现有内容
    let contentToUse = fullContent || existingContent || title;

    // 进一步限制内容长度以适应免费模型
    if (contentToUse.length > 1000) {
      contentToUse = contentToUse.substring(0, 1000);
    }

    if (contentToUse.length < 50) {
      console.log('内容太短，直接返回标题');
      return title;
    }

    // 首先尝试硅基流动
    let summary = await generateSummaryWithSiliconFlow(title, contentToUse);
    if (summary) {
      return summary;
    }

    // 然后尝试智谱清言
    summary = await generateSummaryWithZhipu(title, contentToUse);
    if (summary) {
      return summary;
    }

    // 最后使用传统方法
    console.log('AI摘要生成失败，使用传统方法');
    return generateTraditionalSummary(title, contentToUse);

  } catch (error) {
    console.error('AI摘要生成过程出错:', error);
    return generateTraditionalSummary(title, existingContent || title);
  }
}

export default {
  generateAISummary,
  fetchFullContent,
  generateSummaryWithSiliconFlow,
  generateSummaryWithZhipu
};