<template>
  <div>
    <!-- 頁面內容（保持原始樣式） -->
    <slot />

    <!-- Debug Modal (只保留模態框，移除右上角觸發器) -->
    <DebugModal
      :show="showDebugModal"
      @close="showDebugModal = false"
    />
  </div>
</template>

<script setup lang="ts">
// 全域調試模態框狀態
const showDebugModal = ref(false)

// 提供給子組件使用的全域調試觸發函數
provide('triggerDebugModal', () => {
  showDebugModal.value = true
})
</script>
