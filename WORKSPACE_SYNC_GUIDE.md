# 💻 工作環境同步指南

## 🎯 **適用情境**
當您需要在新電腦上繼續開發旅遊電視台網站專案時，請按照此指南同步工作環境。

## 📋 **同步前準備清單**

### **在新電腦上需要安裝的軟體**
- [ ] **Git** - 版本控制
- [ ] **Node.js** - JavaScript 運行環境（可選，用於本地測試）
- [ ] **VS Code** 或其他程式碼編輯器
- [ ] **瀏覽器** - Chrome、Firefox 等

## 🚀 **第一步：安裝必要軟體**

### **1.1 安裝 Git**
1. 前往：https://git-scm.com/downloads
2. 下載並安裝 Git for Windows
3. 安裝完成後，開啟命令提示字元或 PowerShell
4. 驗證安裝：
   ```bash
   git --version
   ```

### **1.2 安裝 Node.js（可選）**
1. 前往：https://nodejs.org/
2. 下載 LTS 版本
3. 安裝完成後驗證：
   ```bash
   node --version
   npm --version
   ```

### **1.3 安裝程式碼編輯器**
- **VS Code**：https://code.visualstudio.com/
- 或使用您偏好的編輯器

## 🔧 **第二步：設置 Git 配置**

### **2.1 配置用戶資訊**
```bash
git config --global user.name "您的姓名"
git config --global user.email "您的電子郵件"
```

### **2.2 配置認證（如果需要）**
- 如果使用 GitHub，建議設置 SSH 金鑰或使用 GitHub CLI
- 或使用個人存取權杖進行 HTTPS 認證

## 📥 **第三步：克隆專案**

### **3.1 選擇工作目錄**
```bash
# 例如在文件夾中
cd C:\Users\USER\Documents
# 或
cd D:\Projects
```

### **3.2 克隆專案**
```bash
git clone https://github.com/您的用戶名/travel-video-site.git
cd travel-video-site
```

### **3.3 驗證專案結構**
```bash
dir
# 應該看到以下檔案：
# - index.html
# - style.css
# - script.js
# - admin-login.html
# - contentful-api.js
# - CONTENTFUL_SETUP_STEPS.md
# - 等等...
```

## 🔑 **第四步：設置 Contentful 認證**

### **4.1 確認 Contentful 設定**
1. 檢查 `contentful-api.js` 檔案中的設定
2. 確認 Space ID 和 API Key 是否正確
3. 如果需要，更新認證資訊

### **4.2 測試 Contentful 連接**
開啟瀏覽器，前往：https://app.contentful.com
- 登入您的帳戶
- 確認 Space：`os5wf90ljenp` 可以正常訪問

## 🎯 **第五步：繼續開發工作**

### **5.1 查看當前進度**
```bash
git log --oneline -10
# 查看最近的提交記錄
```

### **5.2 檢查未完成的工作**
- 查看 `CONTENTFUL_SETUP_STEPS.md` 了解下一步
- 檢查 `CONTENTFUL_CONTENT_MODELS.md` 了解內容模型設計

### **5.3 開始 Contentful 設置**
按照 `CONTENTFUL_SETUP_STEPS.md` 的指南：
1. 登入 Contentful
2. 創建 4 個內容類型
3. 設置欄位和驗證規則

## 🧪 **第六步：本地測試**

### **6.1 啟動本地伺服器**
```bash
# 如果已安裝 Node.js
npx http-server

# 或使用 Python（如果已安裝）
python -m http.server 8000

# 或直接在瀏覽器中開啟 index.html
```

### **6.2 測試功能**
- 開啟 http://localhost:8080
- 測試首頁節目表功能
- 測試管理員介面
- 檢查 Contentful API 連接

## 📁 **重要檔案說明**

### **核心檔案**
- `index.html` - 首頁
- `style.css` - 樣式檔案
- `script.js` - 主要 JavaScript 功能
- `contentful-api.js` - Contentful API 整合

### **管理介面**
- `admin-login.html` - 管理員登入
- `admin-schedule.html` - 節目表管理
- `admin-calendar.html` - 月曆排程管理

### **設置指南**
- `CONTENTFUL_SETUP_STEPS.md` - 詳細設置步驟
- `CONTENTFUL_CONTENT_MODELS.md` - 內容模型設計
- `CONTENTFUL_AUTH_SETUP.md` - 認證設置

### **資料檔案**
- `schedule.json` - 節目資料
- `videos.json` - 影片資料
- `contentful_sample_data.json` - 範例資料

## 🔄 **日常同步工作流程**

### **開始工作時**
```bash
git pull origin main
# 拉取最新程式碼
```

### **完成工作時**
```bash
git add .
git commit -m "描述您的更改"
git push origin main
# 推播更改到 GitHub
```

## 🆘 **常見問題解決**

### **問題 1：Git 認證失敗**
```bash
# 設置個人存取權杖
git config --global credential.helper store
# 然後在推送時輸入用戶名和權杖
```

### **問題 2：檔案權限問題**
```bash
# Windows 上可能需要調整檔案權限
# 或使用管理員權限執行命令提示字元
```

### **問題 3：Contentful API 錯誤**
- 檢查 API Key 是否正確
- 確認 Space ID 是否正確
- 檢查網路連接

## 📞 **需要協助時**

當您在新電腦上遇到問題時，請提供：
1. 錯誤訊息截圖
2. 您正在執行的步驟
3. 系統環境資訊（作業系統版本等）

我會協助您解決問題並繼續開發工作！

---

**準備就緒！** 🚀

按照此指南，您就可以在新電腦上快速同步工作環境並繼續開發旅遊電視台網站專案。

