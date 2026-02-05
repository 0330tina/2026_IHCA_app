# 如何把專案更新推送到 GitHub

若 GitHub 沒有更新，代表本機的變更尚未 **commit** 或 **push**。請在本機（已安裝 Git）依序執行：

---

## 方法一：用終端機（推薦）

在 **PowerShell** 或 **命令提示字元** 中，切到專案目錄後執行：

```bash
cd C:\Users\8820\Documents\GitHub\2026_IHCA_app

git add .
git status
git commit -m "IHCA App: 風險板、邏輯式回歸模組、公式對照網頁、手機優化、表頭公式連結"
git push origin main
```

若你的預設分支是 `master` 而不是 `main`，最後一行改成：

```bash
git push origin master
```

---

## 方法二：用 VS Code / Cursor

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
