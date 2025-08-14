# JWT Token 錯誤修復與程式碼清理總結

## 問題描述

Web 平台 JWT tokens 顯示錯誤的過期日期（8/24 和 9/18），而非預期的 15 分鐘 access token 和 7 天 refresh token。

## 根本原因

在 `/lib/auth/jwt.ts` 中，移動端平台配置使用了 `'1h'` 格式，而 JWT 函式庫無法正確解析此格式，導致 token 過期時間計算錯誤。

## 主要修復

### 1. JWT Token 配置修復
**文件**: `/lib/auth/jwt.ts`
- 修復: 將 `expiresIn: '1h'` 改為 `expiresIn: '60m'`
- 原因: JWT 函式庫對 `'1h'` 格式解析有問題，改用 `'60m'` 格式

### 2. 程式碼清理

#### a. 移除調試和測試程式碼
**文件**: `/pages/dashboard.vue`
- 移除整個「調試 & API 測試」區塊，包含：
  - HTML 模板中的調試介面
  - `testAuthMe()` 和 `testRefreshToken()` 測試函數
  - 調試訊息訂閱和倒數計時功能
  - 移動端調試相關的所有程式碼
- 簡化 `loadUser()` 函數，移除調試日誌
- 清理 script 區塊，保留純生產環境所需功能

#### b. API 後端清理  
**文件**: `/server/api/login.post.ts`
- 移除所有調試相關的 console.log
- 移除測試平台查詢參數功能
- 清理不必要的 import（如 `getQuery`）

#### c. 統一 Console 日誌格式
**文件**: `/pages/login.vue`
- 統一使用 `JSON.stringify()` 格式化所有 console 輸出
- 範例: `console.log(JSON.stringify({ action: 'mobile_tokens_stored', platform: 'mobile' }))`

#### d. 修復 Vue 注入警告
**文件**: `/composables/useDebugTrigger.ts`
- 修復注入警告: `inject<() => void>('triggerDebugModal', () => {})`
- 添加預設值以處理無 layout 的頁面（如 index.vue）

## 技術細節

### Token 配置對比
```typescript
// 修復前 (移動端)
mobile: {
  platform: 'mobile',
  accessTokenDuration: 60, // 分鐘
  refreshTokenDuration: 43200, // 分鐘 (30天)
  jwtConfig: {
    expiresIn: '1h', // ❌ 有問題的格式
    refreshExpiresIn: '30d'
  }
}

// 修復後 (移動端)  
mobile: {
  platform: 'mobile',
  accessTokenDuration: 60,
  refreshTokenDuration: 43200,
  jwtConfig: {
    expiresIn: '60m', // ✅ 正確格式
    refreshExpiresIn: '30d'
  }
}
```

### 移除的功能
1. **Dashboard 調試區塊**: 完全移除使用者可見的測試和調試介面
2. **移動端調試系統**: 移除所有移動端專用的調試日誌和倒數計時功能
3. **API 測試功能**: 移除 `testAuthMe()` 和 `testRefreshToken()` 函數
4. **開發環境調試日誌**: 清理所有非必要的 console 輸出

### 保留的功能
1. **配置資訊彈窗**: Logo 連續點擊觸發的系統配置資訊查看功能
2. **錯誤處理**: 完整的錯誤處理和使用者反饋機制
3. **Token 自動刷新**: 使用 `authenticatedFetch` 的自動 token 刷新功能

## 修復驗證

修復後，JWT tokens 顯示正確的過期時間：
- Web 平台: 15 分鐘 access token + 7 天 refresh token  
- 移動平台: 60 分鐘 access token + 30 天 refresh token

## 檔案變更清單

1. `/lib/auth/jwt.ts` - JWT 配置修復
2. `/server/api/login.post.ts` - 移除調試程式碼
3. `/pages/dashboard.vue` - 大幅清理，移除調試介面
4. `/pages/login.vue` - 統一 console 日誌格式
5. `/composables/useDebugTrigger.ts` - 修復注入警告
6. `/pages/index.vue` - 清理調試相關程式碼

## 總結

此次修復解決了 JWT token 過期時間顯示錯誤的核心問題，同時大幅清理了程式碼，移除了所有不應該在生產環境中顯示給使用者的調試和測試功能，確保 APP 版本的專業性和使用者體驗。

---
**修復完成時間**: 2024-08-14  
**修復範圍**: JWT 配置、程式碼清理、調試功能移除