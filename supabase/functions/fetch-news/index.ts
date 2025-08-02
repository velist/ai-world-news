import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  title: string
  description: string
  content: string
  urlToImage: string
  source: { name: string }
  publishedAt: string
  url: string
  category?: string
}

// 翻译函数
async function translateText(text: string, targetLang: string = 'zh'): Promise<string> {
  try {
    // 使用硅基流动API进行翻译
    const siliconflowKey = Deno.env.get('SILICONFLOW_API_KEY')
    if (siliconflowKey) {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${siliconflowKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'Qwen/Qwen2.5-7B-Instruct',
          messages: [
            {
              role: 'user',
              content: `请将以下英文翻译成中文，保持原意和专业性：\n\n${text}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.choices[0]?.message?.content || text
      }
    }
    
    // 备用：腾讯翻译API
    const tencentId = Deno.env.get('TENCENT_SECRET_ID')
    const tencentKey = Deno.env.get('TENCENT_SECRET_KEY')
    
    if (tencentId && tencentKey) {
      // 简化的腾讯翻译实现
      // 实际生产环境需要正确的签名算法
      console.log('Using Tencent Translation as fallback')
    }
    
    return text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

// AI点评函数
async function generateAIInsight(title: string, content: string): Promise<string> {
  try {
    const siliconflowKey = Deno.env.get('SILICONFLOW_API_KEY')
    if (!siliconflowKey) return ''
    
    const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${siliconflowKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'Qwen/Qwen2.5-7B-Instruct',
        messages: [
          {
            role: 'user',
            content: `作为AI科技新闻分析师，请对以下新闻进行深度点评分析，从技术发展、行业影响、未来趋势等角度提供洞察，字数在150-200字：

标题：${title}

内容：${content.substring(0, 1000)}...`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.choices[0]?.message?.content || ''
    }
    
    return ''
  } catch (error) {
    console.error('AI insight generation error:', error)
    return ''
  }
}

// 获取新闻数据
async function fetchNews(): Promise<NewsItem[]> {
  const newsApiKey = Deno.env.get('NEWS_API_KEY')
  const newsdataApiKey = Deno.env.get('NEWSDATA_API_KEY')
  
  let allNews: NewsItem[] = []
  
  // 尝试NewsAPI
  if (newsApiKey) {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=artificial+intelligence+OR+AI+OR+machine+learning+OR+deep+learning&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`
      )
      
      if (response.ok) {
        const data = await response.json()
        allNews = [...allNews, ...data.articles]
      }
    } catch (error) {
      console.error('NewsAPI error:', error)
    }
  }
  
  // 尝试NewsData
  if (newsdataApiKey && allNews.length < 10) {
    try {
      const response = await fetch(
        `https://newsdata.io/api/1/news?apikey=${newsdataApiKey}&q=artificial+intelligence&category=technology&language=en&size=10`
      )
      
      if (response.ok) {
        const data = await response.json()
        const formattedNews = data.results?.map((item: any) => ({
          title: item.title,
          description: item.description,
          content: item.content || item.description,
          urlToImage: item.image_url,
          source: { name: item.source_id },
          publishedAt: item.pubDate,
          url: item.link
        })) || []
        
        allNews = [...allNews, ...formattedNews]
      }
    } catch (error) {
      console.error('NewsData error:', error)
    }
  }
  
  return allNews.slice(0, 20) // 限制数量
}

// 分类新闻
function categorizeNews(title: string, content: string): string {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  if (titleLower.includes('gpt') || titleLower.includes('llm') || titleLower.includes('model')) {
    return 'AI 模型'
  } else if (titleLower.includes('chip') || titleLower.includes('gpu') || titleLower.includes('nvidia')) {
    return '科技'
  } else if (titleLower.includes('economy') || titleLower.includes('market') || titleLower.includes('revenue')) {
    return '经济'
  } else {
    return '深度分析'
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Fetching latest AI news...')
    
    // 获取原始新闻
    const rawNews = await fetchNews()
    console.log(`Fetched ${rawNews.length} news articles`)
    
    // 处理每条新闻
    const processedNews = await Promise.all(
      rawNews.map(async (item, index) => {
        try {
          // 翻译标题和摘要
          const translatedTitle = await translateText(item.title)
          const translatedSummary = await translateText(item.description || item.title)
          const translatedContent = item.content ? await translateText(item.content) : translatedSummary
          
          // 生成AI点评
          const aiInsight = await generateAIInsight(translatedTitle, translatedContent)
          
          return {
            id: `news_${Date.now()}_${index}`,
            title: translatedTitle,
            summary: translatedSummary,
            content: translatedContent,
            imageUrl: item.urlToImage || `https://via.placeholder.com/400x200?text=AI+News+${index + 1}`,
            source: item.source.name,
            publishedAt: item.publishedAt,
            category: categorizeNews(item.title, item.content || item.description || ''),
            originalUrl: item.url,
            aiInsight: aiInsight
          }
        } catch (error) {
          console.error(`Error processing news item ${index}:`, error)
          return null
        }
      })
    )
    
    // 过滤掉处理失败的新闻
    const validNews = processedNews.filter(item => item !== null)
    
    console.log(`Successfully processed ${validNews.length} news articles`)
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: validNews,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
    
  } catch (error) {
    console.error('Error in fetch-news function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})