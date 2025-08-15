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
              d="M15 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2H9a2 2 0 00-2 2v2M7 7a2 2 0 012 2m0 0a2 2 0 012 2m-2-2a2 2 0 00-2 2m2-2V5a2 2 0 00-2-2"
            />
          </svg>
        </div>

        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          重設密碼
        </h1>
        <p class="text-gray-600 mb-2">
          請輸入您的新密碼
        </p>
      </div>

      <!-- 無效連結提示 -->
      <div
        v-if="invalidLink"
        class="card-elevated p-8 animate-slide-up text-center space-y-6"
      >
        <div class="inline-flex items-center justify-center w-16 h-16 bg-danger-100 rounded-full mb-4">
          <svg
            class="w-8 h-8 text-danger-600"
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
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900">
            重置連結無效
          </h2>
          <p class="text-gray-600">
            此重置連結可能已過期或無效，請重新申請密碼重置。
          </p>
        </div>

        <div class="space-y-3">
          <NuxtLink
            to="/forgot-password"
            class="btn-primary w-full"
          >
            重新申請重置
          </NuxtLink>
          <NuxtLink
            to="/login"
            class="btn-secondary w-full"
          >
            返回登入
          </NuxtLink>
        </div>
      </div>

      <!-- 成功狀態 -->
      <div
        v-else-if="resetSuccess"
        class="card-elevated p-8 animate-slide-up text-center space-y-6"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div class="space-y-4">
          <h2 class="text-xl font-semibold text-gray-900">
            密碼重置成功！
          </h2>
          <p class="text-gray-600">
            您的密碼已成功更新，請使用新密碼登入。
          </p>
        </div>

        <NuxtLink
          to="/login"
          class="btn-primary w-full"
        >
          前往登入
        </NuxtLink>
      </div>

      <!-- 重置表單 -->
      <div
        v-else
        class="card-elevated p-8 animate-slide-up"
      >
        <form
          class="space-y-6"
          @submit.prevent="handleResetPassword"
        >
          <!-- 新密碼 -->
          <div>
            <label
              for="newPassword"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              新密碼
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
                id="newPassword"
                v-model="form.newPassword"
                name="newPassword"
                :type="showNewPassword ? 'text' : 'password'"
                required
                :class="[
                  'input-base input-with-icons',
                  errors.newPassword ? 'input-error' : '',
                ]"
                placeholder="請輸入新密碼（至少8個字元）"
                :disabled="loading"
              >
              <button
                type="button"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
                :disabled="loading"
                @click="showNewPassword = !showNewPassword"
              >
                <svg
                  v-if="showNewPassword"
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
              v-if="errors.newPassword"
              class="mt-2 text-sm text-danger-600"
            >
              {{ errors.newPassword }}
            </p>
            <!-- 密碼強度提示 -->
            <div class="mt-2">
              <div class="text-xs text-gray-500 space-y-1">
                <p>密碼必須包含：</p>
                <div class="grid grid-cols-1 gap-1">
                  <div class="flex items-center space-x-2">
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        form.newPassword.length >= 8 ? 'bg-success-500' : 'bg-gray-300',
                      ]"
                    />
                    <span :class="form.newPassword.length >= 8 ? 'text-success-600' : 'text-gray-500'">
                      至少 8 個字元
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        /[a-z]/.test(form.newPassword) ? 'bg-success-500' : 'bg-gray-300',
                      ]"
                    />
                    <span :class="/[a-z]/.test(form.newPassword) ? 'text-success-600' : 'text-gray-500'">
                      一個小寫字母
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        /[A-Z]/.test(form.newPassword) ? 'bg-success-500' : 'bg-gray-300',
                      ]"
                    />
                    <span :class="/[A-Z]/.test(form.newPassword) ? 'text-success-600' : 'text-gray-500'">
                      一個大寫字母
                    </span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <div
                      :class="[
                        'w-3 h-3 rounded-full',
                        /\d/.test(form.newPassword) ? 'bg-success-500' : 'bg-gray-300',
                      ]"
                    />
                    <span :class="/\d/.test(form.newPassword) ? 'text-success-600' : 'text-gray-500'">
                      一個數字
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 確認密碼 -->
          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 mb-2"
            >
              確認新密碼
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
                :class="[
                  'input-base input-with-icons',
                  errors.confirmPassword ? 'input-error' : '',
                ]"
                placeholder="請再次輸入新密碼"
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
                  重置失敗
                </h3>
                <p class="text-sm text-danger-700">
                  {{ error }}
                </p>
              </div>
            </div>
          </div>

          <!-- 重置按鈕 -->
          <button
            type="submit"
            :disabled="loading"
            class="btn-primary w-full touch-target relative overflow-hidden group"
          >
            <span
              v-if="!loading"
              class="relative z-10"
            >
              重設密碼
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
              重設中...
            </span>
            <!-- 按鈕動畫效果 -->
            <div class="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </button>
        </form>
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

// 路由查詢參數
const route = useRoute()
const token = computed(() => route.query.token as string)
const email = computed(() => route.query.email as string)

// 響應式數據
const form = reactive({
  newPassword: '',
  confirmPassword: '',
})

const loading = ref(false)
const error = ref('')
const resetSuccess = ref(false)
const invalidLink = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const errors = reactive({
  newPassword: '',
  confirmPassword: '',
})

// 檢查連結有效性
onMounted(() => {
  if (!token.value || !email.value) {
    invalidLink.value = true
  }
})

// 清除錯誤訊息
function clearErrors() {
  error.value = ''
  errors.newPassword = ''
  errors.confirmPassword = ''
}

// 驗證表單
function validateForm() {
  clearErrors()
  let isValid = true

  if (!form.newPassword) {
    errors.newPassword = '請輸入新密碼'
    isValid = false
  }
  else if (form.newPassword.length < 8) {
    errors.newPassword = '密碼至少需要 8 個字元'
    isValid = false
  }
  else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.newPassword)) {
    errors.newPassword = '密碼必須包含至少一個小寫字母、一個大寫字母和一個數字'
    isValid = false
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = '請確認新密碼'
    isValid = false
  }
  else if (form.newPassword !== form.confirmPassword) {
    errors.confirmPassword = '密碼和確認密碼不相符'
    isValid = false
  }

  return isValid
}

// 處理密碼重置
async function handleResetPassword() {
  if (!validateForm()) return

  loading.value = true
  clearErrors()

  try {
    const apiUrl = getApiUrl()
    const resetPasswordUrl = `${apiUrl}/auth/reset-password`

    const response = await apiFetch<{
      success: boolean
      message: string
      errors?: string[]
    }>(resetPasswordUrl, {
      method: 'POST',
      body: JSON.stringify({
        email: email.value,
        token: token.value,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      }),
    })

    if (response.success) {
      resetSuccess.value = true
    }
    else {
      error.value = response.message || '重置密碼失敗'
      if (response.errors) {
        error.value += ': ' + response.errors.join(', ')
      }
    }
  }
  catch (err) {
    console.error('Reset password error:', err)
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
  title: '重設密碼 - Money Flow',
  meta: [
    { name: 'description', content: 'Money Flow 重設密碼 - 使用重置連結設定新的帳戶密碼' },
  ],
})
</script>
