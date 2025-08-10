#!/bin/bash

# Personal Finance Manager - Tauri 2.0 + Android 環境自動初始化腳本
# 使用方式：chmod +x scripts/setup-tauri-android.sh && ./scripts/setup-tauri-android.sh

set -e

echo "🚀 開始初始化 Tauri 2.0 + Android 開發環境..."
echo "======================================="

# 顏色設定
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 錯誤處理
error_exit() {
    echo -e "${RED}❌ 錯誤: $1${NC}" >&2
    exit 1
}

# 成功訊息
success_msg() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 警告訊息
warning_msg() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# 資訊訊息
info_msg() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 檢查是否在正確目錄
if [[ ! -f "package.json" ]] || [[ ! -d "src-tauri" ]]; then
    error_exit "請在 frontend 目錄下執行此腳本"
fi

# 1. 檢查並安裝 Node.js 依賴
info_msg "檢查 Node.js 依賴..."
if command -v yarn &> /dev/null; then
    yarn install --frozen-lockfile
    success_msg "Node.js 依賴安裝完成"
else
    error_exit "請先安裝 yarn: npm install -g yarn"
fi

# 2. 檢查並安裝 Rust
info_msg "檢查 Rust 安裝狀態..."
if ! command -v cargo &> /dev/null; then
    warning_msg "未找到 Rust，開始安裝..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source ~/.cargo/env
    success_msg "Rust 安裝完成"
else
    success_msg "Rust 已安裝: $(rustc --version)"
fi

# 確保 Rust 環境可用
source ~/.cargo/env

# 3. 安裝 Tauri CLI
info_msg "安裝 Tauri CLI..."
if ! command -v tauri &> /dev/null; then
    cargo install tauri-cli --version "^2.0"
    success_msg "Tauri CLI 安裝完成"
else
    success_msg "Tauri CLI 已安裝: $(tauri --version)"
fi

# 4. 檢查並安裝 Java JDK
info_msg "檢查 Java JDK..."
if ! command -v java &> /dev/null; then
    warning_msg "未找到 Java，開始安裝 OpenJDK 17..."
    sudo apt update
    sudo apt install -y openjdk-17-jdk
    success_msg "OpenJDK 17 安裝完成"
else
    success_msg "Java 已安裝: $(java -version 2>&1 | head -n 1)"
fi

# 5. 建立 Android SDK 目錄
info_msg "設定 Android SDK..."
ANDROID_SDK_DIR="$(pwd)/android-sdk"
NDK_VERSION="26.1.10909125"

if [[ ! -d "$ANDROID_SDK_DIR" ]]; then
    mkdir -p "$ANDROID_SDK_DIR"
    cd "$ANDROID_SDK_DIR"
    
    # 下載 Android 命令列工具
    info_msg "下載 Android SDK Command-line Tools..."
    wget -q https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip
    
    # 解壓縮
    info_msg "解壓縮 Command-line Tools..."
    if ! command -v unzip &> /dev/null; then
        sudo apt install -y unzip
    fi
    unzip -q commandlinetools-linux-11076708_latest.zip
    
    # 建立正確的目錄結構
    mkdir -p latest
    mv cmdline-tools/* latest/
    rmdir cmdline-tools
    
    # 清理下載檔案
    rm commandlinetools-linux-11076708_latest.zip
    
    cd - > /dev/null
    success_msg "Android SDK Command-line Tools 安裝完成"
else
    success_msg "Android SDK 目錄已存在"
fi

# 6. 設定環境變數並安裝 SDK 組件
info_msg "安裝 Android SDK 組件..."
export ANDROID_HOME="$ANDROID_SDK_DIR"
export NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
export PATH="$PATH:$ANDROID_HOME/latest/cmdline-tools/bin:$ANDROID_HOME/platform-tools"

# 接受授權並安裝必要組件
echo "y" | $ANDROID_HOME/latest/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME --licenses > /dev/null 2>&1

info_msg "安裝核心 Android SDK 組件 (這可能需要幾分鐘)..."
echo "y" | $ANDROID_HOME/latest/cmdline-tools/bin/sdkmanager --sdk_root=$ANDROID_HOME \
    "platform-tools" \
    "build-tools;34.0.0" \
    "platforms;android-34" \
    "ndk;$NDK_VERSION" > /dev/null

success_msg "Android SDK 組件安裝完成"

# 7. 初始化 Tauri Android
info_msg "初始化 Tauri Android 專案..."
source ~/.cargo/env
export ANDROID_HOME="$ANDROID_SDK_DIR"
export NDK_HOME="$ANDROID_HOME/ndk/$NDK_VERSION"
export PATH="$PATH:$ANDROID_HOME/latest/cmdline-tools/bin:$ANDROID_HOME/platform-tools"

yarn tauri android init
success_msg "Tauri Android 初始化完成"

# 8. 建立環境變數設定檔
info_msg "建立環境變數設定檔..."
cat > .env.tauri << EOF
# Tauri Android 開發環境變數
export ANDROID_HOME="$(pwd)/android-sdk"
export NDK_HOME="\$ANDROID_HOME/ndk/$NDK_VERSION"
export PATH="\$PATH:\$ANDROID_HOME/latest/cmdline-tools/bin:\$ANDROID_HOME/platform-tools"

# 使用方式: source .env.tauri
# 或在 ~/.bashrc 中加入: source $(pwd)/.env.tauri
EOF

success_msg "環境變數設定檔建立完成: .env.tauri"

# 9. 驗證安裝
info_msg "驗證安裝狀態..."
echo ""
echo "📋 安裝驗證結果："
echo "=================="

# Rust 驗證
if command -v rustc &> /dev/null; then
    echo -e "${GREEN}✅ Rust: $(rustc --version)${NC}"
else
    echo -e "${RED}❌ Rust: 未安裝${NC}"
fi

# Tauri 驗證
source ~/.cargo/env
if command -v tauri &> /dev/null; then
    echo -e "${GREEN}✅ Tauri CLI: $(tauri --version)${NC}"
else
    echo -e "${RED}❌ Tauri CLI: 未安裝${NC}"
fi

# Java 驗證
if command -v java &> /dev/null; then
    echo -e "${GREEN}✅ Java: $(java -version 2>&1 | head -n 1)${NC}"
else
    echo -e "${RED}❌ Java: 未安裝${NC}"
fi

# Android SDK 驗證
if [[ -d "$ANDROID_SDK_DIR/latest/cmdline-tools" ]]; then
    echo -e "${GREEN}✅ Android SDK: 已安裝${NC}"
else
    echo -e "${RED}❌ Android SDK: 未安裝${NC}"
fi

# NDK 驗證
if [[ -d "$ANDROID_SDK_DIR/ndk/$NDK_VERSION" ]]; then
    echo -e "${GREEN}✅ Android NDK: $NDK_VERSION${NC}"
else
    echo -e "${RED}❌ Android NDK: 未安裝${NC}"
fi

echo ""
echo "🎉 Tauri 2.0 + Android 環境初始化完成！"
echo ""
echo "📝 後續步驟："
echo "1. 重新載入環境變數: source .env.tauri"
echo "2. 建置 Android APK: yarn tauri android build --apk --debug"
echo "3. 如需設定環境變數到 shell: echo 'source $(pwd)/.env.tauri' >> ~/.bashrc"
echo ""
warning_msg "注意: 換電腦時請確保有安裝 sudo 權限以安裝系統依賴"