/**
 * 移動端調試工具
 * 在移動端顯示調試資訊，替代 console.log
 */

interface DebugMessage {
  timestamp: Date
  type: 'info' | 'warn' | 'error' | 'success'
  message: string
  data?: any
}

class MobileDebugger {
  private messages: DebugMessage[] = []
  private listeners: Array<(messages: DebugMessage[]) => void> = []
  private maxMessages = 50
  private isEnabled = false

  constructor() {
    // 開發環境預設啟用，生產環境預設關閉
    this.isEnabled = process.env.NODE_ENV === 'development'
  }

  // 啟用/禁用調試功能
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    if (!enabled) {
      this.clear()
    }
  }

  // 檢查是否應該記錄訊息
  private shouldLog(type: DebugMessage['type']): boolean {
    if (!this.isEnabled) {
      // 生產環境下只記錄錯誤和警告
      return type === 'error' || type === 'warn'
    }
    return true
  }

  addMessage(type: DebugMessage['type'], message: string, data?: any) {
    // 檢查是否應該記錄此類型的訊息
    if (!this.shouldLog(type)) {
      return
    }

    const newMessage: DebugMessage = {
      timestamp: new Date(),
      type,
      message,
      data,
    }

    this.messages.push(newMessage)

    // 限制訊息數量
    if (this.messages.length > this.maxMessages) {
      this.messages.shift()
    }

    // 通知所有監聽器
    this.listeners.forEach(listener => listener([...this.messages]))

    // 在開發環境下同時輸出到 console
    if (process.env.NODE_ENV === 'development') {
      const consoleMethod = type === 'error' ? 'error' : type === 'warn' ? 'warn' : 'log'
      console[consoleMethod](`[${type.toUpperCase()}] ${message}`, data || '')
    }
  }

  // 取得調試狀態
  getIsEnabled() {
    return this.isEnabled
  }

  info(message: string, data?: any) {
    this.addMessage('info', message, data)
  }

  warn(message: string, data?: any) {
    this.addMessage('warn', message, data)
  }

  error(message: string, data?: any) {
    this.addMessage('error', message, data)
  }

  success(message: string, data?: any) {
    this.addMessage('success', message, data)
  }

  subscribe(listener: (messages: DebugMessage[]) => void) {
    this.listeners.push(listener)
    // 立即提供當前訊息
    listener([...this.messages])

    // 返回取消訂閱函數
    return () => {
      const index = this.listeners.indexOf(listener)
      if (index > -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  clear() {
    this.messages = []
    this.listeners.forEach(listener => listener([]))
  }

  getMessages() {
    return [...this.messages]
  }

  // 顯示簡單的 alert 彈窗（備用方案）
  alert(message: string, data?: any) {
    let alertMessage = message
    if (data) {
      alertMessage += '\n\n' + (typeof data === 'object' ? JSON.stringify(data, null, 2) : String(data))
    }
    alert(alertMessage)
  }
}

// 創建全域實例
export const mobileDebug = new MobileDebugger()

// 便捷的全域函數
export const debugInfo = (message: string, data?: any) => mobileDebug.info(message, data)
export const debugWarn = (message: string, data?: any) => mobileDebug.warn(message, data)
export const debugError = (message: string, data?: any) => mobileDebug.error(message, data)
export const debugSuccess = (message: string, data?: any) => mobileDebug.success(message, data)
export const debugAlert = (message: string, data?: any) => mobileDebug.alert(message, data)

// 🔧 調試功能控制開關 - 測試通過後可以設置為 false 來禁用所有調試功能
const ENABLE_DEBUG_SYSTEM = true

// 調試控制函數
export const enableDebug = () => ENABLE_DEBUG_SYSTEM && mobileDebug.setEnabled(true)
export const disableDebug = () => mobileDebug.setEnabled(false)
export const isDebugEnabled = () => ENABLE_DEBUG_SYSTEM && mobileDebug.getIsEnabled()

// 包裝後的調試函數 - 會檢查全域開關
export const safeDebugInfo = (message: string, data?: any) => ENABLE_DEBUG_SYSTEM ? mobileDebug.info(message, data) : undefined
export const safeDebugWarn = (message: string, data?: any) => ENABLE_DEBUG_SYSTEM ? mobileDebug.warn(message, data) : undefined
export const safeDebugError = (message: string, data?: any) => ENABLE_DEBUG_SYSTEM ? mobileDebug.error(message, data) : undefined
export const safeDebugSuccess = (message: string, data?: any) => ENABLE_DEBUG_SYSTEM ? mobileDebug.success(message, data) : undefined

export default mobileDebug
