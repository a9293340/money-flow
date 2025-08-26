/**
 * useFinancialProfile - 財務規劃問卷狀態管理
 * 提供財務規劃問卷的狀態管理、資料持久化、API 呼叫等功能
 */

import { ref, computed } from 'vue'
import type {
  IFinancialProfile,
} from '~/lib/models/financial-profile'

// =========================
// 類型定義
// =========================

interface FinancialProfileState {
  profile: IFinancialProfile | null
  isLoading: boolean
  error: string | null
  isModalOpen: boolean
}

// =========================
// 全域狀態
// =========================

const state = ref<FinancialProfileState>({
  profile: null,
  isLoading: false,
  error: null,
  isModalOpen: false,
})

// =========================
// Composable
// =========================

export function useFinancialProfile() {
  // =========================
  // 計算屬性
  // =========================

  const hasProfile = computed(() => state.value.profile !== null)

  const profileCompletionRate = computed(() => {
    if (!state.value.profile) return 0

    const profile = state.value.profile
    let completedFields = 0
    let totalFields = 0

    // 基本資料檢查
    totalFields += 6
    if (profile.basicInfo.age > 0) completedFields++
    if (profile.basicInfo.occupation) completedFields++
    if (profile.basicInfo.monthlyIncome > 0) completedFields++
    if (profile.basicInfo.monthlyExpenses > 0) completedFields++
    if (profile.basicInfo.currentSavings >= 0) completedFields++
    if (typeof profile.basicInfo.hasDebt === 'boolean') completedFields++

    // 風險評估檢查
    totalFields += 4
    if (profile.riskAssessment.riskTolerance) completedFields++
    if (profile.riskAssessment.investmentExperience) completedFields++
    if (profile.riskAssessment.timeHorizon) completedFields++
    if (profile.riskAssessment.volatilityComfort > 0) completedFields++

    // 生活偏好檢查
    totalFields += 2
    if (profile.lifestyle.budgetingStyle) completedFields++
    if (profile.lifestyle.savingPreference) completedFields++

    return Math.round((completedFields / totalFields) * 100)
  })

  // =========================
  // 基本操作
  // =========================

  const openModal = () => {
    state.value.isModalOpen = true
  }

  const closeModal = () => {
    state.value.isModalOpen = false
  }

  const setLoading = (loading: boolean) => {
    state.value.isLoading = loading
  }

  const setError = (error: string | null) => {
    state.value.error = error
  }

  const clearError = () => {
    state.value.error = null
  }

  // =========================
  // 資料管理
  // =========================

  const saveProfile = async (profile: IFinancialProfile) => {
    try {
      setLoading(true)
      setError(null)

      // Phase 1: 暫時使用 sessionStorage 儲存
      const profileData = {
        ...profile,
        id: generateProfileId(),
        lastUpdated: new Date(),
      }

      sessionStorage.setItem('financialProfile', JSON.stringify(profileData))
      state.value.profile = profileData

      // 關閉 Modal
      closeModal()

      return { success: true, data: profileData }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : '儲存失敗'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
    finally {
      setLoading(false)
    }
  }

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Phase 1: 從 sessionStorage 載入
      const storedProfile = sessionStorage.getItem('financialProfile')
      if (storedProfile) {
        const profile = JSON.parse(storedProfile)
        state.value.profile = profile
        return { success: true, data: profile }
      }

      return { success: true, data: null }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : '載入失敗'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
    finally {
      setLoading(false)
    }
  }

  const deleteProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      // Phase 1: 從 sessionStorage 移除
      sessionStorage.removeItem('financialProfile')
      state.value.profile = null

      return { success: true }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : '刪除失敗'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
    finally {
      setLoading(false)
    }
  }

  // =========================
  // 工具函數
  // =========================

  const generateProfileId = () => {
    return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const getProfileSummary = () => {
    if (!state.value.profile) return null

    const profile = state.value.profile
    const monthlyNetIncome = profile.basicInfo.monthlyIncome - profile.basicInfo.monthlyExpenses

    return {
      completionRate: profileCompletionRate.value,
      monthlyNetIncome,
      savingsRate: profile.basicInfo.monthlyIncome > 0
        ? Math.round((monthlyNetIncome / profile.basicInfo.monthlyIncome) * 100)
        : 0,
      riskLevel: profile.riskAssessment.riskTolerance,
      goalCount: profile.goals.length,
      lastUpdated: profile.lastUpdated || profile.completionDate,
    }
  }

  // =========================
  // 自動載入
  // =========================

  // 初始化時載入資料
  loadProfile()

  // =========================
  // 返回值
  // =========================

  return {
    // 狀態
    profile: computed(() => state.value.profile),
    isLoading: computed(() => state.value.isLoading),
    error: computed(() => state.value.error),
    isModalOpen: computed(() => state.value.isModalOpen),
    hasProfile,
    profileCompletionRate,

    // 方法
    openModal,
    closeModal,
    saveProfile,
    loadProfile,
    deleteProfile,
    clearError,
    getProfileSummary,

    // 工具
    generateProfileId,
  }
}
