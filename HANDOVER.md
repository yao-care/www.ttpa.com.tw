# 交接：www.ttpa.com.tw（臺灣遠距藥事照護協會官網）

最後更新：2026-08-06　建站 session：2026-07-28 ~ 08-01　網域／數據 session：2026-08-06
先讀 `CLAUDE.md`（技術棧、設計／內容守門、內容轉錄規矩、協會正式用語對照），本檔只記「還沒完成的事」。

## 現況（已完成，不必重做）

- 站已上線於自訂網域：<https://www.ttpa.com.tw/>（2026-08-06 由 project pages 轉入，無 `base`）
- **18 個路由**全部實測 200、sitemap 18 筆、CI 五 job（build 含雙守門 → deploy → verify → indexnow → notify-failure）全綠
- 內容 100% 來自協會舊 Google Sites（19 頁擷取 → 建站 → 三輪獨立驗收 → 依協會正式回覆 A1–A11 更新）
- 圖片 29 → 23 張全部自託管於 `public/img/`（移除主題專欄後刪掉 6 張），**站內零外連圖片**
- 憑證已備妥：`~/.config/ttpa/ga4-sa.json`（= 共用服務帳號 `ga4-insights@yaocare.iam.gserviceaccount.com`）、`~/.config/ttpa/slack-bot-token`（bot `claude-helper`）

⚠ **`.source/` 不在 git 內**（`.gitignore`），只存在這台主機：裡面是 19 頁原站擷取檔、三份驗收報告、資訊架構提案 `_ia-plan.md`、協會問答清冊 `_questions-for-ttpa.md`。**動內容前先讀 `_questions-for-ttpa.md`**，它記錄了每一項的協會正式答覆與處理方式。這批檔遺失＝失去內容溯源能力，別刪。

## ✅ 已結案：轉自訂網域（2026-08-06）

協會已在 GoDaddy 設妥 www CNAME → `yao-care.github.io.`、apex A ×4 / AAAA ×4、apex 驗證 TXT。這邊已完成 commit `f90ce3b`：`public/CNAME`、Pages API `PUT cname`、`https_enforced=true`、`astro.config.mjs` 移除 `base`（`BASE=''`）、robots.txt Sitemap 行、workflow `SITE_URL`。
實測（獨立於 CI）：18 URL 全 200、20 張圖片全 200、憑證 Let's Encrypt `CN=www.ttpa.com.tw`、apex 與舊 github.io 網址皆 301 到新網域且**保留路徑**、IndexNow 回 202。
現況查法：`gh api repos/yao-care/www.ttpa.com.tw/pages --jq '{cname,html_url,https_enforced}'`。

## ✅ 已結案：Slack 告警（2026-08-06）

頻道 `遠距藥事照護-ttpa`（ID `C0BNATKCV6Z`）已建，`SLACK_BOT_TOKEN`／`SLACK_CHANNEL_ID` 兩個 repo secrets 已設。查法：`gh secret list -R yao-care/www.ttpa.com.tw`。
⚠ **尚未實地觸發過一次失敗**驗證訊息真的送得到頻道——bot token 缺 scope，`site-preflight` 的頻道檢查跑不動（`missing_scope`）。下次 CI 真的 fail 時留意有沒有收到。

## ✅ 已結案：GA4（2026-08-06）

埋碼：`G-FREG5F9T0G` 在 `src/layouts/BaseLayout.astro`，18 頁全覆蓋、上線實測 gtag 已輸出。用 `set:html` 而非 `define:vars`（後者會把腳本包進 IIFE，`gtag` 就不是全域函式，日後加自訂事件會炸）。僅 `import.meta.env.PROD` 輸出，`pnpm dev` 不送；但 `pnpm preview` 是 PROD 建置，預覽的 localhost 造訪會進 GA4。

服務帳號權限已由協會開通。**數字 property ID＝`548816103`**（顯示名 `ttpa.com.tw`，帳戶 `ttpa.com.tw`）。
⚠ 該串流的「網站網址」設為 `https://ttpa.com.tw`（apex），與正式網址 `https://www.ttpa.com.tw` 不一致——apex 會 301 到 www 所以不影響收數，但要對齊的話在 GA4 串流設定改。
查法：`node /root/seo-ops/bin/site-preflight.mjs --domain www.ttpa.com.tw --repo /root/www.ttpa.com.tw --channel "遠距藥事照護-ttpa"`（第 3 段）。

## ✅ 已結案：GSC（2026-08-06）

網域資源 `sc-domain:ttpa.com.tw` 已建（apex TXT `google-site-verification=0A0i…p8Y` 驗證），服務帳號權限 **`siteFullUser`**。
sitemap 已提交：`https://www.ttpa.com.tw/sitemap-index.xml`，讀回 `isPending=false`、`isSitemapsIndex=true`、warnings 0 / errors 0。
指令（已裝 `google-auth-library` devDependency）：
`GSC_SA_KEY=~/.config/ttpa/ga4-sa.json GSC_SITE='sc-domain:ttpa.com.tw' SITE_URL='https://www.ttpa.com.tw' node scripts/gsc-submit-sitemap.mjs`

📌 **修正一則舊記載**：`scripts/gsc-submit-sitemap.mjs` 註解與本檔舊版都寫「需 GSC 資源**擁有者**」，2026-08-06 實測 **`siteFullUser` 即可提交成功（HTTP 204）**，不必擁有者。

⚠ GSC sitemap 清單裡另有一筆**舊 Google Sites 時代的殘留**：`https://www.ttpa.com.tw/首頁`，2025-12-09 提交、帶 1 個 error。屬協會資源上的既有資料，未經指示未刪除。

## 待辦 1：納入 seo-ops 三主層

`node /root/seo-ops/bin/site-preflight.mjs --domain www.ttpa.com.tw --repo /root/www.ttpa.com.tw --channel "遠距藥事照護-ttpa"` **2026-08-06 實跑：5 項過 4 項**，唯一 ✗ 是下面那段的金鑰共用（MAINTENANCE.md 要求 exit 0 才納管）。
納管時可直接沿用 preflight 末行帶出的 config：`ga4PropertyId=548816103`、`gscSiteUrl=sc-domain:ttpa.com.tw`、`saKeyFile=/root/.config/ttpa/ga4-sa.json`、`tokenFile=/root/.config/ttpa/slack-bot-token`、`repo=/root/www.ttpa.com.tw`。
照 `/root/seo-ops/MAINTENANCE.md`（單一真實來源）做：`playbooks/ttpa.md`（reflect/brain scope 互斥、不得空 scope）、`sites/ttpa.json`（gates 必含 `pnpm build`，設完真的 `eval` 跑一次）、掛 `/etc/cron.d/seo-ops`、跑 `node /root/seo-ops/bin/scope-review.mjs` 覆核，並同步更新 seo-ops README／MAINTENANCE 交接清單（主機紅線）。

### 附帶：服務帳號金鑰共用（資安衛生，不緊急、不擋上線）

`~/.config/ttpa/ga4-sa.json` 與另外 10 個站是**同一把**金鑰（preflight 每次都會報）。要拆的話是在協會自己的 Google 帳號下建 GCP 專案＋SA、下載新金鑰覆蓋該檔，再用 `node /root/seo-ops/bin/identity-audit.mjs --sa ~/.config/ttpa/ga4-sa.json --expect-only ttpa.com.tw` 驗到 exit 0。**這不是 SEO 手段、與站間評價無關**（主機 CLAUDE.md 紅線），純粹是縮小爆炸半徑。

## 協會端仍未結案的內容問題

| # | 狀態 |
|---|---|
| A3 | 「115年3月AI高校系列初階課程」舊子頁協會已刪，僅存在 `/events/` 存檔區文字。協會說「可評估未來接上新公告」＝**未來有新公告時再處理** |
| A4 | 「歷史訊息資料庫」協會**尚未建置**；日後要做時需協會提供歷年成果內容 |
| A5 | 存檔公告中「時間：108年10月26日」與該則 112／113 年主體矛盾，**協會找不到出處**，現況照原文保留、未加註 |

其餘 A1／A2／A6–A11、B1／B2／B4 皆已結案，處理方式見 `.source/_questions-for-ttpa.md` 的「已回覆並處理」表。

## 這站特有、容易踩的地雷

1. **`sourceVerbatim: true` 只准掛逐字轉錄檔**。獨立驗收就是靠「逐檔比對旗標檔是否真的出自 `.source`」抓到一個被夾帶的自創欄位（`status: 🚀 熱烈招募中`，原檔根本沒有 status，且課程已過期五週卻顯示招募中）。新站自行判斷的欄位要在檔內註明依據。
2. **導覽下拉的父層是 `<summary>` 不是連結**，所以每個下拉第一項是「⋯總覽」指回列表頁。移掉它 `/events/`、`/courses/` 會變成沒有入口的孤兒頁（複驗抓到過）。
3. **不要改網址 slug**（例如把 `/charter/` 改成 `/organization-charter/`）。協會把章程正式名稱定為「組織章程」時，只改顯示文字、網址維持 `/charter/`。
4. **舊站用詞已被協會更正**（遠距醫療→遠距藥事、門前健診→線上用藥照護、慢性處方管理系統→慢性病用藥管理及健康諮詢系統、高校→高效）。寫新內容用正確用語；`.source/` 裡是舊詞，**別照抄回去**。對照表在 `CLAUDE.md`。
5. **這站的服務帳號是全平台共用的那一把**（`ga4-insights@yaocare`，對 9 個網域是 GSC 擁有者）。相關爆炸半徑與盤點工具見 `/root/CLAUDE.md` 紅線段與 `/root/seo-ops/notes/identity-migration.md`。

## 低優先未修

- `src/pages/news/index.astro:9` 註解提到的檔名 `kaohsiung-4th-cohort-workshop.md` 與實際檔案 `zuoying-hospital-workshop.md` 不符（純註解，不影響功能）
