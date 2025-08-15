<template>
  <div class="min-h-screen bg-gradient-soft flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <!-- 背景裝飾 -->
    <div class="absolute inset-0 bg-gradient-brand opacity-5" />
    <div class="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-r from-primary-100/20 to-primary-200/20 blur-3xl" />

    <div class="relative max-w-md w-full space-y-8">
      <!-- Logo & Header -->
      <div class="text-center animate-fade-in">
        <!-- 返回登入頁按鈕 -->
        <div class="mb-6">
          <NuxtLink
            to="/login"
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
            返回登入
          </NuxtLink>
        </div>

        <!-- Logo -->
        <div
          class="inline-flex items-center justify-center w-16 h-16 bg-gradient-brand rounded-2xl mb-6 shadow-elevated cursor-pointer select-none transition-transform hover:scale-105"
          @click="handleLogoClick"
        >
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

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          忘記密碼？
        </h1>
        <p class="text-gray-600 mb-2">
          輸入您的電子郵件地址，我們將發送重置連結給您
        </p>
      </div>

      <!-- 表單卡片 -->
      <div class="card-elevated p-8 animate-slide-up">
        <!-- 成功狀態 -->
        <div
          v-if="emailSent"
          class="text-center space-y-6"
        >
          <div class="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-full mb-4">
            <svg
              class="w-8 h-8 text-success-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>

          <div class="space-y-4">
            <h2 class="text-xl font-semibold text-gray-900">
              重置連結已發送！
            </h2>
            <p class="text-gray-600">
              我們已將密碼重置連結發送至 <strong>{{ form.email }}</strong>
            </p>
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <div class="flex items-start">
                <svg
                  class="w-5 h-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div class="text-sm text-blue-700">
                  <p class="font-medium mb-1">
                    請注意：
                  </p>
                  <ul class="space-y-1 text-sm">
                    <li>• 重置連結將在 10 分鐘後過期</li>
                    <li>• 請檢查您的垃圾郵件資料夾</li>
                    <li>• 如未收到郵件，可以重新發送</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <button
              class="btn-secondary w-full"
              @click="resetForm"
            >
              重新發送
            </button>
            <NuxtLink
              to="/login"
              class="btn-primary w-full"
            >
              返回登入
            </NuxtLink>
          </div>
        </div>

        <!-- 表單 -->
        <form
          v-else
          class="space-y-6"
          @submit.prevent="handleForgotPassword"
        >
          <!-- 電子郵件 -->
          <div>
            <label
              for="email"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              電子郵件地址
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
                placeholder="請輸入您註冊時使用的電子郵件"
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
                  發送失敗
                </h3>
                <p class="text-sm text-danger-700">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <!-- 發送按鈕 -->
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full touch-target relative overflow-hidden group"
          >
            <span
              v-if="!loading"
              class="relative z-10"
            >
              發送重置連結
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
              發送中...
            </span>
            <!-- 按鈕動畫效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>

        <!-- 額外資訊 -->
        <div
          v-if="!emailSent"
          class="mt-6 text-center"
        >
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">記住密碼了？</span>
            </div>
          </div>
          <div class="mt-6">
            <NuxtLink
              to="/login"
              class="btn-secondary w-full"
            >
              返回登入
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 底部資訊 -->
      <div
        class="text-center text-sm text-gray-500 animate-fade-in"
        style="animation-delay: 0.2s"
      >
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
          安全加密傳輸
        </p>
      </div>
    </div>

    <!-- 配置資訊彈窗 -->
    <ConfigInfoModal
      :show="showConfigModal"
      @close="closeConfigModal"
      @open-debug="openDebugFromConfig"
    />
  </div>
</template>

<script setup lang="ts">
import { apiFetch, getApiUrl } from '~/lib/utils/client'

// Logo 點擊配置觸發器
const { handleLogoClick, showConfigModal, closeConfigModal, openDebugFromConfig } = useDebugTrigger()

// 頁面設定
definePageMeta({
  layout: 'auth',
  auth: false,
})

// 響應式數據
const form = reactive({
  email: '',
})

const loading = ref(false)
const error = ref('')
const emailSent = ref(false)
const errors = reactive({
  email: '',
})

// 清除錯誤訊息
function clearErrors() {
  error.value = ''
  errors.email = ''
}

// 驗證表單
function validateForm() {
  clearErrors()
  let isValid = true

  if (!form.email) {
    errors.email = '請輸入電子郵件地址'
    isValid = false
  }
  else if (!/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(form.email)) {
    errors.email = '請輸入有效的電子郵件格式'
    isValid = false
  }

  return isValid
}

// 重置表單
function resetForm() {
  form.email = ''
  emailSent.value = false
  clearErrors()
}

// 處理忘記密碼
async function handleForgotPassword() {
  if (!validateForm()) return

  loading.value = true
  clearErrors()

  try {
    const apiUrl = getApiUrl()
    const forgotPasswordUrl = `${apiUrl}/auth/forgot-password`

    const response = await apiFetch<{
      success: boolean
      message: string
      errors?: string[]
    }>(forgotPasswordUrl, {
      method: 'POST',
      body: JSON.stringify({
        email: form.email,
      }),
    })

    if (response.success) {
      emailSent.value = true
    }
    else {
      error.value = response.message || '發送重置連結失敗'
      if (response.errors) {
        error.value += ': ' + response.errors.join(', ')
      }
    }
  }
  catch (err) {
    console.error('Forgot password error:', err)
    // 顯示完整錯誤資訊
    if (err instanceof Error) {
      error.value = `網路錯誤：${err.message}`
      // 如果錯誤訊息太長，顯示更多詳情
      if (err.message.includes('JSON parsing failed')) {
        try {
          const errorData = JSON.parse(err.message.replace('JSON parsing failed: ', ''))
          error.value = `網路錯誤：狀態 ${errorData.status} ${errorData.statusText}\n回應內容：${errorData.responseText}\n內容類型：${errorData.contentType}`
        }
        catch {
          error.value = `網路錯誤：${err.message}`
        }
      }
    }
    else {
      error.value = `網路錯誤：${JSON.stringify(err, null, 2)}`
    }
  }
  finally {
    loading.value = false
  }
}

// SEO
useHead({
  title: '忘記密碼 - Money Flow',
  meta: [
    { name: 'description', content: 'Money Flow 密碼重置 - 忘記密碼時重設您的帳戶密碼' },
  ],
})
</script>
