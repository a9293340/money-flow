# 調試系統開發指南

## 📋 概覽

本專案包含一套完整的調試系統，用於協助移動端開發和故障排除。此文檔說明如何在新頁面中整合調試功能和相關最佳實踐。

## 🏗️ 系統架構

### 核心組件
- **DebugModal**: 調試資訊顯示模態框
- **useDebugTrigger**: Logo 點擊觸發器 composable
- **mobile-debug**: 移動端調試工具（替代 console.log）

### Layout 整合
- `layouts/default.vue`: 包含全域 DebugModal
- `layouts/auth.vue`: 包含全域 DebugModal
- 提供 `triggerDebugModal` 函數給子組件使用

## 🆕 新頁面開發規範

### 必須步驟
每當創建新頁面時，都必須在 logo 上添加調試觸發器：

#### 1. 導入 composable
```typescript
<script setup lang="ts">
// Logo 點擊調試觸發器
const { handleLogoClick } = useDebugTrigger()
</script>
```

#### 2. 在 logo 元素上添加點擊事件
```vue
<template>
  <div 
    class="logo-container cursor-pointer select-none transition-transform hover:scale-105"
    @click="handleLogoClick"
  >
    <!-- logo svg 或內容 -->
  </div>
</template>
```

#### 3. 必要的 CSS 類別
- `cursor-pointer`: 顯示可點擊游標
- `select-none`: 防止文字選取
- `transition-transform hover:scale-105`: 提供視覺反饋

### 範例頁面
參考現有頁面的實作：
- `pages/index.vue` - 首頁 logo 實作
- `pages/login.vue` - 登入頁 logo 實作  
- `pages/dashboard.vue` - Dashboard header logo 實作

## 🔧 調試功能使用

### 用戶觸發方式
1. **Logo 連續點擊**: 在任何頁面連續點擊 logo 5次（3秒內）
2. **自動啟用**: 系統會自動啟用調試模式並顯示模態框

### 開發者快速觸發
在開發環境下可使用以下方式快速觸發：

#### 方法一：Console 命令
```javascript
window.triggerDebug()
```

#### 方法二：代碼中直接調用
```typescript
const { forceDebugTrigger } = useDebugTrigger()
// 在需要時調用
forceDebugTrigger()
```

## 🎛️ 調試系統控制

### 全域開關
位置：`lib/utils/mobile-debug.ts`

```typescript
// 🔧 調試功能控制開關 - 測試通過後可以設置為 false 來禁用所有調試功能
const ENABLE_DEBUG_SYSTEM = true
```

### 控制策略
- **開發階段**: `ENABLE_DEBUG_SYSTEM = true`
- **測試通過後**: `ENABLE_DEBUG_SYSTEM = false`
- **生產環境**: 建議設為 `false`

### 漸進式移除
使用 `safeDebugXXX()` 函數替代直接調用：
```typescript
// ✅ 推薦：會檢查全域開關
import { safeDebugInfo, safeDebugError } from '~/lib/utils/mobile-debug'
safeDebugInfo('這是調試訊息')

// ❌ 不推薦：會繞過全域開關
import { debugInfo } from '~/lib/utils/mobile-debug'
debugInfo('這是調試訊息')
```

## 📱 移動端特殊考量

### 為什麼需要調試系統？
- 移動端無法查看 `console.log` 輸出
- 需要可視化的調試資訊顯示
- 便於現場故障排除和開發測試

### 調試資訊類型
- `safeDebugInfo`: 一般資訊
- `safeDebugWarn`: 警告訊息  
- `safeDebugError`: 錯誤訊息
- `safeDebugSuccess`: 成功訊息

## 🚫 已移除功能

### 右上角隱藏觸發器
- **移除原因**: RWD 環境下可能被遮蔽
- **替代方案**: 使用 logo 點擊觸發
- **開發者觸發**: 使用 console 命令或代碼調用

## ✅ 檢查清單

新頁面開發完成前請確認：

- [ ] 已在 logo 上添加 `@click="handleLogoClick"`
- [ ] 已導入 `useDebugTrigger` composable
- [ ] Logo 具備必要的 CSS 類別（cursor-pointer, select-none, hover 效果）
- [ ] 測試 logo 連續點擊5次能成功觸發調試模態框
- [ ] 如果使用調試輸出，優先使用 `safeDebugXXX()` 函數

## 🔄 維護指南

### 定期檢查
1. 確認所有頁面的 logo 都有觸發器
2. 測試調試系統在不同設備上的功能
3. 檢查是否有遺漏的 `debugXXX()` 調用未改為 `safeDebugXXX()`

### 版本發布前
1. 將 `ENABLE_DEBUG_SYSTEM` 設為 `false`
2. 確認生產環境下調試功能已被禁用
3. 移除任何不必要的調試代碼

---

**📝 最後更新**: 2024-08-14  
**🔧 維護者**: AI Assistant  
**📍 相關文件**: `CLAUDE.md`, `technical_architecture.md`