# 期望目標(Savings Goals)功能 - 用戶故事

## 功能概覽

期望目標功能允許用戶設定和追蹤財務儲蓄目標，提供視覺化進度追蹤和智能建議，幫助用戶實現短期和長期的財務目標。

## 用戶故事 (User Stories)

### Phase 4-1: 基礎目標管理

#### Story 4.1.1: 創建儲蓄目標
**身份**: 個人用戶  
**需求**: 我想要創建一個新的儲蓄目標  
**目的**: 明確我的儲蓄計劃並設定具體的金額和時間目標  

**驗收條件**:
- [x] 用戶可以設定目標名稱（如「買房頭期款」、「歐洲旅行基金」）
- [x] 用戶可以設定目標金額（支援多幣別）
- [x] 用戶可以設定目標完成日期
- [x] 用戶可以選擇目標類型（短期、中期、長期）
- [x] 用戶可以設定每月/每週預期儲蓄金額
- [x] 系統自動計算需要的儲蓄期間和建議金額
- [x] 支援目標描述和備註

#### Story 4.1.2: 查看目標列表
**身份**: 個人用戶  
**需求**: 我想要查看我所有的儲蓄目標  
**目的**: 快速了解我的所有儲蓄計劃和進度狀況  

**驗收條件**:
- [x] 顯示所有儲蓄目標的卡片列表
- [x] 每個卡片顯示：目標名稱、目標金額、當前金額、進度百分比、剩餘天數
- [x] 支援按狀態篩選（進行中、已完成、已暫停、逾期）
- [x] 支援按類型篩選（短期、中期、長期）
- [x] 支援搜尋功能
- [x] 顯示視覺化進度條
- [x] 快速操作按鈕（編輯、刪除、添加金額）

#### Story 4.1.3: 目標詳情頁面
**身份**: 個人用戶  
**需求**: 我想要查看特定儲蓄目標的詳細資訊  
**目的**: 深入了解目標進度、歷史記錄和預測分析  

**驗收條件**:
- [x] 顯示目標的完整資訊（名稱、描述、目標金額、目標日期等）
- [x] 視覺化進度圖表（折線圖顯示儲蓄進度）
- [x] 儲蓄歷史記錄列表
- [x] 目標達成預測（基於當前儲蓄速度）
- [x] 統計資訊（日均儲蓄、月均儲蓄、最大單筆存入等）
- [x] 快速操作（編輯目標、添加儲蓄、暫停/恢復目標）

### Phase 4-2: 儲蓄記錄管理

#### Story 4.2.1: 添加儲蓄記錄
**身份**: 個人用戶  
**需求**: 我想要記錄我向目標添加的儲蓄金額  
**目的**: 追蹤我的儲蓄進度並更新目標狀態  

**驗收條件**:
- [x] 支援手動添加儲蓄金額
- [x] 可以選擇儲蓄來源（薪資、獎金、投資收益等）
- [x] 支援添加備註說明
- [x] 自動更新目標進度
- [x] 支援多幣別轉換
- [x] 可以設定儲蓄日期（預設為今天）

#### Story 4.2.2: 自動儲蓄規則
**身份**: 個人用戶  
**需求**: 我想要設定自動儲蓄規則  
**目的**: 讓系統自動從我的收入記錄中分配金額到儲蓄目標  

**驗收條件**:
- [x] 設定自動儲蓄比例（如收入的10%）
- [x] 設定觸發條件（每筆收入、月初、指定日期）
- [x] 支援多目標分配（按比例分配到不同目標）
- [x] 可以設定最低觸發金額
- [x] 自動儲蓄歷史記錄
- [x] 暫停/恢復自動儲蓄功能

### Phase 4-3: 智能分析與建議

#### Story 4.3.1: 進度分析
**身份**: 個人用戶  
**需求**: 我想要了解我的儲蓄進度分析  
**目的**: 評估我的儲蓄效率並獲得改進建議  

**驗收條件**:
- [x] 儲蓄速度分析（是否按計劃進行）
- [x] 目標達成預測（基於當前趨勢）
- [x] 儲蓄習慣分析（頻率、金額模式）
- [x] 與其他目標的比較分析
- [x] 季節性儲蓄模式識別
- [x] 儲蓄效率評分

#### Story 4.3.2: 智能建議系統
**身份**: 個人用戶  
**需求**: 我想要獲得個性化的儲蓄建議  
**目的**: 優化我的儲蓄策略並提高目標達成率  

**驗收條件**:
- [x] 基於支出分析的節約建議
- [x] 目標優先級建議（根據重要性和可行性）
- [x] 儲蓄金額調整建議
- [x] 目標期限調整建議
- [x] 多目標平衡建議
- [x] 風險評估和提醒

### Phase 4-4: 可視化與報告

#### Story 4.4.1: 儲蓄儀表板
**身份**: 個人用戶  
**需求**: 我想要一個綜合的儲蓄儀表板  
**目的**: 一次性查看所有儲蓄目標的整體狀況  

**驗收條件**:
- [x] 總儲蓄概覽（總目標金額、已儲蓄金額、整體進度）
- [x] 目標狀態統計（進行中、已完成、逾期等數量）
- [x] 本月儲蓄統計
- [x] 目標達成時間線
- [x] 熱力圖顯示儲蓄活躍度
- [x] 近期儲蓄活動動態

#### Story 4.4.2: 儲蓄報告
**身份**: 個人用戶  
**需求**: 我想要生成詳細的儲蓄報告  
**目的**: 分析我的儲蓄模式並進行長期規劃  

**驗收條件**:
- [x] 月度/季度/年度儲蓄報告
- [x] 目標達成率統計
- [x] 儲蓄來源分析
- [x] 目標類型分布
- [x] 儲蓄趨勢圖表
- [x] 支援匯出PDF報告

### Phase 4-5: 高級功能

#### Story 4.5.1: 目標分享與動機
**身份**: 個人用戶  
**需求**: 我想要分享我的儲蓄成就  
**目的**: 獲得動機並激勵自己繼續儲蓄  

**驗收條件**:
- [x] 成就系統（里程碑獎章）
- [x] 進度分享功能（生成分享圖片）
- [x] 目標完成慶祝動畫
- [x] 儲蓄挑戰功能
- [x] 動機名言和提醒

#### Story 4.5.2: 目標模板
**身份**: 個人用戶  
**需求**: 我想要使用預設的目標模板  
**目的**: 快速創建常見的儲蓄目標  

**驗收條件**:
- [x] 預設目標模板（緊急基金、旅行基金、買房基金等）
- [x] 自定義模板創建
- [x] 模板分享功能
- [x] 智能金額建議（基於收入水平）
- [x] 目標期限建議

## 技術規格

### 資料模型

```typescript
interface SavingsGoal {
  _id: string
  userId: string
  name: string                           // 目標名稱
  description?: string                   // 目標描述
  targetAmount: number                   // 目標金額
  currentAmount: number                  // 當前金額
  currency: string                       // 幣別
  targetDate: Date                       // 目標達成日期
  goalType: 'short_term' | 'medium_term' | 'long_term'  // 目標類型
  status: 'active' | 'completed' | 'paused' | 'overdue' // 狀態
  monthlySavingsTarget?: number          // 每月儲蓄目標
  weeklySavingsTarget?: number           // 每週儲蓄目標
  autoSavingRules?: AutoSavingRule[]     // 自動儲蓄規則
  priority: number                       // 優先級 1-5
  isPublic: boolean                      // 是否公開
  createdAt: Date
  updatedAt: Date
}

interface SavingsRecord {
  _id: string
  goalId: string                         // 關聯的目標ID
  amount: number                         // 儲蓄金額
  currency: string                       // 幣別
  baseCurrencyAmount?: number            // 基準幣別金額
  source: 'manual' | 'auto' | 'transfer' // 來源類型
  sourceCategory?: string                // 來源分類
  description?: string                   // 備註
  recordDate: Date                       // 記錄日期
  createdAt: Date
}

interface AutoSavingRule {
  _id: string
  goalId: string
  ruleName: string                       // 規則名稱
  trigger: 'income' | 'monthly' | 'weekly' | 'custom' // 觸發條件
  amount?: number                        // 固定金額
  percentage?: number                    // 百分比
  minTriggerAmount?: number              // 最低觸發金額
  isActive: boolean                      // 是否啟用
  lastTriggered?: Date                   // 最後觸發時間
  createdAt: Date
}
```

### API 端點

```
GET    /api/savings-goals              // 獲取目標列表
POST   /api/savings-goals              // 創建新目標
GET    /api/savings-goals/:id          // 獲取目標詳情
PUT    /api/savings-goals/:id          // 更新目標
DELETE /api/savings-goals/:id          // 刪除目標

POST   /api/savings-goals/:id/records  // 添加儲蓄記錄
GET    /api/savings-goals/:id/records  // 獲取儲蓄記錄
PUT    /api/savings-goals/:id/records/:recordId  // 更新記錄
DELETE /api/savings-goals/:id/records/:recordId  // 刪除記錄

GET    /api/savings-goals/stats        // 獲取儲蓄統計
GET    /api/savings-goals/dashboard    // 獲取儀表板數據
GET    /api/savings-goals/analysis     // 獲取分析報告

POST   /api/savings-goals/:id/auto-saving  // 設定自動儲蓄
GET    /api/savings-goals/templates    // 獲取目標模板
```

## 開發計劃

### Phase 4-1 (預計 2 週)
- 基礎資料模型設計
- 目標CRUD API開發
- 基礎前端界面

### Phase 4-2 (預計 1.5 週) 
- 儲蓄記錄管理
- 自動儲蓄規則引擎
- 記錄管理界面

### Phase 4-3 (預計 2 週)
- 智能分析算法
- 建議系統開發
- 分析界面實作

### Phase 4-4 (預計 1.5 週)
- 可視化圖表開發
- 儀表板界面
- 報告生成功能

### Phase 4-5 (預計 1 週)
- 高級功能實作
- 性能優化
- 用戶體驗優化

**總預計開發時間**: 8 週

---

*最後更新: 2025-08-17*  
*版本: 1.0.0*