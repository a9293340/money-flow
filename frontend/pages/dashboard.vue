<template>
  <div class="min-h-screen bg-gradient-soft">
    <!-- Navigation Header -->
    <header class="bg-white/70 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo & Brand -->
          <div class="flex items-center space-x-4">
            <div
              class="inline-flex items-center justify-center w-10 h-10 bg-gradient-brand rounded-xl shadow-card cursor-pointer select-none transition-transform hover:scale-105"
              @click="handleLogoClick"
            >
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
            <div>
              <h1 class="text-xl font-bold text-gray-900">
                <span class="text-brand">Money</span> Flow
              </h1>
              <p class="text-xs text-gray-500">
                財務管理系統
              </p>
            </div>
          </div>

          <!-- User Menu -->
          <div class="flex items-center space-x-4">
            <!-- Platform Info -->
            <div class="hidden md:flex items-center px-3 py-1 bg-primary-50/50 rounded-full text-xs text-primary-700">
              <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
              {{ platformInfo.platform }} 平台
            </div>

            <!-- User Avatar & Name -->
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-medium">
                  {{ user?.name?.charAt(0)?.toUpperCase() || 'U' }}
                </span>
              </div>
              <div class="hidden sm:block">
                <p class="text-sm font-medium text-gray-900">
                  {{ user?.name || 'Loading...' }}
                </p>
                <p class="text-xs text-gray-500">
                  {{ user?.email }}
                </p>
              </div>
            </div>

            <!-- Logout Button -->
            <button
              :disabled="loading"
              class="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-colors duration-200"
              @click="handleLogout"
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span v-if="!loading">登出</span>
              <span v-else>登出中...</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Welcome Section -->
      <div class="mb-8 animate-fade-in">
        <div class="text-center">
          <h2 class="text-3xl font-bold text-gray-900 mb-2">
            歡迎回來，{{ user?.name || 'Loading...' }}
          </h2>
          <p class="text-gray-600">
            {{ formatWelcomeTime() }}，管理您的財務數據
          </p>
        </div>
      </div>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Financial Overview Cards (Left Column) -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Stats Cards Row -->
          <!-- 桌面版: 網格布局 -->
          <div class="hidden sm:grid grid-cols-1 sm:grid-cols-3 gap-4">
            <!-- Total Balance -->
            <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up">
              <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
              <h3 class="text-2xl font-bold text-gray-900 mb-1">
                $0
              </h3>
              <p class="text-sm text-gray-500">
                總餘額
              </p>
            </div>

            <!-- This Month Income -->
            <div
              class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up"
              style="animation-delay: 0.1s"
            >
              <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
              <h3 class="text-2xl font-bold text-success-700 mb-1">
                $0
              </h3>
              <p class="text-sm text-gray-500">
                本月收入
              </p>
            </div>

            <!-- This Month Expenses -->
            <div
              class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up"
              style="animation-delay: 0.2s"
            >
              <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
              <h3 class="text-2xl font-bold text-danger-700 mb-1">
                $0
              </h3>
              <p class="text-sm text-gray-500">
                本月支出
              </p>
            </div>
          </div>

          <!-- 移動端: 水平滑動布局 -->
          <div class="sm:hidden">
            <div class="overflow-x-auto pb-4">
              <div
                class="flex gap-4 px-4"
                style="width: max-content;"
              >
                <!-- Total Balance -->
                <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up flex-shrink-0 w-72">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
                  <h3 class="text-2xl font-bold text-gray-900 mb-1">
                    $0
                  </h3>
                  <p class="text-sm text-gray-500">
                    總餘額
                  </p>
                </div>

                <!-- This Month Income -->
                <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up flex-shrink-0 w-72">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-success-500 to-success-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
                  <h3 class="text-2xl font-bold text-success-700 mb-1">
                    $0
                  </h3>
                  <p class="text-sm text-gray-500">
                    本月收入
                  </p>
                </div>

                <!-- This Month Expenses -->
                <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up flex-shrink-0 w-72">
                  <div class="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-danger-500 to-danger-600 rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300">
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
                  <h3 class="text-2xl font-bold text-danger-700 mb-1">
                    $0
                  </h3>
                  <p class="text-sm text-gray-500">
                    本月支出
                  </p>
                </div>
              </div>
            </div>

            <!-- 滑動指示器 -->
            <div class="flex justify-center mt-4">
              <div class="flex items-center space-x-2">
                <div class="w-6 h-1 bg-primary-300 rounded-full" />
                <div class="w-2 h-1 bg-gray-300 rounded-full" />
                <div class="w-2 h-1 bg-gray-300 rounded-full" />
              </div>
            </div>
          </div>

          <!-- Recent Transactions -->
          <div
            class="card p-6 animate-slide-up"
            style="animation-delay: 0.3s"
          >
            <div class="flex items-center justify-between mb-6">
              <h3 class="text-lg font-semibold text-gray-900">
                近期交易
              </h3>
              <button class="btn-secondary text-sm px-4 py-2">
                查看全部
              </button>
            </div>

            <!-- Empty State -->
            <div class="text-center py-12">
              <div class="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg
                  class="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h4 class="text-lg font-medium text-gray-900 mb-2">
                尚無交易紀錄
              </h4>
              <p class="text-gray-500 mb-6">
                開始新增您的第一筆收支記錄
              </p>
              <button class="btn-primary px-6 py-3">
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                新增交易
              </button>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="space-y-6">
          <!-- User Profile Card -->
          <div
            class="card p-6 animate-slide-up"
            style="animation-delay: 0.4s"
          >
            <div
              v-if="userError"
              class="bg-danger-50 border border-danger-200 rounded-lg p-4 mb-4"
            >
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-danger-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <div>
                  <h3 class="text-sm font-medium text-danger-800 mb-1">
                    載入失敗
                  </h3>
                  <p class="text-sm text-danger-700">
                    {{ userError }}
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="user"
              class="space-y-4"
            >
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span class="text-white text-lg font-semibold">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">
                    {{ user.name }}
                  </h3>
                  <p class="text-sm text-gray-500">
                    {{ user.email }}
                  </p>
                </div>
              </div>

              <div class="space-y-3 pt-4 border-t border-gray-100">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">電子郵件驗證</span>
                  <span
                    :class="user.emailVerified ? 'text-success-600' : 'text-danger-600'"
                    class="font-medium"
                  >
                    {{ user.emailVerified ? '已驗證' : '未驗證' }}
                  </span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">註冊時間</span>
                  <span class="text-gray-900">{{ formatDate(user.createdAt) }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">最後登入</span>
                  <span class="text-gray-900">{{ formatDate(user.lastLoginAt) }}</span>
                </div>
              </div>
            </div>

            <div
              v-else-if="!userError"
              class="text-center py-6"
            >
              <svg
                class="animate-spin h-8 w-8 text-primary-600 mx-auto"
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
              <p class="mt-2 text-sm text-gray-500">
                載入使用者資訊中...
              </p>
            </div>
          </div>

          <!-- Platform Info Card -->
          <div
            class="card p-6 animate-slide-up"
            style="animation-delay: 0.5s"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              平台資訊
            </h3>
            <div class="space-y-3">
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">當前平台</span>
                <span class="text-gray-900 font-medium">{{ platformInfo.platform }}</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">Token 有效期</span>
                <span class="text-gray-900">{{ platformInfo.accessTokenDuration }}分鐘</span>
              </div>
              <div class="flex justify-between text-sm">
                <span class="text-gray-500">刷新週期</span>
                <span class="text-gray-900">{{ Math.floor(platformInfo.refreshTokenDuration / (24 * 60)) }}天</span>
              </div>
              <div class="pt-3 border-t border-gray-100">
                <p class="text-xs text-gray-500">
                  {{ platformInfo.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div
            class="card p-6 animate-slide-up"
            style="animation-delay: 0.6s"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              快速操作
            </h3>
            <div class="space-y-3">
              <button class="w-full btn-primary text-left px-4 py-3">
                <svg
                  class="w-5 h-5 mr-3 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                新增交易
              </button>
              <button class="w-full btn-secondary text-left px-4 py-3">
                <svg
                  class="w-5 h-5 mr-3 inline-block"
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
                查看報告
              </button>
              <button class="w-full btn-secondary text-left px-4 py-3">
                <svg
                  class="w-5 h-5 mr-3 inline-block"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                帳戶設定
              </button>
            </div>
          </div>

          <!-- Debug & API Testing -->
          <div
            class="card p-6 animate-slide-up"
            style="animation-delay: 0.7s"
          >
            <h3 class="text-lg font-semibold text-gray-900 mb-4">
              <svg
                class="w-5 h-5 inline-block mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              調試 & API 測試
            </h3>
            <div class="space-y-3">
              <button
                class="w-full btn-secondary text-left px-4 py-2"
                @click="showDebugInfo = !showDebugInfo"
              >
                {{ showDebugInfo ? '隱藏' : '顯示' }}調試資訊
              </button>
              <button
                :disabled="testing"
                class="w-full btn-secondary text-left px-4 py-2 disabled:opacity-50"
                @click="testAuthMe"
              >
                測試使用者資訊
              </button>
              <button
                :disabled="testing"
                class="w-full btn-secondary text-left px-4 py-2 disabled:opacity-50"
                @click="testRefreshToken"
              >
                測試 Token 刷新
              </button>

              <div
                v-if="testResult"
                class="mt-4 p-3 bg-gray-50 rounded-lg"
              >
                <h4 class="font-medium text-gray-900 mb-2 text-sm">
                  測試結果:
                </h4>
                <pre class="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">{{ testResult }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 調試資訊面板 -->
    <div
      v-if="showDebugInfo"
      class="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end"
      @click="showDebugInfo = false"
    >
      <div
        class="bg-white w-full max-h-96 overflow-y-auto p-4"
        @click.stop
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold">
            🐛 調試資訊
          </h3>
          <div class="flex items-center space-x-3">
            <div
              v-if="countdown > 0"
              class="text-sm text-red-600 font-bold"
            >
              ⏱️ {{ countdown }}秒後跳轉
            </div>
            <button
              class="text-gray-500 hover:text-gray-700 text-xl"
              @click="showDebugInfo = false"
            >
              ×
            </button>
          </div>
        </div>
        <div class="space-y-2 text-xs font-mono">
          <div
            v-for="(message, index) in debugMessages"
            :key="index"
            class="border-b border-gray-200 pb-2"
          >
            <div class="text-gray-500">
              {{ formatTime(message.timestamp) }}
            </div>
            <div :class="getMessageClass(message.type)">
              {{ message.message }}
            </div>
            <div
              v-if="message.data"
              class="text-gray-700 mt-1 whitespace-pre-wrap"
            >
              {{ formatData(message.data) }}
            </div>
          </div>
        </div>
        <div class="mt-4 flex space-x-2">
          <button
            class="btn-secondary text-sm px-4 py-2"
            @click="clearDebugMessages"
          >
            清除訊息
          </button>
          <button
            v-if="countdown > 0"
            class="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600"
            @click="stopCountdown"
          >
            停止跳轉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch, getTokenConfig, getApiUrl, detectCurrentPlatform } from '~/lib/utils/client'
import { authenticatedFetch, handleRequireLogin } from '~/lib/utils/auth'
import { debugInfo, debugWarn, debugError, debugSuccess, mobileDebug } from '~/lib/utils/mobile-debug'

// Logo 點擊調試觸發器
const { handleLogoClick } = useDebugTrigger()

// 頁面設定
definePageMeta({
  layout: false,
})

// 響應式數據
const user = ref<any>(null)
const userError = ref('')
const loading = ref(false)
const testing = ref(false)
const testResult = ref('')
const showDebugInfo = ref(false)
const debugMessages = ref<Array<{
  timestamp: Date
  type: 'info' | 'warn' | 'error' | 'success'
  message: string
  data?: any
}>>([])
const countdown = ref(0)
const countdownInterval = ref<NodeJS.Timeout | null>(null)

// 訂閱調試訊息
onMounted(() => {
  const unsubscribe = mobileDebug.subscribe((messages) => {
    debugMessages.value = messages
  })

  onUnmounted(() => {
    unsubscribe()
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value)
    }
  })
})

// 啟動倒數計時
function startCountdown(seconds: number, callback: () => void) {
  countdown.value = seconds

  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }

  countdownInterval.value = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
      }
      callback()
    }
  }, 1000)
}

// 平台資訊
const platformInfo = computed(() => getTokenConfig())

// 格式化日期
function formatDate(dateString: string | undefined) {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('zh-TW')
}

// 格式化歡迎時間
function formatWelcomeTime() {
  const hour = new Date().getHours()
  if (hour < 12) return '早安'
  if (hour < 18) return '午安'
  return '晚安'
}

// 載入使用者資訊
async function loadUserInfo() {
  userError.value = '' // 清除之前的錯誤

  try {
    debugInfo('🏠 Dashboard: 開始載入使用者資訊...')

    // 檢查移動端的 token 狀態
    const platform = detectCurrentPlatform()
    if (platform === 'mobile') {
      const accessToken = localStorage.getItem('access_token')
      const refreshToken = localStorage.getItem('refresh_token')

      // 解碼 JWT token 來檢查內容（不驗證簽名）
      let tokenPayload = null
      if (accessToken) {
        try {
          const payloadBase64 = accessToken.split('.')[1]
          const payload = JSON.parse(atob(payloadBase64))
          tokenPayload = payload
        }
        catch (e) {
          debugWarn('⚠️ JWT token 解碼失敗', e)
        }
      }

      debugInfo('📱 移動端 Token 狀態檢查', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        tokenPayload: tokenPayload
          ? {
              userId: tokenPayload.userId,
              email: tokenPayload.email,
              exp: new Date(tokenPayload.exp * 1000).toLocaleString(),
              isExpired: tokenPayload.exp * 1000 < Date.now(),
            }
          : null,
      })
    }

    // 直接使用 authenticatedFetch，它會自動處理 token 刷新
    const response = await authenticatedFetch<{
      success: boolean
      message: string
      data?: {
        user: Record<string, unknown>
      }
      requireLogin?: boolean
      errors?: string[]
    }>('/api/auth/me')

    debugSuccess('✅ Dashboard: 認證檢查結果', response)

    if (response.success && response.data?.user) {
      user.value = response.data.user
      debugSuccess('✅ Dashboard: 使用者資訊載入成功')
    }
    else if (response.requireLogin) {
      debugError('❌ Dashboard: 需要重新登入')
      userError.value = '需要重新登入'

      // 移動端給予時間查看調試資訊
      if (platform === 'mobile') {
        debugWarn('🔍 移動端：10秒後跳轉到登入頁，請查看調試資訊')
        showDebugInfo.value = true // 自動顯示調試面板
        startCountdown(10, () => {
          handleRequireLogin()
        })
      }
      else {
        handleRequireLogin()
      }
    }
    else {
      debugWarn('⚠️ Dashboard: 認證失敗，但不需要重新登入', response.message)
      userError.value = response.message || '載入使用者資訊失敗'
    }
  }
  catch (error) {
    debugError('❌ Dashboard: 載入使用者資訊錯誤', error)

    if (error instanceof Error && error.message === 'REQUIRE_LOGIN') {
      debugError('❌ Dashboard: Token 刷新失敗，需要重新登入')
      userError.value = 'Token 已過期，請重新登入'

      // 移動端給予時間查看調試資訊
      const currentPlatform = detectCurrentPlatform()
      if (currentPlatform === 'mobile') {
        debugWarn('🔍 移動端：10秒後跳轉到登入頁，請查看調試資訊')
        showDebugInfo.value = true // 自動顯示調試面板
        startCountdown(10, () => {
          handleRequireLogin()
        })
      }
      else {
        handleRequireLogin()
      }
    }
    else {
      debugWarn('⚠️ Dashboard: 其他載入錯誤', String(error))
      userError.value = '載入使用者資訊失敗'
      // 對於非認證錯誤，不自動重定向
    }
  }
}

// 處理登出
async function handleLogout() {
  loading.value = true
  try {
    const apiUrl = getApiUrl()
    const logoutUrl = `${apiUrl}/logout`

    await apiFetch(logoutUrl, { method: 'POST' })
    navigateTo('/login')
  }
  catch (error) {
    console.error('Logout error:', error)
    // 即使登出失敗也跳轉到登入頁面
    navigateTo('/login')
  }
  finally {
    loading.value = false
  }
}

// 測試 /api/auth/me (使用自動刷新功能)
async function testAuthMe() {
  testing.value = true
  try {
    const apiUrl = getApiUrl()
    const authMeUrl = `${apiUrl}/auth/me`

    const response = await authenticatedFetch<Record<string, unknown>>(authMeUrl)
    testResult.value = JSON.stringify(response, null, 2)
  }
  catch (error) {
    if (error instanceof Error && error.message === 'REQUIRE_LOGIN') {
      testResult.value = '需要重新登入'
    }
    else {
      testResult.value = `錯誤: ${error}`
    }
  }
  finally {
    testing.value = false
  }
}

// 測試 Token 刷新
async function testRefreshToken() {
  testing.value = true
  try {
    const apiUrl = getApiUrl()
    const refreshUrl = `${apiUrl}/auth/refresh`

    const response = await apiFetch<Record<string, unknown>>(refreshUrl, { method: 'POST' })
    testResult.value = JSON.stringify(response, null, 2)
  }
  catch (error) {
    testResult.value = `錯誤: ${error}`
  }
  finally {
    testing.value = false
  }
}

// 調試面板相關函數
function formatTime(date: Date) {
  return date.toLocaleTimeString('zh-TW', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function formatData(data: any) {
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  return String(data)
}

function getMessageClass(type: string) {
  switch (type) {
    case 'error': return 'text-red-600'
    case 'warn': return 'text-yellow-600'
    case 'success': return 'text-green-600'
    default: return 'text-blue-600'
  }
}

function clearDebugMessages() {
  mobileDebug.clear()
}

function stopCountdown() {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
    countdownInterval.value = null
  }
  countdown.value = 0
  debugInfo('⏹️ 倒數計時已停止，不會自動跳轉')
}

// 頁面載入時獲取使用者資訊
onMounted(() => {
  loadUserInfo()
})

// SEO
useHead({
  title: 'Dashboard - Money Flow',
  meta: [
    { name: 'description', content: 'Money Flow 個人財務管理系統 Dashboard' },
  ],
})
</script>
