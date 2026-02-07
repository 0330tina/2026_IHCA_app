function doPost(e) {
  try {
    var spreadsheetId = '1c-tjSKk7SmY0ILJvqWVj1OEn71sSWRbjL1OIfhnAJcE';
    var sheetName = '工作表1'; // ←改成你的分頁名稱，例如「工作表1」

    var ss = SpreadsheetApp.openById(spreadsheetId);
    var sheet = ss.getSheetByName(sheetName) || ss.getActiveSheet();

    // 讀取前端送來的 JSON
    var raw;
    if (e && e.parameter && e.parameter.data) raw = e.parameter.data;
    else if (e && e.postData && e.postData.contents) raw = e.postData.contents;
    else return jsonResponse_({ success: false, error: '無法取得資料（沒有收到 data 或 body）' });

    var data = JSON.parse(raw);

    // 支援前端欄位：timestamp 或 at；身分 或 role
    var inputTime = parseToDateOrText_(data.timestamp != null ? data.timestamp : data.at);
    var identity = safeText_(data['身分'] != null ? data['身分'] : data.role);

    var q1 = safeText_(data.q1);
    var q2 = safeText_(data.q2);
    var q3 = safeText_(data.q3);
    var q4 = safeText_(data.q4);
    var q5 = safeText_(data.q5);
    var q6 = safeText_(data.q6);
    var q7 = safeText_(data.q7);

    // 寫入：時間、身分、Q1~Q7
    var row = [inputTime, identity, q1, q2, q3, q4, q5, q6, q7];

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse_({ success: true, message: '已寫入：時間、身分、Q1~Q7' });

  } catch (error) {
    return jsonResponse_({ success: false, error: String(error) });
  }
}

function doGet(e) {
  return ContentService.createTextOutput('問卷 API 已就緒')
    .setMimeType(ContentService.MimeType.TEXT);
}

function jsonResponse_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function safeText_(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

function parseToDateOrText_(v) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') {
    if (v < 1e12) return new Date(v * 1000);
    return new Date(v);
  }
  if (typeof v === 'string') {
    var s = v.trim();
    if (!s) return '';
    var normalized = s.replace(' ', 'T');
    var d = new Date(normalized);
    if (!isNaN(d.getTime())) return d;
    return s;
  }
  return String(v);
}

/**
 * ✅ 不用前端！直接按一下就寫入一筆測試資料到試算表
 */
function testAppend() {
  var fake = {
    timestamp: "2026-02-08 14:30:12",
    "身分": "護理師",
    q1: "1",
    q2: "1",
    q3: "1",
    q4: "1",
    q5: "1",
    q6: "1",
    q7: "1"
  };

  // 模擬 doPost 收到的 e
  var e = { postData: { contents: JSON.stringify(fake) } };
  var res = doPost(e);
  Logger.log(res.getContent());
}