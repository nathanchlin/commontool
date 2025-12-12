import { NextRequest, NextResponse } from 'next/server'
import type { AIExtractResult, ApiResponse } from '@/types'

/**
 * AI 信息提取 API
 * 从聊天内容中提取关键信息并生成结构化日志
 */
export async function POST(request: NextRequest) {
  try {
    const { messages, project } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '消息内容不能为空',
      }, { status: 400 })
    }

    // 合并所有消息内容
    const combinedContent = messages
      .map((msg: any) => {
        if (typeof msg === 'string') return msg
        return msg.content || msg.text || JSON.stringify(msg)
      })
      .join('\n')

    // 调用 AI 提取信息
    // 注意：这里需要配置你的 AI API（OpenAI、本地模型等）
    const extractResult = await extractWithAI(combinedContent, project)

    return NextResponse.json<ApiResponse<AIExtractResult>>({
      success: true,
      data: extractResult,
    })
  } catch (error: any) {
    console.error('AI extract error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || 'AI 信息提取失败',
    }, { status: 500 })
  }
}

/**
 * 使用 AI 提取关键信息
 * 这里实现一个基础版本，后续可以接入 OpenAI、Claude 等
 */
async function extractWithAI(content: string, project?: string): Promise<AIExtractResult> {
  // TODO: 接入真实的 AI API
  // 当前实现一个基于规则的提取逻辑作为 fallback

  const lowerContent = content.toLowerCase()

  // 判断类型
  let type: AIExtractResult['type'] = 'other'
  if (lowerContent.includes('bug') || lowerContent.includes('错误') || lowerContent.includes('问题')) {
    type = 'bug'
  } else if (lowerContent.includes('任务') || lowerContent.includes('需求') || lowerContent.includes('开发')) {
    type = 'task'
  } else if (lowerContent.includes('会议') || lowerContent.includes('讨论') || lowerContent.includes('评审')) {
    type = 'meeting'
  } else if (lowerContent.includes('完成') || lowerContent.includes('进度') || lowerContent.includes('状态')) {
    type = 'progress'
  }

  // 提取标题（取第一行或前50个字符）
  const lines = content.split('\n').filter(line => line.trim())
  const title = lines[0]?.trim().substring(0, 50) || '未命名日志'

  // 提取人员（简单匹配，实际应该用 AI）
  const participants: string[] = []
  const namePatterns = [
    /@(\w+)/g,
    /([A-Z][a-z]+ [A-Z][a-z]+)/g, // 英文名
    /([\u4e00-\u9fa5]{2,4})/g, // 中文名
  ]
  
  namePatterns.forEach(pattern => {
    const matches = content.match(pattern)
    if (matches) {
      participants.push(...matches.map(m => m.replace('@', '')))
    }
  })

  // 去重
  const uniqueParticipants = Array.from(new Set(participants)).slice(0, 10)

  // 判断优先级
  let priority: AIExtractResult['priority'] = 'medium'
  if (lowerContent.includes('紧急') || lowerContent.includes('urgent') || lowerContent.includes('高优先级')) {
    priority = 'high'
  } else if (lowerContent.includes('低优先级') || lowerContent.includes('low priority')) {
    priority = 'low'
  }

  // 提取状态
  let status: string | undefined
  if (lowerContent.includes('完成') || lowerContent.includes('done')) {
    status = '已完成'
  } else if (lowerContent.includes('进行中') || lowerContent.includes('in progress')) {
    status = '进行中'
  } else if (lowerContent.includes('待开始') || lowerContent.includes('todo')) {
    status = '待开始'
  }

  // 提取标签
  const tags: string[] = []
  const tagKeywords = ['前端', '后端', '测试', '部署', '优化', '重构', '修复']
  tagKeywords.forEach(keyword => {
    if (content.includes(keyword)) {
      tags.push(keyword)
    }
  })

  return {
    project: project || undefined,
    type,
    title,
    participants: uniqueParticipants,
    content: content.substring(0, 2000), // 限制长度
    status,
    priority,
    tags: tags.length > 0 ? tags : undefined,
    summary: lines.slice(0, 3).join(' ').substring(0, 200),
  }
}

