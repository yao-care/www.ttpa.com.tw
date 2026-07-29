# www.ttpa.com.tw — 臺灣遠距藥事照護協會官網

## 技術棧

- Astro 7（靜態輸出）+ @astrojs/sitemap，pnpm 10 / Node 22
- 部署：GitHub Actions → GitHub Pages（yao-care/www.ttpa.com.tw）
- 正式網址：<https://yao-care.github.io/www.ttpa.com.tw/>（project pages，`base = /www.ttpa.com.tw`）

⚠ 有 `base` 子路徑：站內連結、圖片、資源一律用 `import.meta.env.BASE_URL` 組，**不要硬編 `/xxx`**——這是 project pages 最常見的斷鏈坑。

## 設計規範（`pnpm check:design` 守門，違規 CI 直接擋）

1. 禁 px 字級，一律用 `var(--text-*)` 階梯（最小 18px，內文不小於 `--text-base`）
2. 顏色只准寫在 `src/styles/variables.css`（oklch 為準、hex fallback），元件只用 `var(--color-*)`
3. 禁 `!important`
4. 禁外部 CDN（字型自託管或系統堆疊）
5. `src/` 下的 `.css` 只准 `src/styles/{variables,global}.css`，元件樣式寫 scoped `<style>`
6. `--text-*` token 值一律 ≥18px（`clamp()` 以最小值計）

品牌色取自協會 logo 藥丸圖標 `#54a795`：`--color-brand` 是 logo 原色（只用於色塊圖形，對白底 2.86:1 不足以承載文字），文字與連結用加深的 `--color-primary` `#1d6c5d`（6.26:1）、hover 用 `--color-primary-dark`；CTA 用 `--color-accent` `#b2511e`（5.14:1）。

## 內容來源與轉錄規矩（最重要）

全站文案**逐字轉錄自協會原有 Google Sites 站**（<https://sites.google.com/view/ttpas13/>），擷取檔在 `.source/`（19 頁，未進 git，見 `.gitignore`）：

- **不得自行發明、潤飾、摘要或補充文案**。原站沒有的資訊（例如協會地址）就留白並標註，不要生。
- 原站自身的瑕疵照抄不修：章程第 21 條子項缺「五」、章程頁 h1 寫「組織章程」但導覽叫「協會章程」、最新消息有一則連到從未存在的子頁（死連結，新站未複製該按鈕）。
- 民國年照原文保留，不換算西元。
- 集合 md 的 frontmatter 掛 `sourceVerbatim: true` 可豁免 AI 腔守門——**只准用於逐字轉錄**，新寫的文案掛這個旗標等於自廢守門。狀態欄位（`status`）這類「新站自行判斷」的值不算轉錄，要在檔內註明依據。
- 圖片一律自託管於 `public/img/`（29 張，含 7 張需用 Playwright 攔 response 才拿得到的 Google Sites 代理圖），**不要引入外連圖片**。

`src/content/` 三個集合：`events`（4 場活動）、`courses`（2 門課）、`announcements`（手動公告）。`/news/` 是混合式：自動列出 `featured` 的活動與課程，加上 announcements，依日期合併排序。已結束的活動與課程保留並標「✅ 已結束」徽章。

導覽下拉的父層是 `<summary>` 不是連結，所以每個下拉的第一項是「⋯總覽」指回列表頁——移除它會讓 `/events/`、`/courses/` 變成沒有入口的孤兒頁。

## 協會正式用語對照

原站轉錄內容中協會指出有 4 組舊用詞需更正為正式用語；**新寫文案一律用正確用語**。`.source/` 保留舊站原文存證不修改。

| 舊站用詞（逐字轉錄，現已更正） | 正式用語 | 說明 |
|---|---|---|
| 遠距醫療 | 遠距藥事 | 協會服務領域，強調藥事而非醫療 |
| 門前健診 | 線上用藥照護 | 居家／社區用藥服務模式 |
| 慢性處方管理系統 | 慢性病用藥管理及健康諮詢系統 | 完整系統名稱，含諮詢功能 |
| 高校（如「AI高校系列課程」） | 高效 | 課程品牌名改為「AI高效系列」 |

2026-07-28 完成全站替換，11 處「遠距醫療」→「遠距藥事」、1 處「門前健診」→「線上用藥照護」、1 處「慢性處方管理系統」→「慢性病用藥管理及健康諮詢系統」、4 處「高校」→「高效」。

## 內容規範（`pnpm check:content` 守門）

`src/**/*.md(x)` 掃去 AI 味句型：ERROR 級單一命中即擋（「不是X而是Y」「不僅…更」「值得注意的是」「隨著…的發展」、模糊引用…），WARN 級單檔跨 ≥3 層才升級成 ERROR。預設只掃相對 `origin/main` 的變動檔；`pnpm check:content:all` 做全站普查。

## 常用指令

```bash
pnpm dev            # 本地開發
pnpm build          # 設計守門 → 內容守門 → astro build（CI 同一條）
pnpm preview        # 預覽 dist（⚠ 起了就要記得 kill，別留孤兒 server）
pnpm check:design
pnpm check:content:all
```

## CI（`.github/workflows/deploy.yml`，push main 觸發）

| job | 作用 |
|---|---|
| build | `pnpm build`（含設計＋內容守門），產 Pages artifact；守門違規在此 fail |
| deploy | `actions/deploy-pages` 上線 |
| verify | 抓 sitemap 逐 URL 驗 HTTP 200，非 200 即 fail |
| indexnow | 送 Bing/Yandex/Seznam/Naver 即時收錄（Google 不吃 IndexNow，靠 robots.txt 的 Sitemap 行 + GSC） |
| notify-failure | 任一 job fail → 發 Slack 到協會頻道要求修改；修正 push 後自動重跑＝重審 |

IndexNow 金鑰：`public/21e918f956fa6a94cf6db88099c40463.txt`（非機密，直接寫在 workflow env）。因為是 project pages，金鑰檔在 base 子路徑下，`scripts/indexnow-submit.mjs` 的 `keyLocation` 已改為相對解析。

Slack 告警需 repo secrets：`SLACK_BOT_TOKEN`、`SLACK_CHANNEL_ID`（缺則靜默略過）。
