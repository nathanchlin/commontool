# 企业微信官方 API 消息监听实现思路

## 一、整体架构

```
企业微信服务器
    ↓ (推送消息)
Webhook 回调 URL (你的服务器)
    ↓ (接收并解密)
消息处理服务
    ↓ (提取信息)
AI 信息提取
    ↓ (生成日志)
研发日志系统
```

## 二、核心流程

### 1. 配置阶段

#### 步骤 1：创建企业应用
1. 登录企业微信管理后台：https://work.weixin.qq.com/
2. 进入「应用管理」→「应用」→「自建」
3. 创建应用，获取：
   - `corpId`：企业ID
   - `agentId`：应用ID
   - `secret`：应用密钥

#### 步骤 2：配置接收消息
1. 在应用详情页，找到「接收消息」设置
2. 配置以下信息：
   - **回调 URL**：`https://your-domain.com/api/wechat/webhook`
   - **Token**：自定义字符串（用于验证签名）
   - **EncodingAESKey**：自动生成或自定义（用于消息加解密）

#### 步骤 3：验证回调 URL
企业微信会发送 GET 请求验证你的服务器：
```
GET /api/wechat/webhook?msg_signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx
```

你需要：
1. 验证签名（使用 Token）
2. 解密 echostr（使用 EncodingAESKey）
3. 返回解密后的 echostr

### 2. 消息接收阶段

#### 消息推送流程
```
1. 企业微信用户发送消息
   ↓
2. 企业微信服务器加密消息
   ↓
3. POST 请求到你的回调 URL
   ↓
4. 你的服务器验证签名
   ↓
5. 解密消息内容
   ↓
6. 处理消息（保存、AI提取、生成日志）
   ↓
7. 返回成功响应
```

## 三、技术实现

### 1. 消息验证和解密

企业微信使用 **AES-256-CBC** 加密，需要实现：

#### 签名验证算法
```typescript
// 1. 将 token、timestamp、nonce、加密消息体排序
const tmpArr = [token, timestamp, nonce, encryptedMsg].sort()
const tmpStr = tmpArr.join('')
const signature = sha1(tmpStr)

// 2. 验证签名是否匹配
if (signature !== msgSignature) {
  throw new Error('签名验证失败')
}
```

#### 消息解密算法
```typescript
// 1. Base64 解码
const encrypted = Buffer.from(encryptedMsg, 'base64')

// 2. AES 解密
const decipher = crypto.createDecipheriv(
  'aes-256-cbc',
  aesKey, // 从 EncodingAESKey 派生
  iv
)

// 3. 去除随机字符串和填充
const decrypted = decipher.update(encrypted) + decipher.final()
const message = removePadding(decrypted)
```

### 2. 消息格式

解密后的消息格式（XML）：
```xml
<xml>
  <ToUserName><![CDATA[toUser]]></ToUserName>
  <FromUserName><![CDATA[fromUser]]></FromUserName>
  <CreateTime>1348831860</CreateTime>
  <MsgType><![CDATA[text]]></MsgType>
  <Content><![CDATA[消息内容]]></Content>
  <MsgId>1234567890123456</MsgId>
  <AgentID>1</AgentID>
</xml>
```

### 3. 消息类型

企业微信支持多种消息类型：
- **text**：文本消息
- **image**：图片消息
- **voice**：语音消息
- **video**：视频消息
- **file**：文件消息
- **location**：位置消息
- **link**：链接消息

## 四、代码实现思路

### 1. 安装依赖

```bash
npm install xml2js crypto-js
# 或
npm install xml2js node-crypto
```

### 2. 实现加密解密工具

```typescript
// utils/wechat-crypto.ts
import crypto from 'crypto'
import { parseString } from 'xml2js'

export class WeChatCrypto {
  private token: string
  private encodingAESKey: string
  private corpId: string

  constructor(token: string, encodingAESKey: string, corpId: string) {
    this.token = token
    this.encodingAESKey = encodingAESKey
    this.corpId = corpId
  }

  // 验证签名
  verifySignature(signature: string, timestamp: string, nonce: string, encryptedMsg: string): boolean {
    const tmpArr = [this.token, timestamp, nonce, encryptedMsg].sort()
    const tmpStr = tmpArr.join('')
    const hash = crypto.createHash('sha1').update(tmpStr).digest('hex')
    return hash === signature
  }

  // 解密消息
  decrypt(encryptedMsg: string): string {
    // 1. Base64 解码
    const key = Buffer.from(this.encodingAESKey + '=', 'base64')
    const encrypted = Buffer.from(encryptedMsg, 'base64')

    // 2. 提取 IV（前16字节）和实际加密内容
    const iv = encrypted.slice(0, 16)
    const ciphertext = encrypted.slice(16)

    // 3. AES 解密
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    let decrypted = decipher.update(ciphertext)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    // 4. 去除填充和随机字符串
    const contentLength = decrypted.readUInt32BE(16)
    const content = decrypted.slice(20, 20 + contentLength).toString('utf8')
    const fromCorpId = decrypted.slice(20 + contentLength).toString('utf8')

    // 5. 验证 corpId
    if (fromCorpId !== this.corpId) {
      throw new Error('corpId 不匹配')
    }

    return content
  }

  // 加密消息（用于回复）
  encrypt(message: string): string {
    // 实现加密逻辑（如果需要回复消息）
    // ...
  }
}
```

### 3. 实现 Webhook 路由

```typescript
// app/api/wechat/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { WeChatCrypto } from '@/utils/wechat-crypto'
import { getWeChatConfig } from '@/config/wechat.config'
import { parseString } from 'xml2js'

// GET: 验证回调 URL
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const msgSignature = searchParams.get('msg_signature')
  const timestamp = searchParams.get('timestamp')
  const nonce = searchParams.get('nonce')
  const echostr = searchParams.get('echostr')

  if (!msgSignature || !timestamp || !nonce || !echostr) {
    return new NextResponse('缺少参数', { status: 400 })
  }

  const config = getWeChatConfig()
  if (!config.token || !config.encodingAESKey || !config.corpId) {
    return new NextResponse('配置不完整', { status: 500 })
  }

  const crypto = new WeChatCrypto(
    config.token,
    config.encodingAESKey,
    config.corpId
  )

  // 验证签名
  if (!crypto.verifySignature(msgSignature, timestamp, nonce, echostr)) {
    return new NextResponse('签名验证失败', { status: 403 })
  }

  // 解密 echostr
  try {
    const decryptedEchostr = crypto.decrypt(echostr)
    return new NextResponse(decryptedEchostr, { status: 200 })
  } catch (error) {
    console.error('解密失败:', error)
    return new NextResponse('解密失败', { status: 500 })
  }
}

// POST: 接收消息
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    const config = getWeChatConfig()
    if (!config.token || !config.encodingAESKey || !config.corpId) {
      return NextResponse.json({ error: '配置不完整' }, { status: 500 })
    }

    const crypto = new WeChatCrypto(
      config.token,
      config.encodingAESKey,
      config.corpId
    )

    // 解析 XML
    const xmlData = await parseXML(body)
    const encryptedMsg = xmlData.xml.Encrypt[0]

    // 从 URL 参数获取签名信息
    const searchParams = request.nextUrl.searchParams
    const msgSignature = searchParams.get('msg_signature')
    const timestamp = searchParams.get('timestamp')
    const nonce = searchParams.get('nonce')

    // 验证签名
    if (!crypto.verifySignature(msgSignature!, timestamp!, nonce!, encryptedMsg)) {
      return NextResponse.json({ error: '签名验证失败' }, { status: 403 })
    }

    // 解密消息
    const decryptedXml = crypto.decrypt(encryptedMsg)
    const messageData = await parseXML(decryptedXml)
    const message = messageData.xml

    // 处理消息
    await processMessage({
      toUserName: message.ToUserName[0],
      fromUserName: message.FromUserName[0],
      createTime: parseInt(message.CreateTime[0]),
      msgType: message.MsgType[0],
      content: message.Content?.[0] || '',
      msgId: message.MsgId[0],
      agentId: message.AgentID[0],
    })

    // 返回成功（必须返回 success）
    return new NextResponse('success', { status: 200 })
  } catch (error: any) {
    console.error('处理消息失败:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// 解析 XML
function parseXML(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    parseString(xml, { explicitArray: true }, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

// 处理消息
async function processMessage(message: any) {
  // 1. 保存原始消息
  console.log('收到消息:', message)

  // 2. 触发 AI 提取（如果是文本消息）
  if (message.msgType === 'text' && message.content) {
    // 调用 AI 提取 API
    await fetch('/api/ai/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [message.content],
      }),
    })
  }

  // 3. 生成日志
  // ...
}
```

## 五、完整实现步骤

### 步骤 1：安装依赖

```bash
npm install xml2js @types/xml2js
```

### 步骤 2：实现加密解密工具

创建 `utils/wechat-crypto.ts`（见上方代码）

### 步骤 3：更新 Webhook 路由

更新 `app/api/wechat/webhook/route.ts`（见上方代码）

### 步骤 4：配置企业微信

1. 在管理后台配置回调 URL
2. 设置 Token 和 EncodingAESKey
3. 保存配置

### 步骤 5：测试

1. 在企业微信中发送消息
2. 检查服务器日志，确认收到消息
3. 验证消息是否正确解密和处理

## 六、注意事项

### 1. 安全性
- ✅ 必须验证签名，防止伪造请求
- ✅ 必须验证 corpId，确保消息来源正确
- ✅ 使用 HTTPS 保护传输安全

### 2. 性能
- ✅ 消息处理要快速（建议 < 5 秒）
- ✅ 如果处理时间较长，先返回 success，再异步处理
- ✅ 实现消息去重（使用 msgId）

### 3. 错误处理
- ✅ 网络错误要重试
- ✅ 解密失败要记录日志
- ✅ 返回错误时，企业微信会重试（最多 3 次）

### 4. 消息去重
```typescript
const processedMsgIds = new Set<string>()

async function processMessage(message: any) {
  // 检查是否已处理
  if (processedMsgIds.has(message.msgId)) {
    console.log('消息已处理，跳过:', message.msgId)
    return
  }

  // 标记为已处理
  processedMsgIds.add(message.msgId)

  // 处理消息...
}
```

## 七、测试工具

### 1. 使用 ngrok 暴露本地服务

```bash
# 安装 ngrok
npm install -g ngrok

# 启动本地服务
npm run dev

# 在另一个终端暴露端口
ngrok http 3000

# 使用 ngrok 提供的 URL 配置回调地址
# 例如：https://xxxx.ngrok.io/api/wechat/webhook
```

### 2. 验证回调 URL

企业微信会发送验证请求，确保你的服务器能正确响应。

## 八、参考文档

- 企业微信开发者文档：https://developer.work.weixin.qq.com/document/path/90239
- 消息加解密说明：https://developer.work.weixin.qq.com/document/path/90968
- 接收消息与事件：https://developer.work.weixin.qq.com/document/path/90240

## 九、总结

使用官方 API 的优势：
1. ✅ **合法合规**：官方支持的方式
2. ✅ **稳定可靠**：企业微信官方维护
3. ✅ **功能完整**：支持所有消息类型
4. ✅ **安全性高**：消息加密传输
5. ✅ **实时性好**：消息实时推送

实现要点：
1. 正确实现签名验证
2. 正确实现消息解密
3. 快速响应（< 5 秒）
4. 完善的错误处理
5. 消息去重机制

