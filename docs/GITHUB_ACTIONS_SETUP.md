# GitHub Actions CI/CD 設定指南

## 🔐 GitHub Secrets 設定

在 GitHub 專案的 **Settings > Secrets and variables > Actions** 中設定以下 Secrets：

### 必要 Secrets

#### Docker Hub 相關
```
DOCKER_USERNAME=a9293340
DOCKER_PASSWORD=<您的Docker Hub密碼或Access Token>
```

#### Google Cloud 相關
```
GCP_PROJECT_ID=money-flow-468508
GCP_SA_KEY=<money-flow-gcp.json 檔案的完整內容>
CLOUD_RUN_REGION=asia-east1
CLOUD_RUN_SERVICE=personal-finance-manager
```

## 🔧 GitHub Variables 設定

在 **Settings > Secrets and variables > Actions > Variables** 中設定以下 Variables：

### Repository Variables
```
DOCKER_IMAGE=a9293340/personal-finance-manager
GCP_PROJECT_ID=money-flow-468508
CLOUD_RUN_REGION=asia-east1
CLOUD_RUN_SERVICE=personal-finance-manager
NODE_VERSION=22
```

## 📋 詳細設定步驟

### 1. Docker Hub Access Token 建立
1. 登入 Docker Hub
2. 前往 **Account Settings > Security**
3. 點選 **New Access Token**
4. 名稱：`github-actions-money-flow`
5. 權限：**Read, Write**
6. 複製生成的 token 作為 `DOCKER_PASSWORD`

### 2. Google Cloud Service Account Key
1. 您已有 `money-flow-gcp.json` 檔案
2. 複製整個檔案內容（包含大括號）
3. 在 GitHub Secrets 中貼上作為 `GCP_SA_KEY`

### 3. GitHub Secrets 設定
```bash
# 在 GitHub 專案頁面
# Settings > Secrets and variables > Actions > New repository secret

Name: DOCKER_USERNAME
Secret: a9293340

Name: DOCKER_PASSWORD  
Secret: <Docker Hub Access Token>

Name: GCP_PROJECT_ID
Secret: money-flow-468508

Name: GCP_SA_KEY
Secret: {
  "type": "service_account",
  "project_id": "money-flow-468508",
  ...完整的 JSON 內容...
}

Name: CLOUD_RUN_REGION
Secret: asia-east1

Name: CLOUD_RUN_SERVICE
Secret: personal-finance-manager
```

## 🚀 CI/CD Pipeline 流程

### 主要工作流程
1. **程式碼檢查**: TypeScript, ESLint, 測試
2. **Docker 建置**: 建置並推送到 Docker Hub
3. **Cloud Run 部署**: 部署到生產環境
4. **健康檢查**: 驗證部署成功

### 觸發條件
- **Push to main**: 自動部署到生產環境
- **Push to develop**: 執行測試但不部署
- **Pull Request**: 執行測試和安全檢查

## 🔍 必要檢查項目

### 部署前確認清單
- [ ] Docker Hub 帳號可以推送映像
- [ ] Google Cloud 服務帳戶有以下權限：
  - `Cloud Run Admin`
  - `Service Account User`
  - `Secret Manager Secret Accessor`
- [ ] Secret Manager 中已建立必要機密：
  - `mongodb-uri`
  - `jwt-secret`
  - `encryption-key`
- [ ] Cloud Run YAML 配置檔案正確

### 測試 Secrets 設定
```bash
# 本地測試 GCP 認證
echo "$GCP_SA_KEY" > temp-key.json
gcloud auth activate-service-account --key-file temp-key.json
gcloud config set project $GCP_PROJECT_ID
rm temp-key.json

# 測試 Docker Hub 登入
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
```

## 🎯 推薦的 GitHub Actions Workflow

建議工作流程檔案位置：`.github/workflows/deploy.yml`

### 基本結構
```yaml
name: Deploy to Cloud Run

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    # 程式碼檢查和測試

  build-and-deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    # Docker 建置和 Cloud Run 部署
```

## 📊 監控和日誌

### 部署後檢查
- **GitHub Actions 日誌**: 檢查建置和部署狀態
- **Cloud Run 日誌**: `gcloud logs tail --service=personal-finance-manager`
- **健康檢查**: 自動驗證 `/api/health/*` 端點

### 常見問題排解
1. **Docker 推送失敗**: 檢查 Docker Hub 認證
2. **Cloud Run 部署失敗**: 檢查服務帳戶權限
3. **健康檢查失敗**: 檢查 Secret Manager 設定
4. **Secret 存取失敗**: 確認服務帳戶有 `secretmanager.secretAccessor` 角色

---

## 🎉 完成設定後

設定完成後，每次推送到 `main` 分支都會：
1. 自動執行測試
2. 建置 Docker 映像並推送到 Docker Hub  
3. 部署到 Cloud Run
4. 執行健康檢查驗證

這樣就實現了完全自動化的 CI/CD 流程！