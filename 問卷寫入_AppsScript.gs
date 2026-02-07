/**
 * IHCA 可用性問卷寫入 Google 試算表
 *
 * 步驟：
 * 1. 若腳本是從試算表內建立（擴充功能→Apps Script），SPREADSHEET_ID 留空
 * 2. 若為獨立專案，填上試算表 ID（網址 /d/ 後面那串）
 * 3. 部署：部署 → 新增部署 → 網路應用程式
 *    執行身分：我 | 存取權：任何人
 * 4. 用瀏覽器打開部署網址完成授權
 */

var SPREADSHEET_ID = '';  // 留空=用目前試算表；獨立專案請填 ID

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
    var sheet = SPREADSHEET_ID
      ? SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet()
      : SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['時間', '身分', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7']);
    }
    var data = JSON.parse(e.postData.contents);
    var row = [
      new Date().toISOString(),  // 使用伺服器收到請求的當下時間
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
