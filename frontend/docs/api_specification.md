# Personal Finance Manager - API 規格文檔

## 📋 概述

本文檔定義了 Personal Finance Manager 的完整 API 規格，採用 RESTful 架構，支援個人和群組兩種模式的無縫切換。

### 🎯 API 設計原則
- **Context 驅動**：統一的 API 介面，透過 context 參數區分個人/群組模式
- **向下相容**：Phase 2 群組功能不破壞 Phase 1 個人功能
- **權限分層**：不同模式下的權限控制機制
- **統一格式**：所有 API 採用一致的請求/回應格式

---

## 🔧 API 基礎設計

### 請求格式

**Headers**：
```javascript
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>",
  "X-Context": "personal" | "group"  // Context 識別，預設 personal
}
```

**標準回應格式**：
```javascript
// 成功回應
{
  "success": true,
  "message": "操作成功",
  "data": {
    // 實際資料內容
  },
  "meta": {
    "timestamp": "2024-12-15T10:30:00Z",
    "context": "personal" | "group"
  }
}

// 錯誤回應
{
  "success": false,
  "message": "錯誤描述",
  "errors": ["詳細錯誤1", "詳細錯誤2"],
  "code": "ERROR_CODE",
  "meta": {
    "timestamp": "2024-12-15T10:30:00Z",
    "context": "personal" | "group"
  }
}
```

### 分頁格式

```javascript
// 分頁請求
GET /api/records?page=1&limit=20&context=personal

// 分頁回應
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

---

## 🔐 認證相關 API

### 用戶註冊
```http
POST /api/register
```

**請求**：
```javascript
{
  "email": "user@example.com",
  "password": "password123",
  "name": "使用者名稱"
}
```

**回應**：
```javascript
{
  "success": true,
  "message": "註冊成功！請檢查您的電子郵件並點擊驗證連結以啟用帳戶。",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "使用者名稱",
      "emailVerified": false
    },
    "emailSent": true
  }
}
```

### 用戶登入
```http
POST /api/login
```

**請求**：
```javascript
{
  "email": "user@example.com",
  "password": "password123",
  "rememberMe": false
}
```

**回應**：
```javascript
{
  "success": true,
  "message": "登入成功",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "使用者名稱",
      "emailVerified": true,
      "groupId": null,           // Phase 1: 固定為 null
      "groupRole": null,         // Phase 1: 固定為 null
      "preferences": { ... }
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

### 密碼重置
```http
POST /api/auth/forgot-password
```

**請求**：
```javascript
{
  "email": "user@example.com"
}
```

**回應**：
```javascript
{
  "success": true,
  "message": "密碼重置郵件已發送"
}
```

### 郵件驗證
```http
POST /api/auth/verify-email
```

**請求**：
```javascript
{
  "email": "user@example.com",
  "token": "verification_token"
}
```

---

## 💰 記帳記錄 API

### 取得記錄列表
```http
GET /api/records
```

**Query Parameters**：
```javascript
{
  "context": "personal" | "group",    // Context 模式，預設 personal
  "page": 1,                          // 頁數
  "limit": 20,                        // 每頁筆數
  "type": "income" | "expense",       // 記錄類型篩選
  "categoryId": "category_id",        // 分類篩選
  "startDate": "2024-01-01",          // 開始日期
  "endDate": "2024-12-31",            // 結束日期
  "search": "關鍵字",                  // 搜尋描述
  "tags": "tag1,tag2"                 // 標籤篩選
}
```

**回應**：
```javascript
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "record_id",
        "amount": 100.50,
        "type": "expense",
        "description": "午餐",
        "date": "2024-12-15T12:30:00Z",
        "currency": "TWD",
        "context": "personal",
        "category": {
          "id": "category_id",
          "name": "餐飲",
          "icon": "restaurant",
          "color": "#FF6B6B"
        },
        "createdBy": {              // Phase 2: 群組模式才有
          "id": "user_id",
          "name": "建立者名稱"
        },
        "tags": ["午餐", "外食"],
        "location": {
          "name": "餐廳名稱",
          "lat": 25.0330,
          "lng": 121.5654
        },
        "createdAt": "2024-12-15T12:35:00Z",
        "updatedAt": "2024-12-15T12:35:00Z"
      }
    ],
    "pagination": { ... },
    "summary": {
      "totalIncome": 5000.00,
      "totalExpense": 3500.00,
      "netAmount": 1500.00
    }
  },
  "meta": {
    "context": "personal"
  }
}
```

### 建立記錄
```http
POST /api/records
```

**請求**：
```javascript
{
  "amount": 100.50,
  "type": "expense",
  "description": "午餐",
  "date": "2024-12-15T12:30:00Z",
  "categoryId": "category_id",
  "currency": "TWD",
  "context": "personal",             // Phase 1: 固定 personal
  "tags": ["午餐", "外食"],
  "location": {
    "name": "餐廳名稱",
    "lat": 25.0330,
    "lng": 121.5654
  }
}
```

**回應**：
```javascript
{
  "success": true,
  "message": "記錄建立成功",
  "data": {
    "record": {
      "id": "record_id",
      "amount": 100.50,
      // ... 完整記錄資料
    }
  }
}
```

### 更新記錄
```http
PUT /api/records/:id
```

**請求**：
```javascript
{
  "amount": 120.00,
  "description": "午餐 (修正)",
  // ... 其他欄位
}
```

### 刪除記錄
```http
DELETE /api/records/:id
```

**回應**：
```javascript
{
  "success": true,
  "message": "記錄已刪除"
}
```

---

## 📂 分類管理 API

### 取得分類列表
```http
GET /api/categories
```

**Query Parameters**：
```javascript
{
  "scope": "personal" | "group",     // 分類範圍，預設 personal
  "type": "income" | "expense",      // 分類類型
  "parentId": "parent_id",           // 父分類 ID
  "isActive": true                   // 是否啟用
}
```

**回應**：
```javascript
{
  "success": true,
  "data": {
    "categories": [
      {
        "id": "category_id",
        "name": "餐飲",
        "type": "expense",
        "icon": "restaurant",
        "color": "#FF6B6B",
        "scope": "personal",
        "parentId": null,
        "children": [                // 子分類
          {
            "id": "sub_category_id",
            "name": "早餐",
            "type": "expense",
            // ...
          }
        ],
        "usageCount": 25,
        "lastUsedAt": "2024-12-15T12:30:00Z",
        "isSystem": false,
        "isActive": true,
        "sortOrder": 1,
        "editableBy": "all",         // Phase 2: 群組分類權限
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### 建立分類
```http
POST /api/categories
```

**請求**：
```javascript
{
  "name": "新分類",
  "type": "expense",
  "icon": "shopping-cart",
  "color": "#4CAF50",
  "scope": "personal",              // Phase 1: 固定 personal
  "parentId": null,
  "sortOrder": 0
}
```

### 更新分類
```http
PUT /api/categories/:id
```

### 刪除分類
```http
DELETE /api/categories/:id
```

---

## 💳 預算管理 API

### 取得預算列表
```http
GET /api/budgets
```

**Query Parameters**：
```javascript
{
  "scope": "personal" | "group",     // 預算範圍，預設 personal
  "period": "monthly" | "yearly",    // 預算週期
  "isActive": true,                  // 是否啟用
  "categoryId": "category_id"        // 分類篩選
}
```

**回應**：
```javascript
{
  "success": true,
  "data": {
    "budgets": [
      {
        "id": "budget_id",
        "name": "餐飲預算",
        "amount": 5000.00,
        "period": "monthly",
        "startDate": "2024-12-01",
        "endDate": "2024-12-31",
        "scope": "personal",
        "categoryId": "category_id",
        "category": {
          "id": "category_id",
          "name": "餐飲",
          "icon": "restaurant"
        },
        "warningThreshold": 80,
        "currentSpent": 3200.00,
        "remainingAmount": 1800.00,
        "usagePercentage": 64.00,
        "isOverBudget": false,
        "daysRemaining": 16,
        "createdBy": {               // Phase 2: 群組預算才有
          "id": "user_id",
          "name": "建立者"
        },
        "canEditBy": "creator",      // Phase 2: 編輯權限
        "lastCalculatedAt": "2024-12-15T10:00:00Z",
        "isActive": true
      }
    ],
    "summary": {
      "totalBudget": 10000.00,
      "totalSpent": 6500.00,
      "totalRemaining": 3500.00,
      "overBudgetCount": 1
    }
  }
}
```

### 建立預算
```http
POST /api/budgets
```

**請求**：
```javascript
{
  "name": "餐飲預算",
  "amount": 5000.00,
  "period": "monthly",
  "startDate": "2024-12-01",
  "endDate": "2024-12-31",
  "scope": "personal",              // Phase 1: 固定 personal
  "categoryId": "category_id",      // null = 總預算
  "warningThreshold": 80
}
```

---

## 📊 統計分析 API

### 總覽統計
```http
GET /api/statistics/overview
```

**Query Parameters**：
```javascript
{
  "context": "personal" | "group",   // 統計範圍，預設 personal
  "period": "week" | "month" | "year",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

**回應**：
```javascript
{
  "success": true,
  "data": {
    "summary": {
      "totalIncome": 50000.00,
      "totalExpense": 35000.00,
      "netAmount": 15000.00,
      "recordCount": 156,
      "avgDailyExpense": 1166.67
    },
    "trends": {
      "incomeChange": 8.5,          // 與前期比較百分比
      "expenseChange": -3.2,
      "netAmountChange": 12.1
    },
    "categoryBreakdown": [
      {
        "categoryId": "category_id",
        "categoryName": "餐飲",
        "amount": 12000.00,
        "percentage": 34.3,
        "recordCount": 45
      }
    ],
    "dailyTrends": [
      {
        "date": "2024-12-01",
        "income": 0,
        "expense": 350.00,
        "net": -350.00
      }
    ]
  },
  "meta": {
    "context": "personal",
    "generatedAt": "2024-12-15T10:30:00Z"
  }
}
```

### 趨勢分析
```http
GET /api/statistics/trends
```

### 分類統計
```http
GET /api/statistics/categories
```

---

## 👥 群組管理 API (Phase 2)

### 建立群組
```http
POST /api/groups
```

**請求**：
```javascript
{
  "name": "家庭帳本",
  "description": "家庭共同開支管理",
  "settings": {
    "currency": "TWD",
    "timezone": "Asia/Taipei",
    "budgetCycle": "monthly",
    "memberCanCreateBudget": true,
    "memberCanCreateCategory": true,
    "memberCanDeleteOwnRecords": true
  }
}
```

**回應**：
```javascript
{
  "success": true,
  "message": "群組建立成功",
  "data": {
    "group": {
      "id": "group_id",
      "name": "家庭帳本",
      "description": "家庭共同開支管理",
      "ownerId": "user_id",
      "memberCount": 1,
      "settings": { ... },
      "inviteCode": "ABC123",
      "inviteCodeExpires": "2024-12-22T10:30:00Z",
      "createdAt": "2024-12-15T10:30:00Z"
    }
  }
}
```

### 取得群組資訊
```http
GET /api/groups/:id
```

**回應**：
```javascript
{
  "success": true,
  "data": {
    "group": {
      "id": "group_id",
      "name": "家庭帳本",
      "description": "家庭共同開支管理",
      "avatar": "https://...",
      "owner": {
        "id": "user_id",
        "name": "群組擁有者",
        "avatar": "https://..."
      },
      "members": [
        {
          "id": "member_id",
          "name": "成員姓名",
          "email": "member@example.com",
          "role": "member",
          "joinedAt": "2024-12-10T10:30:00Z",
          "lastActiveAt": "2024-12-15T09:00:00Z"
        }
      ],
      "settings": { ... },
      "stats": {
        "totalRecords": 128,
        "totalIncome": 25000.00,
        "totalExpense": 18000.00,
        "lastRecordAt": "2024-12-15T09:30:00Z"
      },
      "memberCount": 3,
      "createdAt": "2024-12-01T10:30:00Z"
    }
  }
}
```

### 邀請成員
```http
POST /api/groups/:id/invite
```

**請求**：
```javascript
{
  "email": "new.member@example.com",
  "role": "member",               // member | admin
  "message": "邀請您加入我們的家庭帳本"
}
```

**回應**：
```javascript
{
  "success": true,
  "message": "邀請已發送",
  "data": {
    "invitation": {
      "id": "invitation_id",
      "inviteeEmail": "new.member@example.com",
      "role": "member",
      "status": "pending",
      "expiresAt": "2024-12-22T10:30:00Z"
    }
  }
}
```

### 接受邀請
```http
POST /api/invitations/:token/accept
```

### 更新群組設定
```http
PUT /api/groups/:id
```

### 移除成員
```http
DELETE /api/groups/:id/members/:userId
```

### 離開群組
```http
POST /api/groups/:id/leave
```

---

## 📱 用戶設定 API

### 取得用戶設定
```http
GET /api/user/profile
```

**回應**：
```javascript
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "emailVerified": true,
      "profile": {
        "name": "使用者名稱",
        "avatar": "https://...",
        "preferences": {
          "currency": "TWD",
          "theme": "system",
          "language": "zh-TW",
          "dateFormat": "YYYY-MM-DD",
          "decimalPlaces": 2,
          "notifications": {
            "budgetAlerts": true,
            "dailyReminders": false,
            "weeklyReports": true,
            "emailNotifications": true,
            "pushNotifications": true
          }
        }
      },
      "groupId": null,              // Phase 2: 群組 ID
      "groupRole": null,            // Phase 2: 群組角色
      "groupJoinedAt": null,        // Phase 2: 加入時間
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

### 更新用戶設定
```http
PUT /api/user/profile
```

**請求**：
```javascript
{
  "profile": {
    "name": "新名稱",
    "preferences": {
      "currency": "USD",
      "theme": "dark",
      "notifications": {
        "budgetAlerts": false
      }
    }
  }
}
```

---

## 📈 Context 切換機制

### Context 驗證中間件

所有需要 Context 的 API 都會經過以下驗證：

1. **Context 有效性檢查**
2. **用戶權限驗證**
3. **資料存取權限確認**

### Context 切換範例

**個人模式請求**：
```javascript
// Headers
{
  "Authorization": "Bearer jwt_token",
  "X-Context": "personal"
}

// 或 URL 參數
GET /api/records?context=personal
```

**群組模式請求**：
```javascript
// Headers
{
  "Authorization": "Bearer jwt_token",
  "X-Context": "group"
}

// 或 URL 參數  
GET /api/records?context=group
```

---

## 🔒 權限控制

### 權限層級定義

**個人模式**：
- 用戶只能存取自己的資料
- 所有 CRUD 操作無限制

**群組模式**：
- `owner`: 所有權限
- `admin`: 管理權限（除了群組刪除）
- `member`: 基本權限

### 權限檢查範例

```javascript
// API 權限檢查邏輯
const checkPermission = (user, action, resource, context) => {
  if (context === 'personal') {
    return resource.userId === user.id;
  }
  
  if (context === 'group') {
    if (!user.groupId || resource.groupId !== user.groupId) {
      return false;
    }
    
    switch (action) {
      case 'read':
        return ['owner', 'admin', 'member'].includes(user.groupRole);
      case 'create':
        return ['owner', 'admin', 'member'].includes(user.groupRole);
      case 'update':
        return resource.createdBy === user.id || 
               ['owner', 'admin'].includes(user.groupRole);
      case 'delete':
        return resource.createdBy === user.id || 
               ['owner', 'admin'].includes(user.groupRole);
      default:
        return false;
    }
  }
  
  return false;
};
```

---

## 🚨 錯誤處理

### 標準錯誤碼

```javascript
const ERROR_CODES = {
  // 認證錯誤
  'UNAUTHORIZED': 401,
  'FORBIDDEN': 403,
  'EMAIL_NOT_VERIFIED': 403,
  
  // 資料錯誤
  'RESOURCE_NOT_FOUND': 404,
  'VALIDATION_ERROR': 422,
  'DUPLICATE_ENTRY': 409,
  
  // Context 錯誤
  'INVALID_CONTEXT': 400,
  'CONTEXT_MISMATCH': 400,
  'NOT_IN_GROUP': 403,
  
  // 業務邏輯錯誤
  'BUDGET_EXCEEDED': 400,
  'CATEGORY_IN_USE': 400,
  'GROUP_MEMBER_LIMIT': 400,
  
  // 系統錯誤
  'INTERNAL_ERROR': 500,
  'SERVICE_UNAVAILABLE': 503
};
```

### 錯誤回應範例

```javascript
// 驗證錯誤
{
  "success": false,
  "message": "資料驗證失敗",
  "errors": [
    "金額必須大於 0",
    "分類為必填欄位"
  ],
  "code": "VALIDATION_ERROR"
}

// Context 錯誤
{
  "success": false,
  "message": "您尚未加入任何群組",
  "code": "NOT_IN_GROUP"
}

// 權限錯誤
{
  "success": false,
  "message": "權限不足，無法執行此操作",
  "code": "FORBIDDEN"
}
```

---

## 📋 API 實作檢查清單

### Phase 1: 個人功能 API
- [ ] 認證相關 API (註冊/登入/密碼重置/郵件驗證)
- [ ] Records CRUD API (context 固定 personal)
- [ ] Categories CRUD API (scope 固定 personal)  
- [ ] Budgets CRUD API (scope 固定 personal)
- [ ] 個人統計 API
- [ ] 用戶設定 API
- [ ] Context 中間件 (只驗證 personal)
- [ ] 權限中間件 (個人權限檢查)

### Phase 2: 群組功能 API  
- [ ] 群組 CRUD API
- [ ] 群組邀請 API
- [ ] 群組成員管理 API
- [ ] Records API 支援 group context
- [ ] Categories API 支援 group scope
- [ ] Budgets API 支援 group scope
- [ ] 群組統計 API
- [ ] 群組活動日誌 API
- [ ] Context 中間件擴展 (支援 group)
- [ ] 群組權限檢查

### API 品質檢查
- [ ] 所有 API 回應格式一致
- [ ] 錯誤處理完整
- [ ] 權限檢查有效
- [ ] Context 切換正常
- [ ] API 文檔完整
- [ ] 單元測試覆蓋

最後更新時間: 2024-12-15
版本: 1.0.0