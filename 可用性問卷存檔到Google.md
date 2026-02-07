# 可用性問卷存檔到 Google

有兩種方式可讓問卷資料存到 Google（試算表或表單）。

---

## 方式一：用 Google 表單（最簡單，資料存到試算表）

問卷改為「前往 Google 表單填寫」，填完後回覆會自動存到 Google 試算表。

### 步驟

1. **建立 Google 表單**
   - 前往 [Google 表單](https://forms.google.com)，建立新表單。
   - 標題可設：**IHCA 風險預測平台可用性評估問卷**。

2. **加入說明**
   - 第一題前加「段落」題型，內容貼上 `IHCA_可用性評估問卷.md` 裡的「第一部分：說明文字」。

3. **加入 6 題單選（量表 1–5）**
   - 題型選「單選」，每題選項：**1**、**2**、**3**、**4**、**5**（可於選項說明寫：非常不同意～非常同意）。
   - 題目文字見 `IHCA_可用性評估問卷.md` 第二部分。

4. **加入第 7 題（選填）**
   - 題型選「段落」，題目：請簡述您對本平台介面、操作流程或功能之改進建議。（選填），設為非必填。

5. **取得表單連結**
   - 表單右上角「傳送」→「連結」→ 複製短網址。

6. **改問卷頁為導向 Google 表單**
   - 在 `questionnaire.html` 把表單改為「按鈕：前往 Google 表單填寫」，點擊後開新視窗到上述連結；或整頁改為說明 + 一個大按鈕連結到 Google 表單。

完成後，所有填答都會出現在表單的「回覆」→「連接到試算表」所建立的 Google 試算表。

---

## 方式二：在 App 內填寫，送出時寫入 Google 試算表

保留目前 App 內的問卷頁，使用者照常填寫；提交時把資料送到 **Google Apps Script**，由腳本寫入 Google 試算表。

### 步驟 1：建立 Google 試算表

1. 到 [Google 試算表](https://sheets.google.com) 建立新試算表，命名例如：**IHCA 可用性問卷回覆**。
2. 第一列設為欄位名稱（標題列）：
   - `時間`, `q1`, `q2`, `q3`, `q4`, `q5`, `q6`, `q7`

### 步驟 2：寫入 Apps Script 並部署

1. 在試算表選單：**擴充功能** → **Apps Script**。
2. 刪除預設程式碼，貼上以下程式碼：

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    var row = [
      data.at || new Date().toISOString(),
      data.q1 || '', data.q2 || '', data.q3 || '', data.q4 || '', data.q5 || '', data.q6 || '',
      data.q7 || ''
    ];
    sheet.appendRow(row);
    return ContentService.createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. 儲存專案（可命名為「問卷寫入」）。
4. 部署：**部署** → **新增部署** → 類型選 **網路應用程式**。
   - **說明**：問卷寫入
   - **執行身分**：我
   - **存取權**：**任何人**（否則 App 無法送資料）
5. 按「部署」，複製產生的 **網路應用程式 URL**（長得像 `https://script.google.com/macros/s/xxxxx/exec`）。

### 步驟 3：在問卷頁設定 URL

在 `questionnaire.html` 裡已預留變數 `GOOGLE_SCRIPT_URL`。請把上面複製的 URL 貼進去（例如：`var GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/你的ID/exec';`）。提交問卷時，App 會把資料 POST 到該網址，寫入試算表。（因瀏覽器限制，送出後無法顯示「已存到 Google」訊息，但資料會寫入；可到試算表檢查。）

### 注意

- 第一次部署後，若你之後又改過 Apps Script 程式碼，需要**再部署一次**（建立新部署或更新現有部署），並確認問卷頁用的是最新 URL。
- 若試算表要限制只有你能看，不要改「任何人」存取，改為僅你自己可執行；但這樣從網頁送出的請求會無法通過驗證，需改用方式一（Google 表單）或另做登入機制。

---

## 建議

- **只想要資料在 Google、操作最少**：用 **方式一**，問卷改為連結到 Google 表單即可。
- **希望使用者留在你的 App 裡填問卷、同時存到 Google**：用 **方式二**，完成試算表 + Apps Script 後，在問卷頁設定 `GOOGLE_SCRIPT_URL`。
