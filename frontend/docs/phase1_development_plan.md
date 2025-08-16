# Personal Finance Manager - Phase 1 個人記帳功能開發規劃

## 📋 概述

本文檔記錄了 Personal Finance Manager Phase 1 個人記帳功能的完整開發規劃，採用穩健的逐步完成方式，確保每個階段品質和功能完整性。

### 🎯 開發目標
- **個人記帳 MVP**：完整可用的個人記帳應用
- **架構前瞻性**：預留群組功能擴展能力  
- **移動端優先**：優化移動端使用體驗
- **品質保證**：每階段充分測試後再進入下一階段

### ⏰ 總時程規劃
- **預估時間**：2-3 週
- **開發方式**：方案A - 逐步完成 (穩健方式)
- **里程碑**：8 個開發階段，每階段都有明確交付成果

---

## 🗓️ 開發階段規劃

### **📅 Week 1: 資料模型與 API 開發**

#### **Phase 1.1: 更新 User Model 支援群組欄位**
**時程：0.5 天 | 狀態：待開始**

**目標**：
- 在現有 User model 加入群組相關欄位
- 保持向下相容性，不影響現有認證功能
- 為後續群組功能預留架構基礎

**具體工作**：
```javascript
✅ 修改 /lib/models/user.ts
  - 加入 groupId: ObjectId | null
  - 加入 groupRole: 'owner'|'admin'|'member'|null  
  - 加入 groupJoinedAt: Date | null
  
✅ 更新資料庫索引
  - userSchema.index({ groupId: 1 })
  - userSchema.index({ groupId: 1, groupRole: 1 })
  
✅ 測試現有功能
  - 登入/註冊功能正常
  - 郵件驗證功能正常
  - 密碼重置功能正常
```

**交付成果**：
- User model 支援群組欄位但預設為 null
- 所有現有認證功能正常運作
- 資料庫索引優化完成

---

#### **Phase 1.2: 建立 Record Model 支援 Context**
**時程：1 天 | 狀態：待開始**

**目標**：
- 建立完整的記帳記錄資料模型
- 支援 Context 概念 ('personal'/'group')
- 包含多幣別、標籤、位置等進階功能

**具體工作**：
```javascript
✅ 建立 /lib/models/record.ts
  - 基本記錄資訊 (amount, type, description, date)
  - Context 支援 (context, groupId, createdBy)
  - 多幣別 (currency, exchangeRate, baseCurrencyAmount)
  - 擴展功能 (tags, location, receipt)
  - 系統欄位 (isDeleted, timestamps)
  
✅ Schema 驗證邏輯
  - 金額驗證 (必須大於 0)
  - 日期驗證
  - Context 一致性驗證
  
✅ 建立索引
  - 個人查詢: { userId: 1, context: 1, date: -1 }
  - 分類查詢: { userId: 1, categoryId: 1, date: -1 }
  - 群組查詢: { groupId: 1, context: 1, date: -1 }
  
✅ 基本測試
  - 記錄建立/查詢/更新/刪除
  - 資料驗證邏輯
  - 索引效能
```

**交付成果**：
- Record model 完整實作並支援 context = 'personal'
- 資料驗證和索引優化
- 基本 CRUD 操作測試通過

---

#### **Phase 1.3: 建立 Category Model 支援 Scope**
**時程：0.5 天 | 狀態：待開始**

**目標**：
- 建立分類管理資料模型
- 支援個人/群組/系統三種分類範圍
- 支援階層式分類結構

**具體工作**：
```javascript
✅ 建立 /lib/models/category.ts
  - 基本分類資訊 (name, type, icon, color)
  - Scope 支援 (scope, groupId, editableBy)
  - 階層支援 (parentId, children)
  - 使用統計 (usageCount, lastUsedAt)
  
✅ 預設分類初始化
  - 系統預設收入分類
  - 系統預設支出分類
  - 分類圖示和顏色設定
  
✅ 階層分類邏輯
  - 父子分類關係
  - 巢狀查詢支援
  - 分類刪除保護 (有子分類時)
  
✅ 建立索引
  - 個人分類: { userId: 1, scope: 1, isActive: 1 }
  - 父分類查詢: { parentId: 1 }
  - 使用頻率: { lastUsedAt: -1 }
```

**交付成果**：
- Category model 完整實作支援 scope = 'personal'
- 預設分類資料和初始化腳本
- 支援階層分類查詢

---

#### **Phase 1.4: 實作 Records CRUD API**
**時程：2 天 | 狀態：待開始**

**目標**：
- 建立完整的記帳記錄 API 端點
- 實作 Context 中間件 (目前只支援 personal)
- 加入權限檢查和資料驗證

**具體工作**：

**Day 1: 核心 API 端點**
```javascript
✅ /server/api/records/index.get.ts (記錄列表)
  - 支援分頁 (page, limit)
  - 支援篩選 (type, categoryId, startDate, endDate)
  - 支援搜尋 (description)
  - 支援排序 (date, amount)
  
✅ /server/api/records/index.post.ts (新增記錄)
  - Zod 資料驗證
  - Context 設定為 'personal'
  - 自動設定 userId 和 createdBy
  
✅ /server/api/records/[id].get.ts (單筆查詢)
  - 權限檢查 (只能查詢自己的記錄)
  - 包含 category 關聯資料
  
✅ /server/api/records/[id].put.ts (更新記錄)
  - 部分更新支援
  - 權限檢查和資料驗證
  - 更新時間戳
```

**Day 2: 刪除 API 和中間件**
```javascript
✅ /server/api/records/[id].delete.ts (刪除記錄)
  - 軟刪除 (isDeleted = true)
  - 權限檢查
  
✅ /server/middleware/context.ts (Context 中間件)
  - 解析 X-Context header
  - 驗證 Context 有效性 (目前只允許 personal)
  - 設定到 event.context
  
✅ /server/middleware/permissions.ts (權限中間件)
  - 個人模式權限檢查
  - 資源擁有權驗證
  - 錯誤處理
  
✅ API 測試
  - 單元測試覆蓋
  - 權限測試
  - 錯誤場景測試
```

**交付成果**：
- 完整的 Records CRUD API
- Context 中間件運作 (支援 personal)
- 權限檢查機制
- API 測試覆蓋率 > 80%

---

#### **Phase 1.5: 實作 Categories CRUD API**
**時程：1 天 | 狀態：待開始**

**目標**：
- 建立分類管理 API 端點
- 支援階層分類查詢
- 分類使用統計更新

**具體工作**：
```javascript
✅ /server/api/categories/index.get.ts
  - 個人分類列表 (scope = 'personal')
  - 階層結構查詢
  - 使用統計排序
  
✅ /server/api/categories/index.post.ts
  - 新增個人分類
  - 分類名稱重複檢查
  - 顏色和圖示設定
  
✅ /server/api/categories/[id].put.ts
  - 分類資訊更新
  - 系統分類保護
  - 父子關係驗證
  
✅ /server/api/categories/[id].delete.ts
  - 分類刪除檢查 (不能有子分類)
  - 使用中分類保護 (有記錄時不能刪除)
  - 軟刪除處理
  
✅ 使用統計更新
  - 記錄建立時自動更新分類 usageCount
  - 更新 lastUsedAt 時間戳
  - 批次統計更新邏輯
  
✅ API 測試
  - CRUD 功能測試
  - 階層分類測試
  - 保護邏輯測試
```

**交付成果**：
- 完整的 Categories CRUD API
- 階層分類支援
- 分類使用統計機制
- API 測試覆蓋

---

### **📅 Week 2: 前端介面開發**

#### **Phase 1.6: 建立前端記帳頁面**
**時程：3 天 | 狀態：待開始**

**目標**：
- 建立完整的記帳前端介面
- 優化移動端使用體驗
- 預留群組功能切換介面

**Day 1: 基礎頁面結構**
```javascript
✅ /pages/records/index.vue (記錄列表頁面)
  - 記錄列表展示
  - 篩選和搜尋功能
  - 分頁載入
  - 快速新增按鈕
  
✅ /pages/records/create.vue (新增記錄頁面)
  - 記帳表單
  - 分類選擇
  - 日期時間選擇器
  - 表單驗證
  
✅ /pages/records/[id]/edit.vue (編輯記錄頁面)
  - 記錄資料預載
  - 表單預填充
  - 更新和刪除操作
  
✅ /components/ContextSwitcher.vue (模式切換器)
  - 個人/群組模式切換 UI
  - 目前只顯示個人模式
  - 預留群組模式介面
```

**Day 2: 記帳表單和互動**
```javascript
✅ /components/RecordForm.vue (記帳表單元件)
  - 響應式表單設計
  - 即時資料驗證
  - 錯誤訊息顯示
  - 載入狀態處理
  
✅ /components/CategorySelect.vue (分類選擇器)
  - 分類列表顯示
  - 階層分類支援
  - 快速搜尋功能
  - 新增分類快捷入口
  
✅ /components/RecordList.vue (記錄列表元件)
  - 記錄卡片設計
  - 無限滾動載入
  - 快速操作 (編輯/刪除)
  - 空狀態處理
  
✅ 表單驗證和錯誤處理
  - 客戶端即時驗證
  - 服務端錯誤處理
  - 使用者友善錯誤訊息
```

**Day 3: 分類管理和移動端優化**
```javascript
✅ /pages/categories/index.vue (分類管理頁面)
  - 分類列表展示
  - 階層分類結構
  - 分類編輯和刪除
  - 使用統計顯示
  
✅ /components/CategoryForm.vue (分類表單)
  - 分類資訊編輯
  - 圖示和顏色選擇
  - 父分類選擇
  - 表單驗證
  
✅ 移動端優化
  - 響應式設計調整
  - 觸控手勢支援
  - 鍵盤友善設計
  - 載入效能優化
  
✅ 狀態管理
  - Pinia stores 設定
  - 資料快取機制
  - 錯誤狀態處理
```

**交付成果**：
- 完整的記帳前端介面
- 響應式設計支援移動端
- Context 切換器 (預留群組功能)
- 良好的使用者體驗

---

#### **Phase 1.7: 建立基本統計功能**
**時程：2 天 | 狀態：待開始**

**目標**：
- 建立統計分析功能
- 提供收支總覽和趨勢分析
- 圖表視覺化展示

**Day 1: 統計 API 開發**
```javascript
✅ /server/api/statistics/overview.get.ts
  - 收支總覽統計
  - 時期比較 (本月 vs 上月)
  - 分類統計排行
  - 記錄數量統計
  
✅ /server/api/statistics/categories.get.ts
  - 分類支出分析
  - 分類百分比計算
  - 分類趨勢變化
  
✅ /server/api/statistics/trends.get.ts
  - 月度趨勢分析
  - 每日收支趨勢
  - 週期性分析
  
✅ 統計資料快取
  - Redis 快取機制
  - 快取失效策略
  - 背景更新邏輯
```

**Day 2: 統計前端介面**
```javascript
✅ /pages/statistics/index.vue (統計總覽頁面)
  - 收支摘要卡片
  - 時期比較顯示
  - 快速統計指標
  
✅ /components/charts/CategoryChart.vue (分類圖表)
  - 圓餅圖展示
  - 分類佔比顯示
  - 互動式圖表
  
✅ /components/charts/TrendChart.vue (趨勢圖表)
  - 線性圖表
  - 收支趨勢對比
  - 時期選擇器
  
✅ /components/StatsSummary.vue (統計摘要)
  - 關鍵指標展示
  - 變化趨勢標示
  - 響應式卡片設計
```

**交付成果**：
- 完整的統計分析功能
- 視覺化圖表展示
- 資料快取和效能優化
- 統計 API 和前端整合

---

### **📅 Week 3: 整合測試與優化**

#### **Phase 1.8: 整合測試和優化**
**時程：2 天 | 狀態：待開始**

**目標**：
- 完整系統整合測試
- 效能優化和錯誤處理
- 移動端應用測試
- 準備生產部署

**Day 1: 測試和修復**
```javascript
✅ E2E 測試腳本
  - 用戶註冊登入流程
  - 完整記帳流程測試
  - 分類管理測試
  - 統計功能測試
  
✅ API 整合測試
  - API 端點完整測試
  - 權限控制測試
  - 錯誤場景測試
  - 效能測試
  
✅ 前端單元測試
  - 元件單元測試
  - Store 邏輯測試
  - 工具函數測試
  - 邊界條件測試
  
✅ 錯誤處理優化
  - 全局錯誤處理
  - 使用者友善錯誤訊息
  - 錯誤恢復機制
  - 錯誤日誌記錄
```

**Day 2: 效能優化和移動端**
```javascript
✅ 資料載入優化
  - 分頁載入優化
  - 資料快取策略
  - 圖片延遲載入
  - API 請求優化
  
✅ 移動端體驗測試
  - iOS Safari 測試
  - Android Chrome 測試
  - 觸控手勢測試
  - 效能監控
  
✅ Tauri 移動端打包測試
  - Android APK 打包
  - iOS APP 測試
  - 原生功能測試
  - 效能基準測試
  
✅ 最終功能驗證
  - 使用者流程測試
  - 資料一致性檢查
  - 安全性檢查
  - 部署前檢查清單
```

**交付成果**：
- 完整可用的個人記帳 MVP
- 通過所有測試 (單元/整合/E2E)
- 移動端應用可正常運作
- 準備生產環境部署

---

## 📊 開發里程碑和檢查點

### 🎯 Week 1 里程碑
**目標**：完成資料模型和 API 開發
- [ ] User model 支援群組欄位
- [ ] Record model 完整實作
- [ ] Category model 完整實作  
- [ ] Records CRUD API 完整可用
- [ ] Categories CRUD API 完整可用
- [ ] API 測試覆蓋率 > 80%

### 🎯 Week 2 里程碑
**目標**：完成前端介面和統計功能
- [ ] 記帳前端介面完整可用
- [ ] 分類管理功能
- [ ] Context 切換器 (預留群組)
- [ ] 統計分析功能
- [ ] 圖表視覺化
- [ ] 移動端響應式設計

### 🎯 Week 3 里程碑  
**目標**：完成測試優化和部署準備
- [ ] 所有測試通過
- [ ] 效能優化完成
- [ ] 移動端應用可用
- [ ] 錯誤處理完善
- [ ] 準備生產部署

---

## 🔍 品質保證檢查清單

### 功能完整性檢查
- [ ] 用戶可以註冊、登入、驗證郵件
- [ ] 用戶可以新增、編輯、刪除記帳記錄
- [ ] 用戶可以管理個人分類
- [ ] 用戶可以查看統計分析
- [ ] 所有表單都有適當的驗證
- [ ] 錯誤處理完善且使用者友善

### 技術品質檢查
- [ ] 所有 API 都有適當的權限檢查
- [ ] 資料庫查詢效能優化
- [ ] 前端響應式設計
- [ ] 程式碼符合 ESLint 規範
- [ ] TypeScript 類型檢查通過
- [ ] 測試覆蓋率達標

### 使用者體驗檢查
- [ ] 移動端使用體驗良好
- [ ] 載入時間 < 3 秒
- [ ] 記帳流程 < 30 秒完成
- [ ] 錯誤訊息清楚易懂
- [ ] 無障礙設計 (基本)
- [ ] 離線功能 (基本)

---

## 🚨 風險控制和應變計畫

### 技術風險
**風險**：資料庫效能問題
**應變**：調整索引策略，實作資料快取

**風險**：移動端相容性問題  
**應變**：優先確保 Web 版本可用，移動端分階段優化

**風險**：API 設計需要大幅調整
**應變**：保持 API 向下相容，透過版本控制處理

### 時程風險
**風險**：某個階段超時
**應變**：優先完成核心功能，非核心功能延後

**風險**：測試發現重大問題
**應變**：預留額外 1 週修復時間

### 品質風險
**風險**：測試覆蓋不足
**應變**：優先核心流程測試，邊緣功能後補

---

## 📈 成功指標

### 技術指標
- API 回應時間 < 500ms
- 前端首次載入 < 3 秒  
- 測試覆蓋率 > 70%
- 零重大安全漏洞
- TypeScript 錯誤 = 0
- ESLint 錯誤 = 0

### 功能指標
- 完整記帳流程可用
- 分類管理功能可用
- 統計分析功能可用
- 移動端基本可用
- 資料備份恢復可用

### 使用者體驗指標
- 記帳完成時間 < 30 秒
- 錯誤恢復率 > 95%
- 移動端載入 < 2 秒
- 無重大 UX 問題

---

## 📝 開發日誌

### 日誌格式
```
日期: YYYY-MM-DD
階段: Phase X.X
完成項目:
- [x] 完成項目1
- [x] 完成項目2

遇到問題:
- 問題描述和解決方案

下個階段準備:
- 準備事項和注意點
```

### Phase 進度追蹤
- [ ] **Phase 1.1** - User Model 群組欄位 (預估: 0.5天)
- [ ] **Phase 1.2** - Record Model Context 支援 (預估: 1天)  
- [ ] **Phase 1.3** - Category Model Scope 支援 (預估: 0.5天)
- [ ] **Phase 1.4** - Records CRUD API (預估: 2天)
- [ ] **Phase 1.5** - Categories CRUD API (預估: 1天)
- [ ] **Phase 1.6** - 前端記帳頁面 (預估: 3天)
- [ ] **Phase 1.7** - 基本統計功能 (預估: 2天)
- [ ] **Phase 1.8** - 整合測試優化 (預估: 2天)

---

## 🎯 Phase 2 準備

當 Phase 1 完成後，系統將具備：
- 完整的個人記帳功能
- 預留群組功能的架構基礎
- Context 切換機制
- 權限控制系統
- 完善的測試覆蓋

**Phase 2 群組功能開發時**，只需要：
1. 啟用群組相關 API 端點
2. 實作群組管理功能  
3. 修改前端 Context 切換器
4. 增加群組權限檢查
5. 測試個人/群組資料隔離

架構的前瞻性設計確保了 Phase 1 到 Phase 2 的無痛升級。

---

**開發開始日期**: 2024-12-15
**預計完成日期**: 2025-01-05
**當前狀態**: 準備開始 Phase 1.1

最後更新時間: 2024-12-15
版本: 1.0.0