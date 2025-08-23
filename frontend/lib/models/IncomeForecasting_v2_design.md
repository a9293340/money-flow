# 收入預測模型 v2 設計 - 收款日概念

## 核心改進

### 1. 新增收款日設定
```typescript
export interface IIncomeForecasting extends Document {
  // ... 現有欄位 ...
  
  // === 收款日設定 (新增) ===
  paymentSchedule: {
    // 收款日類型
    type: 'fixed_day_of_month' | 'fixed_date' | 'working_day' | 'custom'
    
    // 收款日設定
    dayOfMonth?: number // 每月幾號 (1-31)，用於 fixed_day_of_month
    fixedDate?: Date // 固定日期，用於 fixed_date
    workingDayOffset?: number // 月底工作日偏移，用於 working_day (如 -1 = 月底最後一個工作日)
    customRule?: string // 自定義規則，用於 custom
    
    // 容錯處理
    fallbackRule: 'next_working_day' | 'previous_working_day' | 'exact_date'
  }
  
  // 原有的 matchingConfig 保持不變，但 dateTolerance 語義改變
  matchingConfig: {
    amountTolerance: number // 金額容差百分比
    dateTolerance: number // 基於【收款日】的日期容差，不再是期間範圍
    autoMatch: boolean
  }
}
```

### 2. 期間生成邏輯改進
```typescript
// 每個期間會計算出具體的期望收款日
export interface IIncomePeriod extends Document {
  // ... 現有欄位 ...
  
  // === 新增收款日欄位 ===
  expectedPaymentDate: Date // 該期間的期望收款日
  actualPaymentDates: Date[] // 實際收款日期（可能有多筆）
  
  // === 改進匹配範圍 ===
  matchingDateRange: {
    startDate: Date // expectedPaymentDate - dateTolerance
    endDate: Date // expectedPaymentDate + dateTolerance
  }
}
```

### 3. 實際使用場景

#### 場景 1: 月薪固定日期
```
收入預測: "薪資收入"
- expectedAmount: 60000
- frequency: "monthly"  
- paymentSchedule.type: "fixed_day_of_month"
- paymentSchedule.dayOfMonth: 25  // 每月25號發薪
- matchingConfig.dateTolerance: 3 // ±3天

期間生成:
- 7月期間: expectedPaymentDate = 2025-07-25, 匹配範圍 07-22 到 07-28
- 8月期間: expectedPaymentDate = 2025-08-25, 匹配範圍 08-22 到 08-28
- 9月期間: expectedPaymentDate = 2025-09-25, 匹配範圍 09-22 到 09-28
```

#### 場景 2: 月底最後工作日
```
收入預測: "獎金"
- paymentSchedule.type: "working_day"
- paymentSchedule.workingDayOffset: -1  // 月底最後一個工作日
- matchingConfig.dateTolerance: 2

期間生成:
- 8月期間: expectedPaymentDate = 2025-08-29 (8月最後工作日), 匹配範圍 08-27 到 08-31
```

### 4. 匹配邏輯改進

```typescript
// 新的匹配查詢邏輯
async function findMatchingRecords(period: IIncomePeriod, forecasting: IIncomeForecasting) {
  const matchCriteria = {
    userId: forecasting.userId,
    type: 'income',
    category: forecasting.incomeCategory,
    isDeleted: false,
    incomeForecastMatching: { $exists: false },
    
    // 關鍵改進: 基於期望收款日進行匹配
    date: {
      $gte: period.matchingDateRange.startDate,
      $lte: period.matchingDateRange.endDate
    },
    
    // 金額範圍保持不變
    amount: {
      $gte: forecasting.expectedAmount * (1 - forecasting.matchingConfig.amountTolerance / 100),
      $lte: forecasting.expectedAmount * (1 + forecasting.matchingConfig.amountTolerance / 100)
    }
  }
  
  return await Record.find(matchCriteria)
}
```

## 優勢分析

### 1. 更精準的匹配
- ❌ 舊邏輯: 8月任何日期的薪資都可能匹配（8/1-8/31 ±7天 = 7/25-9/7）
- ✅ 新邏輯: 只有8月25日±3天的薪資會匹配（8/22-8/28）

### 2. 更符合實際業務邏輯
- 大多數薪資、獎金都有固定的發放日期
- 系統可以更準確地預測和追蹤收款狀況

### 3. 更好的異常檢測
- 如果薪資在預期日期之外到帳，可以標記為異常
- 幫助使用者發現發薪日期變動

### 4. 支援複雜發薪規則
- 月底最後工作日發薪
- 遇假日順延到工作日
- 自定義發薪規則

## 實作考慮

### 1. 資料遷移
由於你說會把現有的砍掉重建，這個改進可以直接實作

### 2. UI/UX 改進
新增收款日設定介面：
- 簡單模式: "每月幾號發薪"
- 進階模式: 工作日規則、自定義規則

### 3. 向後相容性
如果需要保持相容，可以：
- 舊記錄的 paymentSchedule 預設為期間中點
- 逐步遷移到新的收款日模式