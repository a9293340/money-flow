<template>
  <div class="space-y-2">
    <!-- Labels -->
    <div
      v-if="showLabels"
      class="flex justify-between text-sm"
    >
      <span class="text-gray-600">{{ label || '進度' }}</span>
      <span
        class="font-medium"
        :class="getPercentageColor()"
      >{{ percentage }}%</span>
    </div>

    <!-- Progress Bar -->
    <div
      class="w-full bg-gray-200 rounded-full"
      :class="heightClass"
    >
      <div
        class="rounded-full transition-all duration-300"
        :class="[getProgressColor(), heightClass]"
        :style="{ width: Math.min(percentage, 100) + '%' }"
      />
    </div>

    <!-- Amount Details -->
    <div
      v-if="showAmounts"
      class="flex justify-between text-xs text-gray-500"
    >
      <span>${{ spent.toLocaleString() }} 已花費</span>
      <span>${{ total.toLocaleString() }} 總預算</span>
    </div>

    <!-- Warning Message -->
    <div
      v-if="showWarning && percentage > warningThreshold"
      class="flex items-center text-xs"
    >
      <svg
        class="w-3 h-3 mr-1"
        :class="getWarningIconColor()"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fill-rule="evenodd"
          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
      <span :class="getWarningTextColor()">{{ getWarningMessage() }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  spent: number
  total: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  showAmounts?: boolean
  showWarning?: boolean
  warningThreshold?: number
  theme?: 'default' | 'success' | 'warning' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showLabels: true,
  showAmounts: false,
  showWarning: true,
  warningThreshold: 80,
  theme: 'default',
})

// 計算百分比
const percentage = computed(() => {
  if (props.total <= 0) return 0
  return Math.round((props.spent / props.total) * 100)
})

// 高度類別
const heightClass = computed(() => {
  switch (props.size) {
    case 'sm': return 'h-1'
    case 'lg': return 'h-4'
    default: return 'h-2'
  }
})

// 進度條顏色
const getProgressColor = () => {
  if (props.theme !== 'default') {
    switch (props.theme) {
      case 'success': return 'bg-green-500'
      case 'warning': return 'bg-yellow-500'
      case 'danger': return 'bg-red-500'
    }
  }

  // 根據百分比自動選擇顏色
  if (percentage.value <= 70) return 'bg-green-500'
  if (percentage.value <= 90) return 'bg-yellow-500'
  return 'bg-red-500'
}

// 百分比文字顏色
const getPercentageColor = () => {
  if (percentage.value <= 70) return 'text-green-600'
  if (percentage.value <= 90) return 'text-yellow-600'
  return 'text-red-600'
}

// 警告圖示顏色
const getWarningIconColor = () => {
  if (percentage.value <= 90) return 'text-yellow-500'
  return 'text-red-500'
}

// 警告文字顏色
const getWarningTextColor = () => {
  if (percentage.value <= 90) return 'text-yellow-600'
  return 'text-red-600'
}

// 警告訊息
const getWarningMessage = () => {
  if (percentage.value >= 100) return '預算已超支'
  if (percentage.value >= 95) return '即將超支，請注意控制支出'
  if (percentage.value >= props.warningThreshold) return '已達到警告閾值'
  return ''
}
</script>
