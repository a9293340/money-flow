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
        :disabled="!canProceed"
        :class="{
          'bg-blue-600 hover:bg-blue-700 text-white': canProceed,
          'bg-gray-300 text-gray-500 cursor-not-allowed': !canProceed,
        }"
        class="px-6 py-2 rounded-md font-medium transition-colors"
        type="button"
        @click="handleNext"
      >
        {{ isLastStep ? '完成問卷' : '下一步 →' }}
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
}

const props = withDefaults(defineProps<Props>(), {
  canProceed: false,
  isLastStep: false,
})

const emit = defineEmits<{
  nextStep: []
  previousStep: []
  complete: []
}>()

// =========================
// Methods
// =========================

const handleNext = () => {
  if (!props.canProceed) return

  if (props.isLastStep) {
    emit('complete')
  }
  else {
    emit('nextStep')
  }
}
</script>
