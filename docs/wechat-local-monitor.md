# 企业微信本地消息监听方案

## 方案一：监听本地数据库（推荐）

企业微信桌面版使用 SQLite 数据库存储消息，可以监听数据库文件变化。

### 技术实现

#### 1. 数据库位置（macOS）
```
~/Library/Containers/com.tencent.xinWeWork/Data/Library/Application Support/com.tencent.xinWeWork/
```

#### 2. 使用 Node.js 监听数据库变化

```typescript
import Database from 'better-sqlite3'
import { watch } from 'fs'

// 企业微信数据库路径
const DB_PATH = '~/Library/Containers/com.tencent.xinWeWork/Data/Library/Application Support/com.tencent.xinWeWork/...'

// 打开数据库（只读模式）
const db = new Database(DB_PATH, { readonly: true })

// 监听新消息
function monitorMessages() {
  const lastMsgId = getLastProcessedMsgId()
  
  setInterval(() => {
    const newMessages = db.prepare(`
      SELECT * FROM messages 
      WHERE msg_id > ? 
      ORDER BY msg_id ASC
    `).all(lastMsgId)
    
    newMessages.forEach(msg => {
      processMessage(msg)
      lastMsgId = msg.msg_id
    })
  }, 1000) // 每秒检查一次
}
```

### 注意事项
- 需要找到正确的数据库文件路径
- 数据库可能加密，需要解密
- 需要处理数据库文件锁定问题
- 不同版本的企业微信数据库结构可能不同

## 方案二：使用自动化工具

### 1. Puppeteer / Playwright（不适用）
企业微信桌面版不是 Web 应用，无法使用浏览器自动化。

### 2. 系统级自动化（macOS）
使用 AppleScript 或 Accessibility API：

```javascript
// 使用 node-applescript
const applescript = require('applescript')

// 获取企业微信窗口内容
const script = `
tell application "企业微信"
  get name of windows
end tell
`
```

### 3. 屏幕截图 + OCR（不推荐）
- 性能差
- 准确率低
- 资源消耗大

## 方案三：监听日志文件

企业微信可能生成日志文件，可以监听日志：

```typescript
import { watch } from 'fs'
import { readFile } from 'fs/promises'
import { Tail } from 'tail'

// 监听日志文件
const logPath = '~/Library/Logs/com.tencent.xinWeWork/...'
const tail = new Tail(logPath)

tail.on('line', (data) => {
  // 解析日志，提取消息
  parseLogLine(data)
})
```

## 方案四：使用企业微信 API（官方推荐）

### 优点
- 官方支持
- 稳定可靠
- 无需破解客户端

### 缺点
- 需要企业管理员权限
- 需要配置回调 URL
- 只能接收应用可见范围内的消息

### 实现方式
参考我们已实现的 Webhook 方案。

## 方案五：第三方工具/插件

### 1. 企业微信助手类工具
- 一些第三方工具可能提供消息监听功能
- 需要谨慎使用，注意安全性

### 2. 浏览器扩展（仅限 Web 版）
如果使用企业微信 Web 版，可以开发浏览器扩展：
- Chrome Extension
- Firefox Add-on

## 推荐方案对比

| 方案 | 难度 | 稳定性 | 合法性 | 推荐度 |
|------|------|--------|--------|--------|
| 监听数据库 | ⭐⭐⭐ | ⭐⭐⭐ | ⚠️ | ⭐⭐ |
| 系统自动化 | ⭐⭐⭐⭐ | ⭐⭐ | ⚠️ | ⭐ |
| 监听日志 | ⭐⭐ | ⭐⭐ | ⚠️ | ⭐⭐ |
| 官方 API | ⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ | ⭐⭐⭐⭐⭐ |
| 浏览器扩展 | ⭐⭐ | ⭐⭐⭐ | ✅ | ⭐⭐⭐ |

## 注意事项

### 1. 法律和隐私
- ⚠️ 监听本地数据可能违反企业微信服务条款
- ⚠️ 需要确保符合公司隐私政策
- ⚠️ 建议先获得授权

### 2. 技术风险
- 数据库结构可能随版本更新变化
- 数据可能加密
- 需要处理文件权限问题

### 3. 最佳实践
1. **优先使用官方 API**：最稳定、最合法
2. **如果必须本地监听**：
   - 使用只读模式访问数据库
   - 不要修改任何数据
   - 定期备份和测试
   - 做好错误处理

## 实现示例

### 创建本地监听服务

```typescript
// utils/wechat-local-monitor.ts
import { watch, readFileSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'

export class WeChatLocalMonitor {
  private dbPath: string
  private isMonitoring: boolean = false

  constructor() {
    // 企业微信数据库路径（需要根据实际情况调整）
    this.dbPath = join(
      homedir(),
      'Library/Containers/com.tencent.xinWeWork/Data/Library/Application Support/com.tencent.xinWeWork'
    )
  }

  async startMonitoring(callback: (message: any) => void) {
    if (this.isMonitoring) return

    // 监听数据库文件变化
    watch(this.dbPath, { recursive: true }, (eventType, filename) => {
      if (eventType === 'change' && filename?.endsWith('.db')) {
        this.readNewMessages(callback)
      }
    })

    this.isMonitoring = true
  }

  private async readNewMessages(callback: (message: any) => void) {
    // TODO: 实现数据库读取逻辑
    // 需要找到正确的数据库文件和表结构
  }

  stopMonitoring() {
    this.isMonitoring = false
  }
}
```

## 总结

**最推荐的方案**：使用企业微信官方 API（Webhook 回调）
- 合法合规
- 稳定可靠
- 我们已经实现了相关功能

**如果无法使用官方 API**：
- 可以尝试监听本地数据库
- 需要深入研究企业微信的数据库结构
- 需要处理版本兼容性问题

