<template>
  <div
    class="fixed top-4 right-4 w-12 h-12 z-40 cursor-default bg-transparent opacity-0 hover:opacity-5 transition-opacity"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
    @touchcancel="handleTouchCancel"
  >
    <!-- 完全透明的觸發區域，只有 hover 時稍微可見 -->
  </div>

  <!-- Debug Modal -->
  <DebugModal
    :show="showModal"
    @close="showModal = false"
  />
</template>

<script setup lang="ts">
const showModal = ref(false)

// 點擊計數和計時器
let clickCount = 0
let clickTimer: NodeJS.Timeout | null = null

// 長按檢測
let touchTimer: NodeJS.Timeout | null = null
let touchStartTime = 0

/**
 * 處理點擊事件 - 檢測三次點擊
 */
function handleClick() {
  clickCount++

  // 清除之前的計時器
  if (clickTimer) {
    clearTimeout(clickTimer)
  }

  // 如果達到三次點擊，觸發調試模式
  if (clickCount >= 3) {
    triggerDebugModal()
    return
  }

  // 設置計時器，2秒後重置點擊計數
  clickTimer = setTimeout(() => {
    clickCount = 0
  }, 2000)
}

/**
 * 處理觸控開始 - 開始長按檢測
 */
function handleTouchStart(event: TouchEvent) {
  event.preventDefault()
  touchStartTime = Date.now()

  // 設置 3 秒長按計時器
  touchTimer = setTimeout(() => {
    triggerDebugModal()
  }, 3000)
}

/**
 * 處理觸控結束 - 取消長按檢測
 */
function handleTouchEnd(event: TouchEvent) {
  event.preventDefault()

  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }

  // 如果是短按，觸發點擊邏輯
  const touchDuration = Date.now() - touchStartTime
  if (touchDuration < 500) {
    handleClick()
  }
}

/**
 * 處理觸控取消 - 清理計時器
 */
function handleTouchCancel() {
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }
}

/**
 * 觸發調試模式對話框
 */
function triggerDebugModal() {
  // 重置計數器和計時器
  clickCount = 0
  if (clickTimer) {
    clearTimeout(clickTimer)
    clickTimer = null
  }
  if (touchTimer) {
    clearTimeout(touchTimer)
    touchTimer = null
  }

  // 顯示調試模式
  showModal.value = true

  // 在控制台輸出調試信息
  console.log('🔧 Debug mode triggered')
}

// 組件銷毀時清理計時器
onUnmounted(() => {
  if (clickTimer) {
    clearTimeout(clickTimer)
  }
  if (touchTimer) {
    clearTimeout(touchTimer)
  }
})
</script>
