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
├── authentication_system.md     # 認證系統設計和安全規範
├── database_schema.md           # 資料庫設計
├── api_specification.md         # API 規格文檔
├── user_stories.md              # 使用者需求故事
├── frontend_development_guide.md # 前端開發規範
├── tauri_mobile_setup.md        # 移動端配置指南
├── app_store_publishing.md      # 應用商店上架指南
└── deployment_guide.md          # CI/CD 和部署指南
```

### 文檔權威性等級
1. **🔴 必須遵循**: `project_overview.md`, `technical_architecture.md`, `authentication_system.md`
2. **🟡 開發參考**: `frontend_development_guide.md`, `database_schema.md`, `api_specification.md`
3. **🟢 操作指南**: `tauri_mobile_setup.md`, `app_store_publishing.md`, `deployment_guide.md`

---

## 🤖 AI 協作原則

### 1. 文檔優先原則
- **任何操作前必須先查閱相關文檔**
- **嚴格遵循既有的技術規範和架構設計**
- **不可違背專案概覽中定義的核心目標**

### 🚨 1.1 PUSH 控制準則 (最高優先級)
- **❌ 絕對禁止未經使用者確認就執行 `git push`**
- **✅ 每個功能實作完成後，必須等待使用者本地驗證**
- **✅ 只有在使用者明確確認「驗證完成，可以 push」後才能推送**
- **📋 標準流程**:
  1. 完成功能實作
  2. 執行基本檢查 (type-check, lint)
  3. **停在 git commit，不執行 git push**
  4. 明確告知使用者「請在本地驗證功能」
  5. 等待使用者確認後才能 push
  6. 推送完成後進入下一個功能階段

### 2. 文檔維護責任
當進行以下操作時，**必須同時更新對應文檔**：

#### 🔄 需要更新文檔的操作
- **新增 API 端點** → 更新 `api_specification.md`
- **修改資料庫 Schema** → 更新 `database_schema.md` 
- **變更技術棧或架構** → 更新 `technical_architecture.md`
- **修改認證機制或安全策略** → 更新 `authentication_system.md`
- **新增認證相關 API 或中間件** → 更新 `authentication_system.md` + `api_specification.md`
- **變更 JWT 策略或 Token 儲存方式** → 更新 `authentication_system.md`
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

## 🔐 環境變數管理規範

### 環境變數機密程度分級
- **🔴 高機密**: 絕對不能洩露的資料，包含認證資訊
- **🟡 中機密**: 服務 API 金鑰，洩露會影響功能但不會直接危害安全
- **🟢 低機密**: 配置參數，洩露不會造成安全問題

### 環境變數管理流程

#### 1. 開發環境設定
```bash
# 複製範例檔案
cp .env.example .env

# 編輯環境變數（使用實際值）
nano .env
```

#### 2. 新增環境變數的標準流程
當需要新增環境變數時：

**步驟一：更新 `.env.example`**
```bash
# 在對應的機密程度區塊中新增
# 🔴 高機密區塊 - 絕不能提交實際值
NEW_SECRET_KEY=your-secret-key-placeholder

# 🟡 中機密區塊 - 使用示例值
API_KEY=your-api-key-example

# 🟢 低機密區塊 - 可使用實際預設值
LOG_LEVEL=info
```

**步驟二：更新 `nuxt.config.ts`**
```typescript
runtimeConfig: {
  // Server-side (機密)
  newSecretKey: process.env.NEW_SECRET_KEY,
  
  // Public (非機密)
  public: {
    newPublicConfig: process.env.NEW_PUBLIC_CONFIG || 'default'
  }
}
```

**步驟三：確保正確的 `.gitignore` 設定**
```bash
# 確認 .env 被忽略
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.production" >> .gitignore
```

#### 3. Cloud Run 部署環境變數管理

**🔴 高機密變數 - 使用 Google Secret Manager**
```yaml
# Cloud Run 設定
env:
  - name: MONGODB_URI
    valueFrom:
      secretKeyRef:
        name: mongodb-uri
        key: latest
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: jwt-secret
        key: latest
```

**🟡 中機密變數 - 使用 Cloud Run 環境變數**
```bash
# 使用 gcloud CLI 設定
gcloud run services update money-flow \
  --set-env-vars="EXCHANGE_RATE_API_KEY=your-key"
```

**🟢 低機密變數 - 直接在 Cloud Run YAML 設定**
```yaml
spec:
  template:
    spec:
      containers:
      - env:
        - name: NODE_ENV
          value: "production"
        - name: LOG_LEVEL
          value: "info"
```

#### 4. Secret Manager 操作指令

**建立 Secret**
```bash
# 建立 MongoDB 連接字串
echo "mongodb+srv://user:pass@cluster.mongodb.net/db" | \
  gcloud secrets create mongodb-uri --data-file=-

# 建立 JWT 密鑰
openssl rand -base64 32 | \
  gcloud secrets create jwt-secret --data-file=-
```

**更新 Secret**
```bash
# 更新現有 Secret
echo "new-secret-value" | \
  gcloud secrets versions add mongodb-uri --data-file=-
```

**給予 Cloud Run 存取權限**
```bash
# 給予服務帳戶存取權限
gcloud secrets add-iam-policy-binding mongodb-uri \
  --member="serviceAccount:service-account@project.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 環境變數使用最佳實踐

#### 1. 在程式碼中使用
```typescript
// ✅ 正確使用方式
const config = useRuntimeConfig()
const mongoUri = config.mongodbUri

// ❌ 錯誤使用方式
const mongoUri = process.env.MONGODB_URI // 只能在 server 端使用
```

#### 2. 環境變數命名規範
```bash
# 使用大寫和底線
MONGODB_URI=...
JWT_SECRET=...
EXCHANGE_RATE_API_KEY=...

# 相關變數使用相同前綴
GCS_SERVICE_ACCOUNT_KEY=...
GCS_BUCKET_NAME=...
```

#### 3. 預設值設定
```typescript
// 為非必要變數提供合理預設值
logLevel: process.env.LOG_LEVEL || 'info',
enableDebugMode: process.env.ENABLE_DEBUG_MODE === 'true',
```

### 安全注意事項

1. **絕不在程式碼中硬編碼機密資訊**
2. **定期輪換 API 金鑰和密碼**
3. **使用最小權限原則設定 API 金鑰**
4. **監控環境變數的使用情況**

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
- ❌ **未經使用者確認就執行 git push（最嚴重違規）**
- ❌ **不看文檔就開始編程**
- ❌ **修改架構後不更新文檔**
- ❌ **偏離專案核心目標** 
- ❌ **在生產環境直接測試**
- ❌ **忽略移動端開發需求**
- ❌ **不遵循程式碼規範**

### 必須要做的行為  
- ✅ **功能完成後等待使用者驗證才能 push（最重要）**
- ✅ **每次操作前先讀相關文檔**
- ✅ **遵循所有技術規範**
- ✅ **及時更新文檔**
- ✅ **撰寫清晰的 commit 訊息**
- ✅ **測試所有變更**
- ✅ **保持專案目標一致性**
- ✅ **Commit 前必須執行品質檢查**

### 🔍 Commit 前品質檢查準則

**任何 commit 和 push 前都必須執行以下檢查**：

```bash
# 1. TypeScript 類型檢查
yarn typecheck

# 2. ESLint 程式碼檢查和自動修正
yarn lint

# 3. 測試執行（如果有）
yarn test

# 4. 建置檢查（確保能正常建置）
yarn build
```

**檢查失敗處理**：
- ❌ **ESLint 錯誤** → 必須修正所有錯誤才能 commit
- ⚠️ **ESLint 警告** → 儘量修正，但可接受
- ❌ **TypeScript 錯誤** → 必須修正所有類型錯誤
- ❌ **建置失敗** → 必須確保能成功建置

**違反此準則的後果**：
- CI/CD 構建失敗
- 部署中斷
- 程式碼品質下降
- 團隊開發效率受影響

---

## 📞 支援資源

### 外部文檔參考
- [Nuxt.js 3 官方文檔](https://nuxt.com/)
- [Vue.js 3 官方文檔](https://vuejs.org/)
- [Tauri 2 官方文檔](https://v2.tauri.app/)
- [MongoDB 官方文檔](https://docs.mongodb.com/)
- [Google Cloud Run 文檔](https://cloud.google.com/run/docs)

### 內部文檔快速查找
- **需要認證和安全設計** → `docs/authentication_system.md`
- **需要 API 資訊** → `docs/api_specification.md`
- **需要資料庫結構** → `docs/database_schema.md`  
- **需要前端開發規範** → `docs/frontend_development_guide.md`
- **需要移動端設定** → `docs/tauri_mobile_setup.md`
- **需要部署資訊** → `docs/deployment_guide.md`
- **需要上架指導** → `docs/app_store_publishing.md`

---

**記住：這是一個有明確目標的商業專案，所有決策都必須朝向成功上架應用商店的目標前進！**

最後更新時間: 2025-08-16
版本: 1.2.0 - 新增 PUSH 控制準則