<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 頁面內容 -->
    <slot />

    <!-- Debug Trigger (全域隱藏調試觸發器) -->
    <DebugTrigger />
  </div>
</template>

<script setup lang="ts">
// 預設布局，包含全域調試功能
</script>
