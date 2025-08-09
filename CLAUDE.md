# Personal Finance Manager - AI 協作指南

## 專案概覽

Personal Finance Manager 是一個跨平台的個人財務管理應用程式，提供 **Web 應用程式** 和 **雙平台原生 Mobile App**（Android APK + iOS APP）。目標是成功上架 Google Play Store 和 Apple App Store。

### 核心技術棧
- **前端**: Nuxt.js 3 + Vue.js 3 + TypeScript + Tailwind CSS
- **後端**: Nuxt.js 3 Server API  
- **資料庫**: MongoDB + Mongoose ODM
- **移動端**: Tauri 2 (原生 Android/iOS 打包)
- **部署**: Google Cloud Run + Docker
- **狀態管理**: Pinia
- **測試**: Vitest + Playwright

---

## 📁 專案文檔結構

### 核心文檔 (必須熟讀)
```
docs/
├── project_overview.md          # 專案概覽和目標
├── technical_architecture.md    # 技術架構設計  
├── database_schema.md           # 資料庫設計
├── api_specification.md         # API 規格文檔
├── user_stories.md              # 使用者需求故事
├── frontend_development_guide.md # 前端開發規範
├── tauri_mobile_setup.md        # 移動端配置指南
├── app_store_publishing.md      # 應用商店上架指南
└── deployment_guide.md          # CI/CD 和部署指南
```

### 文檔權威性等級
1. **🔴 必須遵循**: `project_overview.md`, `technical_architecture.md`
2. **🟡 開發參考**: `frontend_development_guide.md`, `database_schema.md`, `api_specification.md`
3. **🟢 操作指南**: `tauri_mobile_setup.md`, `app_store_publishing.md`, `deployment_guide.md`

---

## 🤖 AI 協作原則

### 1. 文檔優先原則
- **任何操作前必須先查閱相關文檔**
- **嚴格遵循既有的技術規範和架構設計**
- **不可違背專案概覽中定義的核心目標**

### 2. 文檔維護責任
當進行以下操作時，**必須同時更新對應文檔**：

#### 🔄 需要更新文檔的操作
- **新增 API 端點** → 更新 `api_specification.md`
- **修改資料庫 Schema** → 更新 `database_schema.md` 
- **變更技術棧或架構** → 更新 `technical_architecture.md`
- **新增前端元件或流程** → 更新 `frontend_development_guide.md`
- **修改部署流程** → 更新 `deployment_guide.md`
- **調整 Tauri 配置** → 更新 `tauri_mobile_setup.md`
- **變更上架流程** → 更新 `app_store_publishing.md`

#### 📝 文檔更新流程
1. 完成程式碼變更
2. 立即更新對應的文檔檔案
3. 在 commit 訊息中註明文檔更新

### 3. 一次性腳本管理原則
- **腳本用途**: 設定環境、遷移資料、建置工具等一次性任務
- **存放位置**: 根目錄 `/scripts/` 資料夾
- **命名規範**: `setup-*.sh`, `migrate-*.sh`, `build-*.sh`
- **使用後處理**: 
  ```bash
  # 執行腳本
  ./scripts/setup-environment.sh
  
  # 確認成功後立即刪除
  rm ./scripts/setup-environment.sh
  
  # 在 commit 中註明
  git commit -m "Setup: 環境初始化完成，移除臨時腳本"
  ```

---

## 🛠️ 開發工作流程

### 程式碼開發標準
1. **遵循 `frontend_development_guide.md` 中的所有規範**
2. **使用 TypeScript，不允許 any 類型**
3. **元件必須有適當的 Props 和 Emits 定義**
4. **API 必須遵循 `api_specification.md` 的格式**
5. **資料庫操作必須符合 `database_schema.md` 的設計**

### 功能開發檢查清單
- [ ] 查閱 `user_stories.md` 確認需求
- [ ] 檢查 `technical_architecture.md` 確認架構相容性
- [ ] 實作功能並遵循 `frontend_development_guide.md`
- [ ] API 開發遵循 `api_specification.md`
- [ ] 資料庫變更遵循 `database_schema.md`
- [ ] 更新相關文檔
- [ ] 撰寫測試
- [ ] 提交 commit

### 移動端開發流程
1. **參考 `tauri_mobile_setup.md` 進行環境設定**
2. **遵循文檔中的建置和簽名流程**
3. **測試 Android 和 iOS 兩個平台**
4. **準備上架時參考 `app_store_publishing.md`**

### 部署流程
1. **遵循 `deployment_guide.md` 的 CI/CD 設定**
2. **使用文檔中定義的 Docker 配置**
3. **按照 Google Cloud 部署指南執行**

---

## 🎯 專案核心目標提醒

**永遠記住專案的最終目標**：
1. ✅ 建立功能完整的 Web 財務管理應用
2. ✅ 使用 Tauri 2 打包原生 Android APK 和 iOS APP
3. ✅ 成功上架 Google Play Store 和 Apple App Store
4. ✅ 提供良好的使用者體驗和效能

**不允許的變更**：
- ❌ 放棄移動端開發 
- ❌ 改變核心技術棧（Nuxt.js 3, Tauri 2）
- ❌ 降低應用商店上架標準

---

## 📋 常用操作指令

### 開發環境
```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 類型檢查
npm run type-check

# 程式碼檢查
npm run lint

# 執行測試
npm run test
```

### 移動端建置
```bash
# Android 開發版本
npm run tauri android dev

# iOS 開發版本  
npm run tauri ios dev

# Android 發布版本
npm run tauri android build --release

# iOS 發布版本
npm run tauri ios build --release
```

### 部署指令
```bash
# 建置生產版本
npm run build

# Docker 建置
docker build -t personal-finance-manager .

# 部署到 Cloud Run
gcloud run deploy personal-finance-manager
```

---

## 🔧 故障排除指南

### 常見問題處理順序
1. **查閱相關文檔的「故障排除」章節**
2. **檢查 `technical_architecture.md` 中的架構設計**
3. **確認環境設定是否符合文檔要求**
4. **查看 `deployment_guide.md` 中的監控日誌**

### 緊急情況處理
- **生產環境問題**: 立即參考 `deployment_guide.md` 的回滾程序
- **移動端建置失敗**: 檢查 `tauri_mobile_setup.md` 的環境需求
- **應用商店審核失敗**: 查閱 `app_store_publishing.md` 的審核指南

---

## 📝 Commit 訊息規範

### 格式
```
<類型>(<範圍>): <描述>

[可選的詳細說明]

[可選的文檔更新說明]
```

### 類型定義
- `feat`: 新功能
- `fix`: 錯誤修復
- `docs`: 文檔更新
- `style`: 程式碼格式調整
- `refactor`: 重構
- `test`: 測試相關
- `build`: 建置系統相關
- `ci`: CI/CD 相關
- `mobile`: 移動端相關
- `deploy`: 部署相關

### 範例
```bash
feat(records): 新增支出記錄 CRUD 功能

- 實作記錄列表、新增、編輯、刪除功能
- 新增 API 端點 /api/records
- 更新 API 規格文檔

docs: 更新 api_specification.md 中的記錄管理端點
```

---

## 🚨 重要提醒

### 絕對不可以的行為
- ❌ **不看文檔就開始編程**
- ❌ **修改架構後不更新文檔**
- ❌ **偏離專案核心目標** 
- ❌ **在生產環境直接測試**
- ❌ **忽略移動端開發需求**
- ❌ **不遵循程式碼規範**

### 必須要做的行為  
- ✅ **每次操作前先讀相關文檔**
- ✅ **遵循所有技術規範**
- ✅ **及時更新文檔**
- ✅ **撰寫清晰的 commit 訊息**
- ✅ **測試所有變更**
- ✅ **保持專案目標一致性**

---

## 📞 支援資源

### 外部文檔參考
- [Nuxt.js 3 官方文檔](https://nuxt.com/)
- [Vue.js 3 官方文檔](https://vuejs.org/)
- [Tauri 2 官方文檔](https://v2.tauri.app/)
- [MongoDB 官方文檔](https://docs.mongodb.com/)
- [Google Cloud Run 文檔](https://cloud.google.com/run/docs)

### 內部文檔快速查找
- **需要 API 資訊** → `docs/api_specification.md`
- **需要資料庫結構** → `docs/database_schema.md`  
- **需要前端開發規範** → `docs/frontend_development_guide.md`
- **需要移動端設定** → `docs/tauri_mobile_setup.md`
- **需要部署資訊** → `docs/deployment_guide.md`
- **需要上架指導** → `docs/app_store_publishing.md`

---

**記住：這是一個有明確目標的商業專案，所有決策都必須朝向成功上架應用商店的目標前進！**

最後更新時間: 2024-08-09
版本: 1.0.0