/**
 * Logo 連續點擊觸發配置資訊彈窗的 composable
 * 使用方法：在頁面中調用 const { handleLogoClick, showConfigModal, ... } = useDebugTrigger()
 * 然後在 logo 元素上添加 @click="handleLogoClick"
 */

import { enableDebug } from '~/lib/utils/mobile-debug'

export function useDebugTrigger() {
  // 注入 layout 提供的觸發函數（可能為空，如 index.vue 使用 layout: false）
  const triggerDebugModal = inject<() => void>('triggerDebugModal', () => {})

  // 狀態管理
  const showConfigModal = ref(false)

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

    // 如果達到5次點擊，觸發配置資訊彈窗
    if (clickCount >= 5) {
      triggerConfigModal()
      return
    }

    // 設置計時器，3秒後重置點擊計數
    clickTimer = setTimeout(() => {
      clickCount = 0
    }, 3000)
  }

  /**
   * 觸發配置資訊彈窗
   */
  function triggerConfigModal() {
    // 重置計數器和計時器
    clickCount = 0
    if (clickTimer) {
      clearTimeout(clickTimer)
      clickTimer = null
    }

    // 顯示配置資訊彈窗
    showConfigModal.value = true

    // 簡單的視覺反饋
    if (typeof window !== 'undefined') {
      const originalTitle = document.title
      document.title = '⚙️ 配置資訊已開啟'
      setTimeout(() => {
        document.title = originalTitle
      }, 2000)
    }
  }

  /**
   * 關閉配置資訊彈窗
   */
  function closeConfigModal() {
    showConfigModal.value = false
  }

  /**
   * 從配置彈窗開啟調試模式
   */
  function openDebugFromConfig() {
    // 關閉配置彈窗
    showConfigModal.value = false

    // 啟用調試模式
    enableDebug()

    // 觸發調試模態框（如果有 layout 的話）
    if (triggerDebugModal) {
      triggerDebugModal()
    }
    else {
      // 沒有 layout 時的替代方案（如 index.vue）
      if (process.env.NODE_ENV === 'development') {
        alert('調試模式已啟用')
      }
    }
  }

  /**
   * 開發者快速觸發配置彈窗（用於測試時強制觸發）
   * 使用方式：在 console 中執行 window.triggerConfig()
   */
  function forceConfigTrigger() {
    triggerConfigModal()
  }

  /**
   * 開發者快速觸發調試模式（用於測試時強制觸發）
   * 使用方式：在 console 中執行 window.triggerDebug()
   */
  function forceDebugTrigger() {
    enableDebug()
    if (triggerDebugModal) {
      triggerDebugModal()
    }
  }

  // 在開發環境下暴露到 window 對象，方便開發者快速觸發
  if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
    ;(window as unknown as Record<string, unknown>).triggerConfig = forceConfigTrigger
    ;(window as unknown as Record<string, unknown>).triggerDebug = forceDebugTrigger
  }

  // 組件銷毀時清理計時器
  onUnmounted(() => {
    if (clickTimer) {
      clearTimeout(clickTimer)
    }
  })

  return {
    // 狀態
    showConfigModal: readonly(showConfigModal),

    // 方法
    handleLogoClick,
    closeConfigModal,
    openDebugFromConfig,
    forceConfigTrigger,
    forceDebugTrigger,
  }
}
