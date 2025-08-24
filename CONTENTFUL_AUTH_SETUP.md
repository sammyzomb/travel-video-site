# 🔐 Contentful 認證整合設置指南

## 📋 **概述**
本指南將幫助您設置真正的 Contentful 用戶認證系統，讓管理員可以使用真實的 Contentful 帳號登入。

## 🎯 **目標**
- 使用真正的 Contentful 用戶帳號登入
- 根據 Contentful 中的用戶權限控制功能
- 所有操作都記錄在 Contentful 中

## 🔧 **設置步驟**

### **步驟 1：獲取 Contentful Management API Token**

1. **登入 Contentful**
   - 前往 https://app.contentful.com
   - 使用您的 Contentful 帳號登入

2. **進入 API Keys 設置**
   - 點擊左側選單的 "Settings"
   - 選擇 "API keys"
   - 點擊 "Content management tokens"

3. **創建新的 Management Token**
   - 點擊 "Generate personal token"
   - 輸入 Token 名稱：`Travel Channel Admin`
   - 選擇權限：`Content management`
   - 複製生成的 Token（格式：`CFPAT-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`）

### **步驟 2：設置用戶權限**

1. **進入用戶管理**
   - 點擊左側選單的 "Settings"
   - 選擇 "Users"

2. **邀請管理員用戶**
   - 點擊 "Invite users"
   - 輸入電子郵件地址
   - 選擇角色：
     - **Admin**：完整權限（讀取、寫入、刪除、發布）
     - **Editor**：編輯權限（讀取、寫入）
     - **Viewer**：查看權限（僅讀取）

3. **設置內容類型權限**
   - 進入 "Content model"
   - 為每個內容類型設置用戶權限

### **步驟 3：更新程式碼**

1. **更新 admin-login.html**
   - 替換模擬認證為真正的 Contentful API 調用
   - 使用 Management API 驗證用戶

2. **設置環境變數**
   ```javascript
   const CONTENTFUL_SPACE_ID = 'os5wf90ljenp';
   const CONTENTFUL_MANAGEMENT_TOKEN = 'CFPAT-your-token-here';
   ```

## 🔒 **安全注意事項**

1. **Token 安全**
   - 永遠不要在客戶端代碼中暴露 Management Token
   - 使用環境變數或後端 API 來處理認證
   - 定期更換 Token

2. **用戶權限**
   - 遵循最小權限原則
   - 定期審查用戶權限
   - 及時移除不需要的用戶

## 🚀 **實施計劃**

### **階段 1：基礎設置**
- [ ] 獲取 Management API Token
- [ ] 設置用戶權限
- [ ] 創建後端認證 API

### **階段 2：前端整合**
- [ ] 更新登入頁面
- [ ] 實現真正的用戶驗證
- [ ] 添加權限控制

### **階段 3：功能完善**
- [ ] 添加操作日誌
- [ ] 實現會話管理
- [ ] 添加雙重認證

## 📞 **需要協助？**

如果您在設置過程中遇到問題，請：
1. 檢查 Contentful 文檔：https://www.contentful.com/developers/docs/
2. 查看 API 參考：https://www.contentful.com/developers/docs/references/
3. 聯繫 Contentful 支援

---

**下一步：** 我將開始實施這些設置，並逐步更新您的系統。
