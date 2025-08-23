<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 overflow-y-auto"
  >
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        :class="{ 'pointer-events-none': isSubmitting }"
        @click="closeModal"
      />
      <div class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full border border-gray-100">
        <div class="bg-gradient-to-br from-white to-gray-50 px-6 pt-6 pb-4 sm:p-8">
          <div class="mb-8">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <svg
                  class="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <div>
                <h3 class="text-2xl font-bold text-gray-900">
                  {{ mode === 'create' ? '新增收入預測項目' : '編輯收入預測項目' }}
                </h3>
                <p class="text-sm text-gray-500 mt-1">
                  {{ mode === 'create' ? '設定您的收入預測，讓系統自動追蹤收入狀況' : '修改預測項目的設定與配置' }}
                </p>
              </div>
            </div>
          </div>

          <form
            class="space-y-6"
            @submit.prevent="handleSubmit"
          >
            <!-- Basic Information -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <svg
                  class="w-5 h-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-gray-900">
                  基本資訊
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <span class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    項目名稱 <span class="text-red-500">*</span>
                  </span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  placeholder="例如：薪資收入、副業收入、投資收益..."
                  :disabled="isSubmitting"
                  maxlength="100"
                  class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400"
                >
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <span class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    描述
                  </span>
                </label>
                <textarea
                  v-model="form.description"
                  placeholder="說明這個收入來源的特色或注意事項..."
                  :disabled="isSubmitting"
                  maxlength="500"
                  rows="3"
                  class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-400 resize-none"
                />
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <span class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      預期金額 <span class="text-red-500">*</span>
                    </span>
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="form.expectedAmount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="10000"
                      :disabled="isSubmitting"
                      class="block w-full pl-4 pr-16 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                    >
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span class="text-gray-500 text-sm font-medium">{{ form.currency }}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <span class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      幣別 <span class="text-red-500">*</span>
                    </span>
                  </label>
                  <select
                    v-model="form.currency"
                    :disabled="isSubmitting"
                    class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white"
                  >
                    <option value="">
                      選擇幣別
                    </option>
                    <option
                      v-for="option in currencyOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <span class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                      />
                    </svg>
                    收入分類 <span class="text-red-500">*</span>
                  </span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.incomeCategory"
                    :disabled="isSubmitting || isLoadingCategories"
                    class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">
                      {{ isLoadingCategories ? '載入分類中...' : '請選擇收入分類' }}
                    </option>
                    <option
                      v-for="option in categoryOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      v-if="isLoadingCategories"
                      class="animate-spin h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      />
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <svg
                      v-else
                      class="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <p
                  v-if="categoryOptions.length === 0 && !isLoadingCategories"
                  class="mt-2 text-sm text-amber-600"
                >
                  <span class="flex items-center gap-1">
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    尚未找到收入分類，請先到「分類管理」新增收入分類
                  </span>
                </p>
              </div>
            </div>

            <!-- Frequency and Date Range -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-gray-900">
                  頻率和期間設定
                </h4>
              </div>

              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-2">
                  <span class="flex items-center gap-2">
                    <svg
                      class="w-4 h-4 text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    收入頻率 <span class="text-red-500">*</span>
                  </span>
                </label>
                <div class="relative">
                  <select
                    v-model="form.frequency"
                    :disabled="isSubmitting"
                    class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white appearance-none cursor-pointer"
                  >
                    <option value="">
                      選擇收入頻率
                    </option>
                    <option
                      v-for="option in frequencyOptions"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                  <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg
                      class="h-4 w-4 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <span class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      開始日期 <span class="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    v-model="form.startDate"
                    type="date"
                    :disabled="isSubmitting"
                    class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  >
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <span class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      結束日期
                    </span>
                  </label>
                  <input
                    v-model="form.endDate"
                    type="date"
                    :disabled="isSubmitting"
                    class="block w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                  >
                  <p class="mt-2 text-sm text-gray-500">
                    <span class="flex items-center gap-1">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      留空即為無期限收入
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Payment Schedule Configuration -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <svg
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4V9a2 2 0 012-2h4a2 2 0 012 2v2.5m-8 4.5V21a2 2 0 002 2h4a2 2 0 002-2v-4.5"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-gray-900">
                  收款日設定
                </h4>
              </div>

              <!-- 收款日類型 -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  收款日類型
                </label>
                <select
                  v-model="form.paymentSchedule.type"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-white"
                  required
                >
                  <option
                    v-for="option in paymentScheduleTypeOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <!-- 每月固定日期 -->
              <div v-if="form.paymentSchedule.type === 'fixed_day_of_month'">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  每月幾號發薪
                </label>
                <input
                  v-model.number="form.paymentSchedule.dayOfMonth"
                  type="number"
                  min="1"
                  max="31"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="25"
                  required
                >
                <p class="mt-2 text-sm text-gray-500">
                  例：25 表示每月 25 號發薪
                </p>
              </div>

              <!-- 固定日期 -->
              <div v-else-if="form.paymentSchedule.type === 'fixed_date'">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  固定發薪日期
                </label>
                <input
                  v-model="form.paymentSchedule.fixedDate"
                  type="date"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  required
                >
              </div>

              <!-- 工作日相關 -->
              <div v-else-if="form.paymentSchedule.type === 'working_day'">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  工作日偏移
                </label>
                <input
                  v-model.number="form.paymentSchedule.workingDayOffset"
                  type="number"
                  min="-10"
                  max="10"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200"
                  placeholder="0"
                  required
                >
                <p class="mt-2 text-sm text-gray-500">
                  -1 = 月底最後一個工作日，0 = 月底，1 = 下個月第一個工作日
                </p>
              </div>

              <!-- 自定義規則 -->
              <div v-else-if="form.paymentSchedule.type === 'custom'">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  自定義規則
                </label>
                <textarea
                  v-model="form.paymentSchedule.customRule"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
                  rows="3"
                  placeholder="描述您的特殊發薪規則..."
                  required
                />
              </div>

              <!-- 容錯規則 -->
              <div>
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  假日處理方式
                </label>
                <select
                  v-model="form.paymentSchedule.fallbackRule"
                  :disabled="isSubmitting"
                  class="w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 bg-white"
                  required
                >
                  <option
                    v-for="option in fallbackRuleOptions"
                    :key="option.value"
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                <p class="mt-2 text-sm text-gray-500">
                  當收款日遇到假日時的處理方式
                </p>
              </div>
            </div>

            <!-- Matching Configuration -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-6 shadow-sm">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <svg
                  class="w-5 h-5 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-gray-900">
                  智能匹配設定
                </h4>
              </div>

              <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-100">
                <div class="flex items-start">
                  <input
                    v-model="form.matchingConfig.autoMatch"
                    type="checkbox"
                    :disabled="isSubmitting"
                    class="mt-1 h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-200"
                  >
                  <div class="ml-3">
                    <label class="text-sm font-semibold text-gray-800 cursor-pointer">
                      啟用自動匹配
                    </label>
                    <p class="mt-1 text-sm text-gray-600">
                      系統會自動根據您設定的容差範圍，智能匹配相關的收入記錄
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid gap-6 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <span class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                        />
                      </svg>
                      金額容差
                    </span>
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="form.matchingConfig.amountTolerance"
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      placeholder="10.0"
                      :disabled="isSubmitting"
                      class="block w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                    >
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span class="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  <p class="mt-2 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      允許的金額誤差百分比
                    </span>
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-semibold text-gray-700 mb-2">
                    <span class="flex items-center gap-2">
                      <svg
                        class="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      日期容差
                    </span>
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="form.matchingConfig.dateTolerance"
                      type="number"
                      min="0"
                      max="365"
                      placeholder="7"
                      :disabled="isSubmitting"
                      class="block w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
                    >
                    <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span class="text-gray-500 text-sm">天</span>
                    </div>
                  </div>
                  <p class="mt-2 text-sm text-gray-600">
                    <span class="flex items-center gap-1">
                      <svg
                        class="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      允許的日期誤差天數
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
              <div class="flex items-center gap-2 pb-2 border-b border-gray-100">
                <svg
                  class="w-5 h-5 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h4 class="text-lg font-semibold text-gray-900">
                  狀態設定
                </h4>
              </div>

              <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 border border-emerald-100">
                <div class="flex items-start">
                  <input
                    v-model="form.isActive"
                    type="checkbox"
                    :disabled="isSubmitting"
                    class="mt-1 h-5 w-5 text-emerald-600 focus:ring-2 focus:ring-emerald-500 border-gray-300 rounded transition-colors duration-200"
                  >
                  <div class="ml-3">
                    <label class="text-sm font-semibold text-gray-800 cursor-pointer">
                      啟用此預測項目
                    </label>
                    <p class="mt-1 text-sm text-gray-600">
                      只有啟用的項目才會參與自動匹配和期間生成
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse border-t border-gray-200">
          <button
            :disabled="!isFormValid || isSubmitting"
            class="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-base font-semibold text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 hover:shadow-xl"
            @click="handleSubmit"
          >
            <svg
              v-if="isSubmitting"
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <svg
              v-else
              class="-ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {{ isSubmitting ? '處理中...' : (mode === 'create' ? '建立預測項目' : '更新預測項目') }}
          </button>
          <button
            :disabled="isSubmitting"
            class="mt-3 w-full inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-sm px-6 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:mr-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            @click="closeModal"
          >
            <svg
              class="-ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            取消
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { IncomeForecastingItem } from '~/lib/models/IncomeForecasting'
import type { PaymentScheduleType, FallbackRule } from '~/lib/models'

interface Props {
  modelValue: boolean
  item?: IncomeForecastingItem | null
  mode: 'create' | 'edit'
}

interface Emits {
  'update:modelValue': [value: boolean]
  'success': []
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// State
const isSubmitting = ref(false)
const isLoadingCategories = ref(true)

// Form data
const form = reactive({
  name: '',
  description: '',
  expectedAmount: 0,
  currency: 'TWD',
  incomeCategory: '',
  frequency: 'monthly',
  startDate: '',
  endDate: '',
  isActive: true,
  paymentSchedule: {
    type: 'fixed_day_of_month' as PaymentScheduleType,
    dayOfMonth: 25,
    fixedDate: '',
    workingDayOffset: 0,
    customRule: '',
    fallbackRule: 'next_working_day' as FallbackRule,
  },
  matchingConfig: {
    amountTolerance: 10,
    dateTolerance: 7,
    autoMatch: true,
  },
})

// Options
const currencyOptions = [
  { label: '新台幣 (TWD)', value: 'TWD' },
  { label: '美元 (USD)', value: 'USD' },
  { label: '歐元 (EUR)', value: 'EUR' },
  { label: '日圓 (JPY)', value: 'JPY' },
  { label: '人民幣 (CNY)', value: 'CNY' },
]

const frequencyOptions = [
  { label: '每日', value: 'daily' },
  { label: '每週', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '每季', value: 'quarterly' },
  { label: '每年', value: 'yearly' },
]

const paymentScheduleTypeOptions = [
  { label: '每月固定日期', value: 'fixed_day_of_month' },
  { label: '固定日期', value: 'fixed_date' },
  { label: '工作日相關', value: 'working_day' },
  { label: '自定義規則', value: 'custom' },
]

const fallbackRuleOptions = [
  { label: '順延至下一工作日', value: 'next_working_day' },
  { label: '提前至前一工作日', value: 'previous_working_day' },
  { label: '嚴格按日期', value: 'exact_date' },
]

const categoryOptions = ref<Array<{ label: string, value: string }>>([])

// Composables
const toast = {
  add: (options: { title: string, description?: string, color?: string }) => {
    // Simple console log for now
    console.log('Toast:', options.title, options.description)
  },
}

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const isFormValid = computed(() => {
  const basicValid = (
    form.name.trim() !== ''
    && form.expectedAmount > 0
    && form.currency !== ''
    && form.incomeCategory !== ''
    && form.frequency !== ''
    && form.startDate !== ''
    && (!form.endDate || new Date(form.endDate) > new Date(form.startDate))
  )

  // 驗證 paymentSchedule
  const paymentScheduleValid = (() => {
    switch (form.paymentSchedule.type) {
      case 'fixed_day_of_month':
        return form.paymentSchedule.dayOfMonth >= 1 && form.paymentSchedule.dayOfMonth <= 31
      case 'fixed_date':
        return form.paymentSchedule.fixedDate !== ''
      case 'working_day':
        return form.paymentSchedule.workingDayOffset !== undefined && form.paymentSchedule.workingDayOffset >= -10 && form.paymentSchedule.workingDayOffset <= 10
      case 'custom':
        return form.paymentSchedule.customRule?.trim() !== ''
      default:
        return false
    }
  })()

  return basicValid && paymentScheduleValid
})

// Methods
async function loadCategories() {
  try {
    isLoadingCategories.value = true
    const response: any = await $fetch('/api/categories?type=income')

    // 檢查回應格式 - API 回傳的是 data.items 結構
    if (response.success && response.data && response.data.items && Array.isArray(response.data.items)) {
      categoryOptions.value = response.data.items.map((cat: any) => ({
        label: cat.name,
        value: cat._id,
      }))
      console.log('成功載入分類:', categoryOptions.value.length, '個分類')
    }
    else {
      // 如果資料格式不正確，設置預設值
      categoryOptions.value = []
      console.warn('Categories API 回應格式不正確:', response)
    }
  }
  catch (error) {
    console.error('載入分類失敗:', error)
    // 發生錯誤時設置預設值
    categoryOptions.value = []
    toast.add({
      title: '載入失敗',
      description: '無法載入收入分類，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isLoadingCategories.value = false
  }
}

function resetForm() {
  Object.assign(form, {
    name: '',
    description: '',
    expectedAmount: 0,
    currency: 'TWD',
    incomeCategory: '',
    frequency: 'monthly',
    startDate: '',
    endDate: '',
    isActive: true,
    matchingConfig: {
      amountTolerance: 10,
      dateTolerance: 7,
      autoMatch: true,
    },
  })
}

function populateForm(item: IncomeForecastingItem) {
  form.name = item.name
  form.description = item.description || ''
  form.expectedAmount = item.expectedAmount
  form.currency = item.currency
  form.incomeCategory = typeof item.incomeCategory === 'string'
    ? item.incomeCategory
    : item.incomeCategory._id
  form.frequency = item.frequency
  form.startDate = new Date(item.startDate).toISOString().split('T')[0]
  form.endDate = item.endDate
    ? new Date(item.endDate).toISOString().split('T')[0]
    : ''
  form.isActive = item.isActive
  // 安全地填充 paymentSchedule，確保所有欄位都有值
  form.paymentSchedule = {
    type: item.paymentSchedule?.type || 'fixed_day_of_month',
    dayOfMonth: item.paymentSchedule?.dayOfMonth || 25,
    fixedDate: item.paymentSchedule?.fixedDate
      ? (typeof item.paymentSchedule.fixedDate === 'string'
          ? item.paymentSchedule.fixedDate
          : new Date(item.paymentSchedule.fixedDate).toISOString().split('T')[0]
        )
      : '',
    workingDayOffset: item.paymentSchedule?.workingDayOffset || 0,
    customRule: item.paymentSchedule?.customRule || '',
    fallbackRule: item.paymentSchedule?.fallbackRule || 'next_working_day',
  }
  form.matchingConfig = { ...item.matchingConfig }
}

async function handleSubmit() {
  if (!isFormValid.value || isSubmitting.value) return

  try {
    isSubmitting.value = true

    // 構造 paymentSchedule，只包含相關欄位
    const paymentSchedule: any = {
      type: form.paymentSchedule.type,
      fallbackRule: form.paymentSchedule.fallbackRule,
    }

    // 根據類型添加相關欄位
    switch (form.paymentSchedule.type) {
      case 'fixed_day_of_month':
        paymentSchedule.dayOfMonth = form.paymentSchedule.dayOfMonth
        break
      case 'fixed_date':
        paymentSchedule.fixedDate = form.paymentSchedule.fixedDate
        break
      case 'working_day':
        paymentSchedule.workingDayOffset = form.paymentSchedule.workingDayOffset
        break
      case 'custom':
        paymentSchedule.customRule = form.paymentSchedule.customRule
        break
    }

    const payload = {
      name: form.name,
      description: form.description || undefined,
      expectedAmount: form.expectedAmount,
      currency: form.currency,
      incomeCategory: form.incomeCategory,
      frequency: form.frequency,
      startDate: form.startDate,
      endDate: form.endDate || undefined,
      paymentSchedule,
      matchingConfig: form.matchingConfig,
    }

    if (props.mode === 'create') {
      await $fetch('/api/income-forecasting', {
        method: 'POST',
        body: payload,
      })

      toast.add({
        title: '建立成功',
        description: '收入預測項目已成功建立',
        color: 'green',
      })
    }
    else {
      await $fetch(`/api/income-forecasting/${props.item?._id}`, {
        method: 'PUT',
        body: payload,
      })

      toast.add({
        title: '更新成功',
        description: '收入預測項目已成功更新',
        color: 'green',
      })
    }

    emit('success')
  }
  catch (error: any) {
    console.error('提交失敗:', error)
    toast.add({
      title: props.mode === 'create' ? '建立失敗' : '更新失敗',
      description: error.data?.message || '操作失敗，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isSubmitting.value = false
  }
}

function closeModal() {
  if (isSubmitting.value) return
  isOpen.value = false
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    if (props.mode === 'edit' && props.item) {
      populateForm(props.item)
    }
    else {
      resetForm()
    }
  }
})

// Lifecycle
onMounted(() => {
  loadCategories()
})
</script>
