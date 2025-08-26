# 明天到公司電腦的完整操作指南

## 🎯 明天到公司電腦後，請按照以下步驟操作：

### 第一步：安裝必要軟體

#### 1. 安裝 Python
- 前往 [Python.org](https://www.python.org/downloads/)
- 下載最新版本的 Python 3.x
- 安裝時記得勾選 "Add Python to PATH"

#### 2. 安裝 Git
- 前往 [Git-scm.com](https://git-scm.com/downloads)
- 下載並安裝 Git for Windows
- 使用預設設定即可

#### 3. 安裝 Cursor
- 前往 [Cursor.sh](https://cursor.sh/)
- 下載並安裝 Cursor 編輯器

### 第二步：下載專案

#### 1. 開啟命令提示字元或 PowerShell
- 按 `Win + R`，輸入 `cmd` 或 `powershell`
- 按 Enter

#### 2. 導航到工作資料夾
```bash
cd C:\Users\YOUR_USERNAME\Documents
```

#### 3. 複製專案
```bash
git clone https://github.com/YOUR_USERNAME/travel-video-site.git
```

#### 4. 進入專案資料夾
```bash
cd travel-video-site
```

### 第三步：啟動網站

#### 1. 啟動本地伺服器
```bash
python -m http.server 8000
```

#### 2. 開啟瀏覽器
- 開啟 Chrome 或 Firefox
- 訪問：`http://localhost:8000`

#### 3. 測試主頁面
- 確認旅遊頻道標題正常顯示
- 確認今日節目表正常顯示
- 確認台灣時間正常顯示

### 第四步：測試管理後台

#### 1. 訪問管理登入頁面
- 在瀏覽器中訪問：`http://localhost:8000/admin-login.html`

#### 2. 登入測試
- 帳號：`admin`
- 密碼：`password123`
- 確認可以成功登入並看到管理儀表板

#### 3. 測試節目表管理
- 點擊「📋 節目表管理」
- 確認可以添加新節目
- 確認表單功能正常

#### 4. 測試月曆節目管理
- 點擊「🗓️ 月曆節目管理」
- 確認月曆只顯示今天開始的日期
- 確認過去日期不顯示
- 測試歷史搜尋功能

### 第五步：在 Cursor 中建立上下文

#### 1. 開啟 Cursor
- 開啟 Cursor 編輯器
- 選擇「Open Folder」
- 選擇 `travel-video-site` 資料夾

#### 2. 在 Cursor 中描述專案
複製以下文字到 Cursor 中：

> "我正在開發一個旅遊頻道網站，使用 HTML/CSS/JavaScript。專案已經上傳到 GitHub，請查看 `PROJECT_CONTEXT.md` 和 `DEVELOPMENT_NOTES.md` 檔案了解詳細資訊。
> 
> 主要功能：
> - 主頁面顯示今日節目表
> - 管理後台登入系統
> - 節目表管理功能
> - 月曆節目管理（只顯示今天開始的日期）
> - 歷史搜尋功能
> 
> 最近修改：完成月曆系統改善，過去日期完全不顯示，只能通過歷史搜尋查看。
> 
> 技術架構：
> - 前端：HTML5, CSS3, JavaScript ES6+
> - 本地伺服器：Python HTTP Server
> - 資料儲存：localStorage
> - 內容管理：Contentful CMS
> - 版本控制：GitHub"

### 第六步：查看專案文件

#### 1. 查看專案說明
```bash
cat PROJECT_CONTEXT.md
```

#### 2. 查看開發筆記
```bash
cat DEVELOPMENT_NOTES.md
```

#### 3. 查看同步指南
```bash
cat GITHUB_CURSOR_SYNC.md
```

## 📋 檢查清單

### 安裝檢查
- [ ] Python 3.x 已安裝
- [ ] Git 已安裝
- [ ] Cursor 已安裝

### 專案檢查
- [ ] 專案已成功下載
- [ ] 網站可以正常啟動
- [ ] 主頁面正常顯示
- [ ] 管理後台可以登入
- [ ] 節目表管理功能正常
- [ ] 月曆節目管理功能正常
- [ ] 歷史搜尋功能正常

### Cursor 檢查
- [ ] Cursor 可以開啟專案資料夾
- [ ] 專案上下文已建立
- [ ] AI 可以理解專案背景

## 🚨 如果遇到問題

### 網站無法啟動
- 檢查 Python 是否正確安裝
- 確認埠號 8000 沒有被占用
- 嘗試使用其他埠號：`python -m http.server 8080`

### 管理後台無法登入
- 確認帳號密碼正確
- 檢查瀏覽器控制台是否有錯誤
- 確認所有檔案都已下載

### Cursor 無法理解專案
- 提供更多專案背景
- 參考 `PROJECT_CONTEXT.md` 檔案
- 描述具體功能需求

### Git 下載失敗
- 檢查網路連線
- 確認 GitHub 儲存庫網址正確
- 確認有權限訪問儲存庫

## 🔄 日常同步流程

### 開始工作時：
```bash
git pull
```

### 結束工作時：
```bash
git add .
git commit -m "更新描述：做了什麼修改"
git push
```

## 📞 緊急聯絡

如果遇到無法解決的問題，請：
1. 查看相關的 `.md` 說明檔案
2. 檢查程式碼註解
3. 參考 GitHub Issues
4. 記錄問題以便後續解決

---

**祝您明天工作順利！** 🚀

**記住：所有專案文件都在 GitHub 上，您可以隨時查看 `PROJECT_CONTEXT.md` 了解專案狀態。**
