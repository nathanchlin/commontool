# 如何查看公网 IP 地址

## 方法 1：使用命令行（推荐）

### macOS / Linux

```bash
# 方法 1.1 - 使用 ipify.org（推荐，速度快）
curl https://api.ipify.org

# 方法 1.2 - 使用 ifconfig.me
curl https://ifconfig.me

# 方法 1.3 - 使用 icanhazip.com
curl https://icanhazip.com

# 方法 1.4 - 使用 ip.sb
curl https://ip.sb
```

### Windows

```powershell
# 使用 PowerShell
Invoke-RestMethod -Uri https://api.ipify.org

# 或使用 curl（Windows 10+）
curl https://api.ipify.org
```

## 方法 2：使用浏览器

直接在浏览器中访问以下任一网站，会显示你的公网 IP：

- https://api.ipify.org
- https://ifconfig.me
- https://icanhazip.com
- https://ip.sb
- https://www.whatismyip.com
- https://myip.com

## 方法 3：使用搜索引擎

在 Google 或百度搜索 "我的IP" 或 "what is my ip"，搜索结果会直接显示你的公网 IP。

## 方法 4：创建快捷脚本

### macOS / Linux

创建脚本文件 `get-ip.sh`：

```bash
#!/bin/bash
echo "你的公网 IP 地址："
curl -s https://api.ipify.org
echo ""
```

然后运行：
```bash
chmod +x get-ip.sh
./get-ip.sh
```

### 添加到 PATH（可选）

```bash
# 创建全局命令
sudo ln -s /path/to/get-ip.sh /usr/local/bin/myip
chmod +x /usr/local/bin/myip

# 然后就可以直接使用
myip
```

## 方法 5：使用在线工具

访问以下网站查看详细信息：

- **IP 详细信息**：https://ipinfo.io
- **地理位置**：https://ip-api.com
- **完整信息**：https://ifconfig.me/all

## 注意事项

### 公网 IP vs 内网 IP

- **公网 IP**：互联网上识别你设备的唯一地址（通过上述方法查询）
- **内网 IP**：局域网内的地址（如 192.168.x.x, 10.x.x.x）

查看内网 IP：
```bash
# macOS / Linux
ifconfig | grep "inet " | grep -v 127.0.0.1

# 或
ip addr show  # Linux

# Windows
ipconfig
```

### IP 地址可能变化

- 大多数家庭网络使用**动态 IP**，重启路由器后可能会变化
- 企业网络可能使用**静态 IP**，不会变化
- 使用 VPN 时，显示的是 VPN 服务器的 IP

### 当前你的公网 IP

根据刚才的查询，你当前的公网 IP 是：

```
112.64.110.179
```

**注意**：这个 IP 可能会变化，建议每次需要时重新查询。

## 快速查询命令

将以下命令添加到你的 `~/.zshrc` 或 `~/.bashrc`：

```bash
# 快速查询公网 IP
alias myip='curl -s https://api.ipify.org'
```

然后运行：
```bash
source ~/.zshrc  # 或 source ~/.bashrc
myip  # 直接使用
```
