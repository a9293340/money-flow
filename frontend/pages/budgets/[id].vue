<template>
  <div class="min-h-screen bg-gray-50">
    <!-- App Header -->
    <AppHeader />

    <!-- 載入狀態 -->
    <div
      v-if="isLoading"
      class="flex justify-center items-center min-h-[400px]"
    >
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p class="text-gray-600 mt-2">
          載入中...
        </p>
      </div>
    </div>

    <!-- 預算詳情內容 -->
    <div
      v-else-if="budgetDetail"
      class="pb-8"
    >
      <!-- 頁面標題 -->
      <div class="bg-white shadow-sm border-b">
        <div class="max-w-6xl mx-auto px-4 py-6">
          <div class="flex items-center gap-4 mb-4">
            <NuxtLink
              to="/budgets"
              class="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg
                class="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              返回預算列表
            </NuxtLink>
          </div>

          <div class="flex items-start justify-between">
            <div>
              <h1 class="text-2xl font-bold text-gray-900">
                {{ budgetDetail.budget.name }}
              </h1>
              <p
                v-if="budgetDetail.budget.description"
                class="text-gray-600 mt-1"
              >
                {{ budgetDetail.budget.description }}
              </p>
              <div class="flex items-center gap-2 mt-3">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getStatusColor(budgetDetail.budget.status)"
                >
                  {{ formatStatus(budgetDetail.budget.status) }}
                </span>
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="getWarningColor(budgetDetail.budget.warningLevel)"
                >
                  {{ formatWarningLevel(budgetDetail.budget.warningLevel) }}
                </span>
                <span class="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                  {{ formatPeriodType(budgetDetail.budget.periodType) }}
                </span>
              </div>
            </div>

            <div class="flex gap-2">
              <button
                class="inline-flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                :disabled="isSubmitting"
                @click="handleRecalculate"
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
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重新計算
              </button>
              <button
                class="inline-flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                @click="handleEditMode"
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
                編輯
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="max-w-6xl mx-auto px-4 py-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 主要資訊區 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 預算概覽 -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                預算概覽
              </h2>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <p class="text-sm text-gray-600">
                    預算金額
                  </p>
                  <p class="text-2xl font-bold text-gray-900">
                    ${{ budgetDetail.budget.amount.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">
                    已花費
                  </p>
                  <p class="text-2xl font-bold text-red-600">
                    ${{ budgetDetail.budget.currentSpent.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">
                    剩餘金額
                  </p>
                  <p class="text-2xl font-bold text-green-600">
                    ${{ budgetDetail.budget.remainingAmount.toLocaleString() }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">
                    剩餘天數
                  </p>
                  <p class="text-2xl font-bold text-blue-600">
                    {{ budgetDetail.budget.remainingDays }}
                  </p>
                </div>
              </div>

              <!-- 進度條 -->
              <div>
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>使用進度</span>
                  <span>{{ budgetDetail.budget.usagePercentage }}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                  <div
                    class="h-3 rounded-full transition-all duration-300"
                    :class="{
                      'bg-green-500': budgetDetail.budget.usagePercentage <= 70,
                      'bg-yellow-500': budgetDetail.budget.usagePercentage > 70 && budgetDetail.budget.usagePercentage <= 90,
                      'bg-red-500': budgetDetail.budget.usagePercentage > 90,
                    }"
                    :style="{ width: Math.min(budgetDetail.budget.usagePercentage, 100) + '%' }"
                  />
                </div>
              </div>
            </div>

            <!-- 統計資訊 -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                詳細統計
              </h2>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">
                    ${{ budgetDetail.statistics.dailyAverage.toFixed(2) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    日均支出
                  </p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">
                    ${{ budgetDetail.statistics.weeklyAverage.toFixed(2) }}
                  </p>
                  <p class="text-sm text-gray-600">
                    週均支出
                  </p>
                </div>
                <div class="text-center p-4 bg-gray-50 rounded-lg">
                  <p class="text-2xl font-bold text-gray-900">
                    {{ budgetDetail.statistics.daysActive }}
                  </p>
                  <p class="text-sm text-gray-600">
                    活躍天數
                  </p>
                </div>
              </div>

              <div class="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-600">
                    預測完成日期
                  </p>
                  <p class="font-semibold">
                    {{ budgetDetail.statistics.projectedEndDate
                      ? new Date(budgetDetail.statistics.projectedEndDate).toLocaleDateString('zh-TW')
                      : '無法預測' }}
                  </p>
                </div>
                <div>
                  <p class="text-sm text-gray-600">
                    預算效率
                  </p>
                  <p class="font-semibold capitalize">
                    {{ budgetDetail.statistics.efficiency }}
                  </p>
                </div>
              </div>
            </div>

            <!-- 相關記錄 -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h2 class="text-lg font-semibold text-gray-900 mb-4">
                相關支出記錄
              </h2>

              <div
                v-if="budgetDetail.relatedRecords.length === 0"
                class="text-center py-8 text-gray-500"
              >
                <svg
                  class="w-12 h-12 mx-auto mb-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>尚無相關支出記錄</p>
              </div>

              <div
                v-else
                class="space-y-3"
              >
                <div
                  v-for="record in budgetDetail.relatedRecords.slice(0, 10)"
                  :key="record._id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div
                      v-if="record.categoryId"
                      class="text-2xl"
                    >
                      {{ record.categoryId.icon || '💸' }}
                    </div>
                    <div>
                      <p class="font-medium text-gray-900">
                        {{ record.description || '無描述' }}
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ new Date(record.date).toLocaleDateString('zh-TW') }}
                        {{ record.categoryId ? ` • ${record.categoryId.name}` : '' }}
                      </p>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="font-semibold text-red-600">
                      -${{ record.amount.toFixed(2) }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="budgetDetail.relatedRecords.length > 10"
                  class="text-center pt-4"
                >
                  <NuxtLink
                    :to="`/records?budgetId=${budgetDetail.budget._id}`"
                    class="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    查看全部 {{ budgetDetail.relatedRecords.length }} 筆記錄 →
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>

          <!-- 側邊欄 -->
          <div class="space-y-6">
            <!-- 預算詳情 -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                預算詳情
              </h3>

              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-gray-600">期間</span>
                  <span class="font-medium">
                    {{ new Date(budgetDetail.budget.startDate).toLocaleDateString('zh-TW') }}
                    -
                    {{ new Date(budgetDetail.budget.endDate).toLocaleDateString('zh-TW') }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">幣別</span>
                  <span class="font-medium">{{ budgetDetail.budget.currency }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">警告閾值</span>
                  <span class="font-medium">{{ budgetDetail.budget.warningThreshold }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">建立時間</span>
                  <span class="font-medium">
                    {{ new Date(budgetDetail.budget.createdAt).toLocaleDateString('zh-TW') }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">更新時間</span>
                  <span class="font-medium">
                    {{ new Date(budgetDetail.budget.updatedAt).toLocaleDateString('zh-TW') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- 適用分類 -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                適用分類
              </h3>

              <div
                v-if="budgetDetail.budget.categoryIds.length === 0"
                class="text-sm text-gray-600"
              >
                <div class="flex items-center gap-2">
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  追蹤所有分類
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  此預算追蹤所有支出記錄
                </p>
              </div>

              <div
                v-else
                class="space-y-2"
              >
                <div
                  v-for="category in budgetDetail.categories"
                  :key="category._id"
                  class="flex items-center gap-2 text-sm"
                >
                  <span class="text-lg">{{ category.icon }}</span>
                  <span>{{ category.name }}</span>
                </div>
              </div>
            </div>

            <!-- 快速操作 -->
            <div class="bg-white rounded-lg shadow-sm border p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">
                快速操作
              </h3>

              <div class="space-y-3">
                <NuxtLink
                  to="/records"
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
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
                  新增支出記錄
                </NuxtLink>

                <button
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                  @click="handleEditMode"
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
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  編輯預算
                </button>

                <button
                  class="w-full inline-flex items-center justify-center px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
                  @click="handleDelete"
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  刪除預算
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div
      v-else
      class="text-center py-12"
    >
      <svg
        class="w-16 h-16 text-red-400 mx-auto mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">
        預算不存在
      </h3>
      <p class="text-gray-600 mb-6">
        找不到指定的預算，可能已被刪除或您沒有存取權限
      </p>
      <NuxtLink
        to="/budgets"
        class="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
      >
        返回預算列表
      </NuxtLink>
    </div>

    <!-- 編輯模式彈窗 -->
    <div
      v-if="isEditMode"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="isEditMode = false"
    >
      <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">
              編輯預算
            </h3>
            <button
              class="text-gray-400 hover:text-gray-600"
              @click="isEditMode = false"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form
          class="p-6 space-y-6"
          @submit.prevent="handleUpdateBudget"
        >
          <!-- 基本資訊 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 預算名稱 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                預算名稱 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="例如：2025年8月生活費預算"
                maxlength="100"
              >
              <p class="text-xs text-gray-500 mt-1">
                {{ editForm.name.length }}/100
              </p>
            </div>

            <!-- 預算金額 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                預算金額 <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  v-model="editForm.amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="99999999"
                  required
                  class="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                >
              </div>
              <p
                v-if="budgetDetail.budget.currentSpent > editForm.amount"
                class="text-xs text-red-600 mt-1"
              >
                警告：預算金額不能小於已花費金額 ${{ budgetDetail.budget.currentSpent.toFixed(2) }}
              </p>
            </div>
          </div>

          <!-- 描述 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              預算描述
            </label>
            <textarea
              v-model="editForm.description"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="預算的詳細說明（選填）"
              maxlength="500"
            />
            <p class="text-xs text-gray-500 mt-1">
              {{ (editForm.description || '').length }}/500
            </p>
          </div>

          <!-- 期間設定 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 開始日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                開始日期 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.startDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>

            <!-- 結束日期 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                結束日期 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="editForm.endDate"
                type="date"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
            </div>
          </div>

          <!-- 分類選擇 -->
          <div v-if="availableCategories.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              適用分類（可選）
            </label>
            <div class="border border-gray-300 rounded-md p-3">
              <div class="space-y-2 max-h-32 overflow-y-auto">
                <div
                  v-for="category in availableCategories"
                  :key="category._id"
                  class="flex items-center"
                >
                  <input
                    v-model="editForm.categoryIds"
                    :value="category._id"
                    type="checkbox"
                    class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  >
                  <label class="ml-2 text-sm text-gray-700 flex items-center">
                    <span class="mr-2">{{ category.icon }}</span>
                    {{ category.name }}
                  </label>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              選擇此預算要追蹤的支出分類，不選擇任何分類表示追蹤所有支出
            </p>
          </div>

          <!-- 進階設定 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- 警告閾值 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                警告閾值 (%)
              </label>
              <input
                v-model.number="editForm.warningThreshold"
                type="number"
                min="0"
                max="100"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
              <p class="text-xs text-gray-500 mt-1">
                當支出達到預算的百分比時發出警告，預設為 80%
              </p>
            </div>

            <!-- 幣別 -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                幣別
              </label>
              <select
                v-model="editForm.currency"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="TWD">
                  TWD (新台幣)
                </option>
                <option value="USD">
                  USD (美金)
                </option>
                <option value="EUR">
                  EUR (歐元)
                </option>
                <option value="JPY">
                  JPY (日圓)
                </option>
              </select>
            </div>
          </div>

          <!-- 狀態設定 -->
          <div>
            <div class="flex items-center">
              <input
                v-model="editForm.isActive"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 text-sm text-gray-700">
                啟用此預算
              </label>
            </div>
            <p class="text-xs text-gray-500 mt-1">
              取消勾選將暫停此預算，不會計入支出統計
            </p>
          </div>

          <!-- 表單按鈕 -->
          <div class="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              @click="isEditMode = false"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="isSubmitting || !isEditFormValid"
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? '更新中...' : '更新預算' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  title: '預算詳情',
  auth: true,
})

const route = useRoute()
const budgetId = route.params.id as string

const {
  fetchBudget,
  deleteBudget,
  updateBudget,
  recalculateBudget,
  isLoading,
  isSubmitting,
  getWarningColor,
  getStatusColor,
  formatStatus,
  formatWarningLevel,
  formatPeriodType,
} = useBudgets()

// 預算詳情資料
const budgetDetail = ref<any>(null)
const isEditMode = ref(false)
const availableCategories = ref<any[]>([])

// 編輯表單資料
const editForm = ref({
  name: '',
  description: '',
  amount: 0,
  currency: 'TWD',
  categoryIds: [] as string[],
  startDate: '',
  endDate: '',
  warningThreshold: 80,
  isActive: true,
})

// 編輯表單驗證
const isEditFormValid = computed(() => {
  return editForm.value.name.trim()
    && editForm.value.amount > 0
    && editForm.value.startDate
    && editForm.value.endDate
    && new Date(editForm.value.startDate) < new Date(editForm.value.endDate)
    && editForm.value.amount >= (budgetDetail.value?.budget?.currentSpent || 0)
})

// 載入預算詳情
const loadBudgetDetail = async () => {
  try {
    budgetDetail.value = await fetchBudget(budgetId)
    // 同時載入分類資料以供編輯使用
    await loadCategories()
  }
  catch (error) {
    console.error('載入預算詳情失敗:', error)
    budgetDetail.value = null
  }
}

// 載入分類資料
const loadCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const categoriesResponse = await response.json()
    availableCategories.value = categoriesResponse.data.items.filter((category: any) => category.type === 'expense') || []
  }
  catch (error) {
    console.error('載入分類失敗:', error)
  }
}

// 初始化編輯表單
const initEditForm = () => {
  if (!budgetDetail.value?.budget) return

  const budget = budgetDetail.value.budget
  editForm.value = {
    name: budget.name,
    description: budget.description || '',
    amount: budget.amount,
    currency: budget.currency,
    categoryIds: [...budget.categoryIds],
    startDate: budget.startDate.split('T')[0], // 轉換為 YYYY-MM-DD 格式
    endDate: budget.endDate.split('T')[0],
    warningThreshold: budget.warningThreshold,
    isActive: budget.isActive,
  }
}

// 處理編輯模式
const handleEditMode = () => {
  initEditForm()
  isEditMode.value = true
}

// 更新預算
const handleUpdateBudget = async () => {
  if (!isEditFormValid.value) return

  try {
    await updateBudget(budgetId, {
      name: editForm.value.name.trim(),
      description: editForm.value.description.trim() || undefined,
      amount: Number(editForm.value.amount),
      currency: editForm.value.currency,
      categoryIds: editForm.value.categoryIds,
      startDate: editForm.value.startDate,
      endDate: editForm.value.endDate,
      warningThreshold: editForm.value.warningThreshold,
      isActive: editForm.value.isActive,
    })

    // 關閉編輯模式並重新載入詳情
    isEditMode.value = false
    await loadBudgetDetail()
  }
  catch (error) {
    console.error('更新預算失敗:', error)
    alert('更新失敗，請檢查輸入資料後重試')
  }
}

// 重新計算統計
const handleRecalculate = async () => {
  try {
    await recalculateBudget(budgetId)
    // 重新載入詳情
    await loadBudgetDetail()
  }
  catch (error) {
    console.error('重新計算失敗:', error)
    alert('重新計算失敗，請稍後重試')
  }
}

// 刪除預算
const handleDelete = async () => {
  if (!budgetDetail.value) return

  const budgetName = budgetDetail.value.budget.name
  if (!confirm(`確定要刪除預算「${budgetName}」嗎？此操作無法復原。`)) {
    return
  }

  try {
    await deleteBudget(budgetId)
    await navigateTo('/budgets')
  }
  catch (error) {
    console.error('刪除預算失敗:', error)
    alert('刪除失敗，請稍後重試')
  }
}

// 頁面載入時獲取資料
onMounted(() => {
  loadBudgetDetail()
})
</script>
