<template>
  <div class="min-h-screen bg-gradient-soft">
    <!-- Hero Section -->
    <section class="relative overflow-hidden">
      <!-- 背景裝飾 -->
      <div class="absolute inset-0 bg-gradient-brand opacity-5" />
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-r from-primary-100/20 to-primary-200/20 blur-3xl" />

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div class="text-center animate-fade-in">
          <!-- Logo & Brand -->
          <div class="mb-8">
            <div
              class="inline-flex items-center justify-center w-20 h-20 bg-gradient-brand rounded-2xl mb-6 shadow-elevated cursor-pointer select-none transition-transform hover:scale-105"
              @click="handleLogoClick"
            >
              <svg
                class="w-10 h-10 text-white"
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
            <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 tracking-tight">
              <span class="text-brand">Money</span> Flow
            </h1>
            <p class="text-xl md:text-2xl lg:text-3xl text-gray-600 font-light mb-6">
              掌控財務，流動未來
            </p>
            <p class="text-lg text-gray-500 max-w-2xl mx-auto">
              現代化的個人財務管理系統，讓您輕鬆追蹤收支、設定預算，
              並通過智能分析實現財務目標
            </p>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <NuxtLink
              to="/login"
              class="btn-primary text-lg w-full sm:w-auto min-w-[160px]"
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
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              立即登入
            </NuxtLink>
            <NuxtLink
              to="/register"
              class="btn-secondary text-lg w-full sm:w-auto min-w-[160px]"
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              免費開始
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-20 bg-white/70 backdrop-blur-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            為什麼選擇 Money Flow
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            我們提供企業級安全性與消費級易用性的完美結合
          </p>
        </div>

        <!-- 桌面版: 網格布局 -->
        <div class="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          <!-- Feature 1: 跨平台同步 -->
          <div class="card p-8 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
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
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
              🌐 跨平台同步
            </h3>
            <p class="text-gray-600 mb-6">
              Web 與移動端無縫同步，隨時隨地管理您的財務
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                實時數據同步
              </li>
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                離線操作支援
              </li>
            </ul>
          </div>

          <!-- Feature 2: 智能分析 -->
          <div
            class="card p-8 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up"
            style="animation-delay: 0.1s"
          >
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
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
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
              📊 智能分析
            </h3>
            <p class="text-gray-600 mb-6">
              AI 驅動的財務洞察，幫您做出更明智的理財決策
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                消費模式分析
              </li>
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                預算建議推薦
              </li>
            </ul>
          </div>

          <!-- Feature 3: 安全可靠 -->
          <div
            class="card p-8 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up"
            style="animation-delay: 0.2s"
          >
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
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
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-4">
              🔒 安全可靠
            </h3>
            <p class="text-gray-600 mb-6">
              銀行級加密技術，確保您的財務資料絕對安全
            </p>
            <ul class="text-sm text-gray-500 space-y-2">
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                端到端加密
              </li>
              <li class="flex items-center">
                <svg
                  class="w-4 h-4 text-green-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill-rule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clip-rule="evenodd"
                  />
                </svg>
                雙重身份驗證
              </li>
            </ul>
          </div>
        </div>

        <!-- 移動端: 水平滑動布局 -->
        <div class="md:hidden">
          <div class="overflow-x-auto pb-4">
            <div
              class="flex gap-6 px-4"
              style="width: max-content;"
            >
              <!-- Feature 1: 跨平台同步 -->
              <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up flex-shrink-0 w-80">
                <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    class="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  🌐 跨平台同步
                </h3>
                <p class="text-gray-600 mb-4 text-sm">
                  Web 與移動端無縫同步，隨時隨地管理您的財務
                </p>
                <ul class="text-xs text-gray-500 space-y-1">
                  <li class="flex items-center">
                    <svg
                      class="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    實時數據同步
                  </li>
                  <li class="flex items-center">
                    <svg
                      class="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    離線操作支援
                  </li>
                </ul>
              </div>

              <!-- Feature 2: 智能分析 -->
              <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up flex-shrink-0 w-80">
                <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-success-500 to-success-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    class="w-7 h-7 text-white"
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
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  📊 智能分析
                </h3>
                <p class="text-gray-600 mb-4 text-sm">
                  AI 驅動的財務洞察，幫您做出更明智的理財決策
                </p>
                <ul class="text-xs text-gray-500 space-y-1">
                  <li class="flex items-center">
                    <svg
                      class="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    消費模式分析
                  </li>
                  <li class="flex items-center">
                    <svg
                      class="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    預算建議推薦
                  </li>
                </ul>
              </div>

              <!-- Feature 3: 安全可靠 -->
              <div class="card p-6 text-center group hover:shadow-elevated transition-all duration-300 animate-slide-up flex-shrink-0 w-80">
                <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-warning-500 to-warning-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    class="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 class="text-lg font-semibold text-gray-900 mb-3">
                  🔒 安全可靠
                </h3>
                <p class="text-gray-600 mb-4 text-sm">
                  銀行級加密技術，確保您的財務資料絕對安全
                </p>
                <ul class="text-xs text-gray-500 space-y-1">
                  <li class="flex items-center">
                    <svg
                      class="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    端到端加密
                  </li>
                  <li class="flex items-center">
                    <svg
                      class="w-3 h-3 text-green-500 mr-2 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    雙重身份驗證
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 滑動指示器 -->
          <div class="flex justify-center mt-6">
            <div class="flex items-center space-x-2">
              <div class="w-8 h-1 bg-primary-300 rounded-full" />
              <div class="w-2 h-1 bg-gray-300 rounded-full" />
              <div class="w-2 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Platform Comparison Section -->
    <section class="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            針對不同平台優化
          </h2>
          <p class="text-lg text-gray-600 max-w-2xl mx-auto">
            根據使用場景智能調整，提供最佳使用體驗
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Web 版本 -->
          <div class="card-elevated p-8 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-primary-600/10 rounded-full -translate-y-16 translate-x-16" />
            <div class="relative">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-gradient-brand rounded-xl flex items-center justify-center mr-4">
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
                      d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">
                    🌐 Web 版本
                  </h3>
                  <p class="text-gray-500">
                    安全性優先設計
                  </p>
                </div>
              </div>
              <ul class="space-y-3 text-gray-600">
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                  Access Token: 15 分鐘有效期
                </li>
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                  Refresh Token: 7 天有效期
                </li>
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                  短期 Token，增強安全性
                </li>
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-primary-500 rounded-full mr-3" />
                  適合辦公環境和共用設備
                </li>
              </ul>
            </div>
          </div>

          <!-- Mobile 版本 -->
          <div class="card-elevated p-8 relative overflow-hidden group">
            <div class="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-success-500/10 to-success-600/10 rounded-full -translate-y-16 translate-x-16" />
            <div class="relative">
              <div class="flex items-center mb-6">
                <div class="w-12 h-12 bg-gradient-success rounded-xl flex items-center justify-center mr-4">
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
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-bold text-gray-900">
                    📱 移動端 (Tauri)
                  </h3>
                  <p class="text-gray-500">
                    使用體驗優化
                  </p>
                </div>
              </div>
              <ul class="space-y-3 text-gray-600">
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-success-500 rounded-full mr-3" />
                  Access Token: 1 小時有效期
                </li>
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-success-500 rounded-full mr-3" />
                  Refresh Token: 30 天有效期
                </li>
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-success-500 rounded-full mr-3" />
                  延長 Token，減少登入頻率
                </li>
                <li class="flex items-center">
                  <div class="w-2 h-2 bg-success-500 rounded-full mr-3" />
                  適合個人設備頻繁使用
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 bg-gradient-brand text-white relative overflow-hidden">
      <div class="absolute inset-0 bg-black/10" />
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-r from-white/5 to-white/10 blur-3xl" />

      <div class="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <div class="animate-fade-in">
          <h2 class="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            準備好掌控您的財務了嗎？
          </h2>
          <p class="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            加入 Money Flow，開始您的智能理財之旅。
            完全免費，立即體驗。
          </p>
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <NuxtLink
              to="/register"
              class="inline-flex items-center px-8 py-4 bg-white text-primary-800 font-semibold rounded-xl hover:bg-gray-100 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 w-full sm:w-auto"
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
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              免費開始使用
            </NuxtLink>
            <NuxtLink
              to="/login"
              class="inline-flex items-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-primary-800 transition-all duration-200 w-full sm:w-auto"
            >
              已有帳號？登入
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- 配置資訊彈窗 -->
    <ConfigInfoModal
      :show="showConfigModal"
      @close="closeConfigModal"
      @open-debug="openDebugFromConfig"
    />
  </div>
</template>

<script setup lang="ts">
// Logo 點擊調試觸發器
import { detectCurrentPlatform } from '~/lib/utils/client'
import { authenticatedFetch } from '~/lib/utils/auth'

const { handleLogoClick, showConfigModal, closeConfigModal, openDebugFromConfig } = useDebugTrigger()

// 頁面設定
definePageMeta({
  layout: false,
  auth: false,
})

// 檢查用戶是否已登入，如果是則導向 dashboard
let isChecking = false // 防止重複檢查
onMounted(async () => {
  if (isChecking) return
  isChecking = true

  try {
    const platform = detectCurrentPlatform()
    console.log(JSON.stringify({ page: 'index', action: 'auth_check', platform }))

    const response = await authenticatedFetch<{
      success: boolean
      message: string
      data?: {
        user: {
          id: string
          email: string
          name: string
        }
      }
      errors?: string[]
      requireLogin?: boolean
      error?: string
    }>('/api/auth/me')

    console.log(JSON.stringify({ page: 'index', action: 'auth_response', authenticated: !!response }))

    if (response.success && response.data?.user) {
      console.log(JSON.stringify({ page: 'index', action: 'redirect_authenticated_user' }))
      // 用戶已登入，導向 dashboard
      await navigateTo('/dashboard', { replace: true })
    }
  }
  catch (error) {
    // 檢查是否需要重新登入
    if (error instanceof Error && error.message === 'REQUIRE_LOGIN') {
      // 對於首頁，不自動跳轉，讓用戶手動點擊登入
    }
  }
  finally {
    isChecking = false
  }
})

// SEO
useHead({
  title: 'Money Flow - 個人財務管理系統',
  meta: [
    { name: 'description', content: 'Money Flow 是一個跨平台的個人財務管理系統，支援 Web 和移動端應用' },
  ],
})
</script>
