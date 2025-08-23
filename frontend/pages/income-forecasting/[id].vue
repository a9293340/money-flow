<template>
  <div class="min-h-screen bg-background">
    <!-- App Header -->
    <AppHeader :user="user" />

    <!-- Breadcrumb (只在非子路由時顯示) -->
    <div
      v-if="!route.path.includes('/periods/')"
      class="border-b border-border bg-card"
    >
      <div class="container mx-auto px-4 py-4">
        <nav class="flex items-center gap-2 text-sm text-muted-foreground">
          <NuxtLink
            to="/income-forecasting"
            class="hover:text-foreground"
          >
            收入預測管理
          </NuxtLink>
          <svg
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
          <span class="text-foreground">{{ forecasting?.name || '載入中...' }}</span>
        </nav>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="container mx-auto px-4 py-8"
    >
      <div class="animate-pulse space-y-6">
        <div class="h-8 w-64 rounded bg-muted" />
        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="i in 3"
            :key="i"
            class="h-32 rounded-lg bg-muted"
          />
        </div>
        <div class="h-64 rounded-lg bg-muted" />
      </div>
    </div>

    <!-- 子路由內容 (期間詳情) -->
    <NuxtPage v-if="route.path.includes('/periods/')" />

    <!-- 父頁面內容 (收入預測詳情) -->
    <div
      v-else-if="forecasting"
      class="container mx-auto px-4 py-8"
    >
      <!-- Header -->
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-foreground">
              {{ forecasting.name }}
            </h1>
            <span
              :class="[
                'inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium',
                forecasting.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ forecasting.isActive ? '啟用' : '停用' }}
            </span>
          </div>
          <p
            v-if="forecasting.description"
            class="text-muted-foreground"
          >
            {{ forecasting.description }}
          </p>
        </div>

        <div class="flex gap-3">
          <button
            :disabled="isRefreshing"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="refreshData"
          >
            <svg
              v-if="isRefreshing"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
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
                d="m100 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm-90.288 0c0 22.249 18.039 40.288 40.288 40.288s40.288-18.039 40.288-40.288-18.039-40.288-40.288-40.288-40.288 18.039-40.288 40.288z"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            重新整理
          </button>
          <button
            v-if="forecasting.isActive && forecasting.matchingConfig?.autoMatch"
            :disabled="isMatching"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="performMatch"
          >
            <svg
              v-if="isMatching"
              class="animate-spin -ml-1 mr-2 h-4 w-4"
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
                d="m100 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm-90.288 0c0 22.249 18.039 40.288 40.288 40.288s40.288-18.039 40.288-40.288-18.039-40.288-40.288-40.288-40.288 18.039-40.288 40.288z"
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
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            執行匹配
          </button>
          <button
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            @click="openGeneratePeriodsModal"
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            生成期間
          </button>
          <div class="relative">
            <button
              class="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="toggleActionDropdown"
            >
              <svg
                class="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>

            <div
              v-if="showActionDropdown"
              class="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
            >
              <div class="py-1">
                <button
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  @click="handleEditAction"
                >
                  <svg
                    class="mr-3 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                  編輯項目
                </button>
                <button
                  class="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  @click="handleBackToList"
                >
                  <svg
                    class="mr-3 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  返回列表
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="mb-8 grid gap-6 md:grid-cols-4">
        <div class="rounded-lg border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                預期金額
              </p>
              <p class="text-2xl font-bold text-green-600">
                {{ formatCurrency(forecasting.expectedAmount, forecasting.currency) }}
              </p>
              <p class="text-xs text-muted-foreground">
                {{ getFrequencyLabel(forecasting.frequency) }}
              </p>
            </div>
            <svg
              class="h-8 w-8 text-green-600"
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
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                追蹤期間
              </p>
              <p class="text-2xl font-bold text-blue-600">
                {{ forecasting.statistics?.totalPeriods || 0 }}
              </p>
              <p class="text-xs text-muted-foreground">
                已生成
              </p>
            </div>
            <svg
              class="h-8 w-8 text-blue-600"
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
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                匹配記錄
              </p>
              <p class="text-2xl font-bold text-orange-600">
                {{ forecasting.statistics?.matchedRecords || 0 }}
              </p>
              <p class="text-xs text-muted-foreground">
                筆收入
              </p>
            </div>
            <svg
              class="h-8 w-8 text-orange-600"
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
          </div>
        </div>

        <div class="rounded-lg border border-border bg-card p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-muted-foreground">
                準確度
              </p>
              <p class="text-2xl font-bold text-purple-600">
                {{ forecasting.statistics?.averageAccuracy || 0 }}%
              </p>
              <p class="text-xs text-muted-foreground">
                平均值
              </p>
            </div>
            <svg
              class="h-8 w-8 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
              />
            </svg>
          </div>
        </div>
      </div>

      <!-- Configuration Details -->
      <div class="mb-8 grid gap-6 md:grid-cols-2">
        <!-- Basic Info -->
        <div class="rounded-lg border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">
            基本資訊
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">收入分類:</span>
              <span class="font-medium">{{ getCategoryDisplay(forecasting.incomeCategory) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">頻率:</span>
              <span class="font-medium">{{ getFrequencyLabel(forecasting.frequency) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">開始日期:</span>
              <span class="font-medium">{{ forecasting.startDate ? formatDate(forecasting.startDate) : '未設定' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">結束日期:</span>
              <span class="font-medium">
                {{ forecasting.endDate ? formatDate(forecasting.endDate) : '無期限' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Matching Config -->
        <div class="rounded-lg border border-border bg-card p-6">
          <h3 class="mb-4 text-lg font-semibold">
            匹配設定
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-muted-foreground">自動匹配:</span>
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  forecasting.matchingConfig?.autoMatch ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                ]"
              >
                {{ forecasting.matchingConfig?.autoMatch ? '啟用' : '停用' }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">金額容差:</span>
              <span class="font-medium">±{{ forecasting.matchingConfig?.amountTolerance || 0 }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">日期容差:</span>
              <span class="font-medium">±{{ forecasting.matchingConfig?.dateTolerance || 0 }} 天</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted-foreground">最後更新:</span>
              <span class="font-medium">{{ forecasting.updatedAt ? formatDate(forecasting.updatedAt) : '未知' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Periods List -->
      <div class="rounded-lg border border-border bg-card">
        <div class="border-b border-border p-6">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              追蹤期間
            </h3>
            <div class="flex gap-2">
              <button
                :disabled="isLoadingPeriods"
                class="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md shadow-sm text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                @click="loadPeriods"
              >
                <svg
                  v-if="isLoadingPeriods"
                  class="animate-spin -ml-1 mr-1.5 h-3 w-3"
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
                    d="m100 50c0 27.614-22.386 50-50 50s-50-22.386-50-50 22.386-50 50-50 50 22.386 50 50zm-90.288 0c0 22.249 18.039 40.288 40.288 40.288s40.288-18.039 40.288-40.288-18.039-40.288-40.288-40.288-40.288 18.039-40.288 40.288z"
                  />
                </svg>
                <svg
                  v-else
                  class="-ml-1 mr-1.5 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                重新載入
              </button>
              <button
                class="inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                @click="openGeneratePeriodsModal"
              >
                <svg
                  class="-ml-1 mr-1.5 h-3 w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                生成期間
              </button>
            </div>
          </div>
        </div>

        <div class="p-6">
          <div
            v-if="isLoadingPeriods"
            class="space-y-4"
          >
            <div
              v-for="i in 3"
              :key="i"
              class="animate-pulse rounded-lg border border-border p-4"
            >
              <div class="flex justify-between">
                <div class="space-y-2">
                  <div class="h-4 w-32 rounded bg-muted" />
                  <div class="h-3 w-48 rounded bg-muted" />
                </div>
                <div class="h-6 w-20 rounded bg-muted" />
              </div>
            </div>
          </div>

          <div
            v-else-if="periods.length === 0"
            class="py-12 text-center"
          >
            <svg
              class="mx-auto h-12 w-12 text-gray-400"
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
            <h4 class="mt-4 text-lg font-medium text-foreground">
              尚無追蹤期間
            </h4>
            <p class="mt-2 text-muted-foreground">
              生成您的第一個追蹤期間來開始收入匹配
            </p>
            <button
              class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              @click="openGeneratePeriodsModal"
            >
              生成期間
            </button>
          </div>

          <div
            v-else
            class="space-y-4"
          >
            <IncomePeriodCard
              v-for="period in periods"
              :key="period._id"
              :period="period"
              @archive-record="openArchiveModal"
              @view-matches="viewPeriodMatches"
            />
          </div>

          <!-- Pagination for periods -->
          <div
            v-if="periods.length > 0 && periodsPagination.pages > 1"
            class="mt-6 flex justify-center"
          >
            <nav class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
              <div class="-mt-px flex w-0 flex-1">
                <button
                  v-if="periodsCurrentPage > 1"
                  class="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  @click="goToPreviousPage"
                >
                  <svg
                    class="mr-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  上一頁
                </button>
              </div>
              <div class="hidden md:-mt-px md:flex">
                <button
                  v-for="page in getVisiblePages()"
                  :key="page"
                  :class="[
                    'inline-flex items-center border-t-2 px-4 pt-4 text-sm font-medium',
                    page === periodsCurrentPage
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>
              <div class="-mt-px flex w-0 flex-1 justify-end">
                <button
                  v-if="periodsCurrentPage < periodsPagination.pages"
                  class="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  @click="goToNextPage"
                >
                  下一頁
                  <svg
                    class="ml-3 h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M14 5l7 7m0 0l-7 7m0-7H3"
                    />
                  </svg>
                </button>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error"
      class="container mx-auto px-4 py-12 text-center"
    >
      <svg
        class="mx-auto h-12 w-12 text-red-500"
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
      <h2 class="mt-4 text-lg font-semibold text-foreground">
        載入失敗
      </h2>
      <p class="mt-2 text-muted-foreground">
        {{ error }}
      </p>
      <button
        class="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        @click="loadData"
      >
        重試
      </button>
    </div>

    <!-- Modals -->
    <IncomeForecastingModal
      v-model="isEditModalOpen"
      :item="forecasting"
      mode="edit"
      @success="handleEditSuccess"
    />

    <GeneratePeriodsModal
      v-model="isGeneratePeriodsModalOpen"
      :forecasting-id="route.params.id as string"
      @success="handleGeneratePeriodsSuccess"
    />

    <ArchiveRecordModal
      v-model="isArchiveModalOpen"
      :forecasting-id="route.params.id as string"
      :period-id="selectedPeriod?._id"
      @success="handleArchiveSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import type { IncomeForecastingItem } from '~/lib/models/IncomeForecasting'
import type { IncomePeriod } from '~/lib/models/IncomePeriod'

// Import components explicitly
import IncomePeriodCard from '~/components/income-forecasting/IncomePeriodCard.vue'
import GeneratePeriodsModal from '~/components/income-forecasting/GeneratePeriodsModal.vue'
import ArchiveRecordModal from '~/components/income-forecasting/ArchiveRecordModal.vue'

// Meta
definePageMeta({
  title: '收入預測詳情',
  requiresAuth: true,
})

// Route
const route = useRoute()

// State
const isLoading = ref(true)
const isRefreshing = ref(false)
const isMatching = ref(false)
const isLoadingPeriods = ref(false)
const isEditModalOpen = ref(false)
const isGeneratePeriodsModalOpen = ref(false)
const isArchiveModalOpen = ref(false)
const showActionDropdown = ref(false)
const error = ref<string | null>(null)
const user = ref(null)

const forecasting = ref<IncomeForecastingItem | null>(null)
const periods = ref<IncomePeriod[]>([])
const selectedPeriod = ref<IncomePeriod | null>(null)

// Pagination for periods
const periodsCurrentPage = ref(1)
const periodsPagination = ref({
  total: 0,
  page: 1,
  limit: 10,
  pages: 1,
})

// Composables
const toast = {
  add: (options: { title: string, description?: string, color?: string }) => {
    // Simple console log for now
    console.log('Toast:', options.title, options.description)
  },
}
const { formatCurrency } = useCurrency()
const { formatDate } = useDateFormat()

// Methods
async function loadData() {
  try {
    console.log('🔍 loadData 開始 - route.params.id:', route.params.id)
    isLoading.value = true
    error.value = null

    const apiUrl = `/api/income-forecasting/${route.params.id}`
    console.log('🔍 發送 API 請求:', apiUrl)

    const response = await $fetch(apiUrl) as {
      success: boolean
      data: IncomeForecastingItem
    }

    console.log('🔍 API 響應:', response)
    console.log('🔍 Response success:', response.success)
    console.log('🔍 Response data:', response.data)

    // 修復數據結構問題 - API 返回的是 {forecasting: {...}}
    const responseData = response.data as any
    forecasting.value = responseData.forecasting || responseData
    console.log('🔍 設定後的 forecasting.value:', forecasting.value)
    console.log('🔍 Forecasting name:', forecasting.value?.name)

    // Load periods after loading main data
    await loadPeriods()
  }
  catch (err: any) {
    console.error('🔍 載入收入預測項目失敗:', err)
    console.error('🔍 錯誤詳情:', {
      message: err.message,
      statusCode: err.statusCode,
      data: err.data,
    })
    error.value = err.data?.message || '載入失敗，請稍後再試'
  }
  finally {
    isLoading.value = false
    isRefreshing.value = false
    console.log('🔍 loadData 結束 - forecasting.value:', forecasting.value?.name)
  }
}

async function loadPeriods() {
  try {
    isLoadingPeriods.value = true

    const params = new URLSearchParams({
      page: periodsCurrentPage.value.toString(),
      limit: periodsPagination.value.limit.toString(),
    })

    const response = await $fetch(`/api/income-forecasting/${route.params.id}/periods?${params}`) as {
      success: boolean
      data: {
        periods: IncomePeriod[]
        pagination: typeof periodsPagination.value
      }
    }

    periods.value = response.data.periods
    periodsPagination.value = response.data.pagination
  }
  catch (err: any) {
    console.error('載入追蹤期間失敗:', err)
    toast.add({
      title: '載入失敗',
      description: '無法載入追蹤期間',
      color: 'red',
    })
  }
  finally {
    isLoadingPeriods.value = false
  }
}

async function refreshData() {
  isRefreshing.value = true
  await loadData()
}

async function performMatch() {
  if (!forecasting.value) return

  try {
    isMatching.value = true

    const response = await $fetch(`/api/income-forecasting/${forecasting.value._id}/match`, {
      method: 'POST',
    }) as {
      success: boolean
      data: { matchedCount: number }
      message: string
    }

    toast.add({
      title: '匹配完成',
      description: response.message,
      color: 'green',
    })

    // Refresh data to show updated statistics
    await loadData()
  }
  catch (err: any) {
    console.error('智能匹配失敗:', err)
    toast.add({
      title: '匹配失敗',
      description: err.data?.message || '智能匹配失敗，請稍後再試',
      color: 'red',
    })
  }
  finally {
    isMatching.value = false
  }
}

function openGeneratePeriodsModal() {
  isGeneratePeriodsModalOpen.value = true
}

function openArchiveModal(period: IncomePeriod) {
  selectedPeriod.value = period
  isArchiveModalOpen.value = true
}

function viewPeriodMatches(period: IncomePeriod) {
  const targetPath = `/income-forecasting/${route.params.id}/periods/${period._id}`

  console.log('🔍 [導航] 開始導航到期間詳情')
  console.log('  - 目標路徑:', targetPath)
  console.log('  - 當前路徑:', route.path)
  console.log('  - 期間資料:', period)
  console.log('  - Route 物件:', route)

  if (import.meta.client) {
    console.log('  - 當前 URL:', window.location.href)
    console.log('  - Document readyState:', document.readyState)
  }

  try {
    console.log('🔍 [導航] 執行 navigateTo')
    navigateTo(targetPath)

    // 延遲檢查導航結果
    setTimeout(() => {
      console.log('🔍 [導航] 導航後檢查:')
      console.log('  - Route path:', route.path)
      if (import.meta.client) {
        console.log('  - Window location:', window.location.href)
      }
    }, 100)

    setTimeout(() => {
      console.log('🔍 [導航] 延遲檢查 (500ms):')
      console.log('  - Route path:', route.path)
      if (import.meta.client) {
        console.log('  - Window location:', window.location.href)
      }
    }, 500)
  }
  catch (error) {
    console.error('🔍 [導航] 導航錯誤:', error)
  }
}

function getCategoryDisplay(category: any): string {
  if (typeof category === 'string') {
    return category
  }
  return category?.name || '未知分類'
}

function getFrequencyLabel(frequency: string): string {
  const labels = {
    daily: '每日',
    weekly: '每週',
    monthly: '每月',
    quarterly: '每季',
    yearly: '每年',
  }
  return labels[frequency as keyof typeof labels] || frequency
}

function handleEditSuccess() {
  isEditModalOpen.value = false
  loadData()
}

function handleGeneratePeriodsSuccess() {
  isGeneratePeriodsModalOpen.value = false
  loadData()
}

function handleArchiveSuccess() {
  isArchiveModalOpen.value = false
  loadPeriods()
}

// Dropdown functions
function toggleActionDropdown() {
  showActionDropdown.value = !showActionDropdown.value
}

function handleEditAction() {
  showActionDropdown.value = false
  isEditModalOpen.value = true
}

function handleBackToList() {
  showActionDropdown.value = false
  navigateTo('/income-forecasting')
}

// Pagination functions
function getVisiblePages(): number[] {
  const current = periodsCurrentPage.value
  const total = periodsPagination.value.pages
  const pages: number[] = []

  // Show 5 pages max, centered around current page
  const start = Math.max(1, current - 2)
  const end = Math.min(total, start + 4)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
}

function goToPage(page: number) {
  if (page >= 1 && page <= periodsPagination.value.pages && page !== periodsCurrentPage.value) {
    periodsCurrentPage.value = page
    loadPeriods()
  }
}

function goToPreviousPage() {
  if (periodsCurrentPage.value > 1) {
    periodsCurrentPage.value--
    loadPeriods()
  }
}

function goToNextPage() {
  if (periodsCurrentPage.value < periodsPagination.value.pages) {
    periodsCurrentPage.value++
    loadPeriods()
  }
}

// Load user info
async function loadUser() {
  try {
    const response = await $fetch('/api/auth/me') as {
      success: boolean
      data: any
    }

    if (response.success) {
      user.value = response.data
    }
  }
  catch (error) {
    console.error('載入使用者資訊失敗:', error)
  }
}

// Lifecycle
onMounted(() => {
  loadUser()
  loadData()
})

// Head
useHead({
  title: computed(() => {
    // 如果是子路由（期間詳情），不設置標題，讓子頁面處理
    if (route.path.includes('/periods/')) {
      return ''
    }
    return forecasting.value ? `${forecasting.value.name} - 收入預測詳情` : '收入預測詳情'
  }),
})
</script>
