<template>
  <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <!-- 步驟標題 -->
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">
        {{ stepTitle }}
      </h2>
      <p class="text-gray-600 text-sm">
        {{ stepDescription }}
      </p>
    </div>

    <!-- 問卷內容 -->
    <div class="space-y-6">
      <slot />
    </div>

    <!-- 導航按鈕 -->
    <div class="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
      <button
        v-if="currentStep > 1"
        class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
        type="button"
        @click="$emit('previousStep')"
      >
        ← 上一步
      </button>
      <div v-else />

      <button
        :disabled="!canProceed || isAnalyzing"
        :class="{
          'bg-blue-600 hover:bg-blue-700 text-white': canProceed && !isAnalyzing,
          'bg-gray-300 text-gray-500 cursor-not-allowed': !canProceed || isAnalyzing,
        }"
        class="px-6 py-2 rounded-md font-medium transition-colors flex items-center justify-center"
        type="button"
        @click="handleNext"
      >
        <svg
          v-if="isAnalyzing && isLastStep"
          class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        {{ getButtonText() }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// =========================
// Props & Emits
// =========================

interface Props {
  currentStep: number
  totalSteps: number
  stepTitle: string
  stepDescription: string
  canProceed?: boolean
  isLastStep?: boolean
  isAnalyzing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canProceed: false,
  isLastStep: false,
  isAnalyzing: false,
})

const emit = defineEmits<{
  nextStep: []
  previousStep: []
  complete: []
}>()

// =========================
// Methods
// =========================

const getButtonText = () => {
  if (props.isAnalyzing && props.isLastStep) {
    return 'AI 分析中...'
  }
  return props.isLastStep ? '完成問卷' : '下一步 →'
}

const handleNext = () => {
  if (!props.canProceed || props.isAnalyzing) return

  if (props.isLastStep) {
    emit('complete')
  }
  else {
    emit('nextStep')
  }
}
</script>
