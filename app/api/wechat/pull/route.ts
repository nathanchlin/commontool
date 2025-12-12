import { NextRequest, NextResponse } from 'next/server'
import type { WeChatMessage, ApiResponse } from '@/types'
import { getWeChatConfig, validateWeChatConfig } from '@/config/wechat.config'

/**
 * 企业微信消息拉取 API
 * 用于从企业微信拉取消息数据
 * 
 * 注意：这个接口需要企业微信的 API 权限
 * 当前实现为模拟接口，后续可以接入真实的企业微信 API
 */
export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    const { 
      corpId: requestCorpId,
      agentId: requestAgentId,
      secret: requestSecret,
      startTime, 
      endTime,
      limit = 100 
    } = requestBody

    // 从配置文件读取配置
    const config = getWeChatConfig()
    
    // 如果请求中提供了配置，优先使用请求中的配置（用于前端动态配置）
    const finalConfig = {
      ...config,
      ...(requestCorpId ? { corpId: requestCorpId } : {}),
      ...(requestAgentId ? { agentId: requestAgentId } : {}),
      ...(requestSecret ? { secret: requestSecret } : {}),
    }

    // 验证配置
    const validation = validateWeChatConfig(finalConfig, false)
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `缺少必要的企业微信配置参数: ${validation.missing.join(', ')}`,
      }, { status: 400 })
    }

    // 模拟拉取消息
    // 实际应该调用企业微信 API: https://qyapi.weixin.qq.com/cgi-bin/message/get
    const messages = await pullWeChatMessages({
      corpId: finalConfig.corpId!,
      agentId: finalConfig.agentId!,
      secret: finalConfig.secret!,
      startTime,
      endTime,
      limit,
    })

    return NextResponse.json<ApiResponse<WeChatMessage[]>>({
      success: true,
      data: messages,
    })
  } catch (error: any) {
    console.error('WeChat pull error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || '拉取企业微信消息失败',
    }, { status: 500 })
  }
}

/**
 * 拉取企业微信消息
 * 实际实现需要调用企业微信 API
 */
async function pullWeChatMessages(params: {
  corpId: string
  agentId: string
  secret: string
  startTime?: number
  endTime?: number
  limit?: number
}): Promise<WeChatMessage[]> {
  // TODO: 实现真实的企业微信 API 调用
  // 
  // 1. 获取 access_token
  // GET https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=ID&corpsecret=SECRET
  //
  // 2. 拉取消息（需要企业微信支持的消息拉取 API）
  // 注意：企业微信的消息拉取 API 可能有限制，需要根据实际情况调整
  //
  // 3. 解析消息并返回

  // 当前返回空数组，表示暂无消息
  // 在开发阶段，可以返回模拟数据用于测试
  return []
}

/**
 * GET 方法：获取企业微信配置信息（不包含敏感信息）
 */
export async function GET() {
  const config = getWeChatConfig()
  const validation = validateWeChatConfig(config, false)
  
  return NextResponse.json<ApiResponse>({
    success: true,
    data: {
      message: '企业微信消息拉取接口',
      configured: validation.valid,
      missing: validation.missing,
      note: validation.valid 
        ? '配置已就绪，可以使用拉取功能'
        : `需要配置以下参数: ${validation.missing.join(', ')}`,
      apiDocs: 'https://developer.work.weixin.qq.com/document/path/90239',
    },
  })
}


