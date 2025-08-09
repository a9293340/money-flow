# Tauri 2 移動端配置指南

## 概述

本指南詳細說明如何使用 Tauri 2 將 Personal Finance Manager 的 Web 應用程式打包成原生的 Android APK 和 iOS APP，並準備上架到各大應用商店。

## 系統需求

### 開發環境
- **Node.js**: 18+ 版本
- **Rust**: 最新穩定版本
- **Tauri CLI**: v2.0+

### Android 開發需求
- **Android Studio**: 最新版本
- **Android SDK**: API Level 24 (Android 7.0) 或更高
- **Android NDK**: 最新版本
- **Java JDK**: 17 或更高

### iOS 開發需求
- **macOS**: 10.15 或更高版本
- **Xcode**: 14.0 或更高版本
- **iOS SDK**: 12.0 或更高版本
- **Apple Developer Account**: 用於代碼簽名和上架

---

## 專案初始化

### 1. 安裝 Tauri CLI

```bash
# 安裝 Tauri CLI
cargo install tauri-cli --version "^2.0"

# 或使用 npm
npm install --save-dev @tauri-apps/cli@next
```

### 2. 初始化 Tauri 配置

```bash
# 在專案根目錄執行
npm run tauri init

# 或
cargo tauri init
```

### 3. 添加移動端目標平台

```bash
# 添加 Android 支援
cargo tauri android init

# 添加 iOS 支援 (僅在 macOS 上)
cargo tauri ios init
```

---

## Android 配置

### 1. Android Studio 安裝和配置

1. 下載並安裝 [Android Studio](https://developer.android.com/studio)
2. 開啟 Android Studio，安裝必要的 SDK 工具
3. 設定環境變數：

```bash
# 在 ~/.bashrc 或 ~/.zshrc 中添加
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

### 2. Tauri Android 配置檔案

編輯 `src-tauri/gen/android/app/tauri.conf.json`：

```json
{
  "productName": "Personal Finance Manager",
  "version": "1.0.0",
  "identifier": "com.yourcompany.personalfinancemanager",
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "frontendDist": "../dist"
  },
  "android": {
    "minSdkVersion": 24,
    "compileSdkVersion": 34,
    "targetSdkVersion": 34,
    "allowBackup": true,
    "theme": "@android:style/Theme.DeviceDefault.NoActionBar",
    "icon": [
      "icons/32x32.png",
      "icons/128x128.png",
      "icons/icon.icns",
      "icons/icon.ico"
    ]
  },
  "permissions": [
    "android.permission.INTERNET",
    "android.permission.CAMERA",
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE"
  ]
}
```

### 3. Android 應用程式資訊配置

編輯 `src-tauri/gen/android/app/src/main/AndroidManifest.xml`：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.yourcompany.personalfinancemanager">
    
    <application
        android:name="App"
        android:label="Personal Finance Manager"
        android:theme="@style/AppTheme"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true">
        
        <activity
            android:name="MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:resizeableActivity="true"
            android:windowSoftInputMode="adjustResize">
            
            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
    
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
</manifest>
```

### 4. 建置 Android APK

```bash
# 開發版本 (Debug)
cargo tauri android dev

# 生產版本 (Release)
cargo tauri android build --release
```

### 5. Android 代碼簽名

#### 產生簽名金鑰

```bash
# 產生發布用的 keystore
keytool -genkey -v -keystore release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000

# 將 keystore 放在安全位置
mkdir -p ~/.android
mv release-key.keystore ~/.android/
```

#### 配置簽名

在 `src-tauri/gen/android/app/build.gradle` 中添加：

```gradle
android {
    signingConfigs {
        release {
            keyAlias 'alias_name'
            keyPassword 'your_key_password'
            storeFile file('~/.android/release-key.keystore')
            storePassword 'your_store_password'
        }
    }
    
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## iOS 配置

### 1. Xcode 和 iOS 開發環境

1. 從 App Store 安裝 Xcode
2. 安裝 iOS 模擬器和開發工具
3. 確保有效的 Apple Developer Account

### 2. Tauri iOS 配置檔案

編輯 `src-tauri/gen/ios/tauri.conf.json`：

```json
{
  "productName": "Personal Finance Manager",
  "version": "1.0.0",
  "identifier": "com.yourcompany.personalfinancemanager",
  "ios": {
    "minimumSystemVersion": "12.0",
    "developmentTeam": "YOUR_TEAM_ID",
    "provisioningProfile": "YOUR_PROVISIONING_PROFILE",
    "icon": [
      "icons/AppIcon-20x20@1x.png",
      "icons/AppIcon-20x20@2x.png",
      "icons/AppIcon-29x29@1x.png",
      "icons/AppIcon-29x29@2x.png",
      "icons/AppIcon-29x29@3x.png",
      "icons/AppIcon-40x40@1x.png",
      "icons/AppIcon-40x40@2x.png",
      "icons/AppIcon-40x40@3x.png",
      "icons/AppIcon-60x60@2x.png",
      "icons/AppIcon-60x60@3x.png",
      "icons/AppIcon-76x76@1x.png",
      "icons/AppIcon-76x76@2x.png",
      "icons/AppIcon-83.5x83.5@2x.png",
      "icons/AppIcon-1024x1024@1x.png"
    ]
  }
}
```

### 3. iOS 專案配置

編輯 `src-tauri/gen/ios/Sources/main.swift`：

```swift
import SwiftUI
import Tauri
import UIKit
import WebKit

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        return true
    }
}

@main
struct iOSApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    var body: some Scene {
        WindowGroup {
            ContentView()
        }
    }
}

struct ContentView: View {
    var body: some View {
        TauriViewControllerRepresentable()
            .ignoresSafeArea(.all, edges: .all)
    }
}

struct TauriViewControllerRepresentable: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> UIViewController {
        return TauriViewController()
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {}
}
```

### 4. 建置 iOS APP

```bash
# 開發版本 (模擬器)
cargo tauri ios dev

# 生產版本 (實機)
cargo tauri ios build --release
```

### 5. iOS 代碼簽名

#### 在 Xcode 中設定

1. 開啟 Xcode 專案：`src-tauri/gen/ios/PersonalFinanceManager.xcodeproj`
2. 選擇專案 → General → Signing & Capabilities
3. 設定 Team 和 Bundle Identifier
4. 確保 Provisioning Profile 正確

#### 建立 Provisioning Profile

1. 登入 [Apple Developer Portal](https://developer.apple.com/)
2. Certificates, Identifiers & Profiles → Profiles
3. 建立新的 Provisioning Profile
4. 選擇對應的 App ID 和憑證

---

## 應用程式圖示和啟動畫面

### 圖示規格

#### Android 圖示

- **mdpi**: 48×48 px
- **hdpi**: 72×72 px  
- **xhdpi**: 96×96 px
- **xxhdpi**: 144×144 px
- **xxxhdpi**: 192×192 px

放置路徑：`src-tauri/icons/`

#### iOS 圖示

- **20×20**: @1x, @2x, @3x
- **29×29**: @1x, @2x, @3x
- **40×40**: @1x, @2x, @3x
- **60×60**: @2x, @3x
- **76×76**: @1x, @2x
- **83.5×83.5**: @2x
- **1024×1024**: @1x (App Store)

### 啟動畫面

#### Android Launch Screen

編輯 `src-tauri/gen/android/app/src/main/res/drawable/launch_splash.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item android:drawable="@color/splash_background_color"/>
    <item>
        <bitmap android:src="@drawable/splash_logo"
                android:gravity="center"/>
    </item>
</layer-list>
```

#### iOS Launch Screen

編輯 `src-tauri/gen/ios/Assets.xcassets/LaunchScreen.storyboard`

---

## 測試和除錯

### Android 測試

```bash
# 啟動模擬器
emulator -avd Pixel_7_API_34

# 安裝並執行應用程式
cargo tauri android dev
```

### iOS 測試

```bash
# 啟動模擬器
xcrun simctl boot "iPhone 15 Pro"

# 安裝並執行應用程式
cargo tauri ios dev
```

### 除錯工具

#### Android 除錯

```bash
# 查看日誌
adb logcat | grep "PersonalFinanceManager"

# 安裝 APK 到實機
adb install path/to/app.apk
```

#### iOS 除錯

使用 Xcode Console 或 Safari 開發者工具進行除錯。

---

## 效能最佳化

### 1. 打包大小最佳化

```toml
# Cargo.toml 中設定
[profile.release]
opt-level = "s"  # 優化大小
lto = true       # 鏈接時最佳化
codegen-units = 1
panic = "abort"
strip = true     # 移除除錯符號
```

### 2. 啟動時間最佳化

- 使用 lazy loading 載入非關鍵資源
- 最佳化初始化程序
- 減少首頁資料請求

### 3. 記憶體使用最佳化

- 實作適當的快取策略
- 及時釋放不必要的資源
- 使用分頁載入大量資料

---

## 常見問題排除

### Android 常見問題

#### 問題：Gradle 建置失敗

**解決方案：**
```bash
# 清理建置快取
cd src-tauri/gen/android
./gradlew clean

# 重新建置
cargo tauri android build
```

#### 問題：權限被拒絕

**解決方案：**
確保在 `AndroidManifest.xml` 中正確聲明所需權限，並在執行時請求敏感權限。

### iOS 常見問題

#### 問題：代碼簽名失敗

**解決方案：**
1. 檢查 Apple Developer Account 狀態
2. 確認 Bundle Identifier 唯一性
3. 重新產生 Provisioning Profile

#### 問題：模擬器無法啟動

**解決方案：**
```bash
# 重置模擬器
xcrun simctl erase all

# 重新啟動模擬器
xcrun simctl boot "iPhone 15 Pro"
```

---

## 下一步

完成移動端配置後，您可以：

1. 查看[應用商店上架指南](app_store_publishing.md)
2. 設定[CI/CD 自動化部署](deployment_guide.md)
3. 進行[效能最佳化](performance_optimization.md)

## 參考資源

- [Tauri 2 官方文檔](https://v2.tauri.app/)
- [Android 開發者指南](https://developer.android.com/guide)
- [iOS 開發者指南](https://developer.apple.com/documentation/)
- [Rust 移動端開發](https://forge.rust-lang.org/infra/channel-releases.html)