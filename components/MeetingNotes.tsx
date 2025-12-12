'use client'

import { useState, useEffect } from 'react'
import { Save, X, Calendar, Users, FileText } from 'lucide-react'
import type { MeetingNote } from '@/types'

interface MeetingNotesProps {
  note: MeetingNote
  onSave: (note: MeetingNote) => void
  onCancel: () => void
}

export default function MeetingNotes({ note, onSave, onCancel }: MeetingNotesProps) {
  const [formData, setFormData] = useState<MeetingNote>(note)

  useEffect(() => {
    setFormData(note)
  }, [note])

  const handleChange = (field: keyof MeetingNote, value: string) => {
    setFormData((prev: MeetingNote) => ({ ...prev, [field]: value }))
  }

  const handleSave = () => {
    if (!formData.title.trim()) {
      alert('请输入会议标题')
      return
    }
    onSave(formData)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary-600" />
          编辑会议纪要
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
          <button
            onClick={onCancel}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <X className="w-4 h-4" />
            取消
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* 标题 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            会议标题 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('title', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="请输入会议标题"
          />
        </div>

        {/* 日期和参与人 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              会议日期
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('date', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4" />
              参与人员
            </label>
            <input
              type="text"
              value={formData.participants}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('participants', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="用逗号分隔，如：张三,李四,王五"
            />
          </div>
        </div>

        {/* 会议内容 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            会议内容
          </label>
          <textarea
            value={formData.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('content', e.target.value)}
            rows={15}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="请输入会议内容...&#10;&#10;提示：&#10;- 可以记录会议讨论的要点&#10;- 记录决策事项&#10;- 记录待办事项和负责人"
          />
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>提示：</strong>会议内容支持多行文本，建议按照以下结构组织：
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
            <li>会议主题和背景</li>
            <li>讨论要点</li>
            <li>决策事项</li>
            <li>待办事项（含负责人）</li>
            <li>下次会议时间</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

