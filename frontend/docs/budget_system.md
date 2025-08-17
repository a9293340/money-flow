# 預算管理系統設計文檔

## 📋 概覽

預算管理系統提供用戶按分類、時間週期設定預算額度，並自動追蹤支出進度和警告超支風險的功能。

## 🗄️ 資料模型設計

### Budget Schema

```typescript
interface IBudget {
  _id: string                    // 預算唯一識別碼
  userId: string                 // 用戶ID
  
  // 基本資訊
  name: string                   // 預算名稱 (必填，最大100字元)
  description?: string           // 預算描述 (選填，最大500字元)
  
  // 預算設定
  amount: number                 // 預算金額 (必填，>0)
  currency: string               // 幣別代碼 (3位大寫字母，預設TWD)
  baseCurrencyAmount?: number    // 基準幣別金額
  
  // 分類和期間設定
  categoryIds: string[]          // 適用分類ID列表 (空陣列=全部分類)
  periodType: BudgetPeriodType   // 預算週期 (monthly/quarterly/yearly)
  
  // 時間範圍
  startDate: Date               // 開始日期 (必填)
  endDate: Date                 // 結束日期 (必填，>=startDate)
  
  // 狀態和追蹤
  status: BudgetStatus          // 預算狀態
  currentSpent: number          // 目前已花費金額
  currentSpentBaseCurrency?: number // 基準幣別已花費金額
  
  // 警告設定
  warningThreshold: number      // 警告閾值百分比 (預設80)
  warningLevel: BudgetWarningLevel // 當前警告級別
  
  // 統計資訊 (自動計算)
  usagePercentage: number       // 使用率百分比
  remainingAmount: number       // 剩餘金額
  remainingDays: number         // 剩餘天數
  avgDailySpent: number        // 平均每日支出
  projectedTotal: number       // 預測總支出
  
  // 系統欄位
  isActive: boolean            // 是否啟用
  isDeleted: boolean           // 軟刪除標記
  context: 'system' | 'personal' // 資料來源
  
  // 時間戳記
  createdAt: Date
  updatedAt: Date
  lastCalculatedAt?: Date      // 最後統計計算時間
}
```

### 列舉定義

```typescript
// 預算週期類型
enum BudgetPeriodType {
  MONTHLY = 'monthly',        // 月度預算
  YEARLY = 'yearly',          // 年度預算
  QUARTERLY = 'quarterly'     // 季度預算
}

// 預算狀態
enum BudgetStatus {
  ACTIVE = 'active',          // 啟用中
  INACTIVE = 'inactive',      // 已停用
  COMPLETED = 'completed',    // 已完成
  EXCEEDED = 'exceeded'       // 已超支
}

// 預算警告級別
enum BudgetWarningLevel {
  SAFE = 'safe',              // 安全範圍 (0-70%)
  WARNING = 'warning',        // 警告範圍 (70-90%)
  DANGER = 'danger',          // 危險範圍 (90-100%)
  EXCEEDED = 'exceeded'       // 已超支 (>100%)
}
```

## 📊 資料庫索引設計

### 主要索引
```javascript
// 複合索引
{ userId: 1, isDeleted: 1 }        // 用戶預算查詢
{ userId: 1, status: 1 }           // 狀態篩選查詢
{ userId: 1, startDate: 1, endDate: 1 } // 時間範圍查詢
{ userId: 1, categoryIds: 1 }      // 分類預算查詢
{ endDate: 1, status: 1 }          // 過期預算清理
```

## 🔄 核心功能邏輯

### 1. 預算統計自動計算

```typescript
calculateStats(records: any[]): void {
  // 計算剩餘天數
  this.remainingDays = Math.max(0, 剩餘天數)
  
  // 計算使用率
  this.usagePercentage = (currentSpent / amount) * 100
  
  // 計算剩餘金額
  this.remainingAmount = Math.max(0, amount - currentSpent)
  
  // 計算平均每日支出
  this.avgDailySpent = currentSpent / 已過天數
  
  // 預測總支出
  this.projectedTotal = currentSpent + (avgDailySpent * remainingDays)
  
  // 更新警告級別和狀態
  updateWarningLevel()
  updateStatus()
}
```

### 2. 警告級別判定

```typescript
// 警告級別判定邏輯
if (usagePercentage >= 100) {
  warningLevel = EXCEEDED
  status = EXCEEDED
} else if (usagePercentage >= 90) {
  warningLevel = DANGER
} else if (usagePercentage >= warningThreshold) {
  warningLevel = WARNING
} else {
  warningLevel = SAFE
}
```

### 3. 記錄影響預算判定

```typescript
isRecordAffectsBudget(budget: IBudget, categoryId: string): boolean {
  // 全分類預算 (categoryIds 為空陣列)
  if (budget.categoryIds.length === 0) return true
  
  // 特定分類預算
  return budget.categoryIds.includes(categoryId)
}
```

## 🔧 工具函數

### BudgetUtils 類別

```typescript
class BudgetUtils {
  // 檢查記錄是否影響預算
  static isRecordAffectsBudget(budget, categoryId): boolean
  
  // 計算預算期間的支出總額
  static calculateSpentAmount(records, budget): number
  
  // 生成預算期間
  static generateBudgetPeriod(periodType, referenceDate): {startDate, endDate}
  
  // 格式化期間顯示
  static formatPeriodDisplay(budget): string
}
```

## 📡 API 端點設計 (下階段實作)

```typescript
// 預算 CRUD
GET    /api/budgets              // 獲取預算列表
POST   /api/budgets              // 創建預算
GET    /api/budgets/:id          // 獲取特定預算
PUT    /api/budgets/:id          // 更新預算
DELETE /api/budgets/:id          // 刪除預算

// 預算統計
GET /api/budgets/stats           // 獲取預算統計概覽
GET /api/budgets/:id/progress    // 獲取預算進度詳情
POST /api/budgets/:id/recalculate // 重新計算預算統計

// 預算警告
GET /api/budgets/warnings        // 獲取預算警告列表
```

## 🎯 使用場景

### 1. 月度生活費預算
```typescript
{
  name: "2024年8月生活費",
  amount: 30000,
  currency: "TWD",
  categoryIds: ["食物", "交通", "娛樂"],
  periodType: "monthly",
  startDate: "2024-08-01",
  endDate: "2024-08-31",
  warningThreshold: 80
}
```

### 2. 年度旅遊預算
```typescript
{
  name: "2024年度旅遊基金",
  amount: 100000,
  currency: "TWD", 
  categoryIds: ["旅遊"],
  periodType: "yearly",
  startDate: "2024-01-01",
  endDate: "2024-12-31",
  warningThreshold: 85
}
```

### 3. 全分類支出控制
```typescript
{
  name: "每月總支出控制",
  amount: 50000,
  currency: "TWD",
  categoryIds: [], // 空陣列表示所有分類
  periodType: "monthly",
  warningThreshold: 90
}
```

## 🔍 查詢模式

### 1. 獲取用戶啟用的預算
```typescript
Budget.findActiveBudgets(userId)
```

### 2. 查找特定分類的預算
```typescript
Budget.findBudgetsByCategory(userId, categoryId)
```

### 3. 查找需要警告的預算
```typescript
Budget.find({
  userId,
  isDeleted: false,
  status: BudgetStatus.ACTIVE,
  warningLevel: { $in: [BudgetWarningLevel.WARNING, BudgetWarningLevel.DANGER] }
})
```

## 🔐 資料驗證規則

### 基本驗證
- `amount`: 必須 > 0
- `currency`: 必須為 3 位大寫字母 (如 TWD, USD)
- `startDate` ≤ `endDate`
- `warningThreshold`: 0-100 之間
- `categoryIds`: 每個都必須是有效的 ObjectId

### 業務邏輯驗證
- 同一用戶不能有重疊期間的相同分類預算
- 預算金額不能小於已花費金額（更新時）
- 過期預算不能被啟用

## 📈 性能考量

### 索引優化
- 所有查詢都包含 `userId` 和 `isDeleted`
- 時間範圍查詢使用複合索引
- 定期清理過期預算記錄

### 計算優化
- 統計資訊在記錄變更時觸發重算
- 批次更新多個預算的統計
- 快取常用的預算查詢結果

## 🧪 測試案例

### 1. 基本功能測試
- 創建、讀取、更新、刪除預算
- 預算統計計算準確性
- 警告級別判定邏輯

### 2. 邊界條件測試
- 零金額預算處理
- 過期預算狀態更新
- 分類刪除對預算的影響

### 3. 併發測試
- 多個記錄同時影響預算
- 預算統計並發更新
- 預算警告觸發機制

---

## 📝 後續開發計劃

1. **Phase 3-2**: 實作預算 CRUD API
2. **Phase 3-3**: 建立預算管理前端頁面
3. **Phase 3-4**: 實作預算執行追蹤功能
4. **Phase 3-12**: 實作預算超支警告功能
5. **Phase 3-13**: 建立預算儀表板

---

*最後更新: 2024-08-16*
*版本: 1.0.0*