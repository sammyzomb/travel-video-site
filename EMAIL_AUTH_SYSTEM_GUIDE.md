# 📧 電子郵件認證系統完整指南

## 🎯 系統概述

本系統為航向世界旅遊頻道節目管理系統提供完整的電子郵件認證和密碼重置功能，包含最高管理者權限控制機制。

## 🔐 核心功能

### 1. **電子郵件驗證**
- ✅ 註冊時自動發送驗證郵件
- ✅ 點擊郵件連結完成帳號啟用
- ✅ 24小時驗證連結有效期
- ✅ 未驗證用戶無法登入系統

### 2. **密碼重置**
- ✅ 忘記密碼時發送重置郵件
- ✅ 點擊郵件連結重置密碼
- ✅ 1小時重置連結有效期
- ✅ 強密碼驗證機制

### 3. **超級管理員權限**
- ✅ 系統最高權限控制
- ✅ 只能創建一個超級管理員
- ✅ 安全驗證碼保護
- ✅ 只能由超級管理員創建其他管理員

## 📁 文件結構

```
├── email-verification-system.js    # 核心認證系統
├── verify-email.html              # 電子郵件驗證頁面
├── reset-password.html            # 密碼重置頁面
├── create-super-admin.html        # 超級管理員創建頁面
├── admin-login.html               # 更新後的登入頁面
└── EMAIL_AUTH_SYSTEM_GUIDE.md     # 本說明文件
```

## 🚀 使用流程

### 步驟 1：創建超級管理員

1. **訪問超級管理員創建頁面**
   ```
   http://your-domain.com/create-super-admin.html
   ```

2. **填寫必要資訊**
   - 電子郵件地址
   - 姓名
   - 強密碼（符合安全要求）
   - 安全驗證碼：`SUPER_ADMIN_2024`

3. **完成創建**
   - 系統自動發送驗證郵件
   - 檢查電子郵件並點擊驗證連結
   - 帳號啟用完成

### 步驟 2：創建一般管理員

1. **超級管理員登入系統**
2. **訪問管理員創建頁面**
   ```
   http://your-domain.com/create-admin-user.html
   ```
3. **填寫管理員資訊**
4. **完成創建和驗證**

### 步驟 3：用戶登入

1. **訪問登入頁面**
   ```
   http://your-domain.com/admin-login.html
   ```

2. **輸入帳號密碼**
   - 只有已驗證的用戶才能登入
   - 未驗證用戶會收到提示

3. **忘記密碼處理**
   - 點擊「忘記密碼？」
   - 輸入電子郵件地址
   - 接收重置郵件
   - 點擊連結重置密碼

## 🔧 技術實現

### 核心類別：EmailVerificationSystem

```javascript
class EmailVerificationSystem {
  // 生成驗證令牌
  generateVerificationToken()
  
  // 生成重置令牌
  generateResetToken()
  
  // 發送驗證郵件
  sendVerificationEmail(email, name, verificationToken)
  
  // 發送密碼重置郵件
  sendPasswordResetEmail(email, name, resetToken)
  
  // 創建用戶（包含郵件驗證）
  createUser(userData)
  
  // 驗證電子郵件
  verifyEmail(token, email)
  
  // 請求密碼重置
  requestPasswordReset(email)
  
  // 重置密碼
  resetPassword(token, email, newPassword)
  
  // 創建超級管理員
  createSuperAdmin(userData)
  
  // 創建一般管理員
  createAdminBySuperAdmin(superAdminId, userData)
}
```

### Contentful 內容模型更新

需要在 Contentful 中為 `adminUser` 內容類型添加以下欄位：

| 欄位名稱 | 類型 | 說明 |
|---------|------|------|
| `verificationToken` | Text | 電子郵件驗證令牌 |
| `verificationExpiry` | Date | 驗證令牌過期時間 |
| `isEmailVerified` | Boolean | 電子郵件是否已驗證 |
| `resetToken` | Text | 密碼重置令牌 |
| `resetExpiry` | Date | 重置令牌過期時間 |
| `status` | Text | 用戶狀態（pending_verification/active/inactive） |

## 📧 郵件發送設定

### 方案 1：EmailJS（推薦）

1. **註冊 EmailJS 帳號**
   - 訪問 https://www.emailjs.com/
   - 創建免費帳號

2. **設定郵件服務**
   - 添加 Gmail 或其他郵件服務
   - 創建郵件模板

3. **更新程式碼**
   ```javascript
   // 在 email-verification-system.js 中
   await emailjs.send('service_id', 'template_id', emailContent);
   ```

### 方案 2：模擬發送（開發測試）

目前系統使用模擬發送，會在 Console 中顯示郵件內容和連結：

```javascript
console.log('模擬發送驗證郵件:', email);
console.log('驗證連結:', verificationLink);
```

## 🔒 安全機制

### 1. **密碼安全**
- 最少 8 個字元
- 必須包含大寫字母
- 必須包含小寫字母
- 必須包含數字
- 必須包含特殊符號 (!@#$%^&*)

### 2. **令牌安全**
- 驗證令牌：24小時有效期
- 重置令牌：1小時有效期
- 使用隨機生成的安全令牌

### 3. **權限控制**
- 超級管理員：系統最高權限
- 一般管理員：由超級管理員創建
- 用戶狀態驗證：只有已驗證用戶可登入

## 🛠️ 部署步驟

### 1. **更新 Contentful 內容模型**

在 Contentful 中為 `adminUser` 內容類型添加新欄位：

1. 登入 Contentful
2. 進入 Content Model
3. 編輯 `adminUser` 內容類型
4. 添加上述欄位

### 2. **設定郵件服務**

選擇並設定郵件發送服務：

- **EmailJS**（推薦用於生產環境）
- **SendGrid**
- **AWS SES**
- **自建郵件服務器**

### 3. **更新程式碼**

根據選擇的郵件服務更新 `email-verification-system.js` 中的發送邏輯。

### 4. **測試系統**

1. 創建超級管理員
2. 測試電子郵件驗證
3. 測試密碼重置功能
4. 測試權限控制

## 🚨 重要注意事項

### 1. **超級管理員安全**
- 安全驗證碼：`SUPER_ADMIN_2024`
- 只能創建一個超級管理員
- 請在安全環境中操作

### 2. **郵件發送**
- 確保郵件服務正常運作
- 檢查垃圾郵件夾
- 設定適當的發送限制

### 3. **令牌管理**
- 定期清理過期令牌
- 監控令牌使用情況
- 設定適當的過期時間

### 4. **備份和恢復**
- 定期備份用戶資料
- 建立恢復程序
- 測試備份完整性

## 🔍 故障排除

### 常見問題

1. **郵件未收到**
   - 檢查垃圾郵件夾
   - 確認郵件服務設定
   - 檢查電子郵件地址

2. **驗證連結無效**
   - 檢查連結是否過期
   - 確認令牌正確性
   - 檢查 URL 參數

3. **密碼重置失敗**
   - 確認重置令牌未過期
   - 檢查密碼強度要求
   - 確認電子郵件地址

4. **權限問題**
   - 確認用戶狀態為 active
   - 檢查電子郵件是否已驗證
   - 確認角色權限設定

## 📞 技術支援

如需技術支援，請：

1. 檢查 Console 錯誤訊息
2. 確認 Contentful 設定
3. 驗證郵件服務狀態
4. 檢查網路連線

---

**版本**：v1.0.0  
**更新日期**：2024年8月28日  
**作者**：航向世界旅遊頻道技術團隊
