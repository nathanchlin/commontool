/**
 * 会议纪要类型定义
 */
export interface MeetingNote {
  id: string
  title: string
  date: string
  participants: string
  content: string
  createdAt: string
}

/**
 * 工具模块类型定义
 */
export interface ToolModule {
  id: string
  name: string
  icon: string
  description: string
  component: React.ComponentType<any>
}

/**
 * 通用响应类型
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

/**
 * 研发日志类型定义
 */
export type DevLogType = 'task' | 'bug' | 'meeting' | 'progress' | 'other'

export interface DevLog {
  id: string
  date: string
  project?: string
  type: DevLogType
  title: string
  participants: string[]
  content: string
  status?: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
  relatedMessages?: string[]
  createdAt: string
  updatedAt: string
}

/**
 * 企业微信消息类型
 */
export interface WeChatMessage {
  id: string
  msgid: string
  from: {
    userid: string
    name?: string
  }
  roomid?: string
  content: string
  msgtype: string
  time: number
  raw?: any
}

/**
 * AI 提取结果类型
 */
export interface AIExtractResult {
  project?: string
  type: DevLogType
  title: string
  participants: string[]
  content: string
  status?: string
  priority?: 'high' | 'medium' | 'low'
  tags?: string[]
  summary?: string
}
