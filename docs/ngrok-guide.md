# ngrok 使用指南

## 一、什么是 ngrok？

**ngrok** 是一个内网穿透工具，可以将本地服务器暴露到公网，让外部服务（如企业微信）能够访问你本地开发的应用。

### 核心功能

- **内网穿透**：将本地端口映射到公网 URL
- **HTTPS 支持**：自动提供 HTTPS 加密连接（企业微信要求）
- **实时监控**：提供 Web 界面查看请求和响应
- **简单易用**：一条命令即可启动

### 为什么需要 ngrok？

在企业微信开发中，企业微信服务器需要向你的应用发送回调请求。但你的本地开发服务器（`localhost:3000`）只能在本机访问，企业微信服务器无法直接访问。

**解决方案**：使用 ngrok 创建一个公网隧道，将 `localhost:3000` 映射到 `https://xxxx.ngrok-free.app`，这样企业微信就能访问你的本地服务器了。

## 二、安装 ngrok

### macOS

```bash
# 使用 Homebrew 安装（推荐）
brew install ngrok

# 或下载二进制文件
# 访问 https://ngrok.com/download 下载
```

### Linux

```bash
# 下载并解压
wget https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz
tar -xzf ngrok-v3-stable-linux-amd64.tgz
sudo mv ngrok /usr/local/bin/
```

### Windows

1. 访问 https://ngrok.com/download
2. 下载 Windows 版本
3. 解压到任意目录
4. 将目录添加到系统 PATH

### 验证安装

```bash
ngrok version
# 应该显示版本号，如：ngrok version 3.x.x
```

## 三、快速开始

### 1. 注册账号（可选但推荐）

虽然免费版不需要注册，但注册后可以获得：
- 固定的域名（每次启动 URL 不变）
- 更长的会话时间
- 更多功能

注册步骤：
1. 访问 https://dashboard.ngrok.com/signup
2. 使用邮箱注册
3. 获取 Authtoken（在 Dashboard → Your Authtoken）

### 2. 配置 Authtoken（注册后）

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 3. 启动隧道

```bash
# 将本地 3000 端口暴露到公网
ngrok http 3000
```

启动后会显示：

```
ngrok

Session Status                online
Account                       your-email@example.com
Version                       3.x.x
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**重要信息**：
- `Forwarding` 后面的 URL 就是你的公网地址
- 将这个 URL 配置到企业微信后台的回调 URL
- `Web Interface` 是本地监控界面，可以查看所有请求

### 4. 使用固定域名（注册用户）

```bash
# 在 ngrok 后台创建固定域名后
ngrok http 3000 --domain=your-fixed-domain.ngrok-free.app
```

## 四、在企业微信调试中的应用

### 完整流程

```bash
# 终端 1：启动开发服务器
npm run dev

# 终端 2：启动 ngrok 隧道
ngrok http 3000
```

### 配置企业微信回调 URL

1. 复制 ngrok 提供的 Forwarding URL（例如：`https://xxxx.ngrok-free.app`）
2. 在企业微信管理后台配置：
   - **回调 URL**：`https://xxxx.ngrok-free.app/api/wechat/webhook`
   - **Token**：你的 Token
   - **EncodingAESKey**：你的 EncodingAESKey

### 监控请求

打开浏览器访问 `http://127.0.0.1:4040`，可以看到：
- 所有进入的请求
- 请求头和响应头
- 请求体和响应体
- 请求时间线

这对于调试企业微信的回调非常有用！

## 五、常用命令

### 基本命令

```bash
# 暴露 HTTP 端口
ngrok http 3000

# 暴露 HTTPS 端口
ngrok http 3000 --scheme=https

# 使用固定域名
ngrok http 3000 --domain=your-domain.ngrok-free.app

# 自定义子域名（付费功能）
ngrok http 3000 --subdomain=myapp
```

### 高级选项

```bash
# 指定区域（降低延迟）
ngrok http 3000 --region=ap  # 亚太地区

# 自定义请求头
ngrok http 3000 --request-header-add "X-Custom-Header: value"

# 重写 Host 头
ngrok http 3000 --host-header=rewrite
```

### 配置文件

创建 `~/.ngrok2/ngrok.yml` 可以保存常用配置：

```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN
tunnels:
  webapp:
    addr: 3000
    proto: http
    subdomain: myapp  # 需要付费账户
```

然后使用：
```bash
ngrok start webapp
```

## 六、免费版限制

- **会话时间**：2 小时（未注册）或 8 小时（注册后）
- **连接数**：1 个并发连接
- **域名**：每次启动 URL 会变化（除非使用固定域名）
- **带宽**：有限制

**解决方案**：
- 注册账号获得更长的会话时间
- 需要固定域名可以购买付费版
- 或者使用其他免费替代方案（见下文）

## 七、替代方案

### 1. localtunnel（免费，开源）

```bash
# 安装
npm install -g localtunnel

# 使用
lt --port 3000
```

**优点**：
- 完全免费
- 不需要注册
- 简单易用

**缺点**：
- URL 每次都会变化
- 可能有广告页面

### 2. Cloudflare Tunnel（免费）

```bash
# 安装
brew install cloudflare/cloudflare/cloudflared

# 使用
cloudflared tunnel --url http://localhost:3000
```

**优点**：
- 完全免费
- 由 Cloudflare 提供，稳定可靠
- 支持自定义域名

### 3. serveo（免费，无需安装）

```bash
# 使用 SSH
ssh -R 80:localhost:3000 serveo.net
```

**优点**：
- 不需要安装任何软件
- 完全免费

**缺点**：
- 需要 SSH 客户端
- 可能不稳定

### 4. VS Code Port Forwarding（VS Code 用户）

如果你使用 VS Code，可以使用内置的端口转发功能。

## 八、最佳实践

### 1. 开发环境

```bash
# 创建启动脚本 start-dev.sh
#!/bin/bash

# 启动开发服务器（后台）
npm run dev &

# 等待服务器启动
sleep 3

# 启动 ngrok
ngrok http 3000
```

### 2. 使用环境变量

```bash
# 在 .env.local 中添加
NGROK_URL=https://xxxx.ngrok-free.app

# 在代码中使用
const webhookUrl = process.env.NGROK_URL + '/api/wechat/webhook'
```

### 3. 自动化配置

创建一个脚本自动获取 ngrok URL 并更新配置：

```bash
#!/bin/bash
# get-ngrok-url.sh

# 启动 ngrok（后台）
ngrok http 3000 > /dev/null &
NGROK_PID=$!

# 等待 ngrok 启动
sleep 2

# 获取 URL
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o 'https://[^"]*\.ngrok-free\.app' | head -1)

echo "ngrok URL: $NGROK_URL"
echo "回调 URL: $NGROK_URL/api/wechat/webhook"

# 清理
trap "kill $NGROK_PID" EXIT
```

## 九、常见问题

### Q1: ngrok 连接超时

**原因**：网络问题或防火墙阻止

**解决**：
- 检查网络连接
- 尝试不同的区域：`ngrok http 3000 --region=ap`
- 检查防火墙设置

### Q2: 企业微信无法访问回调 URL

**原因**：ngrok URL 可能已过期或变化

**解决**：
- 检查 ngrok 是否还在运行
- 确认 URL 是否正确
- 使用固定域名（付费功能）

### Q3: 每次重启 URL 都变化

**解决**：
- 注册 ngrok 账号
- 使用固定域名功能
- 或使用 localtunnel 等替代方案

### Q4: 免费版会话时间太短

**解决**：
- 注册账号（8 小时）
- 购买付费版（无限制）
- 使用脚本自动重启

## 十、安全注意事项

1. **不要在生产环境使用 ngrok**
   - ngrok 主要用于开发调试
   - 生产环境应使用真实的域名和 HTTPS

2. **保护你的 Authtoken**
   - 不要将 Authtoken 提交到代码仓库
   - 使用环境变量存储

3. **监控访问日志**
   - 定期查看 ngrok 的 Web 界面
   - 注意异常请求

4. **使用密码保护（可选）**
   ```bash
   ngrok http 3000 --basic-auth="username:password"
   ```

## 十一、总结

ngrok 是企业微信开发调试的必备工具，它让你能够：
- ✅ 在本地开发时接收企业微信的回调
- ✅ 实时查看和调试请求
- ✅ 快速测试 Webhook 功能

**推荐工作流**：
1. 启动开发服务器：`npm run dev`
2. 启动 ngrok：`ngrok http 3000`
3. 复制 Forwarding URL 到企业微信后台
4. 开始测试和调试

更多信息请访问：https://ngrok.com/docs
