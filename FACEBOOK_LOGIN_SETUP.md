# Facebook Login 設定指南

本指南將幫助你整合 Facebook Login 到 Supabase 應用程式。

---

## 📋 總覽

已完成的程式碼更新：
- ✅ 登入頁面加入 Facebook 登入按鈕
- ✅ 註冊頁面加入 Facebook 註冊按鈕
- ✅ 整合 Supabase Auth Facebook Provider

---

## 🚀 設定步驟

### 步驟 1：建立 Facebook App

1. **前往 Facebook Developers**
   - 訪問：https://developers.facebook.com
   - 使用你的 Facebook 帳號登入

2. **建立新應用程式**
   - 點擊右上角 **My Apps** → **Create App**
   - 選擇應用程式類型：**Consumer**（消費者）
   - 點擊 **Next**

3. **填寫應用程式資訊**
   - **App name**：`Easy Maid`（或你的應用程式名稱）
   - **App contact email**：你的 Email
   - 點擊 **Create app**

4. **驗證身份**
   - 可能需要輸入 Facebook 密碼確認

---

### 步驟 2：設定 Facebook Login

1. **加入 Facebook Login 產品**
   - 在應用程式儀表板
   - 找到 **Add Products to Your App**
   - 找到 **Facebook Login** 並點擊 **Set Up**

2. **選擇平台**
   - 選擇 **Web**
   - **Site URL**：`http://localhost:3000`（開發環境）
   - 點擊 **Save** 並 **Continue**

3. **取得 App ID 和 App Secret**
   - 左側選單 → **Settings** → **Basic**
   - 複製以下資訊：
     - **App ID**：`1234567890123456`（16 位數字）
     - **App Secret**：點擊 **Show** 按鈕，複製密鑰

---

### 步驟 3：設定 OAuth 重新導向 URI

1. **取得 Supabase 回調 URL**
   - 登入 Supabase Dashboard：https://app.supabase.com
   - 選擇你的專案
   - 左側選單 → **Authentication** → **URL Configuration**
   - 複製 **Site URL**，格式類似：
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```

2. **在 Facebook 設定回調 URL**
   - 回到 Facebook Developers
   - 左側選單 → **Facebook Login** → **Settings**
   - 找到 **Valid OAuth Redirect URIs**
   - 加入以下 URL：
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     http://localhost:3000/profile
     ```
   - 點擊 **Save Changes**

---

### 步驟 4：在 Supabase 啟用 Facebook Provider

1. **開啟 Supabase Dashboard**
   - 前往：https://app.supabase.com
   - 選擇你的專案

2. **啟用 Facebook Provider**
   - 左側選單 → **Authentication** → **Providers**
   - 找到 **Facebook** 並點擊啟用開關

3. **填入 Facebook 憑證**
   ```
   Facebook App ID: 1234567890123456
   Facebook App Secret: xxxxxxxxxxxxxxxxxxxxxxxx
   ```

4. **設定權限（可選）**
   - **Authorized Client IDs**：留空（預設）
   - 點擊 **Save** 儲存設定

---

### 步驟 5：設定應用程式網域

1. **回到 Facebook Developers**
   - 左側選單 → **Settings** → **Basic**

2. **加入應用程式網域**
   - 找到 **App Domains**
   - 加入：
     ```
     localhost
     your-project-ref.supabase.co
     ```

3. **設定隱私政策和服務條款（上線前必填）**
   - **Privacy Policy URL**：你的隱私政策網址
   - **Terms of Service URL**：你的服務條款網址

4. **點擊 Save Changes**

---

### 步驟 6：測試 Facebook Login

1. **啟動開發伺服器**
   ```powershell
   npm run dev
   ```

2. **測試登入**
   - 訪問：http://localhost:3000/signin
   - 點擊「使用 Facebook 登入」按鈕
   - 會跳轉到 Facebook 授權頁面
   - 授權後會重新導向回你的應用程式

3. **測試註冊**
   - 訪問：http://localhost:3000/signup
   - 點擊「使用 Facebook 註冊」按鈕

---

## ⚠️ 開發模式限制

### Facebook App 開發模式

新建立的 Facebook App 預設在**開發模式**：
- ✅ 你（App 管理員）可以正常登入
- ❌ 其他用戶無法使用 Facebook 登入
- ⚠️ 每個 App 最多只能加入 **5 個測試用戶**

### 加入測試用戶

1. Facebook Developers → **Roles** → **Test Users**
2. 點擊 **Add** 建立測試用戶
3. 或在 **Roles** → **Roles** 加入其他 Facebook 帳號為測試者

---

## 🚢 上線設定

### 將 App 切換到正式環境

1. **完成所有必填項目**
   - App Icon（1024x1024 像素）
   - Privacy Policy URL
   - Terms of Service URL
   - App Category

2. **提交 App Review（如果需要額外權限）**
   - 預設權限：`public_profile` 和 `email` 不需要審核
   - 如需其他權限（如 `user_friends`），需提交審核

3. **切換到 Live 模式**
   - 左側選單 → **Settings** → **Basic**
   - 找到 **App Mode** 開關
   - 將 **Development** 切換為 **Live**

4. **更新生產環境 URL**
   - **App Domains**：加入你的正式網域
   - **Valid OAuth Redirect URIs**：加入正式網域的回調 URL

---

## 🔍 常見問題

### 1. 無法登入，顯示 "URL Blocked"

**原因：** Facebook 的 Valid OAuth Redirect URIs 未正確設定

**解決：**
1. 檢查 Supabase Dashboard → Authentication → URL Configuration
2. 複製完整的回調 URL
3. 在 Facebook Developers → Facebook Login → Settings 加入此 URL

---

### 2. 顯示 "App Not Setup"

**原因：** Facebook App Secret 未填入或錯誤

**解決：**
1. Facebook Developers → Settings → Basic
2. 點擊 App Secret 旁的 **Show** 按鈕
3. 重新複製並貼到 Supabase Dashboard

---

### 3. 登入後沒有跳轉

**原因：** Redirect URL 設定錯誤

**解決：**
1. 檢查程式碼中的 `redirectTo`：
   ```typescript
   redirectTo: `${window.location.origin}/profile`
   ```
2. 確認 Supabase Dashboard → Authentication → URL Configuration
3. **Site URL** 設定為：`http://localhost:3000`

---

### 4. 其他人無法使用 Facebook 登入

**原因：** App 仍在開發模式

**解決：**
- 將用戶加入 Roles → Test Users
- 或將 App 切換到 Live 模式（需完成所有必填項目）

---

### 5. 開發環境和生產環境切換

**開發環境：**
```
App Domains: localhost
Valid OAuth Redirect URIs: 
  - http://localhost:3000/profile
  - https://your-project-ref.supabase.co/auth/v1/callback
```

**生產環境：**
```
App Domains: 
  - yourdomain.com
  - your-project-ref.supabase.co
Valid OAuth Redirect URIs: 
  - https://yourdomain.com/profile
  - https://your-project-ref.supabase.co/auth/v1/callback
```

---

## 📊 測試檢查清單

- [ ] Facebook App 已建立
- [ ] App ID 和 App Secret 已複製
- [ ] Facebook Login 產品已加入
- [ ] Valid OAuth Redirect URIs 已設定
- [ ] App Domains 已填寫
- [ ] Supabase Facebook Provider 已啟用
- [ ] App ID 和 Secret 已填入 Supabase
- [ ] 測試登入功能正常
- [ ] 測試註冊功能正常
- [ ] 登入後正確跳轉到 /profile

---

## 🎯 下一步

1. **測試登入流程**
   - 使用你的 Facebook 帳號測試登入
   - 檢查是否能正確跳轉到個人檔案頁

2. **加入測試用戶**
   - 讓團隊成員或測試人員加入測試

3. **準備上線**
   - 設定隱私政策和服務條款
   - 準備 App Icon
   - 將 App 切換到 Live 模式

---

## 📚 相關文件

- [Supabase Auth with Facebook](https://supabase.com/docs/guides/auth/social-login/auth-facebook)
- [Facebook Login for the Web](https://developers.facebook.com/docs/facebook-login/web)
- [Facebook App Development](https://developers.facebook.com/docs/development)

---

需要協助？請提供：
1. 錯誤訊息截圖
2. Facebook App 設定截圖（隱藏敏感資訊）
3. 瀏覽器 Console 的錯誤日誌
