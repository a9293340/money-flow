/**
 * Logo 連續點擊觸發調試模式的 composable
 * 使用方法：在頁面中調用 const { handleLogoClick } = useDebugTrigger()
 * 然後在 logo 元素上添加 @click="handleLogoClick"
 */

import { enableDebug, isDebugEnabled } from '~/lib/utils/mobile-debug'

export function useDebugTrigger() {
  // 注入 layout 提供的觸發函數
  const triggerDebugModal = inject<() => void>('triggerDebugModal')
  
  // 點擊計數和計時器
  let clickCount = 0
  let clickTimer: NodeJS.Timeout | null = null

  /**
   * 處理 logo 點擊事件 - 檢測連續5次點擊
   */
  function handleLogoClick() {
    clickCount++

    // 清除之前的計時器
    if (clickTimer) {
      clearTimeout(clickTimer)
    }

    // 如果達到5次點擊，觸發調試模式
    if (clickCount >= 5) {
      triggerDebugMode()
      return
    }

    // 設置計時器，3秒後重置點擊計數
    clickTimer = setTimeout(() => {
      clickCount = 0
    }, 3000)
  }

  /**
   * 觸發調試模式
   */
  function triggerDebugMode() {
    // 重置計數器和計時器
    clickCount = 0
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }

    // 啟用調試模式
    enableDebug()

    // 觸發調試模態框
    if (triggerDebugModal) {
      triggerDebugModal()
    }

    // 在控制台輸出調試信息（只在開發環境）
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Logo debug trigger activated - Debug mode enabled')
    }

    // 可選：顯示提示訊息（可以用 toast 或其他方式）
    if (typeof window !== 'undefined' && isDebugEnabled()) {
      // 簡單的視覺反饋
      const originalTitle = document.title
      document.title = '🔧 調試模式已啟用'
      setTimeout(() => {
        document.title = originalTitle
      }, 2000)
    }
  }

  /**
   * 開發者快速觸發調試模式（用於測試時強制觸發）
   * 使用方式：在 console 中執行 window.triggerDebug() 或在代碼中直接調用
   */
  function forceDebugTrigger() {
    triggerDebugMode()
  }

  // 在開發環境下暴露到 window 對象，方便開發者快速觸發
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).triggerDebug = forceDebugTrigger
  }

  // 組件銷毀時清理計時器
  onUnmounted(() => {
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
  })

  return {
    handleLogoClick,
    forceDebugTrigger,
  }
}