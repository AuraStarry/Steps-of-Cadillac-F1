# DATA_FETCH_SKILL.md — F1 賽事資料抓取手冊

> 用途：未來要為 `Steps of Cadillac F1` 抓取賽事資料時，快速依照這份文件操作。

## 目標
把外部 F1 賽事資料穩定轉成專案內可用的 JSON，供 Next.js 網站使用。

主策略：
- **主資料來源：Jolpica F1 API**
- **補充來源：OpenF1（未來需要更細資料時再接）**
- **Cadillac 敘事欄位：人工撰寫**

---

## 為什麼先用 Jolpica
Jolpica 最適合這個專案目前的需求：
- 有 season / round 結構，天然支援多年資料
- 有完整 `qualifying` 結果
- 有完整 `race results`
- 資料格式容易映射到本專案 `DATA_MODEL.md`

---

## 核心 API

### 1) 取得下一站資訊
```txt
https://api.jolpi.ca/ergast/f1/current/next.json
```
用途：確認當前賽季下一站是哪一站，以及練習賽 / 排位 / 正賽時間。

### 2) 取得最近一場排位賽
```txt
https://api.jolpi.ca/ergast/f1/current/last/qualifying.json
```
用途：快速檢查最新已完成排位結果。

### 3) 取得指定年度 / 分站排位賽
```txt
https://api.jolpi.ca/ergast/f1/{year}/{round}/qualifying.json
```
例：
```txt
https://api.jolpi.ca/ergast/f1/2026/3/qualifying.json
```

### 4) 取得指定年度 / 分站正賽結果
```txt
https://api.jolpi.ca/ergast/f1/{year}/{round}/results.json
```
例：
```txt
https://api.jolpi.ca/ergast/f1/2026/3/results.json
```

### 5) 取得該季賽程
```txt
https://api.jolpi.ca/ergast/f1/{year}.json
```

---

## 即時性判斷規則

### 判斷今天排位賽是否已進 Jolpica
1. 先查 `current/next.json`
2. 讀出該站 `Qualifying.date` / `Qualifying.time`
3. 若現在時間已經晚於排位賽結束合理時間（通常 +1~3 小時）
4. 再查：
   - `current/{round}/qualifying.json`
   - 或 `{year}/{round}/qualifying.json`
5. 若 `QualifyingResults` 已存在且有完整名單，視為可用

### 備註
- `current/last/qualifying.json` 不一定是最穩的唯一檢查點
- 更可靠的是直接查「預定分站 round 的 qualifying endpoint」
- 例如本次驗證中：
  - `current/next.json` 顯示 2026 Round 3 日本站排位在 2026-03-28 06:00Z
  - 之後查 `2026/3/qualifying.json`，已可直接取回結果

---

## 與本專案資料模型的 mapping

## A. QualifyingResults -> `qualifying.entries`
Jolpica 欄位：
- `position`
- `Driver.givenName`
- `Driver.familyName`
- `Driver.code`
- `Constructor.name`
- `Q1`
- `Q2`
- `Q3`

映射規則：
- `driver` = `${givenName} ${familyName}`
- `driverCode` = `Driver.code`
- `team` = `Constructor.name`
- `bestTime` = 最後一個非空的 Q 欄位（優先 Q3 > Q2 > Q1）
- `reached` =
  - 有 `Q3` → `Q3`
  - 否則有 `Q2` → `Q2`
  - 否則 → `Q1`
- `status` =
  - position 1~10 且有 `Q3` → `classified`
  - 其餘也先可視為 `classified` 或 `eliminated`（建議用 `eliminated` 表示未進下一節）

### Cutoffs 推導
- `Q1Eliminated` = 只有 `Q1`、沒有 `Q2` 的車手代碼
- `Q2Eliminated` = 有 `Q2`、沒有 `Q3` 的車手代碼
- `Q3Participants` = 有 `Q3` 的車手代碼

---

## B. Results -> `race.entries`
Jolpica 欄位：
- `position`
- `Driver.*`
- `Constructor.name`
- `grid`
- `status`
- `Time.time`
- `points`

映射規則：
- `driver` = `${givenName} ${familyName}`
- `driverCode` = `Driver.code`
- `team` = `Constructor.name`
- `grid` = number
- `points` = number
- `time` = `Time.time ?? null`
- `status` 正規化：
  - `Finished` -> `finished`
  - `Disqualified` -> `DSQ`
  - `Did not start` -> `DNS`
  - 其他非 finished 狀態多數歸為 `DNF`

---

## C. Cadillac 狀態 `cadillac`
這部分**不是 API 自動生成**，必須人工補寫。

每站至少補：
- `phase`
- `phaseLabel`
- `competitiveTier`
- `weekendSummary`
- `progress[]`
- `problems[]`
- `outlook`

---

## 建議抓取流程（每個比賽週）

### 排位賽後
1. 查 `current/next.json` 確認當前 round
2. 抓 `{year}/{round}/qualifying.json`
3. 轉成專案 round JSON 的 `qualifying`
4. 人工補 `cadillac` 初步觀察
5. commit

### 正賽後
1. 抓 `{year}/{round}/results.json`
2. 轉成 `race`
3. 更新 `cadillac` 的週末總結
4. commit

---

## 可靠性結論（目前）
2026-03-28 驗證結果：
- 日本站（Round 3）排位賽時間：2026-03-28 06:00Z
- 同日檢查 `https://api.jolpi.ca/ergast/f1/2026/3/qualifying.json`
- **已成功回傳完整排位結果**

結論：
- **Jolpica 可作為本專案主資料來源**
- 至少對當日已完成排位賽，更新速度足以支撐本專案的資料維護流程

---

## 未來擴充
若之後需要：
- lap-by-lap
- pit stop
- weather
- telemetry
- race control

再補接：
- `OpenF1`

但在此之前，不要讓資料管線過早複雜化。
