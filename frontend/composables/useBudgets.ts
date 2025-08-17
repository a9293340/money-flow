/**
 * 預算管理 Composable
 * 提供預算相關的 CRUD 操作和狀態管理
 */

// 預算相關類型定義
interface Budget {
  _id: string
  name: string
  description?: string
  amount: number
  currency: string
  categoryIds: string[]
  periodType: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  status: 'active' | 'inactive' | 'completed' | 'exceeded'
  currentSpent: number
  usagePercentage: number
  remainingAmount: number
  remainingDays: number
  warningLevel: 'safe' | 'warning' | 'danger' | 'exceeded'
  warningThreshold: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface BudgetSummary {
  totalBudgets: number
  activeBudgets: number
  warningBudgets: number
  exceededBudgets: number
  totalAmount: number
  totalSpent: number
}

interface BudgetStats {
  overview: {
    totalBudgets: number
    activeBudgets: number
    completedBudgets: number
    totalAmount: number
    totalSpent: number
    totalRemaining: number
    avgUsageRate: number
  }
  warnings: {
    exceededBudgets: number
    dangerBudgets: number
    warningBudgets: number
    safeBudgets: number
  }
  currentMonth: {
    budgetCount: number
    totalAmount: number
    totalSpent: number
    usageRate: number
  }
  topSpendingBudgets: Array<{
    id: string
    name: string
    amount: number
    spent: number
    usageRate: number
    warningLevel: string
  }>
  recentlyUpdated: Array<{
    id: string
    name: string
    amount: number
    spent: number
    usageRate: number
    updatedAt: string
  }>
}

interface BudgetListResponse {
  success: boolean
  data: {
    items: Budget[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
    summary: BudgetSummary
  }
}

interface BudgetDetailResponse {
  success: boolean
  data: {
    budget: Budget
    relatedRecords: any[]
    categories: any[]
    statistics: {
      dailyAverage: number
      weeklyAverage: number
      daysActive: number
      projectedEndDate: Date | null
      efficiency: string
    }
  }
}

interface CreateBudgetRequest {
  name: string
  description?: string
  amount: number
  currency?: string
  categoryIds?: string[]
  periodType?: 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate?: string
  warningThreshold?: number
  isActive?: boolean
}

export function useBudgets() {
  const budgets = ref<Budget[]>([])
  const currentBudget = ref<Budget | null>(null)
  const budgetStats = ref<BudgetStats | null>(null)
  const pagination = ref({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  })
  const summary = ref<BudgetSummary | null>(null)
  const isLoading = ref(false)
  const isSubmitting = ref(false)

  // 獲取預算列表
  const fetchBudgets = async (params: {
    page?: number
    limit?: number
    status?: string
    periodType?: string
    categoryId?: string
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) => {
    isLoading.value = true
    try {
      const query = new URLSearchParams()

      if (params.page) query.append('page', params.page.toString())
      if (params.limit) query.append('limit', params.limit.toString())
      if (params.status) query.append('status', params.status)
      if (params.periodType) query.append('periodType', params.periodType)
      if (params.categoryId) query.append('categoryId', params.categoryId)
      if (params.search) query.append('search', params.search)
      if (params.sortBy) query.append('sortBy', params.sortBy)
      if (params.sortOrder) query.append('sortOrder', params.sortOrder)

      const { data } = await $fetch(`/api/budgets?${query.toString()}`) as BudgetListResponse

      budgets.value = data.items
      pagination.value = data.pagination
      summary.value = data.summary

      return data
    }
    catch (error) {
      console.error('獲取預算列表失敗:', error)
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // 獲取單一預算詳情
  const fetchBudget = async (id: string) => {
    isLoading.value = true
    try {
      const response = await $fetch(`/api/budgets/${id}`) as BudgetDetailResponse
      currentBudget.value = response.data.budget
      return response.data
    }
    catch (error) {
      console.error('獲取預算詳情失敗:', error)
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // 創建預算
  const createBudget = async (budgetData: CreateBudgetRequest) => {
    isSubmitting.value = true
    try {
      const response = await $fetch('/api/budgets', {
        method: 'POST',
        body: budgetData,
      })

      // 重新獲取預算列表
      await fetchBudgets()

      return response
    }
    catch (error) {
      console.error('創建預算失敗:', error)
      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  // 更新預算
  const updateBudget = async (id: string, budgetData: Partial<CreateBudgetRequest>) => {
    isSubmitting.value = true
    try {
      const response = await $fetch(`/api/budgets/${id}`, {
        method: 'PUT',
        body: budgetData,
      })

      // 更新當前預算
      if (currentBudget.value && currentBudget.value._id === id) {
        currentBudget.value = response.data
      }

      // 重新獲取預算列表
      await fetchBudgets()

      return response
    }
    catch (error) {
      console.error('更新預算失敗:', error)
      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  // 刪除預算
  const deleteBudget = async (id: string) => {
    isSubmitting.value = true
    try {
      await $fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
      })

      // 從列表中移除
      budgets.value = budgets.value.filter(budget => budget._id !== id)

      // 如果刪除的是當前預算，清空
      if (currentBudget.value && currentBudget.value._id === id) {
        currentBudget.value = null
      }

      // 重新獲取預算列表以更新統計
      await fetchBudgets()

      return { success: true }
    }
    catch (error) {
      console.error('刪除預算失敗:', error)
      throw error
    }
    finally {
      isSubmitting.value = false
    }
  }

  // 重新計算預算統計
  const recalculateBudget = async (id: string) => {
    try {
      const response = await $fetch(`/api/budgets/${id}/recalculate`, {
        method: 'POST',
      })

      // 更新當前預算
      if (currentBudget.value && currentBudget.value._id === id) {
        currentBudget.value = response.data.budget
      }

      // 重新獲取預算列表
      await fetchBudgets()

      return response
    }
    catch (error) {
      console.error('重新計算預算統計失敗:', error)
      throw error
    }
  }

  // 獲取預算統計
  const fetchBudgetStats = async () => {
    isLoading.value = true
    try {
      const response = await $fetch('/api/budgets/stats') as { success: boolean, data: BudgetStats }
      budgetStats.value = response.data
      return response.data
    }
    catch (error) {
      console.error('獲取預算統計失敗:', error)
      throw error
    }
    finally {
      isLoading.value = false
    }
  }

  // 計算預算警告狀態的顏色類別
  const getWarningColor = (warningLevel: string) => {
    switch (warningLevel) {
      case 'safe':
        return 'text-green-600 bg-green-50'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50'
      case 'danger':
        return 'text-orange-600 bg-orange-50'
      case 'exceeded':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // 計算預算狀態的顏色類別
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      case 'completed':
        return 'text-blue-600 bg-blue-50'
      case 'exceeded':
        return 'text-red-600 bg-red-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  // 格式化預算期間類型
  const formatPeriodType = (periodType: string) => {
    switch (periodType) {
      case 'monthly':
        return '每月'
      case 'quarterly':
        return '每季'
      case 'yearly':
        return '每年'
      default:
        return periodType
    }
  }

  // 格式化預算狀態
  const formatStatus = (status: string) => {
    switch (status) {
      case 'active':
        return '進行中'
      case 'inactive':
        return '已暫停'
      case 'completed':
        return '已完成'
      case 'exceeded':
        return '已超支'
      default:
        return status
    }
  }

  // 格式化警告級別
  const formatWarningLevel = (warningLevel: string) => {
    switch (warningLevel) {
      case 'safe':
        return '安全'
      case 'warning':
        return '注意'
      case 'danger':
        return '警告'
      case 'exceeded':
        return '超支'
      default:
        return warningLevel
    }
  }

  return {
    // 狀態
    budgets: readonly(budgets),
    currentBudget: readonly(currentBudget),
    budgetStats: readonly(budgetStats),
    pagination: readonly(pagination),
    summary: readonly(summary),
    isLoading: readonly(isLoading),
    isSubmitting: readonly(isSubmitting),

    // 方法
    fetchBudgets,
    fetchBudget,
    createBudget,
    updateBudget,
    deleteBudget,
    recalculateBudget,
    fetchBudgetStats,

    // 工具方法
    getWarningColor,
    getStatusColor,
    formatPeriodType,
    formatStatus,
    formatWarningLevel,
  }
}

// 導出類型供其他組件使用
export type { Budget, BudgetStats, BudgetSummary, CreateBudgetRequest }
