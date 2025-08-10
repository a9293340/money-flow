#!/bin/bash

# 快速環境變數設定腳本 (適合已安裝環境的快速啟動)
# 使用方式：source scripts/quick-setup-env.sh

# 檢查當前目錄
if [[ ! -f "CLAUDE.md" ]]; then
    echo "❌ 請在專案根目錄執行此腳本"
    return 1
fi

# 設定 Tauri Android 環境變數
export ANDROID_HOME="$(pwd)/frontend/android-sdk"
export NDK_HOME="$ANDROID_HOME/ndk/26.1.10909125"
export PATH="$PATH:$ANDROID_HOME/latest/cmdline-tools/bin:$ANDROID_HOME/platform-tools"

# 載入 Rust 環境
if [[ -f ~/.cargo/env ]]; then
    source ~/.cargo/env
fi

echo "✅ 環境變數設定完成"
echo "📱 Android SDK: $ANDROID_HOME"
echo "🔧 NDK: $NDK_HOME"
echo ""
echo "🚀 可用指令："
echo "  yarn build:apk          # 建置 Release APK (簡化指令)"
echo "  yarn build:apk:debug    # 建置 Debug APK (簡化指令)"
echo "  yarn mobile:dev         # Android 開發模式"
echo ""
echo "💡 若要永久設定環境變數到 bashrc，請執行："
echo "echo 'source $(pwd)/frontend/.env.tauri' >> ~/.bashrc && source ~/.bashrc"