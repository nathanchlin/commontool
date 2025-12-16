#!/bin/bash
# 快速查询公网 IP 地址

echo "🌐 正在查询你的公网 IP 地址..."
echo ""

# 尝试多个服务，使用第一个成功的
IP=$(curl -s --max-time 3 https://api.ipify.org 2>/dev/null || \
     curl -s --max-time 3 https://ifconfig.me 2>/dev/null || \
     curl -s --max-time 3 https://icanhazip.com 2>/dev/null)

if [ -n "$IP" ]; then
    echo "✅ 你的公网 IP 地址："
    echo "   $IP"
    echo ""
    echo "📋 用于 localtunnel 的 Tunnel Password："
    echo "   $IP"
    echo ""
    echo "💡 提示：访问 localtunnel URL 时，在密码框输入上面的 IP 地址"
else
    echo "❌ 无法获取公网 IP，请检查网络连接"
    exit 1
fi
