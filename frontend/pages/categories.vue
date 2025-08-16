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
              分類管理
            </h1>
            <p class="text-gray-600 mt-1">
              管理您的收支分類
            </p>
          </div>
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            @click="showCreateModal = true"
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
            新增分類
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-6">
      <!-- 篩選器 -->
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-6">
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

          <!-- 範圍篩選 -->
          <select
            v-model="filters.scope"
            class="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">
              全部範圍
            </option>
            <option value="system">
              系統分類
            </option>
            <option value="personal">
              個人分類
            </option>
          </select>

          <!-- 搜尋 -->
          <input
            v-model="filters.search"
            type="text"
            placeholder="搜尋分類名稱..."
            class="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
        </div>
      </div>

      <!-- 分類列表 -->
      <div class="bg-white rounded-lg shadow-sm border">
        <!-- 標題列 -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">
              分類列表
              <span class="text-sm text-gray-500">({{ summary.totalCount }} 個分類)</span>
            </h3>

            <!-- 統計資訊 -->
            <div class="flex items-center space-x-4 text-sm text-gray-500">
              <span>系統: {{ summary.systemCount }}</span>
              <span>個人: {{ summary.personalCount }}</span>
            </div>
          </div>
        </div>

        <!-- 載入狀態 -->
        <div
          v-if="isLoading"
          class="p-8 text-center"
        >
          <div class="text-gray-500">
            載入中...
          </div>
        </div>

        <!-- 空狀態 -->
        <div
          v-else-if="categories.length === 0"
          class="p-8 text-center"
        >
          <div class="text-gray-500">
            {{ filters.type || filters.scope || filters.search ? '沒有符合條件的分類' : '目前沒有分類' }}
          </div>
          <button
            v-if="!filters.type && !filters.scope && !filters.search"
            class="mt-4 text-blue-600 hover:text-blue-800"
            @click="showCreateModal = true"
          >
            立即建立第一個分類
          </button>
        </div>

        <!-- 分類卡片列表 -->
        <div
          v-else
          class="p-6"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="category in categories"
              :key="category._id"
              class="relative p-4 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors group"
              :style="{ borderColor: category.color + '40' }"
            >
              <!-- 分類圖示和資訊 -->
              <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-3">
                  <div
                    class="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    :style="{ backgroundColor: category.color + '20' }"
                  >
                    {{ category.icon }}
                  </div>
                  <div>
                    <h4 class="font-medium text-gray-900">
                      {{ category.name }}
                    </h4>
                    <div class="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full',
                          category.type === 'income'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700',
                        ]"
                      >
                        {{ category.type === 'income' ? '收入' : '支出' }}
                      </span>
                      <span
                        :class="[
                          'px-2 py-1 rounded-full',
                          category.scope === 'system'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700',
                        ]"
                      >
                        {{ category.scope === 'system' ? '系統' : '個人' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- 操作按鈕 -->
                <div
                  v-if="category.scope === 'personal'"
                  class="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-1"
                >
                  <button
                    class="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="編輯分類"
                    @click="editCategory(category)"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    class="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="刪除分類"
                    @click="deleteCategory(category)"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 分類描述 -->
              <p
                v-if="category.description"
                class="text-sm text-gray-600 mb-3"
              >
                {{ category.description }}
              </p>

              <!-- 使用統計 -->
              <div class="flex items-center justify-between text-xs text-gray-500">
                <span>使用次數: {{ category.usageCount || 0 }}</span>
                <span v-if="category.lastUsedAt">
                  最後使用: {{ formatDate(category.lastUsedAt) }}
                </span>
              </div>

              <!-- 系統分類標識 -->
              <div
                v-if="category.scope === 'system'"
                class="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                title="系統預設分類"
              >
                <svg
                  class="w-3 h-3 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 新增/編輯分類 Modal -->
    <div
      v-if="showCreateModal || showEditModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <!-- Modal 標題 -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">
            {{ isEditing ? '編輯分類' : '新增分類' }}
          </h3>
        </div>

        <!-- Modal 內容 -->
        <div class="px-6 py-4">
          <form
            class="space-y-4"
            @submit.prevent="handleSubmit"
          >
            <!-- 分類名稱 -->
            <div>
              <label
                for="categoryName"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                分類名稱 <span class="text-red-500">*</span>
              </label>
              <input
                id="categoryName"
                v-model="form.name"
                type="text"
                required
                maxlength="50"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入分類名稱"
              >
            </div>

            <!-- 分類類型 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                分類類型 <span class="text-red-500">*</span>
              </label>
              <div class="flex space-x-4">
                <label class="flex items-center">
                  <input
                    v-model="form.type"
                    type="radio"
                    value="income"
                    required
                    class="mr-2 text-blue-600"
                  >
                  <span class="text-green-600">💰 收入</span>
                </label>
                <label class="flex items-center">
                  <input
                    v-model="form.type"
                    type="radio"
                    value="expense"
                    required
                    class="mr-2 text-blue-600"
                  >
                  <span class="text-red-600">💸 支出</span>
                </label>
              </div>
            </div>

            <!-- 分類圖示 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                分類圖示 <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-8 gap-2 mb-3">
                <button
                  v-for="icon in availableIcons"
                  :key="icon"
                  type="button"
                  :class="[
                    'w-10 h-10 rounded-md text-xl transition-colors',
                    form.icon === icon
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-100 hover:bg-gray-200 border-2 border-transparent',
                  ]"
                  @click="form.icon = icon"
                >
                  {{ icon }}
                </button>
              </div>
              <input
                v-model="form.icon"
                type="text"
                required
                maxlength="4"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="或手動輸入 emoji"
              >
            </div>

            <!-- 分類顏色 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                分類顏色 <span class="text-red-500">*</span>
              </label>
              <div class="grid grid-cols-8 gap-2 mb-3">
                <button
                  v-for="color in availableColors"
                  :key="color"
                  type="button"
                  :class="[
                    'w-8 h-8 rounded-full border-2 transition-all',
                    form.color === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:border-gray-500',
                  ]"
                  :style="{ backgroundColor: color }"
                  @click="form.color = color"
                />
              </div>
              <input
                v-model="form.color"
                type="color"
                required
                class="w-full h-10 border border-gray-300 rounded-md"
              >
            </div>

            <!-- 分類描述 -->
            <div>
              <label
                for="categoryDescription"
                class="block text-sm font-medium text-gray-700 mb-2"
              >
                分類描述
              </label>
              <textarea
                id="categoryDescription"
                v-model="form.description"
                rows="3"
                maxlength="200"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="請輸入分類描述（選填）"
              />
              <div class="text-xs text-gray-500 mt-1">
                {{ form.description?.length || 0 }}/200
              </div>
            </div>
          </form>
        </div>

        <!-- Modal 按鈕 -->
        <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            @click="closeModal"
          >
            取消
          </button>
          <button
            :disabled="isSubmitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            @click="handleSubmit"
          >
            <span v-if="isSubmitting">{{ isEditing ? '更新中...' : '建立中...' }}</span>
            <span v-else>{{ isEditing ? '更新分類' : '建立分類' }}</span>
          </button>
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
  color: string
  type: 'income' | 'expense'
  scope: 'system' | 'personal'
  description?: string
  usageCount?: number
  lastUsedAt?: string
  createdAt: string
  updatedAt: string
}

interface Summary {
  totalCount: number
  systemCount: number
  personalCount: number
}

// 頁面配置
definePageMeta({
  title: '分類管理',
  requiresAuth: true,
})

// 響應式數據
const categories = ref<Category[]>([])
const summary = ref<Summary>({
  totalCount: 0,
  systemCount: 0,
  personalCount: 0,
})

const isLoading = ref(false)
const isSubmitting = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const editingCategory = ref<Category | null>(null)

// 篩選條件
const filters = ref({
  type: '',
  scope: '',
  search: '',
})

// 表單數據
const form = ref({
  name: '',
  type: '' as 'income' | 'expense' | '',
  icon: '',
  color: '#3B82F6',
  description: '',
})

// 可用圖示
const availableIcons = [
  // 收入類圖示
  '💰', '💵', '💴', '💶', '💷', '💸', '💳', '🏦',
  '📈', '📊', '💼', '🎯', '🏆', '🎁', '💎', '⭐',
  // 支出類圖示
  '🍽️', '🍕', '☕', '🍔', '🍜', '🍱', '🥗', '🍰',
  '🚗', '🚌', '🚇', '✈️', '🚕', '⛽', '🚲', '🛵',
  '🏠', '💡', '🌊', '📱', '💻', '🎮', '📚', '✏️',
  '👕', '👔', '👗', '👟', '💄', '💊', '🏥', '🎪',
]

// 可用顏色
const availableColors = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e',
  '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#64748b',
]

// 計算屬性
const isEditing = computed(() => showEditModal.value && editingCategory.value !== null)

// 監聽器
watch([filters], () => {
  fetchCategories()
}, { deep: true })

// 方法
const fetchCategories = async () => {
  isLoading.value = true
  try {
    const params = new URLSearchParams()
    if (filters.value.type) params.append('type', filters.value.type)
    if (filters.value.scope) params.append('scope', filters.value.scope)
    if (filters.value.search) params.append('search', filters.value.search)

    const response = await $fetch(`/api/categories?${params}`) as any
    categories.value = response.data.items
    summary.value = response.data.summary
  }
  catch (error) {
    console.error('獲取分類失敗:', error)
    alert('獲取分類失敗，請重試')
  }
  finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  if (!form.value.name || !form.value.type || !form.value.icon || !form.value.color) {
    alert('請填寫所有必填欄位')
    return
  }

  isSubmitting.value = true
  try {
    const payload = { ...form.value }

    if (isEditing.value && editingCategory.value) {
      // 更新分類
      await $fetch(`/api/categories/${editingCategory.value._id}`, {
        method: 'PUT',
        body: payload,
      })
      alert('分類更新成功！')
    }
    else {
      // 建立分類
      await $fetch('/api/categories', {
        method: 'POST',
        body: payload,
      })
      alert('分類建立成功！')
    }

    closeModal()
    await fetchCategories()
  }
  catch (error: any) {
    console.error('處理分類失敗:', error)
    alert('操作失敗：' + (error.data?.message || error.message))
  }
  finally {
    isSubmitting.value = false
  }
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  form.value = {
    name: category.name,
    type: category.type,
    icon: category.icon,
    color: category.color,
    description: category.description || '',
  }
  showEditModal.value = true
}

const deleteCategory = async (category: Category) => {
  if (!confirm(`確定要刪除「${category.name}」分類嗎？\n\n注意：如果此分類正在使用中，將無法刪除。`)) {
    return
  }

  try {
    await $fetch(`/api/categories/${category._id}`, {
      method: 'DELETE',
    })
    alert('分類刪除成功！')
    await fetchCategories()
  }
  catch (error: any) {
    console.error('刪除分類失敗:', error)
    alert('刪除失敗：' + (error.data?.message || error.message))
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
  resetForm()
}

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    icon: '',
    color: '#3B82F6',
    description: '',
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-TW')
}

// 生命週期
onMounted(() => {
  fetchCategories()
})
</script>
