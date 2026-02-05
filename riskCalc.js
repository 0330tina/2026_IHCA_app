/**
 * IHCA 邏輯式回歸風險計算模組
 * 多變項 Logistic Regression，係數固定，僅做數學運算，不重新訓練。
 *
 * 醫療安全聲明：此模型為臨床決策輔助工具，非診斷依據，結果應結合臨床專業判斷。
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else {
    root.IHCARiskCalc = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /** 固定係數（不得修改） */
  var INTERCEPT = 8.282;
  var COEFFICIENTS = {
    Temp__01_1: -0.146,
    Sp_01_1: -0.012,
    Dp_01_1: 0.008,
    Spo2_01_1: -0.037,
    Age_per_10_year: 0.112,
    Sex: 0.242,
    pleuraleffusion: 0.645,
    MI: 0.292,
    HF: 0.495,
    Albumin: -0.506,
    GlucoseAC: -0.002,
    Hemoglobin: -0.220,
    WBC: 0.095,
    e_GFR: 0.010,
    Potassium: 0.365
  };

  var REQUIRED_VARS = [
    'Temp__01_1', 'Sp_01_1', 'Dp_01_1', 'Spo2_01_1', 'Age_per_10_year',
    'Sex', 'pleuraleffusion', 'MI', 'HF', 'Albumin', 'GlucoseAC',
    'Hemoglobin', 'WBC', 'e_GFR', 'Potassium'
  ];

  /** 風險分級切點 */
  var THRESHOLD_LOW = 0.10;
  var THRESHOLD_MODERATE = 0.30;

  /**
   * 計算 logit = intercept + Σ(coef_i × x_i)
   * @param {Object} input - 輸入變數物件，鍵名需完整對應
   * @returns {number} logit
   */
  function computeLogit(input) {
    var sum = INTERCEPT;
    for (var i = 0; i < REQUIRED_VARS.length; i++) {
      var key = REQUIRED_VARS[i];
      if (!(key in input)) {
        throw new Error('缺少輸入變數: ' + key);
      }
      var val = Number(input[key]);
      if (Number.isNaN(val)) {
        throw new Error('輸入變數無效數值: ' + key + ' = ' + input[key]);
      }
      sum += COEFFICIENTS[key] * val;
    }
    return sum;
  }

  /**
   * 機率轉換 p = 1 / (1 + exp(-logit))
   * @param {number} logit
   * @returns {number} probability
   */
  function logitToProbability(logit) {
    if (logit >= 0) {
      return 1 / (1 + Math.exp(-logit));
    }
    var e = Math.exp(logit);
    return e / (1 + e);
  }

  /**
   * 依機率 p 取得風險等級
   * p < 0.10 → Low
   * 0.10 ≤ p < 0.30 → Moderate
   * p ≥ 0.30 → High
   */
  function getRiskLevel(p) {
    if (p < THRESHOLD_LOW) return 'Low';
    if (p < THRESHOLD_MODERATE) return 'Moderate';
    return 'High';
  }

  /**
   * 主入口：依輸入計算 logit、機率與風險等級
   * @param {Object} input - 輸入變數，鍵名必須完整對應
   * @returns {Object} { logit, probability, risk_level }
   */
  function calculate(input) {
    var logit = computeLogit(input);
    var p = logitToProbability(logit);
    var riskLevel = getRiskLevel(p);
    return {
      logit: round(logit, 6),
      probability: round(p, 6),
      risk_level: riskLevel
    };
  }

  function round(num, decimals) {
    var factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  }

  return {
    calculate: calculate,
    computeLogit: computeLogit,
    logitToProbability: logitToProbability,
    getRiskLevel: getRiskLevel,
    INTERCEPT: INTERCEPT,
    COEFFICIENTS: Object.assign({}, COEFFICIENTS),
    REQUIRED_VARS: REQUIRED_VARS.slice(),
    THRESHOLD_LOW: THRESHOLD_LOW,
    THRESHOLD_MODERATE: THRESHOLD_MODERATE,
    /** 醫療安全聲明 */
    DISCLAIMER: '此模型為臨床決策輔助工具，非診斷依據，結果應結合臨床專業判斷。'
  };
}));
