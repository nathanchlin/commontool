import { NextRequest, NextResponse } from 'next/server'
import type { WeChatMessage, ApiResponse } from '@/types'
import { getWeChatConfig, validateWeChatConfig } from '@/config/wechat.config'
import { WeChatCrypto, parseWeChatXML } from '@/utils/wechat-crypto'

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

    // 创建加密解密工具实例
    const crypto = new WeChatCrypto(
      config.token!,
      config.encodingAESKey!,
      config.corpId!
    )

    // 1. 验证签名
    if (!crypto.verifySignature(msgSignature, timestamp, nonce, echostr)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '签名验证失败',
      }, { status: 403 })
    }

    // 2. 解密 echostr
    try {
      const decryptedEchostr = crypto.decrypt(echostr)
      return new NextResponse(decryptedEchostr, { status: 200 })
    } catch (error: any) {
      console.error('解密 echostr 失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `解密失败: ${error.message}`,
      }, { status: 500 })
    }
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
    // 企业微信发送的是 XML 格式，不是 JSON
    const body = await request.text()
    
    // 从配置文件读取配置
    const config = getWeChatConfig()
    const validation = validateWeChatConfig(config, true)
    
    if (!validation.valid) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `Webhook 配置不完整，缺少: ${validation.missing.join(', ')}`,
      }, { status: 400 })
    }

    // 创建加密解密工具实例
    const crypto = new WeChatCrypto(
      config.token!,
      config.encodingAESKey!,
      config.corpId!
    )

    // 解析 XML 获取加密消息
    const xmlData = await parseWeChatXML(body)
    const encryptedMsg = xmlData.xml.Encrypt?.[0]

    if (!encryptedMsg) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '消息格式错误：缺少 Encrypt 字段',
      }, { status: 400 })
    }

    // 从 URL 参数获取签名信息
    const searchParams = request.nextUrl.searchParams
    const msgSignature = searchParams.get('msg_signature')
    const timestamp = searchParams.get('timestamp')
    const nonce = searchParams.get('nonce')

    if (!msgSignature || !timestamp || !nonce) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '缺少签名参数',
      }, { status: 400 })
    }

    // 1. 验证签名
    if (!crypto.verifySignature(msgSignature, timestamp, nonce, encryptedMsg)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '签名验证失败',
      }, { status: 403 })
    }

    // 2. 解密消息
    let decryptedXml: string
    try {
      decryptedXml = crypto.decrypt(encryptedMsg)
    } catch (error: any) {
      console.error('解密消息失败:', error)
      return NextResponse.json<ApiResponse>({
        success: false,
        error: `解密失败: ${error.message}`,
      }, { status: 500 })
    }

    // 3. 解析解密后的 XML
    const messageData = await parseWeChatXML(decryptedXml)
    const msg = messageData.xml

    // 4. 构造消息对象
    const message: WeChatMessage = {
      id: msg.MsgId?.[0] || Date.now().toString(),
      msgid: msg.MsgId?.[0] || '',
      from: {
        userid: msg.FromUserName?.[0] || '',
        name: msg.FromUserName?.[0] || '',
      },
      roomid: undefined, // 群聊消息可能有 RoomId
      content: msg.Content?.[0] || '',
      msgtype: msg.MsgType?.[0] || 'text',
      time: parseInt(msg.CreateTime?.[0] || '0'),
      raw: messageData,
    }

    // 5. 处理消息（异步，不阻塞响应）
    processMessage(message).catch(error => {
      console.error('处理消息失败:', error)
    })

    // 6. 立即返回 success（企业微信要求 5 秒内响应）
    return new NextResponse('success', { status: 200 })
  } catch (error: any) {
    console.error('Webhook message error:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || '处理消息失败',
    }, { status: 500 })
  }
}

/**
 * 处理接收到的消息
 */
async function processMessage(message: WeChatMessage) {
  console.log('收到企业微信消息:', {
    id: message.id,
    from: message.from.userid,
    type: message.msgtype,
    content: message.content.substring(0, 50),
  })

  // 1. 如果是文本消息，触发 AI 提取并自动生成日志
  if (message.msgtype === 'text' && message.content) {
    try {
      // 调用 AI 提取 API
      const extractResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/ai/extract`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [message.content],
        }),
      })

      if (extractResponse.ok) {
        const extractResult = await extractResponse.json()
        if (extractResult.success && extractResult.data) {
          // 2. 根据 AI 提取结果创建研发日志
          const devLog: import('@/types').DevLog = {
            id: `wechat-${message.id}-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            project: extractResult.data.project,
            type: extractResult.data.type,
            title: extractResult.data.title,
            participants: extractResult.data.participants || [],
            content: extractResult.data.content || message.content,
            status: extractResult.data.status,
            priority: extractResult.data.priority,
            tags: extractResult.data.tags,
            relatedMessages: [message.content],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          // 3. 保存研发日志
          try {
            const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/dev-logs/save`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(devLog),
            })

            if (saveResponse.ok) {
              const saveResult = await saveResponse.json()
              if (saveResult.success) {
                console.log('研发日志自动保存成功:', devLog.id)
              } else {
                console.error('保存研发日志失败:', saveResult.error)
              }
            } else {
              console.error('保存研发日志请求失败:', saveResponse.status)
            }
          } catch (error) {
            console.error('保存研发日志异常:', error)
          }
        }
      }
    } catch (error) {
      console.error('AI 提取失败:', error)
    }
  }
}


