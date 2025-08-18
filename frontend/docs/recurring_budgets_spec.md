# 重複預算功能規格

## 功能概覽

重複預算功能讓用戶可以設定固定週期（月/季/年）的預算模板，系統會自動在每個週期開始時創建對應的預算。

## 使用情境

```
使用者：「我每個月都有固定的伙食預算 $5000、交通費 $2000」
需求：系統自動在每月1號創建這些預算，避免手動重複操作
```

## 核心設計

### 資料模型擴展

```typescript
interface IBudget {
  // 現有字段保持不變...
  
  // 重複預算新增字段
  isTemplate: boolean           // 是否為重複模板
  templateFrequency?: 'monthly' | 'quarterly' | 'yearly'  // 重複頻率
  lastGeneratedPeriod?: string  // 最後生成的期間標識
}
```

### 日期計算規則

| 頻率 | 起始日期 | 結束日期 | 期間標識格式 | 範例 |
|------|----------|----------|--------------|------|
| monthly | 每月1日 | 每月最後一天 | YYYY-MM | "2025-01", "2025-02" |
| quarterly | 每季第一天 | 每季最後一天 | YYYY-QN | "2025-Q1", "2025-Q2" |
| yearly | 1月1日 | 12月31日 | YYYY | "2025", "2026" |

### 季度日期映射

```typescript
const QUARTERLY_DATES = {
  Q1: { start: [0, 1],   end: [2, 31] },   // 1/1 - 3/31
  Q2: { start: [3, 1],   end: [5, 30] },   // 4/1 - 6/30
  Q3: { start: [6, 1],   end: [8, 30] },   // 7/1 - 9/30
  Q4: { start: [9, 1],   end: [11, 31] }   // 10/1 - 12/31
}
```

## API 設計

### 現有 API 擴展

```typescript
// POST /api/budgets - 創建預算（擴展）
interface CreateBudgetRequest {
  // 現有字段...
  isTemplate?: boolean           // 是否設為重複模板
  templateFrequency?: string     // 重複頻率（若 isTemplate = true）
}
```

### 新增 API 端點

```typescript
// 模板管理
GET    /api/budgets/templates                    // 獲取模板列表
POST   /api/budgets/:id/toggle-template          // 切換模板狀態
POST   /api/budgets/templates/generate-current   // 手動生成本期預算

// 模板信息
GET    /api/budgets/:id/template-info            // 獲取模板詳細信息
```

## 核心邏輯

### 1. 期間計算函數

```typescript
// 獲取當前期間標識
function getCurrentPeriod(frequency: string, date: Date = new Date()): string {
  const year = date.getFullYear()
  const month = date.getMonth()
  
  switch(frequency) {
    case 'monthly':
      return `${year}-${String(month + 1).padStart(2, '0')}`
    case 'quarterly':
      return `${year}-Q${Math.floor(month / 3) + 1}`
    case 'yearly':
      return `${year}`
    default:
      throw new Error(`不支援的頻率: ${frequency}`)
  }
}

// 計算期間日期範圍
function calculatePeriodDates(frequency: string, period: string): {startDate: Date, endDate: Date} {
  // 實作邏輯...
}
```

### 2. 自動生成檢查

```typescript
// 檢查並生成到期的預算
async function checkAndGenerateRecurringBudgets() {
  // 1. 找出所有模板預算
  const templates = await Budget.find({
    isTemplate: true,
    isDeleted: false,
    isActive: true
  })
  
  // 2. 檢查每個模板是否需要生成新期間
  for (const template of templates) {
    const currentPeriod = getCurrentPeriod(template.templateFrequency)
    
    if (template.lastGeneratedPeriod !== currentPeriod) {
      await generateBudgetFromTemplate(template, currentPeriod)
    }
  }
}
```

### 3. 模板複製邏輯

```typescript
async function generateBudgetFromTemplate(template: IBudget, targetPeriod: string) {
  // 1. 計算新期間日期
  const { startDate, endDate } = calculatePeriodDates(
    template.templateFrequency, 
    targetPeriod
  )
  
  // 2. 複製模板資料
  const newBudgetData = {
    ...template.toObject(),
    _id: undefined,           // 新的ID
    isTemplate: false,        // 不是模板
    templateFrequency: undefined,
    lastGeneratedPeriod: undefined,
    startDate,
    endDate,
    // 重置統計數據
    currentSpent: 0,
    usagePercentage: 0,
    remainingAmount: template.amount,
    // 其他統計字段重置...
  }
  
  // 3. 創建新預算
  const newBudget = new Budget(newBudgetData)
  await newBudget.save()
  
  // 4. 更新模板的最後生成期間
  template.lastGeneratedPeriod = targetPeriod
  await template.save()
  
  return newBudget
}
```

## 觸發機制

### 自動檢查時機

1. **每次 API 請求時** - 在預算相關 API 開始時檢查
2. **定時任務（未來）** - 每日執行一次
3. **手動觸發** - 提供手動生成按鈕

### 實作策略

Phase 1: 在每次預算 API 請求時檢查（簡單有效）
```typescript
// 在預算相關 middleware 中
export default defineEventHandler(async (event) => {
  if (event.node.req.url?.startsWith('/api/budgets')) {
    await checkAndGenerateRecurringBudgets()
  }
})
```

## UI/UX 設計

### 創建預算頁面

```
┌─ 預算設定 ──────────────────────────┐
│ 預算名稱: [八月伙食                ] │
│ 預算金額: [5000                   ] │
│ 期間類型: [每月 ▼]                 │
│ 開始日期: [2025-08-01             ] │
│ 結束日期: [2025-08-31             ] │
│                                   │
│ ☑️ 設為重複預算                    │
│   └── 系統將在每月自動創建此預算     │
└─────────────────────────────────────┘
```

### 預算列表頁面

```
預算列表:
┌─────────────────────────────────────┐
│ [🔄] 八月伙食預算    $5,000 [每月重複] │
│ [📅] 八月臨時開銷    $1,000 [一次性]  │
│ [🔄] Q3投資預算     $10,000 [每季重複] │
└─────────────────────────────────────┘

模板管理:
┌─────────────────────────────────────┐
│ 📋 重複預算模板                      │
│                                     │
│ [🔄] 伙食預算模板    $5,000 [每月]   │
│      └── 最後生成: 2025年8月          │
│      └── [立即生成本月] [編輯] [停用]  │
│                                     │
│ [🔄] 投資預算模板    $10,000 [每季]  │
│      └── 最後生成: 2025年Q3          │
│      └── [立即生成本季] [編輯] [停用]  │
└─────────────────────────────────────┘
```

### 預算詳情頁面

```
┌─ 預算資訊 ──────────────────────────┐
│ 名稱: 八月伙食預算                   │
│ 金額: $5,000                       │
│ 期間: 2025-08-01 ~ 2025-08-31      │
│                                   │
│ 🔄 重複設定                        │
│ └── 重複頻率: 每月                  │
│ └── 模板狀態: [啟用] [停用]          │
│ └── 最後生成: 2025年8月              │
│ └── [立即生成下月預算]               │
└─────────────────────────────────────┘
```

## 技術實作細節

### Database Migration

```javascript
// 為現有預算添加新字段
await Budget.updateMany({}, {
  $set: {
    isTemplate: false,
    templateFrequency: null,
    lastGeneratedPeriod: null
  }
})
```

### 索引優化

```javascript
// 為模板查詢添加索引
budgetSchema.index({ isTemplate: 1, isActive: 1, isDeleted: 1 })
budgetSchema.index({ userId: 1, isTemplate: 1 })
```

## 測試情境

### 單元測試

1. **期間計算測試**
   - 月份期間計算正確性
   - 季度期間計算正確性  
   - 年度期間計算正確性
   - 邊界情況（2月29日等）

2. **模板生成測試**
   - 模板複製正確性
   - 日期自動調整
   - 統計資料重置

### 整合測試

1. **自動生成流程**
   - 跨月自動生成
   - 跨季自動生成
   - 跨年自動生成

2. **用戶操作流程**
   - 創建模板預算
   - 手動生成預算
   - 停用/啟用模板

## 注意事項

1. **效能考量** - 在高流量時避免每次請求都檢查，考慮 Redis 快取
2. **錯誤處理** - 生成失敗時的回復機制
3. **資料一致性** - 避免重複生成同一期間的預算
4. **用戶權限** - 確保只生成用戶自己的預算模板
5. **時區處理** - 考慮用戶時區對日期計算的影響

---

*最後更新: 2025-08-18*  
*版本: 1.0.0*