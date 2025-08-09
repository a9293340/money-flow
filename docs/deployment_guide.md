# CI/CD 和部署指南

## 概述

本指南詳細說明 Personal Finance Manager 專案的持續整合與持續部署 (CI/CD) 流程，以及在 Google Cloud Platform 上的部署策略。包括 Web 應用程式和移動端應用程式的自動化建置、測試和發布流程。

---

## CI/CD 架構概覽

```
GitHub Repository
    │
    ├── Web App Pipeline
    │   ├── 程式碼檢查 (ESLint, TypeScript)
    │   ├── 單元測試 (Vitest)
    │   ├── E2E 測試 (Playwright)
    │   ├── 建置 Docker 映像
    │   └── 部署到 Google Cloud Run
    │
    └── Mobile App Pipeline
        ├── 程式碼檢查
        ├── Tauri 建置 (Android + iOS)
        ├── 簽名和打包
        ├── 上傳到應用商店
        └── 發布通知
```

---

## GitHub Actions 工作流程

### 1. 主要工作流程配置

```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: gcr.io
  PROJECT_ID: personal-finance-manager
  SERVICE_NAME: finance-api
  REGION: asia-east1

jobs:
  # 程式碼品質檢查
  code-quality:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 設定 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 安裝依賴
        run: npm ci

      - name: 類型檢查
        run: npm run type-check

      - name: 程式碼檢查
        run: npm run lint

      - name: 格式檢查
        run: npm run format:check

  # 單元測試
  unit-tests:
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 設定 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 安裝依賴
        run: npm ci

      - name: 執行單元測試
        run: npm run test:unit -- --coverage

      - name: 上傳測試覆蓋率報告
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella

  # E2E 測試
  e2e-tests:
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 設定 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 安裝依賴
        run: npm ci

      - name: 安裝 Playwright 瀏覽器
        run: npx playwright install --with-deps

      - name: 建置應用程式
        run: npm run build

      - name: 執行 E2E 測試
        run: npm run test:e2e

      - name: 上傳測試報告
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-report
          path: playwright-report/
          retention-days: 30

  # 安全性掃描
  security-scan:
    runs-on: ubuntu-latest
    needs: code-quality
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 執行 npm audit
        run: npm audit --audit-level=high

      - name: 執行 Snyk 安全性掃描
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
        with:
          args: --severity-threshold=high

  # Web 應用程式建置和部署
  deploy-web:
    runs-on: ubuntu-latest
    needs: [unit-tests, e2e-tests, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 設定 Google Cloud CLI
        uses: google-github-actions/setup-gcloud@v2
        with:
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          project_id: ${{ env.PROJECT_ID }}

      - name: 配置 Docker 認證
        run: gcloud auth configure-docker

      - name: 建置 Docker 映像
        run: |
          docker build \
            --tag ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --tag ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest \
            .

      - name: 推送 Docker 映像
        run: |
          docker push ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }}
          docker push ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:latest

      - name: 部署到 Cloud Run
        run: |
          gcloud run deploy ${{ env.SERVICE_NAME }} \
            --image ${{ env.REGISTRY }}/${{ env.PROJECT_ID }}/${{ env.SERVICE_NAME }}:${{ github.sha }} \
            --region ${{ env.REGION }} \
            --platform managed \
            --allow-unauthenticated \
            --memory 1Gi \
            --cpu 1 \
            --max-instances 10 \
            --set-env-vars NODE_ENV=production

      - name: 驗證部署
        run: |
          SERVICE_URL=$(gcloud run services describe ${{ env.SERVICE_NAME }} \
            --region ${{ env.REGION }} \
            --format 'value(status.url)')
          curl -f $SERVICE_URL/api/health || exit 1

  # 移動端應用程式建置
  build-mobile:
    runs-on: ${{ matrix.os }}
    needs: [unit-tests, security-scan]
    if: github.event_name == 'release'
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest]
        include:
          - os: ubuntu-latest
            target: android
          - os: macos-latest
            target: ios
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 設定 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 設定 Rust
        uses: dtolnay/rust-toolchain@stable

      - name: 安裝 Tauri CLI
        run: npm install -g @tauri-apps/cli@next

      - name: 設定 Android 環境 (Android only)
        if: matrix.target == 'android'
        uses: android-actions/setup-android@v3
        with:
          api-level: 33
          build-tools: 33.0.0
          ndk: 25.1.8937393

      - name: 設定 Android NDK 環境變數
        if: matrix.target == 'android'
        run: |
          echo "ANDROID_NDK_ROOT=$ANDROID_NDK_LATEST_HOME" >> $GITHUB_ENV
          echo "NDK_HOME=$ANDROID_NDK_LATEST_HOME" >> $GITHUB_ENV

      - name: 安裝專案依賴
        run: npm ci

      - name: 建置前端
        run: npm run build

      - name: 初始化 Tauri 移動端
        run: |
          if [ "${{ matrix.target }}" = "android" ]; then
            npm run tauri android init
          else
            npm run tauri ios init
          fi

      - name: 建置 Android APK
        if: matrix.target == 'android'
        run: |
          echo "${{ secrets.ANDROID_KEYSTORE }}" | base64 --decode > android-keystore.jks
          export ANDROID_KEYSTORE_PATH=./android-keystore.jks
          export ANDROID_KEYSTORE_PASSWORD="${{ secrets.ANDROID_KEYSTORE_PASSWORD }}"
          export ANDROID_KEY_ALIAS="${{ secrets.ANDROID_KEY_ALIAS }}"
          export ANDROID_KEY_PASSWORD="${{ secrets.ANDROID_KEY_PASSWORD }}"
          npm run tauri android build -- --apk

      - name: 建置 iOS APP
        if: matrix.target == 'ios'
        run: npm run tauri ios build

      - name: 上傳 Android APK
        if: matrix.target == 'android'
        uses: actions/upload-artifact@v4
        with:
          name: android-apk
          path: src-tauri/gen/android/app/build/outputs/apk/release/
          retention-days: 90

      - name: 上傳 iOS APP
        if: matrix.target == 'ios'
        uses: actions/upload-artifact@v4
        with:
          name: ios-app
          path: src-tauri/gen/ios/build/
          retention-days: 90

  # 通知部署結果
  notify:
    runs-on: ubuntu-latest
    needs: [deploy-web, build-mobile]
    if: always()
    steps:
      - name: 發送 Slack 通知
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### 2. 開發分支工作流程

```yaml
# .github/workflows/dev.yml
name: Development Pipeline

on:
  push:
    branches: [develop]
  pull_request:
    branches: [develop]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 設定 Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: 安裝依賴
        run: npm ci

      - name: 執行所有檢查
        run: |
          npm run type-check
          npm run lint
          npm run test:unit
          npm run build

  # 部署到測試環境
  deploy-staging:
    runs-on: ubuntu-latest
    needs: validate
    if: github.ref == 'refs/heads/develop'
    environment: staging
    steps:
      - name: Checkout 程式碼
        uses: actions/checkout@v4

      - name: 部署到測試環境
        run: |
          # 部署邏輯
          echo "正在部署到測試環境..."
```

---

## Docker 設定

### 1. Web 應用程式 Dockerfile

```dockerfile
# Dockerfile
# 多階段建置最佳化映像大小
FROM node:18-alpine AS base

# 安裝依賴階段
FROM base AS deps
WORKDIR /app

# 複製套件配置檔案
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# 安裝依賴 (只安裝生產環境依賴)
RUN npm ci --omit=dev --ignore-scripts

# 建置階段
FROM base AS builder
WORKDIR /app

# 複製套件配置檔案
COPY package.json package-lock.json ./
COPY tsconfig.json nuxt.config.ts tailwind.config.js ./

# 安裝所有依賴 (包含開發依賴)
RUN npm ci

# 複製原始碼
COPY . .

# 建置應用程式
RUN npm run build

# 生產環境執行階段
FROM node:18-alpine AS runner
WORKDIR /app

# 建立非 root 使用者
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nuxtjs

# 設定環境變數
ENV NODE_ENV=production
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3000

# 複製建置產物
COPY --from=deps --chown=nuxtjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nuxtjs:nodejs /app/.output ./.output

# 建立應用程式目錄
USER nuxtjs

# 開放連接埠
EXPOSE 3000

# 健康檢查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# 啟動應用程式
CMD ["node", ".output/server/index.mjs"]
```

### 2. Docker Compose 開發環境

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/finance_dev
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongo
      - redis
    volumes:
      - .:/app
      - /app/node_modules
    command: npm run dev

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=finance_dev
    volumes:
      - mongo_data:/data/db
      - ./docker/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/ssl:/etc/nginx/ssl
    depends_on:
      - app

volumes:
  mongo_data:
  redis_data:
```

---

## Google Cloud Platform 部署

### 1. Cloud Run 部署配置

```yaml
# cloud-run-config.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: personal-finance-manager
  labels:
    app: personal-finance-manager
    version: v1
  annotations:
    run.googleapis.com/ingress: all
    run.googleapis.com/execution-environment: gen2
spec:
  template:
    metadata:
      annotations:
        # 自動擴展設定
        autoscaling.knative.dev/minScale: "1"
        autoscaling.knative.dev/maxScale: "10"
        
        # 資源配置
        run.googleapis.com/memory: "1Gi"
        run.googleapis.com/cpu: "1000m"
        
        # 並發設定
        run.googleapis.com/execution-environment: gen2
        run.googleapis.com/cpu-throttling: "false"
        
        # 監控設定
        run.googleapis.com/vpc-access-connector: projects/PROJECT_ID/locations/REGION/connectors/CONNECTOR_NAME
    spec:
      containerConcurrency: 100
      timeoutSeconds: 300
      containers:
      - name: finance-app
        image: gcr.io/PROJECT_ID/personal-finance-manager:latest
        ports:
        - name: http1
          containerPort: 3000
        env:
        # 應用程式設定
        - name: NODE_ENV
          value: "production"
        - name: PORT
          value: "3000"
        
        # 資料庫設定
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: mongodb-uri
        
        # Redis 設定
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: redis-url
        
        # JWT 設定
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: jwt-secret
        
        # 外部服務 API 金鑰
        - name: EXCHANGE_RATE_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: exchange-rate-api-key
        
        resources:
          limits:
            cpu: "1000m"
            memory: "1Gi"
          requests:
            cpu: "500m"
            memory: "512Mi"
        
        # 健康檢查
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 30
          timeoutSeconds: 10
          failureThreshold: 3
        
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
```

### 2. Terraform 基礎設施配置

```hcl
# main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 變數定義
variable "project_id" {
  description = "Google Cloud 專案 ID"
  type        = string
}

variable "region" {
  description = "部署區域"
  type        = string
  default     = "asia-east1"
}

# 啟用所需的 API
resource "google_project_service" "services" {
  for_each = toset([
    "run.googleapis.com",
    "cloudbuild.googleapis.com",
    "containerregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "monitoring.googleapis.com",
    "logging.googleapis.com"
  ])
  
  project = var.project_id
  service = each.value
  
  disable_on_destroy = false
}

# Secret Manager 機密資料
resource "google_secret_manager_secret" "app_secrets" {
  for_each = toset([
    "mongodb-uri",
    "redis-url", 
    "jwt-secret",
    "exchange-rate-api-key"
  ])
  
  project   = var.project_id
  secret_id = each.value
  
  replication {
    automatic = true
  }
}

# Cloud Run 服務
resource "google_cloud_run_service" "main" {
  name     = "personal-finance-manager"
  location = var.region
  project  = var.project_id

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/personal-finance-manager:latest"
        
        ports {
          container_port = 3000
        }
        
        env {
          name  = "NODE_ENV"
          value = "production"
        }
        
        env {
          name = "MONGODB_URI"
          value_from {
            secret_key_ref {
              name = google_secret_manager_secret.app_secrets["mongodb-uri"].secret_id
              key  = "latest"
            }
          }
        }
        
        resources {
          limits = {
            cpu    = "1000m"
            memory = "1Gi"
          }
        }
      }
      
      container_concurrency = 100
      timeout_seconds      = 300
    }
    
    metadata {
      annotations = {
        "autoscaling.knative.dev/minScale" = "1"
        "autoscaling.knative.dev/maxScale" = "10"
        "run.googleapis.com/memory"        = "1Gi"
        "run.googleapis.com/cpu"           = "1000m"
      }
    }
  }
  
  traffic {
    percent         = 100
    latest_revision = true
  }
  
  depends_on = [google_project_service.services]
}

# IAM 設定 - 允許未經驗證的存取
resource "google_cloud_run_service_iam_member" "allUsers" {
  project  = var.project_id
  location = google_cloud_run_service.main.location
  service  = google_cloud_run_service.main.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# 自定義網域對映
resource "google_cloud_run_domain_mapping" "main" {
  location = var.region
  name     = "api.yourfinanceapp.com"
  project  = var.project_id

  spec {
    route_name = google_cloud_run_service.main.name
  }
}

# 輸出
output "service_url" {
  description = "Cloud Run 服務 URL"
  value       = google_cloud_run_service.main.status[0].url
}

output "custom_domain" {
  description = "自定義網域"
  value       = google_cloud_run_domain_mapping.main.name
}
```

---

## 環境管理

### 1. 環境變數配置

```bash
# .env.example - 範例環境變數檔案

# 應用程式設定
NODE_ENV=production
PORT=3000
APP_URL=https://yourfinanceapp.com
API_URL=https://api.yourfinanceapp.com

# 資料庫設定
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finance_prod
REDIS_URL=redis://redis:6379

# 認證設定
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h
ENCRYPTION_KEY=your-32-char-encryption-key

# 外部服務 API
EXCHANGE_RATE_API_KEY=your-exchange-rate-api-key
EMAIL_SERVICE_API_KEY=your-email-service-key

# Google Cloud 設定
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json

# Firebase 設定 (推播通知)
FIREBASE_PROJECT_ID=your-firebase-project
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com

# 監控設定
SENTRY_DSN=https://xxx@sentry.io/xxx
LOG_LEVEL=info

# 安全設定
CORS_ORIGIN=https://yourfinanceapp.com,https://app.yourfinanceapp.com
RATE_LIMIT_WINDOW_MS=900000  # 15 分鐘
RATE_LIMIT_MAX_REQUESTS=100  # 每個 IP 每 15 分鐘最多 100 次請求
```

### 2. 環境特定配置

```typescript
// config/environments.ts
interface Environment {
  name: string
  database: {
    mongodb: string
    redis: string
  }
  api: {
    url: string
    timeout: number
    retries: number
  }
  security: {
    jwtExpiry: string
    corsOrigins: string[]
    rateLimiting: {
      windowMs: number
      max: number
    }
  }
  external: {
    exchangeRateApi: string
    emailService: string
  }
  monitoring: {
    sentryDsn?: string
    logLevel: 'error' | 'warn' | 'info' | 'debug'
  }
}

const environments: Record<string, Environment> = {
  development: {
    name: 'development',
    database: {
      mongodb: process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_dev',
      redis: process.env.REDIS_URL || 'redis://localhost:6379'
    },
    api: {
      url: 'http://localhost:3000',
      timeout: 10000,
      retries: 3
    },
    security: {
      jwtExpiry: '24h',
      corsOrigins: ['http://localhost:3000'],
      rateLimiting: {
        windowMs: 15 * 60 * 1000,
        max: 1000 // 開發環境較寬鬆
      }
    },
    external: {
      exchangeRateApi: 'https://api.exchangerate-api.com/v4/latest',
      emailService: 'https://api.emailservice.dev'
    },
    monitoring: {
      logLevel: 'debug'
    }
  },
  
  staging: {
    name: 'staging',
    database: {
      mongodb: process.env.MONGODB_URI!,
      redis: process.env.REDIS_URL!
    },
    api: {
      url: 'https://staging-api.yourfinanceapp.com',
      timeout: 8000,
      retries: 2
    },
    security: {
      jwtExpiry: '24h',
      corsOrigins: [
        'https://staging.yourfinanceapp.com',
        'https://staging-app.yourfinanceapp.com'
      ],
      rateLimiting: {
        windowMs: 15 * 60 * 1000,
        max: 200
      }
    },
    external: {
      exchangeRateApi: 'https://api.exchangerate-api.com/v4/latest',
      emailService: 'https://api.emailservice.com'
    },
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN,
      logLevel: 'info'
    }
  },
  
  production: {
    name: 'production',
    database: {
      mongodb: process.env.MONGODB_URI!,
      redis: process.env.REDIS_URL!
    },
    api: {
      url: 'https://api.yourfinanceapp.com',
      timeout: 5000,
      retries: 1
    },
    security: {
      jwtExpiry: '24h',
      corsOrigins: [
        'https://yourfinanceapp.com',
        'https://app.yourfinanceapp.com'
      ],
      rateLimiting: {
        windowMs: 15 * 60 * 1000,
        max: 100
      }
    },
    external: {
      exchangeRateApi: 'https://api.exchangerate-api.com/v4/latest',
      emailService: 'https://api.emailservice.com'
    },
    monitoring: {
      sentryDsn: process.env.SENTRY_DSN!,
      logLevel: 'info'
    }
  }
}

export function getEnvironment(): Environment {
  const env = process.env.NODE_ENV || 'development'
  const config = environments[env]
  
  if (!config) {
    throw new Error(`未知的環境: ${env}`)
  }
  
  return config
}
```

---

## 監控和日誌

### 1. Google Cloud Monitoring 設定

```yaml
# monitoring-config.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: finance-app-monitor
  labels:
    app: personal-finance-manager
spec:
  selector:
    matchLabels:
      app: personal-finance-manager
  endpoints:
  - port: http
    path: /metrics
    interval: 30s
    timeout: 10s

---
# 警告規則
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: finance-app-alerts
  labels:
    app: personal-finance-manager
spec:
  groups:
  - name: finance-app
    rules:
    - alert: HighErrorRate
      expr: |
        (
          sum(rate(http_requests_total{job="finance-app",code=~"5.."}[5m]))
        /
          sum(rate(http_requests_total{job="finance-app"}[5m]))
        ) > 0.05
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "應用程式錯誤率過高"
        description: "過去 5 分鐘內錯誤率超過 5%"
    
    - alert: HighResponseTime
      expr: |
        histogram_quantile(0.95, 
          sum(rate(http_request_duration_seconds_bucket{job="finance-app"}[5m])) by (le)
        ) > 2.0
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "回應時間過長"
        description: "95% 的請求回應時間超過 2 秒"
    
    - alert: LowAvailability
      expr: |
        (
          sum(up{job="finance-app"})
        /
          count(up{job="finance-app"})
        ) < 0.9
      for: 1m
      labels:
        severity: critical
      annotations:
        summary: "服務可用性低"
        description: "服務可用性低於 90%"
```

### 2. 結構化日誌配置

```typescript
// utils/logger.ts
import winston from 'winston'
import { getEnvironment } from '~/config/environments'

const env = getEnvironment()

// 日誌格式定義
const logFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      service: 'personal-finance-manager',
      version: process.env.npm_package_version || '1.0.0',
      environment: env.name,
      ...meta
    })
  })
)

// Logger 配置
export const logger = winston.createLogger({
  level: env.monitoring.logLevel,
  format: logFormat,
  transports: [
    // 控制台輸出
    new winston.transports.Console({
      format: env.name === 'development' 
        ? winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        : logFormat
    }),
    
    // 檔案輸出 (開發環境)
    ...(env.name === 'development' ? [
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error'
      }),
      new winston.transports.File({
        filename: 'logs/combined.log'
      })
    ] : [])
  ]
})

// HTTP 請求日誌中介軟體
export function requestLogger(req: any, res: any, next: any) {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    logger.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.id
    })
  })
  
  next()
}

// 錯誤日誌
export function logError(error: Error, context?: any) {
  logger.error('Application Error', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    context
  })
}

// 業務事件日誌
export function logBusinessEvent(event: string, data?: any, userId?: string) {
  logger.info('Business Event', {
    event,
    data,
    userId,
    category: 'business'
  })
}
```

---

## 備份和災難復原

### 1. 資料庫備份策略

```bash
#!/bin/bash
# scripts/backup-database.sh

set -e

# 設定變數
BACKUP_DIR="/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
MONGODB_URI="${MONGODB_URI}"
BACKUP_RETENTION_DAYS=30

# 建立備份目錄
mkdir -p ${BACKUP_DIR}

# MongoDB 備份
echo "開始備份 MongoDB..."
mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/mongodb_${TIMESTAMP}"

# 壓縮備份檔案
echo "壓縮備份檔案..."
tar -czf "${BACKUP_DIR}/mongodb_backup_${TIMESTAMP}.tar.gz" -C "${BACKUP_DIR}" "mongodb_${TIMESTAMP}"
rm -rf "${BACKUP_DIR}/mongodb_${TIMESTAMP}"

# 上傳到 Google Cloud Storage
echo "上傳備份到 Google Cloud Storage..."
gsutil cp "${BACKUP_DIR}/mongodb_backup_${TIMESTAMP}.tar.gz" "gs://finance-app-backups/mongodb/"

# 清理本地檔案
rm -f "${BACKUP_DIR}/mongodb_backup_${TIMESTAMP}.tar.gz"

# 清理過期備份
echo "清理過期備份..."
gsutil -m rm -r $(gsutil ls gs://finance-app-backups/mongodb/ | head -n -${BACKUP_RETENTION_DAYS})

echo "備份完成: mongodb_backup_${TIMESTAMP}.tar.gz"
```

### 2. 災難復原腳本

```bash
#!/bin/bash  
# scripts/restore-database.sh

set -e

BACKUP_FILE=$1
MONGODB_URI="${MONGODB_URI}"

if [ -z "$BACKUP_FILE" ]; then
    echo "用法: $0 <backup-file>"
    echo "範例: $0 mongodb_backup_20240115_120000.tar.gz"
    exit 1
fi

# 從 Google Cloud Storage 下載備份
echo "下載備份檔案..."
gsutil cp "gs://finance-app-backups/mongodb/${BACKUP_FILE}" "./restore_temp.tar.gz"

# 解壓縮
echo "解壓縮備份檔案..."
tar -xzf "./restore_temp.tar.gz"

# 還原資料庫
echo "還原資料庫..."
mongorestore --uri="${MONGODB_URI}" --drop "mongodb_$(echo ${BACKUP_FILE} | cut -d'_' -f3-4 | cut -d'.' -f1)"

# 清理臨時檔案
rm -rf "./restore_temp.tar.gz" "mongodb_*"

echo "資料庫還原完成"
```

### 3. 自動化備份 Cron Job

```yaml
# k8s/backup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: database-backup
spec:
  schedule: "0 2 * * *"  # 每天凌晨 2 點執行
  concurrencyPolicy: Forbid
  successfulJobsHistoryLimit: 3
  failedJobsHistoryLimit: 1
  jobTemplate:
    spec:
      template:
        spec:
          restartPolicy: OnFailure
          containers:
          - name: backup
            image: mongo:6.0
            command:
            - /bin/bash
            - -c
            - |
              set -e
              
              # 安裝 Google Cloud SDK
              apt-get update && apt-get install -y curl
              curl https://sdk.cloud.google.com | bash
              source ~/.bashrc
              
              # 執行備份
              /app/scripts/backup-database.sh
            env:
            - name: MONGODB_URI
              valueFrom:
                secretKeyRef:
                  name: app-secrets
                  key: mongodb-uri
            - name: GOOGLE_APPLICATION_CREDENTIALS
              value: /var/secrets/google/key.json
            volumeMounts:
            - name: google-service-account
              mountPath: /var/secrets/google
              readOnly: true
          volumes:
          - name: google-service-account
            secret:
              secretName: google-service-account-key
```

---

## 效能最佳化

### 1. CDN 設定

```javascript
// nuxt.config.ts
export default defineNuxtConfig({
  // 靜態資源 CDN
  app: {
    cdnURL: process.env.CDN_URL || undefined
  },
  
  // 圖片最佳化
  image: {
    cloudinary: {
      baseURL: process.env.CLOUDINARY_BASE_URL
    },
    domains: ['res.cloudinary.com']
  },
  
  // 快取設定
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        port: 6379,
        host: process.env.REDIS_HOST,
        username: '',
        password: process.env.REDIS_PASSWORD,
        db: 0
      }
    },
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Cache-Control': 'no-cache'
        }
      },
      '/assets/**': {
        headers: {
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      }
    }
  }
})
```

### 2. 負載平衡和擴展

```yaml
# k8s/hpa.yaml - 水平自動擴展
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: finance-app-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: finance-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 100
        periodSeconds: 15
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

---

## 安全性設定

### 1. Secret 管理

```bash
# scripts/setup-secrets.sh
#!/bin/bash

set -e

PROJECT_ID="your-project-id"

# 建立 Secret Manager 機密資料
echo "設定應用程式機密資料..."

# MongoDB 連接字串
echo -n "請輸入 MongoDB URI: "
read -s MONGODB_URI
echo "$MONGODB_URI" | gcloud secrets create mongodb-uri --data-file=-

# JWT 密鑰
JWT_SECRET=$(openssl rand -base64 32)
echo "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=-

# 加密金鑰
ENCRYPTION_KEY=$(openssl rand -hex 32)
echo "$ENCRYPTION_KEY" | gcloud secrets create encryption-key --data-file=-

# Exchange Rate API Key
echo -n "請輸入匯率 API 金鑰: "
read -s EXCHANGE_RATE_API_KEY  
echo "$EXCHANGE_RATE_API_KEY" | gcloud secrets create exchange-rate-api-key --data-file=-

echo "機密資料設定完成"
```

### 2. 網路安全設定

```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: finance-app-netpol
spec:
  podSelector:
    matchLabels:
      app: personal-finance-manager
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: istio-system
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to: []
    ports:
    - protocol: TCP
      port: 443  # HTTPS 輸出
    - protocol: TCP  
      port: 53   # DNS
    - protocol: UDP
      port: 53   # DNS
  - to:
    - namespaceSelector:
        matchLabels:
          name: database
    ports:
    - protocol: TCP
      port: 27017  # MongoDB
    - protocol: TCP
      port: 6379   # Redis
```

---

## 部署檢查清單

### 部署前檢查
- [ ] **程式碼品質**
  - [ ] 所有測試通過
  - [ ] 程式碼覆蓋率達到要求 (80%)
  - [ ] 沒有 TypeScript 錯誤
  - [ ] ESLint 檢查通過
  - [ ] 安全性掃描無高風險漏洞

- [ ] **環境設定**
  - [ ] 所有環境變數已設定
  - [ ] 機密資料已建立在 Secret Manager
  - [ ] 資料庫連線測試成功
  - [ ] 外部 API 金鑰有效

- [ ] **基礎設施**
  - [ ] Google Cloud 專案設定完成
  - [ ] 必要的 API 已啟用
  - [ ] IAM 權限配置正確
  - [ ] 監控和警告已設定

### 部署後驗證
- [ ] **功能測試**
  - [ ] 健康檢查端點回應正常
  - [ ] 主要功能可正常使用
  - [ ] API 端點回應正確
  - [ ] 資料庫連線正常

- [ ] **效能檢查**
  - [ ] 回應時間在可接受範圍內
  - [ ] 記憶體使用量正常
  - [ ] CPU 使用率正常
  - [ ] 服務自動擴展正常運作

- [ ] **安全性驗證**
  - [ ] HTTPS 憑證有效
  - [ ] CORS 設定正確
  - [ ] 敏感資料無洩漏
  - [ ] 認證機制正常運作

### 回滾計劃
- [ ] **準備工作**
  - [ ] 前一個穩定版本的映像可用
  - [ ] 資料庫遷移可回滾
  - [ ] 回滾腳本已準備

- [ ] **回滾程序**
  - [ ] 停止新版本部署
  - [ ] 還原到前一個版本
  - [ ] 驗證回滾成功
  - [ ] 通知相關人員

這份 CI/CD 和部署指南提供了完整的自動化部署流程，從程式碼提交到生產環境部署的每個步驟都有詳細說明，確保專案能夠穩定、安全、高效地部署和運行。