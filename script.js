/**
 * IHCA Day-1 入院首日風險板
 * 純前端。演算法係數集中於 CONFIG，未來可替換為 logistic 係數。
 */
(function () {
  'use strict';

  function run() {

  // =============================================================================
  // CONFIG：所有可調參數集中於此，無 magic numbers 散落程式碼
  // =============================================================================
  var CONFIG = {
    SCORE_MODEL: 'points',
    SCORE_MIN: 0,
    SCORE_MAX: 100,
    SCORE_SCALE_FACTOR: 100,

    INTERCEPT: 0,
    COEFFICIENTS: {
      age: 0.01,
      gender: 0,
      hr: 0.005,
      sbp: -0.01,
      dbp: -0.008,
      rr: 0.01,
      spo2: -0.02,
      temp: 0.1,
      wbc: 0.02,
      hb: -0.05,
      platelet: -0.001,
      creatinine: 0.1,
      bun: 0.005,
      albumin: -0.2,
      glucose: 0.0005
    },

    DEFAULT_VALUES: {
      age: 65,
      gender: 0,
      height: 165,
      weight: 65,
      hr: 80,
      sbp: 120,
      dbp: 70,
      rr: 16,
      spo2: 98,
      temp: 36.5,
      wbc: 8,
      hb: 12,
      platelet: 200,
      creatinine: 1,
      bun: 15,
      albumin: 3.5,
      glucose: 100,
      pleuraleffusion: 0,
      MI: 0,
      HF: 0,
      e_GFR: 60,
      potassium: 4
    },

    /** 點數規則用閾值，統一於此避免 magic numbers */
    POINT_THRESHOLDS: {
      age_high: 75,
      age_very_high: 85,
      hr_high: 120,
      hr_low: 50,
      sbp_low: 90,
      rr_high: 24,
      rr_low: 10,
      spo2_low: 92,
      temp_low: 36,
      temp_high: 38.3,
      creatinine_high: 2,
      platelet_low: 100,
      wbc_high: 12,
      wbc_low: 4,
      albumin_low: 3,
      glucose_high: 200,
      glucose_low: 70
    },

    POINT_RULES: [
      { condition: function (d) { return d.age >= CONFIG.POINT_THRESHOLDS.age_high; }, points: 2 },
      { condition: function (d) { return d.age >= CONFIG.POINT_THRESHOLDS.age_very_high; }, points: 3 },
      { condition: function (d) { return d.hr > CONFIG.POINT_THRESHOLDS.hr_high || d.hr < CONFIG.POINT_THRESHOLDS.hr_low; }, points: 2 },
      { condition: function (d) { return d.sbp < CONFIG.POINT_THRESHOLDS.sbp_low; }, points: 3 },
      { condition: function (d) { return d.rr > CONFIG.POINT_THRESHOLDS.rr_high || d.rr < CONFIG.POINT_THRESHOLDS.rr_low; }, points: 2 },
      { condition: function (d) { return d.spo2 < CONFIG.POINT_THRESHOLDS.spo2_low; }, points: 3 },
      { condition: function (d) { return d.temp < CONFIG.POINT_THRESHOLDS.temp_low || d.temp > CONFIG.POINT_THRESHOLDS.temp_high; }, points: 1 },
      { condition: function (d) { return d.creatinine > CONFIG.POINT_THRESHOLDS.creatinine_high; }, points: 2 },
      { condition: function (d) { return d.platelet < CONFIG.POINT_THRESHOLDS.platelet_low; }, points: 2 },
      { condition: function (d) { return d.wbc > CONFIG.POINT_THRESHOLDS.wbc_high || d.wbc < CONFIG.POINT_THRESHOLDS.wbc_low; }, points: 1 },
      { condition: function (d) { return d.albumin < CONFIG.POINT_THRESHOLDS.albumin_low; }, points: 1 },
      { condition: function (d) { return d.glucose > CONFIG.POINT_THRESHOLDS.glucose_high || d.glucose < CONFIG.POINT_THRESHOLDS.glucose_low; }, points: 1 }
    ],
    POINT_MAX: 25,
    POINT_TO_SCALE: true,

    LEVEL_THRESHOLDS: [
      { id: 'low',  label: '低',  class: 'level-low',  min: 0,  max: 33 },
      { id: 'mid',  label: '中',  class: 'level-mid',  min: 34, max: 66 },
      { id: 'high', label: '高',  class: 'level-high', min: 67, max: 100 }
    ],

    RECOMMENDATIONS: {
      low: [
        '維持常規生命徵象監測與護理常規。',
        '若有新症狀或數值變化再重新評估。',
        '可考慮常規 DNR/ACP 衛教。'
      ],
      mid: [
        '提高監測頻率（如 q4h 生命徵象）。',
        '確認治療計畫與 DNR/ACP 意願。',
        '考慮會診相關科別或加護評估。',
        '檢視用藥與感染徵象。'
      ],
      high: [
        '密切監測（建議 q2h 或持續監測）。',
        '儘速完成 DNR/ACP 討論並記錄。',
        '建議加護或中重度照護評估。',
        '積極處理可逆因素（感染、電解質、灌流）。',
        '與家屬溝通病情與治療目標。'
      ]
    },

    COPY_FEEDBACK_DURATION_MS: 2500,
    /** 低風險 Demo：較年輕、生命徵象與檢驗正常、無病史 */
    DEMO_DATA_LOW: {
      age: 42,
      gender: 'M',
      height: 172,
      weight: 68,
      hr: 72,
      sbp: 118,
      dbp: 74,
      rr: 16,
      spo2: 98,
      temp: 36.5,
      wbc: 7.2,
      hb: 14,
      platelet: 220,
      creatinine: 0.9,
      bun: 12,
      albumin: 4.2,
      glucose: 92,
      pleuraleffusion: '0',
      MI: '0',
      HF: '0',
      e_GFR: 95,
      potassium: 4.0
    },
    /** 中度風險 Demo */
    DEMO_DATA_MID: {
      age: 68,
      gender: 'F',
      height: 158,
      weight: 62,
      hr: 96,
      sbp: 102,
      dbp: 64,
      rr: 20,
      spo2: 94,
      temp: 37.2,
      wbc: 11,
      hb: 10.2,
      platelet: 152,
      creatinine: 1.6,
      bun: 26,
      albumin: 3.1,
      glucose: 128,
      pleuraleffusion: '0',
      MI: '0',
      HF: '1',
      e_GFR: 52,
      potassium: 4.3
    },
    /** 高風險 Demo */
    DEMO_DATA_HIGH: {
      age: 78,
      gender: 'M',
      height: 168,
      weight: 72,
      hr: 105,
      sbp: 88,
      dbp: 55,
      rr: 22,
      spo2: 91,
      temp: 37.8,
      wbc: 14.2,
      hb: 9.5,
      platelet: 85,
      creatinine: 2.4,
      bun: 38,
      albumin: 2.8,
      glucose: 165,
      pleuraleffusion: '0',
      MI: '0',
      HF: '1',
      e_GFR: 45,
      potassium: 4.2
    }
  };

  /** 欄位設定：與 CONFIG 同步，為驗證、缺值、UI 的單一來源 */
  var FIELDS = {
    age:        { unit: '歲',   min: 18,  max: 120, required: true,  label: '年齡' },
    gender:     { unit: '',     min: null, max: null, required: false, label: '性別', options: { M: '男', F: '女', O: '其他' } },
    height:     { unit: 'cm',   min: 100,  max: 220, required: false, label: '身高' },
    weight:     { unit: 'kg',   min: 30,   max: 200, required: false, label: '體重' },
    hr:         { unit: 'bpm',  min: 30,   max: 250, required: false, label: 'HR' },
    sbp:        { unit: 'mmHg', min: 70,   max: 250, required: false, label: 'SBP' },
    dbp:        { unit: 'mmHg', min: 40,   max: 150, required: false, label: 'DBP' },
    rr:         { unit: '/min', min: 8,    max: 40,  required: false, label: 'RR' },
    spo2:       { unit: '%',    min: 70,   max: 100, required: false, label: 'SpO2' },
    temp:       { unit: '°C',   min: 32,   max: 42,  required: false, label: 'Temp' },
    wbc:        { unit: '×10³/μL', min: 0.5, max: 50,  required: false, label: 'WBC' },
    hb:         { unit: 'g/dL', min: 5,   max: 20,  required: false, label: 'Hb' },
    platelet:   { unit: '×10³/μL', min: 20, max: 500, required: false, label: 'Platelet' },
    creatinine: { unit: 'mg/dL', min: 0.3, max: 15,  required: false, label: 'Creatinine' },
    bun:        { unit: 'mg/dL', min: 5,   max: 120, required: false, label: 'BUN' },
    albumin:    { unit: 'g/dL', min: 2,   max: 5,   required: false, label: 'Albumin' },
    glucose:    { unit: 'mg/dL', min: 40,  max: 500, required: false, label: 'Glucose' },
    pleuraleffusion: { unit: '', min: null, max: null, required: false, label: '肋膜積水', options: { '0': '否', '1': '是' } },
    MI:         { unit: '', min: null, max: null, required: false, label: '心肌梗塞(MI)', options: { '0': '否', '1': '是' } },
    HF:         { unit: '', min: null, max: null, required: false, label: '心衰竭(HF)', options: { '0': '否', '1': '是' } },
    e_GFR:      { unit: 'mL/min/1.73m²', min: 5, max: 150, required: false, label: 'e_GFR' },
    potassium:  { unit: 'mEq/L', min: 2, max: 8, required: false, label: '鉀(K)' }
  };

  // ----- DOM refs
  var form = document.getElementById('risk-form');
  var resultPlaceholder = document.getElementById('result-placeholder');
  var resultContent = document.getElementById('result-content');
  var displayScore = document.getElementById('display-score');
  var displayLevel = document.getElementById('display-level');
  var displayLevelIcon = document.getElementById('display-level-icon');
  var displayRecommendations = document.getElementById('display-recommendations');
  var displayNote = document.getElementById('display-note');
  var missingFieldsBlock = document.getElementById('missing-fields-block');
  var missingFieldsList = document.getElementById('missing-fields-list');
  var rangeWarningsBlock = document.getElementById('range-warnings-block');
  var rangeWarningsList = document.getElementById('range-warnings-list');
  var btnCopy = document.getElementById('btn-copy');
  var copyFeedback = document.getElementById('copy-feedback');
  var btnReset = document.getElementById('btn-reset');
  var toggleLabs = document.getElementById('toggle-labs');
  var labFieldset = document.getElementById('lab-fieldset');

  // =============================================================================
  // 單一計算入口：computeRiskResult(payload) -> { score, level }
  // 輸入 payload：{ data, missing, rangeWarnings }（data 已含缺值預設）
  // 輸出：{ score, level }，score 為 0–100 整數，level 為 LEVEL_THRESHOLDS 元素
  // =============================================================================
  function computeRiskResult(payload) {
    var score = computeScoreFromData(payload.data);
    var level = getLevelForScore(score);
    return { score: score, level: level };
  }

  function sigmoid(x) {
    if (x >= 0) return 1 / (1 + Math.exp(-x));
    var e = Math.exp(x);
    return e / (1 + e);
  }

  function computeScoreFromData(data) {
    var model = CONFIG.SCORE_MODEL;
    var minScore = CONFIG.SCORE_MIN;
    var maxScore = CONFIG.SCORE_MAX;
    var scale = CONFIG.SCORE_SCALE_FACTOR;

    if (model === 'sigmoid') {
      var sum = CONFIG.INTERCEPT;
      Object.keys(CONFIG.COEFFICIENTS).forEach(function (key) {
        var v = data[key];
        if (v == null) v = CONFIG.DEFAULT_VALUES[key];
        if (v != null) sum += CONFIG.COEFFICIENTS[key] * Number(v);
      });
      return Math.round(scale * sigmoid(sum));
    }

    var points = 0;
    CONFIG.POINT_RULES.forEach(function (rule) {
      if (rule.condition(data)) points += rule.points;
    });
    if (!CONFIG.POINT_TO_SCALE) return Math.min(Math.max(points, minScore), maxScore);
    var maxP = CONFIG.POINT_MAX;
    return Math.round(scale * Math.min(Math.max(points / maxP, 0), 1));
  }

  function getLevelForScore(score) {
    var list = CONFIG.LEVEL_THRESHOLDS;
    for (var i = 0; i < list.length; i++) {
      if (score >= list[i].min && score <= list[i].max) return list[i];
    }
    return list[list.length - 1];
  }

  // =============================================================================
  // 單元測試風格的自我檢查（無測試框架）
  // =============================================================================
  function runSelfCheck() {
    var passed = 0;
    var failed = 0;

    function assert(cond, msg) {
      if (cond) { passed++; return; }
      failed++;
      if (typeof console !== 'undefined' && console.error) {
        console.error('[IHCA SelfCheck] FAIL: ' + msg);
      }
    }

    function assertEq(actual, expected, msg) {
      if (actual === expected) { passed++; return; }
      failed++;
      if (typeof console !== 'undefined' && console.error) {
        console.error('[IHCA SelfCheck] FAIL: ' + msg + ' (expected ' + expected + ', got ' + actual + ')');
      }
    }

    var def = CONFIG.DEFAULT_VALUES;
    var payloadAllDefault = {
      data: Object.assign({}, def),
      missing: [],
      rangeWarnings: []
    };

    var result = computeRiskResult(payloadAllDefault);
    assert(result.score >= CONFIG.SCORE_MIN && result.score <= CONFIG.SCORE_MAX, 'score in range');
    assert(result.level && result.level.id && result.level.label, 'level has id and label');
    assert(CONFIG.RECOMMENDATIONS[result.level.id], 'recommendations exist for level');

    var payloadDemo = {
      data: Object.assign({}, def, CONFIG.DEMO_DATA_HIGH, { gender: 1 }),
      missing: [],
      rangeWarnings: []
    };
    var resultDemo = computeRiskResult(payloadDemo);
    assert(resultDemo.score > result.score, 'demo data yields higher score than default');

    var payloadLow = {
      data: Object.assign({}, def, { age: 40, hr: 75, sbp: 120, dbp: 70, rr: 16, spo2: 98, temp: 36.5, creatinine: 1, platelet: 200, wbc: 7, albumin: 4, glucose: 100 }),
      missing: [],
      rangeWarnings: []
    };
    var resultLow = computeRiskResult(payloadLow);
    assertEq(resultLow.level.id, 'low', 'low-risk case');

    var payloadHigh = {
      data: Object.assign({}, def, { age: 90, hr: 130, sbp: 80, dbp: 50, rr: 28, spo2: 88, temp: 39, creatinine: 3, platelet: 80, wbc: 15, albumin: 2.5, glucose: 250 }),
      missing: [],
      rangeWarnings: []
    };
    var resultHigh = computeRiskResult(payloadHigh);
    assertEq(resultHigh.level.id, 'high', 'high-risk case');

    assert(CONFIG.LEVEL_THRESHOLDS.every(function (l) { return CONFIG.RECOMMENDATIONS[l.id]; }), 'all levels have recommendations');

    if (failed > 0 && typeof console !== 'undefined') {
      console.warn('[IHCA SelfCheck] ' + passed + ' passed, ' + failed + ' failed');
    }
    return { passed: passed, failed: failed };
  }

  // ----- Form helpers
  function getValue(name) {
    if (!form) return null;
    var el = form.elements[name];
    if (!el) return null;
    // Radio 群組：部分環境 form.elements[name] 為 RadioNodeList 或類似集合
    if (typeof el.length === 'number' && el.length > 0) {
      for (var i = 0; i < el.length; i++) {
        if (el[i].checked) return el[i].value;
      }
      return null;
    }
    var raw = (el.value != null ? el.value : '').toString().trim();
    if (raw === '') return null;
    if (el.type === 'number') {
      var num = parseFloat(raw);
      return isNaN(num) ? null : num;
    }
    return raw;
  }

  function getErrId(name) {
    return 'err-' + name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  }

  function setFieldError(name, message, isWarn) {
    var errEl = document.getElementById(getErrId(name));
    var inputEl = form.elements[name];
    if (errEl) errEl.textContent = message || '';
    if (inputEl) {
      inputEl.classList.toggle('error', !!message && !isWarn);
      inputEl.classList.toggle('warn-range', !!message && isWarn);
    }
    return !message;
  }

  function validateField(name) {
    var cfg = FIELDS[name];
    if (!cfg) return true;
    var val = getValue(name);
    if (cfg.required && (val === null || val === '')) {
      setFieldError(name, '此欄位必填', false);
      return false;
    }
    if (val === null || val === '') {
      setFieldError(name, '', false);
      return true;
    }
    if (typeof val === 'number' && cfg.min != null && cfg.max != null && (val < cfg.min || val > cfg.max)) {
      setFieldError(name, '建議範圍 ' + cfg.min + '–' + cfg.max + '，已納入計算', true);
      return true;
    }
    setFieldError(name, '', false);
    return true;
  }

  function validateForm() {
    var ok = true;
    Object.keys(FIELDS).forEach(function (name) {
      if (!validateField(name)) ok = false;
    });
    return ok;
  }

  function clearAllErrors() {
    Object.keys(FIELDS).forEach(function (name) {
      setFieldError(name, '', false);
    });
  }

  /** 收集資料：缺值用 DEFAULT_VALUES，與 validateField 使用相同 FIELDS 定義 */
  function collectDataForCalc() {
    var data = {};
    var missing = [];
    var rangeWarnings = [];
    var def = CONFIG.DEFAULT_VALUES;

    Object.keys(FIELDS).forEach(function (name) {
      var val = getValue(name);
      var cfg = FIELDS[name];
      if (val === null || val === '') {
        if (cfg.label) missing.push(cfg.label + '（' + (cfg.unit || '—') + ')');
        if (def[name] !== undefined) {
          data[name] = name === 'gender' ? 0 : def[name];
        } else {
          data[name] = name === 'gender' ? 0 : null;
        }
      } else {
        data[name] = typeof val === 'number' ? val : (name === 'gender' ? (val === 'M' ? 1 : val === 'F' ? -1 : 0) : val);
        if (typeof val === 'number' && cfg.min != null && cfg.max != null && (val < cfg.min || val > cfg.max)) {
          rangeWarnings.push(cfg.label + ' ' + val + ' ' + (cfg.unit || '') + '（建議 ' + cfg.min + '–' + cfg.max + '）');
        }
      }
    });
    return { data: data, missing: missing, rangeWarnings: rangeWarnings };
  }

  function getDisplayValue(name, value) {
    if (value === null || value === '') return '未填';
    var cfg = FIELDS[name];
    if (cfg && cfg.options && cfg.options[value]) return cfg.options[value];
    if (typeof value === 'number' && cfg && cfg.unit) return value + ' ' + cfg.unit;
    return String(value);
  }

  function buildNoteText(data, score, level, missing, rangeWarnings) {
    var lines = [];
    lines.push('【IHCA Day-1 入院首日風險評估】');
    lines.push('基本：年齡 ' + getDisplayValue('age', data.age) + '、性別 ' + getDisplayValue('gender', data.gender) + '、身高 ' + getDisplayValue('height', data.height) + '、體重 ' + getDisplayValue('weight', data.weight));
    lines.push('Day-1 生命徵象：HR ' + getDisplayValue('hr', data.hr) + '、SBP ' + getDisplayValue('sbp', data.sbp) + '、DBP ' + getDisplayValue('dbp', data.dbp) + '、RR ' + getDisplayValue('rr', data.rr) + '、SpO2 ' + getDisplayValue('spo2', data.spo2) + '、Temp ' + getDisplayValue('temp', data.temp));
    lines.push('病史：肋膜積水 ' + getDisplayValue('pleuraleffusion', data.pleuraleffusion) + '、MI ' + getDisplayValue('MI', data.MI) + '、HF ' + getDisplayValue('HF', data.HF));
    lines.push('Day-1 檢驗：WBC ' + getDisplayValue('wbc', data.wbc) + '、Hb ' + getDisplayValue('hb', data.hb) + '、Platelet ' + getDisplayValue('platelet', data.platelet) + '、Creatinine ' + getDisplayValue('creatinine', data.creatinine) + '、BUN ' + getDisplayValue('bun', data.bun) + '、Albumin ' + getDisplayValue('albumin', data.albumin) + '、Glucose ' + getDisplayValue('glucose', data.glucose) + '、e_GFR ' + getDisplayValue('e_GFR', data.e_GFR) + '、鉀 ' + getDisplayValue('potassium', data.potassium));
    if (missing.length) lines.push('缺少欄位：' + missing.join('、'));
    if (rangeWarnings.length) lines.push('超出合理範圍（已納入計算）：' + rangeWarnings.join('；'));
    lines.push('');
    lines.push('風險分數：' + score + ' 分（' + CONFIG.SCORE_MIN + '–' + CONFIG.SCORE_MAX + '）');
    lines.push('風險等級：' + level.label);
    lines.push('建議處置：');
    CONFIG.RECOMMENDATIONS[level.id].forEach(function (s) { lines.push('・' + s); });
    lines.push('');
    lines.push('（本紀錄由 IHCA Day-1 風險板產生，僅供病歷參考）');
    return lines.join('\n');
  }

  function riskLevelToDisplay(riskLevel) {
    if (riskLevel === 'Low') return { id: 'low', label: '低風險', class: 'level-low' };
    if (riskLevel === 'Moderate') return { id: 'mid', label: '中度風險', class: 'level-mid' };
    return { id: 'high', label: '高風險', class: 'level-high' };
  }

  function buildNoteTextForRiskCalc(payload, result) {
    var data = payload.data;
    var pct = (result.probability * 100).toFixed(1);
    var level = riskLevelToDisplay(result.risk_level);
    var lines = [];
    lines.push('【IHCA Day-1 入院首日風險評估】');
    lines.push('基本：年齡 ' + getDisplayValue('age', data.age) + '、性別 ' + getDisplayValue('gender', data.gender) + '、身高 ' + getDisplayValue('height', data.height) + '、體重 ' + getDisplayValue('weight', data.weight));
    lines.push('Day-1 生命徵象：HR ' + getDisplayValue('hr', data.hr) + '、SBP ' + getDisplayValue('sbp', data.sbp) + '、DBP ' + getDisplayValue('dbp', data.dbp) + '、RR ' + getDisplayValue('rr', data.rr) + '、SpO2 ' + getDisplayValue('spo2', data.spo2) + '、Temp ' + getDisplayValue('temp', data.temp));
    lines.push('病史：肋膜積水 ' + getDisplayValue('pleuraleffusion', data.pleuraleffusion) + '、MI ' + getDisplayValue('MI', data.MI) + '、HF ' + getDisplayValue('HF', data.HF));
    lines.push('Day-1 檢驗：WBC ' + getDisplayValue('wbc', data.wbc) + '、Hb ' + getDisplayValue('hb', data.hb) + '、…、e_GFR ' + getDisplayValue('e_GFR', data.e_GFR) + '、鉀 ' + getDisplayValue('potassium', data.potassium));
    if (payload.missing.length) lines.push('缺少欄位：' + payload.missing.join('、'));
    if (payload.rangeWarnings.length) lines.push('超出合理範圍（已納入計算）：' + payload.rangeWarnings.join('；'));
    lines.push('');
    lines.push('預測機率：' + pct + ' %');
    lines.push('風險等級：' + level.label);
    lines.push('建議處置：');
    CONFIG.RECOMMENDATIONS[level.id].forEach(function (s) { lines.push('・' + s); });
    lines.push('');
    lines.push('（本紀錄由 IHCA Day-1 風險板產生，僅供病歷參考）');
    return lines.join('\n');
  }

  function showResult(payload, score, level, noteText, opts) {
    if (!resultPlaceholder || !resultContent) return;
    resultPlaceholder.classList.add('hidden');
    resultContent.classList.remove('hidden');
    var scoreLabel = document.getElementById('display-score-label');
    var scoreUnit = document.getElementById('display-score-unit');
    if (opts && opts.useProbability && scoreLabel && scoreUnit) {
      scoreLabel.textContent = '預測機率';
      scoreUnit.textContent = '';
    } else if (scoreLabel && scoreUnit) {
      scoreLabel.textContent = '風險分數';
      scoreUnit.textContent = '分';
    }
    displayScore.textContent = score;
    displayLevel.textContent = level.label;
    displayLevel.className = 'result-level ' + level.class;
    displayLevelIcon.className = 'result-level-icon ' + level.class;
    displayLevelIcon.setAttribute('aria-hidden', 'false');

    if (payload.missing.length) {
      missingFieldsBlock.classList.remove('hidden');
      missingFieldsList.textContent = payload.missing.join('、');
    } else {
      missingFieldsBlock.classList.add('hidden');
    }
    if (payload.rangeWarnings.length) {
      rangeWarningsBlock.classList.remove('hidden');
      rangeWarningsList.innerHTML = '';
      payload.rangeWarnings.forEach(function (w) {
        var li = document.createElement('li');
        li.textContent = w;
        rangeWarningsList.appendChild(li);
      });
    } else {
      rangeWarningsBlock.classList.add('hidden');
    }

    displayRecommendations.innerHTML = '';
    CONFIG.RECOMMENDATIONS[level.id].forEach(function (text) {
      var li = document.createElement('li');
      li.textContent = text;
      displayRecommendations.appendChild(li);
    });
    displayNote.textContent = noteText;
    var resultPanel = document.getElementById('result-panel');
    if (resultPanel) {
      resultPanel.classList.add('is-visible');
      setTimeout(function () {
        resultPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  }

  function hideResult() {
    resultContent.classList.add('hidden');
    resultPlaceholder.classList.remove('hidden');
    var resultPanel = document.getElementById('result-panel');
    if (resultPanel) resultPanel.classList.remove('is-visible');
  }

  /** 由表單組出邏輯式回歸模組所需輸入（缺項用預設），供導向結果頁使用 */
  function buildRiskCalcInput() {
    var age = getValue('age');
    var def = {
      Temp__01_1: 36.5, Sp_01_1: 120, Dp_01_1: 70, Spo2_01_1: 98, Age_per_10_year: 6.5,
      Sex: 0, pleuraleffusion: 0, MI: 0, HF: 0, Albumin: 3.5, GlucoseAC: 100,
      Hemoglobin: 12, WBC: 8, e_GFR: 60, Potassium: 4
    };
    var p = getValue('pleuraleffusion');
    var mi = getValue('MI');
    var hf = getValue('HF');
    var input = {
      Temp__01_1: getValue('temp') != null ? getValue('temp') : def.Temp__01_1,
      Sp_01_1: getValue('sbp') != null ? getValue('sbp') : def.Sp_01_1,
      Dp_01_1: getValue('dbp') != null ? getValue('dbp') : def.Dp_01_1,
      Spo2_01_1: getValue('spo2') != null ? getValue('spo2') : def.Spo2_01_1,
      Age_per_10_year: age != null ? age / 10 : def.Age_per_10_year,
      Sex: getValue('gender') === 'M' ? 1 : getValue('gender') === 'F' ? 0 : 0,
      pleuraleffusion: (p !== null && p !== '') ? Number(p) : def.pleuraleffusion,
      MI: (mi !== null && mi !== '') ? Number(mi) : def.MI,
      HF: (hf !== null && hf !== '') ? Number(hf) : def.HF,
      Albumin: getValue('albumin') != null ? getValue('albumin') : def.Albumin,
      GlucoseAC: getValue('glucose') != null ? getValue('glucose') : def.GlucoseAC,
      Hemoglobin: getValue('hb') != null ? getValue('hb') : def.Hemoglobin,
      WBC: getValue('wbc') != null ? getValue('wbc') : def.WBC,
      e_GFR: getValue('e_GFR') != null ? Number(getValue('e_GFR')) : def.e_GFR,
      Potassium: getValue('potassium') != null ? Number(getValue('potassium')) : def.Potassium
    };
    return input;
  }

  function onSubmit(e) {
    e.preventDefault();
    e.stopPropagation();
    // 確保有 form 參考（若 init 時未取得，例如腳本載入時機問題）
    if (!form) form = document.getElementById('risk-form') || (e.target && e.target.id === 'risk-form' ? e.target : null);
    clearAllErrors();
    if (!form) return;
    if (!validateForm()) {
      var first = form.querySelector('.error');
      if (first) {
        first.focus();
        first.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }
    try {
      var probability;
      var riskLevel;
      var payload;
      var scoreForDisplay;
      var levelForDisplay;
      var noteText;
      var useProbability = false;

      if (typeof IHCARiskCalc !== 'undefined') {
        var input = buildRiskCalcInput();
        var result = IHCARiskCalc.calculate(input);
        probability = result.probability;
        riskLevel = result.risk_level;
        payload = collectDataForCalc();
        scoreForDisplay = Math.round(probability * 100);
        levelForDisplay = riskLevelToDisplay(riskLevel);
        noteText = buildNoteTextForRiskCalc(payload, { probability: probability, risk_level: riskLevel });
        useProbability = true;
      } else {
        payload = collectDataForCalc();
        var result = computeRiskResult(payload);
        probability = result.score / 100;
        riskLevel = result.level.id === 'low' ? 'Low' : result.level.id === 'mid' ? 'Moderate' : 'High';
        scoreForDisplay = result.score;
        levelForDisplay = result.level;
        noteText = buildNoteText(payload.data, result.score, result.level, payload.missing, payload.rangeWarnings);
      }

      try {
        sessionStorage.setItem('ihca_result', JSON.stringify({
          probability: probability,
          risk_level: riskLevel
        }));
      } catch (storageErr) {
        if (typeof console !== 'undefined' && console.warn) console.warn('sessionStorage 無法寫入，結果頁可能無法顯示', storageErr);
      }

      window.location.href = 'result.html';

      // 若因環境（如 file:// 或權限）無法跳轉，改在同頁顯示結果
      setTimeout(function () {
        if (window.location.href.indexOf('result.html') === -1) {
          showResult(payload, scoreForDisplay, levelForDisplay, noteText, useProbability ? { useProbability: true } : undefined);
        }
      }, 350);
    } catch (err) {
      if (typeof console !== 'undefined' && console.error) console.error(err);
      alert('計算時發生錯誤：' + (err && err.message ? err.message : String(err)) + '\n請確認必填欄位（年齡）已填寫，或稍後再試。');
    }
  }

  function onCopy() {
    var text = displayNote.textContent;
    if (!text) return;
    copyFeedback.textContent = '';
    var duration = CONFIG.COPY_FEEDBACK_DURATION_MS;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        copyFeedback.textContent = '已複製到剪貼簿';
        setTimeout(function () { copyFeedback.textContent = ''; }, duration);
      }).catch(function () { fallbackCopy(text, duration); });
    } else {
      fallbackCopy(text, duration);
    }
  }

  function fallbackCopy(text, duration) {
    duration = duration || CONFIG.COPY_FEEDBACK_DURATION_MS;
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      copyFeedback.textContent = '已複製到剪貼簿';
      setTimeout(function () { copyFeedback.textContent = ''; }, duration);
    } catch (err) {
      copyFeedback.textContent = '請手動選取下方文字複製';
    }
    document.body.removeChild(ta);
  }

  function onReset() {
    form.reset();
    clearAllErrors();
    hideResult();
    if (labFieldset) labFieldset.classList.remove('lab-visible');
    if (toggleLabs) toggleLabs.checked = false;
  }

  function fillDemoData(data) {
    if (!form) return;
    Object.keys(data).forEach(function (name) {
      var el = form.elements[name];
      if (!el) return;
      var val = data[name];
      if (el.type === 'radio' && el.length !== undefined) {
        for (var i = 0; i < el.length; i++) {
          el[i].checked = (String(el[i].value) === String(val));
        }
      } else {
        el.value = (val !== undefined && val !== null) ? String(val) : '';
      }
    });
    clearAllErrors();
    if (labFieldset) labFieldset.classList.add('lab-visible');
    if (toggleLabs) toggleLabs.checked = true;
  }

  if (toggleLabs && labFieldset) {
    toggleLabs.addEventListener('change', function () {
      labFieldset.classList.toggle('lab-visible', toggleLabs.checked);
    });
  }

  // 用 document 攔截 submit（例如在表單內按 Enter）
  document.addEventListener('submit', function (e) {
    if (e.target && e.target.id === 'risk-form') {
      e.preventDefault();
      e.stopPropagation();
      onSubmit(e);
    }
  }, true);

  // 「計算」按鈕改為 type="button"，直接綁定 click，確保點擊一定會觸發計算
  var btnCalc = document.getElementById('btn-calc');
  var riskFormEl = document.getElementById('risk-form');
  if (btnCalc) {
    btnCalc.addEventListener('click', function (e) {
      e.preventDefault();
      onSubmit({ preventDefault: function () {}, stopPropagation: function () {}, target: riskFormEl || null });
    });
  }

  if (btnCopy) btnCopy.addEventListener('click', onCopy);
  if (btnReset) btnReset.addEventListener('click', onReset);
  var btnDemoLow = document.getElementById('btn-demo-low');
  var btnDemoMid = document.getElementById('btn-demo-mid');
  var btnDemoHigh = document.getElementById('btn-demo-high');
  if (btnDemoLow) btnDemoLow.addEventListener('click', function () { fillDemoData(CONFIG.DEMO_DATA_LOW); });
  if (btnDemoMid) btnDemoMid.addEventListener('click', function () { fillDemoData(CONFIG.DEMO_DATA_MID); });
  if (btnDemoHigh) btnDemoHigh.addEventListener('click', function () { fillDemoData(CONFIG.DEMO_DATA_HIGH); });

  if (form) {
    form.querySelectorAll('input, select').forEach(function (el) {
      if (el.name) {
        el.addEventListener('input', function () { setFieldError(el.name, '', false); });
        el.addEventListener('change', function () { setFieldError(el.name, '', false); });
      }
    });
  }

  runSelfCheck();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
