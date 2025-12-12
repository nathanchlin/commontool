import { NextRequest, NextResponse } from 'next/server'
import type { WeChatMessage, ApiResponse } from '@/types'

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

    // TODO: 实现消息验证逻辑
    // 需要使用配置的 Token 和 EncodingAESKey 进行验证
    
    if (!msgSignature || !timestamp || !nonce || !echostr) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '缺少验证参数',
      }, { status: 400 })
    }

    // 验证签名并返回 echostr
    // 实际实现需要：
    // 1. 验证签名
    // 2. 解密 echostr
    // 3. 返回解密后的 echostr

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
    
    // TODO: 实现消息解密逻辑
    // 企业微信发送的消息是加密的，需要使用 EncodingAESKey 解密
    
    // 解析消息
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

