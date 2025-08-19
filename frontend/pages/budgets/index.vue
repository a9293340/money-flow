<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">
              預算管理
            </h1>
            <p class="text-gray-600 mt-1">
              管理您的預算規劃與支出追蹤
            </p>
          </div>
          <NuxtLink
            to="/budgets/new"
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
            新增預算
          </NuxtLink>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- 預算概覽統計 -->
      <div
        v-if="summary"
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      >
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg
                class="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                總預算數量
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ summary.totalBudgets }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg
                class="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                進行中預算
              </p>
              <p class="text-2xl font-bold text-gray-900">
                {{ summary.activeBudgets }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg
                class="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                預算總額
              </p>
              <p class="text-2xl font-bold text-gray-900">
                ${{ summary.totalAmount.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center">
            <div class="p-2 bg-red-100 rounded-lg">
              <svg
                class="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">
                已花費金額
              </p>
              <p class="text-2xl font-bold text-gray-900">
                ${{ summary.totalSpent.toLocaleString() }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 篩選器 -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div class="flex flex-wrap gap-4">
          <!-- 狀態篩選 -->
          <select
            v-model="filters.status"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="handleFilterChange"
          >
            <option value="">
              所有狀態
            </option>
            <option value="active">
              進行中
            </option>
            <option value="inactive">
              已暫停
            </option>
            <option value="completed">
              已完成
            </option>
            <option value="exceeded">
              已超支
            </option>
          </select>

          <!-- 期間類型篩選 -->
          <select
            v-model="filters.periodType"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="handleFilterChange"
          >
            <option value="">
              所有期間
            </option>
            <option value="monthly">
              每月
            </option>
            <option value="quarterly">
              每季
            </option>
            <option value="yearly">
              每年
            </option>
          </select>

          <!-- 預算類型篩選 -->
          <select
            v-model="filters.isTemplate"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="handleFilterChange"
          >
            <option value="">
              所有類型
            </option>
            <option value="false">
              實際預算
            </option>
            <option value="true">
              重複模板
            </option>
          </select>

          <!-- 搜尋 -->
          <input
            v-model="filters.search"
            type="text"
            placeholder="搜尋預算名稱..."
            class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm"
            @input="debounceSearch"
          >

          <!-- 排序 -->
          <select
            v-model="filters.sortBy"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="handleFilterChange"
          >
            <option value="updatedAt">
              最後更新
            </option>
            <option value="createdAt">
              建立時間
            </option>
            <option value="startDate">
              開始日期
            </option>
            <option value="endDate">
              結束日期
            </option>
            <option value="amount">
              預算金額
            </option>
            <option value="usagePercentage">
              使用率
            </option>
          </select>

          <select
            v-model="filters.sortOrder"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
            @change="handleFilterChange"
          >
            <option value="desc">
              降序
            </option>
            <option value="asc">
              升序
            </option>
          </select>
        </div>
      </div>

      <!-- 載入狀態 -->
      <div
        v-if="isLoading"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p class="text-gray-600 mt-2">
          載入中...
        </p>
      </div>

      <!-- 預算列表 -->
      <div
        v-else-if="budgets.length > 0"
        class="space-y-4"
      >
        <BudgetCard
          v-for="budget in budgets"
          :key="budget._id"
          :budget="budget"
          @delete="handleDeleteBudget"
          @toggle-template="handleToggleTemplate"
          @generate-current="handleGenerateCurrent"
        />
      </div>

      <!-- 空狀態 -->
      <div
        v-else
        class="text-center py-12"
      >
        <svg
          class="w-16 h-16 text-gray-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          還沒有預算
        </h3>
        <p class="text-gray-600 mb-6">
          開始建立您的第一個預算來追蹤支出
        </p>
        <NuxtLink
          to="/budgets/new"
          class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
          新增預算
        </NuxtLink>
      </div>

      <!-- 分頁 -->
      <div
        v-if="pagination.pages > 1"
        class="flex justify-center mt-8"
      >
        <nav class="flex space-x-2">
          <button
            :disabled="pagination.page <= 1"
            class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(pagination.page - 1)"
          >
            上一頁
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[
              'px-3 py-2 text-sm border rounded-md',
              page === pagination.page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50',
            ]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>

          <button
            :disabled="pagination.page >= pagination.pages"
            class="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="changePage(pagination.page + 1)"
          >
            下一頁
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: '預算管理',
  auth: true,
})

const {
  budgets,
  pagination,
  summary,
  isLoading,
  fetchBudgets,
  deleteBudget,
  toggleBudgetTemplate,
  generateCurrentBudget,
} = useBudgets()

// 篩選條件
const filters = ref({
  status: '',
  periodType: '',
  search: '',
  sortBy: 'updatedAt',
  sortOrder: 'desc' as 'asc' | 'desc',
  isTemplate: '', // 新增模板類型篩選
})

// 搜尋防抖
let searchTimeout: NodeJS.Timeout
const debounceSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    handleFilterChange()
  }, 500)
}

// 處理篩選變更
const handleFilterChange = () => {
  // pagination.value.page = 1
  loadBudgets({ page: 1 })
}

// 載入預算列表
const loadBudgets = async (params?: { page?: number }) => {
  try {
    await fetchBudgets({
      page: params?.page || pagination.value.page,
      limit: pagination.value.limit,
      status: filters.value.status || undefined,
      periodType: filters.value.periodType || undefined,
      search: filters.value.search || undefined,
      sortBy: filters.value.sortBy,
      sortOrder: filters.value.sortOrder,
      isTemplate: filters.value.isTemplate === '' ? undefined : filters.value.isTemplate === 'true',
    })
  }
  catch (error) {
    console.error('載入預算列表失敗:', error)
  }
}

// 變更頁面
const changePage = (page: number) => {
  loadBudgets({ page })
}

// 計算可見的頁碼
const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const range = 2

  let start = Math.max(1, current - range)
  let end = Math.min(total, current + range)

  // 確保顯示至少5頁（如果有的話）
  if (end - start < 4) {
    if (start === 1) {
      end = Math.min(total, start + 4)
    }
    else if (end === total) {
      start = Math.max(1, end - 4)
    }
  }

  const pages = []
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

// 刪除預算
const handleDeleteBudget = async (id: string) => {
  const budget = budgets.value.find(b => b._id === id)
  const budgetName = budget?.name || '預算'

  if (!confirm(`確定要刪除預算「${budgetName}」嗎？此操作無法復原。`)) {
    return
  }

  try {
    await deleteBudget(id)
    // 重新載入列表
    await loadBudgets()
  }
  catch (error) {
    console.error('刪除預算失敗:', error)
    alert('刪除失敗，請稍後重試')
  }
}

// 切換模板狀態
const handleToggleTemplate = async (id: string) => {
  const budget = budgets.value.find(b => b._id === id)
  if (!budget) return

  const isCurrentlyTemplate = budget.isTemplate
  let templateFrequency: 'monthly' | 'quarterly' | 'yearly' | undefined

  if (!isCurrentlyTemplate) {
    // 設為模板時，需要選擇頻率
    const frequency = prompt('請選擇重複頻率：\n1. monthly (每月)\n2. quarterly (每季)\n3. yearly (每年)', 'monthly')

    if (!frequency || !['monthly', 'quarterly', 'yearly'].includes(frequency)) {
      alert('無效的頻率，請輸入 monthly、quarterly 或 yearly')
      return
    }

    templateFrequency = frequency as 'monthly' | 'quarterly' | 'yearly'

    if (!confirm(`確定要將預算「${budget.name}」設為${frequency === 'monthly' ? '每月' : frequency === 'quarterly' ? '每季' : '每年'}重複模板嗎？`)) {
      return
    }
  }
  else {
    if (!confirm(`確定要取消預算「${budget.name}」的重複模板設定嗎？`)) {
      return
    }
  }

  try {
    await toggleBudgetTemplate(id, !isCurrentlyTemplate, templateFrequency)
    // 重新載入列表
    await loadBudgets()
    alert('模板設定已更新')
  }
  catch (error: any) {
    console.error('切換模板狀態失敗:', error)
    alert(error.message || '操作失敗，請稍後重試')
  }
}

// 生成當前期間預算
const handleGenerateCurrent = async (templateId: string) => {
  const template = budgets.value.find(b => b._id === templateId)
  if (!template || !template.isTemplate) return

  if (!confirm(`確定要根據模板「${template.name}」生成當前期間的預算嗎？`)) {
    return
  }

  try {
    await generateCurrentBudget(templateId)
    // 重新載入列表
    await loadBudgets()
    alert('當前期間預算已生成')
  }
  catch (error: any) {
    console.error('生成當前期間預算失敗:', error)
    alert(error.message || '生成失敗，請稍後重試')
  }
}

// 頁面載入時獲取資料
onMounted(() => {
  loadBudgets()
})
</script>
