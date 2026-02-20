# Supabase Phone Auth 設定檢查清單

## 問題：收到 SMS 但驗證失敗

如果你在 Twilio 測試中可以收到訊息，但透過 Supabase 發送時有問題，請依序檢查以下設定：

---

## 1. Supabase Dashboard 設定檢查

### A. 啟用 Phone Auth
1. 進入 Supabase Dashboard: https://app.supabase.com
2. 選擇你的專案
3. 左側選單 → **Authentication** → **Providers**
4. 找到 **Phone** 並啟用（切換開關為 ON）

### B. 設定 Twilio
1. 在 **Phone** 設定區域
2. 填入 Twilio 憑證：
   - **Twilio Account SID** (格式: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx)
   - **Twilio Auth Token**
   - **Twilio Phone Number** (格式: +1234567890)

3. **重要：確認 Twilio 帳號狀態**
   - 試用帳號只能發送到已驗證的號碼
   - 升級到付費帳號才能發送到任何號碼

### C. 設定 SMS 模板（可選）
1. Authentication → **Email Templates** → 切換到 **SMS Messages**
2. 自訂 SMS 訊息模板
3. 預設模板：`Your verification code is {{ .Token }}`

---

## 2. Twilio 設定檢查

### A. 帳號狀態
登入 Twilio Console: https://console.twilio.com

**試用帳號限制：**
- 只能發送到已驗證的號碼（Verified Caller IDs）
- 所有訊息前會加上 "Sent from your Twilio trial account"

**解決方法：**
1. **驗證測試號碼**：
   - Twilio Console → Phone Numbers → Verified Caller IDs
   - 點擊 "+" 新增號碼
   - 輸入手機號碼並驗證

2. **升級帳號**（推薦）：
   - Twilio Console → Billing
   - 升級到付費帳號（通常需要充值至少 $20 USD）

### B. 檢查 Twilio 服務設定
1. Twilio Console → Messaging → Services
2. 確認 Messaging Service SID（如果使用）
3. 檢查 Phone Number 是否已連結到服務

### C. 地區限制
1. Twilio Console → Settings → Geo Permissions
2. 確認目標國家/地區已啟用（例如：Hong Kong, Taiwan）

---

## 3. 手機號碼格式檢查

### 正確格式範例
```
香港：+852 9xxx xxxx
台灣：+886 9xx xxx xxx
中國：+86 1xx xxxx xxxx
```

### 在程式中輸入
- 必須包含國碼（+）
- 無空格或特殊符號
- 範例：`+85298765432`

---

## 4. 測試流程

### 步驟 1：開啟瀏覽器 Console
1. 打開網站並登入
2. 按 F12 開啟開發者工具
3. 切換到 **Console** 標籤

### 步驟 2：嘗試發送 OTP
1. 在個人檔案頁面輸入手機號碼（正確格式）
2. 點擊「發送驗證碼」
3. 查看 Console 的日誌輸出：
   ```
   發送 OTP 至: +85298765432
   OTP 發送回應: { data: {...}, error: null }
   OTP 發送成功
   ```

### 步驟 3：檢查錯誤訊息
如果發送失敗，Console 會顯示詳細錯誤：
```
OTP 發送錯誤詳情: { message: "...", status: 400 }
```

**常見錯誤：**

| 錯誤訊息 | 原因 | 解決方法 |
|---------|------|---------|
| `Phone provider not configured` | Twilio 未設定 | 在 Supabase Dashboard 設定 Twilio 憑證 |
| `Invalid phone number` | 號碼格式錯誤 | 使用國際格式 +國碼+號碼 |
| `Twilio error 21211` | 號碼未驗證（試用帳號） | 在 Twilio 驗證號碼或升級帳號 |
| `Twilio error 21608` | 號碼不存在 | 檢查號碼是否正確 |
| `Twilio error 21610` | 地區限制 | 在 Twilio Geo Permissions 啟用目標地區 |

---

## 5. 驗證 OTP 失敗排查

### 常見問題
1. **OTP 過期**
   - Supabase OTP 預設有效期：60 秒
   - 超時需重新發送

2. **號碼不匹配**
   - 確認發送和驗證時使用相同的號碼格式

3. **OTP 輸入錯誤**
   - 確認是 6 位數字
   - 無空格或其他字元

---

## 6. 快速測試方法

### 使用 Supabase SQL Editor 檢查
1. Dashboard → SQL Editor
2. 執行查詢檢查 Phone Auth 設定：
   ```sql
   SELECT * FROM auth.users WHERE phone IS NOT NULL;
   ```

3. 檢查是否有手機驗證記錄

---

## 7. 開發環境建議

### 本地測試替代方案
如果不想使用付費 SMS 服務，可以：

1. **使用 Email OTP**（已內建，免費）
2. **Supabase Local Dev**：
   - 使用本地 Inbucket 接收測試訊息
   - 不會真的發送 SMS

3. **Mock Phone Auth**（開發環境）：
   - 建立測試用的假驗證流程
   - 跳過實際 SMS 發送

---

## 8. 檢查清單總結

- [ ] Supabase Phone Auth 已啟用
- [ ] Twilio 憑證已正確填入
- [ ] Twilio 帳號狀態（試用 vs 付費）
- [ ] 測試號碼已在 Twilio 驗證（試用帳號）
- [ ] 目標地區在 Twilio Geo Permissions 已啟用
- [ ] 手機號碼格式正確（+國碼）
- [ ] 瀏覽器 Console 無錯誤訊息
- [ ] 環境變數 `.env.local` 已設定且正確

---

## 需要協助？

如果完成以上檢查後仍有問題，請提供：
1. 瀏覽器 Console 的完整錯誤訊息
2. 使用的手機號碼格式（遮蔽部分數字）
3. Twilio 帳號狀態（試用/付費）
4. 目標發送地區（香港/台灣/其他）
