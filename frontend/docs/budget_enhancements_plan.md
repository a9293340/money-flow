# 預算功能增強規劃

## 📊 功能概覽

### 1. 重複預算功能 (Recurring Budgets)
自動創建每月/季/年固定預算，避免重複手動操作

### 2. 預算數量限制擴展
從每期間3個預算提升至5個，並支援會員等級差異化

---

## 🔄 功能一：重複預算功能

### 1.1 使用情境
```
使用者：「我每個月都有固定的餐飲預算5000元、交通費2000元」
需求：自動在每月1號創建這些固定預算，避免手動重複操作
```

### 1.2 資料模型擴展

```typescript
interface IBudget {
  // 現有字段...
  
  // 重複設定
  isRecurring: boolean                    // 是否為重複預算模板
  recurringConfig?: {
    frequency: 'monthly' | 'quarterly' | 'yearly'  // 重複頻率
    autoCreate: boolean                   // 是否自動創建
    nextDueDate: Date                    // 下次創建日期
    endDate?: Date                       // 重複結束日期（無限則不設）
    maxRecurrences?: number              // 最大重複次數
    currentRecurrence: number            // 當前已創建次數
    lastCreatedDate?: Date               // 最後創建日期
  }
  
  // 關聯資訊  
  parentRecurringId?: string             // 源重複預算ID（如果是自動創建的）
  isGeneratedFromRecurring: boolean      // 是否為自動生成的預算
}
```

### 1.3 API 端點設計

```typescript
// 重複預算管理
GET    /api/budgets/recurring                    // 獲取重複預算模板列表
POST   /api/budgets/:id/enable-recurring        // 啟用重複功能
PUT    /api/budgets/:id/recurring-config        // 更新重複設定
DELETE /api/budgets/:id/disable-recurring       // 停用重複功能

// 手動操作
POST   /api/budgets/:id/create-next            // 立即創建下一期
POST   /api/budgets/:id/skip-next              // 跳過下一期創建
POST   /api/budgets/recurring/batch-create     // 批量創建到期的重複預算

// 預覽和統計
GET    /api/budgets/recurring/:id/preview      // 預覽未來N期的預算
GET    /api/budgets/recurring/statistics       // 重複預算統計
```

### 1.4 核心邏輯流程

#### A. 創建重複預算模板
1. 用戶創建普通預算
2. 選擇「設為重複預算」
3. 設定重複頻率和規則
4. 系統標記為 `isRecurring: true`

#### B. 自動創建機制
```typescript
// 每日定時任務檢查
async function checkAndCreateRecurringBudgets() {
  const dueRecurringBudgets = await Budget.find({
    isRecurring: true,
    'recurringConfig.autoCreate': true,
    'recurringConfig.nextDueDate': { $lte: new Date() }
  })
  
  for (const template of dueRecurringBudgets) {
    await createNextRecurringBudget(template)
  }
}
```

#### C. 手動控制選項
- ✅ 立即創建下一期
- ⏭️ 跳過這一期  
- ⏸️ 暫停重複創建
- 🔄 修改重複規則

### 1.5 UI/UX 設計要點

#### 預算列表頁
```
[🔄] 八月伙食預算         $5,000   [每月重複]
[📅] 八月交通費           $2,000   [一次性]
[🔄] Q3投資預算          $10,000  [每季重複]
```

#### 預算詳情頁新增區塊
```
┌─ 重複設定 ─────────────────────────┐
│ 🔄 重複頻率: 每月                    │
│ 📅 下次創建: 2025-09-01              │
│ 📊 已創建: 3/12 期                   │
│ ⚙️  [修改設定] [立即創建] [跳過一期]    │
└────────────────────────────────────┘
```

---

## 📈 功能二：預算數量限制擴展

### 2.1 會員等級系統

```typescript
enum UserTier {
  FREE = 'free',           // 免費用戶
  PREMIUM = 'premium',     // 付費用戶  
  VIP = 'vip'             // VIP用戶
}

interface BudgetLimits {
  maxBudgetsPerPeriod: {
    free: 5,              // 免費：每期間5個預算
    premium: 15,          // 付費：每期間15個預算
    vip: -1              // VIP：無限制 (-1表示無限)
  },
  maxRecurringBudgets: {
    free: 3,              // 免費：3個重複預算模板
    premium: 10,          // 付費：10個重複預算模板
    vip: -1              // VIP：無限制
  }
}
```

### 2.2 用戶模型擴展

```typescript
interface IUser {
  // 現有字段...
  
  // 會員資訊
  subscription?: {
    tier: UserTier
    planName: string        // 'basic', 'pro', 'enterprise'
    startDate: Date
    endDate?: Date          // 到期日，終身會員則不設
    isActive: boolean
    features: string[]      // 啟用的功能列表
  }
}
```

### 2.3 限制檢查邏輯

```typescript
// 預算創建前檢查
async function validateBudgetCreation(userId: string, periodType: string, startDate: Date, endDate: Date) {
  const user = await User.findById(userId)
  const userTier = user.subscription?.tier || UserTier.FREE
  
  // 檢查同期間預算數量
  const existingCount = await Budget.countDocuments({
    userId,
    periodType,
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
    isDeleted: false
  })
  
  const limit = BUDGET_LIMITS.maxBudgetsPerPeriod[userTier]
  if (limit > 0 && existingCount >= limit) {
    throw new Error(`${userTier} 用戶每期間最多只能創建 ${limit} 個預算`)
  }
  
  return { allowed: true, remaining: limit - existingCount }
}
```

### 2.4 升級提示 UI

```typescript
// 當用戶達到限制時顯示
┌─ 預算數量已達上限 ──────────────────┐
│ 免費用戶每月最多可創建 5 個預算        │
│ 目前已使用: 5/5                     │
│                                   │
│ 升級至付費版本可獲得:                 │
│ ✨ 每期間 15 個預算                  │
│ 🔄 10 個重複預算模板                │
│ 📊 進階分析報告                     │
│                                   │
│     [升級方案] [了解更多]             │
└─────────────────────────────────────┘
```

---

## 🚀 實作優先順序與時程

### Phase 1: 預算數量限制擴展 (1週)
**優先級：高** - 立即可用，影響用戶體驗

- [x] 更新預算創建限制從3個→5個
- [x] 實作會員等級檢查邏輯
- [x] 更新前端限制提示
- [x] 添加升級提示UI

### Phase 2: 重複預算基礎功能 (2週)  
**優先級：中高** - 核心功能實作

- [ ] 擴展Budget資料模型
- [ ] 實作重複預算創建邏輯
- [ ] 基礎API端點開發
- [ ] 前端重複設定界面

### Phase 3: 重複預算進階功能 (1.5週)
**優先級：中** - 增強用戶體驗

- [ ] 自動創建定時任務
- [ ] 手動控制功能
- [ ] 預算預覽功能
- [ ] 統計和分析界面

### Phase 4: 會員系統整合 (1週)
**優先級：低** - 商業化功能

- [ ] 用戶升級流程
- [ ] 付費功能解鎖
- [ ] 會員管理界面
- [ ] 升級提示優化

---

## 🛠️ 技術實作細節

### 1. 定時任務實作選項

#### Option A: Node.js Cron Job
```typescript
import cron from 'node-cron'

// 每日凌晨1點檢查
cron.schedule('0 1 * * *', async () => {
  await checkAndCreateRecurringBudgets()
})
```

#### Option B: Nuxt Server Middleware
```typescript
// server/middleware/recurring-budgets.ts
export default defineEventHandler(async (event) => {
  // 每次請求時檢查是否需要執行定時任務
  if (shouldRunRecurringCheck()) {
    await checkAndCreateRecurringBudgets()
  }
})
```

### 2. 資料庫遷移腳本
```javascript
// scripts/migrate-budget-enhancements.js
async function migrateBudgetEnhancements() {
  // 1. 為現有預算添加新字段
  await Budget.updateMany({}, {
    $set: {
      isRecurring: false,
      isGeneratedFromRecurring: false
    }
  })
  
  // 2. 更新用戶預設會員等級
  await User.updateMany({}, {
    $set: {
      'subscription.tier': 'free'
    }
  })
}
```

---

## 📊 成功指標

### 用戶體驗指標
- 重複預算功能使用率 > 30%
- 預算創建時間減少 > 60%
- 用戶滿意度提升

### 技術指標  
- API 響應時間 < 500ms
- 自動創建成功率 > 99%
- 系統穩定性維持

### 商業指標
- 付費轉換率提升
- 用戶留存率改善
- 功能使用頻率增加

---

## 🔮 未來擴展可能

1. **智能預算建議** - AI 分析歷史數據推薦預算設定
2. **預算模板市場** - 用戶分享和下載預算模板  
3. **團隊/家庭預算** - 多人協作預算管理
4. **預算達成獎勵** - gamification 元素
5. **第三方整合** - 銀行API自動同步實際支出

---

*最後更新: 2025-08-18*  
*版本: 1.0.0*  
*狀態: 規劃階段*