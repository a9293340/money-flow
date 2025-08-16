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
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <!-- 可收合的標題 -->
            <div
              class="flex items-center justify-between p-6 cursor-pointer lg:cursor-default"
              @click="toggleFormCollapse"
            >
              <h2 class="text-lg font-semibold text-gray-900">
                {{ isEditing ? '編輯記錄' : '新增記錄' }}
              </h2>
              <button
                class="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                @click.stop="toggleFormCollapse"
              >
                <svg
                  class="w-5 h-5 transform transition-transform"
                  :class="{ 'rotate-180': !isFormCollapsed }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <!-- 可收合的表單內容 -->
            <div
              class="overflow-hidden transition-all duration-300"
              :class="isFormCollapsed ? 'max-h-0 lg:max-h-none' : 'max-h-screen'"
            >
              <form
                class="space-y-4 px-6 pb-6"
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
                    class="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                    @click="cancelEdit"
                  >
                    取消編輯
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- 記錄列表 -->
        <div class="lg:col-span-2">
          <div class="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <!-- 可收合的標題 -->
            <div
              class="flex items-center justify-between p-4 cursor-pointer lg:cursor-default border-b border-gray-200"
              @click="toggleListCollapse"
            >
              <h2 class="text-lg font-semibold text-gray-900">
                記錄列表
              </h2>
              <button
                class="lg:hidden text-gray-500 hover:text-gray-700 transition-colors"
                @click.stop="toggleListCollapse"
              >
                <svg
                  class="w-5 h-5 transform transition-transform"
                  :class="{ 'rotate-180': !isListCollapsed }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            <!-- 可收合的列表內容 -->
            <div
              class="overflow-hidden transition-all duration-300"
              :class="isListCollapsed ? 'max-h-0 lg:max-h-none' : 'max-h-screen'"
            >
              <!-- 篩選區域 -->
              <div class="p-4 border-b border-gray-200">
                <div class="flex flex-wrap gap-4">
                  <!-- 年份選擇 -->
                  <select
                    v-model="filters.year"
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option
                      v-for="year in yearOptions"
                      :key="year"
                      :value="year"
                    >
                      {{ year }}年
                    </option>
                  </select>

                  <!-- 月份選擇 -->
                  <select
                    v-model="filters.month"
                    class="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >
                    <option
                      v-for="month in monthOptions"
                      :key="month.value"
                      :value="month.value"
                    >
                      {{ month.label }}
                    </option>
                  </select>

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

                  <!-- 描述搜尋 -->
                  <input
                    v-model="filters.search"
                    type="text"
                    placeholder="搜尋描述..."
                    class="flex-1 min-w-[150px] px-3 py-2 border border-gray-300 rounded-md text-sm"
                  >

                  <!-- 標籤搜尋 -->
                  <div class="flex-1 min-w-[180px]">
                    <input
                      v-model="filters.tags"
                      type="text"
                      placeholder="標籤搜尋 (多個用逗號分隔)"
                      class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >

                    <!-- 標籤建議 -->
                    <div
                      v-if="suggestedTags.length > 0"
                      class="mt-2 flex flex-wrap gap-1"
                    >
                      <span class="text-xs text-gray-500 mr-2">常用標籤:</span>
                      <button
                        v-for="tag in suggestedTags.slice(0, 6)"
                        :key="tag"
                        type="button"
                        class="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-800 transition-colors"
                        @click="addTagToSearch(tag)"
                      >
                        {{ tag }}
                      </button>
                    </div>
                  </div>
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

                <!-- 分頁控制 -->
                <div
                  v-if="pagination.total > 0"
                  class="mt-6 flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0"
                >
                  <!-- 每頁顯示數量選擇器 -->
                  <div class="flex items-center space-x-2">
                    <span class="text-sm text-gray-700">每頁顯示</span>
                    <select
                      v-model="pagination.limit"
                      class="px-3 py-1 border border-gray-300 rounded-md text-sm"
                      @change="changePageSize"
                    >
                      <option value="5">
                        5 筆
                      </option>
                      <option value="10">
                        10 筆
                      </option>
                      <option value="20">
                        20 筆
                      </option>
                    </select>
                    <span class="text-sm text-gray-500">
                      共 {{ pagination.total }} 筆記錄
                    </span>
                  </div>

                  <!-- 分頁按鈕 -->
                  <div
                    v-if="pagination.pages > 1"
                    class="flex items-center space-x-2"
                  >
                    <!-- 上一頁 -->
                    <button
                      :disabled="pagination.page <= 1"
                      :class="[
                        'px-3 py-1 rounded text-sm transition-colors',
                        pagination.page <= 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                      ]"
                      @click="changePage(pagination.page - 1)"
                    >
                      上一頁
                    </button>

                    <!-- 頁碼按鈕 -->
                    <div class="flex space-x-1">
                      <button
                        v-for="page in visiblePages"
                        :key="page"
                        :class="[
                          'px-3 py-1 rounded text-sm transition-colors',
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                        ]"
                        @click="changePage(page)"
                      >
                        {{ page }}
                      </button>
                    </div>

                    <!-- 下一頁 -->
                    <button
                      :disabled="pagination.page >= pagination.pages"
                      :class="[
                        'px-3 py-1 rounded text-sm transition-colors',
                        pagination.page >= pagination.pages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
                      ]"
                      @click="changePage(pagination.page + 1)"
                    >
                      下一頁
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
        class="max-w-4xl mx-auto px-4 py-6 mt-8"
      >
        <div class="bg-gradient-to-br from-slate-50 via-white to-blue-50 rounded-3xl shadow-lg border border-gray-100/50 backdrop-blur-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
          <!-- 標題區域 -->
          <div class="relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 px-6 py-8">
            <div class="absolute inset-0 bg-black/10" />
            <div class="relative flex items-center justify-between">
              <div>
                <h3 class="text-2xl font-bold text-white mb-1">
                  本月統計
                </h3>
                <p class="text-blue-100/80 text-sm">
                  {{ new Date().getFullYear() }}年{{ new Date().getMonth() + 1 }}月財務概覽
                </p>
              </div>
              <div class="hidden sm:block">
                <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <svg
                    class="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- 裝飾性元素 -->
            <div class="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
            <div class="absolute -bottom-2 -left-2 w-16 h-16 bg-white/5 rounded-full blur-lg" />
          </div>

          <!-- 統計卡片區域 -->
          <div class="relative -mt-6 px-6 pb-8">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <!-- 收入卡片 -->
              <div class="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100/50 hover:border-green-200 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/30 rounded-2xl" />
                <div class="relative">
                  <div class="flex items-center justify-between mb-4">
                    <div class="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                    <div class="text-right">
                      <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Income
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="text-3xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      ${{ summary.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </div>
                    <div class="text-sm text-green-600 font-semibold">
                      總收入
                    </div>
                  </div>
                </div>
                <!-- 裝飾線條 -->
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>

              <!-- 支出卡片 -->
              <div class="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-red-100/50 hover:border-red-200 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-red-50/50 to-rose-50/30 rounded-2xl" />
                <div class="relative">
                  <div class="flex items-center justify-between mb-4">
                    <div class="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                    <div class="text-right">
                      <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Expense
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="text-3xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      ${{ summary.totalExpense.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </div>
                    <div class="text-sm text-red-600 font-semibold">
                      總支出
                    </div>
                  </div>
                </div>
                <!-- 裝飾線條 -->
                <div class="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </div>

              <!-- 淨額卡片 -->
              <div class="group relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100/50 hover:border-blue-200 hover:-translate-y-1">
                <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-2xl" />
                <div class="relative">
                  <div class="flex items-center justify-between mb-4">
                    <div class="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
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
                    <div class="text-right">
                      <div class="text-xs text-gray-500 font-medium uppercase tracking-wider">
                        Net
                      </div>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div
                      class="text-3xl font-bold transition-colors"
                      :class="summary.netAmount >= 0 ? 'text-gray-900 group-hover:text-blue-600' : 'text-gray-900 group-hover:text-red-600'"
                    >
                      {{ summary.netAmount >= 0 ? '+' : '' }}${{ summary.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </div>
                    <div
                      class="text-sm font-semibold"
                      :class="summary.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'"
                    >
                      淨額
                    </div>
                  </div>
                </div>
                <!-- 裝飾線條 -->
                <div
                  class="absolute bottom-0 left-0 right-0 h-1 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                  :class="summary.netAmount >= 0 ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-red-500 to-rose-500'"
                />
              </div>
            </div>

            <!-- 底部進度指示器 -->
            <div class="mt-8 flex items-center justify-center space-x-2">
              <div class="w-8 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
              <div class="w-8 h-1 bg-gradient-to-r from-red-500 to-rose-500 rounded-full" />
              <div class="w-8 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <!-- 快速導航到分析頁面 -->
      <div class="max-w-4xl mx-auto px-4 py-6">
        <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-lg hover:shadow-xl transition-all duration-300">
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div class="mb-4 sm:mb-0">
              <h3 class="text-xl font-bold mb-2">
                深入分析您的財務狀況
              </h3>
              <p class="text-indigo-100">
                查看詳細的月度趨勢、分類分析和財務洞察
              </p>
            </div>

            <NuxtLink
              to="/analytics"
              class="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 transition-all duration-200 group"
            >
              <span>前往分析報表</span>
              <svg
                class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </NuxtLink>
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
  limit: 10,
  total: 0,
  pages: 0,
})

const isLoading = ref(false)
const isSubmitting = ref(false)

// 收合狀態
const isFormCollapsed = ref(true) // 在 mobile 上預設收合
const isListCollapsed = ref(false)

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

// 標籤建議
const suggestedTags = ref<string[]>([])

// 篩選條件
const filters = ref({
  type: '',
  categoryId: '',
  search: '',
  tags: '',
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1, // 1-12
})

// 計算屬性
const filteredCategories = computed(() => {
  return categories.value.filter(category => category.type === form.value.type)
})

// 計算可見的頁碼（最多顯示5頁）
const visiblePages = computed(() => {
  const total = pagination.value.pages
  const current = pagination.value.page
  const pages = []

  if (total <= 5) {
    // 如果總頁數小於等於5，顯示所有頁碼
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  }
  else {
    // 否則顯示當前頁附近的5個頁碼
    let start = Math.max(1, current - 2)
    const end = Math.min(total, start + 4)

    // 確保始終顯示5個頁碼（如果可能）
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
  }

  return pages
})

// 年份選項 (當前年份的前後5年)
const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear()
  const years = []
  for (let i = currentYear - 5; i <= currentYear + 1; i++) {
    years.push(i)
  }
  return years.reverse() // 最新年份在前
})

// 月份選項
const monthOptions = [
  { value: 1, label: '1月' },
  { value: 2, label: '2月' },
  { value: 3, label: '3月' },
  { value: 4, label: '4月' },
  { value: 5, label: '5月' },
  { value: 6, label: '6月' },
  { value: 7, label: '7月' },
  { value: 8, label: '8月' },
  { value: 9, label: '9月' },
  { value: 10, label: '10月' },
  { value: 11, label: '11月' },
  { value: 12, label: '12月' },
]

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

// 獲取標籤建議（從現有記錄中提取）
const fetchSuggestedTags = async () => {
  try {
    // 獲取所有記錄的標籤
    const response = await $fetch('/api/records?limit=100') as any
    const allTags = new Set<string>()

    response.data.items.forEach((record: any) => {
      if (record.tags && Array.isArray(record.tags)) {
        record.tags.forEach((tag: string) => allTags.add(tag))
      }
    })

    // 轉換為陣列並排序
    suggestedTags.value = Array.from(allTags).sort()
  }
  catch (error) {
    console.error('獲取標籤建議失敗:', error)
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
    if (filters.value.tags) params.append('tags', filters.value.tags)
    if (filters.value.year) params.append('year', filters.value.year.toString())
    if (filters.value.month) params.append('month', filters.value.month.toString())

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
    }
    else {
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

// 添加標籤到搜尋
const addTagToSearch = (tag: string) => {
  if (!filters.value.tags) {
    filters.value.tags = tag
  }
  else {
    // 檢查標籤是否已存在
    const existingTags = filters.value.tags.split(',').map(t => t.trim())
    if (!existingTags.includes(tag)) {
      filters.value.tags += ', ' + tag
    }
  }
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
  if (page < 1 || page > pagination.value.pages) return
  pagination.value.page = page
  fetchRecords()
}

const changePageSize = () => {
  // 當改變每頁顯示數量時，重置到第1頁
  pagination.value.page = 1
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

// 收合功能方法
const toggleFormCollapse = () => {
  isFormCollapsed.value = !isFormCollapsed.value
}

const toggleListCollapse = () => {
  isListCollapsed.value = !isListCollapsed.value
}

// 生命週期
onMounted(async () => {
  await fetchCategories()
  await fetchSuggestedTags()
  await fetchRecords()
})
</script>
