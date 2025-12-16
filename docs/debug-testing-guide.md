# 企业微信消息接收调试测试指南

## 一、准备工作

### 1. 确认配置信息

确保 `.env.local` 文件已配置完整：

```bash
WECHAT_CORP_ID=ww64e2fa5cf953863f
WECHAT_AGENT_ID=1000026
WECHAT_SECRET=ogu2OdpG7aE5IgGGxKHqv73vOMvbY5X3SpQ-Uzwhbm4
WECHAT_TOKEN=your-token          # 需要设置
WECHAT_ENCODING_AES_KEY=your-encoding-aes-key  # 需要设置
WECHAT_ENABLED=true
```

### 2. 获取 Token 和 EncodingAESKey

**Token**：自定义字符串，用于验证签名（建议使用随机字符串，如：`myRandomToken123`）

**EncodingAESKey**：43 位字符，用于消息加解密。可以：
- 在企业微信管理后台自动生成
- 或使用工具生成：`openssl rand -base64 32`（生成后截取前 43 位）

## 二、配置企业微信接收消息

### 步骤 1：登录企业微信管理后台

1. 访问：https://work.weixin.qq.com/
2. 使用管理员账号登录

### 步骤 2：进入应用管理

1. 进入「应用管理」→「应用」→「自建」
2. 找到你的应用（AgentId: 1000026）
3. 点击进入应用详情页

### 步骤 3：配置接收消息

1. 在应用详情页，找到「接收消息」或「消息回调」设置
2. 点击「设置」或「配置」

### 步骤 4：填写回调信息

**重要：本地调试需要内网穿透**

#### 方案 A：使用内网穿透（本地调试推荐）

1. **安装内网穿透工具**（推荐使用 ngrok 或 localtunnel）

   **使用 ngrok：**
   ```bash
   # 安装 ngrok
   brew install ngrok  # macOS
   # 或访问 https://ngrok.com/ 下载
   
   # 启动内网穿透（将本地 3000 端口暴露到公网）
   ngrok http 3000
   ```

   启动后会显示类似：
   ```
   Forwarding  https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000
   ```

2. **复制公网 URL**（例如：`https://xxxx-xx-xx-xx-xx.ngrok-free.app`）

3. **在企业微信管理后台配置：**
   - **回调 URL**：`https://xxxx-xx-xx-xx-xx.ngrok-free.app/api/wechat/webhook`
   - **Token**：填写你在 `.env.local` 中设置的 `WECHAT_TOKEN` 值
   - **EncodingAESKey**：填写你在 `.env.local` 中设置的 `WECHAT_ENCODING_AES_KEY` 值

#### 方案 B：部署到服务器（生产环境）

1. 将应用部署到有公网 IP 的服务器
2. 配置域名和 HTTPS（企业微信要求 HTTPS）
3. 在企业微信管理后台配置：
   - **回调 URL**：`https://your-domain.com/api/wechat/webhook`
   - **Token**：你的 Token
   - **EncodingAESKey**：你的 EncodingAESKey

### 步骤 5：保存并验证

1. 点击「保存」或「提交」
2. 企业微信会自动发送 GET 请求验证你的回调 URL
3. 验证成功后，状态会显示「已验证」或「已启用」

## 三、测试消息接收

### 1. 启动开发服务器

```bash
npm run dev
```

确保服务器运行在 `http://localhost:3000`

### 2. 启动内网穿透（如果本地调试）

```bash
ngrok http 3000
```

保持这个终端窗口打开。

### 3. 在企业微信中发送消息

1. 打开企业微信客户端（手机或电脑版）
2. 找到你创建的应用（AgentId: 1000026）
3. 向应用发送一条测试消息，例如：
   ```
   今天完成了用户登录功能的开发，修复了密码加密的bug
   ```

### 4. 查看服务器日志

在运行 `npm run dev` 的终端中，你应该能看到：

```
收到企业微信消息: {
  id: 'xxx',
  from: 'userid',
  type: 'text',
  content: '今天完成了用户登录功能的开发...'
}
```

如果看到错误，检查：
- Token 和 EncodingAESKey 是否正确
- 回调 URL 是否可访问
- 服务器日志中的错误信息

## 四、调试方法

### 1. 查看服务器日志

开发服务器会在控制台输出详细的日志：

```bash
# 查看所有日志
npm run dev

# 或者使用 tail 查看日志文件（如果有）
tail -f logs/app.log
```

### 2. 测试回调 URL 验证

手动测试验证接口：

```bash
# 使用 curl 测试（需要替换参数）
curl "http://localhost:3000/api/wechat/webhook?msg_signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx"
```

### 3. 查看网络请求

使用浏览器开发者工具或 Postman 测试：

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 发送消息后，查看 `/api/wechat/webhook` 的请求和响应

### 4. 添加调试日志

在 `app/api/wechat/webhook/route.ts` 中添加更多日志：

```typescript
console.log('收到验证请求:', {
  msgSignature,
  timestamp,
  nonce,
  echostr: echostr.substring(0, 20) + '...'
})

console.log('收到消息:', {
  body: body.substring(0, 100),
  msgSignature,
  timestamp,
  nonce
})
```

### 5. 检查配置

验证配置是否正确加载：

```bash
# 在代码中添加临时调试
console.log('配置信息:', {
  corpId: config.corpId,
  agentId: config.agentId,
  hasToken: !!config.token,
  hasEncodingAESKey: !!config.encodingAESKey,
})
```

## 五、常见问题排查

### 问题 1：验证失败

**错误信息**：`签名验证失败` 或 `配置不完整`

**解决方法**：
1. 检查 `.env.local` 中的 Token 和 EncodingAESKey 是否与企业微信后台配置一致
2. 确保配置已保存并重启服务器
3. 检查环境变量是否正确加载

### 问题 2：回调 URL 无法访问

**错误信息**：企业微信后台显示「验证失败」或「无法连接」

**解决方法**：
1. 确保内网穿透工具正在运行
2. 测试公网 URL 是否可访问：`curl https://your-ngrok-url.ngrok-free.app/api/wechat/webhook`
3. 确保服务器正在运行
4. 检查防火墙设置

### 问题 3：消息接收但解密失败

**错误信息**：`解密失败` 或 `消息格式错误`

**解决方法**：
1. 检查 EncodingAESKey 是否正确（必须是 43 位字符）
2. 确保 EncodingAESKey 与企业微信后台配置完全一致
3. 检查消息格式是否符合企业微信规范

### 问题 4：消息未触发处理

**现象**：消息验证成功，但没有看到处理日志

**解决方法**：
1. 检查消息类型是否为 `text`
2. 查看 `processMessage` 函数的日志
3. 检查 AI 提取 API 是否正常工作
4. 查看是否有异常被捕获但未输出

## 六、测试检查清单

- [ ] `.env.local` 文件已创建并配置完整
- [ ] Token 和 EncodingAESKey 已设置
- [ ] 开发服务器正在运行（`npm run dev`）
- [ ] 内网穿透工具正在运行（本地调试）
- [ ] 企业微信后台已配置回调 URL
- [ ] 回调 URL 验证成功
- [ ] 可以在企业微信中看到应用
- [ ] 向应用发送测试消息
- [ ] 服务器日志显示收到消息
- [ ] 消息处理流程正常（AI 提取、日志保存）

## 七、快速测试脚本

创建一个测试脚本来验证配置：

```bash
# test-wechat-config.sh
#!/bin/bash

echo "检查环境变量..."
if [ -f .env.local ]; then
  echo "✓ .env.local 文件存在"
  source .env.local
  echo "  WECHAT_CORP_ID: ${WECHAT_CORP_ID:0:10}..."
  echo "  WECHAT_AGENT_ID: $WECHAT_AGENT_ID"
  echo "  WECHAT_SECRET: ${WECHAT_SECRET:0:10}..."
  echo "  WECHAT_TOKEN: ${WECHAT_TOKEN:+已设置}"
  echo "  WECHAT_ENCODING_AES_KEY: ${WECHAT_ENCODING_AES_KEY:+已设置}"
else
  echo "✗ .env.local 文件不存在"
fi

echo ""
echo "检查服务器..."
if curl -s http://localhost:3000 > /dev/null; then
  echo "✓ 服务器运行正常"
else
  echo "✗ 服务器未运行，请执行 npm run dev"
fi

echo ""
echo "检查回调接口..."
if curl -s http://localhost:3000/api/wechat/webhook > /dev/null; then
  echo "✓ 回调接口可访问"
else
  echo "✗ 回调接口不可访问"
fi
```

运行测试：
```bash
chmod +x test-wechat-config.sh
./test-wechat-config.sh
```

## 八、下一步

配置成功后，你可以：

1. **发送不同类型的消息**测试处理逻辑
2. **查看自动生成的研发日志**（在应用的日志页面）
3. **调整 AI 提取逻辑**（在 `app/api/ai/extract/route.ts`）
4. **自定义消息处理流程**（在 `app/api/wechat/webhook/route.ts` 的 `processMessage` 函数）
