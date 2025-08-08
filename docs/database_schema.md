# Personal Finance Manager - Database Schema

## 技術選型
- **資料庫**: MongoDB
- **ODM**: Mongoose
- **部署**: MongoDB Atlas (推薦) 或 Cloud Run 側車容器

## Phase 1 Collections (P0/P1) - 立即實作

### 1. users (使用者)
```javascript
const userSchema = new mongoose.Schema({
  // 基本資訊
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Invalid email format']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false // 預設查詢時不返回密碼
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  // 偏好設定
  preferences: {
    currency: {
      type: String,
      default: 'TWD',
      enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
    },
    dateFormat: {
      type: String,
      default: 'YYYY-MM-DD',
      enum: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']
    },
    theme: {
      type: String,
      default: 'light',
      enum: ['light', 'dark', 'auto']
    },
    language: {
      type: String,
      default: 'zh-TW',
      enum: ['zh-TW', 'en-US']
    },
    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 4
    }
  },
  
  // 系統欄位
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
  
  // 擴展預留欄位 (為 P2 協作功能預留)
  avatar: String, // 頭像 URL
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
userSchema.index({ email: 1 });
userSchema.index({ emailVerificationToken: 1 });
userSchema.index({ passwordResetToken: 1 });

// 中介軟體
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});
```

### 2. categories (分類)
```javascript
const categorySchema = new mongoose.Schema({
  // 基本資訊
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income']
  },
  
  // 顯示設定
  icon: {
    type: String,
    default: 'other'
  },
  color: {
    type: String,
    default: '#6B7280',
    validate: [/^#[0-9A-Fa-f]{6}$/, 'Invalid color format']
  },
  
  // 分類關聯
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 層級結構 (P1 - 子分類支援)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // 系統設定
  isSystem: {
    type: Boolean,
    default: false // true 為系統預設分類
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // 統計快取 (為效能優化預留)
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: Date,
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
categorySchema.index({ userId: 1, type: 1 });
categorySchema.index({ userId: 1, isActive: 1, sortOrder: 1 });
categorySchema.index({ parentId: 1 });

// 複合唯一索引 (同使用者下分類名稱不重複)
categorySchema.index(
  { userId: 1, name: 1, type: 1 }, 
  { unique: true }
);
```

### 3. records (交易記錄)
```javascript
const recordSchema = new mongoose.Schema({
  // 基本交易資訊
  amount: {
    type: Number,
    required: true,
    min: 0.01,
    validate: {
      validator: function(v) {
        return v > 0 && Number.isFinite(v);
      },
      message: 'Amount must be a positive number'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['income', 'expense']
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // 關聯資訊
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // 多幣別支援 (P1)
  currency: {
    type: String,
    required: true,
    default: 'TWD',
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
  },
  exchangeRate: {
    type: Number,
    default: 1,
    min: 0.000001
  },
  baseCurrencyAmount: {
    type: Number, // 轉換成用戶主貨幣的金額
    required: true
  },
  
  // 附加資訊
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  location: {
    name: String,
    lat: Number,
    lng: Number
  },
  receipt: {
    url: String,
    filename: String
  },
  
  // 系統欄位
  isDeleted: {
    type: Boolean,
    default: false
  },
  
  // 擴展預留欄位 (為 P2 協作功能預留)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // 用於協作帳本記錄建立者
  },
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
recordSchema.index({ userId: 1, date: -1 });
recordSchema.index({ userId: 1, type: 1, date: -1 });
recordSchema.index({ userId: 1, categoryId: 1, date: -1 });
recordSchema.index({ userId: 1, isDeleted: 1, date: -1 });
recordSchema.index({ date: -1 }); // 用於統計查詢
recordSchema.index({ tags: 1 }); // 支援標籤搜尋

// 文字搜尋索引
recordSchema.index({ 
  description: 'text' 
}, {
  weights: { description: 1 }
});
```

### 4. budgets (預算)
```javascript
const budgetSchema = new mongoose.Schema({
  // 基本資訊
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return Number.isFinite(v) && v >= 0;
      },
      message: 'Budget amount must be a valid positive number'
    }
  },
  
  // 關聯資訊
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null 表示總預算
  },
  
  // 預算週期
  period: {
    type: String,
    required: true,
    enum: ['monthly', 'yearly', 'custom']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // 警告設定
  warningThreshold: {
    type: Number,
    default: 80, // 百分比
    min: 0,
    max: 100
  },
  
  // 狀態追蹤
  isActive: {
    type: Boolean,
    default: true
  },
  
  // 統計快取 (用於效能優化)
  currentSpent: {
    type: Number,
    default: 0
  },
  lastCalculatedAt: Date,
  
  // 時間戳
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
budgetSchema.index({ userId: 1, isActive: 1 });
budgetSchema.index({ userId: 1, categoryId: 1, period: 1 });
budgetSchema.index({ userId: 1, startDate: 1, endDate: 1 });

// 複合唯一索引 (避免重複預算)
budgetSchema.index(
  { userId: 1, categoryId: 1, startDate: 1, endDate: 1 },
  { unique: true }
);
```

### 5. exchange_rates (匯率) - P1
```javascript
const exchangeRateSchema = new mongoose.Schema({
  // 匯率資訊
  fromCurrency: {
    type: String,
    required: true,
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
  },
  toCurrency: {
    type: String,
    required: true,
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'GBP', 'CNY']
  },
  rate: {
    type: Number,
    required: true,
    min: 0.000001
  },
  
  // 資料來源
  source: {
    type: String,
    default: 'exchangerate-api',
    enum: ['exchangerate-api', 'fixer', 'manual']
  },
  
  // 時間戳
  fetchedAt: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 索引
exchangeRateSchema.index({ fromCurrency: 1, toCurrency: 1, fetchedAt: -1 });
exchangeRateSchema.index({ fetchedAt: -1 }); // 清理過期資料用

// 複合唯一索引 (同一天只保留最新匯率)
exchangeRateSchema.index(
  { 
    fromCurrency: 1, 
    toCurrency: 1, 
    fetchedAt: 1 
  },
  { 
    unique: true,
    partialFilterExpression: { 
      fetchedAt: { $type: "date" } 
    }
  }
);
```

---

## Phase 2+ Collections (P2/P3) - 未來擴展規劃

### 預計新增的 Collections:

### 6. workspaces (共享帳本) - P2
```javascript
// 基礎結構規劃
const workspaceSchema = {
  name: String,           // 帳本名稱 (如: "張家帳本")
  description: String,    // 描述
  ownerId: ObjectId,     // 建立者 (管理者)
  settings: {
    currency: String,     // 帳本主貨幣
    timezone: String,     // 時區設定
    budgetCycle: String   // 預算週期
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
};

// 關聯設計考量:
// - records 需要新增 workspaceId 欄位
// - budgets 需要新增 workspaceId 欄位  
// - categories 可以設定為 workspace 層級或個人層級
```

### 7. workspace_members (成員關係) - P2
```javascript
// 成員權限管理
const workspaceMemberSchema = {
  workspaceId: ObjectId,  // 關聯帳本
  userId: ObjectId,       // 關聯使用者  
  role: String,          // 'owner' | 'admin' | 'member' | 'viewer'
  permissions: {         // 細粒度權限控制
    canRead: Boolean,
    canWrite: Boolean,
    canDelete: Boolean,
    canManageBudget: Boolean,
    canManageMembers: Boolean
  },
  invitedBy: ObjectId,   // 邀請者
  joinedAt: Date,
  status: String,        // 'active' | 'invited' | 'suspended'
  createdAt: Date
};
```

### 8. invitations (邀請系統) - P2
```javascript
const invitationSchema = {
  workspaceId: ObjectId,    // 目標帳本
  inviterUserId: ObjectId,  // 邀請者
  email: String,            // 被邀請者 email
  role: String,             // 預設角色
  token: String,            // 邀請 token
  expiresAt: Date,          // 過期時間
  status: String,           // 'pending' | 'accepted' | 'rejected' | 'expired'
  acceptedAt: Date,
  createdAt: Date
};
```

### 9. notifications (通知系統) - P3
```javascript
const notificationSchema = {
  userId: ObjectId,         // 接收者
  workspaceId: ObjectId,    // 相關帳本 (可選)
  type: String,            // 'budget_exceeded' | 'large_expense' | 'member_joined'
  title: String,           // 通知標題
  message: String,         // 通知內容
  data: Object,            // 額外資料
  isRead: Boolean,
  readAt: Date,
  createdAt: Date
};
```

### 10. audit_logs (審計日誌) - P3
```javascript
const auditLogSchema = {
  workspaceId: ObjectId,    // 相關帳本
  userId: ObjectId,         // 操作者
  action: String,           // 'create' | 'update' | 'delete'
  resourceType: String,     // 'record' | 'budget' | 'category' | 'member'
  resourceId: ObjectId,     // 資源 ID
  oldValue: Object,         // 變更前資料
  newValue: Object,         // 變更後資料
  ipAddress: String,        // IP 地址
  userAgent: String,        // 瀏覽器資訊
  createdAt: Date
};
```

---

## Migration 策略

### Phase 1 to Phase 2 升級計劃:

#### 1. 資料遷移步驟:
```javascript
// 1. 為每個使用者建立個人 workspace
// 2. 將現有 records 關聯到個人 workspace
// 3. 將現有 budgets 關聯到個人 workspace  
// 4. 新增 workspaceId 欄位到相關 collections
```

#### 2. Schema 擴展點:
```javascript
// Phase 1 設計時已預留的擴展欄位:
// records.createdBy - 用於記錄建立者
// users.avatar - 用於成員頭像顯示

// 需要新增的欄位:
// records.workspaceId
// budgets.workspaceId
// categories.workspaceId (可選)
```

#### 3. API 相容性:
- Phase 1 API 在 Phase 2 後繼續運作
- 自動將請求路由到使用者的個人 workspace
- 新增 workspace-scoped API endpoints

---

## 資料庫設計原則

### 1. 效能考量:
- **適當的索引策略**: 基於查詢模式設計索引
- **統計資料快取**: 避免頻繁聚合查詢
- **分頁支援**: 大量資料的分頁載入

### 2. 資料一致性:
- **外鍵約束**: 使用 Mongoose ref 確保關聯完整性
- **軟刪除**: 重要資料使用 isDeleted 而非真刪除
- **樂觀鎖**: 使用 version key 處理並發更新

### 3. 安全性考量:
- **敏感欄位**: 密碼等敏感資料使用 select: false
- **資料驗證**: 完整的輸入驗證和清理
- **存取控制**: 基於 userId/workspaceId 的資料隔離

### 4. 可擴展性:
- **預留擴展欄位**: 為未來功能預留必要欄位
- **彈性 Schema**: 使用 Mixed type 處理可變結構
- **版本控制**: Schema 版本管理和遷移策略

---

## 環境配置

### 開發環境:
```javascript
// MongoDB 連接配置
const mongoConfig = {
  development: {
    uri: 'mongodb://localhost:27017/finance_dev',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};
```

### 生產環境 (MongoDB Atlas):
```javascript
const mongoConfig = {
  production: {
    uri: process.env.MONGODB_URI,
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  }
};
```

### Mongoose 設定:
```javascript
// 全域設定
mongoose.set('strictQuery', false);
mongoose.set('toJSON', { 
  virtuals: true,
  transform: function(doc, ret) {
    delete ret._id;
    delete ret.__v;
    return ret;
  }
});
```

---

## 資料庫維護

### 1. 索引監控:
- 定期檢查索引使用率
- 移除未使用的索引
- 監控查詢效能

### 2. 資料清理:
- 定期清理過期的匯率資料
- 清理軟刪除的過期記錄
- 清理過期的驗證 token

### 3. 備份策略:
- MongoDB Atlas 自動備份
- 重要節點手動備份
- 災難復原計劃

### 4. 效能監控:
- 查詢執行時間監控
- 資料庫連接池監控
- 磁碟空間使用監控