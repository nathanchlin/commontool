# 企业微信回调配置完整步骤

## 📋 前置条件检查

- ✅ localtunnel URL 已配置：`https://clear-spoons-sort.loca.lt`
- ✅ 开发服务器运行中：`http://localhost:3000`
- ⚠️ 需要设置：Token 和 EncodingAESKey

## 第一步：设置 Token 和 EncodingAESKey

### 1.1 生成配置值

**Token**：自定义字符串，用于验证签名
- 建议使用随机字符串，如：`WeChatToken2024Dev`

**EncodingAESKey**：43 位字符，用于消息加解密
- 可以使用命令生成：`openssl rand -base64 32 | head -c 43`

### 1.2 更新 .env.local 文件

编辑 `.env.local` 文件，添加或更新以下两行：

```bash
WECHAT_TOKEN=WeChatToken2024Dev
WECHAT_ENCODING_AES_KEY=你的43位EncodingAESKey
```

**重要提示**：
- Token 可以是任意字符串，但建议使用随机字符串
- EncodingAESKey 必须是 43 位字符
- 这两个值必须与企业微信后台配置**完全一致**

### 1.3 重启开发服务器

更新 `.env.local` 后，需要重启开发服务器：

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

## 第二步：配置企业微信后台

### 2.1 登录企业微信管理后台

1. 访问：https://work.weixin.qq.com/
2. 使用管理员账号登录

### 2.2 进入应用管理

1. 点击左侧菜单「应用管理」
2. 选择「应用」→「自建」
3. 找到你的应用（AgentId: 1000026）
4. 点击应用名称进入详情页

### 2.3 配置接收消息

1. 在应用详情页，找到「接收消息」或「消息回调」设置
2. 点击「设置」或「配置」按钮

### 2.4 填写配置信息

在配置页面填写以下信息：

#### 回调 URL
```
https://clear-spoons-sort.loca.lt/api/wechat/webhook
```

**注意**：
- 确保 localtunnel 正在运行
- 如果 localtunnel URL 已变化，使用新的 URL
- URL 必须以 `/api/wechat/webhook` 结尾

#### Token
填写你在 `.env.local` 中设置的 `WECHAT_TOKEN` 值

例如：
```
WeChatToken2024Dev
```

#### EncodingAESKey
填写你在 `.env.local` 中设置的 `WECHAT_ENCODING_AES_KEY` 值

例如：
```
Nt54QnJ0euWNdLBZTnsYwB+AGJAgzFrUXrXj9Z2/LvE
```

### 2.5 保存配置

1. 检查所有信息是否正确
2. 点击「保存」或「提交」按钮
3. 企业微信会自动验证回调 URL

## 第三步：验证回调 URL

### 3.1 自动验证

保存配置后，企业微信会立即发送 GET 请求验证你的回调 URL：

```
GET https://clear-spoons-sort.loca.lt/api/wechat/webhook?msg_signature=xxx&timestamp=xxx&nonce=xxx&echostr=xxx
```

### 3.2 验证流程

你的服务器会：
1. 接收验证请求
2. 使用 Token 验证签名
3. 使用 EncodingAESKey 解密 echostr
4. 返回解密后的 echostr

### 3.3 查看验证结果

在企业微信后台：
- ✅ **验证成功**：状态显示「已验证」或「已启用」，可以开始接收消息
- ❌ **验证失败**：显示错误信息，需要检查配置

### 3.4 验证失败排查

如果验证失败，检查以下内容：

1. **Token 是否一致**
   - 检查 `.env.local` 中的 `WECHAT_TOKEN`
   - 检查企业微信后台填写的 Token
   - 确保两者完全一致（区分大小写）

2. **EncodingAESKey 是否一致**
   - 检查 `.env.local` 中的 `WECHAT_ENCODING_AES_KEY`
   - 检查企业微信后台填写的 EncodingAESKey
   - 确保两者完全一致（43 位字符）

3. **回调 URL 是否正确**
   - 检查 localtunnel 是否还在运行
   - 检查 URL 是否正确：`https://clear-spoons-sort.loca.lt/api/wechat/webhook`
   - 尝试在浏览器访问回调 URL（会显示错误，但可以确认可访问）

4. **服务器日志**
   - 查看开发服务器的终端输出
   - 查找错误信息，如：
     - "配置不完整"
     - "签名验证失败"
     - "解密失败"

5. **localtunnel 连接**
   - 确保 localtunnel 进程正在运行
   - 如果已断开，重新启动：`lt --port 3000`
   - 注意：localtunnel URL 可能会变化

## 第四步：测试消息接收

### 4.1 确保服务运行

```bash
# 终端 1：开发服务器
npm run dev

# 终端 2：内网穿透（如果已停止）
lt --port 3000
```

### 4.2 发送测试消息

1. 打开企业微信客户端（手机或电脑版）
2. 找到你的应用（AgentId: 1000026）
3. 向应用发送一条测试消息，例如：
   ```
   今天完成了用户登录功能的开发，修复了密码加密的bug
   ```

### 4.3 查看服务器日志

在运行 `npm run dev` 的终端中，你应该能看到：

```
收到企业微信消息: {
  id: 'xxx',
  from: 'userid',
  type: 'text',
  content: '今天完成了用户登录功能的开发...'
}
```

### 4.4 查看处理结果

如果消息处理成功，还会看到：
- AI 提取日志
- 研发日志自动保存成功

## 第五步：调试和监控

### 5.1 查看服务器日志

开发服务器会在控制台输出详细日志：

```bash
# 查看实时日志
npm run dev

# 日志会显示：
# - 收到的验证请求
# - 收到的消息
# - 处理结果
# - 错误信息
```

### 5.2 测试回调接口

```bash
# 测试本地接口（应该返回错误，因为缺少参数）
curl http://localhost:3000/api/wechat/webhook

# 测试公网接口（需要先激活 localtunnel）
curl https://clear-spoons-sort.loca.lt/api/wechat/webhook
```

### 5.3 监控请求

在开发服务器的终端中，所有请求都会显示：
- 请求方法（GET/POST）
- 请求路径
- 请求参数
- 响应状态

## 常见问题

### Q1: 验证一直失败

**可能原因**：
- Token 或 EncodingAESKey 不一致
- localtunnel 连接断开
- 服务器未重启，配置未生效

**解决方法**：
1. 仔细检查 Token 和 EncodingAESKey 是否完全一致
2. 重启开发服务器
3. 重新启动 localtunnel
4. 查看服务器日志中的具体错误信息

### Q2: 收不到消息

**可能原因**：
- 验证未成功
- 应用未启用
- 用户未授权应用

**解决方法**：
1. 检查企业微信后台验证状态
2. 确保应用已启用
3. 确保用户已授权应用

### Q3: localtunnel URL 变化

**解决方法**：
1. 重新启动 localtunnel 获取新 URL
2. 更新企业微信后台的回调 URL
3. 重新验证

### Q4: 消息处理失败

**解决方法**：
1. 查看服务器日志中的错误信息
2. 检查 AI 提取 API 是否正常
3. 检查数据库连接（如果使用）

## 配置检查清单

在开始测试前，确认以下所有项：

- [ ] `.env.local` 文件已创建
- [ ] `WECHAT_CORP_ID` 已设置
- [ ] `WECHAT_AGENT_ID` 已设置
- [ ] `WECHAT_SECRET` 已设置
- [ ] `WECHAT_TOKEN` 已设置（与企业微信后台一致）
- [ ] `WECHAT_ENCODING_AES_KEY` 已设置（与企业微信后台一致）
- [ ] `WECHAT_ENABLED=true`
- [ ] 开发服务器正在运行
- [ ] localtunnel 正在运行
- [ ] 企业微信后台已配置回调 URL
- [ ] 企业微信后台已配置 Token
- [ ] 企业微信后台已配置 EncodingAESKey
- [ ] 回调 URL 验证成功

## 下一步

配置成功后，你可以：

1. **发送不同类型的消息**测试处理逻辑
2. **查看自动生成的研发日志**（在应用的日志页面）
3. **调整 AI 提取逻辑**（在 `app/api/ai/extract/route.ts`）
4. **自定义消息处理流程**（在 `app/api/wechat/webhook/route.ts` 的 `processMessage` 函数）
