<template>
  <div class="min-h-screen bg-gradient-soft flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0 bg-gradient-brand opacity-5" />
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-r from-primary-100/20 to-primary-200/20 blur-3xl" />

    <div class="relative max-w-md w-full space-y-8">
      <!-- Logo & Header -->
      <div class="text-center animate-fade-in">
        <!-- 返回首頁按鈕 -->
        <div class="mb-6">
          <NuxtLink
            to="/"
            class="inline-flex items-center text-gray-600 hover:text-primary-700 transition-colors duration-200"
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
            返回首頁
          </NuxtLink>
        </div>

        <!-- Logo -->
        <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-brand rounded-2xl mb-6 shadow-elevated">
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
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          加入 Money Flow
        </h1>
        <p class="text-gray-600 mb-2">
          創建您的財務管理帳戶
        </p>

        <!-- 平台資訊 -->
        <div class="inline-flex items-center px-3 py-1 bg-white/50 backdrop-blur-sm rounded-full border border-primary-200/50 text-xs text-gray-600 mb-8">
          <div class="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2" />
          {{ platformInfo.platform }} 平台 • {{ platformInfo.accessTokenDuration }}分鐘有效期
        </div>
      </div>

      <!-- Register Form Card -->
      <div class="card-elevated p-8 animate-slide-up">
        <form
          class="space-y-6"
          @submit.prevent="handleRegister"
        >
          <!-- 姓名 -->
          <div>
            <label
              for="name"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              姓名
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <input
                id="name"
                v-model="form.name"
                name="name"
                type="text"
                required
                autocomplete="name"
                :class="[
                  'input-base input-with-icon-left',
                  errors.name ? 'input-error' : '',
                ]"
                placeholder="請輸入您的姓名"
                :disabled="loading"
              >
            </div>
            <p
              v-if="errors.name"
              class="mt-2 text-sm text-danger-600"
            >
              {{ errors.name }}
            </p>
          </div>

          <!-- 電子郵件 -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              電子郵件
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  />
                </svg>
              </div>
              <input
                id="email"
                v-model="form.email"
                name="email"
                type="email"
                required
                autocomplete="email"
                :class="[
                  'input-base input-with-icon-left',
                  errors.email ? 'input-error' : '',
                ]"
                placeholder="請輸入您的電子郵件"
                :disabled="loading"
              >
            </div>
            <p
              v-if="errors.email"
              class="mt-2 text-sm text-danger-600"
            >
              {{ errors.email }}
            </p>
          </div>

          <!-- 密碼 -->
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              密碼
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
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
              <input
                id="password"
                v-model="form.password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                :class="[
                  'input-base input-with-icons',
                  errors.password ? 'input-error' : '',
                ]"
                placeholder="至少 8 個字元"
                :disabled="loading"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="loading"
                @click="showPassword = !showPassword"
              >
                <svg
                  v-if="showPassword"
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <p
              v-if="errors.password"
              class="mt-2 text-sm text-danger-600"
            >
              {{ errors.password }}
            </p>
          </div>

          <!-- 確認密碼 -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              確認密碼
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  class="w-5 h-5 text-gray-400"
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
              </div>
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                name="confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                :class="[
                  'input-base input-with-icons',
                  errors.confirmPassword ? 'input-error' : '',
                ]"
                placeholder="請再次輸入密碼"
                :disabled="loading"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="loading"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <svg
                  v-if="showConfirmPassword"
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5 text-gray-400 hover:text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </button>
            </div>
            <p
              v-if="errors.confirmPassword"
              class="mt-2 text-sm text-danger-600"
            >
              {{ errors.confirmPassword }}
            </p>
          </div>

          <!-- 錯誤訊息 -->
          <div
            v-if="error"
            class="bg-danger-50 border border-danger-200 rounded-lg p-4 animate-fade-in"
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
                  註冊失敗
                </h3>
                <p class="text-sm text-danger-700">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <!-- 成功訊息 -->
          <div
            v-if="success"
            class="bg-success-50 border border-success-200 rounded-lg p-4 animate-fade-in"
          >
            <div class="flex items-start">
              <svg
                class="w-5 h-5 text-success-400 mt-0.5 mr-3 flex-shrink-0"
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
              <div>
                <h3 class="text-sm font-medium text-success-800 mb-1">
                  註冊成功
                </h3>
                <p class="text-sm text-success-700">
                  {{ success }}
                </p>
              </div>
            </div>
          </div>

          <!-- 註冊按鈕 -->
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full touch-target relative overflow-hidden group"
          >
            <span
              v-if="!loading"
              class="relative z-10"
            >
              建立帳戶
            </span>
            <span
              v-else
              class="flex items-center justify-center relative z-10"
            >
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              建立中...
            </span>
            <!-- 按鈕動畫效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        <!-- 分隔線 -->
        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">已經有帳號？</span>
            </div>
          </div>
        </div>

        <!-- 登入按鈕 -->
        <div class="mt-6">
          <NuxtLink
            to="/login"
            class="btn-secondary w-full touch-target group"
          >
            <svg
              class="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200"
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
        </div>
      </div>

      <!-- 底部資訊 -->
      <div
        class="text-center text-sm text-gray-500 animate-fade-in"
        style="animation-delay: 0.2s"
      >
        <p class="mb-2">
          {{ platformInfo.description }}
        </p>
        <p class="flex items-center justify-center">
          <svg
            class="w-4 h-4 text-green-500 mr-2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fill-rule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clip-rule="evenodd"
            />
          </svg>
          安全加密連線
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { apiFetch, getTokenConfig } from '~/lib/utils/client'

// 頁面設定
definePageMeta({
  layout: false,
  auth: false,
})

// 響應式數據
const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const success = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})

// 平台資訊
const platformInfo = computed(() => getTokenConfig())

// 清除錯誤訊息
function clearErrors() {
  error.value = ''
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
}

// 驗證表單
function validateForm() {
  clearErrors()
  let isValid = true

  if (!form.name.trim()) {
    errors.name = '請輸入姓名'
    isValid = false
  }
  else if (form.name.trim().length > 50) {
    errors.name = '姓名不能超過50個字元'
    isValid = false
  }

  if (!form.email) {
    errors.email = '請輸入電子郵件'
    isValid = false
  }
  else if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(form.email)) {
    errors.email = '請輸入有效的電子郵件格式'
    isValid = false
  }

  if (!form.password) {
    errors.password = '請輸入密碼'
    isValid = false
  }
  else if (form.password.length < 8) {
    errors.password = '密碼至少需要8個字元'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '請確認密碼'
    isValid = false
  }
  else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
    isValid = false
  }

  return isValid
}

// 處理註冊
async function handleRegister() {
  if (!validateForm()) return

  loading.value = true
  clearErrors()

  try {
    const { public: { apiUrl } } = useRuntimeConfig()
    const registerUrl = `${apiUrl}/register`

    const response = await apiFetch<{
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
    }>(registerUrl, {
      method: 'POST',
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email,
        password: form.password,
      }),
    })

    if (response.success) {
      success.value = response.message || '註冊成功！正在自動登入...'

      // 註冊成功後自動登入
      try {
        const loginUrl = `${apiUrl}/login`

        const loginResponse = await apiFetch<{
          success: boolean
          message: string
          data?: {
            user: {
              id: string
              email: string
              name: string
            }
          }
        }>(loginUrl, {
          method: 'POST',
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        })

        if (loginResponse.success) {
          // 登入成功，直接導向 dashboard
          setTimeout(() => {
            navigateTo('/dashboard')
          }, 1500)
        }
        else {
          // 登入失敗，跳轉到登入頁面
          setTimeout(() => {
            navigateTo('/login')
          }, 2000)
        }
      }
      catch (loginError) {
        console.error('Auto login error:', loginError)
        // 自動登入失敗，跳轉到登入頁面
        setTimeout(() => {
          navigateTo('/login')
        }, 2000)
      }
    }
    else {
      error.value = response.message || '註冊失敗'
      if (response.errors) {
        error.value += ': ' + response.errors.join(', ')
      }
    }
  }
  catch (err) {
    console.error('Register error:', err)
    error.value = '網路錯誤，請稍後重試'
  }
  finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: '註冊 - Money Flow',
  meta: [
    { name: 'description', content: '註冊 Money Flow 個人財務管理系統' },
  ],
})
</script>
