import { NextRequest, NextResponse } from 'next/server'
import type { DevLog, ApiResponse } from '@/types'
import { readFile, writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * 研发日志保存 API（服务端）
 * 用于从服务端保存研发日志（如从 Webhook 自动保存）
 */

const DATA_DIR = join(process.cwd(), 'data')
const LOGS_FILE = join(DATA_DIR, 'dev-logs.json')

// 确保数据目录存在
async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true })
  }
}

// 读取日志
async function readLogs(): Promise<DevLog[]> {
  await ensureDataDir()
  try {
    if (existsSync(LOGS_FILE)) {
      const content = await readFile(LOGS_FILE, 'utf-8')
      return JSON.parse(content)
    }
  } catch (error) {
    console.error('读取日志失败:', error)
  }
  return []
}

// 保存日志
async function saveLogs(logs: DevLog[]): Promise<boolean> {
  try {
    await ensureDataDir()
    await writeFile(LOGS_FILE, JSON.stringify(logs, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error('保存日志失败:', error)
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const log: DevLog = await request.json()

    // 验证日志数据
    if (!log.id || !log.title || !log.type) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '日志数据不完整',
      }, { status: 400 })
    }

    // 读取现有日志
    const logs = await readLogs()

    // 检查是否已存在
    const existingIndex = logs.findIndex((l) => l.id === log.id)
    
    if (existingIndex >= 0) {
      // 更新现有日志
      logs[existingIndex] = { ...log, updatedAt: new Date().toISOString() }
    } else {
      // 添加新日志
      logs.push({ ...log, updatedAt: new Date().toISOString() })
    }

    // 保存日志
    const success = await saveLogs(logs)

    if (!success) {
      return NextResponse.json<ApiResponse>({
        success: false,
        error: '保存日志失败',
      }, { status: 500 })
    }

    return NextResponse.json<ApiResponse<DevLog>>({
      success: true,
      data: log,
      message: '日志保存成功',
    })
  } catch (error: any) {
    console.error('保存日志错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || '保存日志失败',
    }, { status: 500 })
  }
}

// GET: 获取所有日志
export async function GET() {
  try {
    const logs = await readLogs()
    return NextResponse.json<ApiResponse<DevLog[]>>({
      success: true,
      data: logs,
    })
  } catch (error: any) {
    console.error('读取日志错误:', error)
    return NextResponse.json<ApiResponse>({
      success: false,
      error: error.message || '读取日志失败',
    }, { status: 500 })
  }
}




