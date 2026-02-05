/**
 * IHCA 風險計算模組 - 使用範例與驗證
 * 執行: node riskCalc.example.js
 */
var calc = require('./riskCalc.js');

// 範例輸入（單位假設正確）
var sampleInput = {
  Temp__01_1: 36.5,
  Sp_01_1: 120,
  Dp_01_1: 70,
  Spo2_01_1: 98,
  Age_per_10_year: 7,      // 70 歲 → 7
  Sex: 1,                  // 1=男, 0=女
  pleuraleffusion: 0,      // 0/1
  MI: 0,                   // 0/1
  HF: 0,                   // 0/1
  Albumin: 3.5,
  GlucoseAC: 120,
  Hemoglobin: 12,
  WBC: 8,
  e_GFR: 60,
  Potassium: 4.0
};

var result = calc.calculate(sampleInput);
console.log(JSON.stringify(result, null, 2));
console.log('\n' + calc.DISCLAIMER);

// 驗證：logit 全為 0 時，p 應接近 0.9997
var zeroInput = {};
calc.REQUIRED_VARS.forEach(function (k) { zeroInput[k] = 0; });
var zeroResult = calc.calculate(zeroInput);
console.log('\n驗證（全 0 輸入）: logit=', zeroResult.logit, 'p=', zeroResult.probability);
