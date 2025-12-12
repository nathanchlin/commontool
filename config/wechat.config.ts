/**
 * 企业微信配置
 * 
 * 配置优先级（从高到低）：
 * 1. 环境变量 (.env.local)
 * 2. localStorage (前端配置)
 * 3. 默认配置
 */

export interface WeChatConfig {
  // 企业ID
  corpId?: string
  // 应用ID
  agentId?: string
  // 应用密钥
  secret?: string
  // Token（用于验证）
  token?: string
  // EncodingAESKey（用于消息加解密）
  encodingAESKey?: string
  // 是否启用
  enabled?: boolean
}

/**
 * 默认配置
 */
export const defaultWeChatConfig: WeChatConfig = {
  enabled: false,
}

/**
 * 从环境变量读取配置（服务端）
 */
export function getWeChatConfigFromEnv(): WeChatConfig {
  return {
    corpId: process.env.WECHAT_CORP_ID,
    agentId: process.env.WECHAT_AGENT_ID,
    secret: process.env.WECHAT_SECRET,
    token: process.env.WECHAT_TOKEN,
    encodingAESKey: process.env.WECHAT_ENCODING_AES_KEY,
    enabled: process.env.WECHAT_ENABLED === 'true',
  }
}

/**
 * 获取企业微信配置（服务端）
 * 优先使用环境变量
 */
export function getWeChatConfig(): WeChatConfig {
  const envConfig = getWeChatConfigFromEnv()
  
  // 合并配置，环境变量优先
  return {
    ...defaultWeChatConfig,
    ...envConfig,
  }
}

/**
 * 验证配置是否完整
 */
export function validateWeChatConfig(config: WeChatConfig, forWebhook = false): {
  valid: boolean
  missing: string[]
} {
  const missing: string[] = []
  
  if (!config.corpId) missing.push('corpId')
  if (!config.agentId) missing.push('agentId')
  if (!config.secret) missing.push('secret')
  
  if (forWebhook) {
    if (!config.token) missing.push('token')
    if (!config.encodingAESKey) missing.push('encodingAESKey')
  }
  
  return {
    valid: missing.length === 0,
    missing,
  }
}

