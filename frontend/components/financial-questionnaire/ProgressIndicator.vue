<template>
  <div class="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <!-- 標題 -->
    <div class="mb-6">
      <h3 class="text-lg font-semibold text-gray-900">
        步驟 {{ currentStep }} / {{ totalSteps }}
      </h3>
      <p class="text-sm text-gray-600 mt-1">
        完成度: {{ Math.round(completionPercentage) }}%
      </p>
    </div>

    <!-- 進度條 -->
    <div class="mb-6">
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-blue-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${completionPercentage}%` }"
        />
      </div>
    </div>

    <!-- 步驟指示器 -->
    <div class="flex items-center justify-between">
      <div
        v-for="step in totalSteps"
        :key="step"
        class="flex flex-col items-center"
      >
        <!-- 步驟圓圈 -->
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
          :class="{
            'bg-blue-600 text-white': step <= currentStep,
            'bg-gray-200 text-gray-500': step > currentStep,
          }"
        >
          {{ step }}
        </div>

        <!-- 步驟標籤 -->
        <div class="mt-2 text-xs text-center hidden sm:block">
          <span
            :class="{
              'text-blue-600 font-medium': step === currentStep,
              'text-gray-500': step !== currentStep,
            }"
          >
            {{ getStepLabel(step) }}
          </span>
        </div>
      </div>
    </div>

    <!-- 驗證錯誤 -->
    <div
      v-if="validationErrors?.length"
      class="mt-4"
    >
      <div class="bg-red-50 border border-red-200 rounded-md p-3">
        <div class="flex">
          <div class="text-red-400 mr-2">
            ⚠️
          </div>
          <div>
            <h4 class="text-sm font-medium text-red-800">
              請修正以下問題：
            </h4>
            <ul class="mt-1 text-sm text-red-700 list-disc list-inside">
              <li
                v-for="error in validationErrors"
                :key="error"
              >
                {{ error }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// =========================
// Props & Emits
// =========================

interface Props {
  currentStep: number
  totalSteps?: number
  completionPercentage?: number
  validationErrors?: string[]
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = withDefaults(defineProps<Props>(), {
  totalSteps: 4,
  completionPercentage: 0,
  validationErrors: () => [],
})

// =========================
// Computed
// =========================

const getStepLabel = computed(() => {
  return (step: number) => {
    const labels = ['基本資料', '風險評估', '財務目標', '偏好設定']
    return labels[step - 1] || `步驟 ${step}`
  }
})
</script>
