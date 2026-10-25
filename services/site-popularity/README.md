# 官網人氣計數服務

- 管理帳號：`ttpa2014@gmail.com`；獨立 Apps Script 專案，與報名系統分離。
- 前台名稱：網站人氣。起始分數 2,014 為設定值，不能當作歷史實測瀏覽量或獨立訪客數。
- `Code.gs` 為部署來源；不需要 Gmail、Drive、Sheets 或 GA4 存取權。
- GET 只讀，POST 記錄一次造訪。以隨機 UUID 做 30 分鐘去重；不儲存姓名、信箱、IP、網頁路徑。
- 計數和近期去重碼存於 Script Properties，16 個分桶各最多 80 筆近期紀錄；過期碼於該桶下一次寫入清除。
- Script Lock 避免併發漏計；每桶計數與去重碼一起存檔，重試不重複增加。
- 前端僅在正式網域累加；本機只讀。儲存被封鎖時只讀，不硬造新識別碼灌入。
- 這是輕量人氣指標，非稽核流量系統。公開 API 仍可能被偽造呼叫，Origin 參數不是身分驗證；配額滿或服務異常時顯示暫時無法讀取。

## 部署

已建立專案：`1d3-qqhvostaMOVEgYXki81Qi4u8N8M9YAIkMC8eSuPWHP3zx8LG_hXsW`。
2026-10-25 首次部署 v1；公開 API 網址集中於 `src/config/site-popularity.ts`。

將 `Code.gs` 貼入上述帳號新建的獨立專案，部署為網頁應用程式，以擁有者執行，允許任何人使用（只公開計數 API）。取得 `/exec` URL 後填入 `src/config/site-popularity.ts`。勿將編輯器網址當成 API。

更新時使用同一專案與既有部署建立新版本，保留 Script Properties；不要刪除或清空 `popularity_v1_*`，不要重新建立服務以免遺失累計。

驗證：`node --test services/site-popularity/*.test.mjs`（支援 `stripTypeScriptTypes` 的 Node 版本）、`sh scripts/site.sh Check`，以及本機頁尾讀取／錯誤狀態。正式站發布需另外取得核准。
