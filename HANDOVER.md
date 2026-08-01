# 交接：www.ttpa.com.tw（臺灣遠距藥事照護協會官網）

最後更新：2026-08-01　建站 session：2026-07-28 ~ 08-01
先讀 `CLAUDE.md`（技術棧、設計／內容守門、內容轉錄規矩、協會正式用語對照），本檔只記「還沒完成的事」。

## 現況（已完成，不必重做）

- 站已上線：<https://yao-care.github.io/www.ttpa.com.tw/>（GitHub Pages project pages，`base=/www.ttpa.com.tw`）
- **18 個路由**全部實測 200、sitemap 18 筆、CI 五 job（build 含雙守門 → deploy → verify → indexnow → notify-failure）全綠
- 內容 100% 來自協會舊 Google Sites（19 頁擷取 → 建站 → 三輪獨立驗收 → 依協會正式回覆 A1–A11 更新）
- 圖片 29 → 23 張全部自託管於 `public/img/`（移除主題專欄後刪掉 6 張），**站內零外連圖片**
- 憑證已備妥：`~/.config/ttpa/ga4-sa.json`（= 共用服務帳號 `ga4-insights@yaocare.iam.gserviceaccount.com`）、`~/.config/ttpa/slack-bot-token`（bot `claude-helper`）

⚠ **`.source/` 不在 git 內**（`.gitignore`），只存在這台主機：裡面是 19 頁原站擷取檔、三份驗收報告、資訊架構提案 `_ia-plan.md`、協會問答清冊 `_questions-for-ttpa.md`。**動內容前先讀 `_questions-for-ttpa.md`**，它記錄了每一項的協會正式答覆與處理方式。這批檔遺失＝失去內容溯源能力，別刪。

## 待辦 1：轉自訂網域 www.ttpa.com.tw（⛔ 等客戶確定，用戶已明講）

DNS 記錄已於 2026-07-30 交付用戶（www CNAME → `yao-care.github.io.`；apex A 185.199.108–111.153；選配 AAAA 2606:50c0:8000–8003::153）。**用戶回報 DNS 已設**之後，這邊要做：

1. `printf 'www.ttpa.com.tw' > public/CNAME`
2. `gh api -X PUT repos/yao-care/www.ttpa.com.tw/pages -f cname=www.ttpa.com.tw`（**必做**——artifact 裡的 CNAME 不會自動生效，是 deploy-pages 的已知坑）
3. `astro.config.mjs`：`site` 改 `https://www.ttpa.com.tw`、**移除 `base`**；`BASE` 常數與 remark plugin（`remarkContentImageBase`）要跟著改成根路徑（該 plugin 負責把集合 md 內文的相對圖片路徑補上 base，改錯會全站破圖）
4. `public/robots.txt` 的 `Sitemap:` 行、`.github/workflows/deploy.yml` 的 `SITE_URL` 一起換成新網域
5. `pnpm build` → push → `gh run watch` → 實測 18 個網址在新網域回 200、HTTPS 憑證已簽發（`curl -sI https://www.ttpa.com.tw/` 不報憑證錯）
6. 舊 Pages 網址會 301 到新網域，**GSC／IndexNow 收錄要重來**，轉完記得重送 IndexNow 並在 GSC 重新提交 sitemap

## 待辦 2：GA4（⛔ 等用戶給評量 ID）

- 用戶要建 GA4 資源＋網站串流，把 `G-XXXXXXXXXX` 給你 → 埋進 `src/layouts/BaseLayout.astro`（全站共用，一次覆蓋 18 頁）
- 設計守門的「禁外部 CDN」規則只擋 fonts.googleapis/gstatic、cdnjs、unpkg、jsdelivr，**googletagmanager 不在黑名單**，埋 gtag 不會被擋（實測過規則內容，未實測埋碼）
- 用戶要在 GA4「管理 → 資源存取管理」把 `ga4-insights@yaocare.iam.gserviceaccount.com` 加為**檢視者**以上

## 待辦 3：GSC（⛔ 依賴待辦 1）

- **現在掛在 `yao-care.github.io` 子路徑，只能用「網址前置字元資源」**（HTML 檔或 GA4 代碼驗證）；轉自訂網域後才能建 `sc-domain:ttpa.com.tw` 網域資源（DNS TXT 驗證，TXT 值由 GSC 產生、我方無法代生）
- 用戶要把上述服務帳號加為**擁有者**
- 之後手動提交一次 sitemap：`GSC_SA_KEY=~/.config/ttpa/ga4-sa.json GSC_SITE='sc-domain:ttpa.com.tw' SITE_URL='https://www.ttpa.com.tw' node scripts/gsc-submit-sitemap.mjs`（需 `pnpm add -D google-auth-library`）

## 待辦 4：Slack 頻道（⛔ 等用戶建頻道）

- 頻道名（用戶指定）：`遠距藥事照護-ttpa`；2026-07-28 搜過工作區**尚不存在**
- 用戶建好並邀 `claude-helper` 進去後，把頻道 ID 給你 → 設 repo secrets：
  `gh secret set SLACK_BOT_TOKEN -R yao-care/www.ttpa.com.tw --body "$(cat ~/.config/ttpa/slack-bot-token)"`、
  `gh secret set SLACK_CHANNEL_ID -R yao-care/www.ttpa.com.tw --body "<C 開頭頻道 ID>"`
- 沒設 secrets 時 `notify-failure` job 會靜默略過＝**CI 失敗目前沒有人會被通知**

## 待辦 5：納入 seo-ops 三主層（⛔ 依賴待辦 2–4）

前提是 `node /root/seo-ops/bin/site-preflight.mjs --domain www.ttpa.com.tw --repo /root/www.ttpa.com.tw --channel "遠距藥事照護-ttpa"` 跑到 exit 0。
**2026-07-29 實跑結果：5 項過 3 項**（repo ✓／SA 金鑰 ✓／Slack token ✓；GA4 ✗ 找不到含 ttpa 的資源、GSC ✗ 看不到資源）。
全綠後照 `/root/seo-ops/MAINTENANCE.md`（單一真實來源）做：`playbooks/ttpa.md`（reflect/brain scope 互斥、不得空 scope）、`sites/ttpa.json`（gates 必含 `pnpm build`，設完真的 `eval` 跑一次）、掛 `/etc/cron.d/seo-ops`、跑 `node /root/seo-ops/bin/scope-review.mjs` 覆核，並同步更新 seo-ops README／MAINTENANCE 交接清單（主機紅線）。

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
