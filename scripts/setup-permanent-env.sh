#!/bin/bash

# 永久設定 Tauri Android 環境變數到 bashrc
# 使用方式：./scripts/setup-permanent-env.sh

set -e

echo "🔧 正在設定永久環境變數..."

# 檢查當前目錄
if [[ ! -f "CLAUDE.md" ]]; then
    echo "❌ 請在專案根目錄執行此腳本"
    exit 1
fi

# 取得專案絕對路徑
PROJECT_ROOT="$(pwd)"
ENV_FILE="$PROJECT_ROOT/frontend/.env.tauri"

# 建立 .env.tauri 檔案（如果不存在）
if [[ ! -f "$ENV_FILE" ]]; then
    echo "📝 建立 .env.tauri 檔案..."
    mkdir -p "$(dirname "$ENV_FILE")"
    cat > "$ENV_FILE" << EOF
# Tauri Android 開發環境變數
export ANDROID_HOME="$PROJECT_ROOT/frontend/android-sdk"
export NDK_HOME="\$ANDROID_HOME/ndk/26.1.10909125"
export PATH="\$PATH:\$ANDROID_HOME/latest/cmdline-tools/bin:\$ANDROID_HOME/platform-tools"

# 載入 Rust 環境（如果存在）
if [[ -f ~/.cargo/env ]]; then
    source ~/.cargo/env
fi
EOF
fi

# 檢查 bashrc 是否已經包含此設定
BASHRC_FILE="$HOME/.bashrc"
ENV_SOURCE_LINE="source $ENV_FILE"

if grep -Fxq "$ENV_SOURCE_LINE" "$BASHRC_FILE" 2>/dev/null; then
    echo "✅ 環境變數已經設定在 ~/.bashrc 中"
else
    echo "📝 將環境變數設定加入到 ~/.bashrc..."
    echo "" >> "$BASHRC_FILE"
    echo "# Tauri Android 開發環境 (Personal Finance Manager)" >> "$BASHRC_FILE"
    echo "$ENV_SOURCE_LINE" >> "$BASHRC_FILE"
    echo "✅ 已加入環境變數設定到 ~/.bashrc"
fi

# 重新載入 bashrc
echo "🔄 重新載入環境變數..."
source "$BASHRC_FILE"

echo ""
echo "🎉 環境變數永久設定完成！"
echo ""
echo "📋 設定內容："
echo "  - ANDROID_HOME: $PROJECT_ROOT/frontend/android-sdk"
echo "  - NDK_HOME: \$ANDROID_HOME/ndk/26.1.10909125"
echo "  - PATH: 已加入 Android SDK 相關路徑"
echo ""
echo "💡 現在您可以在任何終端視窗中直接使用："
echo "  cd $PROJECT_ROOT/frontend"
echo "  yarn build:apk"
echo ""
echo "⚠️  注意：新開的終端視窗會自動載入環境變數，但當前終端請執行："
echo "  source ~/.bashrc"