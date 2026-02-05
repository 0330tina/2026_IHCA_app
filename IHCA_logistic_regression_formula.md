# IHCA 院內心因性猝死風險預測：邏輯式回歸公式對照

**用途說明**：本文件為多變項邏輯式回歸模型之完整公式與係數對照，可供學位論文或技術報告引用。模型係數已固定，僅用於推論（inference），不進行再訓練。

---

## 1. 模型型式

多變項邏輯式回歸（multivariable logistic regression），連結函數為 logit。

---

## 2. Logit 線性預測式

令 **logit** 為線性預測值（linear predictor），其定義為：

$$\text{logit} = \beta_0 + \sum_{j=1}^{p} \beta_j \, x_j$$

本模型之**截距**與**迴歸係數**如下表，代入上式即得 logit 之計算公式。

### 2.1 截距（Intercept）

| 參數 | 符號 | 數值 |
|------|------|------|
| 截距 | \(\beta_0\) | **8.282** |

### 2.2 自變項與係數

| 序號 | 變項名稱（代號） | 係數 \(\beta_j\) | 說明（建議） |
|------|------------------|------------------|--------------|
| 1 | Temp__01_1 | **−0.146** | 體溫（°C） |
| 2 | Sp_01_1 | **−0.012** | 收縮壓（mmHg） |
| 3 | Dp_01_1 | **+0.008** | 舒張壓（mmHg） |
| 4 | Spo2_01_1 | **−0.037** | 血氧飽和度（%） |
| 5 | Age_per_10_year | **+0.112** | 年齡（每 10 歲為 1 單位） |
| 6 | Sex | **+0.242** | 性別（編碼依研究定義，如 1=男、0=女） |
| 7 | pleuraleffusion | **+0.645** | 肋膜積水（0/1） |
| 8 | MI | **+0.292** | 心肌梗塞（0/1） |
| 9 | HF | **+0.495** | 心衰竭（0/1） |
| 10 | Albumin | **−0.506** | 白蛋白（g/dL） |
| 11 | GlucoseAC | **−0.002** | 空腹血糖（mg/dL） |
| 12 | Hemoglobin | **−0.220** | 血紅素（g/dL） |
| 13 | WBC | **+0.095** | 白血球（×10³/μL） |
| 14 | e_GFR | **+0.010** | 估算腎絲球過濾率（mL/min/1.73 m²） |
| 15 | Potassium | **+0.365** | 鉀（mEq/L 或 mmol/L） |

### 2.3 完整 Logit 計算式（代數形式）

$$\begin{aligned}
\text{logit} &= 8.282 \\
&\quad + (-0.146) \times \text{Temp\_\_01\_1} \\
&\quad + (-0.012) \times \text{Sp\_01\_1} \\
&\quad + (0.008) \times \text{Dp\_01\_1} \\
&\quad + (-0.037) \times \text{Spo2\_01\_1} \\
&\quad + (0.112) \times \text{Age\_per\_10\_year} \\
&\quad + (0.242) \times \text{Sex} \\
&\quad + (0.645) \times \text{pleuraleffusion} \\
&\quad + (0.292) \times \text{MI} \\
&\quad + (0.495) \times \text{HF} \\
&\quad + (-0.506) \times \text{Albumin} \\
&\quad + (-0.002) \times \text{GlucoseAC} \\
&\quad + (-0.220) \times \text{Hemoglobin} \\
&\quad + (0.095) \times \text{WBC} \\
&\quad + (0.010) \times \text{e\_GFR} \\
&\quad + (0.365) \times \text{Potassium}
\end{aligned}$$

---

## 3. 機率轉換（Probability transformation）

事件機率 \(P\)（IHCA 發生之預測機率）由 logit 經標準邏輯函數（standard logistic function）轉換：

$$P = \frac{1}{1 + e^{-\text{logit}}} = \frac{e^{\text{logit}}}{1 + e^{\text{logit}}}$$

其中 \(e\) 為自然指數。\(P \in (0, 1)\)。

---

## 4. 風險分級規則（Risk stratification）

依預測機率 \(P\) 將個案分為三級：

| 條件 | 風險等級（Risk level） |
|------|------------------------|
| \(P < 0.10\) | Low |
| \(0.10 \le P < 0.30\) | Moderate |
| \(P \ge 0.30\) | High |

---

## 5. 輸出格式（實作用）

模型輸出可表示為：

```json
{
  "logit": "計算所得之 logit 數值",
  "probability": "P（依上式由 logit 計算）",
  "risk_level": "Low | Moderate | High"
}
```

---

## 6. 係數一覽（純數值，便於對照與複製）

```
截距 (β₀)            =  8.282
Temp__01_1           = -0.146
Sp_01_1              = -0.012
Dp_01_1              =  0.008
Spo2_01_1            = -0.037
Age_per_10_year      =  0.112
Sex                  =  0.242
pleuraleffusion      =  0.645
MI                   =  0.292
HF                   =  0.495
Albumin              = -0.506
GlucoseAC            = -0.002
Hemoglobin           = -0.220
WBC                  =  0.095
e_GFR                =  0.010
Potassium            =  0.365
```

---

## 7. 引用與聲明建議

- 本模型為**臨床決策輔助工具**，非診斷依據；結果應結合臨床專業判斷使用。
- 若於論文中引用係數或公式，請依貴單位規範註明模型來源與訓練/驗證資料。

---

*檔案產生自 IHCA 風險預測專案，係數與變項名稱與實作檔 riskCalc.js 一致。*
