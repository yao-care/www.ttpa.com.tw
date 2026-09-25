# TTPA 官網：Windows 不同帳號交接指南

本文件適用於把官網維護工作交接到另一台 Windows 電腦，以及另一個 ChatGPT／GitHub 帳號。接手者使用自己的帳號與本機資料夾；不要複製原管理者的 Codex 設定、登入狀態或權杖。

開始前先閱讀 `WEBSITE_ACCESS_SCOPE.md` 與 `COLLABORATION_POLICY.md`。本指南只移交其中列出的例行官網維護權限；Mac 與 Windows 預設可同時作業，不會因其中一方開啟 Codex 或修改其他分支而鎖住另一方。

## 1. 原管理者先完成的事項

1. 確認接手者已建立自己的 GitHub 帳號並啟用雙因素驗證。
2. 在 `yao-care/www.ttpa.com.tw` repository 邀請接手者，原則上授予 `Write` 權限，不授予 `Admin`。
3. 只把官網需要使用的 Google Drive 活動照片資料夾分享給接手者；不要分享整個個人雲端硬碟。
4. 在協會內部記錄接手者姓名、GitHub 帳號、開始日期及是否具有發布核准權。這些個資不要提交到公開 repository。
5. 不提供原管理者的 ChatGPT 密碼、GitHub token、Google 憑證、`.codex/auth.json`、SSH 私鑰或 service account 金鑰。

GitHub Pages、GitHub Actions 與 repository secrets 保存在 GitHub。接手者不需要取得 secrets，也能透過既有 Pull Request 與部署流程維護網站。

## 2. 在新 Windows 電腦安裝工具

1. 依 [OpenAI Windows 官方說明](https://learn.chatgpt.com/docs/windows/windows-app)安裝 ChatGPT 桌面應用程式，使用接手者自己的 ChatGPT 帳號登入。
2. 開啟 PowerShell，安裝 Git、Node.js LTS 與 GitHub CLI：

   ```powershell
   winget install --id Git.Git --exact
   winget install --id OpenJS.NodeJS.LTS --exact
   winget install --id GitHub.cli --exact
   ```

3. 關閉並重新開啟 PowerShell，再安裝專案指定的 pnpm：

   ```powershell
   npm install --global pnpm@10.32.1
   ```

4. 確認工具可用：

   ```powershell
   git --version
   node --version
   pnpm --version
   gh --version
   ```

   Node.js 必須符合 `package.json` 的 `>=22.12.0`，pnpm 應為 `10.32.1`。

## 3. 使用接手者自己的 GitHub 帳號

在 PowerShell 執行：

```powershell
gh auth login
gh auth setup-git
gh auth status
```

選擇 `GitHub.com`、`HTTPS`，並在瀏覽器登入接手者自己的 GitHub 帳號。不要把瀏覽器顯示的代碼、token 或密碼貼進 Codex 對話。

若尚未接受 repository 邀請，應先在 GitHub 通知或電子郵件中接受，再繼續下載專案。

## 4. 下載官網專案

專案建議放在 Windows 本機磁碟，不要把 `.git` 或 `node_modules` 放在 OneDrive、Dropbox 或其他同步資料夾。

```powershell
New-Item -ItemType Directory -Path C:\Projects -Force
Set-Location C:\Projects
git clone https://github.com/yao-care/www.ttpa.com.tw.git "TTPA官網專案"
Set-Location "C:\Projects\TTPA官網專案"
git config user.name "<接手者姓名>"
git config user.email "<接手者的 GitHub 提交信箱>"
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Setup
```

請把尖括號內容替換成接手者自己的資料，不要沿用原管理者的 Git 身分。`Setup` 應完成相依套件安裝、設計檢查、內容檢查與 Astro 正式建置。

## 5. 在 Codex 建立本機專案

1. 開啟 ChatGPT 桌面應用程式，進入 Codex。
2. 新增本機專案並選擇 `C:\Projects\TTPA官網專案` 作為主要資料夾。OpenAI 的[本機專案說明](https://learn.chatgpt.com/docs/projects)指出，主要資料夾會作為 Git 操作與 `AGENTS.md` 自動探索的基準。
3. 使用 Windows native agent 與 PowerShell；一般工作不需要以系統管理員身分啟動 ChatGPT。
4. 權限選擇 `Ask for approval`／工作區可寫入模式，不要使用 unrestricted 或 danger-full-access 作為日常設定。
5. 建立第一個任務並輸入：

   ```text
   請依 AGENTS.md、WEBSITE_ACCESS_SCOPE.md 與 WEBSITE_UPDATE_SOP.md 檢查官網接手環境。
   執行 Status 與 Setup，確認 GitHub remote、Git 身分及正式建置，但不要修改或發布網站。
   ```

Codex 會從 repository 讀取固定工作規範，不需要匯入原管理者的歷史對話。`AGENTS.md` 的自動探索方式可參考 [OpenAI 官方說明](https://learn.chatgpt.com/docs/agent-configuration/agents-md)。

## 6. 日常更新與發布

每次更新建立新的 Codex 任務，貼上：

```text
請依 WEBSITE_ACCESS_SCOPE.md 與 WEBSITE_UPDATE_SOP.md 更新協會官網。
請先同步最新版、建立 codex/ 更新分支、完成修改與本機檢查。
先不要發布，等我確認。
```

多人同時作業時，每位維護者使用自己的 `codex/日期-操作者-主題` 分支與 PR，不共用同一分支。開始前查看開啟中的 PR 與有效 `[LOCK]` 紀錄；只有依 `COLLABORATION_POLICY.md` 登記的特定範圍鎖定會暫停對應工作，其他工作仍可繼續。

固定流程：

```text
同步 main
→ 建立 codex/ 分支
→ 修改內容或頁面
→ 本機 Check 與預覽
→ 核對文字、日期、圖片與連結
→ 明確說「同意發布」
→ 推送分支並建立 Pull Request
→ 合併後由 GitHub Actions 部署
→ 驗證正式網站與 sitemap
```

禁止直接推送 `main`。每次核准只適用於當次已完成檢查的變更。

## 7. 接手驗收清單

在新電腦的專案根目錄執行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Status
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Check
git remote -v
git branch --show-current
git config --local --get user.name
git config --local --get user.email
gh auth status
```

雙方共同確認：

- `origin` 為 `https://github.com/yao-care/www.ttpa.com.tw.git`。
- 接手者使用自己的 GitHub 帳號與 Git commit 身分。
- `Check` 完整成功，正式建置頁數合理。
- Codex 能自動讀取 `AGENTS.md`、`WEBSITE_ACCESS_SCOPE.md` 與 `WEBSITE_UPDATE_SOP.md`。
- 接手者只看到經分享的 Google Drive 資料夾，無法存取原管理者的其他檔案。
- 接手者理解哪些變更可自行維護、哪些必須另行取得協會授權。
- 接手者理解預設不鎖定、獨立分支與 PR，以及如何查看或解除有效 `[LOCK]` 紀錄。
- 在完成第一次實際更新、Pull Request 與部署驗收前，原管理者先保留存取權作為回復窗口。

## 8. 人員異動或停止授權

接手者離任或不再負責網站時，協會管理者應：

1. 移除其 GitHub repository 存取權。
2. 移除相關 Google Drive 資料夾分享。
3. 檢查是否仍有未合併分支、未結案 PR 或待驗收部署。
4. 不要求對方交回個人 ChatGPT／GitHub 密碼；只撤銷協會資源的授權。
