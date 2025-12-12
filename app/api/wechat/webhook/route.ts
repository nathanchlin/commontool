import { NextRequest, NextResponse } from 'next/server'
import type { WeChatMessage, ApiResponse } from '@/types'
import { getWeChatConfig, validateWeChatConfig } from '@/config/wechat.config'

/**
 * 企业微信 Webhook 接收接口
 * 用于接收企业微信的回调消息
 * 
 * GET: 验证回调 URL（企业微信会发送验证请求）
 * POST: 接收消息回调
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const msgSignature = searchParams.get('msg_signature')
    const timestamp = searchParams.get('timestamp')
    const nonce = searchParams.get('nonce')
    const echostr = searchParams.get('echostr')

    if (!msgSignature || !timestamp || !nonce || !echostr) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '缺少验证参数',
      }, { status: 400 })
    }

    // 从配置文件读取配置
    const config = getWeChatConfig()
    const validation = validateWeChatConfig(config, true)
    
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Webhook 配置不完整，缺少: ${validation.missing.join(', ')}`,
      }, { status: 400 })
    }

    // TODO: 实现消息验证逻辑
    // 需要使用配置的 Token 和 EncodingAESKey 进行验证
    // 1. 验证签名（使用 config.token）
    // 2. 解密 echostr（使用 config.encodingAESKey）
    // 3. 返回解密后的 echostr

    // 当前简单返回 echostr（实际应该解密）
    return new NextResponse(echostr, { status: 200 })
  } catch (error: any) {
    console.error('Webhook verification error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || '验证失败',
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // 从配置文件读取配置
    const config = getWeChatConfig()
    const validation = validateWeChatConfig(config, true)
    
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Webhook 配置不完整，缺少: ${validation.missing.join(', ')}`,
      }, { status: 400 })
    }
    
    // TODO: 实现消息解密逻辑
    // 企业微信发送的消息是加密的，需要使用 config.encodingAESKey 解密
    
    // 解析消息（当前假设已解密，实际需要先解密）
    const message: WeChatMessage = {
      id: body.MsgId || Date.now().toString(),
      msgid: body.MsgId || '',
      from: {
        userid: body.FromUserName || '',
        name: body.FromUserName || '',
      },
      roomid: body.RoomId,
      content: body.Content || body.Text?.content || '',
      msgtype: body.MsgType || 'text',
      time: body.CreateTime || Math.floor(Date.now() / 1000),
      raw: body,
    }

    // TODO: 处理消息
    // 1. 保存原始消息
    // 2. 触发 AI 提取
    // 3. 生成日志

    return NextResponse.json<ApiResponse<WeChatMessage>>({
      success: true,
      data: message,
      message: '消息接收成功',
    })
  } catch (error: any) {
    console.error('Webhook message error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || '处理消息失败',
    }, { status: 500 })
  }
}


