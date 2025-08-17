<template>
  <div class="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
    <div class="p-6">
      <div class="flex items-start justify-between mb-4">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ budget.name }}
            </h3>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getStatusColor(budget.status)"
            >
              {{ formatStatus(budget.status) }}
            </span>
            <span
              class="px-2 py-1 text-xs font-medium rounded-full"
              :class="getWarningColor(budget.warningLevel)"
            >
              {{ formatWarningLevel(budget.warningLevel) }}
            </span>
          </div>

          <p
            v-if="budget.description"
            class="text-gray-600 text-sm mb-3"
          >
            {{ budget.description }}
          </p>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <p class="text-gray-500">
                預算金額
              </p>
              <p class="font-semibold">
                ${{ budget.amount.toLocaleString() }}
              </p>
            </div>
            <div>
              <p class="text-gray-500">
                已花費
              </p>
              <p class="font-semibold">
                ${{ budget.currentSpent.toLocaleString() }}
              </p>
            </div>
            <div>
              <p class="text-gray-500">
                使用率
              </p>
              <p class="font-semibold">
                {{ budget.usagePercentage }}%
              </p>
            </div>
            <div>
              <p class="text-gray-500">
                剩餘天數
              </p>
              <p class="font-semibold">
                {{ budget.remainingDays }} 天
              </p>
            </div>
          </div>

          <!-- Progress Bar -->
          <div>
            <div class="flex justify-between text-sm text-gray-600 mb-1">
              <span>進度</span>
              <span>{{ budget.usagePercentage }}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-300"
                :class="{
                  'bg-green-500': budget.usagePercentage <= 70,
                  'bg-yellow-500': budget.usagePercentage > 70 && budget.usagePercentage <= 90,
                  'bg-red-500': budget.usagePercentage > 90,
                }"
                :style="{ width: Math.min(budget.usagePercentage, 100) + '%' }"
              />
            </div>
          </div>
        </div>

        <div
          v-if="showActions"
          class="flex flex-col gap-2 ml-4"
        >
          <NuxtLink
            :to="`/budgets/${budget._id}`"
            class="inline-flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            查看詳情
          </NuxtLink>
          <button
            v-if="showDeleteAction"
            class="inline-flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
            @click="$emit('delete', budget._id)"
          >
            刪除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Budget {
  _id: string
  name: string
  description?: string
  amount: number
  currentSpent: number
  usagePercentage: number
  remainingDays: number
  status: 'active' | 'inactive' | 'completed' | 'exceeded'
  warningLevel: 'safe' | 'warning' | 'danger' | 'exceeded'
}

interface Props {
  budget: Budget
  showActions?: boolean
  showDeleteAction?: boolean
}

interface Emits {
  delete: [id: string]
}

withDefaults(defineProps<Props>(), {
  showActions: true,
  showDeleteAction: true,
})

defineEmits<Emits>()

// 使用預算相關的格式化函數
const { getWarningColor, getStatusColor, formatStatus, formatWarningLevel } = useBudgets()
</script>
