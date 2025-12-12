# 配置说明

## 企业微信配置

### 方案一：Webhook 接收（推荐）

1. **创建企业应用**
   - 登录企业微信管理后台：https://work.weixin.qq.com/
   - 进入「应用管理」→「创建应用」
   - 填写应用信息，获取 `AgentId` 和 `Secret`

2. **配置回调 URL**
   - 在应用详情页，找到「接收消息」设置
   - 设置回调 URL：`https://your-domain.com/api/wechat/webhook`
   - 设置 Token（用于验证）
   - 设置 EncodingAESKey（用于消息加解密）

3. **验证回调**
   - 企业微信会发送 GET 请求验证 URL
   - 确保你的服务器可以接收并正确响应验证请求

### 方案二：API 拉取

1. **获取凭证**
   - 企业 ID (corpId)
   - 应用 ID (agentId)
   - 应用密钥 (secret)

2. **调用 API**
   ```typescript
   const response = await fetch('/api/wechat/pull', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       corpId: 'your-corp-id',
       agentId: 'your-agent-id',
       secret: 'your-secret',
       startTime: Date.now() - 86400000, // 24小时前
       endTime: Date.now(),
       limit: 100
     })
   })
   ```

## AI API 配置

当前实现使用规则匹配作为 fallback，建议接入真实的 AI API 以获得更好的提取效果。

### 接入 OpenAI API

修改 `app/api/ai/extract/route.ts`：

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function extractWithAI(content: string, project?: string): Promise<AIExtractResult> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: '你是一个专业的研发日志提取助手，从聊天内容中提取关键信息。'
      },
      {
        role: 'user',
        content: `请从以下聊天内容中提取关键信息，并返回 JSON 格式：
项目：${project || '未指定'}
聊天内容：
${content}

请提取：
- 类型（task/bug/meeting/progress/other）
- 标题
- 参与人员
- 内容摘要
- 状态
- 优先级（high/medium/low）
- 标签`
      }
    ],
    response_format: { type: 'json_object' }
  })

  return JSON.parse(response.choices[0].message.content || '{}')
}
```

### 配置方式

企业微信配置支持两种方式，按优先级从高到低：

1. **环境变量配置**（推荐用于生产环境）
   - 创建 `.env.local` 文件（参考 `.env.local.example`）
   - 配置项会自动加载，无需在前端配置

2. **前端配置界面**（推荐用于开发测试）
   - 在研发日志页面点击「配置」按钮
   - 配置信息保存在浏览器 localStorage
   - 适合快速测试和开发

### 环境变量配置

创建 `.env.local` 文件（参考 `.env.local.example`）：

```env
# 企业微信配置
WECHAT_CORP_ID=your-corp-id
WECHAT_AGENT_ID=your-agent-id
WECHAT_SECRET=your-secret
WECHAT_TOKEN=your-token
WECHAT_ENCODING_AES_KEY=your-encoding-aes-key
WECHAT_ENABLED=true

# AI API 配置（可选）
OPENAI_API_KEY=your-openai-api-key
```

### 前端配置

1. 打开研发日志页面
2. 点击右上角「配置」按钮
3. 填写企业微信配置信息
4. 点击「保存配置」

配置会自动保存到浏览器本地存储，下次打开会自动加载。

## 开发测试

### 模拟企业微信消息

在开发阶段，可以直接使用「AI 提取」功能：
1. 复制企业微信聊天内容
2. 粘贴到「AI 提取」输入框
3. 点击「开始提取」

### 测试 Webhook

可以使用工具如 [ngrok](https://ngrok.com/) 将本地服务暴露到公网：

```bash
ngrok http 3000
```

然后将 ngrok 提供的 URL 配置到企业微信回调地址。

## 注意事项

1. **安全性**
   - 生产环境务必使用 HTTPS
   - 妥善保管企业微信密钥和 AI API Key
   - 不要在代码中硬编码敏感信息

2. **消息加密**
   - 企业微信消息是加密的，需要实现解密逻辑
   - 参考企业微信官方文档：https://developer.work.weixin.qq.com/document/path/90239

3. **API 限制**
   - 注意 AI API 的调用频率限制
   - 企业微信 API 也有调用频率限制
   - 建议实现缓存和重试机制


