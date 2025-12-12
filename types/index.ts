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
