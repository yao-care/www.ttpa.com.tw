# TTPA 官網：MacBook 交接與首次設定

本文件用於把官網的修改、檢查與發布流程移轉到 macOS。Mac 使用「終端機（Terminal）」與 `site.sh`，不需要 PowerShell。網站原始碼以 GitHub 為準；每台電腦各自保留一份本機 repository，不要讓兩台電腦共用同一個 OneDrive／iCloud `.git` 資料夾。

## 1. 安裝必要工具

1. 依 [OpenAI 官方設定指南](https://learn.chatgpt.com/docs/quickstart)安裝 macOS 版 ChatGPT 桌面應用程式，並登入目前使用的同一個 ChatGPT 帳號。
2. 按 `Command + Space`，搜尋並開啟「終端機（Terminal）」。
3. 安裝 Apple Command Line Tools：

   ```bash
   xcode-select --install
   ```

4. 依 Homebrew 官方網站的指示安裝 Homebrew，再安裝 Git、Node.js、pnpm 與 GitHub CLI：

   ```bash
   brew install git node pnpm gh
   ```

5. 登入 GitHub：

   ```bash
   gh auth login
   gh auth setup-git
   ```

   選擇 `GitHub.com`、`HTTPS`，並使用瀏覽器完成登入。不要把登入權杖貼到 Codex 對話或寫入 repository。

## 2. 下載官網專案

在終端機執行：

```bash
mkdir -p ~/Projects
cd ~/Projects
git clone https://github.com/yao-care/www.ttpa.com.tw.git "TTPA官網專案"
cd "TTPA官網專案"
git config user.name "TTPA"
git config user.email "ttpa2014@gmail.com"
sh scripts/site.sh Setup
```

`Setup` 會安裝相依套件、執行設計檢查、內容檢查及 Astro 正式建置。全部成功後，這台 Mac 就具備本機修改與預覽能力。

## 3. 在 Codex 開啟專案

1. 開啟 ChatGPT 桌面應用程式並進入 Codex。
2. 新增本機專案，選擇 `~/Projects/TTPA官網專案`。本機專案與資料夾的操作方式可參考 [OpenAI Projects 說明](https://learn.chatgpt.com/docs/projects)。
3. 第一次任務輸入：

   ```text
   請依 WEBSITE_UPDATE_SOP.md 檢查官網環境，完成 setup，但不要修改或發布網站。
   ```

Codex 會自動讀取 repository 內的 `AGENTS.md` 與 `WEBSITE_UPDATE_SOP.md`。新電腦上的檔案存取權限、瀏覽器登入及外部服務授權都需要各自設定一次。

## 4. 平常修改流程

每次開始更新時，可在 Codex 貼上：

```text
請依 WEBSITE_UPDATE_SOP.md 更新協會官網。
請先同步最新版、建立 codex/ 更新分支、完成修改與本機檢查。
先不要發布，等我確認。
```

跨平台指令如下：

```bash
sh scripts/site.sh Status
sh scripts/site.sh Sync
sh scripts/site.sh Check
sh scripts/site.sh Dev
sh scripts/site.sh Preview
```

停止 `Dev` 或 `Preview` 時，在終端機按 `Control + C`。

## 5. 發布權限與安全原則

- 修改與本機預覽不會自動發布。
- 只有在你明確同意後，Codex 才可提交、推送更新分支並建立 Pull Request。
- Pull Request 合併到 `main` 後，GitHub Actions 才會部署正式網站。
- ChatGPT、GitHub、Google Drive 或其他外部服務都要在 Mac 上重新登入或授權。
- GitHub Pages、GitHub Actions 及 repository secrets 保存在 GitHub，不需要從 Windows 複製到 Mac；但登入的 GitHub 帳號必須擁有此 repository 的寫入與 Pull Request 權限。
- 不要複製舊電腦的 `.codex/auth.json`、GitHub token、Google service account 金鑰或其他密碼檔。
- `.source/` 不受 Git 管理，目前這份 Windows 專案也沒有該資料夾；若日後從舊主機找回，應以私人加密方式保存，絕對不要提交到公開 GitHub repository。

## 6. 確認移轉成功

在 Mac 的專案資料夾執行：

```bash
sh scripts/site.sh Status
sh scripts/site.sh Check
git remote -v
git config --local --get user.name
git config --local --get user.email
```

應確認：

- `origin` 指向 `https://github.com/yao-care/www.ttpa.com.tw.git`。
- Git 身分為 `TTPA` 與 `ttpa2014@gmail.com`。
- `Check` 完整成功。
- `git status` 沒有不明變更。

完成以上項目後，Windows 與 Mac 都可以依相同 SOP 維護官網；每次換電腦工作前，先同步 `main`，避免版本衝突。
