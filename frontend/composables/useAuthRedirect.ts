/**
 * 處理已登入用戶訪問認證頁面的重導向邏輯
 * 用於登入和註冊頁面，提供良好的用戶體驗
 */

import { checkAuthStatus } from '~/lib/utils/auth'

interface AuthRedirectOptions {
  /** 頁面類型 */
  pageType: 'login' | 'register'
  /** 是否允許強制顯示（透過查詢參數 ?switch=true） */
  allowForceShow?: boolean
  /** 自定義重導向目標 */
  redirectTo?: string
}

export function useAuthRedirect(options: AuthRedirectOptions) {
  const route = useRoute()
  const router = useRouter()

  // 狀態管理
  const isCheckingAuth = ref(true)
  const isLoggedIn = ref(false)
  const currentUser = ref<any>(null)
  const showSwitchPrompt = ref(false)

  /**
   * 檢查用戶認證狀態
   */
  async function checkUserAuth() {
    try {
      isCheckingAuth.value = true

      // 檢查是否強制顯示切換界面
      const forceSwitch = route.query.switch === 'true'
      if (forceSwitch) {
        showSwitchPrompt.value = true
        isCheckingAuth.value = false
        return
      }

      // 檢查認證狀態
      const authResult = await checkAuthStatus()

      if (authResult?.user) {
        isLoggedIn.value = true
        currentUser.value = authResult.user

        // 根據頁面類型決定行為
        if (options.pageType === 'login') {
          // 登入頁：直接重導向到 dashboard
          const targetUrl = options.redirectTo || '/dashboard'
          await router.push(targetUrl)
        }
        else if (options.pageType === 'register') {
          // 註冊頁：顯示切換提示
          showSwitchPrompt.value = true
        }
      }
    }
    catch {
      // 認證失敗，用戶未登入，正常顯示頁面
      isLoggedIn.value = false
      currentUser.value = null
    }
    finally {
      isCheckingAuth.value = false
    }
  }

  /**
   * 處理繼續使用當前帳戶
   */
  async function continueWithCurrentAccount() {
    const targetUrl = options.redirectTo || '/dashboard'
    await router.push(targetUrl)
  }

  /**
   * 處理使用其他帳戶
   */
  async function switchToOtherAccount() {
    try {
      // 執行登出
      await $fetch('/api/logout', { method: 'POST' })

      // 清除本地儲存（移動端）
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }

      // 重新載入頁面，顯示登入/註冊表單
      showSwitchPrompt.value = false
      isLoggedIn.value = false
      currentUser.value = null
    }
    catch (error) {
      console.error('登出失敗:', error)
      // 即使登出失敗，也隱藏提示讓用戶嘗試登入
      showSwitchPrompt.value = false
    }
  }

  /**
   * 取得當前用戶的顯示名稱
   */
  const userDisplayName = computed(() => {
    if (!currentUser.value) return ''
    return currentUser.value.name || currentUser.value.email || '用戶'
  })

  /**
   * 取得切換提示的標題文字
   */
  const switchPromptTitle = computed(() => {
    if (options.pageType === 'login') {
      return '您已經登入'
    }
    else {
      return '您已有帳戶'
    }
  })

  /**
   * 取得切換提示的描述文字
   */
  const switchPromptDescription = computed(() => {
    const userName = userDisplayName.value
    if (options.pageType === 'login') {
      return `您目前已登入為 ${userName}，是否要繼續使用此帳戶？`
    }
    else {
      return `您已登入為 ${userName}，若要註冊新帳戶需要先登出。`
    }
  })

  // 頁面載入時自動檢查
  onMounted(() => {
    checkUserAuth()
  })

  return {
    // 狀態
    isCheckingAuth: readonly(isCheckingAuth),
    isLoggedIn: readonly(isLoggedIn),
    currentUser: readonly(currentUser),
    showSwitchPrompt: readonly(showSwitchPrompt),

    // 計算屬性
    userDisplayName,
    switchPromptTitle,
    switchPromptDescription,

    // 方法
    continueWithCurrentAccount,
    switchToOtherAccount,
    checkUserAuth,
  }
}
