<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
  >
    <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- 背景遮罩 -->
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="$emit('close')"
      />

      <!-- Modal 內容 -->
      <div class="inline-block align-middle bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:w-full sm:max-w-6xl">
        <div class="bg-gray-50 min-h-screen p-4 sm:p-6">
          <div class="max-w-4xl mx-auto">
            <!-- 頂部導航 -->
            <div class="mb-6 flex items-center justify-between">
              <h1 class="text-2xl font-bold text-gray-900">
                AI 財務規劃評估問卷
              </h1>
              <button
                class="text-gray-400 hover:text-gray-600 p-2"
                type="button"
                @click="$emit('close')"
              >
                <svg
                  class="w-6 h-6"
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

            <!-- 進度保存提示 -->
            <div
              v-if="hasUnsavedChanges"
              class="mb-4"
            >
              <div class="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div class="flex items-start">
                  <div class="text-blue-400 mr-2 mt-0.5">
                    💾
                  </div>
                  <div>
                    <p class="text-sm text-blue-800">
                      您的回答會自動儲存，可以隨時關閉後繼續填寫
                    </p>
                    <button
                      class="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
                      @click="saveProgress"
                    >
                      手動保存進度
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- 進度指示器 -->
              <div class="lg:col-span-1">
                <ProgressIndicator
                  :current-step="currentStep"
                  :total-steps="totalSteps"
                  :completion-percentage="completionPercentage"
                  :validation-errors="validationErrors"
                />

                <!-- 快速導航 -->
                <div class="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                  <h3 class="text-sm font-medium text-gray-900 mb-3">
                    快速跳轉
                  </h3>
                  <div class="space-y-2">
                    <button
                      v-for="(config, index) in stepConfigs"
                      :key="config.id"
                      :disabled="index + 1 > maxAvailableStep"
                      class="w-full text-left px-3 py-2 text-sm rounded-md transition-colors"
                      :class="{
                        'bg-blue-100 text-blue-900 font-medium': currentStep === config.id,
                        'bg-green-50 text-green-700': index + 1 < currentStep && isStepCompleted(config.id),
                        'text-gray-600 hover:bg-gray-50': index + 1 < currentStep && !isStepCompleted(config.id),
                        'text-gray-400 cursor-not-allowed': index + 1 > maxAvailableStep,
                      }"
                      @click="jumpToStep(config.id)"
                    >
                      <div class="flex items-center">
                        <span class="mr-2">
                          {{ isStepCompleted(config.id) ? '✅' : index + 1 > maxAvailableStep ? '🔒' : index + 1 < currentStep ? '⚠️' : '📝' }}
                        </span>
                        <span>{{ config.title }}</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <!-- 問卷內容 -->
              <div class="lg:col-span-2">
                <QuestionStep
                  :current-step="currentStep"
                  :total-steps="totalSteps"
                  :step-title="currentStepConfig.title"
                  :step-description="currentStepConfig.description"
                  :can-proceed="canProceedToNextStep"
                  :is-last-step="isLastStep"
                  @next-step="nextStep"
                  @previous-step="previousStep"
                  @complete="completeQuestionnaire"
                >
                  <!-- Step 1: 基本資料 -->
                  <div
                    v-if="currentStep === 1"
                    class="space-y-4"
                  >
                    <!-- 財務健康度提示 -->
                    <div
                      v-if="isBasicInfoComplete"
                      class="mb-4"
                    >
                      <div
                        class="p-3 rounded-md text-sm"
                        :class="{
                          'bg-green-50 border border-green-200': financialHealthScore >= 70,
                          'bg-yellow-50 border border-yellow-200': financialHealthScore >= 40 && financialHealthScore < 70,
                          'bg-red-50 border border-red-200': financialHealthScore < 40,
                        }"
                      >
                        <div class="flex items-center">
                          <span class="mr-2">
                            {{ financialHealthScore >= 70 ? '✅' : financialHealthScore >= 40 ? '⚠️' : '🚨' }}
                          </span>
                          <span
                            class="font-medium"
                            :class="{
                              'text-green-800': financialHealthScore >= 70,
                              'text-yellow-800': financialHealthScore >= 40 && financialHealthScore < 70,
                              'text-red-800': financialHealthScore < 40,
                            }"
                          >
                            財務健康度：{{ financialHealthScore }}%
                          </span>
                        </div>
                        <p
                          class="mt-1 text-xs"
                          :class="{
                            'text-green-700': financialHealthScore >= 70,
                            'text-yellow-700': financialHealthScore >= 40 && financialHealthScore < 70,
                            'text-red-700': financialHealthScore < 40,
                          }"
                        >
                          {{ getFinancialHealthMessage() }}
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          年齡 <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model.number="financialProfile.basicInfo.age"
                          type="number"
                          min="18"
                          max="100"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-300': validationErrors.includes('請輸入有效年齡') }"
                          placeholder="請輸入年齡"
                        >
                        <p
                          v-if="financialProfile.basicInfo.age && financialProfile.basicInfo.age < 18"
                          class="text-xs text-red-600 mt-1"
                        >
                          年齡需滿 18 歲才能使用此服務
                        </p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          職業 <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model="financialProfile.basicInfo.occupation"
                          type="text"
                          maxlength="50"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-300': validationErrors.includes('請輸入職業') }"
                          placeholder="例如：軟體工程師、護理師"
                        >
                        <p
                          v-if="financialProfile.basicInfo.occupation.length > 40"
                          class="text-xs text-yellow-600 mt-1"
                        >
                          職業名稱建議不超過 40 個字元
                        </p>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          月收入 (NT$) <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model.number="financialProfile.basicInfo.monthlyIncome"
                          type="number"
                          min="0"
                          step="1000"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-300': validationErrors.includes('請輸入月收入') }"
                          placeholder="50000"
                        >
                        <p class="text-xs text-gray-500 mt-1">
                          包含薪水、獎金、兼職等所有收入
                        </p>
                      </div>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          月支出 (NT$) <span class="text-red-500">*</span>
                        </label>
                        <input
                          v-model.number="financialProfile.basicInfo.monthlyExpenses"
                          type="number"
                          min="0"
                          step="1000"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          :class="{ 'border-red-300': validationErrors.includes('請輸入月支出') }"
                          placeholder="35000"
                        >
                        <p class="text-xs text-gray-500 mt-1">
                          包含生活費、房租、保險等固定支出
                        </p>
                        <p
                          v-if="financialProfile.basicInfo.monthlyExpenses > financialProfile.basicInfo.monthlyIncome && financialProfile.basicInfo.monthlyIncome > 0"
                          class="text-xs text-red-600 mt-1"
                        >
                          ⚠️ 支出超過收入，建議檢視財務狀況
                        </p>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        目前儲蓄 (NT$)
                      </label>
                      <input
                        v-model.number="financialProfile.basicInfo.currentSavings"
                        type="number"
                        min="0"
                        step="10000"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="100000"
                      >
                      <p class="text-xs text-gray-500 mt-1">
                        包含活存、定存、投資帳戶餘額等
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        扶養人數
                      </label>
                      <select
                        v-model.number="financialProfile.basicInfo.dependents"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="0">
                          無
                        </option>
                        <option value="1">
                          1 人
                        </option>
                        <option value="2">
                          2 人
                        </option>
                        <option value="3">
                          3 人
                        </option>
                        <option value="4">
                          4 人
                        </option>
                        <option value="5">
                          5 人以上
                        </option>
                      </select>
                      <p class="text-xs text-gray-500 mt-1">
                        包含配偶、子女、父母等需要經濟支援的家人
                      </p>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-2">
                        負債狀況
                      </label>
                      <div class="space-y-3">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.basicInfo.hasDebt"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">我有負債（房貸、車貸、信用卡債等）</span>
                        </label>

                        <div
                          v-if="financialProfile.basicInfo.hasDebt"
                          class="ml-6"
                        >
                          <input
                            v-model.number="financialProfile.basicInfo.debtAmount"
                            type="number"
                            min="0"
                            step="10000"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :class="{ 'border-red-300': financialProfile.basicInfo.hasDebt && (!financialProfile.basicInfo.debtAmount || financialProfile.basicInfo.debtAmount <= 0) }"
                            placeholder="負債總額"
                          >
                          <p class="text-xs text-gray-500 mt-1">
                            請填入所有負債的總額
                          </p>
                          <p
                            v-if="getDebtRatio() > 50"
                            class="text-xs text-red-600 mt-1"
                          >
                            ⚠️ 負債比率過高（{{ getDebtRatio() }}%），建議優先處理債務問題
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 2: 風險評估 -->
                  <div
                    v-else-if="currentStep === 2"
                    class="space-y-6"
                  >
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        風險承受度
                      </label>
                      <div class="space-y-2">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.riskAssessment.riskTolerance"
                            value="conservative"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">保守型 - 優先保本，可接受較低報酬</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.riskAssessment.riskTolerance"
                            value="moderate"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">穩健型 - 平衡風險與報酬</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.riskAssessment.riskTolerance"
                            value="aggressive"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">積極型 - 追求高報酬，可承受較高風險</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        投資經驗
                      </label>
                      <select
                        v-model="financialProfile.riskAssessment.investmentExperience"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">
                          請選擇投資經驗
                        </option>
                        <option value="none">
                          完全沒有經驗
                        </option>
                        <option value="beginner">
                          初學者（1-2年）
                        </option>
                        <option value="intermediate">
                          有一定經驗（3-5年）
                        </option>
                        <option value="advanced">
                          經驗豐富（5年以上）
                        </option>
                      </select>
                    </div>

                    <!-- 投資時間視野 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        投資時間視野
                      </label>
                      <div class="space-y-2">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.riskAssessment.timeHorizon"
                            value="short"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">短期（1-3年） - 近期需要用錢</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.riskAssessment.timeHorizon"
                            value="medium"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">中期（3-10年） - 中期財務目標</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.riskAssessment.timeHorizon"
                            value="long"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">長期（10年以上） - 退休或長期規劃</span>
                        </label>
                      </div>
                    </div>

                    <!-- 波動容忍度 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        市場波動容忍度
                        <span class="text-xs text-gray-500">（如果投資組合在短期內下跌 20%，您的反應是？）</span>
                      </label>
                      <div class="space-y-2">
                        <label class="flex items-center">
                          <input
                            v-model.number="financialProfile.riskAssessment.volatilityComfort"
                            :value="1"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">非常擔心，立即賣出止損</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model.number="financialProfile.riskAssessment.volatilityComfort"
                            :value="2"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">有點擔心，考慮減少投資部位</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model.number="financialProfile.riskAssessment.volatilityComfort"
                            :value="3"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">保持冷靜，繼續觀察</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model.number="financialProfile.riskAssessment.volatilityComfort"
                            :value="4"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">視為買進機會，維持投資</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model.number="financialProfile.riskAssessment.volatilityComfort"
                            :value="5"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">太好了！加碼投資買更多</span>
                        </label>
                      </div>
                    </div>

                    <!-- 條件式問題：如果選擇保守型，顯示保守投資偏好 -->
                    <div
                      v-if="financialProfile.riskAssessment.riskTolerance === 'conservative'"
                      class="bg-blue-50 border border-blue-200 rounded-lg p-4"
                    >
                      <h4 class="text-sm font-medium text-blue-900 mb-3">
                        保守型投資偏好
                      </h4>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          您最在意的投資特點是？
                        </label>
                        <div class="space-y-2">
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">保本保息</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">隨時可提取</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">政府保障</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- 條件式問題：如果選擇積極型，顯示積極投資偏好 -->
                    <div
                      v-if="financialProfile.riskAssessment.riskTolerance === 'aggressive'"
                      class="bg-red-50 border border-red-200 rounded-lg p-4"
                    >
                      <h4 class="text-sm font-medium text-red-900 mb-3">
                        積極型投資偏好
                      </h4>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          您有興趣的高風險投資類型？（可複選）
                        </label>
                        <div class="space-y-2">
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">個股投資</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">期權交易</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">加密貨幣</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">槓桿型商品</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- 條件式問題：如果沒有投資經驗，顯示教育需求 -->
                    <div
                      v-if="financialProfile.riskAssessment.investmentExperience === 'none'"
                      class="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                    >
                      <h4 class="text-sm font-medium text-yellow-800 mb-3">
                        投資教育需求
                      </h4>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          您希望學習哪些投資知識？（可複選）
                        </label>
                        <div class="space-y-2">
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">基礎理財概念</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">投資工具介紹</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">風險管理技巧</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="checkbox"
                              class="w-4 h-4 text-yellow-600 border-gray-300 rounded focus:ring-yellow-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">資產配置策略</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Step 3: 財務目標 -->
                  <div v-else-if="currentStep === 3">
                    <GoalBuilder
                      v-model="financialProfile.goals"
                    />
                  </div>

                  <!-- Step 4: 偏好設定 -->
                  <div
                    v-else-if="currentStep === 4"
                    class="space-y-6"
                  >
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        預算管理風格
                      </label>
                      <div class="space-y-2">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.budgetingStyle"
                            value="strict"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">嚴格控制 - 精確規劃每筆支出</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.budgetingStyle"
                            value="flexible"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">彈性管理 - 大概控制，允許調整</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.budgetingStyle"
                            value="casual"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">輕鬆記錄 - 主要用於追蹤消費</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        儲蓄偏好
                      </label>
                      <div class="space-y-2">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.savingPreference"
                            value="automatic"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">自動儲蓄 - 薪水入帳後自動轉存</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.savingPreference"
                            value="manual"
                            type="radio"
                            class="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-900">手動儲蓄 - 根據當月狀況決定存款</span>
                        </label>
                      </div>
                    </div>

                    <!-- 消費優先順序 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        消費優先順序 (請選擇最重要的 3 項)
                      </label>
                      <div class="grid grid-cols-2 gap-2">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.spendingPriorities"
                            value="housing"
                            type="checkbox"
                            :disabled="financialProfile.lifestyle.spendingPriorities.length >= 3 && !financialProfile.lifestyle.spendingPriorities.includes('housing')"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">居住支出</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.spendingPriorities"
                            value="food"
                            type="checkbox"
                            :disabled="financialProfile.lifestyle.spendingPriorities.length >= 3 && !financialProfile.lifestyle.spendingPriorities.includes('food')"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">飲食支出</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.spendingPriorities"
                            value="education"
                            type="checkbox"
                            :disabled="financialProfile.lifestyle.spendingPriorities.length >= 3 && !financialProfile.lifestyle.spendingPriorities.includes('education')"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">教育學習</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.spendingPriorities"
                            value="healthcare"
                            type="checkbox"
                            :disabled="financialProfile.lifestyle.spendingPriorities.length >= 3 && !financialProfile.lifestyle.spendingPriorities.includes('healthcare')"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">醫療保健</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.spendingPriorities"
                            value="entertainment"
                            type="checkbox"
                            :disabled="financialProfile.lifestyle.spendingPriorities.length >= 3 && !financialProfile.lifestyle.spendingPriorities.includes('entertainment')"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">娛樂休閒</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.spendingPriorities"
                            value="transportation"
                            type="checkbox"
                            :disabled="financialProfile.lifestyle.spendingPriorities.length >= 3 && !financialProfile.lifestyle.spendingPriorities.includes('transportation')"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">交通支出</span>
                        </label>
                      </div>
                      <p class="text-xs text-gray-500 mt-2">
                        已選擇 {{ financialProfile.lifestyle.spendingPriorities.length }}/3 項
                      </p>
                    </div>

                    <!-- 財務擔憂 -->
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-3">
                        主要財務擔憂 (可複選)
                      </label>
                      <div class="space-y-2">
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.financialConcerns"
                            value="insufficient_savings"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">儲蓄不足</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.financialConcerns"
                            value="debt_burden"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">債務負擔</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.financialConcerns"
                            value="retirement_planning"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">退休準備</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.financialConcerns"
                            value="income_instability"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">收入不穩定</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.financialConcerns"
                            value="investment_knowledge"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">投資知識不足</span>
                        </label>
                        <label class="flex items-center">
                          <input
                            v-model="financialProfile.lifestyle.financialConcerns"
                            value="emergency_fund"
                            type="checkbox"
                            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          >
                          <span class="ml-2 text-sm text-gray-700">缺乏緊急預備金</span>
                        </label>
                      </div>
                    </div>

                    <!-- 條件式問題：根據預算風格顯示工具偏好 -->
                    <div
                      v-if="financialProfile.lifestyle.budgetingStyle === 'strict'"
                      class="bg-green-50 border border-green-200 rounded-lg p-4"
                    >
                      <h4 class="text-sm font-medium text-green-900 mb-3">
                        嚴格預算管理偏好
                      </h4>
                      <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                          您偏好哪種記帳方式？
                        </label>
                        <div class="space-y-2">
                          <label class="flex items-center">
                            <input
                              type="radio"
                              name="budgetingTool"
                              class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">手機 App 自動分類</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="radio"
                              name="budgetingTool"
                              class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">Excel 詳細表格</span>
                          </label>
                          <label class="flex items-center">
                            <input
                              type="radio"
                              name="budgetingTool"
                              class="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                            >
                            <span class="ml-2 text-sm text-gray-700">紙本記帳本</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <!-- 自由文字諮詢 -->
                    <div class="border-t border-gray-200 pt-6">
                      <div class="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div class="flex items-start mb-3">
                          <div class="text-purple-400 mr-3 mt-1">
                            💬
                          </div>
                          <div>
                            <h4 class="text-purple-900 font-medium mb-1">
                              其他想諮詢的內容
                            </h4>
                            <p class="text-purple-800 text-sm">
                              如果您有特殊的財務狀況或想詢問的問題，請在此自由描述
                            </p>
                          </div>
                        </div>

                        <div>
                          <label class="block text-sm font-medium text-gray-700 mb-2">
                            自由文字描述 (選填，限 100 字)
                          </label>
                          <textarea
                            v-model="financialProfile.additionalNotes"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                            :class="{ 'border-red-300': (financialProfile.additionalNotes?.length || 0) > 100 }"
                            rows="3"
                            maxlength="100"
                            placeholder="例如：我正在考慮換工作，對收入不穩定期間的理財有疑問；我有一筆遺產不知如何規劃；想了解如何為小孩準備教育基金..."
                          />
                          <div class="flex justify-between items-center mt-1">
                            <p class="text-xs text-gray-500">
                              此資訊將幫助 AI 提供更個人化的建議
                            </p>
                            <p
                              class="text-xs"
                              :class="{
                                'text-red-600': (financialProfile.additionalNotes?.length || 0) > 100,
                                'text-gray-500': (financialProfile.additionalNotes?.length || 0) <= 100,
                              }"
                            >
                              {{ financialProfile.additionalNotes?.length || 0 }}/100 字
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </QuestionStep>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { IFinancialProfile, QuestionnaireStep } from '~/lib/models/financial-profile'

// =========================
// Props & Emits
// =========================

interface Props {
  show: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  complete: [profile: IFinancialProfile]
  analysisComplete: [result: any]
  analysisStarted: []
}>()

// =========================
// State
// =========================

const currentStep = ref(1)
const totalSteps = ref(4)

// 預設問卷資料
const financialProfile = ref<IFinancialProfile>({
  basicInfo: {
    age: 0,
    occupation: '',
    monthlyIncome: 0,
    monthlyExpenses: 0,
    currentSavings: 0,
    hasDebt: false,
    debtAmount: 0,
    dependents: 0,
  },
  riskAssessment: {
    riskTolerance: 'moderate',
    investmentExperience: 'none',
    timeHorizon: 'medium',
    volatilityComfort: 3,
  },
  goals: [],
  lifestyle: {
    budgetingStyle: 'flexible',
    savingPreference: 'automatic',
    spendingPriorities: [],
    financialConcerns: [],
  },
  additionalNotes: '', // 自由文字諮詢內容
})

// 步驟設定
const stepConfigs: QuestionnaireStep[] = [
  {
    id: 1,
    title: '基本財務資料',
    description: '告訴我們您的基本財務狀況',
    section: 'basic',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 2,
    title: '風險偏好評估',
    description: '了解您的投資風險承受能力',
    section: 'risk',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 3,
    title: '財務目標設定',
    description: '設定您的短中長期財務目標',
    section: 'goals',
    isCompleted: false,
    isValid: false,
  },
  {
    id: 4,
    title: '生活偏好設定',
    description: '了解您的消費和儲蓄習慣',
    section: 'lifestyle',
    isCompleted: false,
    isValid: false,
  },
]

// =========================
// Computed
// =========================

const currentStepConfig = computed(() => {
  return stepConfigs[currentStep.value - 1]
})

const completionPercentage = computed(() => {
  return (currentStep.value / totalSteps.value) * 100
})

const isLastStep = computed(() => {
  return currentStep.value === totalSteps.value
})

const canProceedToNextStep = computed(() => {
  const basic = financialProfile.value.basicInfo
  const risk = financialProfile.value.riskAssessment
  const lifestyle = financialProfile.value.lifestyle
  const goals = financialProfile.value.goals

  switch (currentStep.value) {
    case 1:
      return basic.age > 0
        && basic.occupation.trim() !== ''
        && basic.monthlyIncome > 0
        && basic.monthlyExpenses > 0
    case 2:
      return !!(risk.riskTolerance && risk.investmentExperience && risk.timeHorizon && risk.volatilityComfort > 0)
    case 3:
      // Phase 2: 檢查是否至少設定了一個完整的目標
      return goals.length > 0 && goals.some(goal =>
        goal.name
        && goal.targetAmount > 0
        && goal.timeframe
        && goal.priority,
      )
    case 4:
      return !!(lifestyle.budgetingStyle && lifestyle.savingPreference && lifestyle.spendingPriorities.length > 0)
    default:
      return false
  }
})

// 基本資料完整性檢查
const isBasicInfoComplete = computed(() => {
  const basic = financialProfile.value.basicInfo
  return basic.age > 0 && basic.monthlyIncome > 0 && basic.monthlyExpenses > 0
})

// 是否有未保存的變更
const hasUnsavedChanges = computed(() => {
  // 檢查是否有任何欄位被修改但未保存
  return currentStep.value > 1
    || financialProfile.value.basicInfo.age > 0
    || financialProfile.value.basicInfo.occupation.trim() !== ''
})

// 最大可用步驟
const maxAvailableStep = computed(() => {
  for (let i = 1; i <= totalSteps.value; i++) {
    if (i === 1) continue // 第一步總是可用

    // 檢查前一步是否完成
    if (i === 2 && !canCompleteStep(1)) return 1
    if (i === 3 && !canCompleteStep(2)) return 2
    if (i === 4 && !canCompleteStep(3)) return 3
  }
  return totalSteps.value
})

// 財務健康度評分
const financialHealthScore = computed(() => {
  if (!isBasicInfoComplete.value) return 0

  const basic = financialProfile.value.basicInfo
  let score = 0

  // 儲蓄率評分 (40%)
  const savingsRate = basic.monthlyIncome > 0
    ? ((basic.monthlyIncome - basic.monthlyExpenses) / basic.monthlyIncome) * 100
    : 0
  if (savingsRate >= 20) score += 40
  else if (savingsRate >= 10) score += 30
  else if (savingsRate >= 0) score += 20
  else score += 0

  // 緊急預備金評分 (30%)
  const monthlyExpenses = basic.monthlyExpenses || 1
  const emergencyMonths = basic.currentSavings / monthlyExpenses
  if (emergencyMonths >= 6) score += 30
  else if (emergencyMonths >= 3) score += 20
  else if (emergencyMonths >= 1) score += 10

  // 負債比率評分 (30%)
  if (!basic.hasDebt || !basic.debtAmount) {
    score += 30
  }
  else {
    const debtRatio = getDebtRatio()
    if (debtRatio <= 20) score += 30
    else if (debtRatio <= 40) score += 20
    else if (debtRatio <= 60) score += 10
    else score += 0
  }

  return Math.round(score)
})

const validationErrors = computed(() => {
  const errors: string[] = []
  const basic = financialProfile.value.basicInfo
  const risk = financialProfile.value.riskAssessment
  const lifestyle = financialProfile.value.lifestyle
  const goals = financialProfile.value.goals

  switch (currentStep.value) {
    case 1:
      if (!basic.age || basic.age < 18) errors.push('請輸入有效年齡')
      if (!basic.occupation.trim()) errors.push('請輸入職業')
      if (!basic.monthlyIncome || basic.monthlyIncome <= 0) errors.push('請輸入月收入')
      if (!basic.monthlyExpenses || basic.monthlyExpenses <= 0) errors.push('請輸入月支出')
      break
    case 2:
      if (!risk.riskTolerance) errors.push('請選擇風險承受度')
      if (!risk.investmentExperience) errors.push('請選擇投資經驗')
      if (!risk.timeHorizon) errors.push('請選擇投資時間視野')
      if (!risk.volatilityComfort || risk.volatilityComfort === 0) errors.push('請選擇市場波動容忍度')
      break
    case 3:
      if (goals.length === 0) {
        errors.push('請至少設定一個財務目標')
      }
      else {
        const incompleteGoals = goals.filter(goal =>
          !goal.name || !goal.targetAmount || !goal.timeframe || !goal.priority,
        )
        if (incompleteGoals.length > 0) {
          errors.push('請完善所有目標的詳細資訊')
        }
      }
      break
    case 4:
      if (!lifestyle.budgetingStyle) errors.push('請選擇預算管理風格')
      if (!lifestyle.savingPreference) errors.push('請選擇儲蓄偏好')
      if (lifestyle.spendingPriorities.length === 0) errors.push('請至少選擇一項消費優先順序')
      // 檢查自由文字字數限制
      if (financialProfile.value.additionalNotes && financialProfile.value.additionalNotes.length > 100) {
        errors.push('自由文字描述不能超過 100 字')
      }
      break
  }

  return errors
})

// =========================
// Methods
// =========================

const nextStep = () => {
  if (canProceedToNextStep.value && currentStep.value < totalSteps.value) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const completeQuestionnaire = async () => {
  if (canProceedToNextStep.value) {
    // 添加完成時間
    financialProfile.value.completionDate = new Date()
    financialProfile.value.lastUpdated = new Date()

    // 先 emit 完成事件
    emit('complete', financialProfile.value)

    // 然後觸發 AI 分析
    try {
      emit('analysisStarted')

      const analysisComposable = await import('~/composables/useFinancialAnalysis')
      const { analyzeFinancialProfile } = analysisComposable.useFinancialAnalysis()

      // 開始 AI 分析
      const analysisResult = await analyzeFinancialProfile(financialProfile.value)

      if (analysisResult) {
        console.log('AI 財務分析已完成')
        emit('analysisComplete', analysisResult)
      }
    }
    catch (error) {
      console.error('AI 分析過程中發生錯誤:', error)
      // 不影響問卷完成流程，只記錄錯誤
    }
  }
}

// =========================
// 輔助方法
// =========================

const getDebtRatio = () => {
  const basic = financialProfile.value.basicInfo
  if (!basic.hasDebt || !basic.debtAmount || basic.monthlyIncome <= 0) return 0
  return Math.round((basic.debtAmount / (basic.monthlyIncome * 12)) * 100)
}

const getFinancialHealthMessage = () => {
  const score = financialHealthScore.value
  if (score >= 70) {
    return '財務狀況良好！您已建立了穩固的財務基礎。'
  }
  else if (score >= 40) {
    return '財務狀況尚可，但仍有改善空間。建議增加儲蓄或減少負債。'
  }
  else {
    return '財務狀況需要關注。建議優先建立緊急預備金並檢視支出結構。'
  }
}

// 檢查指定步驟是否可以完成
const canCompleteStep = (step: number) => {
  const basic = financialProfile.value.basicInfo
  const risk = financialProfile.value.riskAssessment
  const lifestyle = financialProfile.value.lifestyle
  const goals = financialProfile.value.goals

  switch (step) {
    case 1:
      return basic.age > 0
        && basic.occupation.trim() !== ''
        && basic.monthlyIncome > 0
        && basic.monthlyExpenses > 0
    case 2:
      return !!(risk.riskTolerance && risk.investmentExperience && risk.timeHorizon && risk.volatilityComfort > 0)
    case 3:
      return goals.length > 0 && goals.some(goal =>
        goal.name
        && goal.targetAmount > 0
        && goal.timeframe
        && goal.priority,
      )
    case 4:
      return !!(lifestyle.budgetingStyle && lifestyle.savingPreference && lifestyle.spendingPriorities.length > 0)
    default:
      return false
  }
}

// 檢查指定步驟是否已完成
const isStepCompleted = (step: number) => {
  return canCompleteStep(step)
}

// 跳轉到指定步驟
const jumpToStep = (step: number) => {
  if (step <= maxAvailableStep.value) {
    currentStep.value = step
  }
}

// 保存進度
const saveProgress = () => {
  try {
    const progressData = {
      ...financialProfile.value,
      currentStep: currentStep.value,
      lastSavedAt: new Date(),
    }

    sessionStorage.setItem('questionnaireProgress', JSON.stringify(progressData))

    // 顯示保存成功提示
    console.log('進度已保存')
  }
  catch (error) {
    console.error('保存進度失敗:', error)
  }
}

// 載入進度
const loadProgress = () => {
  try {
    const saved = sessionStorage.getItem('questionnaireProgress')
    if (saved) {
      const progressData = JSON.parse(saved)
      financialProfile.value = progressData
      currentStep.value = progressData.currentStep || 1
    }
  }
  catch (error) {
    console.error('載入進度失敗:', error)
  }
}

// 初始化時載入進度
loadProgress()
</script>
