# Personal Finance Manager - 資料庫設計

## 📋 概述

本文檔定義了 Personal Finance Manager 的完整資料庫架構，確保在開發個人功能時就具備群組協作的擴展能力。

### 🎯 設計原則
- **個人優先，群組預留**：所有 Schema 設計都預留群組功能欄位
- **Context 驅動**：透過 context/scope 欄位區分個人和群組資料
- **資料隔離**：確保個人資料與群組資料完全隔離
- **向下相容**：Phase 2 群組功能不破壞 Phase 1 個人功能

---

## 🗄️ Collection 設計

### 1. users Collection

**功能**：管理用戶基本資訊、偏好設定、群組成員身份

```javascript
{
  _id: ObjectId,
  
  // === 基本認證資訊 ===
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 255,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: '請輸入有效的電子郵件格式'
    }
  },
  
  passwordHash: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        // bcrypt hash 或至少 8 個字元的純文字密碼
        return v.startsWith('$2') && v.length === 60 || v.length >= 8
      },
      message: '密碼至少需要 8 個字元'
    }
  },
  
  // === 個人資料 ===
  profile: {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      minlength: 1
    },
    avatar: {
      type: String,
      validate: {
        validator: (url) => !url || validator.isURL(url),
        message: '頭像必須是有效的 URL'
      }
    },
    
    // 偏好設定
    preferences: {
      // 貨幣設定
      currency: {
        type: String,
        required: true,
        default: 'TWD',
        enum: ['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW']
      },
      
      // 主題設定
      theme: {
        type: String,
        required: true,
        default: 'system',
        enum: ['light', 'dark', 'system']
      },
      
      // 語言設定
      language: {
        type: String,
        required: true,
        default: 'zh-TW',
        enum: ['zh-TW', 'zh-CN', 'en-US', 'ja-JP']
      },
      
      // 日期格式
      dateFormat: {
        type: String,
        default: 'YYYY-MM-DD',
        enum: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']
      },
      
      // 小數位數
      decimalPlaces: {
        type: Number,
        default: 2,
        min: 0,
        max: 4
      },
      
      // 通知設定
      notifications: {
        budgetAlerts: { type: Boolean, default: true },
        dailyReminders: { type: Boolean, default: false },
        weeklyReports: { type: Boolean, default: true },
        emailNotifications: { type: Boolean, default: true },
        pushNotifications: { type: Boolean, default: true }
      }
    }
  },
  
  // === 安全設定 ===
  security: {
    // 郵件驗證
    emailVerified: { type: Boolean, required: true, default: false },
    emailVerificationToken: String,
    
    // 密碼重置
    passwordResetToken: String,
    passwordResetExpires: Date,
    
    // 登入記錄
    lastLoginAt: Date,
    lastLoginIP: {
      type: String,
      validate: {
        validator: (ip) => !ip || validator.isIP(ip),
        message: '無效的 IP 地址'
      }
    },
    
    // 帳戶鎖定
    loginAttempts: { type: Number, required: true, default: 0 },
    lockedUntil: Date
  },
  
  // === 🆕 群組相關欄位 (Phase 2) ===
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null  // null = 未加入任何群組
  },
  
  groupRole: {
    type: String,
    enum: ['owner', 'admin', 'member'],
    default: null
  },
  
  groupJoinedAt: {
    type: Date,
    default: null
  },
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
// 基本索引
userSchema.index({ email: 1 }, { unique: true })
userSchema.index({ 'security.lastLoginAt': -1 })
userSchema.index({ 'security.passwordResetToken': 1 })
userSchema.index({ 'security.emailVerificationToken': 1 })

// 群組相關索引 (Phase 2)
userSchema.index({ groupId: 1 })
userSchema.index({ groupId: 1, groupRole: 1 })
```

---

### 2. records Collection

**功能**：核心記帳記錄，支援個人和群組兩種模式

```javascript
{
  _id: ObjectId,
  
  // === 記錄基本資訊 ===
  amount: {
    type: Number,
    required: true,
    min: [0.01, '金額必須大於 0'],
    validate: {
      validator: (v) => Number.isFinite(v),
      message: '金額必須是有效數字'
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
  
  // === 分類關聯 ===
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  
  // === 使用者關聯 ===
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // === 🆕 Context 相關欄位 ===
  context: {
    type: String,
    enum: ['personal', 'group'],
    required: true,
    default: 'personal'
  },
  
  // 群組 ID (個人記錄為 null)
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  
  // 記錄建立者 (個人模式下等於 userId)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // === 多幣別支援 ===
  currency: {
    type: String,
    required: true,
    default: 'TWD',
    enum: ['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW']
  },
  
  exchangeRate: {
    type: Number,
    default: 1,
    min: 0.000001
  },
  
  // 基準貨幣金額 (用於統計計算)
  baseCurrencyAmount: {
    type: Number,
    required: true
  },
  
  // === 附加資訊 ===
  tags: [{
    type: String,
    trim: true,
    maxlength: 20
  }],
  
  location: {
    name: String,
    lat: {
      type: Number,
      min: -90,
      max: 90
    },
    lng: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  
  receipt: {
    url: String,
    filename: String,
    uploadedAt: Date
  },
  
  // === 系統欄位 ===
  isDeleted: { type: Boolean, default: false },
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
// 個人記錄查詢 (Phase 1)
recordSchema.index({ userId: 1, context: 1, date: -1 })
recordSchema.index({ userId: 1, categoryId: 1, date: -1 })
recordSchema.index({ userId: 1, type: 1, date: -1 })

// 群組記錄查詢 (Phase 2)
recordSchema.index({ groupId: 1, context: 1, date: -1 })
recordSchema.index({ groupId: 1, createdBy: 1, date: -1 })

// 通用查詢
recordSchema.index({ createdBy: 1, date: -1 })
recordSchema.index({ date: -1, type: 1 })
recordSchema.index({ tags: 1 })
```

---

### 3. categories Collection

**功能**：收支分類管理，支援個人自定義和群組共用分類

```javascript
{
  _id: ObjectId,
  
  // === 分類基本資訊 ===
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
  
  icon: {
    type: String,
    default: 'other'
  },
  
  color: {
    type: String,
    default: '#6B7280',
    validate: {
      validator: (color) => /^#[0-9A-Fa-f]{6}$/.test(color),
      message: '顏色必須是有效的 hex 格式'
    }
  },
  
  // === 分類關聯 ===
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 父分類 (支援分類層級)
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  
  // === 🆕 Context 相關欄位 ===
  scope: {
    type: String,
    enum: ['personal', 'group', 'system'],
    required: true,
    default: 'personal'
  },
  
  // 群組 ID (個人分類為 null)
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  
  // 群組分類的編輯權限 (Phase 2)
  editableBy: {
    type: String,
    enum: ['owner', 'admin', 'all'], // all = 所有群組成員
    default: 'all'
  },
  
  // === 分類設定 ===
  isSystem: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
  
  // === 使用統計 ===
  usageCount: { type: Number, default: 0 },
  lastUsedAt: Date,
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
// 個人分類查詢 (Phase 1)
categorySchema.index({ userId: 1, scope: 1, isActive: 1 })
categorySchema.index({ userId: 1, type: 1, isActive: 1 })

// 群組分類查詢 (Phase 2)
categorySchema.index({ groupId: 1, scope: 1, isActive: 1 })

// 通用查詢
categorySchema.index({ parentId: 1 })
categorySchema.index({ sortOrder: 1 })
categorySchema.index({ lastUsedAt: -1 })
```

---

### 4. budgets Collection

**功能**：預算管理，支援個人和群組預算設定

```javascript
{
  _id: ObjectId,
  
  // === 預算基本資訊 ===
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // === 預算關聯 ===
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null // null = 總預算
  },
  
  // === 🆕 Context 相關欄位 ===
  scope: {
    type: String,
    enum: ['personal', 'group'],
    required: true,
    default: 'personal'
  },
  
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    default: null
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // 群組預算的編輯權限 (Phase 2)
  canEditBy: {
    type: String,
    enum: ['owner', 'admin', 'creator'], // creator = 只有建立者能編輯
    default: 'admin'
  },
  
  // === 預算設定 ===
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
  
  warningThreshold: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  
  isActive: { type: Boolean, default: true },
  
  // === 統計快取 ===
  currentSpent: { type: Number, default: 0 },
  lastCalculatedAt: Date,
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
// 個人預算查詢 (Phase 1)
budgetSchema.index({ userId: 1, scope: 1, isActive: 1 })
budgetSchema.index({ userId: 1, period: 1, startDate: -1 })

// 群組預算查詢 (Phase 2)
budgetSchema.index({ groupId: 1, scope: 1, isActive: 1 })
budgetSchema.index({ createdBy: 1, scope: 1 })

// 通用查詢
budgetSchema.index({ categoryId: 1, isActive: 1 })
budgetSchema.index({ endDate: 1, isActive: 1 })
```

---

### 5. groups Collection (Phase 2)

**功能**：群組管理，支援多人協作記帳

```javascript
{
  _id: ObjectId,
  
  // === 群組基本資訊 ===
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  avatar: {
    type: String,
    validate: {
      validator: (url) => !url || validator.isURL(url),
      message: '群組頭像必須是有效的 URL'
    }
  },
  
  // === 群組設定 ===
  settings: {
    // 基本設定
    currency: {
      type: String,
      required: true,
      default: 'TWD',
      enum: ['TWD', 'USD', 'EUR', 'JPY', 'CNY', 'HKD', 'SGD', 'KRW']
    },
    
    timezone: {
      type: String,
      default: 'Asia/Taipei'
    },
    
    budgetCycle: {
      type: String,
      default: 'monthly',
      enum: ['weekly', 'monthly', 'yearly']
    },
    
    // 權限設定
    memberCanCreateBudget: { type: Boolean, default: true },
    memberCanCreateCategory: { type: Boolean, default: true },
    memberCanDeleteOwnRecords: { type: Boolean, default: true },
    adminCanDeleteAllRecords: { type: Boolean, default: true },
    memberCanInviteOthers: { type: Boolean, default: false }
  },
  
  // === 群組狀態 ===
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  memberCount: {
    type: Number,
    default: 1,
    min: 1,
    max: 10 // 限制群組最大人數
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  // === 邀請設定 ===
  inviteCode: {
    type: String,
    unique: true,
    sparse: true // 允許 null 值，但非 null 值必須唯一
  },
  
  inviteCodeExpires: Date,
  
  // === 統計快取 ===
  stats: {
    totalRecords: { type: Number, default: 0 },
    totalIncome: { type: Number, default: 0 },
    totalExpense: { type: Number, default: 0 },
    lastRecordAt: Date,
    lastCalculatedAt: Date
  },
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
groupSchema.index({ ownerId: 1 })
groupSchema.index({ isActive: 1, createdAt: -1 })
groupSchema.index({ inviteCode: 1 }, { sparse: true })
groupSchema.index({ name: 'text', description: 'text' })
```

---

### 6. group_invitations Collection (Phase 2)

**功能**：群組邀請管理

```javascript
{
  _id: ObjectId,
  
  // === 邀請資訊 ===
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  
  inviterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  inviteeEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (email) => validator.isEmail(email),
      message: '請輸入有效的電子郵件格式'
    }
  },
  
  inviteeUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // 如果受邀者已是系統用戶
  },
  
  // === 邀請設定 ===
  role: {
    type: String,
    required: true,
    enum: ['admin', 'member'],
    default: 'member'
  },
  
  message: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // === 邀請狀態 ===
  status: {
    type: String,
    required: true,
    enum: ['pending', 'accepted', 'rejected', 'expired', 'cancelled'],
    default: 'pending'
  },
  
  // === 安全 ===
  inviteToken: {
    type: String,
    required: true,
    unique: true
  },
  
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7天後過期
  },
  
  // === 處理時間 ===
  acceptedAt: Date,
  rejectedAt: Date,
  cancelledAt: Date,
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
groupInvitationSchema.index({ groupId: 1, status: 1 })
groupInvitationSchema.index({ inviteeEmail: 1, status: 1 })
groupInvitationSchema.index({ inviterUserId: 1, createdAt: -1 })
groupInvitationSchema.index({ inviteToken: 1 })
groupInvitationSchema.index({ expiresAt: 1 }) // TTL 索引，自動清理過期邀請
```

---

### 7. group_activities Collection (Phase 2)

**功能**：群組活動日誌，記錄群組內的重要操作

```javascript
{
  _id: ObjectId,
  
  // === 活動基本資訊 ===
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // === 活動類型 ===
  type: {
    type: String,
    required: true,
    enum: [
      // 記錄相關
      'record_created', 'record_updated', 'record_deleted',
      // 預算相關
      'budget_created', 'budget_updated', 'budget_deleted', 'budget_exceeded',
      // 分類相關
      'category_created', 'category_updated', 'category_deleted',
      // 成員相關
      'member_joined', 'member_left', 'member_role_changed',
      // 群組管理
      'group_created', 'group_settings_updated', 'group_deleted'
    ]
  },
  
  // === 活動詳情 ===
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  
  description: {
    type: String,
    maxlength: 500
  },
  
  // 相關資源 ID
  resourceId: mongoose.Schema.Types.ObjectId,
  resourceType: {
    type: String,
    enum: ['record', 'budget', 'category', 'user']
  },
  
  // 活動元數據
  metadata: {
    type: Object,
    default: {}
  },
  
  // === 時間戳 ===
  createdAt: { type: Date, default: Date.now }
}
```

**索引設計**：
```javascript
groupActivitySchema.index({ groupId: 1, createdAt: -1 })
groupActivitySchema.index({ userId: 1, createdAt: -1 })
groupActivitySchema.index({ type: 1, createdAt: -1 })
groupActivitySchema.index({ resourceId: 1, resourceType: 1 })
```

---

## 🔧 Schema 實作策略

### Phase 1: 個人功能實作

**重點**：確保所有 Schema 都包含群組相關欄位，但功能只實作個人部分

```javascript
// users - Phase 1 實作
const user = new User({
  email: 'user@example.com',
  // ... 其他基本欄位
  
  // 群組欄位預留但設為預設值
  groupId: null,        // Phase 1 固定為 null
  groupRole: null,      // Phase 1 固定為 null
  groupJoinedAt: null   // Phase 1 固定為 null
});

// records - Phase 1 實作
const record = new Record({
  amount: 100,
  type: 'expense',
  userId: userId,
  categoryId: categoryId,
  
  // Context 欄位包含但固定為個人
  context: 'personal',  // Phase 1 固定為 personal
  groupId: null,        // Phase 1 固定為 null
  createdBy: userId     // Phase 1 等於 userId
});
```

### Phase 2: 群組功能啟用

**重點**：啟用群組相關欄位和邏輯，不影響現有個人功能

```javascript
// records - Phase 2 擴展
const groupRecord = new Record({
  amount: 100,
  type: 'expense',
  userId: userId,
  categoryId: categoryId,
  
  // 啟用群組功能
  context: 'group',     // 切換到群組模式
  groupId: user.groupId, // 使用用戶的群組 ID
  createdBy: userId      // 記錄建立者
});
```

---

## 📊 資料遷移策略

### 現有資料遷移 (Phase 1 → Phase 2)

**目標**：確保 Phase 1 的個人資料在 Phase 2 中正常運作

```javascript
// 遷移腳本範例
const migrateToGroupSupport = async () => {
  // 1. 為現有 records 添加 context 欄位
  await Record.updateMany(
    { context: { $exists: false } },
    { 
      $set: { 
        context: 'personal',
        groupId: null,
        createdBy: '$userId'  // 設定 createdBy = userId
      }
    }
  );
  
  // 2. 為現有 categories 添加 scope 欄位
  await Category.updateMany(
    { scope: { $exists: false } },
    { 
      $set: { 
        scope: 'personal',
        groupId: null,
        editableBy: 'all'
      }
    }
  );
  
  // 3. 為現有 budgets 添加 scope 欄位
  await Budget.updateMany(
    { scope: { $exists: false } },
    { 
      $set: { 
        scope: 'personal',
        groupId: null,
        createdBy: '$userId',
        canEditBy: 'creator'
      }
    }
  );
};
```

---

## 🔍 查詢模式設計

### 個人資料查詢 (Phase 1)

```javascript
// 個人記錄查詢
const getPersonalRecords = async (userId, filters = {}) => {
  return await Record.find({
    userId,
    context: 'personal',  // 只查詢個人記錄
    isDeleted: false,
    ...filters
  }).populate('categoryId');
};

// 個人分類查詢
const getPersonalCategories = async (userId) => {
  return await Category.find({
    userId,
    scope: 'personal',    // 只查詢個人分類
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
};
```

### 群組資料查詢 (Phase 2)

```javascript
// 群組記錄查詢
const getGroupRecords = async (userId, groupId, filters = {}) => {
  return await Record.find({
    groupId,
    context: 'group',     // 只查詢群組記錄
    isDeleted: false,
    ...filters
  }).populate(['categoryId', 'createdBy']);
};

// 群組分類查詢
const getGroupCategories = async (groupId) => {
  return await Category.find({
    groupId,
    scope: 'group',       // 只查詢群組分類
    isActive: true
  }).sort({ sortOrder: 1, name: 1 });
};
```

### 統一查詢介面 (Context-Aware)

```javascript
// Context 感知的統一查詢
const getRecords = async (user, context, filters = {}) => {
  const baseQuery = {
    isDeleted: false,
    ...filters
  };
  
  if (context === 'personal') {
    return await Record.find({
      ...baseQuery,
      userId: user._id,
      context: 'personal'
    }).populate('categoryId');
  } 
  else if (context === 'group') {
    if (!user.groupId) {
      throw new Error('User is not in any group');
    }
    
    return await Record.find({
      ...baseQuery,
      groupId: user.groupId,
      context: 'group'
    }).populate(['categoryId', 'createdBy']);
  }
};
```

---

## 🔒 資料安全設計

### 資料隔離原則

1. **完全隔離**：個人資料與群組資料在查詢層面完全分離
2. **權限控制**：嚴格檢查用戶對資料的存取權限
3. **Context 驗證**：確保查詢的 Context 與用戶身份一致

### 安全查詢範例

```javascript
// 安全的記錄查詢
const getRecordSecurely = async (recordId, user, context) => {
  const record = await Record.findById(recordId);
  
  if (!record) {
    throw new Error('Record not found');
  }
  
  // Context 一致性檢查
  if (record.context !== context) {
    throw new Error('Context mismatch');
  }
  
  // 權限檢查
  if (context === 'personal') {
    if (record.userId.toString() !== user._id.toString()) {
      throw new Error('Access denied');
    }
  } 
  else if (context === 'group') {
    if (!user.groupId || record.groupId.toString() !== user.groupId.toString()) {
      throw new Error('Access denied');
    }
  }
  
  return record;
};
```

---

## 📋 實作檢查清單

### Phase 1: 個人功能資料庫
- [ ] 更新現有 User model 添加群組欄位
- [ ] 實作 Record model 包含 context 欄位
- [ ] 實作 Category model 包含 scope 欄位
- [ ] 實作 Budget model 包含 scope 欄位
- [ ] 建立適當的索引優化查詢效能
- [ ] 撰寫個人資料查詢函數
- [ ] 測試個人模式所有 CRUD 操作

### Phase 2: 群組功能資料庫
- [ ] 建立 Groups collection
- [ ] 建立 Group Invitations collection
- [ ] 建立 Group Activities collection
- [ ] 實作群組資料查詢函數
- [ ] 實作權限檢查機制
- [ ] 撰寫資料遷移腳本
- [ ] 測試個人與群組資料完全隔離
- [ ] 測試權限控制有效性

### 效能優化
- [ ] 分析查詢模式建立複合索引
- [ ] 實作資料快取策略
- [ ] 監控資料庫效能指標
- [ ] 優化複雜統計查詢

最後更新時間: 2024-12-15
版本: 1.0.0