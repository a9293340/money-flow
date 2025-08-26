<template>
  <div class="space-y-6">
    <!-- 目標說明 -->
    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div class="flex items-start">
        <div class="text-blue-400 mr-3 mt-1">
          💡
        </div>
        <div>
          <h4 class="text-blue-900 font-medium mb-1">
            設定您的財務目標
          </h4>
          <p class="text-blue-800 text-sm">
            明確的目標有助於制定更精確的理財策略。您可以設定多個目標，我們會幫您規劃優先順序。
          </p>
        </div>
      </div>
    </div>

    <!-- 快速目標選擇 -->
    <div>
      <h4 class="text-sm font-medium text-gray-700 mb-3">
        常見財務目標 (可多選)
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label
          v-for="quickGoal in quickGoals"
          :key="quickGoal.id"
          class="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          :class="{ 'bg-blue-50 border-blue-300': isQuickGoalSelected(quickGoal.id) }"
        >
          <input
            type="checkbox"
            :checked="isQuickGoalSelected(quickGoal.id)"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            @change="toggleQuickGoal(quickGoal)"
          >
          <div class="ml-3 flex-1">
            <div class="text-sm font-medium text-gray-900">{{ quickGoal.name }}</div>
            <div class="text-xs text-gray-500">{{ quickGoal.description }}</div>
          </div>
        </label>
      </div>
    </div>

    <!-- 已選擇的目標列表 -->
    <div
      v-if="selectedGoals.length > 0"
      class="space-y-4"
    >
      <h4 class="text-sm font-medium text-gray-700">
        您的財務目標
      </h4>

      <div class="space-y-4">
        <div
          v-for="goal in selectedGoals"
          :key="goal.id"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-center justify-between mb-3">
            <h5 class="font-medium text-gray-900">
              {{ goal.name }}
            </h5>
            <button
              class="text-red-500 hover:text-red-700 text-sm"
              type="button"
              @click="removeGoal(goal.id)"
            >
              移除
            </button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- 目標金額 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                目標金額 (NT$)
              </label>
              <input
                v-model.number="goal.targetAmount"
                type="number"
                min="0"
                step="1000"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                :placeholder="getAmountPlaceholder(goal.type)"
              >
            </div>

            <!-- 達成時間 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                預計達成時間
              </label>
              <select
                v-model="goal.timeframe"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">
                  請選擇
                </option>
                <option value="6">
                  6 個月內
                </option>
                <option value="12">
                  1 年內
                </option>
                <option value="24">
                  2 年內
                </option>
                <option value="36">
                  3 年內
                </option>
                <option value="60">
                  5 年內
                </option>
                <option value="120">
                  10 年內
                </option>
                <option value="240">
                  長期 (20年)
                </option>
              </select>
            </div>

            <!-- 重要程度 -->
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">
                重要程度
              </label>
              <select
                v-model="goal.priority"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">
                  請選擇
                </option>
                <option value="high">
                  高 - 必須優先達成
                </option>
                <option value="medium">
                  中 - 重要但可調整
                </option>
                <option value="low">
                  低 - 有餘力再考慮
                </option>
              </select>
            </div>
          </div>

          <!-- 目前進度 -->
          <div class="mt-3">
            <label class="block text-xs font-medium text-gray-700 mb-1">
              目前已存金額 (NT$) - 選填
            </label>
            <input
              v-model.number="goal.currentAmount"
              type="number"
              min="0"
              class="w-full sm:w-1/2 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="已存金額（可不填）"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- 自訂目標 -->
    <div class="border-t border-gray-200 pt-6">
      <button
        type="button"
        class="flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="addCustomGoal"
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
            d="M12 4v16m8-8H4"
          />
        </svg>
        新增自訂目標
      </button>
    </div>

    <!-- 自訂目標表單 -->
    <div
      v-if="showCustomForm"
      class="bg-gray-50 border border-gray-200 rounded-lg p-4"
    >
      <h5 class="font-medium text-gray-900 mb-3">
        自訂財務目標
      </h5>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">目標名稱</label>
          <input
            v-model="customGoal.name"
            type="text"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="例如：換車基金、結婚基金"
            maxlength="50"
          >
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">目標金額 (NT$)</label>
            <input
              v-model.number="customGoal.targetAmount"
              type="number"
              min="0"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="100000"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">預計達成時間</label>
            <select
              v-model="customGoal.timeframe"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">
                請選擇
              </option>
              <option value="6">
                6 個月內
              </option>
              <option value="12">
                1 年內
              </option>
              <option value="24">
                2 年內
              </option>
              <option value="36">
                3 年內
              </option>
              <option value="60">
                5 年內
              </option>
              <option value="120">
                10 年內
              </option>
            </select>
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            @click="cancelCustomGoal"
          >
            取消
          </button>
          <button
            type="button"
            :disabled="!customGoal.name || !customGoal.targetAmount"
            class="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-300"
            @click="saveCustomGoal"
          >
            新增目標
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FinancialGoal } from '~/lib/models/financial-profile'

// =========================
// Props & Emits
// =========================

interface Props {
  modelValue: FinancialGoal[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [goals: FinancialGoal[]]
}>()

// =========================
// Local State
// =========================

const showCustomForm = ref(false)

const quickGoals = [
  {
    id: 'emergency_fund',
    name: '緊急預備金',
    description: '6個月生活費用',
    type: 'emergency_fund' as const,
    suggestedAmount: 300000,
  },
  {
    id: 'house_purchase',
    name: '購屋基金',
    description: '自住或投資房產',
    type: 'house_purchase' as const,
    suggestedAmount: 2000000,
  },
  {
    id: 'retirement',
    name: '退休規劃',
    description: '退休後生活保障',
    type: 'retirement' as const,
    suggestedAmount: 5000000,
  },
  {
    id: 'education',
    name: '教育基金',
    description: '進修或子女教育',
    type: 'education' as const,
    suggestedAmount: 500000,
  },
  {
    id: 'travel',
    name: '旅遊基金',
    description: '年度旅遊或特殊行程',
    type: 'travel' as const,
    suggestedAmount: 100000,
  },
  {
    id: 'investment',
    name: '投資本金',
    description: '股票、基金等投資',
    type: 'other' as const,
    suggestedAmount: 200000,
  },
]

const customGoal = ref<Partial<FinancialGoal>>({
  name: '',
  targetAmount: undefined,
  timeframe: undefined,
  priority: 'medium',
  type: 'other',
})

// =========================
// Computed
// =========================

const selectedGoals = computed(() => props.modelValue || [])

// =========================
// Methods
// =========================

const generateGoalId = () => {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const isQuickGoalSelected = (quickGoalId: string) => {
  return selectedGoals.value.some(goal => goal.id === quickGoalId)
}

const toggleQuickGoal = (quickGoalData: typeof quickGoals[0]) => {
  const existing = selectedGoals.value.find(goal => goal.id === quickGoalData.id)

  if (existing) {
    // 移除目標
    const updatedGoals = selectedGoals.value.filter(goal => goal.id !== quickGoalData.id)
    emit('update:modelValue', updatedGoals)
  }
  else {
    // 新增目標
    const newGoal: FinancialGoal = {
      id: quickGoalData.id,
      name: quickGoalData.name,
      type: quickGoalData.type,
      targetAmount: quickGoalData.suggestedAmount,
      timeframe: quickGoalData.type === 'emergency_fund' ? 12 : 60,
      priority: quickGoalData.type === 'emergency_fund' ? 'high' : 'medium',
      currentAmount: 0,
    }

    const updatedGoals = [...selectedGoals.value, newGoal]
    emit('update:modelValue', updatedGoals)
  }
}

const removeGoal = (goalId: string) => {
  const updatedGoals = selectedGoals.value.filter(goal => goal.id !== goalId)
  emit('update:modelValue', updatedGoals)
}

const getAmountPlaceholder = (type: string) => {
  const placeholders: Record<string, string> = {
    emergency_fund: '300000',
    house_purchase: '2000000',
    retirement: '5000000',
    education: '500000',
    travel: '100000',
    other: '100000',
  }
  return placeholders[type] || '100000'
}

const addCustomGoal = () => {
  showCustomForm.value = true
}

const cancelCustomGoal = () => {
  showCustomForm.value = false
  customGoal.value = {
    name: '',
    targetAmount: undefined,
    timeframe: undefined,
    priority: 'medium',
    type: 'other',
  }
}

const saveCustomGoal = () => {
  if (!customGoal.value.name || !customGoal.value.targetAmount) return

  const newGoal: FinancialGoal = {
    id: generateGoalId(),
    name: customGoal.value.name,
    type: customGoal.value.type || 'other',
    targetAmount: customGoal.value.targetAmount,
    timeframe: customGoal.value.timeframe || 12,
    priority: customGoal.value.priority || 'medium',
    currentAmount: 0,
  }

  const updatedGoals = [...selectedGoals.value, newGoal]
  emit('update:modelValue', updatedGoals)

  cancelCustomGoal()
}
</script>
