/**
 * 24 小時前 IHCA 風險電子白板 — 示範用資料生成器
 * 每次執行產生 15–20 人隨機資料，符合指定 OR 模型與風險分級。
 * 禁止使用真實個資與真實病人描述。
 */
(function (global) {
  'use strict';

  var OR_LIST = {
    temp_c: 0.782,
    spo2: 0.96,
    pulse: 1.007,
    rr: 1.147,
    sbp: 0.992,
    dbp: 1.015,
    sex: 1.292,
    age_per_10y: 1.093,
    pleural_effusion: 1.862,
    mi: 1.431,
    hf: 1.597,
    albumin: 0.605,
    glucose: 0.998,
    hgb: 0.798,
    wbc: 1.102,
    egfr: 1.011,
    k: 1.475
  };

  var CENTERS = {
    temp_c: 36.8,
    spo2: 96,
    pulse: 85,
    rr: 18,
    sbp: 120,
    dbp: 70,
    albumin: 3.8,
    glucose: 130,
    hgb: 12.5,
    wbc: 8,
    egfr: 60,
    k: 4.2
  };

  var RANGES = {
    temp_c: [35.0, 39.5],
    spo2: [85, 100],
    pulse: [50, 140],
    rr: [10, 35],
    sbp: [80, 190],
    dbp: [40, 110],
    albumin: [2.0, 4.8],
    glucose: [60, 350],
    hgb: [7.0, 16.5],
    wbc: [2.0, 25.0],
    egfr: [5, 130],
    k: [2.8, 6.2],
    age: [20, 95]
  };

  // beta = ln(OR)
  var BETA = {};
  Object.keys(OR_LIST).forEach(function (key) {
    BETA[key] = Math.log(OR_LIST[key]);
  });

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomIn(min, max, decimals) {
    var v = min + Math.random() * (max - min);
    return decimals === undefined ? v : Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  function randomBool(probTrue) {
    return Math.random() < (probTrue !== undefined ? probTrue : 0.5);
  }

  /** 0 較多（約 0.85 機率為 0） */
  function randomZeroOne(probOne) {
    return Math.random() < (probOne !== undefined ? probOne : 0.15) ? 1 : 0;
  }

  function linearScore(rec) {
    var t = rec.temp_c - CENTERS.temp_c;
    var s = rec.spo2 - CENTERS.spo2;
    var p = rec.pulse - CENTERS.pulse;
    var r = rec.rr - CENTERS.rr;
    var sb = rec.sbp - CENTERS.sbp;
    var db = rec.dbp - CENTERS.dbp;
    var a = rec.albumin - CENTERS.albumin;
    var g = rec.glucose - CENTERS.glucose;
    var h = rec.hgb - CENTERS.hgb;
    var w = rec.wbc - CENTERS.wbc;
    var e = rec.egfr - CENTERS.egfr;
    var kk = rec.k - CENTERS.k;
    var sexVal = rec.sex === 'M' ? 1 : 0;
    var age10 = rec.age / 10;

    var linear =
      BETA.temp_c * t +
      BETA.spo2 * s +
      BETA.pulse * p +
      BETA.rr * r +
      BETA.sbp * sb +
      BETA.dbp * db +
      BETA.albumin * a +
      BETA.glucose * g +
      BETA.hgb * h +
      BETA.wbc * w +
      BETA.egfr * e +
      BETA.k * kk +
      BETA.sex * sexVal +
      BETA.age_per_10y * age10 +
      BETA.pleural_effusion * rec.pleural_effusion +
      BETA.mi * rec.mi +
      BETA.hf * rec.hf;
    return linear;
  }

  function probFromLinear(linear) {
    if (linear >= 0) return 1 / (1 + Math.exp(-linear));
    var e = Math.exp(linear);
    return e / (1 + e);
  }

  function riskScoreFromLinear(linear) {
    var p = probFromLinear(linear);
    return Math.round(p * 1000) / 10;
  }

  function riskLevelFromScore(score) {
    if (score >= 70) return 'High';
    if (score >= 30) return 'Medium';
    return 'Low';
  }

  /** 依目標等級產生一筆合理數值，再微調使 score 落在該等級 */
  function generateOne(targetLevel, index) {
    var rec = {};
    rec.patient_id = 'P' + (String(index + 1).length >= 3 ? String(index + 1) : ('00' + (index + 1)).slice(-3));
    rec.bed = randomInt(1, 12) + ['A', 'B', 'C', 'D', 'E'][randomInt(0, 4)] + '-' + randomInt(1, 30);
    rec.sex = randomBool(0.55) ? 'M' : 'F';
    rec.age = randomInt(RANGES.age[0], RANGES.age[1]);
    rec.pleural_effusion = randomZeroOne(0.12);
    rec.mi = randomZeroOne(0.1);
    rec.hf = randomZeroOne(0.15);

    var wantHigh = targetLevel === 'High';
    var wantLow = targetLevel === 'Low';

    rec.temp_c = randomIn(RANGES.temp_c[0], RANGES.temp_c[1], 1);
    rec.spo2 = randomIn(RANGES.spo2[0], RANGES.spo2[1], 0);
    rec.pulse = randomInt(RANGES.pulse[0], RANGES.pulse[1]);
    rec.rr = randomInt(RANGES.rr[0], RANGES.rr[1]);
    rec.sbp = randomInt(RANGES.sbp[0], RANGES.sbp[1]);
    rec.dbp = randomInt(RANGES.dbp[0], RANGES.dbp[1]);
    rec.albumin = randomIn(RANGES.albumin[0], RANGES.albumin[1], 1);
    rec.glucose = randomIn(RANGES.glucose[0], RANGES.glucose[1], 0);
    rec.hgb = randomIn(RANGES.hgb[0], RANGES.hgb[1], 1);
    rec.wbc = randomIn(RANGES.wbc[0], RANGES.wbc[1], 1);
    rec.egfr = randomInt(RANGES.egfr[0], RANGES.egfr[1]);
    rec.k = randomIn(RANGES.k[0], RANGES.k[1], 1);

    if (wantHigh) {
      rec.temp_c = Math.min(rec.temp_c, 38.5);
      rec.spo2 = Math.min(rec.spo2, 94);
      rec.pulse = Math.max(rec.pulse, 95);
      rec.rr = Math.max(rec.rr, 22);
      rec.sbp = Math.min(rec.sbp, 105);
      rec.albumin = Math.min(rec.albumin, 3.2);
      rec.hgb = Math.min(rec.hgb, 10.5);
      rec.wbc = Math.max(rec.wbc, 11);
      rec.k = Math.max(rec.k, 5.0);
      if (randomBool(0.6)) rec.pleural_effusion = 1;
      if (randomBool(0.5)) rec.hf = 1;
      rec.age = Math.max(rec.age, 65);
    } else if (wantLow) {
      rec.temp_c = CENTERS.temp_c + randomIn(-0.5, 0.5, 1);
      rec.spo2 = CENTERS.spo2 + randomInt(-2, 2);
      rec.pulse = CENTERS.pulse + randomInt(-15, 15);
      rec.rr = CENTERS.rr + randomInt(-3, 3);
      rec.sbp = CENTERS.sbp + randomInt(-15, 15);
      rec.dbp = CENTERS.dbp + randomInt(-8, 8);
      rec.albumin = CENTERS.albumin + randomIn(-0.4, 0.4, 1);
      rec.glucose = CENTERS.glucose + randomInt(-30, 30);
      rec.hgb = CENTERS.hgb + randomIn(-1, 1, 1);
      rec.wbc = CENTERS.wbc + randomIn(-2, 2, 1);
      rec.egfr = CENTERS.egfr + randomInt(-20, 20);
      rec.k = CENTERS.k + randomIn(-0.3, 0.3, 1);
      rec.pleural_effusion = 0;
      rec.mi = 0;
      rec.hf = 0;
      rec.age = Math.min(rec.age, 70);
    }

    var linear = linearScore(rec);
    var score = riskScoreFromLinear(linear);
    var level = riskLevelFromScore(score);

    var maxIter = 30;
    while (maxIter-- > 0 && level !== targetLevel) {
      if (targetLevel === 'High' && score < 70) {
        rec.rr = Math.min(RANGES.rr[1], rec.rr + 1);
        rec.spo2 = Math.max(RANGES.spo2[0], rec.spo2 - 1);
        rec.sbp = Math.max(RANGES.sbp[0], rec.sbp - 2);
        rec.k = Math.min(RANGES.k[1], rec.k + 0.1);
        if (randomBool(0.3)) rec.pleural_effusion = 1;
        if (randomBool(0.3)) rec.hf = 1;
      } else if (targetLevel === 'Medium' && (score < 30 || score >= 70)) {
        if (score >= 70) {
          rec.spo2 = Math.min(100, rec.spo2 + 2);
          rec.sbp = Math.min(140, rec.sbp + 5);
        } else {
          rec.rr = Math.min(28, rec.rr + 2);
          rec.spo2 = Math.max(88, rec.spo2 - 2);
        }
      } else if (targetLevel === 'Low' && score >= 30) {
        rec.spo2 = Math.min(100, rec.spo2 + 1);
        rec.sbp = Math.min(140, rec.sbp + 3);
        rec.rr = Math.max(12, rec.rr - 1);
        rec.k = Math.max(3.0, rec.k - 0.1);
        rec.pleural_effusion = 0;
        rec.hf = 0;
      }
      linear = linearScore(rec);
      score = riskScoreFromLinear(linear);
      level = riskLevelFromScore(score);
    }

    rec.risk_score = score;
    rec.risk_level = riskLevelFromScore(score);
    rec.key_drivers = buildKeyDrivers(rec);
    return rec;
  }

  function buildKeyDrivers(rec) {
    var drivers = [];
    if (rec.rr >= 22) drivers.push('RR↑');
    if (rec.k >= 5.0) drivers.push('K↑');
    if (rec.pleural_effusion === 1) drivers.push('Pleural effusion');
    if (rec.hf === 1) drivers.push('HF');
    if (rec.mi === 1) drivers.push('MI');
    if (rec.spo2 <= 92) drivers.push('SpO2↓');
    if (rec.sbp <= 100) drivers.push('SBP↓');
    if (rec.albumin <= 3.0) drivers.push('Albumin↓');
    if (rec.wbc >= 12) drivers.push('WBC↑');
    if (rec.age >= 75) drivers.push('Age↑');
    if (rec.hgb <= 10) drivers.push('Hb↓');
    if (rec.egfr <= 45) drivers.push('eGFR↓');
    if (drivers.length > 3) drivers = drivers.slice(0, 3);
    while (drivers.length < 3 && drivers.indexOf('—') === -1) drivers.push('—');
    return drivers.slice(0, 3).join('、');
  }

  /**
   * 產生一組示範白板資料。
   * @returns {Array} 依 risk_score 由高到低排序的病人陣列
   */
  function generateWhiteboardData() {
    var n = randomInt(15, 20);
    var nHigh = 2;
    var nMedium = 4;
    var nLow = n - nHigh - nMedium;
    if (nLow < 0) {
      nMedium = Math.max(4, n - 2);
      nLow = n - nHigh - nMedium;
    }

    var list = [];
    var i = 0;
    for (var h = 0; h < nHigh; h++) list.push(generateOne('High', i++));
    for (var m = 0; m < nMedium; m++) list.push(generateOne('Medium', i++));
    for (var l = 0; l < nLow; l++) list.push(generateOne('Low', i++));

    list.sort(function (a, b) { return b.risk_score - a.risk_score; });
    list.forEach(function (p, idx) {
      var n = idx + 1;
      p.patient_id = 'P' + (n >= 100 ? n : n >= 10 ? '0' + n : '00' + n);
    });
    return list;
  }

  function toMarkdownTable(list) {
    if (!list.length) return '';
    var keys = ['patient_id', 'bed', 'sex', 'age', 'pleural_effusion', 'mi', 'hf', 'temp_c', 'spo2', 'pulse', 'rr', 'sbp', 'dbp', 'albumin', 'glucose', 'hgb', 'wbc', 'egfr', 'k', 'risk_score', 'risk_level', 'key_drivers'];
    var head = '| ' + keys.join(' | ') + ' |';
    var sep = '|' + keys.map(function () { return '---'; }).join('|') + '|';
    var rows = list.map(function (p) {
      return '| ' + keys.map(function (k) { return p[k]; }).join(' | ') + ' |';
    });
    return head + '\n' + sep + '\n' + rows.join('\n');
  }

  function getWhiteboardOverview(list) {
    var high = list.filter(function (p) { return p.risk_level === 'High'; });
    var mid = list.filter(function (p) { return p.risk_level === 'Medium'; });
    var low = list.filter(function (p) { return p.risk_level === 'Low'; });
    var lines = [];
    lines.push('## High 風險（' + high.length + ' 人）');
    high.forEach(function (p) {
      lines.push('- ' + p.patient_id + ' | ' + p.bed + ' | ' + p.risk_score + ' | ' + p.key_drivers);
    });
    lines.push('');
    lines.push('## Medium 風險（' + mid.length + ' 人）');
    mid.forEach(function (p) {
      lines.push('- ' + p.patient_id + ' | ' + p.bed + ' | ' + p.risk_score + ' | ' + p.key_drivers);
    });
    lines.push('');
    lines.push('## Low 風險（' + low.length + ' 人）');
    low.forEach(function (p) {
      lines.push('- ' + p.patient_id + ' | ' + p.bed + ' | ' + p.risk_score + ' | ' + p.key_drivers);
    });
    return lines.join('\n');
  }

  global.WhiteboardDataGenerator = {
    generate: generateWhiteboardData,
    toMarkdownTable: toMarkdownTable,
    getWhiteboardOverview: getWhiteboardOverview,
    riskLevelFromScore: riskLevelFromScore,
    riskScoreFromLinear: function (rec) { return riskScoreFromLinear(linearScore(rec)); }
  };
})(typeof window !== 'undefined' ? window : typeof self !== 'undefined' ? self : this);
