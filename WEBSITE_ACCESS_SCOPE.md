# TTPA 官網維護權限範圍

本文件定義「協會指定網站維護者」可交接的工作範圍。目的在於延續既有官網維護能力，同時避免把個人帳號、機密憑證或其他系統管理權一併轉交。

## 1. 可移交的例行維護權限

經協會指定的網站維護者可執行：

- 讀取官網 repository 與歷史提交。
- 更新公告、活動、課程、成果、協會介紹、會員資訊及一般頁面文案。
- 調整既有網站 UI／UX、導覽列、頁尾、響應式版面與無障礙呈現。
- 將協會提供且已確認可使用的圖片放入 `public/img/`。
- 在本機執行安裝、開發預覽、設計檢查、內容檢查及 Astro 正式建置。
- 同步 `origin/main`，建立 `codex/` 更新分支並提交變更。
- 推送更新分支、建立 Pull Request，依 SOP 留下可稽核的修改紀錄。
- 在當次任務收到協會指定發布核准者的明確「同意發布」後，合併已檢查的 Pull Request，觸發既有 GitHub Actions 部署。
- 檢查 GitHub Actions、正式網站頁面及 sitemap 是否正常。

## 2. 不包含在交接中的權限

除非協會另行明確書面授權，網站維護者不得：

- 直接推送或強制推送 `main`，或繞過 Pull Request 流程。
- 變更 repository 所有權、可見性、名稱、刪除／封存狀態、協作者或組織設定。
- 修改 branch protection、GitHub Pages 網域、Actions workflow 權限或 repository secrets。
- 變更 GoDaddy 或其他 DNS、網域註冊、憑證及郵件相關設定。
- 變更 GA4、Google Search Console、IndexNow 或其他分析／搜尋服務的擁有者、權限、追蹤 ID 或服務帳號。
- 取得或複製原管理者的 ChatGPT、GitHub、Google、Slack、OneDrive 或其他個人帳號登入資料。
- 取得 `.codex/auth.json`、Personal Access Token、Google service account 金鑰、Slack token、SSH 私鑰或任何密碼檔。
- 代表協會新增法律聲明、隱私政策、收費條款、付款流程或其他超出既有網站維護範圍的制度性內容。
- 刪除 Git 歷史、正式網站資料或無法復原的大量內容。

## 3. 發布核准規則

- 修改完成後必須執行 `scripts/site.ps1 Check`（Windows）或 `scripts/site.sh Check`（macOS／Linux）。
- 預覽與檢查完成前不得發布。
- Codex 只有在當次任務收到協會指定發布核准者清楚表達「同意發布」後，才可 push、建立或合併 PR、觸發部署。
- 核准只適用於當次已說明並完成檢查的變更，不自動延伸到其他頁面、外部服務或日後變更。
- 若變更涉及本文件第 2 節，必須停止並由協會管理者另行決定。

## 4. 多人協作與鎖定權限

- Mac 與 Windows 維護者預設可同時作業；任何一方正在使用 Codex、建立分支或開啟 PR，都不會自動鎖住另一方。
- 每位維護者必須使用自己的本機 clone、GitHub 帳號、`codex/` 分支與 PR，並遵守 `COLLABORATION_POLICY.md`。
- 任一已授權維護者可要求鎖定與其任務直接相關的特定頁面、檔案、發布動作或外部服務；鎖定不得擴張本文件授予的權限。
- 鎖定只有在雙方可見的 GitHub 紀錄中寫明範圍、提出者、開始時間及解除條件或截止時間後才生效；未列入的工作仍可繼續。
- 全站、所有發布或帳號管理權的全面鎖定，必須由協會指定管理者明確核准。

## 5. 帳號與稽核原則

- 接手者使用自己的 ChatGPT、GitHub 與 Google 帳號，不共用原管理者帳號。
- Git commit 使用接手者自己的姓名與 GitHub 提交信箱，保留可追溯性。
- GitHub 原則上只授予此 repository 的 `Write` 權限；不要授予組織或 repository `Admin` 權限。
- Google Drive 僅逐一分享官網需要的特定資料夾，依工作需要授予檢視者或編輯者；不要分享整個個人雲端硬碟。
- GitHub Pages、Actions 與 secrets 留在 GitHub，不下載、不轉寄，也不複製到新電腦。
- 接手者停止工作時，協會管理者應移除其 GitHub repository 存取權與相關 Google Drive 分享權。

## 6. 發生異常時

- 發現未預期變更、秘密檔案、陌生 remote、建置失敗或正式站錯誤時，立即停止發布。
- 不使用 `git reset --hard`、強制推送或刪除歷史處理事故。
- 已發布的錯誤使用 revert Pull Request 回復，並保留處理紀錄。
- 權限或責任範圍不明時，先向協會指定管理者確認，不自行擴大權限。
