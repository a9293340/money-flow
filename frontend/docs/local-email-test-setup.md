# 本地郵件測試設定指南

## 📧 本地開發環境 SMTP 設定

### 1. **設定本地 .env 檔案**

在 `/home/a9293340/money-flow/frontend/.env` 檔案中添加：

```bash
# SMTP 郵件服務 (Gmail 範例)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-digit-app-password

# 應用程式名稱
APP_NAME=Money Flow
```

### 2. **測試 API 端點**

#### 測試忘記密碼
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

#### 測試重置密碼
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "token":"your-reset-token",
    "newPassword":"NewPassword123",
    "confirmPassword":"NewPassword123"
  }'
```

### 3. **檢查郵件服務連接**

建立測試腳本：

```javascript
// test-email.js
import { testEmailService } from './lib/utils/email.ts'

async function testEmail() {
  console.log('測試郵件服務連接...')
  const result = await testEmailService()
  console.log('測試結果:', result ? '✅ 成功' : '❌ 失敗')
}

testEmail()
```

運行測試：
```bash
node test-email.js
```

### 4. **常見錯誤排除**

#### 錯誤 1: "Invalid login"
- **原因**: 使用了帳戶密碼而非應用程式密碼
- **解決**: 使用 16 位應用程式密碼

#### 錯誤 2: "Connection timeout"
- **原因**: SMTP 設定錯誤
- **檢查**: 
  - SMTP_HOST=smtp.gmail.com
  - SMTP_PORT=587
  - SMTP_SECURE=false

#### 錯誤 3: "Missing credentials"
- **原因**: 環境變數未載入
- **檢查**: 確認 .env 檔案位置和格式

### 5. **成功標誌**

當一切設定正確時，你會看到：

```bash
✅ 郵件服務連接測試成功
📧 正在發送密碼重置郵件至: user@example.com
✅ 郵件發送成功: <message-id>
```

### 6. **production 環境設定確認**

環境變數分佈：

| 變數 | 本地開發 | Cloud Run | 機密性 |
|------|----------|-----------|--------|
| SMTP_HOST | .env | YAML | 🟢 低 |
| SMTP_PORT | .env | YAML | 🟢 低 |
| SMTP_SECURE | .env | YAML | 🟢 低 |
| SMTP_USER | .env | Secret Manager | 🟡 中 |
| SMTP_PASS | .env | Secret Manager | 🟡 中 |
| APP_NAME | .env | YAML | 🟢 低 |

✅ **正確**: 使用 `process.env` 直接存取，不透過 Nuxt runtimeConfig
✅ **安全**: 機密資訊使用 Secret Manager
✅ **靈活**: 非機密設定可在 Cloud Run YAML 中調整