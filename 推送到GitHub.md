# 如何與 GitHub 連線並推送專案

---

## 從零開始：如何與 GitHub 連線

### 步驟 1：安裝 Git

1. 到 [https://git-scm.com/download/win](https://git-scm.com/download/win) 下載 Windows 版 Git。
2. 執行安裝程式，依預設選項安裝即可。
3. 安裝完成後，開啟 **PowerShell** 或 **命令提示字元**，輸入 `git --version`，有出現版本號就代表成功。

---

### 步驟 2：註冊／登入 GitHub

1. 開啟 [https://github.com](https://github.com)。
2. 若沒有帳號，點 **Sign up** 註冊；若有帳號，點 **Sign in** 登入。

---

### 步驟 3：建立 Personal Access Token（推送到 GitHub 時當密碼用）

GitHub 已不接受用「帳號＋登入密碼」推程式，必須用 **Personal Access Token**：

1. 登入 GitHub 後，點右上角頭像 → **Settings**。
2. 左側最下方點 **Developer settings**。
3. 點 **Personal access tokens** → **Tokens (classic)**。
4. 點 **Generate new token** → **Generate new token (classic)**。
5. **Note** 可填：`我的電腦推送用`；**Expiration** 選 90 天或 No expiration；勾選 **repo**（完整存取倉庫）。
6. 點 **Generate token**，畫面上會顯示一組 token（只會顯示一次），**請複製並妥善保存**，之後 push 時在「密碼」欄貼上這組 token。

---

### 步驟 4：本機專案與 GitHub 連線

分兩種情況：

#### 情況 A：你**已經有**這個專案資料夾（例如 2026_IHCA_app 在 OneDrive 桌面）

1. 在 GitHub 網站先建立一個**空的**倉庫（若還沒有）：
   - 點右上角 **+** → **New repository**
   - Repository name 填：`2026_IHCA_app`
   - 不要勾選 "Add a README file"，直接 **Create repository**

2. 開啟 **PowerShell** 或 **命令提示字元**，切到專案目錄：
   ```bash
   cd "C:\Users\tina0\OneDrive\桌面\2026_IHCA_app"
   ```

3. 若這個資料夾**還沒用過 Git**，先初始化並設定遠端：
   ```bash
   git init
   git remote add origin https://github.com/0330tina/2026_IHCA_app.git
   ```
   （若 GitHub 倉庫名稱或帳號不同，請把網址改成你的，例如 `https://github.com/你的帳號/2026_IHCA_app.git`）

4. 若資料夾**已經有 .git**（例如從別台電腦複製來），只須確認遠端：
   ```bash
   git remote -v
   ```
   若沒有 `origin`，再執行：
   ```bash
   git remote add origin https://github.com/0330tina/2026_IHCA_app.git
   ```

#### 情況 B：你**沒有**專案資料夾，要從 GitHub 抓一份下來

1. 開啟 PowerShell 或命令提示字元，切到要放專案的目錄（例如桌面）：
   ```bash
   cd C:\Users\tina0\OneDrive\桌面
   ```
2. 複製（clone）倉庫：
   ```bash
   git clone https://github.com/0330tina/2026_IHCA_app.git
   ```
3. 會多出一個 `2026_IHCA_app` 資料夾，之後：
   ```bash
   cd 2026_IHCA_app
   ```
   即可在裡面操作 Git。

---

### 步驟 5：第一次推送（讓 GitHub 和本機同步）

在專案目錄下執行：

```bash
git add .
git status
git commit -m "第一次連線：IHCA 風險板專案"
git branch -M main
git push -u origin main
```

- 若出現 **Username for 'https://github.com':** 請輸入你的 **GitHub 帳號**（例如 `0330tina`）。
- 若出現 **Password for 'https://...':** 請貼上你在步驟 3 建立的 **Personal Access Token**（不是登入密碼）。

推送成功後，到 [https://github.com/0330tina/2026_IHCA_app](https://github.com/0330tina/2026_IHCA_app) 重新整理，就能看到檔案出現在 GitHub 上。

---

## 一、之後每次要推送更新（已連線過）

若專案已經和 GitHub 連線過，之後只要把**本機修改**推上去即可。若 GitHub 沒有更新，代表本機的變更尚未 **commit** 或 **push**。

**檢查是否已連線**：在專案目錄執行 `git remote -v`，若看到 `origin` 指向 `https://github.com/0330tina/2026_IHCA_app.git` 即表示已連線。

### 方法一：用終端機（推薦）

在 **PowerShell** 或 **命令提示字元** 中，切到專案目錄後執行：

```bash
cd "C:\Users\tina0\OneDrive\桌面\2026_IHCA_app"

git add .
git status
git commit -m "IHCA App: 風險板、邏輯式回歸、公式對照、移除病房欄位"
git push origin main
```

若你的預設分支是 `master` 而不是 `main`，最後一行改成：

```bash
git push origin master
```

### 方法二：用 VS Code / Cursor

1. 左側點 **原始檔控制**（或 Ctrl+Shift+G）
2. 在「變更」區對要提交的檔案按 **+** 全部加入，或逐檔加入
3. 在上方訊息框輸入 commit 說明，例如：`更新 IHCA App：風險板、公式對照、手機優化`
4. 點 **✓ 認可**
5. 點 **⋯** → **推送到** → 選擇 `origin` 與分支（如 `main`）

---

## 若 push 時要求登入

- **HTTPS**：會要求 GitHub 帳號與密碼；密碼需使用 **Personal Access Token**，不能再用舊的帳號密碼。
- **SSH**：若已設定 SSH key，用 SSH 網址（如 `git@github.com:帳號/2026_IHCA_app.git`）可免每次輸入密碼。

在專案目錄查看目前遠端網址：

```bash
git remote -v
```

若要改成 SSH（請把 `你的帳號` 換成你的 GitHub 帳號）：

```bash
git remote set-url origin git@github.com:你的帳號/2026_IHCA_app.git
```

---

## 目前專案裡會一併推送的檔案

- `index.html` - 主 App 頁（含表頭公式連結）
- `styles.css` - 樣式（含手機優化）
- `script.js` - 風險計算與表單邏輯
- `riskCalc.js` - 邏輯式回歸計算模組
- `formula_reference.html` - 完整公式對照網頁
- `IHCA_logistic_regression_formula.md` - 公式對照 Markdown
- `riskCalc.example.js`、`riskCalc.test.html` - 範例與測試

推送完成後，到 GitHub 網頁重新整理即可看到更新。
