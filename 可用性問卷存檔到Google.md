# 可用性問卷存檔到 Google

若 **無法使用 Apps Script**（例如環境限制、權限不足），可用以下兩種方式，不需任何程式部署。

---

## 若無法使用 Apps Script：兩種替代方式

### 替代方式 A：改用 Google 表單（推薦，資料自動進試算表）

不需寫程式，只要建立一個 Google 表單，問卷改為「前往 Google 表單填寫」即可，所有回覆會自動存到試算表。

1. 前往 [Google 表單](https://forms.google.com) 建立新表單，標題如：**IHCA 風險預測平台可用性評估問卷**。
2. 依下方「方式一」加入說明與 7 題（6 題單選 1–5、1 題選填段落）。
3. 表單右上角 **傳送** → **連結** → 複製連結。
4. 在 `questionnaire.html` 改為：說明文字 + 一個大按鈕「前往 Google 表單填寫」，點擊後開新視窗到該連結。
5. 在表單的 **回覆** 中選 **連接到試算表**，之後所有填答都會出現在試算表。

### 替代方式 B：App 內填寫，提交後下載 CSV 再匯入 Google

保留目前問卷頁，使用者照常填寫並提交。**未設定 GOOGLE_SCRIPT_URL 時**，提交後會出現「下載回覆 (CSV)」按鈕。

- 使用者下載 CSV 後，可到 [Google 試算表](https://sheets.google.com) → **檔案** → **匯入** → **上傳**，選擇該 CSV 匯入。
- 多筆回覆可重複下載多個 CSV，再在試算表中手動貼上或合併。

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

## 方式三：在 App 內填寫，送出時寫入 Google 試算表（需 Apps Script）

保留目前 App 內的問卷頁，使用者照常填寫；提交時把資料送到 **Google Apps Script**，由腳本寫入 Google 試算表。**需能使用 Google 試算表的「擴充功能 → Apps Script」並部署為網路應用程式。**

### 步驟 1：建立 Google 試算表

1. 到 [Google 試算表](https://sheets.google.com) 建立新試算表，命名例如：**IHCA 可用性問卷回覆**。
2. 第一列設為欄位名稱（標題列）：
   - `時間`, `q1`, `q2`, `q3`, `q4`, `q5`, `q6`, `q7`

### 步驟 2：寫入 Apps Script 並部署

1. 在試算表選單：**擴充功能** → **Apps Script**。
2. 刪除預設程式碼，貼上以下程式碼（會自動在空白試算表寫入第一列標題）：

```javascript
// 用瀏覽器打開部署後的 URL 可觸發授權並確認已就緒（必做一次）
function doGet() {
  return ContentService.createTextOutput('問卷寫入已就緒，請在問卷頁提交。')
    .setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'no body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['時間', '身分', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']);
    }
    var data = JSON.parse(e.postData.contents);
    var row = [
      data.at || new Date().toISOString(),
      data.role || '',
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

**若你已部署過舊版（沒有「身分」欄）**：請把上述程式碼整段替換後**重新部署**，新回覆才會帶身分。試算表若已有舊資料，可手動在第二欄插入一欄、標題填「身分」，新筆資料即會寫入該欄。

3. 儲存專案（可命名為「問卷寫入」）。
4. 部署：**部署** → **新增部署** → 類型選 **網路應用程式**。
   - **說明**：問卷寫入
   - **執行身分**：我
   - **存取權**：**任何人**（否則 App 無法送資料）
5. 按「部署」，複製產生的 **網路應用程式 URL**（長得像 `https://script.google.com/macros/s/xxxxx/exec`）。

### 步驟 3：第一次先「授權」腳本（重要，否則試算表收不到）

1. 用**瀏覽器**打開你複製的**網路應用程式 URL**（和問卷頁裡填的網址相同）。
2. 若出現「Google 需要驗證此應用程式」或登入畫面，請用**試算表擁有者帳號**登入並按**允許**。
3. 完成後畫面上應顯示：**問卷寫入已就緒，請在問卷頁提交。**
4. 之後問卷提交的資料才會寫入試算表。若從未用瀏覽器打開過該 URL，外部送出的 POST 可能無法通過驗證，試算表就不會收到。

### 步驟 4：在問卷頁設定 URL

在 `questionnaire.html` 裡已預留變數 `GOOGLE_SCRIPT_URL`。請把上面複製的 URL 貼進去。提交問卷時，App 會把資料 POST 到該網址，寫入試算表。（因瀏覽器限制，送出後無法顯示「已存到 Google」訊息，但資料會寫入；可到試算表檢查。）

### 試算表沒收到／還是看不到有寫進的資料時請檢查

1. **看對試算表與分頁**  
   資料會寫入「**綁定 Apps Script 的那個試算表**」：就是從該試算表選單 **擴充功能** → **Apps Script** 打開的那個專案所屬的試算表。請打開**同一個試算表檔案**，並查看**第一個工作表分頁**（資料會寫入 `getActiveSheet()`，通常是最左邊那個分頁）。

2. **先做步驟 3（授權）**  
   用**瀏覽器**打開問卷頁裡填的那個 `GOOGLE_SCRIPT_URL`，登入 Google 並按**允許**，直到畫面出現「問卷寫入已就緒」。若從未做過，試算表不會收到資料。

3. **網址要用正式部署（/exec），不要用測試（/dev）**  
   問卷頁裡的 URL 結尾必須是 **`/exec`**。若貼成 **`/dev`**（測試部署），可能無法正常寫入，請到 Apps Script **部署** → **管理部署**，複製「網頁應用程式網址」（結尾為 `/exec`）貼回問卷頁。

4. **部署設定**  
   部署時「存取權」必須選 **任何人**；若選「僅自己」，從網頁送出的請求會被拒絕。

5. **查看是否真的有觸發**  
   在 Apps Script 編輯器左側點 **執行作業**（或「執行紀錄」），提交一筆問卷後重新整理，看是否有 **doPost** 的紀錄、狀態是成功還是失敗。若有錯誤，點進去可看訊息。

6. **程式碼有改過時**  
   改過 Apps Script 後要**重新部署**（部署 → 管理部署 → 編輯 → 版本選「新版本」→ 部署），否則線上仍跑舊版。

### 注意

- 第一次部署後，若你之後又改過 Apps Script 程式碼，需要**再部署一次**（建立新部署或更新現有部署），並確認問卷頁用的是最新 URL。
- 若試算表要限制只有你能看，不要改「任何人」存取，改為僅你自己可執行；但這樣從網頁送出的請求會無法通過驗證，需改用方式一（Google 表單）或另做登入機制。

---

## 建議

- **無法使用 Apps Script**：用 **替代方式 A**（Google 表單）或 **替代方式 B**（下載 CSV 再匯入試算表）。
- **只想要資料在 Google、操作最少**：用 **方式一**（Google 表單），問卷改為連結到 Google 表單即可。
- **能使用 Apps Script，且希望使用者留在 App 內填問卷**：用 **方式三**，完成試算表 + Apps Script 後，在問卷頁設定 `GOOGLE_SCRIPT_URL`（網址結尾須為 `/exec`）。
