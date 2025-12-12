/**
 * 企业微信工具函数（客户端）
 */

import { getFromStorage, saveToStorage, STORAGE_KEYS } from './storage'
import type { WeChatConfig } from '@/config/wechat.config'

/**
 * 从 localStorage 读取企业微信配置（客户端）
 */
export function getWeChatConfigFromStorage(): WeChatConfig | null {
  return getFromStorage<WeChatConfig>(STORAGE_KEYS.WECHAT_CONFIG)
}

/**
 * 保存企业微信配置到 localStorage（客户端）
 */
export function saveWeChatConfigToStorage(config: WeChatConfig): boolean {
  return saveToStorage(STORAGE_KEYS.WECHAT_CONFIG, config)
}

/**
 * 获取企业微信配置（客户端）
 * 优先使用 localStorage，如果没有则返回默认配置
 */
export function getWeChatConfigClient(): WeChatConfig {
  const stored = getWeChatConfigFromStorage()
  return stored || { enabled: false }
}

/**
 * 验证配置是否完整（客户端）
 */
export function validateWeChatConfigClient(config: WeChatConfig, forWebhook = false): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!config.corpId) missing.push('企业ID (corpId)')
  if (!config.agentId) missing.push('应用ID (agentId)')
  if (!config.secret) missing.push('应用密钥 (secret)')
  
  if (forWebhook) {
    if (!config.token) missing.push('Token')
    if (!config.encodingAESKey) missing.push('EncodingAESKey')
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

