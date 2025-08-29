# GitHub 同步問題診斷與解決指南

## 問題描述
- 公司電腦可以正常同步到 GitHub
- 家裡電腦無法同步，上傳卡住
- 兩台電腦之間無法順利接續工作

## 常見原因與解決方案

### 1. 認證問題
**症狀：** 推送時卡在認證步驟
**解決方案：**
```bash
# 清除舊的認證
git config --global --unset credential.helper
git config --system --unset credential.helper

# 重新設定認證
git config --global credential.helper manager-core
```

### 2. 網路連接問題
**症狀：** 推送時網路超時
**解決方案：**
```bash
# 測試 GitHub 連接
ping github.com

# 設定更長的超時時間
git config --global http.postBuffer 524288000
git config --global http.lowSpeedLimit 0
git config --global http.lowSpeedTime 999999
```

### 3. 分支衝突問題
**症狀：** 兩台電腦有不同步的提交
**解決方案：**
```bash
# 在家裡電腦執行
git fetch origin
git status
git pull origin main

# 如果有衝突，解決後再推送
git add .
git commit -m "解決衝突"
git push origin main
```

### 4. 大型檔案問題
**症狀：** 推送大檔案時卡住
**解決方案：**
```bash
# 檢查是否有大檔案
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sed -n 's/^blob //p' | sort -nr -k 2 | head -10

# 使用 Git LFS 處理大檔案
git lfs track "*.mp4"
git lfs track "*.mov"
```

## 完整的同步工作流程

### 在公司電腦（開始工作前）
```bash
# 1. 確保是最新版本
git pull origin main

# 2. 檢查狀態
git status

# 3. 開始工作...
```

### 在公司電腦（結束工作時）
```bash
# 1. 檢查修改
git status

# 2. 添加所有修改
git add .

# 3. 提交修改
git commit -m "描述修改內容"

# 4. 推送到 GitHub
git push origin main

# 5. 確認推送成功
git log --oneline -3
```

### 在家裡電腦（開始工作前）
```bash
# 1. 拉取最新版本
git pull origin main

# 2. 檢查是否有衝突
git status

# 3. 開始工作...
```

### 在家裡電腦（結束工作時）
```bash
# 1. 檢查修改
git status

# 2. 添加所有修改
git add .

# 3. 提交修改
git commit -m "描述修改內容"

# 4. 推送到 GitHub
git push origin main
```

## 緊急恢復方案

### 如果家裡電腦無法推送
```bash
# 1. 備份當前工作
cp -r . ../backup-$(date +%Y%m%d-%H%M%S)

# 2. 重置到遠端版本
git fetch origin
git reset --hard origin/main

# 3. 手動複製修改的檔案
# 從備份資料夾複製需要的檔案

# 4. 重新提交
git add .
git commit -m "從備份恢復的修改"
git push origin main
```

### 如果公司電腦無法拉取
```bash
# 1. 備份當前工作
cp -r . ../backup-$(date +%Y%m%d-%H%M%S)

# 2. 強制拉取
git fetch origin
git reset --hard origin/main

# 3. 手動合併修改
# 從備份資料夾複製需要的檔案
```

## 預防措施

### 1. 定期同步
- 每完成一個功能就立即同步
- 不要累積太多修改再同步

### 2. 使用分支
```bash
# 創建功能分支
git checkout -b feature/new-feature

# 在分支上工作
# ...

# 合併到主分支
git checkout main
git merge feature/new-feature
git push origin main
```

### 3. 使用 Git 標籤
```bash
# 標記重要版本
git tag -a v1.0.0 -m "版本 1.0.0"
git push origin v1.0.0
```

## 聯絡資訊
如果以上方法都無法解決，請：
1. 檢查網路連接
2. 確認 GitHub 帳號權限
3. 考慮使用 SSH 金鑰認證
4. 聯繫系統管理員

## 快速診斷命令
```bash
# 檢查 Git 狀態
git status

# 檢查遠端倉庫
git remote -v

# 檢查認證
git config --list | grep credential

# 檢查網路連接
curl -I https://github.com

# 檢查分支狀態
git branch -vv
```
