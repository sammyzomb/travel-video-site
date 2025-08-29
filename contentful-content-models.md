# Contentful 內容模型設定指南

## 需要創建的內容類型

### 1. adminUser (管理員用戶)
**內容類型 ID:** `adminUser`

**欄位設定:**
- `email` (Text) - 用戶電子郵件
- `name` (Text) - 用戶姓名
- `role` (Text) - 用戶角色 (admin, editor, viewer)
- `passwordHash` (Text) - 密碼雜湊
- `status` (Text) - 帳號狀態 (active, inactive, suspended)
- `permissions` (Array) - 權限列表
- `avatar` (Media) - 用戶頭像
- `createdAt` (Date) - 創建時間
- `lastLogin` (Date) - 最後登入時間

**驗證規則:**
- email: 必填，唯一值
- name: 必填
- role: 必填，限制值 (admin, editor, viewer)
- status: 必填，限制值 (active, inactive, suspended)

### 2. userActivity (用戶活動記錄)
**內容類型 ID:** `userActivity`

**欄位設定:**
- `userId` (Text) - 用戶 ID
- `userEmail` (Text) - 用戶電子郵件
- `action` (Text) - 執行動作 (login, logout, create, update, delete)
- `success` (Boolean) - 是否成功
- `ipAddress` (Text) - IP 位址
- `timestamp` (Date) - 時間戳記
- `userAgent` (Text) - 瀏覽器資訊
- `details` (Text) - 詳細資訊

**驗證規則:**
- userId: 必填
- userEmail: 必填
- action: 必填
- success: 必填
- timestamp: 必填

## 設定步驟

### 步驟 1: 登入 Contentful
1. 前往 [Contentful](https://app.contentful.com)
2. 選擇您的 Space: `os5wf90ljenp`

### 步驟 2: 創建內容類型
1. 進入 **Content Model** 頁面
2. 點擊 **Add content type**
3. 創建 `adminUser` 內容類型
4. 添加所有必要欄位
5. 設定驗證規則
6. 發布內容類型

### 步驟 3: 創建用戶活動記錄類型
1. 創建 `userActivity` 內容類型
2. 添加所有必要欄位
3. 設定驗證規則
4. 發布內容類型

### 步驟 4: 設定 Management API Token
1. 進入 **Settings** > **API keys**
2. 創建新的 **Management API token**
3. 設定適當的權限
4. 複製 token 並安全保存

### 步驟 5: 創建初始管理員用戶
使用 Management API 創建第一個管理員用戶：

```javascript
// 在 Contentful 中手動創建或使用 API
{
  "email": "admin@travelchannel.com",
  "name": "系統管理員",
  "role": "admin",
  "passwordHash": "secure_password_hash",
  "status": "active",
  "permissions": ["read", "write", "delete", "publish", "manage_users"],
  "createdAt": "2025-08-28T10:35:00.000Z"
}
```

## 權限設定

### 角色權限對照表

| 角色 | 權限 | 說明 |
|------|------|------|
| admin | read, write, delete, publish, manage_users | 完全管理權限 |
| editor | read, write | 可以讀取和編輯內容 |
| viewer | read | 只能查看內容 |

### 功能權限

- `read`: 查看節目、排程、歸檔
- `write`: 創建和編輯節目
- `delete`: 刪除節目和內容
- `publish`: 發布內容
- `manage_users`: 管理用戶帳號

## 安全注意事項

1. **Management Token 安全**
   - 不要在客戶端代碼中暴露 Management Token
   - 使用環境變數或後端 API 來處理敏感操作

2. **密碼安全**
   - 實際部署時應使用 bcrypt 等加密庫
   - 定期更新密碼雜湊

3. **IP 記錄**
   - 記錄用戶登入 IP 用於安全監控
   - 可設定異常 IP 登入警報

4. **活動記錄**
   - 記錄所有重要操作
   - 定期檢查異常活動

## 部署檢查清單

- [ ] Contentful 內容類型已創建
- [ ] Management API Token 已設定
- [ ] 初始管理員用戶已創建
- [ ] 測試帳號已移除
- [ ] 權限驗證已測試
- [ ] 活動記錄功能已測試
- [ ] 錯誤處理已完善
