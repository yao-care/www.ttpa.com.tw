announcements 集合使用說明（本檔為 .txt，不會被 src/content.config.ts 的
glob({ pattern: '**/*.md' }) 收錄為集合項目，故可以留在此資料夾說明用途而不影響 build）。

用途：
  /news/ 最新消息頁採「混合式」設計——自動列出 events / courses 集合中
  featured: true 的項目，再疊加本集合（announcements）的手動公告，
  依 date 欄位合併排序。announcements 專門放「沒有對應活動/課程子頁、
  純粹公告」的消息（例如組織異動、政策說明、單純轉貼外部訊息等）。

  本次上線時協會尚未提供任何這類公告的逐字文案，因此本資料夾目前沒有
  任何 .md 項目——這是刻意留空，不是遺漏；不可自行編造公告內容。
  /news/ 頁面已確認在 announcements 為空集合時仍可正常 render
  （見 src/pages/news/index.astro）。

日後協會提供公告文案時，新增方式：
  1. 在本資料夾新增一個 .md 檔（檔名即為 slug，例如 2026-08-01-notice.md）。
  2. frontmatter 需含 schema 必要欄位（見 src/content.config.ts 的 announcements
     定義）：
       title: string
       date: 日期（機器可讀，YYYY-MM-DD，供排序用）
       summary: string
       link: string（選填，對外或站內公告連結，需為合法 URL）
       status: string（選填，狀態徽章文字，沿用全站慣例如「✅ 已結束」）
  3. 內文一律逐字轉錄協會提供的原文，不得自行增刪潤飾或摘要；
     若文案確定為逐字轉錄，記得在 frontmatter 加 sourceVerbatim: true
     以豁免 scripts/check-content.mjs 的去 AI 味掃描（此旗標僅限逐字轉錄
     使用，新寫文案不得掛）。
