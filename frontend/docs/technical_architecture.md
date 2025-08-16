# Personal Finance Manager - 技術架構設計

## 📋 概述

本文檔定義了 Personal Finance Manager 的完整技術架構，確保在開發個人功能時就具備群組協作的擴展能力。

### 🎯 架構核心原則
- **個人優先，群組預留**：先實作個人功能，架構設計預留群組擴展
- **Context 驅動**：統一的 Context 機制支援個人/群組模式切換
- **權限分層**：彈性的權限系統，支援個人和群組不同需求
- **資料隔離**：個人資料與群組資料完全隔離，確保隱私安全

---

## 🏗️ 整體架構

### 系統架構圖
```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                           │
├─────────────────────────────────────────────────────────────────┤
│  Web App (Nuxt.js)     │  Mobile App (Tauri + Android/iOS)     │
│  ┌─────────────────────┐│  ┌─────────────────────────────────┐   │
│  │ Context Switcher    ││  │ Context Switcher                │   │
│  │ Personal | Group    ││  │ Personal | Group                │   │
│  └─────────────────────┘│  └─────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│                         API Gateway                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Context Middleware (個人/群組路由)                             │ │
│  │ Auth Middleware (JWT + 權限控制)                              │ │
│  │ Rate Limiting + Security                                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                     Business Logic Layer                        │
│  ┌──────────────────┐  ┌──────────────────┐                    │
│  │   Personal APIs  │  │    Group APIs     │                    │
│  │  ┌─────────────┐ │  │  ┌─────────────┐  │                    │
│  │  │Records CRUD │ │  │  │Group Records│  │                    │
│  │  │Categories   │ │  │  │Invitations  │  │                    │
│  │  │Budgets      │ │  │  │Members Mgmt │  │                    │
│  │  │Statistics   │ │  │  │Group Stats  │  │                    │
│  │  └─────────────┘ │  │  └─────────────┘  │                    │
│  └──────────────────┘  └──────────────────┘                    │
├─────────────────────────────────────────────────────────────────┤
│                      Data Access Layer                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Unified Data Models                         │ │
│  │ User | Record | Category | Budget | Group | Invitation     │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│                       Database Layer                            │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      MongoDB                                │ │
│  │ collections: users, records, categories, budgets,           │ │
│  │             groups, group_invitations, activities          │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔑 核心設計概念

### 🎛️ Context 驅動架構

**Context 是整個系統的核心概念**，用於區分個人模式和群組模式：

```javascript
// Context 定義
type Context = 'personal' | 'group'

// 前端狀態管理
interface AppState {
  currentContext: Context           // 目前模式
  user: User                       // 使用者資訊
  contextData: {
    personal: PersonalData         // 個人模式資料
    group: GroupData              // 群組模式資料 (如果有加入群組)
  }
}
```

**Context 切換流程**：
```javascript
// 1. 用戶點擊切換按鈕
// 2. 更新 currentContext
// 3. 清空當前資料快取
// 4. 重新載入對應 Context 的資料
// 5. 更新 UI 狀態
```

### 🔐 統一權限系統

```javascript
// 權限檢查邏輯
function checkPermission(user, action, resource, context) {
  if (context === 'personal') {
    // 個人模式：只檢查資源是否屬於該用戶
    return resource.userId === user._id
  } 
  else if (context === 'group') {
    // 群組模式：檢查群組成員身份和角色權限
    return checkGroupPermission(user, action, resource)
  }
}
```

### 📊 資料模型設計

所有核心資料模型都支援 Context 概念：

```javascript
// Records - 支援個人和群組記錄
{
  _id: ObjectId,
  userId: ObjectId,              // 記錄擁有者
  context: 'personal' | 'group', // 🔑 記錄類型
  groupId: ObjectId | null,      // 群組ID (個人記錄為null)
  createdBy: ObjectId,           // 記錄建立者
  // ... 其他欄位
}

// Categories - 支援個人和群組分類
{
  _id: ObjectId,
  userId: ObjectId,              // 分類擁有者
  scope: 'personal' | 'group',   // 🔑 分類範圍
  groupId: ObjectId | null,      // 群組ID (個人分類為null)
  // ... 其他欄位
}

// Users - 支援群組成員身份
{
  _id: ObjectId,
  email: String,
  // ... 基本資料
  groupId: ObjectId | null,      // 🔑 所屬群組 (未加入為null)
  groupRole: 'owner'|'admin'|'member'|null, // 群組角色
  groupJoinedAt: Date | null,    // 加入時間
}
```

---

## 🚀 開發階段架構

### Phase 1: 個人功能 MVP
重點：**架構預留，功能簡化**

```javascript
// API 設計 - 預留 Context 參數
GET  /api/records?context=personal     // 個人記錄 (預設)
POST /api/records { context: 'personal', ... } // 新增個人記錄
GET  /api/categories?scope=personal    // 個人分類 (預設)

// 資料庫設計 - 預留群組欄位
records: {
  context: 'personal',    // Phase 1 固定為 personal
  groupId: null,         // Phase 1 固定為 null
  createdBy: userId      // Phase 1 等於 userId
}

// 前端設計 - 預留切換器 UI
<ContextSwitcher 
  :contexts="['personal']"        // Phase 1 只顯示個人
  :current="'personal'"           // 固定個人模式
  :disabled="true"               // 暫時禁用切換
/>
```

### Phase 2: 群組功能整合
重點：**啟用擴展，無痛升級**

```javascript
// API 擴展 - 啟用 Context 參數
GET  /api/records?context=group        // 群組記錄 (新增)
POST /api/groups                       // 群組管理 (新增)

// 資料庫擴展 - 啟用群組欄位
records: {
  context: 'personal' | 'group',  // 支援兩種模式
  groupId: groupId | null,        // 動態群組ID
  createdBy: userId               // 建立者追蹤
}

// 前端擴展 - 啟用切換器
<ContextSwitcher 
  :contexts="user.groupId ? ['personal', 'group'] : ['personal']"
  :current="currentContext"
  @switch="handleContextSwitch"
/>
```

---

## 🎯 API 設計架構

### 統一 API 模式

**個人模式 API**：
```javascript
// Records API
GET    /api/records                    // 個人記錄列表
POST   /api/records                    // 新增個人記錄
PUT    /api/records/:id                // 更新個人記錄
DELETE /api/records/:id                // 刪除個人記錄

// Categories API  
GET    /api/categories                 // 個人分類列表
POST   /api/categories                 // 新增個人分類

// Statistics API
GET    /api/statistics/overview        // 個人統計總覽
GET    /api/statistics/trends          // 個人趨勢分析
```

**群組模式 API**：
```javascript
// Group Records API (Phase 2)
GET    /api/records?context=group      // 群組記錄列表
POST   /api/records { context: 'group' } // 新增群組記錄

// Group Management API (Phase 2)
POST   /api/groups                     // 建立群組
GET    /api/groups/:id                 // 群組詳情
PUT    /api/groups/:id                 // 更新群組設定
DELETE /api/groups/:id                 // 解散群組

// Group Members API (Phase 2)
POST   /api/groups/:id/invite          // 邀請成員
PUT    /api/groups/:id/members/:userId // 更新成員角色
DELETE /api/groups/:id/members/:userId // 移除成員

// Group Statistics API (Phase 2)
GET    /api/groups/:id/statistics      // 群組統計總覽
GET    /api/groups/:id/activities      // 群組活動日誌
```

### Context 中間件設計

```javascript
// /server/middleware/context.js
export default defineEventHandler(async (event) => {
  const user = await getCurrentUser(event)
  const context = getHeader(event, 'x-context') || 'personal'
  
  // 驗證 Context 有效性
  if (context === 'group' && !user.groupId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User not in any group'
    })
  }
  
  // 設定 Context 到 event
  event.context.userContext = {
    user,
    context,
    groupId: context === 'group' ? user.groupId : null
  }
})
```

### 權限中間件設計

```javascript
// /server/middleware/permissions.js
export function requirePermission(action, resource = null) {
  return defineEventHandler(async (event) => {
    const { user, context, groupId } = event.context.userContext
    
    if (context === 'personal') {
      // 個人模式權限檢查
      if (resource && resource.userId !== user._id) {
        throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
      }
    } 
    else if (context === 'group') {
      // 群組模式權限檢查
      const hasPermission = await checkGroupPermission(user, action, resource)
      if (!hasPermission) {
        throw createError({ statusCode: 403, statusMessage: 'Insufficient permissions' })
      }
    }
  })
}
```

---

## 📱 前端架構設計

### 狀態管理架構

```javascript
// /stores/context.js - Context 狀態管理
export const useContextStore = defineStore('context', () => {
  // 狀態
  const currentContext = ref('personal')
  const contextData = reactive({
    personal: {
      records: [],
      categories: [],
      statistics: null
    },
    group: {
      records: [],
      categories: [],
      statistics: null,
      members: [],
      activities: []
    }
  })

  // Actions
  const switchContext = async (newContext) => {
    if (newContext === currentContext.value) return
    
    // 清空目標 Context 的快取資料
    contextData[newContext] = getEmptyContextData()
    
    // 切換 Context
    currentContext.value = newContext
    
    // 重新載入資料
    await loadContextData(newContext)
  }

  const loadContextData = async (context) => {
    // 根據 context 載入對應資料
    if (context === 'personal') {
      contextData.personal.records = await $fetch('/api/records?context=personal')
      contextData.personal.categories = await $fetch('/api/categories?scope=personal')
    } else {
      contextData.group.records = await $fetch('/api/records?context=group')
      contextData.group.categories = await $fetch('/api/categories?scope=group')
    }
  }

  return {
    currentContext,
    contextData,
    switchContext,
    loadContextData
  }
})
```

### 元件架構設計

```vue
<!-- /components/ContextSwitcher.vue -->
<template>
  <div class="context-switcher">
    <button 
      @click="switchTo('personal')"
      :class="{ active: isPersonal, disabled: loading }"
      :disabled="loading"
    >
      🏠 個人帳本
    </button>
    
    <button 
      @click="switchTo('group')"
      :class="{ active: isGroup, disabled: !canUseGroup || loading }"
      :disabled="!canUseGroup || loading"
    >
      👥 群組帳本
      <span v-if="!canUseGroup" class="tooltip">
        需要先加入群組
      </span>
    </button>
    
    <!-- Loading 狀態 -->
    <div v-if="loading" class="loading-indicator">
      切換中...
    </div>
  </div>
</template>

<script setup>
const { user } = useAuth()
const { currentContext, switchContext } = useContextStore()

const isPersonal = computed(() => currentContext.value === 'personal')
const isGroup = computed(() => currentContext.value === 'group')
const canUseGroup = computed(() => !!user.value?.groupId)
const loading = ref(false)

const switchTo = async (context) => {
  if (context === 'group' && !canUseGroup.value) return
  
  loading.value = true
  try {
    await switchContext(context)
  } finally {
    loading.value = false
  }
}
</script>
```

### 頁面架構設計

```vue
<!-- /pages/records/index.vue -->
<template>
  <div class="records-page">
    <!-- Context 切換器 -->
    <ContextSwitcher />
    
    <!-- 根據 Context 顯示不同內容 -->
    <RecordsPersonal v-if="isPersonal" />
    <RecordsGroup v-else-if="isGroup" />
  </div>
</template>

<script setup>
const { currentContext } = useContextStore()
const { user } = useAuth()

const isPersonal = computed(() => currentContext.value === 'personal')
const isGroup = computed(() => currentContext.value === 'group' && user.value?.groupId)

// 頁面載入時確保 Context 有效
onMounted(() => {
  if (currentContext.value === 'group' && !user.value?.groupId) {
    // 如果設定為群組模式但用戶未加入群組，回到個人模式
    currentContext.value = 'personal'
  }
})
</script>
```

---

## 🔒 安全架構設計

### 資料隔離原則

1. **完全隔離**：個人資料與群組資料在查詢層面完全隔離
2. **權限分層**：個人權限和群組權限獨立檢查
3. **Context 驗證**：每個 API 請求都驗證 Context 的有效性

### 安全檢查清單

```javascript
// API 安全檢查
async function securityCheck(event) {
  const { user, context, groupId } = event.context.userContext
  
  // 1. Context 一致性檢查
  if (context === 'group' && !user.groupId) {
    throw new Error('Invalid context: user not in group')
  }
  
  // 2. 群組 ID 一致性檢查
  if (context === 'group' && groupId !== user.groupId) {
    throw new Error('Group ID mismatch')
  }
  
  // 3. 資源存取權限檢查
  if (resource && !hasAccessToResource(user, resource, context)) {
    throw new Error('Access denied to resource')
  }
}
```

---

## 📊 效能架構設計

### 快取策略

```javascript
// Context 相關的快取策略
const cacheStrategy = {
  personal: {
    records: 'session-cache',      // 瀏覽器 Session 快取
    categories: 'local-storage',   // 本地長期快取
    statistics: 'server-cache-5min' // 服務端 5 分鐘快取
  },
  group: {
    records: 'server-cache-1min',  // 群組資料快取時間較短
    members: 'server-cache-10min', // 成員列表快取較久
    activities: 'no-cache'         // 活動日誌不快取
  }
}
```

### 載入策略

```javascript
// 漸進式載入策略
const loadStrategy = {
  onAppStart: ['user', 'personal-categories'],
  onContextSwitch: {
    personal: ['records', 'statistics'],
    group: ['group-info', 'records', 'members']
  },
  lazy: ['activities', 'detailed-statistics']
}
```

---

## 🔄 資料同步架構

### 離線支援設計

```javascript
// 離線記帳同步機制
const syncStrategy = {
  offline: {
    store: 'indexedDB',           // 離線資料儲存
    queue: 'sync-queue',          // 同步佇列
    conflict: 'client-wins'       // 衝突解決策略
  },
  sync: {
    trigger: ['online', 'app-open', 'manual'],
    batch: 50,                    // 批次同步筆數
    retry: 3                      // 重試次數
  }
}
```

---

## 🚀 部署架構

### 環境配置

```javascript
// 環境配置策略
const deployConfig = {
  development: {
    context: {
      personal: 'enabled',
      group: 'disabled'           // 開發階段先關閉群組功能
    }
  },
  staging: {
    context: {
      personal: 'enabled',
      group: 'beta'               // 測試階段開放 beta 測試
    }
  },
  production: {
    context: {
      personal: 'enabled',
      group: 'enabled'            // 正式環境全面開放
    }
  }
}
```

---

## 📋 架構檢查清單

### Phase 1 個人功能架構
- [ ] Context 概念融入所有資料模型
- [ ] API 設計預留 Context 參數
- [ ] 前端狀態管理支援 Context 切換
- [ ] 權限系統支援個人模式
- [ ] 資料庫索引考慮 Context 查詢

### Phase 2 群組功能架構
- [ ] 群組資料模型完整實作
- [ ] 群組權限系統實作
- [ ] Context 切換功能完整可用
- [ ] 資料隔離 100% 有效
- [ ] 群組邀請和管理功能

### 擴展性檢查
- [ ] 新增 Context 類型成本低
- [ ] 權限系統易於擴展
- [ ] 前端元件高度複用
- [ ] API 介面向下相容
- [ ] 資料庫遷移策略清晰

最後更新時間: 2024-12-15
版本: 1.0.0