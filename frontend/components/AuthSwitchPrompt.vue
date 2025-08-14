<template>
  <div class="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 animate-fade-in">
    <div class="flex items-start">
      <!-- 用戶頭像 -->
      <div class="flex-shrink-0">
        <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
          <span class="text-white text-lg font-medium">
            {{ userInitial }}
          </span>
        </div>
      </div>

      <!-- 內容區域 -->
      <div class="ml-4 flex-1">
        <h3 class="text-lg font-semibold text-blue-900 mb-2">
          {{ title }}
        </h3>
        <p class="text-blue-700 mb-4">
          {{ description }}
        </p>

        <!-- 操作按鈕 -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            class="btn-primary flex-1 sm:flex-none"
            @click="$emit('continue')"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ continueButtonText }}
          </button>

          <button
            class="btn-secondary flex-1 sm:flex-none"
            @click="$emit('switch')"
          >
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m0-4l4-4"
              />
            </svg>
            {{ switchButtonText }}
          </button>
        </div>

        <!-- 額外說明（僅註冊頁顯示） -->
        <p
          v-if="pageType === 'register'"
          class="text-xs text-blue-600 mt-3"
        >
          💡 提示：您也可以在 Dashboard 中管理多個財務帳本
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  /** 頁面類型 */
  pageType: 'login' | 'register'
  /** 提示標題 */
  title: string
  /** 提示描述 */
  description: string
  /** 用戶顯示名稱 */
  userDisplayName: string
}

const props = defineProps<Props>()

defineEmits<{
  continue: []
  switch: []
}>()

// 計算用戶頭像初始字母
const userInitial = computed(() => {
  if (!props.userDisplayName) return 'U'
  return props.userDisplayName.charAt(0).toUpperCase()
})

// 計算按鈕文字
const continueButtonText = computed(() => {
  if (props.pageType === 'login') {
    return '繼續使用此帳戶'
  }
  else {
    return '前往 Dashboard'
  }
})

const switchButtonText = computed(() => {
  if (props.pageType === 'login') {
    return '使用其他帳戶'
  }
  else {
    return '註冊新帳戶'
  }
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
