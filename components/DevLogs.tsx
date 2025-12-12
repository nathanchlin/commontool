'use client'

import { useState, useEffect } from 'react'
import { 
  FileText, Plus, Save, Trash2, Calendar, Users, Tag, 
  AlertCircle, CheckCircle, Clock, Sparkles, Settings,
  Download, Upload, Filter
} from 'lucide-react'
import type { DevLog, DevLogType, WeChatMessage } from '@/types'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

interface DevLogsProps {
  onClose?: () => void
}

const LOG_TYPE_LABELS: Record<DevLogType, string> = {
  task: '任务',
  bug: 'Bug',
  meeting: '会议',
  progress: '进度',
  other: '其他',
}

const LOG_TYPE_COLORS: Record<DevLogType, string> = {
  task: 'bg-blue-100 text-blue-800',
  bug: 'bg-red-100 text-red-800',
  meeting: 'bg-purple-100 text-purple-800',
  progress: 'bg-green-100 text-green-800',
  other: 'bg-gray-100 text-gray-800',
}

const PRIORITY_COLORS = {
  high: 'text-red-600',
  medium: 'text-yellow-600',
  low: 'text-green-600',
}

export default function DevLogs({ onClose }: DevLogsProps) {
  const [logs, setLogs] = useState<DevLog[]>([])
  const [selectedLog, setSelectedLog] = useState<DevLog | null>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [filterType, setFilterType] = useState<DevLogType | 'all'>('all')
  const [filterProject, setFilterProject] = useState<string>('')

  // 从 localStorage 加载数据
  useEffect(() => {
    const savedLogs = getFromStorage<DevLog[]>(STORAGE_KEYS.DEV_LOGS)
    if (savedLogs) {
      setLogs(savedLogs)
    }
  }, [])

  // 保存日志
  const saveLogs = (newLogs: DevLog[]) => {
    saveToStorage(STORAGE_KEYS.DEV_LOGS, newLogs)
    setLogs(newLogs)
  }

  // 创建新日志
  const handleCreateLog = () => {
    const newLog: DevLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'other',
      title: '新研发日志',
      participants: [],
      content: '',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setSelectedLog(newLog)
    setShowEditor(true)
  }

  // 保存日志
  const handleSaveLog = (log: DevLog) => {
    const existingIndex = logs.findIndex((l) => l.id === log.id)
    let newLogs: DevLog[]

    if (existingIndex >= 0) {
      newLogs = [...logs]
      newLogs[existingIndex] = { ...log, updatedAt: new Date().toISOString() }
    } else {
      newLogs = [...logs, { ...log, updatedAt: new Date().toISOString() }]
    }

    saveLogs(newLogs)
    setSelectedLog(null)
    setShowEditor(false)
  }

  // 删除日志
  const handleDeleteLog = (id: string) => {
    if (confirm('确定要删除这条研发日志吗？')) {
      const newLogs = logs.filter((l) => l.id !== id)
      saveLogs(newLogs)
      if (selectedLog?.id === id) {
        setSelectedLog(null)
        setShowEditor(false)
      }
    }
  }

  // AI 提取信息
  const handleExtract = async () => {
    if (!importText.trim()) {
      alert('请输入要提取的聊天内容')
      return
    }

    setIsExtracting(true)
    try {
      const response = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [importText],
          project: filterProject || undefined,
        }),
      })

      const result = await response.json()
      
      if (result.success && result.data) {
        const extracted = result.data
        const newLog: DevLog = {
          id: Date.now().toString(),
          date: new Date().toISOString().split('T')[0],
          project: extracted.project,
          type: extracted.type,
          title: extracted.title,
          participants: extracted.participants || [],
          content: extracted.content,
          status: extracted.status,
          priority: extracted.priority,
          tags: extracted.tags,
          relatedMessages: [importText],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        setSelectedLog(newLog)
        setShowEditor(true)
        setShowImport(false)
        setImportText('')
      } else {
        alert(result.error || 'AI 提取失败')
      }
    } catch (error: any) {
      console.error('Extract error:', error)
      alert('AI 提取失败: ' + error.message)
    } finally {
      setIsExtracting(false)
    }
  }

  // 拉取企业微信消息
  const handlePullWeChat = async () => {
    // TODO: 实现企业微信消息拉取
    // 需要先配置企业微信参数
    alert('企业微信消息拉取功能需要配置 API 参数，请先配置企业微信设置')
  }

  // 过滤日志
  const filteredLogs = logs.filter(log => {
    if (filterType !== 'all' && log.type !== filterType) return false
    if (filterProject && log.project !== filterProject) return false
    return true
  })

  // 获取所有项目列表
  const projects = Array.from(new Set(logs.map(log => log.project).filter(Boolean))) as string[]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="container mx-auto">
        {/* 头部 */}
        <header className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                <FileText className="w-8 h-8 text-primary-600" />
                研发日志管理
              </h1>
              <p className="text-gray-600">自动提取企业微信聊天关键信息，生成结构化研发日志</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowImport(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                AI 提取
              </button>
              <button
                onClick={handleCreateLog}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                新建日志
              </button>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：日志列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* 过滤器 */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Filter className="w-4 h-4" />
                  <span>筛选</span>
                </div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as DevLogType | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">全部类型</option>
                  {Object.entries(LOG_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">全部项目</option>
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredLogs.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无研发日志</p>
                ) : (
                  filteredLogs
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((log) => (
                      <div
                        key={log.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedLog?.id === log.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                        onClick={() => {
                          setSelectedLog(log)
                          setShowEditor(true)
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{log.title}</h3>
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <span className={`px-2 py-1 rounded text-xs ${LOG_TYPE_COLORS[log.type]}`}>
                                {LOG_TYPE_LABELS[log.type]}
                              </span>
                              {log.priority && (
                                <span className={`text-xs font-medium ${PRIORITY_COLORS[log.priority]}`}>
                                  {log.priority === 'high' ? '高' : log.priority === 'medium' ? '中' : '低'}优先级
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {log.date}
                              </span>
                              {log.participants.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {log.participants.length}人
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteLog(log.id)
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

          {/* 右侧：编辑区域 */}
          <div className="lg:col-span-2">
            {showImport ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-600" />
                  AI 信息提取
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      项目名称（可选）
                    </label>
                    <input
                      type="text"
                      value={filterProject}
                      onChange={(e) => setFilterProject(e.target.value)}
                      placeholder="输入项目名称"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      聊天内容
                    </label>
                    <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      placeholder="粘贴企业微信聊天内容，AI 将自动提取关键信息..."
                      rows={12}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg font-mono text-sm"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExtract}
                      disabled={isExtracting || !importText.trim()}
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isExtracting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          提取中...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          开始提取
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setShowImport(false)
                        setImportText('')
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
                    >
                      取消
                    </button>
                  </div>
                </div>
              </div>
            ) : showEditor && selectedLog ? (
              <LogEditor log={selectedLog} onSave={handleSaveLog} onCancel={() => {
                setShowEditor(false)
                setSelectedLog(null)
              }} />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">选择一个日志开始编辑，或使用 AI 提取功能</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// 日志编辑器组件
interface LogEditorProps {
  log: DevLog
  onSave: (log: DevLog) => void
  onCancel: () => void
}

function LogEditor({ log, onSave, onCancel }: LogEditorProps) {
  const [editedLog, setEditedLog] = useState<DevLog>(log)

  const handleSave = () => {
    onSave(editedLog)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-4">编辑研发日志</h2>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">日期</label>
            <input
              type="date"
              value={editedLog.date}
              onChange={(e) => setEditedLog({ ...editedLog, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">项目</label>
            <input
              type="text"
              value={editedLog.project || ''}
              onChange={(e) => setEditedLog({ ...editedLog, project: e.target.value })}
              placeholder="项目名称"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">类型</label>
            <select
              value={editedLog.type}
              onChange={(e) => setEditedLog({ ...editedLog, type: e.target.value as DevLogType })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {Object.entries(LOG_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">优先级</label>
            <select
              value={editedLog.priority || 'medium'}
              onChange={(e) => setEditedLog({ ...editedLog, priority: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标题</label>
          <input
            type="text"
            value={editedLog.title}
            onChange={(e) => setEditedLog({ ...editedLog, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">参与人员（用逗号分隔）</label>
          <input
            type="text"
            value={editedLog.participants.join(', ')}
            onChange={(e) => setEditedLog({ 
              ...editedLog, 
              participants: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
            })}
            placeholder="张三, 李四, 王五"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">状态</label>
          <input
            type="text"
            value={editedLog.status || ''}
            onChange={(e) => setEditedLog({ ...editedLog, status: e.target.value })}
            placeholder="如：进行中、已完成"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">标签（用逗号分隔）</label>
          <input
            type="text"
            value={editedLog.tags?.join(', ') || ''}
            onChange={(e) => setEditedLog({ 
              ...editedLog, 
              tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
            })}
            placeholder="前端, 后端, 测试"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">内容</label>
          <textarea
            value={editedLog.content}
            onChange={(e) => setEditedLog({ ...editedLog, content: e.target.value })}
            rows={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  )
}

