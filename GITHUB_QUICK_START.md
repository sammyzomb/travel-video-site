# GitHub 快速開始指南

## 🎯 為什麼選擇 GitHub？

- ✅ **專業版本控制** - 追蹤每次修改
- ✅ **自動同步** - 兩台電腦輕鬆同步
- ✅ **安全備份** - 程式碼安全儲存在雲端
- ✅ **免費使用** - 個人專案完全免費
- ✅ **未來擴展** - 可以與團隊協作

## 🚀 5分鐘快速設定

### 第一步：建立 GitHub 帳號（如果還沒有的話）

1. 前往 [GitHub.com](https://github.com)
2. 點擊 "Sign up"
3. 填寫基本資料
4. 驗證電子郵件

### 第二步：建立新的儲存庫

1. 登入 GitHub
2. 點擊右上角 "+" → "New repository"
3. 填寫資料：
   - **Repository name**: `travel-video-site`
   - **Description**: `航向世界旅遊頻道網站`
   - **選擇**: Public（公開）
   - **不要勾選** "Add a README file"
4. 點擊 "Create repository"

### 第三步：上傳您的專案

在您目前的電腦上執行以下指令：

```bash
# 1. 進入專案資料夾
cd C:\Users\USER\Documents\TV.TCAWG.COM\travel-video-site

# 2. 初始化 Git
git init

# 3. 添加所有檔案
git add .

# 4. 提交變更
git commit -m "初始版本：旅遊頻道網站完成"

# 5. 添加遠端儲存庫（替換 YOUR_USERNAME 為您的 GitHub 帳號）
git remote add origin https://github.com/YOUR_USERNAME/travel-video-site.git

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```

### 第四步：在工作電腦下載

在工作電腦上執行：

```bash
# 1. 複製專案
git clone https://github.com/YOUR_USERNAME/travel-video-site.git

# 2. 進入專案資料夾
cd travel-video-site

# 3. 啟動網站
python -m http.server 8000
```

## 🔄 日常同步流程

### 下班前（目前電腦）：
```bash
git add .
git commit -m "更新描述：做了什麼修改"
git push
```

### 上班時（工作電腦）：
```bash
git pull
```

## 📋 重要檔案清單

確保以下檔案都已上傳：

### 核心檔案
- [ ] `index.html` - 主頁面
- [ ] `script.js` - 主要 JavaScript
- [ ] `style.css` - 樣式表
- [ ] `schedule.json` - 節目表資料

### 管理後台
- [ ] `admin-login.html` - 登入頁面
- [ ] `admin-dashboard.html` - 管理儀表板
- [ ] `admin-schedule.html` - 節目表管理
- [ ] `admin-calendar.html` - 月曆節目管理

### 設定檔案
- [ ] `contentful-api.js` - Contentful API
- [ ] `PROJECT_CONTEXT.md` - 專案說明
- [ ] 所有 `.md` 說明檔案

## 🚨 注意事項

### 不要上傳的檔案：
- [ ] 包含密碼的檔案
- [ ] API 金鑰（如果有的話）
- [ ] 個人測試檔案

### 安全提醒：
- 檢查 `contentful-api.js` 中是否有敏感資訊
- 確認沒有硬編碼的密碼
- 使用環境變數管理敏感資料

## 🎯 成功標準

當您看到以下畫面時，表示設定成功：

✅ **GitHub 儲存庫**：可以看到所有專案檔案  
✅ **工作電腦**：可以成功下載並啟動網站  
✅ **同步測試**：修改檔案後可以成功同步  

## 📞 遇到問題？

### 常見問題：

1. **Git 指令錯誤**
   - 確認已安裝 Git
   - 檢查網路連線
   - 確認 GitHub 帳號權限

2. **檔案上傳失敗**
   - 檢查檔案權限
   - 確認檔案路徑正確
   - 檢查檔案大小

3. **同步衝突**
   - 先 `git pull` 再 `git push`
   - 解決衝突後重新提交

## 🔧 工作電腦設定

### 必要軟體：
- [ ] Python 3.x
- [ ] Git
- [ ] 網頁瀏覽器

### 測試步驟：
1. [ ] 下載專案：`git clone`
2. [ ] 啟動網站：`python -m http.server 8000`
3. [ ] 測試功能：訪問 `http://localhost:8000`
4. [ ] 測試管理後台
5. [ ] 測試節目管理功能

---

**開始使用 GitHub 吧！** 🚀 這是最專業的解決方案。
