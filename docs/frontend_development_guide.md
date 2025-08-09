# 前端開發規範

## 概述

本文檔定義了 Personal Finance Manager 專案的前端開發標準、元件設計規範、程式碼風格和最佳實務。所有前端開發人員都應遵循這些規範以確保程式碼品質和團隊協作效率。

---

## 技術棧標準

### 核心技術
- **框架**: Nuxt.js 3.x
- **前端庫**: Vue.js 3.x (Composition API)
- **類型系統**: TypeScript 5.x
- **狀態管理**: Pinia
- **路由**: Nuxt Router (基於 Vue Router 4)
- **樣式**: Tailwind CSS + SCSS
- **圖表**: Chart.js / D3.js
- **UI 元件**: 自定義元件庫 + Headless UI

### 開發工具
- **程式碼檢查**: ESLint + Prettier
- **測試框架**: Vitest + Vue Test Utils
- **E2E 測試**: Playwright
- **類型檢查**: vue-tsc
- **版本控制**: Git + GitHub
- **套件管理**: npm

---

## 專案結構規範

### 目錄結構
```
frontend/
├── .nuxt/                  # Nuxt 建置檔案（自動產生）
├── assets/                 # 需要處理的靜態資源
│   ├── css/
│   │   ├── main.scss       # 主要樣式檔案
│   │   ├── variables.scss  # SCSS 變數
│   │   └── components/     # 元件專用樣式
│   ├── images/             # 圖片資源
│   └── icons/              # SVG 圖示
├── components/             # Vue 元件
│   ├── ui/                 # 基礎 UI 元件
│   │   ├── Button.vue
│   │   ├── Input.vue
│   │   ├── Modal.vue
│   │   └── index.ts        # 統一匯出
│   ├── forms/              # 表單相關元件
│   │   ├── RecordForm.vue
│   │   ├── CategoryForm.vue
│   │   └── BudgetForm.vue
│   ├── charts/             # 圖表元件
│   │   ├── ExpenseChart.vue
│   │   ├── TrendChart.vue
│   │   └── CategoryPieChart.vue
│   ├── layout/             # 佈局元件
│   │   ├── Header.vue
│   │   ├── Sidebar.vue
│   │   ├── Footer.vue
│   │   └── MobileNav.vue
│   └── features/           # 功能模組元件
│       ├── records/
│       ├── budgets/
│       └── statistics/
├── composables/            # Vue 3 Composition API
│   ├── useAuth.ts
│   ├── useRecords.ts
│   ├── useBudgets.ts
│   ├── useCategories.ts
│   └── useUtils.ts
├── layouts/                # 頁面佈局
│   ├── default.vue
│   ├── auth.vue
│   └── mobile.vue
├── middleware/             # 路由中介軟體
│   ├── auth.ts
│   ├── guest.ts
│   └── role.ts
├── pages/                  # 路由頁面
│   ├── index.vue           # 首頁 (/)
│   ├── login.vue           # 登入 (/login)
│   ├── dashboard.vue       # 控制台 (/dashboard)
│   ├── records/            # 記錄相關頁面 (/records/*)
│   │   ├── index.vue       # 記錄列表
│   │   ├── create.vue      # 新增記錄
│   │   └── [id]/
│   │       ├── index.vue   # 記錄詳情
│   │       └── edit.vue    # 編輯記錄
│   ├── budgets/            # 預算頁面
│   ├── statistics/         # 統計頁面
│   └── settings/           # 設定頁面
├── plugins/                # Nuxt 外掛
│   ├── api.client.ts
│   ├── toast.client.ts
│   └── chart.client.ts
├── public/                 # 靜態檔案（不處理）
│   ├── favicon.ico
│   ├── robots.txt
│   └── manifest.json
├── server/                 # 伺服器端 API
│   └── api/                # API 路由
├── stores/                 # Pinia 狀態管理
│   ├── auth.ts
│   ├── records.ts
│   ├── budgets.ts
│   ├── categories.ts
│   └── ui.ts
├── types/                  # TypeScript 類型定義
│   ├── api.ts
│   ├── models.ts
│   └── components.ts
├── utils/                  # 工具函數
│   ├── format.ts
│   ├── validation.ts
│   ├── constants.ts
│   └── helpers.ts
├── nuxt.config.ts          # Nuxt 設定檔
├── tailwind.config.js      # Tailwind CSS 設定
├── package.json
└── tsconfig.json           # TypeScript 設定
```

### 檔案命名規範

#### Vue 元件檔案
- **單檔元件**: 使用 PascalCase，如 `RecordForm.vue`
- **頁面元件**: 使用 kebab-case，如 `user-profile.vue`
- **佈局元件**: 使用 kebab-case，如 `default.vue`

#### JavaScript/TypeScript 檔案  
- **Composables**: 使用 camelCase，前綴 `use`，如 `useAuth.ts`
- **工具函數**: 使用 camelCase，如 `formatCurrency.ts`
- **類型檔案**: 使用 camelCase，如 `apiTypes.ts`
- **常數檔案**: 使用 SCREAMING_SNAKE_CASE，如 `API_ENDPOINTS.ts`

#### 樣式檔案
- **全域樣式**: 使用 kebab-case，如 `main.scss`
- **元件樣式**: 對應元件名稱，如 `record-form.scss`

---

## Vue.js 開發規範

### Composition API 使用

#### 基本結構
```vue
<script setup lang="ts">
// 1. 匯入
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import type { Record } from '~/types/models'

// 2. 定義 Props 和 Emits
interface Props {
  record?: Record
  readonly?: boolean
}

interface Emits {
  save: [record: Record]
  cancel: []
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false
})

const emit = defineEmits<Emits>()

// 3. 響應式資料
const isLoading = ref(false)
const formData = reactive({
  amount: 0,
  description: '',
  categoryId: ''
})

// 4. 計算屬性
const isFormValid = computed(() => {
  return formData.amount > 0 && formData.categoryId.length > 0
})

// 5. 方法
const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  isLoading.value = true
  try {
    // 處理提交邏輯
    emit('save', formData as Record)
  } catch (error) {
    // 錯誤處理
  } finally {
    isLoading.value = false
  }
}

// 6. 監聽器
watch(() => props.record, (newRecord) => {
  if (newRecord) {
    Object.assign(formData, newRecord)
  }
}, { immediate: true })

// 7. 生命週期
onMounted(() => {
  // 初始化邏輯
})
</script>

<template>
  <form @submit.prevent="handleSubmit" class="record-form">
    <!-- 模板內容 -->
  </form>
</template>

<style scoped lang="scss">
.record-form {
  @apply space-y-4 p-6 bg-white rounded-lg shadow;
  
  // 元件專用樣式
}
</style>
```

#### Composables 設計模式
```typescript
// composables/useRecords.ts
export function useRecords() {
  const records = ref<Record[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  
  const fetchRecords = async (filters?: RecordFilters) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch('/api/records', {
        query: filters
      })
      records.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '獲取資料失敗'
    } finally {
      loading.value = false
    }
  }
  
  const createRecord = async (recordData: CreateRecordDto) => {
    try {
      const { data } = await $fetch('/api/records', {
        method: 'POST',
        body: recordData
      })
      
      records.value.unshift(data)
      return data
    } catch (err) {
      throw err
    }
  }
  
  const updateRecord = async (id: string, recordData: UpdateRecordDto) => {
    try {
      const { data } = await $fetch(`/api/records/${id}`, {
        method: 'PUT',
        body: recordData
      })
      
      const index = records.value.findIndex(r => r.id === id)
      if (index !== -1) {
        records.value[index] = data
      }
      
      return data
    } catch (err) {
      throw err
    }
  }
  
  const deleteRecord = async (id: string) => {
    try {
      await $fetch(`/api/records/${id}`, {
        method: 'DELETE'
      })
      
      records.value = records.value.filter(r => r.id !== id)
    } catch (err) {
      throw err
    }
  }
  
  return {
    records: readonly(records),
    loading: readonly(loading),
    error: readonly(error),
    fetchRecords,
    createRecord,
    updateRecord,
    deleteRecord
  }
}
```

### 元件設計原則

#### 1. 單一職責原則
每個元件只負責一個功能或展示一個資料實體：

```vue
<!-- ✅ 好的做法 -->
<script setup lang="ts">
// RecordItem.vue - 只負責顯示單一記錄
interface Props {
  record: Record
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})
</script>

<!-- ❌ 避免的做法 -->
<script setup lang="ts">
// RecordManager.vue - 職責過多
// 不要在同一個元件中處理：列表顯示、新增表單、編輯功能、統計顯示等
</script>
```

#### 2. Props 和 Events 設計
```vue
<script setup lang="ts">
// Props 使用 TypeScript 介面定義
interface Props {
  // 必需的 props
  record: Record
  
  // 可選的 props 提供預設值
  editable?: boolean
  showCategory?: boolean
  
  // 避免 Object 和 Array 作為預設值
  filters?: RecordFilters
}

// Events 使用具體的類型定義
interface Emits {
  // 事件名稱: [參數類型]
  edit: [recordId: string]
  delete: [recordId: string]
  'amount-change': [newAmount: number]
}

const props = withDefaults(defineProps<Props>(), {
  editable: false,
  showCategory: true
})

const emit = defineEmits<Emits>()

// 事件處理
const handleEdit = () => {
  emit('edit', props.record.id)
}

const handleAmountChange = (amount: number) => {
  emit('amount-change', amount)
}
</script>
```

#### 3. 插槽 (Slots) 設計
```vue
<script setup lang="ts">
// Modal.vue - 通用模態框元件
interface Props {
  title?: string
  size?: 'sm' | 'md' | 'lg'
  closable?: boolean
}
</script>

<template>
  <div class="modal-overlay">
    <div :class="modalSizeClasses">
      <header class="modal-header">
        <slot name="header">
          <h2>{{ title }}</h2>
        </slot>
        
        <button v-if="closable" @click="$emit('close')">
          <Icon name="close" />
        </button>
      </header>
      
      <main class="modal-body">
        <slot />
      </main>
      
      <footer class="modal-footer">
        <slot name="footer">
          <Button @click="$emit('close')">關閉</Button>
        </slot>
      </footer>
    </div>
  </div>
</template>
```

### 效能最佳化

#### 1. 懶載入元件
```typescript
// 使用 defineAsyncComponent 懶載入重型元件
const ExpenseChart = defineAsyncComponent({
  loader: () => import('~/components/charts/ExpenseChart.vue'),
  loadingComponent: () => h('div', '載入中...'),
  errorComponent: () => h('div', '載入失敗'),
  delay: 200,
  timeout: 3000
})

// 在頁面中使用
const chartComponent = shallowRef()

onMounted(() => {
  // 只在需要時載入圖表元件
  if (showChart.value) {
    chartComponent.value = ExpenseChart
  }
})
```

#### 2. 響應式資料最佳化
```typescript
// 使用 shallowRef 和 shallowReactive 優化效能
const largeDataList = shallowRef<Record[]>([])
const formData = shallowReactive({
  amount: 0,
  description: ''
})

// 使用 markRaw 避免不必要的響應式
const chartInstance = markRaw(new Chart(canvas, config))

// 使用 readonly 避免意外修改
const readonlyRecords = readonly(records)
```

#### 3. 計算屬性快取
```typescript
// 複雜計算使用 computed
const expenseStatistics = computed(() => {
  return records.value
    .filter(record => record.type === 'expense')
    .reduce((acc, record) => {
      acc.total += record.amount
      acc.count += 1
      acc.average = acc.total / acc.count
      return acc
    }, { total: 0, count: 0, average: 0 })
})

// 使用 useMemoize 快取複雜運算
const { data: categoryStats } = useMemoize(
  () => calculateCategoryStatistics(records.value),
  [records]
)
```

---

## 狀態管理 (Pinia)

### Store 結構設計
```typescript
// stores/records.ts
export const useRecordsStore = defineStore('records', () => {
  // State
  const records = ref<Record[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const filters = ref<RecordFilters>({
    startDate: null,
    endDate: null,
    categoryId: null,
    type: null
  })
  
  // Getters
  const filteredRecords = computed(() => {
    let result = records.value
    
    if (filters.value.type) {
      result = result.filter(r => r.type === filters.value.type)
    }
    
    if (filters.value.categoryId) {
      result = result.filter(r => r.categoryId === filters.value.categoryId)
    }
    
    if (filters.value.startDate && filters.value.endDate) {
      result = result.filter(r => {
        const recordDate = new Date(r.date)
        return recordDate >= filters.value.startDate! && 
               recordDate <= filters.value.endDate!
      })
    }
    
    return result
  })
  
  const totalExpenses = computed(() => {
    return filteredRecords.value
      .filter(r => r.type === 'expense')
      .reduce((sum, r) => sum + r.amount, 0)
  })
  
  const totalIncome = computed(() => {
    return filteredRecords.value
      .filter(r => r.type === 'income')
      .reduce((sum, r) => sum + r.amount, 0)
  })
  
  // Actions
  const fetchRecords = async (params?: RecordFilters) => {
    loading.value = true
    error.value = null
    
    try {
      const { data } = await $fetch('/api/records', { query: params })
      records.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '獲取資料失敗'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  const createRecord = async (recordData: CreateRecordDto) => {
    try {
      const { data } = await $fetch('/api/records', {
        method: 'POST',
        body: recordData
      })
      
      records.value.unshift(data)
      return data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '新增記錄失敗'
      throw err
    }
  }
  
  const updateFilters = (newFilters: Partial<RecordFilters>) => {
    filters.value = { ...filters.value, ...newFilters }
  }
  
  const resetFilters = () => {
    filters.value = {
      startDate: null,
      endDate: null,
      categoryId: null,
      type: null
    }
  }
  
  return {
    // State
    records: readonly(records),
    loading: readonly(loading),
    error: readonly(error),
    filters: readonly(filters),
    
    // Getters
    filteredRecords,
    totalExpenses,
    totalIncome,
    
    // Actions
    fetchRecords,
    createRecord,
    updateFilters,
    resetFilters
  }
})
```

### Store 使用模式
```vue
<script setup lang="ts">
import { storeToRefs } from 'pinia'

// 在元件中使用 store
const recordsStore = useRecordsStore()
const { records, loading, error, filteredRecords } = storeToRefs(recordsStore)
const { fetchRecords, createRecord, updateFilters } = recordsStore

// 監聽 store 變化
watch(filteredRecords, (newRecords) => {
  // 當篩選結果變化時執行邏輯
}, { deep: true })

onMounted(() => {
  fetchRecords()
})
</script>
```

---

## 樣式設計規範

### Tailwind CSS 使用準則

#### 1. 響應式設計
```vue
<template>
  <!-- 行動優先的響應式設計 -->
  <div class="
    p-4 
    sm:p-6 
    lg:p-8
    grid 
    grid-cols-1 
    md:grid-cols-2 
    lg:grid-cols-3 
    gap-4
  ">
    <div class="
      bg-white 
      rounded-lg 
      shadow-sm 
      hover:shadow-md 
      transition-shadow
    ">
      <!-- 卡片內容 -->
    </div>
  </div>
</template>
```

#### 2. 自定義 CSS 類別
```scss
// assets/css/components.scss
@layer components {
  .btn-primary {
    @apply bg-blue-600 hover:bg-blue-700 focus:ring-blue-500;
    @apply px-4 py-2 text-white font-medium rounded-lg;
    @apply focus:outline-none focus:ring-2 focus:ring-offset-2;
    @apply disabled:opacity-50 disabled:cursor-not-allowed;
    @apply transition-colors duration-200;
  }
  
  .card {
    @apply bg-white rounded-lg shadow-sm border border-gray-200;
    @apply p-6 hover:shadow-md transition-shadow;
  }
  
  .form-input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-md;
    @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
    @apply disabled:bg-gray-50 disabled:text-gray-500;
  }
}
```

#### 3. 主題變數設定
```javascript
// tailwind.config.js
module.exports = {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8'
        },
        success: {
          500: '#10b981',
          600: '#059669'
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626'
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}
```

### SCSS 組織結構
```scss
// assets/css/main.scss
@import 'variables';
@import 'base';
@import 'components';
@import 'utilities';

// 變數定義
// assets/css/_variables.scss
$primary-color: #3b82f6;
$success-color: #10b981;
$danger-color: #ef4444;
$warning-color: #f59e0b;

$border-radius-sm: 0.375rem;
$border-radius-md: 0.5rem;
$border-radius-lg: 0.75rem;

$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);

// 基礎樣式
// assets/css/_base.scss
html {
  @apply h-full;
}

body {
  @apply h-full bg-gray-50 text-gray-900 font-sans;
}

// 工具類別
// assets/css/_utilities.scss
.text-truncate {
  @apply overflow-hidden text-ellipsis whitespace-nowrap;
}

.visually-hidden {
  @apply absolute w-px h-px p-0 -m-px overflow-hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

---

## 表單處理規範

### 表單驗證
```vue
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'

// 定義驗證 schema
const recordSchema = z.object({
  amount: z.number().min(0.01, '金額必須大於 0'),
  description: z.string().min(1, '請輸入描述').max(200, '描述不能超過 200 字'),
  categoryId: z.string().min(1, '請選擇分類'),
  date: z.string().refine(
    (date) => !isNaN(Date.parse(date)),
    '請選擇有效日期'
  )
})

type RecordFormData = z.infer<typeof recordSchema>

// 使用 VeeValidate
const { handleSubmit, errors, values, setFieldValue } = useForm<RecordFormData>({
  validationSchema: toTypedSchema(recordSchema),
  initialValues: {
    amount: 0,
    description: '',
    categoryId: '',
    date: new Date().toISOString().split('T')[0]
  }
})

// 提交處理
const onSubmit = handleSubmit(async (formData) => {
  try {
    await createRecord(formData)
    // 成功處理
    showToast('記錄新增成功', 'success')
    await navigateTo('/records')
  } catch (error) {
    showToast('新增失敗，請稍後再試', 'error')
  }
})
</script>

<template>
  <form @submit="onSubmit" class="space-y-6">
    <div>
      <label for="amount" class="form-label">金額</label>
      <Field 
        name="amount" 
        type="number" 
        step="0.01"
        class="form-input"
        :class="{ 'border-red-500': errors.amount }"
      />
      <ErrorMessage name="amount" class="form-error" />
    </div>
    
    <div>
      <label for="description" class="form-label">描述</label>
      <Field 
        name="description" 
        as="textarea"
        class="form-input"
        :class="{ 'border-red-500': errors.description }"
        rows="3"
      />
      <ErrorMessage name="description" class="form-error" />
    </div>
    
    <div>
      <label for="categoryId" class="form-label">分類</label>
      <Field name="categoryId" as="select" class="form-input">
        <option value="">請選擇分類</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </Field>
      <ErrorMessage name="categoryId" class="form-error" />
    </div>
    
    <Button type="submit" variant="primary" :loading="isSubmitting">
      新增記錄
    </Button>
  </form>
</template>

<style scoped lang="scss">
.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.form-error {
  @apply text-sm text-red-600 mt-1;
}
</style>
```

### 自定義輸入元件
```vue
<!-- components/ui/FormInput.vue -->
<script setup lang="ts">
interface Props {
  modelValue?: string | number
  type?: 'text' | 'number' | 'email' | 'password' | 'tel'
  placeholder?: string
  disabled?: boolean
  error?: string
  label?: string
  required?: boolean
}

interface Emits {
  'update:modelValue': [value: string | number]
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

const emit = defineEmits<Emits>()

const inputId = useId()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = props.type === 'number' ? Number(target.value) : target.value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="form-group">
    <label 
      v-if="label" 
      :for="inputId" 
      class="form-label"
      :class="{ 'required': required }"
    >
      {{ label }}
    </label>
    
    <input
      :id="inputId"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="form-input"
      :class="{
        'border-red-500 focus:ring-red-500': error,
        'bg-gray-50 cursor-not-allowed': disabled
      }"
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    
    <p v-if="error" class="form-error">
      {{ error }}
    </p>
  </div>
</template>

<style scoped lang="scss">
.form-group {
  @apply space-y-1;
}

.form-label {
  @apply block text-sm font-medium text-gray-700;
  
  &.required::after {
    content: ' *';
    @apply text-red-500;
  }
}

.form-input {
  @apply w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm;
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent;
  @apply disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed;
  @apply transition-colors duration-200;
}

.form-error {
  @apply text-sm text-red-600;
}
</style>
```

---

## 測試規範

### 單元測試
```typescript
// components/__tests__/RecordItem.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import RecordItem from '~/components/RecordItem.vue'
import type { Record } from '~/types/models'

const mockRecord: Record = {
  id: '1',
  amount: 120.5,
  type: 'expense',
  description: '午餐',
  categoryId: 'cat1',
  date: '2024-01-15T12:00:00Z',
  userId: 'user1',
  currency: 'TWD'
}

describe('RecordItem', () => {
  it('正確顯示記錄資訊', () => {
    const wrapper = mount(RecordItem, {
      props: { record: mockRecord }
    })
    
    expect(wrapper.find('[data-testid="amount"]').text()).toBe('$120.50')
    expect(wrapper.find('[data-testid="description"]').text()).toBe('午餐')
    expect(wrapper.find('[data-testid="type"]').classes()).toContain('expense')
  })
  
  it('點擊編輯按鈕時觸發 edit 事件', async () => {
    const wrapper = mount(RecordItem, {
      props: { 
        record: mockRecord,
        showActions: true 
      }
    })
    
    await wrapper.find('[data-testid="edit-button"]').trigger('click')
    
    expect(wrapper.emitted('edit')).toBeTruthy()
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockRecord.id])
  })
  
  it('readonly 模式下不顯示操作按鈕', () => {
    const wrapper = mount(RecordItem, {
      props: { 
        record: mockRecord,
        showActions: false 
      }
    })
    
    expect(wrapper.find('[data-testid="edit-button"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="delete-button"]').exists()).toBe(false)
  })
})
```

### Composable 測試
```typescript
// composables/__tests__/useRecords.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRecords } from '~/composables/useRecords'

// Mock $fetch
vi.mock('#app', () => ({
  $fetch: vi.fn()
}))

describe('useRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  it('成功獲取記錄列表', async () => {
    const mockRecords = [mockRecord]
    
    vi.mocked($fetch).mockResolvedValueOnce({ data: mockRecords })
    
    const { records, loading, fetchRecords } = useRecords()
    
    expect(loading.value).toBe(false)
    expect(records.value).toEqual([])
    
    await fetchRecords()
    
    expect(loading.value).toBe(false)
    expect(records.value).toEqual(mockRecords)
    expect($fetch).toHaveBeenCalledWith('/api/records', { query: undefined })
  })
  
  it('處理 API 錯誤', async () => {
    const errorMessage = '網路錯誤'
    
    vi.mocked($fetch).mockRejectedValueOnce(new Error(errorMessage))
    
    const { error, fetchRecords } = useRecords()
    
    await expect(fetchRecords()).rejects.toThrow(errorMessage)
    expect(error.value).toBe(errorMessage)
  })
})
```

### E2E 測試
```typescript
// tests/e2e/record-management.spec.ts
import { test, expect } from '@playwright/test'

test.describe('記錄管理', () => {
  test.beforeEach(async ({ page }) => {
    // 登入
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.click('[data-testid="login-button"]')
    
    // 等待導向到控制台
    await page.waitForURL('/dashboard')
  })
  
  test('新增支出記錄', async ({ page }) => {
    await page.goto('/records/create')
    
    // 填寫表單
    await page.fill('[data-testid="amount"]', '120.5')
    await page.fill('[data-testid="description"]', 'E2E 測試記錄')
    await page.selectOption('[data-testid="category"]', 'food')
    
    // 提交表單
    await page.click('[data-testid="save-button"]')
    
    // 驗證成功訊息
    await expect(page.locator('[data-testid="toast"]')).toContainText('記錄新增成功')
    
    // 驗證導向到列表頁面
    await page.waitForURL('/records')
    
    // 驗證新記錄出現在列表中
    await expect(page.locator('[data-testid="record-list"]'))
      .toContainText('E2E 測試記錄')
  })
  
  test('篩選記錄', async ({ page }) => {
    await page.goto('/records')
    
    // 設定日期篩選
    await page.fill('[data-testid="start-date"]', '2024-01-01')
    await page.fill('[data-testid="end-date"]', '2024-01-31')
    
    // 選擇類型篩選
    await page.selectOption('[data-testid="type-filter"]', 'expense')
    
    // 點擊搜尋
    await page.click('[data-testid="search-button"]')
    
    // 等待結果載入
    await page.waitForSelector('[data-testid="record-item"]')
    
    // 驗證篩選結果
    const records = page.locator('[data-testid="record-item"]')
    await expect(records).toHaveCount(3)
    
    // 驗證所有結果都是支出類型
    for (let i = 0; i < await records.count(); i++) {
      await expect(records.nth(i)).toHaveAttribute('data-type', 'expense')
    }
  })
})
```

---

## 效能最佳化

### 圖片最佳化
```vue
<template>
  <!-- 使用 Nuxt Image 最佳化 -->
  <NuxtImg
    src="/images/hero-bg.jpg"
    alt="Personal Finance Manager"
    width="1200"
    height="600"
    format="webp"
    quality="80"
    sizes="sm:100vw md:50vw lg:400px"
    loading="lazy"
    placeholder
  />
  
  <!-- 響應式圖片 -->
  <picture>
    <source 
      srcset="/images/chart-mobile.webp" 
      media="(max-width: 768px)"
      type="image/webp"
    >
    <source 
      srcset="/images/chart-desktop.webp" 
      media="(min-width: 769px)"
      type="image/webp"
    >
    <img 
      src="/images/chart-desktop.jpg" 
      alt="支出統計圖表"
      loading="lazy"
    >
  </picture>
</template>
```

### 程式碼分割
```typescript
// 路由級別的程式碼分割
const routes = [
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('~/pages/statistics.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'Reports', 
    component: () => import('~/pages/reports.vue'),
    meta: { requiresAuth: true }
  }
]

// 元件級別的程式碼分割
const HeavyChart = defineAsyncComponent({
  loader: () => import('~/components/charts/ComplexChart.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
})
```

### 記憶體最佳化
```typescript
// 虛擬捲動處理大型列表
const { list, containerProps, wrapperProps } = useVirtualList(
  largeRecordsList,
  {
    itemHeight: 60,
    overscan: 5
  }
)

// 使用 useMemoize 快取計算結果
const expensiveCalculation = useMemoize(
  (records: Record[]) => {
    return records.reduce((acc, record) => {
      // 複雜計算邏輯
      return acc + calculateComplexMetric(record)
    }, 0)
  },
  {
    getKey: (records) => records.map(r => r.id).join(',')
  }
)

// 清理定時器和事件監聽器
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value)
  }
  
  window.removeEventListener('resize', handleResize)
})
```

---

## 無障礙設計 (Accessibility)

### ARIA 屬性使用
```vue
<template>
  <!-- 表單標籤關聯 -->
  <label for="record-amount" class="form-label">
    金額
    <span class="text-red-500" aria-label="必填欄位">*</span>
  </label>
  <input
    id="record-amount"
    type="number"
    aria-describedby="amount-help amount-error"
    aria-invalid="false"
    v-model="amount"
  />
  <div id="amount-help" class="help-text">
    請輸入正數金額
  </div>
  <div id="amount-error" class="error-text" role="alert" v-if="amountError">
    {{ amountError }}
  </div>
  
  <!-- 按鈕狀態 -->
  <button
    type="submit"
    :disabled="isSubmitting"
    :aria-busy="isSubmitting"
    class="btn-primary"
  >
    <span v-if="isSubmitting" aria-hidden="true">⏳</span>
    {{ isSubmitting ? '儲存中...' : '儲存記錄' }}
  </button>
  
  <!-- 模態框 -->
  <div
    v-if="showModal"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    class="modal"
  >
    <h2 id="modal-title">編輯記錄</h2>
    <!-- 模態框內容 -->
  </div>
</template>
```

### 鍵盤導航
```vue
<script setup lang="ts">
// 鍵盤事件處理
const handleKeydown = (event: KeyboardEvent) => {
  switch (event.key) {
    case 'Escape':
      if (showModal.value) {
        closeModal()
        event.preventDefault()
      }
      break
      
    case 'Enter':
      if (event.metaKey || event.ctrlKey) {
        // Cmd/Ctrl + Enter 快速儲存
        handleSubmit()
        event.preventDefault()
      }
      break
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <!-- 可鍵盤操作的自定義元素 -->
  <div
    class="record-item"
    tabindex="0"
    role="button"
    :aria-pressed="selected"
    @click="toggleSelection"
    @keydown.enter="toggleSelection"
    @keydown.space.prevent="toggleSelection"
  >
    <!-- 記錄內容 -->
  </div>
</template>
```

---

## 錯誤處理

### 全域錯誤處理
```typescript
// plugins/error-handler.client.ts
export default defineNuxtPlugin(() => {
  // Vue 錯誤處理
  vueApp.config.errorHandler = (error, instance, info) => {
    console.error('Vue 錯誤:', error, info)
    
    // 發送錯誤到監控服務
    if (process.env.NODE_ENV === 'production') {
      sendErrorReport(error, { context: info })
    }
  }
  
  // 未捕獲的 Promise 拒絕
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未處理的 Promise 拒絕:', event.reason)
    
    if (process.env.NODE_ENV === 'production') {
      sendErrorReport(event.reason, { type: 'unhandled-promise-rejection' })
    }
  })
})

// 錯誤邊界元件
export function createErrorBoundary() {
  return defineComponent({
    setup(_, { slots }) {
      const error = ref<Error | null>(null)
      
      const resetError = () => {
        error.value = null
      }
      
      onErrorCaptured((err) => {
        error.value = err
        return false // 阻止錯誤繼續傳播
      })
      
      return () => {
        if (error.value) {
          return h('div', { class: 'error-boundary' }, [
            h('h2', '糟糕！出現了錯誤'),
            h('p', error.value.message),
            h('button', { onClick: resetError }, '重試')
          ])
        }
        
        return slots.default?.()
      }
    }
  })
}
```

### API 錯誤處理
```typescript
// utils/api.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public statusMessage: string,
    public data?: any
  ) {
    super(`API Error ${statusCode}: ${statusMessage}`)
    this.name = 'ApiError'
  }
}

export async function apiRequest<T>(
  url: string, 
  options?: RequestInit
): Promise<T> {
  try {
    const response = await $fetch<T>(url, {
      ...options,
      onResponseError: ({ response }) => {
        throw new ApiError(
          response.status,
          response.statusText || 'Unknown error',
          response._data
        )
      }
    })
    
    return response
  } catch (error) {
    // 根據錯誤類型進行不同處理
    if (error instanceof ApiError) {
      switch (error.statusCode) {
        case 401:
          // 未授權，導向登入頁
          await navigateTo('/login')
          break
          
        case 403:
          // 禁止存取
          showToast('您沒有執行此操作的權限', 'error')
          break
          
        case 429:
          // 請求過於頻繁
          showToast('請求過於頻繁，請稍後再試', 'warning')
          break
          
        case 500:
          // 伺服器錯誤
          showToast('伺服器暫時無法回應，請稍後再試', 'error')
          break
          
        default:
          showToast('發生未知錯誤，請稍後再試', 'error')
      }
    }
    
    throw error
  }
}
```

---

## 程式碼品質檢查

### ESLint 配置
```javascript
// .eslintrc.js
module.exports = {
  root: true,
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended'
  ],
  rules: {
    // Vue 相關規則
    'vue/multi-word-component-names': 'off',
    'vue/no-multiple-template-root': 'off',
    'vue/no-v-html': 'warn',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-unused-vars': 'error',
    'vue/require-default-prop': 'error',
    
    // TypeScript 相關規則
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    
    // 通用規則
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prefer-const': 'error',
    'no-var': 'error'
  }
}
```

### Prettier 配置
```javascript
// prettier.config.js
module.exports = {
  semi: false,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 80,
  bracketSpacing: true,
  arrowParens: 'avoid',
  endOfLine: 'lf',
  vueIndentScriptAndStyle: false
}
```

### Husky Git Hooks
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{js,ts,vue}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{css,scss,less}": [
      "stylelint --fix",
      "prettier --write"
    ]
  }
}
```

這份前端開發規範涵蓋了專案的所有重要開發標準，包括程式碼結構、Vue.js 最佳實務、樣式設計、測試策略和效能最佳化。遵循這些規範可以確保程式碼品質和團隊協作效率。