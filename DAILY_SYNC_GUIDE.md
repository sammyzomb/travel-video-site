# 每日同步流程指南

## 🎯 目標
確保公司電腦和家裡電腦之間的程式碼同步，避免衝突和資料遺失。

## 📋 公司電腦設定（已完成）

### 全域 Git 設定
```bash
git config --global core.autocrlf false
git config --global core.eol lf
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### SSH 認證
- ✅ SSH 金鑰已生成
- ✅ 已添加到 GitHub
- ✅ 遠端 URL 已更改為 SSH

## 🏠 家裡電腦設定（需要執行）

### 1. 生成 SSH 金鑰
```bash
ssh-keygen -t ed25519 -C "sammyzomb@gmail.com" -f ~/.ssh/id_ed25519_github
```

### 2. 設定 SSH 配置
創建 `~/.ssh/config` 文件：
```
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/id_ed25519_github
  IdentitiesOnly yes
```

### 3. 添加 SSH 金鑰到 GitHub
- 複製 `~/.ssh/id_ed25519_github.pub` 內容
- 前往 https://github.com/settings/keys
- 添加新 SSH key（標題：家裡電腦 - 旅遊網站專案）

### 4. 設定全域 Git 配置
```bash
git config --global core.autocrlf false
git config --global core.eol lf
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### 5. 更改遠端 URL
```bash
git remote set-url origin git@github.com:sammyzomb/travel-video-site.git
```

## 🔄 每日同步流程

### 公司電腦（上班時）

#### 開始工作前：
```bash
# 1. 拉取最新版本
git pull origin main

# 2. 確認狀態
git status
```

#### 工作結束時：
```bash
# 1. 檢查變更
git status

# 2. 添加所有變更
git add .

# 3. 提交變更
git commit -m "feat: 描述您的修改內容"

# 4. 推送到 GitHub
git push origin main

# 5. 確認推送成功
git status
```

### 家裡電腦（回家後）

#### 開始工作前：
```bash
# 1. 拉取最新版本
git pull origin main

# 2. 確認狀態
git status
```

#### 工作結束時：
```bash
# 1. 檢查變更
git status

# 2. 添加所有變更
git add .

# 3. 提交變更
git commit -m "feat: 描述您的修改內容"

# 4. 推送到 GitHub
git push origin main

# 5. 確認推送成功
git status
```

## ⚠️ 注意事項

### 避免衝突的方法：
1. **每次開始工作前都要 pull**
2. **工作結束時立即 push**
3. **不要同時在兩台電腦修改同一個檔案**
4. **使用有意義的 commit 訊息**

### 如果發生衝突：
```bash
# 1. 停止當前操作
git merge --abort  # 或 git rebase --abort

# 2. 拉取最新版本
git pull origin main

# 3. 解決衝突後重新提交
git add .
git commit -m "fix: resolve merge conflicts"
git push origin main
```

### 緊急情況處理：
```bash
# 如果推送失敗，先備份
git stash

# 拉取最新版本
git pull origin main

# 恢復您的修改
git stash pop

# 重新提交
git add .
git commit -m "feat: your changes"
git push origin main
```

## 🎉 完成！

設定完成後，您就可以在公司電腦和家裡電腦之間無縫同步工作了！

### 驗證設定：
```bash
# 測試 SSH 連接
ssh -T git@github.com

# 檢查遠端 URL
git remote -v

# 檢查全域設定
git config --global --list | findstr core
```
