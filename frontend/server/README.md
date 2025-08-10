# Personal Finance Manager - Server API

這是 Personal Finance Manager 的 Nuxt.js 3 Server API 實作。

## 🏗️ 已配置的元件

### 📦 資料庫層
- **MongoDB Atlas 連接**: 使用 Mongoose ODM
- **模型定義**: User, Category, Record, Budget, ExchangeRate
- **索引優化**: 查詢效能最佳化
- **連接管理**: 自動重連和錯誤處理

### 🛠️ 伺服器設定
- **環境變數管理**: 完整的配置驗證和類型安全
- **中介軟體**: 自動資料庫連接檢查
- **健康檢查**: 資料庫和環境狀態監控
- **錯誤處理**: 統一的錯誤回應格式

## 📁 檔案結構

```
server/
├── api/                      # API 端點
│   ├── health/              
│   │   ├── database.get.ts   # 資料庫健康檢查
│   │   └── env.get.ts        # 環境變數檢查
│   └── database/
│       └── seed.post.ts      # 資料種子 API
├── middleware/
│   └── database.ts           # 資料庫連接中介軟體
├── models/                   # Mongoose 模型
│   ├── User.ts              # 使用者模型
│   ├── Category.ts          # 分類模型
│   ├── Record.ts            # 交易記錄模型
│   ├── Budget.ts            # 預算模型
│   ├── ExchangeRate.ts      # 匯率模型
│   └── index.ts             # 模型匯出
└── utils/                   # 工具函數
    ├── database.ts          # 資料庫連接管理
    └── env.ts               # 環境變數工具
```

## 🚀 開始使用

### 1. 環境變數設定
複製 `.env.example` 到 `.env` 並填入實際值：

```bash
cp .env.example .env
```

### 2. 必要環境變數
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key
ENCRYPTION_KEY=32-byte-hex-string
```

### 3. 啟動開發伺服器
```bash
yarn dev
```

### 4. 健康檢查
- 資料庫狀態: `GET /api/health/database`
- 環境變數: `GET /api/health/env`

## 🔧 API 端點

### 健康檢查
- **GET** `/api/health/database` - 資料庫連接狀態
- **GET** `/api/health/env` - 環境變數配置狀態

### 資料管理
- **POST** `/api/database/seed` - 建立預設分類
  ```json
  {
    "userId": "user_id_here"
  }
  ```

## 📊 資料模型

### User (使用者)
- 基本資訊：email, password, name
- 偏好設定：currency, theme, language
- 系統欄位：emailVerified, isActive

### Category (分類)  
- 分類資訊：name, type (income/expense), icon, color
- 層級結構：支援子分類 (parentId)
- 使用統計：usageCount, lastUsedAt

### Record (交易記錄)
- 交易資訊：amount, type, description, date
- 多幣別：currency, exchangeRate, baseCurrencyAmount  
- 附加資料：tags, location, receipt

### Budget (預算)
- 預算設定：name, amount, period
- 時間範圍：startDate, endDate
- 警告設定：warningThreshold
- 統計快取：currentSpent

### ExchangeRate (匯率)
- 匯率資訊：fromCurrency, toCurrency, rate
- 資料來源：source, fetchedAt

## 🛡️ 安全性

- **JWT 認證**: 使用者身份驗證
- **資料加密**: 敏感資料加密儲存
- **輸入驗證**: Zod schema 驗證
- **索引優化**: 防止 N+1 查詢問題

## 📈 監控

- **連接狀態**: 即時資料庫連接監控
- **模型載入**: 確保所有 Mongoose 模型正確載入
- **環境驗證**: 啟動時檢查必要環境變數

## 🔧 故障排除

### 常見問題

1. **資料庫連接失敗**
   - 檢查 `MONGODB_URI` 環境變數
   - 確認網路連接和 MongoDB Atlas 白名單

2. **模型載入失敗** 
   - 檢查 `/api/health/database` 的 collections 狀態
   - 確認模型文件語法正確

3. **環境變數錯誤**
   - 查看 `/api/health/env` 的錯誤訊息
   - 確認 `.env` 檔案存在且格式正確

### 日誌查看
開發模式下，所有連接事件和錯誤都會輸出到 console。

## 🏃‍♂️ 下一步

1. 實作認證 API (註冊、登入、登出)
2. 建立 CRUD API 端點
3. 新增資料驗證中介軟體
4. 實作檔案上傳功能
5. 新增快取層 (Redis)

---

更新日期: 2025-01-09  
版本: 1.0.0