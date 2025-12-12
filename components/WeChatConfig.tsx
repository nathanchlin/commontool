'use client'

import { useState, useEffect } from 'react'
import { Settings, Save, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { 
  getWeChatConfigClient, 
  saveWeChatConfigToStorage,
  validateWeChatConfigClient 
} from '@/utils/wechat'
import type { WeChatConfig } from '@/config/wechat.config'

interface WeChatConfigProps {
  onClose?: () => void
}

export default function WeChatConfig({ onClose }: WeChatConfigProps) {
  const [config, setConfig] = useState<WeChatConfig>({ enabled: false })
  const [showSecrets, setShowSecrets] = useState(false)
  const [validation, setValidation] = useState({ valid: false, missing: [] as string[] })
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')

  useEffect(() => {
    const saved = getWeChatConfigClient()
    setConfig(saved)
    setValidation(validateWeChatConfigClient(saved, false))
  }, [])

  const handleChange = (field: keyof WeChatConfig, value: string) => {
    const newConfig = { ...config, [field]: value }
    setConfig(newConfig)
    setValidation(validateWeChatConfigClient(newConfig, false))
  }

  const handleSave = () => {
    setSaveStatus('saving')
    try {
      const success = saveWeChatConfigToStorage(config)
      if (success) {
        setSaveStatus('success')
        setTimeout(() => {
          setSaveStatus('idle')
          onClose?.()
        }, 1500)
      } else {
        setSaveStatus('error')
      }
    } catch (error) {
      console.error('Save config error:', error)
      setSaveStatus('error')
    }
  }

  const validateForWebhook = validateWeChatConfigClient(config, true)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary-600" />
          企业微信配置
        </h2>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* 基础配置 */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">基础配置</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                企业ID (corpId) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.corpId || ''}
                onChange={(e) => handleChange('corpId', e.target.value)}
                placeholder="请输入企业ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                应用ID (agentId) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={config.agentId || ''}
                onChange={(e) => handleChange('agentId', e.target.value)}
                placeholder="请输入应用ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                应用密钥 (secret) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecrets ? 'text' : 'password'}
                  value={config.secret || ''}
                  onChange={(e) => handleChange('secret', e.target.value)}
                  placeholder="请输入应用密钥"
                  className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowSecrets(!showSecrets)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Webhook 配置 */}
        <div className="border-t pt-4">
          <h3 className="text-lg font-medium text-gray-700 mb-3">Webhook 配置（可选）</h3>
          <p className="text-sm text-gray-500 mb-3">
            用于接收企业微信回调消息，需要配置 Token 和 EncodingAESKey
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.token || ''}
                onChange={(e) => handleChange('token', e.target.value)}
                placeholder="用于验证回调URL"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                EncodingAESKey
              </label>
              <input
                type={showSecrets ? 'text' : 'password'}
                value={config.encodingAESKey || ''}
                onChange={(e) => handleChange('encodingAESKey', e.target.value)}
                placeholder="用于消息加解密"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* 配置状态 */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {validation.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-green-700">基础配置完整，可以使用消息拉取功能</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm text-yellow-700">
                    缺少配置项: {validation.missing.join(', ')}
                  </span>
                </>
              )}
            </div>
            {validateForWebhook.valid && (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Webhook 配置完整，可以接收回调消息</span>
              </div>
            )}
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saveStatus === 'saving'}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saveStatus === 'saving' ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </>
            ) : saveStatus === 'success' ? (
              <>
                <CheckCircle className="w-4 h-4" />
                保存成功
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                保存配置
              </>
            )}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              取消
            </button>
          )}
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong>
            配置信息保存在浏览器本地存储中，不会上传到服务器。
            你也可以通过环境变量（.env.local）配置，环境变量优先级更高。
          </p>
        </div>
      </div>
    </div>
  )
}

