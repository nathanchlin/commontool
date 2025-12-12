'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Save, Trash2, Calendar, Users, Clock, Code, Sparkles } from 'lucide-react'
import MeetingNotes from '@/components/MeetingNotes'
import DevLogs from '@/components/DevLogs'
import type { MeetingNote } from '@/types'
import { getFromStorage, saveToStorage, STORAGE_KEYS } from '@/utils/storage'

type ToolTab = 'meeting' | 'devlog'

export default function Home() {
  const [activeTab, setActiveTab] = useState<ToolTab>('meeting')
  const [notes, setNotes] = useState<MeetingNote[]>([])
  const [selectedNote, setSelectedNote] = useState<MeetingNote | null>(null)
  const [showNewNote, setShowNewNote] = useState(false)

  // 从localStorage加载数据
  useEffect(() => {
    const savedNotes = getFromStorage<MeetingNote[]>(STORAGE_KEYS.MEETING_NOTES)
    if (savedNotes) {
      setNotes(savedNotes)
    }
  }, [])

  // 保存到localStorage
  const saveNotes = (newNotes: MeetingNote[]) => {
    saveToStorage(STORAGE_KEYS.MEETING_NOTES, newNotes)
    setNotes(newNotes)
  }

  const handleCreateNote = () => {
    const newNote: MeetingNote = {
      id: Date.now().toString(),
      title: '新会议纪要',
      date: new Date().toISOString().split('T')[0],
      participants: '',
      content: '',
      createdAt: new Date().toISOString(),
    }
    setSelectedNote(newNote)
    setShowNewNote(true)
  }

  const handleSaveNote = (note: MeetingNote) => {
    const existingIndex = notes.findIndex((n) => n.id === note.id)
    let newNotes: MeetingNote[]

    if (existingIndex >= 0) {
      newNotes = [...notes]
      newNotes[existingIndex] = note
    } else {
      newNotes = [...notes, note]
    }

    saveNotes(newNotes)
    setSelectedNote(null)
    setShowNewNote(false)
  }

  const handleDeleteNote = (id: string) => {
    if (confirm('确定要删除这条会议纪要吗？')) {
      const newNotes = notes.filter((n) => n.id !== id)
      saveNotes(newNotes)
      if (selectedNote?.id === id) {
        setSelectedNote(null)
        setShowNewNote(false)
      }
    }
  }

  const handleSelectNote = (note: MeetingNote) => {
    setSelectedNote(note)
    setShowNewNote(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部 */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">工作工具平台</h1>
          <p className="text-gray-600">整合工作开发工具，提升工作效率</p>
        </header>

        {/* 工具切换标签 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab('meeting')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'meeting'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FileText className="w-5 h-5" />
            会议纪要
          </button>
          <button
            onClick={() => setActiveTab('devlog')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'devlog'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            研发日志
          </button>
        </div>

        {/* 根据选中的标签显示不同内容 */}
        {activeTab === 'devlog' ? (
          <DevLogs />
        ) : (

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：工具列表 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  会议纪要
                </h2>
                <button
                  onClick={handleCreateNote}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  新建
                </button>
              </div>

              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">暂无会议纪要</p>
                ) : (
                  notes
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((note) => (
                      <div
                        key={note.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedNote?.id === note.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                        }`}
                        onClick={() => handleSelectNote(note)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-1">{note.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {note.date}
                              </span>
                              {note.participants && (
                                <span className="flex items-center gap-1">
                                  <Users className="w-3 h-3" />
                                  {note.participants.split(',').length}人
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNote(note.id)
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
            {showNewNote && selectedNote ? (
              <MeetingNotes note={selectedNote} onSave={handleSaveNote} onCancel={() => {
                setShowNewNote(false)
                setSelectedNote(null)
              }} />
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center text-gray-500">
                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">选择一个会议纪要开始编辑，或创建新的纪要</p>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

