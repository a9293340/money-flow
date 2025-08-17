# Personal Finance Manager - API Specification

## 技術規範
- **API 風格**: RESTful API
- **數據格式**: JSON
- **認證方式**: JWT (JSON Web Token)
- **API 版本**: v1
- **Base URL**: `/api/v1`

## 通用規範

### HTTP 狀態碼
- `200` - 成功 (GET, PUT, PATCH)
- `201` - 建立成功 (POST)
- `204` - 無內容成功 (DELETE)
- `400` - 請求錯誤
- `401` - 未授權
- `403` - 禁止存取
- `404` - 資源不存在
- `409` - 資源衝突
- `422` - 驗證失敗
- `429` - 請求過於頻繁
- `500` - 伺服器錯誤

### 錯誤回應格式
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "amount",
        "message": "Amount must be a positive number"
      }
    ],
    "timestamp": "2024-01-01T00:00:00.000Z",
    "path": "/api/v1/records"
  }
}
```

### 成功回應格式
```json
{
  "data": { /* 資料內容 */ },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "pagination": { /* 分頁資訊 (如適用) */ }
  }
}
```

### 分頁參數
```
GET /api/v1/records?page=1&limit=20&sort=-date
```

### 認證 Header
```
Authorization: Bearer <JWT_TOKEN>
```

---

## 8. 資料管理 (Data Management) - P1

### POST `/api/v1/data/export`
匯出資料

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "format": "csv",
  "type": "records",
  "filters": {
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "categoryIds": ["60d5ecb54b24a30d5c8e4b1b"],
    "type": "expense"
  }
}
```

**Response (200):**
```json
{
  "data": {
    "downloadUrl": "https://storage.example.com/exports/user_records_20240115.csv",
    "filename": "personal_finance_records_2023-2024.csv",
    "fileSize": 45678,
    "recordCount": 1456,
    "expiresAt": "2024-01-22T15:00:00.000Z",
    "exportedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

### POST `/api/v1/data/import`
匯入資料

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Request Body (Form Data):**
- `file` - CSV 檔案
- `type` - 匯入類型 (`records`)
- `options` - 匯入選項 (JSON string)

**Options 範例:**
```json
{
  "skipFirstRow": true,
  "dateFormat": "YYYY-MM-DD",
  "defaultCurrency": "TWD",
  "mapping": {
    "date": "交易日期",
    "amount": "金額",
    "description": "描述",
    "category": "分類"
  }
}
```

**Response (200):**
```json
{
  "data": {
    "importId": "60d5ecb54b24a30d5c8e4b24",
    "status": "processing",
    "totalRows": 156,
    "processedRows": 0,
    "successRows": 0,
    "errorRows": 0,
    "preview": [
      {
        "row": 1,
        "data": {
          "date": "2024-01-01",
          "amount": 120.5,
          "description": "午餐",
          "category": "餐飲"
        },
        "status": "valid"
      }
    ],
    "createdAt": "2024-01-15T15:30:00.000Z"
  }
}
```

### GET `/api/v1/data/import/:importId`
查詢匯入狀態

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "importId": "60d5ecb54b24a30d5c8e4b24",
    "status": "completed",
    "totalRows": 156,
    "processedRows": 156,
    "successRows": 150,
    "errorRows": 6,
    "progress": 100,
    "errors": [
      {
        "row": 15,
        "field": "amount",
        "message": "Invalid amount format",
        "data": "abc"
      }
    ],
    "summary": {
      "recordsCreated": 150,
      "categoriesCreated": 3,
      "totalAmount": 45600
    },
    "completedAt": "2024-01-15T15:35:00.000Z"
  }
}
```

### GET `/api/v1/data/template`
下載匯入範本

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` - 範本類型 (`records`)
- `format` - 檔案格式 (`csv`)

**Response (200):**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="import_template_records.csv"

日期,類型,金額,分類,描述,貨幣
2024-01-01,expense,120.50,餐飲,午餐,TWD
2024-01-01,income,50000,薪資,月薪,TWD
```

---

## 9. 搜尋功能 (Search) - P1

### GET `/api/v1/search/records`
搜尋交易記錄

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q` - 搜尋關鍵字
- `type` - 交易類型 (`income` | `expense`)
- `categoryIds` - 分類 ID (comma separated)
- `minAmount` - 最小金額
- `maxAmount` - 最大金額
- `startDate` - 開始日期
- `endDate` - 結束日期
- `tags` - 標籤 (comma separated)
- `page` - 頁碼 (default: 1)
- `limit` - 每頁筆數 (default: 20)

**Response (200):**
```json
{
  "data": [
    {
      "id": "60d5ecb54b24a30d5c8e4b1e",
      "amount": 120.50,
      "type": "expense",
      "description": "午餐 - 鼎泰豐",
      "date": "2024-01-15T12:00:00.000Z",
      "category": {
        "id": "60d5ecb54b24a30d5c8e4b1b",
        "name": "餐飲",
        "icon": "utensils",
        "color": "#F59E0B"
      },
      "tags": ["外食", "小籠包"],
      "relevanceScore": 0.95,
      "matchedFields": ["description", "tags"]
    }
  ],
  "meta": {
    "query": "鼎泰豐",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    },
    "filters": {
      "type": "expense",
      "dateRange": "2024-01-01 to 2024-01-31"
    },
    "summary": {
      "totalAmount": 285.50,
      "averageAmount": 95.17,
      "transactionCount": 3
    }
  }
}
```

### GET `/api/v1/search/suggestions`
搜尋建議

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q` - 搜尋關鍵字前綴
- `type` - 建議類型 (`description` | `category` | `tag`)
- `limit` - 建議數量 (default: 10)

**Response (200):**
```json
{
  "data": {
    "query": "午",
    "suggestions": [
      {
        "type": "description",
        "value": "午餐",
        "count": 45,
        "recentUsed": "2024-01-15T12:00:00.000Z"
      },
      {
        "type": "description", 
        "value": "午餐 - 便當",
        "count": 12,
        "recentUsed": "2024-01-14T12:30:00.000Z"
      },
      {
        "type": "tag",
        "value": "午休",
        "count": 3,
        "recentUsed": "2024-01-10T12:15:00.000Z"
      }
    ]
  }
}
```

---

## Phase 2+ API Endpoints (P2/P3) - 未來擴展規劃

### 9. 預算管理 (Budgets) - P3 ✅

#### 基本 CRUD 操作
```
POST   /api/budgets                    # 創建新預算
GET    /api/budgets                    # 取得預算列表 (支援分頁、篩選、排序)
GET    /api/budgets/:id                # 取得單一預算詳情
PUT    /api/budgets/:id                # 更新預算
DELETE /api/budgets/:id                # 刪除預算 (軟刪除)
```

#### 統計和管理
```
GET    /api/budgets/stats              # 取得預算統計概覽
POST   /api/budgets/:id/recalculate    # 重新計算預算統計
```

#### 預算創建 API 詳細規格

**POST** `/api/budgets`

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "name": "2025年8月生活費預算",
  "description": "當前月份的生活開支預算",
  "amount": 25000,
  "currency": "TWD",
  "categoryIds": [],
  "periodType": "monthly",
  "startDate": "2025-08-01",
  "endDate": "2025-08-31",
  "warningThreshold": 75,
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "68a1943602a935e9abdb6abd",
    "userId": "689f36ca5d85b4217fb85d66",
    "name": "2025年8月生活費預算",
    "description": "當前月份的生活開支預算",
    "amount": 25000,
    "currency": "TWD",
    "categoryIds": [],
    "periodType": "monthly",
    "startDate": "2025-08-01T00:00:00.000Z",
    "endDate": "2025-08-30T16:00:00.000Z",
    "status": "active",
    "currentSpent": 0,
    "usagePercentage": 0,
    "remainingAmount": 25000,
    "remainingDays": 14,
    "warningLevel": "safe",
    "isActive": true,
    "createdAt": "2025-08-17T08:35:02.208Z",
    "updatedAt": "2025-08-17T08:35:02.208Z"
  },
  "message": "預算創建成功"
}
```

#### 預算列表 API 詳細規格

**GET** `/api/budgets`

**Query Parameters:**
- `page` (number): 頁碼，預設 1
- `limit` (number): 每頁數量，預設 10，最大 100
- `status` (string): 預算狀態篩選 (`active`, `inactive`, `completed`, `exceeded`)
- `periodType` (string): 週期類型篩選 (`monthly`, `quarterly`, `yearly`)
- `categoryId` (string): 分類篩選
- `search` (string): 搜尋關鍵字
- `sortBy` (string): 排序欄位 (`createdAt`, `updatedAt`, `startDate`, `endDate`, `amount`, `usagePercentage`)
- `sortOrder` (string): 排序方向 (`asc`, `desc`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "68a1943602a935e9abdb6abd",
        "name": "2025年8月生活費預算",
        "amount": 25000,
        "currentSpent": 1098,
        "usagePercentage": 4,
        "status": "active",
        "warningLevel": "safe",
        "remainingDays": 14
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "pages": 1
    },
    "summary": {
      "totalBudgets": 1,
      "activeBudgets": 1,
      "warningBudgets": 0,
      "exceededBudgets": 0,
      "totalAmount": 25000,
      "totalSpent": 1098
    }
  }
}
```

#### 預算統計 API 詳細規格

**GET** `/api/budgets/stats`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalBudgets": 2,
      "activeBudgets": 1,
      "completedBudgets": 1,
      "totalAmount": 58000,
      "totalSpent": 1098,
      "avgUsageRate": 1.89
    },
    "warnings": {
      "exceededBudgets": 0,
      "dangerBudgets": 0,
      "warningBudgets": 0,
      "safeBudgets": 1
    },
    "currentMonth": {
      "budgetCount": 1,
      "totalAmount": 28000,
      "totalSpent": 1098,
      "usageRate": 3.92
    },
    "topSpendingBudgets": [
      {
        "id": "68a1943602a935e9abdb6abd",
        "name": "2025年8月生活費預算",
        "amount": 28000,
        "spent": 1098,
        "usageRate": 4,
        "warningLevel": "safe"
      }
    ]
  }
}
```

### 協作功能 API 架構規劃

#### 10. 工作空間管理 (Workspaces) - P2

```
GET    /api/v1/workspaces                    # 取得使用者的工作空間列表
POST   /api/v1/workspaces                    # 建立新工作空間
GET    /api/v1/workspaces/:id                # 取得工作空間詳情
PUT    /api/v1/workspaces/:id                # 更新工作空間
DELETE /api/v1/workspaces/:id                # 刪除工作空間

GET    /api/v1/workspaces/:id/members        # 取得成員列表
POST   /api/v1/workspaces/:id/members        # 邀請新成員
PUT    /api/v1/workspaces/:id/members/:userId # 更新成員權限
DELETE /api/v1/workspaces/:id/members/:userId # 移除成員

GET    /api/v1/workspaces/:id/invitations    # 取得邀請列表
POST   /api/v1/workspaces/:id/invitations    # 發送邀請
DELETE /api/v1/workspaces/:id/invitations/:id # 取消邀請
```

#### 11. 通知系統 (Notifications) - P3

```
GET    /api/v1/notifications                 # 取得通知列表
PUT    /api/v1/notifications/:id/read        # 標記為已讀
DELETE /api/v1/notifications/:id             # 刪除通知
POST   /api/v1/notifications/mark-all-read   # 全部標記為已讀

GET    /api/v1/notifications/settings        # 取得通知設定
PUT    /api/v1/notifications/settings        # 更新通知設定
```

#### 12. 審計日誌 (Audit Logs) - P3

```
GET    /api/v1/workspaces/:id/audit-logs     # 取得操作記錄
GET    /api/v1/audit-logs/my-activities      # 取得個人操作記錄
```

#### 協作模式下的 API 修改:

**資源路徑變更:**
```
# Phase 1 (個人模式)
GET /api/v1/records

# Phase 2 (工作空間模式)  
GET /api/v1/workspaces/:workspaceId/records
GET /api/v1/workspaces/:workspaceId/budgets
GET /api/v1/workspaces/:workspaceId/categories
```

**回應格式擴展:**
```json
{
  "data": {
    "id": "record_id",
    "amount": 120.50,
    "createdBy": {
      "id": "user_id",
      "name": "張小明",
      "avatar": "avatar_url"
    },
    "workspace": {
      "id": "workspace_id",
      "name": "張家帳本"
    }
  }
}
```

---

## 中介軟體 (Middleware)

### 1. 認證中介軟體
```javascript
// JWT Token 驗證
function authenticateToken(req, res, next) {
  // 驗證 Authorization header
  // 解析 JWT token
  // 設定 req.user
}
```

### 2. 權限控制中介軟體 (P2)
```javascript
// 工作空間權限檢查
function checkWorkspacePermission(permission) {
  return (req, res, next) => {
    // 檢查使用者在工作空間中的權限
    // permission: 'read', 'write', 'delete', 'admin'
  };
}
```

### 3. 資料驗證中介軟體
```javascript
// 使用 Joi 或類似套件進行資料驗證
function validateRequest(schema) {
  return (req, res, next) => {
    // 驗證 req.body
    // 驗證失敗回傳 422
  };
}
```

### 4. 速率限制中介軟體
```javascript
// API 呼叫頻率限制
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
};
```

---

## 錯誤處理標準

### 錯誤代碼定義

#### 認證相關 (AUTH_*)
- `AUTH_INVALID_CREDENTIALS` - 帳號密碼錯誤
- `AUTH_TOKEN_EXPIRED` - Token 已過期
- `AUTH_TOKEN_INVALID` - Token 無效
- `AUTH_ACCESS_DENIED` - 無存取權限

#### 驗證相關 (VALIDATION_*)
- `VALIDATION_REQUIRED` - 必填欄位缺失
- `VALIDATION_FORMAT` - 格式錯誤
- `VALIDATION_RANGE` - 數值超出範圍
- `VALIDATION_UNIQUE` - 唯一性約束違反

#### 資源相關 (RESOURCE_*)
- `RESOURCE_NOT_FOUND` - 資源不存在
- `RESOURCE_CONFLICT` - 資源衝突
- `RESOURCE_IN_USE` - 資源正在使用中
- `RESOURCE_LIMIT_EXCEEDED` - 資源限制超出

#### 業務邏輯相關 (BUSINESS_*)
- `BUDGET_EXCEEDED` - 預算超支
- `CATEGORY_IN_USE` - 分類使用中無法刪除
- `CURRENCY_NOT_SUPPORTED` - 不支援的貨幣
- `EXCHANGE_RATE_UNAVAILABLE` - 匯率資料不可用

#### 系統相關 (SYSTEM_*)
- `SYSTEM_ERROR` - 系統錯誤
- `EXTERNAL_SERVICE_ERROR` - 外部服務錯誤
- `DATABASE_ERROR` - 資料庫錯誤
- `RATE_LIMIT_EXCEEDED` - 請求頻率超限

### 錯誤回應範例

#### 驗證錯誤 (422)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "code": "VALIDATION_FORMAT",
        "message": "Invalid email format"
      },
      {
        "field": "amount",
        "code": "VALIDATION_RANGE", 
        "message": "Amount must be greater than 0"
      }
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/records"
  }
}
```

#### 業務邏輯錯誤 (409)
```json
{
  "error": {
    "code": "CATEGORY_IN_USE",
    "message": "Cannot delete category that is still in use",
    "details": [
      {
        "field": "categoryId",
        "message": "Category has 5 associated records"
      }
    ],
    "suggestions": [
      "Move records to another category before deletion",
      "Use the bulk update feature to reassign records"
    ],
    "timestamp": "2024-01-15T10:30:00.000Z",
    "path": "/api/v1/categories/60d5ecb54b24a30d5c8e4b1b"
  }
}
```

---

## API 版本控制

### 版本策略
- **URL 版本控制**: `/api/v1/`, `/api/v2/`
- **向後相容性**: v1 API 在 v2 發布後至少維護 12 個月
- **棄用通知**: 棄用的 API 回傳 `Deprecated` header

### Header 範例
```
Deprecated: true
Sunset: Wed, 01 Jan 2025 00:00:00 GMT
Link: </api/v2/records>; rel="successor-version"
```

---

## 安全性考量

### 1. 認證安全
- JWT Token 有效期: 24小時
- Refresh Token 有效期: 30天  
- 密碼加密: bcrypt (rounds: 12)
- 登入失敗鎖定: 5次失敗後鎖定15分鐘

### 2. API 安全
- HTTPS 強制使用
- CORS 設定: 只允許授權的前端網域
- 輸入驗證和清理
- SQL Injection 防護 (使用 Mongoose)

### 3. 資料隔離
- 所有查詢都基於 userId 過濾
- 工作空間資料隔離 (P2)
- 敏感資料加密儲存

### 4. 速率限制
- 登入 API: 5次/分鐘
- 一般 API: 100次/15分鐘
- 檔案上傳: 10次/小時

---

## 測試策略

### 1. API 測試類型
- **單元測試**: 控制器邏輯測試
- **整合測試**: 端對端 API 流程測試  
- **負載測試**: 效能和穩定性測試
- **安全測試**: 滲透測試和漏洞掃描

### 2. 測試工具
- **測試框架**: Jest
- **API 測試**: Supertest
- **模擬資料**: MongoDB Memory Server
- **負載測試**: Artillery 或 k6

### 3. 測試覆蓋率目標
- **控制器**: 90%+
- **中介軟體**: 95%+
- **工具函數**: 100%
- **整體覆蓋率**: 85%+

---

## 效能最佳化

### 1. 快取策略
- **Redis 快取**: 匯率資料、統計結果
- **記憶體快取**: 分類列表、使用者偏好
- **CDN**: 靜態資源 (頭像、收據圖片)

### 2. 資料庫最佳化
- **索引策略**: 基於查詢模式最佳化
- **聚合管道**: 使用 MongoDB aggregation
- **分頁**: 避免大量資料查詢
- **連接池**: 適當的連接池設定

### 3. API 最佳化
- **回應壓縮**: Gzip 壓縮
- **欄位選擇**: 只回傳需要的欄位
- **批量操作**: 支援批量建立/更新
- **非同步處理**: 耗時操作使用佇列

---

## 監控和日誌

### 1. API 監控指標
- **回應時間**: P50, P95, P99
- **錯誤率**: 4xx, 5xx 錯誤比例
- **吞吐量**: RPS (Requests per second)
- **可用性**: Uptime 監控

### 2. 日誌格式
```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "info",
  "method": "POST", 
  "url": "/api/v1/records",
  "userId": "60d5ecb54b24a30d5c8e4b1a",
  "statusCode": 201,
  "responseTime": 142,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.100"
}
```

### 3. 監控工具
- **APM**: New Relic 或 Datadog
- **日誌**: Winston + ELK Stack
- **健康檢查**: `/api/health` endpoint
- **錯誤追蹤**: Sentry

---

## 部署和運維

### 1. 環境變數
```env
# 資料庫
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...

# JWT 
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=24h

# 外部服務
EXCHANGE_RATE_API_KEY=your-api-key
EMAIL_SERVICE_API_KEY=your-api-key

# 雲端服務
CLOUD_STORAGE_BUCKET=your-bucket
CLOUD_STORAGE_KEY_FILE=path-to-key.json
```

### 2. Docker 配置
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. Cloud Run 部署
```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: finance-api
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
      - image: gcr.io/project/finance-api
        ports:
        - containerPort: 3000
        env:
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: finance-secrets
              key: mongodb-uri
```

---

## API 使用範例

### JavaScript (前端) 範例
```javascript
// API 客戶端設定
class FinanceAPI {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  async createRecord(recordData) {
    const response = await fetch(`${this.baseURL}/api/v1/records`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify(recordData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async getRecords(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`${this.baseURL}/api/v1/records?${params}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    return response.json();
  }
}

// 使用範例
const api = new FinanceAPI('https://your-api.com', userToken);

// 建立記錄
const newRecord = await api.createRecord({
  amount: 120.50,
  type: 'expense',
  description: '午餐',
  categoryId: 'category_id',
  date: new Date().toISOString()
});

// 查詢記錄
const records = await api.getRecords({
  type: 'expense',
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  page: 1,
  limit: 20
});
```

### cURL 範例
```bash
# 登入
curl -X POST https://your-api.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 建立記錄
curl -X POST https://your-api.com/api/v1/records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "amount": 120.50,
    "type": "expense", 
    "description": "午餐",
    "categoryId": "category_id",
    "date": "2024-01-15T12:00:00.000Z"
  }'

# 查詢記錄
curl -X GET "https://your-api.com/api/v1/records?type=expense&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

這份 API 規格文件為 Claude Code CLI 提供了完整的後端 API 實作指引，包含所有必要的端點定義、錯誤處理、安全性考量和部署策略。Phase 1 API Endpoints (P0/P1)

## 1. 認證系統 (Authentication)

### POST `/api/v1/auth/register`
使用者註冊

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "張小明"
}
```

**Response (201):**
```json
{
  "data": {
    "user": {
      "id": "60d5ecb54b24a30d5c8e4b1a",
      "email": "user@example.com", 
      "name": "張小明",
      "emailVerified": false,
      "preferences": {
        "currency": "TWD",
        "theme": "light",
        "language": "zh-TW"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/v1/auth/login`
使用者登入

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "data": {
    "user": {
      "id": "60d5ecb54b24a30d5c8e4b1a",
      "email": "user@example.com",
      "name": "張小明",
      "emailVerified": true,
      "preferences": {
        "currency": "TWD",
        "theme": "light", 
        "language": "zh-TW"
      }
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/v1/auth/logout`
使用者登出 (加入 token 到黑名單)

**Headers:** `Authorization: Bearer <token>`

**Response (204):** 無內容

### POST `/api/v1/auth/refresh`
刷新 JWT Token

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST `/api/v1/auth/forgot-password`
忘記密碼

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password reset email sent"
  }
}
```

### POST `/api/v1/auth/reset-password`
重設密碼

**Request Body:**
```json
{
  "token": "reset_token_here",
  "password": "newpassword123"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password reset successful"
  }
}
```

---

## 2. 使用者管理 (Users)

### GET `/api/v1/users/profile`
取得使用者資料

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b1a",
    "email": "user@example.com",
    "name": "張小明",
    "emailVerified": true,
    "preferences": {
      "currency": "TWD",
      "dateFormat": "YYYY-MM-DD",
      "theme": "light",
      "language": "zh-TW",
      "decimalPlaces": 2
    },
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastLoginAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT `/api/v1/users/profile`
更新使用者資料

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "張大明",
  "preferences": {
    "currency": "USD",
    "theme": "dark",
    "dateFormat": "DD/MM/YYYY"
  }
}
```

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b1a",
    "email": "user@example.com",
    "name": "張大明",
    "preferences": {
      "currency": "USD",
      "dateFormat": "DD/MM/YYYY",
      "theme": "dark",
      "language": "zh-TW",
      "decimalPlaces": 2
    }
  }
}
```

### POST `/api/v1/users/change-password`
修改密碼

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword456"
}
```

**Response (200):**
```json
{
  "data": {
    "message": "Password changed successfully"
  }
}
```

---

## 3. 分類管理 (Categories)

### GET `/api/v1/categories`
取得分類列表

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `type` - 分類類型 (`income` | `expense`)
- `includeSystem` - 是否包含系統分類 (default: true)

**Response (200):**
```json
{
  "data": [
    {
      "id": "60d5ecb54b24a30d5c8e4b1b",
      "name": "餐飲",
      "type": "expense",
      "icon": "utensils",
      "color": "#F59E0B",
      "isSystem": true,
      "parentId": null,
      "usageCount": 25,
      "sortOrder": 1,
      "lastUsedAt": "2024-01-15T08:30:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "60d5ecb54b24a30d5c8e4b1c", 
      "name": "午餐",
      "type": "expense",
      "icon": "utensils",
      "color": "#F59E0B",
      "isSystem": false,
      "parentId": "60d5ecb54b24a30d5c8e4b1b",
      "usageCount": 12,
      "sortOrder": 1,
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ]
}
```

### POST `/api/v1/categories`
建立新分類

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "健身",
  "type": "expense",
  "icon": "dumbbell",
  "color": "#10B981",
  "parentId": null
}
```

**Response (201):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b1d",
    "name": "健身",
    "type": "expense", 
    "icon": "dumbbell",
    "color": "#10B981",
    "isSystem": false,
    "parentId": null,
    "usageCount": 0,
    "sortOrder": 0,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### PUT `/api/v1/categories/:id`
更新分類

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "運動健身",
  "icon": "heart",
  "color": "#EF4444"
}
```

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b1d",
    "name": "運動健身",
    "type": "expense",
    "icon": "heart", 
    "color": "#EF4444",
    "isSystem": false,
    "parentId": null,
    "usageCount": 3,
    "sortOrder": 0,
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

### DELETE `/api/v1/categories/:id`
刪除分類

**Headers:** `Authorization: Bearer <token>`

**Response (204):** 無內容

**Error (409) - 分類仍在使用中:**
```json
{
  "error": {
    "code": "CATEGORY_IN_USE",
    "message": "Cannot delete category that is still in use",
    "details": [
      {
        "field": "categoryId", 
        "message": "Category has 5 associated records"
      }
    ]
  }
}
```

---

## 4. 交易記錄 (Records)

### GET `/api/v1/records`
取得交易記錄列表

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` - 頁碼 (default: 1)
- `limit` - 每頁筆數 (default: 20, max: 100)
- `type` - 交易類型 (`income` | `expense`)
- `categoryId` - 分類 ID
- `startDate` - 開始日期 (YYYY-MM-DD)
- `endDate` - 結束日期 (YYYY-MM-DD)
- `search` - 搜尋關鍵字 (搜尋描述)
- `sort` - 排序 (default: `-date`)

**Response (200):**
```json
{
  "data": [
    {
      "id": "60d5ecb54b24a30d5c8e4b1e",
      "amount": 120.50,
      "type": "expense",
      "description": "午餐 - 鼎泰豐",
      "date": "2024-01-15T12:00:00.000Z",
      "currency": "TWD",
      "exchangeRate": 1,
      "baseCurrencyAmount": 120.50,
      "category": {
        "id": "60d5ecb54b24a30d5c8e4b1b",
        "name": "餐飲",
        "icon": "utensils",
        "color": "#F59E0B"
      },
      "tags": ["外食", "小籠包"],
      "location": {
        "name": "鼎泰豐信義店",
        "lat": 25.033,
        "lng": 121.565
      },
      "createdAt": "2024-01-15T12:05:00.000Z",
      "updatedAt": "2024-01-15T12:05:00.000Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalIncome": 45000,
      "totalExpense": 28500,
      "balance": 16500,
      "count": 156
    }
  }
}
```

### GET `/api/v1/records/:id`
取得單筆交易記錄

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b1e",
    "amount": 120.50,
    "type": "expense",
    "description": "午餐 - 鼎泰豐",
    "date": "2024-01-15T12:00:00.000Z",
    "currency": "TWD",
    "exchangeRate": 1,
    "baseCurrencyAmount": 120.50,
    "categoryId": "60d5ecb54b24a30d5c8e4b1b",
    "tags": ["外食", "小籠包"],
    "location": {
      "name": "鼎泰豐信義店",
      "lat": 25.033,
      "lng": 121.565
    },
    "receipt": {
      "url": "https://storage.example.com/receipts/12345.jpg",
      "filename": "receipt_20240115.jpg"
    },
    "createdAt": "2024-01-15T12:05:00.000Z",
    "updatedAt": "2024-01-15T12:05:00.000Z"
  }
}
```

### POST `/api/v1/records`
建立交易記錄

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 85.00,
  "type": "expense",
  "description": "捷運月票",
  "date": "2024-01-15T09:00:00.000Z",
  "categoryId": "60d5ecb54b24a30d5c8e4b1f",
  "currency": "TWD",
  "tags": ["交通", "月票"],
  "location": {
    "name": "台北車站",
    "lat": 25.0478,
    "lng": 121.5170
  }
}
```

**Response (201):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b20",
    "amount": 85.00,
    "type": "expense", 
    "description": "捷運月票",
    "date": "2024-01-15T09:00:00.000Z",
    "currency": "TWD",
    "exchangeRate": 1,
    "baseCurrencyAmount": 85.00,
    "categoryId": "60d5ecb54b24a30d5c8e4b1f",
    "tags": ["交通", "月票"],
    "location": {
      "name": "台北車站", 
      "lat": 25.0478,
      "lng": 121.5170
    },
    "createdAt": "2024-01-15T09:05:00.000Z",
    "updatedAt": "2024-01-15T09:05:00.000Z"
  }
}
```

### PUT `/api/v1/records/:id`
更新交易記錄

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 90.00,
  "description": "捷運月票 (已調漲)",
  "tags": ["交通", "月票", "調漲"]
}
```

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b20",
    "amount": 90.00,
    "type": "expense",
    "description": "捷運月票 (已調漲)",
    "date": "2024-01-15T09:00:00.000Z",
    "currency": "TWD", 
    "exchangeRate": 1,
    "baseCurrencyAmount": 90.00,
    "categoryId": "60d5ecb54b24a30d5c8e4b1f",
    "tags": ["交通", "月票", "調漲"],
    "updatedAt": "2024-01-15T14:30:00.000Z"
  }
}
```

### DELETE `/api/v1/records/:id`
刪除交易記錄

**Headers:** `Authorization: Bearer <token>`

**Response (204):** 無內容

---

## 5. 統計分析 (Statistics)

### GET `/api/v1/statistics/overview`
取得財務總覽

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` - 時間範圍 (`current_month` | `last_month` | `current_year` | `last_year` | `custom`)
- `startDate` - 自訂開始日期 (when period=custom)
- `endDate` - 自訂結束日期 (when period=custom)

**Response (200):**
```json
{
  "data": {
    "period": {
      "type": "current_month",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "summary": {
      "totalIncome": 45000,
      "totalExpense": 28500,
      "balance": 16500,
      "transactionCount": 156
    },
    "comparison": {
      "income": {
        "amount": 45000,
        "change": 2500,
        "changePercent": 5.88
      },
      "expense": {
        "amount": 28500,
        "change": -1200,
        "changePercent": -4.04
      }
    },
    "topCategories": [
      {
        "categoryId": "60d5ecb54b24a30d5c8e4b1b",
        "categoryName": "餐飲",
        "amount": 8500,
        "percentage": 29.82,
        "transactionCount": 45
      },
      {
        "categoryId": "60d5ecb54b24a30d5c8e4b1f", 
        "categoryName": "交通",
        "amount": 3200,
        "percentage": 11.23,
        "transactionCount": 28
      }
    ]
  }
}
```

### GET `/api/v1/statistics/trends`
取得趨勢分析

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` - 時間粒度 (`daily` | `weekly` | `monthly`)
- `type` - 資料類型 (`income` | `expense` | `balance`)
- `months` - 月份數 (default: 12, max: 24)

**Response (200):**
```json
{
  "data": {
    "period": "monthly",
    "type": "expense", 
    "data": [
      {
        "date": "2023-02-01T00:00:00.000Z",
        "amount": 25000,
        "transactionCount": 89
      },
      {
        "date": "2023-03-01T00:00:00.000Z", 
        "amount": 27500,
        "transactionCount": 102
      },
      {
        "date": "2024-01-01T00:00:00.000Z",
        "amount": 28500,
        "transactionCount": 156
      }
    ],
    "insights": {
      "average": 26500,
      "highest": {
        "date": "2024-01-01T00:00:00.000Z",
        "amount": 28500
      },
      "lowest": {
        "date": "2023-02-01T00:00:00.000Z", 
        "amount": 25000
      },
      "trend": "increasing" // "increasing" | "decreasing" | "stable"
    }
  }
}
```

### GET `/api/v1/statistics/categories`
取得分類統計

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` - 同 overview
- `type` - 交易類型 (`income` | `expense`)
- `startDate` - 自訂開始日期
- `endDate` - 自訂結束日期

**Response (200):**
```json
{
  "data": {
    "period": {
      "type": "current_month",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z"
    },
    "type": "expense",
    "categories": [
      {
        "categoryId": "60d5ecb54b24a30d5c8e4b1b",
        "categoryName": "餐飲",
        "amount": 8500,
        "percentage": 29.82,
        "transactionCount": 45,
        "averagePerTransaction": 188.89,
        "subcategories": [
          {
            "categoryId": "60d5ecb54b24a30d5c8e4b1c",
            "categoryName": "午餐", 
            "amount": 3600,
            "percentage": 42.35,
            "transactionCount": 20
          }
        ]
      }
    ],
    "total": 28500
  }
}
```

---

## 6. 預算管理 (Budgets)

### GET `/api/v1/budgets`
取得預算列表

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `period` - 預算週期 (`monthly` | `yearly`)
- `active` - 是否只顯示活躍預算 (default: true)

**Response (200):**
```json
{
  "data": [
    {
      "id": "60d5ecb54b24a30d5c8e4b21",
      "name": "一月總預算",
      "amount": 30000,
      "categoryId": null,
      "period": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z", 
      "warningThreshold": 80,
      "currentSpent": 28500,
      "remainingAmount": 1500,
      "usagePercentage": 95.0,
      "isExceeded": false,
      "isWarning": true,
      "daysRemaining": 16,
      "averageDailySpent": 1825,
      "projectedTotal": 31400,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "60d5ecb54b24a30d5c8e4b22", 
      "name": "餐飲預算",
      "amount": 10000,
      "categoryId": "60d5ecb54b24a30d5c8e4b1b",
      "categoryName": "餐飲",
      "period": "monthly",
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-01-31T23:59:59.999Z",
      "warningThreshold": 80,
      "currentSpent": 8500,
      "remainingAmount": 1500,
      "usagePercentage": 85.0,
      "isExceeded": false, 
      "isWarning": true,
      "isActive": true
    }
  ]
}
```

### GET `/api/v1/budgets/:id`
取得單一預算詳情

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b21",
    "name": "一月總預算", 
    "amount": 30000,
    "categoryId": null,
    "period": "monthly",
    "startDate": "2024-01-01T00:00:00.000Z",
    "endDate": "2024-01-31T23:59:59.999Z",
    "warningThreshold": 80,
    "currentSpent": 28500,
    "remainingAmount": 1500,
    "usagePercentage": 95.0,
    "dailyBudget": 967.74,
    "averageDailySpent": 1825,
    "recentTransactions": [
      {
        "id": "60d5ecb54b24a30d5c8e4b1e",
        "amount": 120.50,
        "description": "午餐 - 鼎泰豐",
        "date": "2024-01-15T12:00:00.000Z",
        "categoryName": "餐飲"
      }
    ],
    "spendingTrend": [
      {"date": "2024-01-01", "amount": 450},
      {"date": "2024-01-02", "amount": 320},
      {"date": "2024-01-15", "amount": 1825}
    ]
  }
}
```

### POST `/api/v1/budgets`
建立預算

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "二月總預算",
  "amount": 32000,
  "categoryId": null,
  "period": "monthly", 
  "startDate": "2024-02-01T00:00:00.000Z",
  "endDate": "2024-02-29T23:59:59.999Z",
  "warningThreshold": 75
}
```

**Response (201):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b23",
    "name": "二月總預算",
    "amount": 32000,
    "categoryId": null,
    "period": "monthly",
    "startDate": "2024-02-01T00:00:00.000Z", 
    "endDate": "2024-02-29T23:59:59.999Z",
    "warningThreshold": 75,
    "currentSpent": 0,
    "remainingAmount": 32000,
    "usagePercentage": 0,
    "isActive": true,
    "createdAt": "2024-01-15T15:00:00.000Z"
  }
}
```

### PUT `/api/v1/budgets/:id`
更新預算

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 35000,
  "warningThreshold": 70
}
```

**Response (200):**
```json
{
  "data": {
    "id": "60d5ecb54b24a30d5c8e4b23",
    "name": "二月總預算",
    "amount": 35000,
    "warningThreshold": 70,
    "currentSpent": 0,
    "remainingAmount": 35000,
    "usagePercentage": 0,
    "updatedAt": "2024-01-15T15:30:00.000Z"
  }
}
```

### DELETE `/api/v1/budgets/:id`
刪除預算

**Headers:** `Authorization: Bearer <token>`

**Response (204):** 無內容

---

## 7. 匯率服務 (Exchange Rates) - P1

### GET `/api/v1/exchange-rates`
取得匯率列表

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `base` - 基準貨幣 (default: TWD)
- `symbols` - 目標貨幣 (comma separated, 如: USD,EUR,JPY)

**Response (200):**
```json
{
  "data": {
    "base": "TWD",
    "date": "2024-01-15T10:00:00.000Z",
    "rates": {
      "USD": 0.0323,
      "EUR": 0.0296, 
      "JPY": 4.68,
      "GBP": 0.0254,
      "CNY": 0.2301
    },
    "source": "exchangerate-api",
    "nextUpdate": "2024-01-16T00:00:00.000Z"
  }
}
```

### POST `/api/v1/exchange-rates/convert`
匯率轉換

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "amount": 1000,
  "fromCurrency": "TWD", 
  "toCurrency": "USD"
}
```

**Response (200):**
```json
{
  "data": {
    "originalAmount": 1000,
    "fromCurrency": "TWD",
    "toCurrency": "USD",
    "exchangeRate": 0.0323,
    "convertedAmount": 32.30,
    "date": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 