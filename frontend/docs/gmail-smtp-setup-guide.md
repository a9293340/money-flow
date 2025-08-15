# Gmail SMTP 設定指南

## 📧 Gmail 應用程式密碼設定步驟

### 前置條件
1. **啟用兩步驟驗證** - Gmail 必須先啟用 2FA 才能使用應用程式密碼
2. **Google 帳戶** - 需要有效的 Gmail 帳戶

### 🔧 設定步驟

#### 步驟 1: 啟用兩步驟驗證
1. 前往 [Google 帳戶安全性設定](https://myaccount.google.com/security)
2. 點選「兩步驟驗證」
3. 按照指示完成手機號碼驗證
4. 確保兩步驟驗證已啟用

#### 步驟 2: 生成應用程式密碼
1. 在 Google 帳戶安全性頁面中
2. 找到「應用程式密碼」選項
3. 點選「應用程式密碼」
4. 選擇「其他 (自訂名稱)」
5. 輸入應用程式名稱，例如：「Money Flow SMTP」
6. 點選「產生」
7. **複製生成的 16 位密碼**（格式類似：`abcd efgh ijkl mnop`）

#### 步驟 3: 設定環境變數
```bash
# 在 .env 檔案中設定
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=abcdefghijklmnop    # 16位應用程式密碼（移除空格）
```

### 🔧 其他 SMTP 服務商設定

#### Outlook/Hotmail
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo Mail
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password    # 需要生成應用程式密碼
```

#### 商業郵件服務
```bash
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Amazon SES
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-username
SMTP_PASS=your-ses-password
```

### 🚨 常見問題

#### 問題 1: "Less secure app access"
- **解決方案**: 使用應用程式密碼，不要開啟「低安全性應用程式存取權」

#### 問題 2: 驗證失敗
- **檢查**: 應用程式密碼是否正確（移除空格）
- **檢查**: SMTP_USER 是否為完整的 email 地址
- **檢查**: 兩步驟驗證是否已啟用

#### 問題 3: 連接超時
- **檢查**: SMTP_PORT 是否正確（587 for TLS, 465 for SSL）
- **檢查**: SMTP_SECURE 設定（587 用 false, 465 用 true）

### 🔒 安全最佳實踐

1. **使用應用程式密碼** - 不要使用帳戶登入密碼
2. **定期輪換密碼** - 建議每 6 個月更換應用程式密碼
3. **最小權限原則** - 只給予必要的郵件發送權限
4. **監控使用量** - 定期檢查郵件發送日誌
5. **備用方案** - 準備第二個 SMTP 服務作為備援

### 📊 發送限制

#### Gmail 限制
- **每日**: 500 封郵件
- **每分鐘**: 約 100 封郵件
- **建議**: 個人專案適用，商業用途考慮 Google Workspace

#### 商業替代方案
- **SendGrid**: 每月 100 封免費
- **Mailgun**: 每月 5000 封免費
- **Amazon SES**: 每月 62000 封免費（在 EC2 上）

### ✅ 測試 SMTP 連接

可以在開發環境中測試郵件服務：

```bash
# 在 Node.js 中測試
node -e "
const { testEmailService } = require('./lib/utils/email.ts');
testEmailService().then(result => console.log('測試結果:', result));
"
```

---

**建議**: 開發階段使用 Gmail，生產環境考慮使用專業的郵件服務如 SendGrid 或 Amazon SES。