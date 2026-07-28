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
