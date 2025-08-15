<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="max-w-md w-full">
      <!-- 主要卡片 -->
      <div class="bg-white rounded-2xl shadow-lg p-8 text-center">
        <!-- 圖示 -->
        <div class="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <!-- 成功圖示 -->
          <svg
            v-if="verificationState === 'success'"
            class="w-8 h-8 text-white"
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
          <!-- 錯誤圖示 -->
          <svg
            v-else-if="verificationState === 'error'"
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <!-- 郵件圖示 -->
          <svg
            v-else
            class="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 8l7.89 7.89a2 2 0 002.83 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <!-- 標題 -->
        <h1 class="text-2xl font-bold text-gray-900 mb-4">
          {{ getTitle() }}
        </h1>

        <!-- 內容區域 -->
        <div
          v-if="verificationState === 'verifying'"
          class="space-y-4"
        >
          <div class="flex justify-center">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
          <p class="text-gray-600">
            正在驗證您的電子郵件...
          </p>
        </div>

        <div
          v-else-if="verificationState === 'success'"
          class="space-y-4"
        >
          <div class="bg-green-50 border border-green-200 rounded-lg p-4">
            <p class="text-green-800 font-medium">
              {{ message }}
            </p>
          </div>
          <p class="text-gray-600 text-sm">
            您現在可以使用完整的帳戶功能了。
          </p>

          <!-- 操作按鈕 -->
          <div class="flex flex-col space-y-3 mt-6">
            <NuxtLink
              to="/login"
              class="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              前往登入
            </NuxtLink>
          </div>
        </div>

        <div
          v-else-if="verificationState === 'error'"
          class="space-y-4"
        >
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-red-800 font-medium">
              {{ message }}
            </p>
          </div>
          <p class="text-gray-600 text-sm">
            驗證連結可能已過期或無效。
          </p>

          <!-- 重發驗證郵件 -->
          <div class="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left">
            <h3 class="font-medium text-gray-900 mb-2">
              需要重新發送驗證郵件？
            </h3>
            <p class="text-gray-600 text-sm mb-3">
              輸入您的電子郵件地址，我們將發送新的驗證連結。
            </p>

            <form
              class="space-y-3"
              @submit.prevent="handleResendVerification"
            >
              <input
                v-model="resendEmail"
                type="email"
                placeholder="請輸入電子郵件"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
              <button
                type="submit"
                :disabled="resendLoading"
                class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                <span v-if="resendLoading">發送中...</span>
                <span v-else>重新發送驗證郵件</span>
              </button>
            </form>

            <!-- 重發結果訊息 -->
            <div
              v-if="resendMessage"
              class="mt-3 p-3 rounded-lg"
              :class="resendSuccess ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'"
            >
              <p class="text-sm">
                {{ resendMessage }}
              </p>
            </div>
          </div>

          <!-- 操作按鈕 -->
          <div class="flex flex-col space-y-3 mt-6">
            <NuxtLink
              to="/login"
              class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              返回登入頁面
            </NuxtLink>
          </div>
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <p class="text-gray-600">
            缺少驗證參數，請檢查驗證連結是否完整。
          </p>

          <!-- 操作按鈕 -->
          <div class="flex flex-col space-y-3 mt-6">
            <NuxtLink
              to="/login"
              class="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              返回登入頁面
            </NuxtLink>
          </div>
        </div>
      </div>

      <!-- 額外資訊 -->
      <div class="mt-6 text-center">
        <p class="text-gray-500 text-sm">
          如有疑問，請聯繫客服團隊
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// 頁面配置
definePageMeta({
  layout: false,
  auth: false,
})

// SEO 設定
useSeoMeta({
  title: '電子郵件驗證 - Money Flow',
  description: '驗證您的電子郵件地址以完成註冊',
})

// 響應式數據
const verificationState = ref<'verifying' | 'success' | 'error' | 'invalid'>('verifying')
const message = ref('')
const resendEmail = ref('')
const resendLoading = ref(false)
const resendMessage = ref('')
const resendSuccess = ref(false)

// 路由參數
const route = useRoute()
const email = route.query.email as string
const token = route.query.token as string

// 初始化驗證
onMounted(() => {
  if (!email || !token) {
    verificationState.value = 'invalid'
    message.value = '驗證連結無效'
    return
  }

  // 預填充郵件地址
  resendEmail.value = email

  // 執行驗證
  verifyEmail()
})

// 驗證郵件
async function verifyEmail() {
  try {
    verificationState.value = 'verifying'

    const data = await $fetch('/api/auth/verify-email', {
      method: 'POST',
      body: {
        email,
        token,
      },
    })

    if (data.success) {
      verificationState.value = 'success'
      message.value = data.message
    }
    else {
      verificationState.value = 'error'
      message.value = data.message || '驗證失敗'
    }
  }
  catch (error: any) {
    console.error('驗證錯誤:', error)
    verificationState.value = 'error'
    message.value = '驗證過程發生錯誤，請稍後再試'
  }
}

// 重發驗證郵件
async function handleResendVerification() {
  if (!resendEmail.value) return

  try {
    resendLoading.value = true
    resendMessage.value = ''

    const data = await $fetch('/api/auth/resend-verification', {
      method: 'POST',
      body: {
        email: resendEmail.value,
      },
    })

    resendSuccess.value = data.success
    resendMessage.value = data.message
  }
  catch (error: any) {
    console.error('重發驗證郵件錯誤:', error)
    resendSuccess.value = false
    resendMessage.value = '重發驗證郵件失敗，請稍後再試'
  }
  finally {
    resendLoading.value = false
  }
}

// 獲取標題
function getTitle(): string {
  switch (verificationState.value) {
    case 'verifying':
      return '驗證中...'
    case 'success':
      return '驗證成功！'
    case 'error':
      return '驗證失敗'
    case 'invalid':
      return '驗證連結無效'
    default:
      return '電子郵件驗證'
  }
}
</script>
