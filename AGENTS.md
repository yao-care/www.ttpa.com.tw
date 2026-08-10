# TTPA 官網 Codex 工作規範

本專案是台灣藥學發展協會官網。與使用者溝通時使用繁體中文，並以
`WEBSITE_UPDATE_SOP.md` 為標準更新流程。

## 開始工作前

1. 確認目前工作目錄是本 repository 根目錄。
2. 先讀取 `WEBSITE_UPDATE_SOP.md`、`package.json` 與相關頁面或內容檔案。
3. 執行：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Status
   ```

4. 若需要同步遠端最新版，必須先確認工作樹乾淨，再執行：

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Sync
   ```

5. 除非使用者明確要求，禁止直接修改或推送 `main`；使用 `codex/` 前綴建立更新分支。

## 修改規則

- 活動、課程與公告優先修改 `src/content/` 內的 Markdown。
- 一般頁面修改 `src/pages/`；共用版型修改 `src/components/` 或 `src/layouts/`。
- 圖片放在 `public/img/`，不要引用不受控的外部圖片網址。
- 保留既有正式網址、slug、GA4、GSC、CNAME 與部署設定，除非使用者明確要求變更。
- 遵守既有設計 token；不要加入 `!important` 或任意散落的 CSS 規則。
- 不要將密碼、token、Google service account 或其他秘密提交到 Git。

## 完成修改後

必須執行完整檢查：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/site.ps1 Check
```

向使用者回報：

- 修改了哪些頁面或內容。
- 檢查與建置是否成功。
- 是否有尚待確認的文案、日期、連結或圖片。
- 目前尚未發布，或已依使用者明確批准完成發布。

未獲使用者明確批准，不得 push、建立 PR、合併 PR 或觸發正式網站部署。
