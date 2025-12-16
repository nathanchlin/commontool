#!/bin/bash

echo "=== 企业微信配置检查 ==="
echo ""

echo "1. 检查环境变量文件..."
if [ -f .env.local ]; then
  echo "✓ .env.local 文件存在"
  source .env.local
  echo ""
  echo "   配置项："
  [ -n "$WECHAT_CORP_ID" ] && echo "   ✓ WECHAT_CORP_ID: ${WECHAT_CORP_ID:0:15}..." || echo "   ✗ WECHAT_CORP_ID: 未设置"
  [ -n "$WECHAT_AGENT_ID" ] && echo "   ✓ WECHAT_AGENT_ID: $WECHAT_AGENT_ID" || echo "   ✗ WECHAT_AGENT_ID: 未设置"
  [ -n "$WECHAT_SECRET" ] && echo "   ✓ WECHAT_SECRET: ${WECHAT_SECRET:0:15}..." || echo "   ✗ WECHAT_SECRET: 未设置"
  [ -n "$WECHAT_TOKEN" ] && [ "$WECHAT_TOKEN" != "your-token" ] && echo "   ✓ WECHAT_TOKEN: 已设置" || echo "   ✗ WECHAT_TOKEN: 未设置或为默认值"
  [ -n "$WECHAT_ENCODING_AES_KEY" ] && [ "$WECHAT_ENCODING_AES_KEY" != "your-encoding-aes-key" ] && echo "   ✓ WECHAT_ENCODING_AES_KEY: 已设置" || echo "   ✗ WECHAT_ENCODING_AES_KEY: 未设置或为默认值"
  [ "$WECHAT_ENABLED" = "true" ] && echo "   ✓ WECHAT_ENABLED: true" || echo "   ⚠ WECHAT_ENABLED: $WECHAT_ENABLED"
else
  echo "✗ .env.local 文件不存在"
  echo "   请从 env.example 复制并创建 .env.local"
fi

echo ""
echo "2. 检查开发服务器..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "✓ 服务器运行正常 (http://localhost:3000)"
else
  echo "✗ 服务器未运行"
  echo "   请执行: npm run dev"
fi

echo ""
echo "3. 检查回调接口..."
if curl -s http://localhost:3000/api/wechat/webhook > /dev/null 2>&1; then
  echo "✓ 回调接口可访问"
else
  echo "✗ 回调接口不可访问"
  echo "   请确保服务器正在运行"
fi

echo ""
echo "=== 检查完成 ==="
echo ""
echo "下一步："
echo "1. 如果 Token 或 EncodingAESKey 未设置，请更新 .env.local"
echo "2. 在企业微信管理后台配置接收消息回调 URL"
echo "3. 使用内网穿透工具（如 ngrok）暴露本地端口"
echo "4. 详细步骤请查看: docs/debug-testing-guide.md"
