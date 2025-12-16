#!/bin/bash

echo "=== 启动内网穿透 ==="
echo ""

# 检查 localtunnel 是否已安装
if ! command -v lt &> /dev/null; then
    echo "正在安装 localtunnel..."
    npm install -g localtunnel
fi

# 检查开发服务器是否运行
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  开发服务器未运行，请先执行: npm run dev"
    exit 1
fi

echo "✅ 开发服务器运行正常"
echo ""
echo "🚀 启动 localtunnel..."
echo "   注意: 首次访问可能需要点击 'Continue' 按钮"
echo ""

lt --port 3000
