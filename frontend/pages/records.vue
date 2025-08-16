<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 頁面標題 -->
    <div class="bg-white shadow-sm border-b">
      <div class="max-w-4xl mx-auto px-4 py-6">
        <h1 class="text-2xl font-bold text-gray-900">
          記帳管理
        </h1>
        <p class="text-gray-600 mt-1">
          管理您的收支記錄
        </p>
      </div>
    </div>

    <div class="max-w-4xl mx-auto px-4 py-6">
      <div class="grid gap-6 lg:grid-cols-3">
        <!-- 新增記錄表單 -->
        <div class="lg:col-span-1">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <h2 class="text-lg font-semibold text-gray-900 mb-4">
              {{ isEditing ? '編輯記錄' : '新增記錄' }}
            </h2>

            <form
              class="space-y-4"
              @submit.prevent="handleSubmit"
            >
              <!-- 類型選擇 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">類型</label>
                <div class="flex space-x-3">
                  <button
                    type="button"
                    :class="[
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                      form.type === 'income'
                        ? 'bg-green-100 text-green-800 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200',
                    ]"
                    @click="form.type = 'income'"
                  >
                    💰 收入
                  </button>
                  <button
                    type="button"
                    :class="[
                      'flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors',
                      form.type === 'expense'
                        ? 'bg-red-100 text-red-800 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200',
                    ]"
                    @click="form.type = 'expense'"
                  >
                    💸 支出
                  </button>
                </div>
              </div>

              <!-- 金額 -->
              <div>
                <label
                  for="amount"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >金額</label>
                <div class="relative">
                  <span class="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    id="amount"
                    v-model="form.amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  >
                </div>
              </div>

              <!-- 分類 -->
              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >分類</label>
                <select
                  id="category"
                  v-model="form.categoryId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    請選擇分類
                  </option>
                  <option
                    v-for="category in filteredCategories"
                    :key="category._id"
                    :value="category._id"
                  >
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- 描述 -->
              <div>
                <label
                  for="description"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >描述</label>
                <input
                  id="description"
                  v-model="form.description"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="記錄描述（選填）"
                >
              </div>

              <!-- 日期 -->
              <div>
                <label
                  for="date"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >日期</label>
                <input
                  id="date"
                  v-model="form.date"
                  type="date"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
              </div>

              <!-- 標籤 -->
              <div>
                <label
                  for="tags"
                  class="block text-sm font-medium text-gray-700 mb-2"
                >標籤</label>
                <input
                  id="tags"
                  v-model="tagsInput"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="輸入標籤，用逗號分隔"
                >
                <div
                  v-if="form.tags.length > 0"
                  class="mt-2 flex flex-wrap gap-1"
                >
                  <span
                    v-for="tag in form.tags"
                    :key="tag"
                    class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {{ tag }}
                    <button
                      type="button"
                      class="ml-1 text-blue-600 hover:text-blue-800"
                      @click="removeTag(tag)"
                    >
                      ×
                    </button>
                  </span>
                </div>
              </div>

              <!-- 提交按鈕 -->
              <div class="space-y-2">
                <button
                  type="submit"
                  :disabled="isSubmitting"
                  class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <span v-if="isSubmitting">{{ isEditing ? '更新中...' : '新增中...' }}</span>
                  <span v-else>{{ isEditing ? '更新記錄' : '新增記錄' }}</span>
                </button>
                
                <!-- 取消編輯按鈕 -->
                <button
                  v-if="isEditing"
                  type="button"
                  @click="cancelEdit"
                  class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  取消編輯
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- 記錄列表 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <!-- 篩選區域 -->
            <div class="p-4 border-b border-gray-200">
              <div class="flex flex-wrap gap-4">
                <!-- 類型篩選 -->
                <select
                  v-model="filters.type"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">
                    全部類型
                  </option>
                  <option value="income">
                    收入
                  </option>
                  <option value="expense">
                    支出
                  </option>
                </select>

                <!-- 分類篩選 -->
                <select
                  v-model="filters.categoryId"
                  class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">
                    全部分類
                  </option>
                  <option
                    v-for="category in categories"
                    :key="category._id"
                    :value="category._id"
                  >
                    {{ category.icon }} {{ category.name }}
                  </option>
                </select>

                <!-- 搜尋 -->
                <input
                  v-model="filters.search"
                  type="text"
                  placeholder="搜尋描述..."
                  class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
              </div>
            </div>

            <!-- 記錄列表 -->
            <div class="p-4">
              <div
                v-if="isLoading"
                class="text-center py-8"
              >
                <div class="text-gray-500">
                  載入中...
                </div>
              </div>

              <div
                v-else-if="records.length === 0"
                class="text-center py-8"
              >
                <div class="text-gray-500">
                  目前沒有記錄
                </div>
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <div
                  v-for="record in records"
                  :key="record._id"
                  class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center space-x-4">
                    <div class="text-2xl">
                      {{ getCategoryIcon(record.categoryId) }}
                    </div>
                    <div>
                      <div class="font-medium text-gray-900">
                        {{ record.description || '無描述' }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ getCategoryName(record.categoryId) }} • {{ formatDate(record.date) }}
                      </div>
                      <div
                        v-if="record.tags && record.tags.length > 0"
                        class="mt-1 flex gap-1"
                      >
                        <span
                          v-for="tag in record.tags"
                          :key="tag"
                          class="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {{ tag }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="flex items-center space-x-3">
                    <div
                      :class="[
                        'font-semibold',
                        record.type === 'income' ? 'text-green-600' : 'text-red-600',
                      ]"
                    >
                      {{ record.type === 'income' ? '+' : '-' }}${{ record.amount.toFixed(2) }}
                    </div>

                    <button
                      class="text-blue-600 hover:text-blue-800 text-sm"
                      @click="editRecord(record)"
                    >
                      編輯
                    </button>

                    <button
                      class="text-red-600 hover:text-red-800 text-sm"
                      @click="deleteRecord(record._id)"
                    >
                      刪除
                    </button>
                  </div>
                </div>
              </div>

              <!-- 分頁 -->
              <div
                v-if="pagination.pages > 1"
                class="mt-6 flex justify-center"
              >
                <div class="flex space-x-2">
                  <button
                    v-for="page in pagination.pages"
                    :key="page"
                    :class="[
                      'px-3 py-1 rounded text-sm',
                      page === pagination.page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                    ]"
                    @click="changePage(page)"
                  >
                    {{ page }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計摘要 -->
    <div
      v-if="summary"
      class="max-w-4xl mx-auto px-4 pb-6"
    >
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">
          本月統計
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-3">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M7 11l5-5m0 0l5 5m-5-5v12"
                />
              </svg>
            </div>
            <div class="text-2xl font-bold text-green-700">
              ${{ summary.totalIncome.toFixed(2) }}
            </div>
            <div class="text-sm text-green-600 font-medium">
              總收入
            </div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl border border-red-200">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-red-500 rounded-xl mb-3">
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 13l-5 5m0 0l-5-5m5 5V6"
                />
              </svg>
            </div>
            <div class="text-2xl font-bold text-red-700">
              ${{ summary.totalExpense.toFixed(2) }}
            </div>
            <div class="text-sm text-red-600 font-medium">
              總支出
            </div>
          </div>
          <div class="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200">
            <div class="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-3">
              <svg
                class="w-6 h-6 text-white"
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
            <div class="text-2xl font-bold text-blue-700">
              ${{ summary.netAmount.toFixed(2) }}
            </div>
            <div class="text-sm text-blue-600 font-medium">
              淨額
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'

// 類型定義
interface Category {
  _id: string
  name: string
  icon: string
  type: 'income' | 'expense'
  scope: string
}

interface Record {
  _id: string
  amount: number
  type: 'income' | 'expense'
  description?: string
  date: string
  categoryId: string
  tags?: string[]
}

interface Summary {
  totalIncome: number
  totalExpense: number
  netAmount: number
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

// 頁面標題
definePageMeta({
  title: '記帳管理',
  requiresAuth: true,
})

// 響應式數據
const categories = ref<Category[]>([])
const records = ref<Record[]>([])
const summary = ref<Summary | null>(null)
const pagination = ref<Pagination>({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0,
})

const isLoading = ref(false)
const isSubmitting = ref(false)

// 編輯模式狀態
const editingRecord = ref<Record | null>(null)
const isEditing = computed(() => editingRecord.value !== null)

// 表單數據
const form = ref({
  type: 'expense' as 'income' | 'expense',
  amount: '',
  categoryId: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  tags: [] as string[],
})

const tagsInput = ref('')

// 篩選條件
const filters = ref({
  type: '',
  categoryId: '',
  search: '',
})

// 計算屬性
const filteredCategories = computed(() => {
  return categories.value.filter(category => category.type === form.value.type)
})

// 監聽器
watch(() => form.value.type, () => {
  form.value.categoryId = ''
})

watch(() => tagsInput.value, (newValue) => {
  if (newValue.includes(',')) {
    const tags = newValue.split(',').map(tag => tag.trim()).filter(Boolean)
    form.value.tags = [...new Set([...form.value.tags, ...tags])]
    tagsInput.value = ''
  }
})

watch([filters], () => {
  fetchRecords()
}, { deep: true })

// 方法
const fetchCategories = async () => {
  try {
    const { data } = await $fetch('/api/categories') as any
    categories.value = data.items
  }
  catch (error) {
    console.error('獲取分類失敗:', error)
  }
}

const fetchRecords = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
    })

    if (filters.value.type) params.append('type', filters.value.type)
    if (filters.value.categoryId) params.append('categoryId', filters.value.categoryId)
    if (filters.value.search) params.append('search', filters.value.search)

    const response = await $fetch(`/api/records?${params}`) as any
    records.value = response.data.items
    pagination.value = response.data.pagination
    summary.value = response.data.summary
  }
  catch (error) {
    console.error('獲取記錄失敗:', error)
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // 處理尚未加入的標籤輸入
    if (tagsInput.value.trim()) {
      const pendingTags = tagsInput.value.split(',').map(tag => tag.trim()).filter(Boolean)
      form.value.tags = [...new Set([...form.value.tags, ...pendingTags])]
    }

    const payload = {
      ...form.value,
      amount: Number.parseFloat(form.value.amount),
      date: new Date(form.value.date).toISOString(),
    }

    if (isEditing.value && editingRecord.value) {
      // 編輯模式 - 更新記錄
      await $fetch(`/api/records/${editingRecord.value._id}`, {
        method: 'PUT',
        body: payload,
      })
      alert('記錄更新成功！')
    } else {
      // 新增模式 - 創建記錄
      await $fetch('/api/records', {
        method: 'POST',
        body: payload,
      })
      alert('記錄新增成功！')
    }

    // 重置表單
    resetForm()

    // 重新載入記錄
    await fetchRecords()
  }
  catch (error: any) {
    console.error(isEditing.value ? '更新記錄失敗:' : '新增記錄失敗:', error)
    alert((isEditing.value ? '更新記錄失敗：' : '新增記錄失敗：') + (error.data?.message || error.message))
  }
  finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    type: 'expense',
    amount: '',
    categoryId: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    tags: [],
  }
  tagsInput.value = ''
  editingRecord.value = null
}

const removeTag = (tagToRemove: string) => {
  form.value.tags = form.value.tags.filter(tag => tag !== tagToRemove)
}

const editRecord = (record: Record) => {
  editingRecord.value = record
  
  // 填入表單數據
  form.value = {
    type: record.type,
    amount: record.amount.toString(),
    categoryId: record.categoryId,
    description: record.description || '',
    date: new Date(record.date).toISOString().split('T')[0],
    tags: record.tags ? [...record.tags] : [],
  }
  
  tagsInput.value = ''
  
  // 滾動到表單頂部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  resetForm()
}

const deleteRecord = async (recordId: string) => {
  if (!confirm('確定要刪除這筆記錄嗎？')) return

  try {
    await $fetch(`/api/records/${recordId}`, { method: 'DELETE' })
    await fetchRecords()
    alert('記錄刪除成功！')
  }
  catch (error: any) {
    console.error('刪除記錄失敗:', error)
    alert('刪除記錄失敗：' + (error.data?.message || error.message))
  }
}

const changePage = (page: number) => {
  pagination.value.page = page
  fetchRecords()
}

const getCategoryIcon = (categoryId: string) => {
  const category = categories.value.find(c => c._id === categoryId)
  return category?.icon || '📝'
}

const getCategoryName = (categoryId: string) => {
  const category = categories.value.find(c => c._id === categoryId)
  return category?.name || '未知分類'
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 生命週期
onMounted(async () => {
  await fetchCategories()
  await fetchRecords()
})
</script>
