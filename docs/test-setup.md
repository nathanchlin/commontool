# 企业微信消息接收测试配置

## ✅ 当前状态

- ✅ 开发服务器运行中：`http://localhost:3000`
- ✅ 内网穿透已启动：`https://clear-spoons-sort.loca.lt`
- ✅ 回调接口可访问：`/api/wechat/webhook`

## 📋 配置步骤

### 1. 访问并激活 localtunnel

首次访问 localtunnel URL 时需要点击 "Continue" 按钮激活：

1. 在浏览器中打开：`https://clear-spoons-sort.loca.lt`
2. 点击页面上的 **"Continue"** 或 **"Click to Continue"** 按钮
3. 看到你的应用首页即表示激活成功

### 2. 配置企业微信回调 URL

1. 登录企业微信管理后台：https://work.weixin.qq.com/
2. 进入「应用管理」→「应用」→「自建」→ 找到应用（AgentId: 1000026）
3. 点击「接收消息」或「消息回调」设置
4. 填写以下信息：

   **回调 URL：**
   ```
   https://clear-spoons-sort.loca.lt/api/wechat/webhook
   ```

   **Token：**
   - 需要先在 `.env.local` 中设置 `WECHAT_TOKEN`
   - 然后填写相同的值到企业微信后台

   **EncodingAESKey：**
   - 需要先在 `.env.local` 中设置 `WECHAT_ENCODING_AES_KEY`
   - 然后填写相同的值到企业微信后台

### 3. 设置 Token 和 EncodingAESKey

如果还没有设置，请更新 `.env.local` 文件：

```bash
# 生成 Token（自定义字符串）
WECHAT_TOKEN=myWeChatToken2024

# 生成 EncodingAESKey（43 位字符）
# 可以使用以下命令生成：
# openssl rand -base64 32 | head -c 43
WECHAT_ENCODING_AES_KEY=Nt54QnJ0euWNdLBZTnsYwB+AGJAgzFrUXrXj9Z2/LvE
```

**重要：** Token 和 EncodingAESKey 必须与企业微信后台配置完全一致！

### 4. 验证回调 URL

保存配置后，企业微信会自动发送 GET 请求验证你的回调 URL。如果验证成功，状态会显示「已验证」。

如果验证失败，检查：
- Token 和 EncodingAESKey 是否一致
- 回调 URL 是否正确
- localtunnel 是否还在运行
- 是否已激活 localtunnel（点击了 Continue 按钮）

## 🧪 测试消息接收

### 1. 确保服务运行

```bash
# 终端 1：开发服务器（应该已经在运行）
npm run dev

# 终端 2：内网穿透（如果已停止，重新启动）
./start-tunnel.sh
# 或
lt --port 3000
```

### 2. 发送测试消息

1. 打开企业微信客户端（手机或电脑）
2. 找到你的应用（AgentId: 1000026）
3. 向应用发送一条测试消息，例如：
   ```
   今天完成了用户登录功能的开发，修复了密码加密的bug
   ```

### 3. 查看服务器日志

在运行 `npm run dev` 的终端中，你应该能看到：

```
收到企业微信消息: {
  id: 'xxx',
  from: 'userid',
  type: 'text',
  content: '今天完成了用户登录功能的开发...'
}
```

### 4. 查看处理结果

如果消息处理成功，还会看到：
- AI 提取日志
- 研发日志自动保存成功

## 🔍 调试方法

### 查看 localtunnel 日志

```bash
# 查看当前运行的 localtunnel 进程
ps aux | grep "lt --port"

# 查看日志（如果保存了）
cat /tmp/localtunnel.log
```

### 测试回调接口

```bash
# 测试本地接口
curl http://localhost:3000/api/wechat/webhook

# 测试公网接口（需要先激活）
curl https://clear-spoons-sort.loca.lt/api/wechat/webhook
```

### 查看请求详情

在开发服务器的终端中，所有请求都会显示日志。你也可以在代码中添加更多调试信息。

## ⚠️ 注意事项

### localtunnel 限制

1. **URL 会变化**：每次重启 localtunnel，URL 都会变化
2. **需要激活**：首次访问需要点击 "Continue" 按钮
3. **会话时间**：免费版没有时间限制，但连接可能不稳定

### 解决方案

如果需要固定 URL，可以：
1. 使用 ngrok（需要注册账号，可配置固定域名）
2. 部署到服务器（生产环境推荐）
3. 使用 Cloudflare Tunnel（免费且稳定）

## 📝 当前配置信息

```
公网 URL: https://clear-spoons-sort.loca.lt
回调 URL: https://clear-spoons-sort.loca.lt/api/wechat/webhook
本地地址: http://localhost:3000
```

**注意：** localtunnel 的 URL 每次重启都会变化。如果需要固定 URL，请考虑使用 ngrok 或部署到服务器。

## 🚀 快速重启

如果 localtunnel 连接断开，可以快速重启：

```bash
# 停止旧的 localtunnel
pkill -f "lt --port"

# 启动新的 localtunnel
./start-tunnel.sh
```

然后更新企业微信后台的回调 URL。

## 🔐 Tunnel Password 说明

### 什么是 Tunnel Password？

localtunnel 现在要求输入密码才能访问隧道，这是为了防止服务被滥用。

### 密码是什么？

**Tunnel Password 就是你的公网 IP 地址！**

### 如何获取公网 IP？

可以通过以下方式获取：

```bash
# 方法 1
curl https://api.ipify.org

# 方法 2
curl https://ifconfig.me

# 方法 3
curl https://icanhazip.com
```

### 如何使用？

1. **获取你的公网 IP 地址**（使用上面的命令）
2. **访问 localtunnel URL**（例如：`https://clear-spoons-sort.loca.lt`）
3. **在密码输入框中输入你的公网 IP 地址**
4. **点击 Continue 或 Submit**

### 示例

如果你的公网 IP 是 `123.45.67.89`，那么：
- 访问：`https://clear-spoons-sort.loca.lt`
- 在密码框输入：`123.45.67.89`
- 点击 Continue

### 注意事项

- 这个密码只在首次访问时需要输入
- 企业微信服务器访问时也需要知道这个密码（但企业微信无法输入密码，所以这可能是个问题）
- 如果企业微信无法访问，考虑使用其他内网穿透工具（如 ngrok）

