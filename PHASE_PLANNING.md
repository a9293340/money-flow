# AI 財務規劃評估問卷 - 階段式開發規劃

## 📋 專案概覽

基於 User Stories US037-038，實作 AI 財務規劃評估問卷功能，分為 5 個階段漸進式開發。

---

## ✅ Phase 1: 基礎問卷框架 (已完成)

### 🎯 目標
建立多步驟問卷的基礎架構和資料收集

### ✅ 完成項目
- [x] 創建資料模型 `financial-profile.ts`
- [x] 實作基礎問卷組件 (QuestionnaireModal, QuestionStep, ProgressIndicator)
- [x] 建立狀態管理 `useFinancialProfile.ts`
- [x] 創建基礎頁面 `financial-planning.vue`
- [x] 添加導航入口 (漢堡選單 + Dashboard)
- [x] 基礎表單驗證和進度追蹤
- [x] 使用 sessionStorage 進行暫時儲存
- [x] TypeScript 類型檢查通過
- [x] ESLint 程式碼檢查通過

### 📦 交付物
- `frontend/lib/models/financial-profile.ts`
- `frontend/components/financial-questionnaire/`
- `frontend/composables/useFinancialProfile.ts`
- `frontend/pages/financial-planning.vue`
- `frontend/lib/data/questionnaire-data.ts`

---

## 🔜 Phase 2: 問卷內容與邏輯

### 🎯 目標
完善問卷內容和用戶互動邏輯

### 📋 計劃項目
- [ ] 實作完整的問卷問題設計
- [ ] 添加條件式問題邏輯
- [ ] 完善用戶互動體驗
- [ ] 增強資料驗證和錯誤處理
- [ ] 優化問卷流程和 UX

### 📦 預期交付物
- 完整的問卷資料收集流程
- 條件式邏輯系統
- 增強的驗證機制

---

## 🔜 Phase 3: AI 整合與分析

### 🎯 目標
整合 AI 分析功能

### 📋 計劃項目
- [ ] 整合 OpenAI API
- [ ] 實作 AI 分析邏輯
- [ ] 創建分析結果資料模型
- [ ] AI 回應的結構化處理

### 🚨 **重要規劃：AI 結果儲存與限制機制**

#### **🔐 七天限制機制** (Phase 3 後期實作)
1. **AI 結果持久化儲存**
   - 將 AI 分析結果儲存到 MongoDB
   - 記錄分析時間戳記
   - 建立用戶問卷歷史記錄

2. **七天重測限制**
   - 用戶完成問卷並獲得 AI 分析後，七天內無法重新測試
   - 在資料庫中記錄 `lastAnalysisDate` 和 `nextAvailableDate`
   - 前端檢查是否在限制期間內

#### **📊 資料庫設計規劃**
```typescript
interface FinancialProfileRecord {
  id: string
  userId: string
  profileData: IFinancialProfile
  aiAnalysisResult: AIAnalysisResult
  createdAt: Date
  lastAnalysisDate: Date
  nextAvailableDate: Date // createdAt + 7 days
  status: 'active' | 'expired'
}
```

#### **🔄 頁面載入邏輯** (Phase 3 後期實作)
1. **資料庫查詢**
   - 用戶進入頁面時查詢最新的問卷記錄
   - 檢查是否存在有效的 AI 分析結果

2. **狀態顯示**
   - 如果有有效記錄：顯示上次分析結果 + 剩餘等待時間
   - 如果無記錄或已過期：允許填寫新問卷
   - 顯示倒數計時器："還有 X 天 Y 小時可重新測試"

#### **⚠️ 實作時機**
**重要提醒**：以上兩點功能將在**所有功能測試完畢後**才加入，確保不影響開發和測試流程。

### 📦 預期交付物
- AI 分析 API 端點
- 結構化分析結果處理
- AI 服務整合
- **七天限制機制 (後期加入)**

---

## 🔜 Phase 4: 結果展示與報告

### 🎯 目標
實作分析結果的視覺化展示

### 📋 計劃項目
- [ ] 分析結果展示組件
- [ ] 財務健康評分視覺化
- [ ] 建議報告格式化顯示
- [ ] 結果匯出功能
- [ ] 歷史記錄查看

### 📦 預期交付物
- 完整的結果展示介面
- 視覺化圖表和指標
- 報告匯出功能

---

## 🔜 Phase 5: 整合與優化

### 🎯 目標
整合到主應用並優化體驗

### 📋 計劃項目
- [ ] 整合到主導航系統
- [ ] 與現有 AI 功能的協調
- [ ] 效能優化和錯誤處理
- [ ] 最終測試和調整
- [ ] 移動端適配優化

### 📦 預期交付物
- 完整整合的功能
- 優化的用戶體驗
- 完整的測試覆蓋

---

## 🚨 開發原則

### ✅ 每個 Phase 的標準
1. **嚴格範圍控制**：只實作當前 Phase 定義的功能
2. **完整性驗證**：每個 Phase 完成後進行用戶驗證
3. **品質保證**：TypeScript + ESLint 檢查必須通過
4. **測試友好**：保持開發和測試的便利性

### 🔄 Phase 切換流程
```
Phase N 實作 → 用戶驗證 → 用戶確認通過 → 進入 Phase N+1
```

### 📝 重要提醒
- **禁止跨 Phase 開發**：嚴格按階段進行
- **七天限制延後**：等所有功能測試完畢後才加入
- **保持測試便利**：開發期間維持 sessionStorage 的便利性

---

**最後更新時間**: 2025-08-26  
**當前狀態**: Phase 1 完成，等待用戶驗證