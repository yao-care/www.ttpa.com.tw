# 台灣藥學發展協會官網更新 SOP

本文件是透過 Codex 維護 `https://www.ttpa.com.tw` 的固定流程。

## 0. 只需設定一次

官網 repository 的本機位置：

```text
C:\Users\ray96\Documents\Codex\2026-08-10\https-github-com-yao-care-www\work\www.ttpa.com.tw
```

在 Codex 建立或開啟任務時，請直接選擇上述 `www.ttpa.com.tw` 資料夾作為專案，
不要選擇它上層的 `https-github-com-yao-care-www` 資料夾。

首次開啟專案後，在 Codex 對話中輸入：

```text
請依 WEBSITE_UPDATE_SOP.md 檢查官網環境，完成 setup，但不要修改或發布網站。
```

Codex 會執行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Setup
```

## 1. 每次更新的固定開場

在相同的 Codex 官網專案中建立新任務，貼上以下格式：

```text
請依 WEBSITE_UPDATE_SOP.md 更新協會官網。

更新類型：公告／活動／課程／一般頁面
標題：
日期：
要顯示的內容：
連結：
圖片：已附上／沒有圖片

請先同步最新版、建立 codex/ 更新分支、完成修改與本機檢查。
先不要發布，等我確認。
```

若只是修改錯字，也可直接說：

```text
請依 WEBSITE_UPDATE_SOP.md，把「舊文字」改成「新文字」。
完成檢查後先不要發布，等我確認。
```

## 2. Codex 應執行的更新流程

1. 確認 Git 狀態與目前分支。
2. 在工作樹乾淨時同步 `origin/main`。
3. 建立 `codex/日期-主題` 分支。
4. 找到正確的內容或頁面檔案並修改。
5. 需要圖片時放入 `public/img/`，並使用網站內部路徑。
6. 執行完整檢查與 Astro 正式建置。
7. 彙整修改摘要與待確認項目。
8. 停在本機，不發布，等待使用者確認。

## 3. 使用者確認內容

確認下列項目：

- 標題、日期、時間與地點正確。
- 人名、單位名稱與聯絡資訊正確。
- 報名或外部連結可以使用。
- 圖片沒有裁切錯誤、個資或版權問題。
- 手機與桌面版內容都合理。

如果需要修正，直接在同一任務說明；Codex 會修改後重新檢查。

## 4. 核准發布

內容確認無誤後，輸入：

```text
內容確認無誤，同意發布。請提交目前變更、推送更新分支並建立 Pull Request；
不要直接推送 main。建立完成後把 PR 摘要告訴我。
```

PR 合併到 `main` 後，GitHub Actions 會自動：

1. 安裝套件。
2. 執行設計與內容檢查。
3. 建置 Astro 網站。
4. 部署至 GitHub Pages。
5. 驗證 sitemap 中的正式網址。

正式網站：`https://www.ttpa.com.tw`

## 5. 發布後驗收

PR 合併後，在同一任務輸入：

```text
請檢查這次官網部署是否成功，並驗證更新頁面在正式網站可以正常開啟。
```

驗收至少包含：

- GitHub Actions 部署成功。
- 正式頁面回傳成功狀態。
- 新文案、日期、圖片與連結正確。
- sitemap 仍可存取。

## 6. 常用內容位置

| 更新類型 | 主要位置 |
|---|---|
| 最新消息／公告 | `src/content/announcements/`、`src/pages/news/` |
| 活動 | `src/content/events/` |
| 課程 | `src/content/courses/` |
| 一般頁面 | `src/pages/` |
| 導覽列與頁尾 | `src/components/Header.astro`、`src/components/Footer.astro` |
| 圖片 | `public/img/` |
| 全站樣式 | `src/styles/` |

## 7. 固定工具指令

一般情況不需要手動輸入，Codex 會替你執行。

```powershell
# 首次安裝或依賴更新
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Setup

# 查看目前狀態
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Status

# 工作樹乾淨時同步 main
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Sync

# 完整檢查與正式建置
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Check

# 啟動本機開發預覽
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Dev

# 預覽正式建置結果
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Preview
```

## 8. 異常處理

- 如果 GitHub 或 npm 要求登入：只在官方登入頁完成，不要把 token 貼進對話。
- 如果工作樹不是乾淨狀態：不要強制覆蓋，先請 Codex 說明現有變更。
- 如果建置失敗：不得發布，先修復後重新執行 `Check`。
- 如果正式網站內容錯誤：立即告訴 Codex「停止後續發布並回復上一版」，使用 revert PR 處理。
- 不要直接在 GitHub 網頁編輯 `main`，也不要手動修改 GitHub Pages 產物。

## 最短版流程

```text
開啟 www.ttpa.com.tw 專案
→ 告訴 Codex 更新內容
→ Codex 同步、建立分支、修改、檢查
→ 你確認畫面與文字
→ 明確說「同意發布」
→ Codex 推送分支並建立 PR
→ 合併 PR 後自動部署
→ Codex 驗收正式網站
```
