# Personal Finance Manager - 技術架構文檔

## 概述

本文檔詳細描述 Personal Finance Manager 的整體技術架構，包括前端、後端、移動端和資料庫的設計決策、元件關係和資料流程。

## 系統架構概覽

```
┌─────────────────────────────────────────────────────────────┐
│                        用戶端層                              │
├─────────────────────────┬───────────────────────────────────┤
│     Web 應用程式        │        移動應用程式               │
│   (Nuxt.js 3 + Vue.js)  │      (Tauri 2 + WebView)         │
│                         │                                   │
│  - 響應式設計           │  - 原生 Android APK               │
│  - 大螢幕最佳化         │  - 原生 iOS APP                   │
│  - 進階分析功能         │  - 快速記帳介面                   │
│  - 批量操作             │  - 推播通知                       │
└─────────────────────────┴───────────────────────────────────┘
                          │
                          │ HTTPS/REST API
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    應用程式層                                │
│                (Nuxt.js 3 Server API)                      │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ 認證服務    │  │ 業務邏輯    │  │   外部服務整合      │ │
│  │ - JWT       │  │ - 記帳邏輯  │  │ - 匯率 API         │ │
│  │ - 權限控制  │  │ - 預算管理  │  │ - 推播通知服務     │ │
│  │ - 資料加密  │  │ - 統計分析  │  │ - 檔案儲存服務     │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Mongoose ODM
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      資料層                                  │
│                    MongoDB Atlas                            │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ 使用者資料  │  │ 財務記錄    │  │   系統資料          │ │
│  │ - users     │  │ - records   │  │ - exchange_rates    │ │
│  │ - 個人設定  │  │ - categories│  │ - audit_logs        │ │
│  │ - 認證資訊  │  │ - budgets   │  │ - 系統設定          │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 前端架構

### Web 應用程式 (Nuxt.js 3)

#### 目錄結構
```
frontend/
├── assets/              # 靜態資源
│   ├── css/            # 全域樣式
│   ├── images/         # 圖片資源
│   └── icons/          # 圖示資源
├── components/          # Vue 元件
│   ├── ui/             # 基礎 UI 元件
│   ├── forms/          # 表單元件
│   ├── charts/         # 圖表元件
│   └── layout/         # 佈局元件
├── composables/         # Vue 3 組合式函數
│   ├── useAuth.js      # 認證相關
│   ├── useRecords.js   # 記錄管理
│   └── useBudgets.js   # 預算管理
├── layouts/             # 頁面佈局
├── middleware/          # 路由中介軟體
├── pages/              # 路由頁面
├── plugins/            # Nuxt 外掛
├── server/             # 伺服器端 API
│   └── api/            # API 端點
├── stores/             # Pinia 狀態管理
└── utils/              # 工具函數
```

#### 核心技術棧
- **Nuxt.js 3**: Vue.js 全端框架
- **Vue.js 3**: 前端框架（使用 Composition API）
- **TypeScript**: 類型安全
- **Pinia**: 狀態管理
- **Tailwind CSS**: 樣式框架
- **Chart.js/D3.js**: 圖表庫
- **VeeValidate**: 表單驗證

#### 響應式設計
```css
/* 斷點定義 */
@media (min-width: 640px) { /* sm */ }
@media (min-width: 768px) { /* md */ }
@media (min-width: 1024px) { /* lg */ }
@media (min-width: 1280px) { /* xl */ }

/* 行動優先設計 */
.container {
  @apply px-4 sm:px-6 lg:px-8;
  max-width: 1200px;
  margin: 0 auto;
}
```

#### 狀態管理架構
```typescript
// stores/auth.ts
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    isAuthenticated: false
  }),
  
  actions: {
    async login(credentials: LoginCredentials) {
      // 登入邏輯
    },
    
    async logout() {
      // 登出邏輯
    }
  }
})

// stores/records.ts  
export const useRecordsStore = defineStore('records', {
  state: () => ({
    records: [] as Record[],
    loading: false,
    filters: {
      startDate: null,
      endDate: null,
      categoryId: null
    }
  }),
  
  actions: {
    async fetchRecords() {
      // 獲取記錄
    },
    
    async createRecord(record: CreateRecordDto) {
      // 建立記錄
    }
  }
})
```

### 移動應用程式 (Tauri 2)

#### 架構設計
```
Mobile App (Tauri 2)
├── 原生殼層 (Native Shell)
│   ├── Android (Kotlin/Java)
│   └── iOS (Swift/Objective-C)
├── WebView 引擎
│   ├── JavaScript Bridge
│   └── Native API 存取
└── Web 內容 (同 Web 版)
    ├── 移動優化的 CSS
    ├── 觸控手勢支援
    └── 行動端專用功能
```

#### 平台特定功能

**Android 特有功能:**
```javascript
// tauri.conf.json - Android 配置
{
  "android": {
    "permissions": [
      "android.permission.CAMERA",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.VIBRATE"
    ],
    "features": [
      "camera",
      "storage",
      "notifications"
    ]
  }
}
```

**iOS 特有功能:**
```javascript
// tauri.conf.json - iOS 配置  
{
  "ios": {
    "frameworks": ["AVFoundation", "Photos"],
    "capabilities": [
      "camera",
      "photo-library",
      "push-notifications"
    ]
  }
}
```

#### 原生 API 整合
```typescript
// 相機功能
import { invoke } from '@tauri-apps/api/core';

export async function captureReceipt(): Promise<string> {
  try {
    const imagePath = await invoke('capture_image');
    return imagePath;
  } catch (error) {
    console.error('相機啟動失敗:', error);
    throw error;
  }
}

// 推播通知
export async function sendNotification(title: string, body: string) {
  await invoke('send_notification', { title, body });
}

// 檔案存取
export async function exportData(data: any): Promise<string> {
  return await invoke('export_data', { data });
}
```

---

## 後端架構

### Nuxt.js 3 Server API

#### API 結構
```
server/api/
├── auth/
│   ├── login.post.ts
│   ├── register.post.ts
│   ├── refresh.post.ts
│   └── logout.post.ts
├── users/
│   ├── profile.get.ts
│   └── profile.put.ts
├── records/
│   ├── index.get.ts
│   ├── index.post.ts
│   ├── [id].get.ts
│   ├── [id].put.ts
│   └── [id].delete.ts
├── categories/
├── budgets/
├── statistics/
└── utils/
    ├── exchange-rates.get.ts
    └── export.post.ts
```

#### API 端點設計
```typescript
// server/api/records/index.post.ts
export default defineEventHandler(async (event) => {
  try {
    // 驗證使用者身份
    const user = await requireAuth(event);
    
    // 驗證請求資料
    const body = await readBody(event);
    const validatedData = await validateRecord(body);
    
    // 業務邏輯處理
    const record = await recordService.create({
      ...validatedData,
      userId: user.id
    });
    
    // 更新相關統計
    await statisticsService.updateUserStats(user.id);
    
    return {
      success: true,
      data: record
    };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message
    });
  }
});
```

#### 中介軟體設計
```typescript
// server/middleware/auth.ts
export async function requireAuth(event: H3Event): Promise<User> {
  const token = getCookie(event, 'auth-token') || 
                getHeader(event, 'authorization')?.replace('Bearer ', '');
                
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    });
  }
  
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    
    if (!user) {
      throw createError({
        statusCode: 401, 
        statusMessage: 'User not found'
      });
    }
    
    return user;
  } catch (error) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token'
    });
  }
}

// server/middleware/validation.ts
export async function validateRecord(data: any): Promise<CreateRecordDto> {
  const schema = z.object({
    amount: z.number().positive(),
    type: z.enum(['income', 'expense']),
    description: z.string().max(200).optional(),
    categoryId: z.string(),
    date: z.string().datetime(),
    currency: z.string().default('TWD')
  });
  
  return schema.parse(data);
}
```

### 外部服務整合

#### 匯率服務
```typescript
// services/exchangeRateService.ts
export class ExchangeRateService {
  private apiKey = process.env.EXCHANGE_RATE_API_KEY;
  private baseUrl = 'https://api.exchangerate-api.com/v4/latest';
  
  async getLatestRates(baseCurrency: string = 'TWD') {
    try {
      const response = await $fetch(`${this.baseUrl}/${baseCurrency}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      // 快取匯率資料
      await this.cacheRates(baseCurrency, response.rates);
      
      return response.rates;
    } catch (error) {
      // 回退到快取資料
      return await this.getCachedRates(baseCurrency);
    }
  }
  
  private async cacheRates(baseCurrency: string, rates: any) {
    await ExchangeRate.updateMany(
      { fromCurrency: baseCurrency },
      { 
        $set: { 
          rates,
          fetchedAt: new Date()
        }
      },
      { upsert: true }
    );
  }
}
```

#### 推播通知服務
```typescript
// services/notificationService.ts
export class NotificationService {
  private fcmServerKey = process.env.FCM_SERVER_KEY;
  
  async sendBudgetAlert(userId: string, budgetInfo: any) {
    const user = await User.findById(userId);
    if (!user?.deviceTokens?.length) return;
    
    const message = {
      notification: {
        title: '預算提醒',
        body: `您的 ${budgetInfo.categoryName} 預算已使用 ${budgetInfo.percentage}%`
      },
      data: {
        type: 'budget_alert',
        budgetId: budgetInfo.id
      },
      tokens: user.deviceTokens
    };
    
    await this.sendToFCM(message);
  }
  
  private async sendToFCM(message: any) {
    // Firebase Cloud Messaging 實作
  }
}
```

---

## 資料庫架構

### MongoDB 設計原則

#### 1. 文件結構設計
```javascript
// 使用者文件
{
  _id: ObjectId,
  email: "user@example.com",
  passwordHash: "hashed_password",
  profile: {
    name: "使用者名稱",
    avatar: "https://...",
    preferences: {
      currency: "TWD",
      theme: "light",
      notifications: {
        budgetAlerts: true,
        dailyReminders: false
      }
    }
  },
  createdAt: ISODate,
  lastLoginAt: ISODate
}

// 記錄文件
{
  _id: ObjectId,
  userId: ObjectId,
  amount: 120.50,
  type: "expense",
  description: "午餐",
  categoryId: ObjectId,
  date: ISODate,
  currency: "TWD",
  exchangeRate: 1.0,
  baseCurrencyAmount: 120.50,
  tags: ["外食", "便當"],
  location: {
    name: "公司附近",
    coordinates: [121.5654, 25.0330]
  },
  receipt: {
    url: "https://storage.../receipt.jpg",
    filename: "receipt_20240115.jpg"
  },
  metadata: {
    source: "mobile", // web, mobile
    version: "1.0.0"
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

#### 2. 索引策略
```javascript
// 使用者查詢最佳化
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "lastLoginAt": -1 });

// 記錄查詢最佳化
db.records.createIndex({ "userId": 1, "date": -1 });
db.records.createIndex({ "userId": 1, "type": 1, "date": -1 });
db.records.createIndex({ "userId": 1, "categoryId": 1, "date": -1 });

// 複合索引用於統計查詢
db.records.createIndex({ 
  "userId": 1, 
  "date": -1, 
  "type": 1 
});

// 文字搜尋索引
db.records.createIndex({
  "description": "text",
  "tags": "text"
});
```

#### 3. 聚合管道範例
```javascript
// 月度統計聚合
const monthlyStats = await db.records.aggregate([
  {
    $match: {
      userId: ObjectId(userId),
      date: {
        $gte: new Date(startOfMonth),
        $lte: new Date(endOfMonth)
      }
    }
  },
  {
    $group: {
      _id: {
        type: "$type",
        day: { $dayOfMonth: "$date" }
      },
      totalAmount: { $sum: "$baseCurrencyAmount" },
      count: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: "$_id.type",
      dailyAmounts: {
        $push: {
          day: "$_id.day",
          amount: "$totalAmount",
          count: "$count"
        }
      },
      totalAmount: { $sum: "$totalAmount" },
      totalCount: { $sum: "$count" }
    }
  }
]);

// 分類支出統計
const categoryStats = await db.records.aggregate([
  {
    $match: {
      userId: ObjectId(userId),
      type: "expense",
      date: { $gte: startDate, $lte: endDate }
    }
  },
  {
    $lookup: {
      from: "categories",
      localField: "categoryId", 
      foreignField: "_id",
      as: "category"
    }
  },
  {
    $unwind: "$category"
  },
  {
    $group: {
      _id: "$categoryId",
      categoryName: { $first: "$category.name" },
      categoryIcon: { $first: "$category.icon" },
      categoryColor: { $first: "$category.color" },
      totalAmount: { $sum: "$baseCurrencyAmount" },
      count: { $sum: 1 },
      averageAmount: { $avg: "$baseCurrencyAmount" }
    }
  },
  {
    $sort: { totalAmount: -1 }
  }
]);
```

---

## 資料流程設計

### 1. 使用者認證流程
```
使用者登入請求
    ↓
驗證帳號密碼
    ↓
產生 JWT Token
    ↓
回傳使用者資訊 + Token
    ↓
前端儲存 Token
    ↓
後續請求攜帶 Token
    ↓
中介軟體驗證 Token
    ↓
執行業務邏輯
```

### 2. 記帳流程
```
使用者輸入記帳資料
    ↓
前端資料驗證
    ↓
發送 API 請求
    ↓
後端身份驗證
    ↓
資料格式驗證
    ↓
匯率轉換 (如需要)
    ↓
儲存到資料庫
    ↓
更新使用者統計
    ↓
檢查預算狀況
    ↓
發送通知 (如需要)
    ↓
回傳結果
    ↓
前端更新介面
```

### 3. 資料同步流程
```
使用者在設備 A 建立記錄
    ↓
即時同步到雲端資料庫
    ↓
其他設備透過 WebSocket/輪詢檢查更新
    ↓
下載新資料
    ↓
更新本地快取
    ↓
重新渲染介面
```

---

## 安全性架構

### 1. 認證和授權
```typescript
// JWT Token 結構
{
  "iss": "personal-finance-manager",
  "sub": "user_id",
  "iat": timestamp,
  "exp": timestamp,
  "scope": ["read:records", "write:records"]
}

// 權限檢查中介軟體
async function checkPermission(
  event: H3Event, 
  requiredPermission: string
) {
  const user = await requireAuth(event);
  
  if (!user.permissions.includes(requiredPermission)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Insufficient permissions'
    });
  }
}
```

### 2. 資料加密
```typescript
// 敏感資料加密
import crypto from 'crypto';

export function encryptSensitiveData(data: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('personal-finance-data'));
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}
```

### 3. API 安全
```typescript
// 請求速率限制
export const rateLimiter = {
  login: { windowMs: 15 * 60 * 1000, max: 5 }, // 15分鐘5次
  api: { windowMs: 15 * 60 * 1000, max: 100 },  // 15分鐘100次
  export: { windowMs: 60 * 60 * 1000, max: 3 }  // 1小時3次
};

// CORS 設定
export const corsOptions = {
  origin: [
    'https://yourapp.com',
    'https://app.yourapp.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
```

---

## 效能最佳化策略

### 1. 前端最佳化
```typescript
// 元件懶載入
const LazyChart = defineAsyncComponent(() => 
  import('~/components/charts/ExpenseChart.vue')
);

// 虛擬捲動處理大量資料
const virtualListOptions = {
  itemHeight: 60,
  buffer: 10,
  renderAhead: 5
};

// 圖片最佳化
const imageOptimization = {
  format: 'webp',
  quality: 80,
  sizes: '(max-width: 768px) 100vw, 50vw'
};
```

### 2. 後端最佳化
```typescript
// Redis 快取
export const cacheService = {
  async getUserStats(userId: string) {
    const cacheKey = `user:${userId}:stats`;
    const cached = await redis.get(cacheKey);
    
    if (cached) return JSON.parse(cached);
    
    const stats = await calculateUserStats(userId);
    await redis.setex(cacheKey, 3600, JSON.stringify(stats)); // 1小時快取
    
    return stats;
  }
};

// 資料庫查詢最佳化
export async function getRecordsOptimized(userId: string, filters: any) {
  const query = Record.find({ userId });
  
  // 只選取需要的欄位
  query.select('amount type description date categoryId currency');
  
  // 預載入關聯資料
  query.populate('categoryId', 'name icon color');
  
  // 分頁處理
  if (filters.limit) {
    query.limit(filters.limit).skip(filters.offset || 0);
  }
  
  return await query.lean().exec(); // 使用 lean() 提升效能
}
```

### 3. 資料庫最佳化
```javascript
// 分區策略（按月份）
db.createCollection("records_202401", {
  validator: {
    $jsonSchema: { /* schema */ }
  }
});

// 自動過期索引清理舊資料
db.logs.createIndex(
  { "createdAt": 1 },
  { expireAfterSeconds: 2592000 } // 30天
);

// 讀取偏好設定
db.records.find().readPref("secondary");
```

---

## 部署架構

### Google Cloud Platform 部署
```yaml
# Cloud Run 服務配置
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: personal-finance-api
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "10"
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1000m"
    spec:
      containers:
      - image: gcr.io/project-id/personal-finance-manager
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        resources:
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

### Docker 配置
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

---

## 監控和日誌

### 應用程式監控
```typescript
// 效能監控
export const performanceMonitor = {
  trackApiCall: (endpoint: string, duration: number, statusCode: number) => {
    // 發送到監控服務
  },
  
  trackUserAction: (userId: string, action: string, metadata?: any) => {
    // 記錄使用者行為
  },
  
  trackError: (error: Error, context?: any) => {
    // 錯誤追蹤
  }
};

// 健康檢查端點
export default defineEventHandler(async (event) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      redis: await checkRedisHealth(),
      externalApi: await checkExternalApiHealth()
    }
  };
  
  const allHealthy = Object.values(health.services).every(
    service => service.status === 'OK'
  );
  
  setResponseStatus(event, allHealthy ? 200 : 503);
  return health;
});
```

### 日誌管理
```typescript
// 結構化日誌
export const logger = {
  info: (message: string, metadata?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  },
  
  error: (message: string, error?: Error, metadata?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.stack,
      timestamp: new Date().toISOString(),
      ...metadata
    }));
  }
};
```

---

## 開發工具和流程

### 已建置的開發環境
**前端環境狀態 (2024-08-09):**
- ✅ **Nuxt.js**: 3.18.1 (穩定版本)
- ✅ **Vue.js**: 3.5.18  
- ✅ **TypeScript**: 支援完整類型檢查
- ✅ **套件管理器**: yarn@1.22.22
- ✅ **建置狀態**: 測試通過，可正常建置和預覽

**快速啟動指令:**
```bash
cd frontend
yarn dev          # 啟動開發伺服器
yarn build        # 建置生產版本
yarn preview      # 預覽建置結果
```

### 開發環境配置
```json
{
  "scripts": {
    "dev": "nuxt dev",
    "build": "nuxt build", 
    "preview": "nuxt preview",
    "lint": "eslint . --fix",
    "test": "vitest",
    "test:e2e": "playwright test",
    "type-check": "vue-tsc --noEmit",
    "tauri:dev": "cargo tauri dev",
    "tauri:build": "cargo tauri build"
  }
}
```

### 程式碼品質工具
```javascript
// .eslintrc.js
module.exports = {
  extends: [
    '@nuxtjs/eslint-config-typescript',
    'plugin:vue/vue3-recommended'
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  }
};

// prettier.config.js
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5'
};
```

這份技術架構文檔提供了完整的系統設計概覽，涵蓋了從前端到後端、從開發到部署的所有重要技術決策和實作細節。