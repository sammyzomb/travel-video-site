# 硬編碼管理員系統使用指南

## 📋 系統概述

這是一個簡化的管理員系統，使用瀏覽器的 `sessionStorage` 來儲存用戶資料，不需要依賴 Contentful 或其他外部服務。適合快速測試和開發環境使用。

## 🔐 系統特點

- **簡單易用**：不需要複雜的資料庫設定
- **即時生效**：所有操作立即生效，無需等待同步
- **離線可用**：完全在瀏覽器中運行
- **安全代碼保護**：創建最高管理者需要安全代碼

## 👑 用戶角色

### 最高管理者 (super_admin)
- 擁有所有權限
- 可以創建其他管理員
- 可以管理所有用戶
- 系統中只能有一個最高管理者

### 管理員 (admin)
- 擁有節目管理權限
- 可以管理節目表和歸檔
- 由最高管理者創建

### 編輯者 (editor)
- 可以編輯節目內容
- 權限較為有限

### 檢視者 (viewer)
- 只能檢視內容
- 無法進行編輯操作

## 🚀 使用流程

### 1. 創建最高管理者

1. 訪問 `create-super-admin-simple.html`
2. 填寫以下資訊：
   - **電子郵件**：`sammyzomb@gmail.com`（已預設，不可修改）
   - **姓名**：您的姓名
   - **密碼**：`Ddpeacemisb@`（已預設，不可修改）
   - **確認密碼**：`Ddpeacemisb@`（已預設，不可修改）
   - **安全代碼**：輸入 `SUPER_ADMIN_2024`
3. 點擊「創建最高管理者」
4. 系統會將資料儲存到瀏覽器的 sessionStorage 中

**注意**：您也可以直接使用預設帳號登入，系統會自動創建最高管理者帳號。

### 2. 登入系統

1. 訪問 `admin-login.html`
2. 使用以下預設帳號登入：
   - **電子郵件**：`sammyzomb@gmail.com`
   - **密碼**：`Ddpeacemisb@`
3. 系統會自動驗證硬編碼的用戶資料

### 3. 創建其他管理員

1. 以最高管理者身份登入後，在主控台會看到「👤 創建管理員」按鈕
2. 點擊按鈕進入創建頁面
3. 填寫新管理員的資訊：
   - **電子郵件**：使用者的電子郵件地址
   - **姓名**：使用者姓名
   - **角色**：選擇管理員、編輯者或檢視者
   - **密碼**：8碼密碼（必須包含大小寫字母、數字和特殊字符）
   - **確認密碼**：再次輸入相同密碼
   - **權限設定**：選擇適當的權限
4. 點擊「創建管理員」
5. 系統會驗證密碼強度並檢查電子郵件是否重複

### 4. 管理用戶

1. 在主控台點擊「用戶管理」模組
2. 可以查看所有用戶的資訊，包括：
   - 基本資料（姓名、電子郵件、角色）
   - 狀態和創建時間
   - 最後登入時間和 IP 地址
3. 可以刪除一般管理員（無法刪除最高管理者）
4. 查看用戶統計資料

## 🔧 技術細節

### 資料儲存
- **最高管理者**：儲存在 `sessionStorage.superAdmin`
- **一般管理員**：儲存在 `sessionStorage.admins`（陣列）
- **當前登入用戶**：儲存在 `sessionStorage.adminUser`
- **登入時間**：儲存在 `sessionStorage.loginTime`

### 安全性
- 密碼以明文儲存（僅用於開發測試）
- 會話有效期為8小時
- 安全代碼保護最高管理者創建
- 防止暴力破解：5次失敗嘗試後鎖定15分鐘
- 基本輸入驗證
- 登入失敗計數器
- 密碼強度驗證（8碼以上，包含大小寫字母、數字、特殊字符）
- 電子郵件重複檢查
- IP 地址記錄：記錄用戶最後登入的 IP 地址

### 資料格式
```javascript
// 最高管理者格式
{
  id: 'super-admin-001',
  email: 'sammyzomb@gmail.com',
  name: '管理員姓名',
  password: 'Ddpeacemisb@',
  role: 'super_admin',
  permissions: ['all'],
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLogin: '2025-01-01T00:00:00.000Z',
  lastLoginIP: '192.168.1.100'
}

// 一般管理員格式
{
  id: 'admin-1234567890',
  email: 'user@example.com',
  name: '用戶姓名',
  password: '密碼',
  role: 'admin',
  permissions: ['programs', 'schedule', 'archive'],
  status: 'active',
  createdAt: '2025-01-01T00:00:00.000Z',
  lastLogin: null,
  lastLoginIP: null
}
```

## 📁 檔案結構

```
├── create-super-admin-simple.html    # 創建最高管理者
├── create-admin-simple.html          # 創建一般管理員
├── admin-login.html                  # 登入頁面
├── admin-dashboard.html              # 主控台
├── admin-users-simple.html           # 用戶管理
└── HARDCODED_ADMIN_GUIDE.md         # 本說明文件
```

## ⚠️ 注意事項

1. **資料持久性**：資料只存在於瀏覽器的 sessionStorage 中，關閉瀏覽器或清除資料會遺失所有用戶資料
2. **安全性**：此系統僅適用於開發和測試環境，不建議用於生產環境
3. **備份**：如果需要保留用戶資料，建議定期備份 sessionStorage 的內容
4. **瀏覽器限制**：不同瀏覽器或無痕模式會隔離 sessionStorage

## 🔄 重置系統

如果需要重置系統，可以：

1. 清除瀏覽器的 sessionStorage：
   ```javascript
   sessionStorage.clear();
   ```

2. 或者只清除特定項目：
   ```javascript
   sessionStorage.removeItem('superAdmin');
   sessionStorage.removeItem('admins');
   sessionStorage.removeItem('adminUser');
   sessionStorage.removeItem('loginTime');
   ```

## 🆘 故障排除

### 無法創建最高管理者
- 檢查安全代碼是否正確（SUPER_ADMIN_2024）
- 確認密碼符合要求
- 檢查瀏覽器是否支援 sessionStorage

### 無法登入
- 確認用戶資料已正確創建
- 檢查電子郵件和密碼是否正確
- 確認會話未過期（8小時內）
- 檢查是否被鎖定（5次失敗後會鎖定15分鐘）
- 確認輸入完整的登入資訊

### 看不到創建管理員按鈕
- 確認當前登入用戶是最高管理者（role: 'super_admin'）
- 重新登入系統

### 用戶資料遺失
- 檢查是否清除了瀏覽器資料
- 確認沒有使用無痕模式
- 重新創建用戶資料

## 📞 支援

如有問題，請檢查：
1. 瀏覽器控制台的錯誤訊息
2. sessionStorage 中的資料是否正確
3. 網路連線是否正常（雖然不需要外部服務，但某些功能可能會有網路請求）
