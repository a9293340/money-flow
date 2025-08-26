<template>
  <header class="bg-white/95 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16">
        <!-- Left: Hamburger Menu & Logo -->
        <div class="flex items-center space-x-3">
          <!-- Hamburger Menu Button -->
          <button
            class="p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            aria-label="開啟選單"
            @click="toggleMenu"
          >
            <svg
              class="w-6 h-6 transition-transform duration-200"
              :class="{ 'rotate-90': isMenuOpen }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <!-- Logo -->
          <NuxtLink
            to="/dashboard"
            class="flex items-center space-x-3 group"
          >
            <div
              class="inline-flex items-center justify-center w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm group-hover:scale-105 transition-transform duration-200"
            >
              <svg
                class="w-5 h-5 text-white"
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
            <div class="hidden sm:block">
              <h1 class="text-lg font-bold text-gray-900">
                <span class="text-blue-600">Money</span> Flow
              </h1>
            </div>
          </NuxtLink>
        </div>

        <!-- Right: User Menu -->
        <div class="flex items-center space-x-3">
          <!-- User Avatar & Menu -->
          <div class="relative">
            <button
              class="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              @click="toggleUserMenu"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <span class="text-white text-sm font-semibold">
                  {{ userInitial }}
                </span>
              </div>
              <span class="hidden sm:block text-sm font-medium">{{ userName }}</span>
              <svg
                class="w-4 h-4 transition-transform duration-200"
                :class="{ 'rotate-180': isUserMenuOpen }"
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

            <!-- User Dropdown Menu -->
            <Transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <div
                v-show="isUserMenuOpen"
                class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
              >
                <button
                  class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  @click="handleLogout"
                >
                  <span class="flex items-center">
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
                    登出
                  </span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>

    <!-- Hamburger Menu Overlay -->
    <Transition
      enter-active-class="transition-opacity ease-linear duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity ease-linear duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-show="isMenuOpen"
        class="fixed inset-0 z-[60] bg-black bg-opacity-50"
        style="position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100vw !important; height: 100vh !important; background-color: rgba(0, 0, 0, 0.5) !important; pointer-events: auto !important;"
        @click="closeMenu"
      />
    </Transition>

    <!-- Hamburger Menu Panel -->
    <Transition
      enter-active-class="transition ease-in-out duration-300 transform"
      enter-from-class="-translate-x-full"
      enter-to-class="translate-x-0"
      leave-active-class="transition ease-in-out duration-300 transform"
      leave-from-class="translate-x-0"
      leave-to-class="-translate-x-full"
    >
      <div
        v-show="isMenuOpen"
        class="fixed top-0 left-0 z-[70] w-64 h-screen bg-white shadow-xl"
      >
        <!-- 選單內容容器 -->
        <div class="flex flex-col h-full bg-white">
          <!-- 選單頭部 -->
          <div class="p-4 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
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
                  <h2 class="text-lg font-bold text-gray-900">
                    <span class="text-blue-600">Money</span> Flow
                  </h2>
                  <p class="text-xs text-gray-500">
                    財務管理系統
                  </p>
                </div>
              </div>
              <button
                class="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none"
                @click="closeMenu"
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

          <!-- 導航選單 -->
          <nav class="flex-1 p-4 space-y-2 bg-white overflow-y-auto">
            <NuxtLink
              v-for="item in menuItems"
              :key="item.name"
              :to="item.path"
              class="flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors group"
              :class="{ 'bg-blue-50 text-blue-700': $route.path === item.path }"
              @click="closeMenu"
            >
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                :class="$route.path === item.path ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'"
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
                    :d="iconMap[item.icon]"
                  />
                </svg>
              </div>
              <span class="font-medium">{{ item.name }}</span>
            </NuxtLink>
          </nav>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Props {
  user?: {
    name?: string
    email?: string
  } | null
}

const props = withDefaults(defineProps<Props>(), {
  user: null,
})

// Reactive state
const isMenuOpen = ref(false)
const isUserMenuOpen = ref(false)

// Computed
const userName = computed(() => props.user?.name || props.user?.email || 'User')
const userInitial = computed(() => {
  const name = userName.value
  return name.charAt(0).toUpperCase()
})

// Menu items with inline SVG
const menuItems = [
  {
    name: '儀表板',
    path: '/dashboard',
    icon: 'dashboard',
  },
  {
    name: '記帳管理',
    path: '/records',
    icon: 'records',
  },
  {
    name: '預算管理',
    path: '/budgets',
    icon: 'budgets',
  },
  {
    name: '收入預測',
    path: '/income-forecasting',
    icon: 'income-forecasting',
  },
  {
    name: 'AI 智能分析',
    path: '/ai-insights',
    icon: 'ai-insights',
  },
  {
    name: 'AI 財務規劃',
    path: '/financial-planning',
    icon: 'financial-planning',
  },
  {
    name: '分類設定',
    path: '/categories',
    icon: 'categories',
  },
  {
    name: '財務分析',
    path: '/analytics',
    icon: 'analytics',
  },
]

// Icon component maps
const iconMap: Record<string, string> = {
  'dashboard': 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2zM8 5a2 2 0 012-2h2a2 2 0 012 2v6H8V5z',
  'records': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  'budgets': 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z',
  'income-forecasting': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  'ai-insights': 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
  'financial-planning': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  'categories': 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
  'analytics': 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
}

// Methods
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
  isUserMenuOpen.value = false
}

const closeMenu = () => {
  isMenuOpen.value = false
}

const toggleUserMenu = () => {
  isUserMenuOpen.value = !isUserMenuOpen.value
  isMenuOpen.value = false
}

const handleLogout = async () => {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    await navigateTo('/login')
  }
  catch (error) {
    console.error('登出失敗:', error)
  }
}

// Close menus when clicking outside
const handleClickOutside = (event: Event) => {
  const target = event.target as Element
  if (!target.closest('.relative')) {
    isUserMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
