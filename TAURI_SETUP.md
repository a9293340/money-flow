# Tauri 2.0 + Android 開發環境設定指南

## 🚀 一鍵自動化安裝

### 新電腦完整設定（依序執行）

**步驟一：安裝所有環境和依賴**
```bash
# 在專案根目錄執行（會自動安裝 Rust、Java、Android SDK、NDK 等）
./scripts/setup-tauri-android.sh
```

**步驟二：設定永久環境變數**  
```bash
# 將環境變數永久加入到 ~/.bashrc（只需執行一次）
./scripts/setup-permanent-env.sh
```

**步驟三：重新載入環境變數**
```bash
# 載入新的環境變數設定
source ~/.bashrc
```

**完成！現在可以建置 APK：**
```bash
# 方法一：在根目錄直接執行（推薦）
yarn build:apk          # 產生 Release APK
yarn build:apk:debug    # 產生 Debug APK

# 方法二：切換到 frontend 目錄執行
cd frontend
yarn build:apk          # 產生 Release APK
yarn build:apk:debug    # 產生 Debug APK
```

### 已安裝環境的快速啟動
```bash
# 方法一：使用專案腳本 (在專案根目錄)
source scripts/quick-setup-env.sh

# 方法二：永久設定 (加入到 ~/.bashrc)
echo 'source /path/to/your/project/frontend/.env.tauri' >> ~/.bashrc
source ~/.bashrc
```

## 📱 常用開發指令

### 🚀 簡化指令 (推薦使用)

```bash
# 建置 Release APK (自動先建置 Web)
yarn build:apk          # 可在根目錄或 frontend 目錄執行

# 建置 Debug APK (測試用)
yarn build:apk:debug    # 可在根目錄或 frontend 目錄執行

# Android 開發模式 (即時預覽)
yarn mobile:dev         # 可在根目錄或 frontend 目錄執行

# 桌面開發模式 (僅限 frontend 目錄)
cd frontend && yarn tauri:dev
```

### 📋 完整指令 (進階使用)

```bash
# 建置 Release APK (發布用)  
yarn tauri:android:build:release

# 建置 Debug APK (測試用)
yarn tauri:android:build:debug

# Android 開發模式 (即時預覽)
yarn tauri:android:dev
```

## 🛠️ 手動安裝步驟 (如果自動腳本失敗)

### 1. 安裝基礎依賴
```bash
# 安裝 Node.js 依賴
yarn install

# 安裝 Rust (如果未安裝)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# 安裝 Java JDK 17
sudo apt update
sudo apt install -y openjdk-17-jdk
```

### 2. 安裝 Tauri CLI
```bash
cargo install tauri-cli --version "^2.0"
```

### 3. 設定 Android SDK
```bash
# 建立 Android SDK 目錄
mkdir -p android-sdk
cd android-sdk

# 下載並解壓縮 Command-line Tools
wget https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
unzip commandlinetools-linux-11076708_latest.zip
mkdir -p latest
mv cmdline-tools/* latest/
rm commandlinetools-linux-11076708_latest.zip
cd ..

# 設定環境變數
export ANDROID_HOME="$(pwd)/android-sdk"
export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"
export PATH="$PATH:$ANDROID_HOME/latest/cmdline-tools/bin:$ANDROID_HOME/platform-tools"

# 安裝必要組件
echo "y" | $ANDROID_HOME/latest/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses
echo "y" | $ANDROID_HOME/latest/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME \
    "platform-tools" "build-tools;34.0.0" "platforms;android-34" "ndk;26.1.10909125"
```

### 4. 初始化 Tauri Android
```bash
yarn tauri android init
```

## 📂 專案結構說明

```
frontend/
├── src-tauri/                 # Tauri 核心配置
│   ├── src/                   # Rust 源碼
│   ├── gen/                   # 自動生成的 Android/iOS 項目 (不要提交到 Git)
│   ├── target/                # Rust 編譯輸出 (不要提交到 Git)
│   └── tauri.conf.json        # Tauri 配置檔
├── android-sdk/               # 本地 Android SDK (不要提交到 Git)
└── .env.tauri                 # 環境變數設定檔
```

## ⚠️ 常見問題解決

### 1. 權限錯誤
```bash
# 確保腳本有執行權限
chmod +x scripts/setup-tauri-android.sh
chmod +x scripts/quick-setup-env.sh
```

### 2. Android SDK 找不到
```bash
# 確認環境變數設定
echo $ANDROID_HOME
echo $NDK_HOME

# 重新載入環境變數
source frontend/.env.tauri
```

### 3. 建置失敗
```bash
# 清理並重新建置
yarn tauri android build --apk --debug --verbose
```

### 4. Rust 工具鏈問題
```bash
# 重新載入 Rust 環境
source ~/.cargo/env

# 更新 Rust 工具鏈
rustup update
```

## 🔒 部署注意事項

- **不要提交** `android-sdk/`、`src-tauri/target/`、`src-tauri/gen/` 到 Git
- **signing key** 檔案請妥善保管，用於 Release 版本簽名
- **環境變數檔** `.env.tauri` 可以提交，內容是相對路徑

## 🎯 後續開發流程

1. **日常開發**：`yarn mobile:dev` 進行即時預覽
2. **測試建置**：`yarn build:apk:debug` 產生測試 APK
3. **正式發布**：`yarn build:apk` 產生發布 APK
4. **上架準備**：參考 `docs/app_store_publishing.md`

### 💡 開發建議流程

```bash
# 1. Web 功能開發 (快速迭代)
yarn dev

# 2. 功能完成後測試 Mobile 版
yarn mobile:dev

# 3. 準備發布時建置 APK
yarn build:apk
```

### 📱 APK 檔案位置

建置完成後，APK 檔案會自動產生在：

**Debug APK：**
```
src-tauri/gen/android/app/build/outputs/apk/universal/debug/app-universal-debug.apk
```

**Release APK（執行 `yarn build:apk`）：**
```
src-tauri/gen/android/app/build/outputs/apk/universal/release/app-universal-release.apk
```

### 🚀 環境變數設定方式

如果遇到環境變數未設定的錯誤，請選擇以下一種方式：

**方法一：一次性設定（臨時）**
```bash
# 在 frontend 目錄執行
source .env.tauri
yarn build:apk
```

**方法二：永久設定到 bashrc**
```bash
# 在專案根目錄執行（只需執行一次）
yarn setup:permanent
```

**方法三：手動加入到 bashrc**
```bash
echo 'source /home/a9293340/money-flow/frontend/.env.tauri' >> ~/.bashrc
source ~/.bashrc
```

---

**💡 提示**：建議將 `source /path/to/project/frontend/.env.tauri` 加入到 `~/.bashrc` 中，這樣每次開啟終端都會自動載入 Tauri 開發環境。