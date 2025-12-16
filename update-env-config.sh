#!/bin/bash

# 生成 Token 和 EncodingAESKey
TOKEN="WeChatToken$(date +%s)"
AES_KEY=$(openssl rand -base64 32 | head -c 43)

echo "=== 生成配置值 ==="
echo ""
echo "Token:"
echo "$TOKEN"
echo ""
echo "EncodingAESKey:"
echo "$AES_KEY"
echo ""
echo "=== 更新 .env.local ==="
echo ""
echo "请手动更新 .env.local 文件，添加以下内容："
echo ""
echo "WECHAT_TOKEN=$TOKEN"
echo "WECHAT_ENCODING_AES_KEY=$AES_KEY"
echo ""
echo "或者运行以下命令自动更新（会保留现有配置）："
echo ""
echo "echo 'WECHAT_TOKEN=$TOKEN' >> .env.local"
echo "echo 'WECHAT_ENCODING_AES_KEY=$AES_KEY' >> .env.local"
