/**
 * 本地存储工具函数
 */

const STORAGE_KEYS = {
  MEETING_NOTES: 'meetingNotes',
  DEV_LOGS: 'devLogs',
  WECHAT_CONFIG: 'wechatConfig',
} as const

/**
 * 从 localStorage 获取数据
 */
export function getFromStorage<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : null
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return null
  }
}

/**
 * 保存数据到 localStorage
 */
export function saveToStorage<T>(key: string, value: T): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error)
    return false
  }
}

/**
 * 从 localStorage 删除数据
 */
export function removeFromStorage(key: string): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`Error removing from localStorage key "${key}":`, error)
    return false
  }
}

/**
 * 清空所有 localStorage 数据
 */
export function clearStorage(): boolean {
  if (typeof window === 'undefined') return false
  
  try {
    localStorage.clear()
    return true
  } catch (error) {
    console.error('Error clearing localStorage:', error)
    return false
  }
}

export { STORAGE_KEYS }

