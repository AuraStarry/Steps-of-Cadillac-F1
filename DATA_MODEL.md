# DATA_MODEL.md — Steps of Cadillac F1

## 專案定位
這是一個長期追蹤型 F1 專案，主軸不是單純記錄賽果，而是：

**以 Cadillac F1 為敘事主角，持續記錄它從新入場、資源累積、技術追趕，到逐步向上挑戰的過程。**

因此資料結構需要同時支援兩種層次：
1. **客觀賽事資料**：每站排位、正式賽結果、車手/車隊排名、時間、狀態
2. **Cadillac 敘事資料**：當下所處階段、該站觀察、挑戰、進展

---

## 設計原則

### 1) 一開始就要支援多年資料
資料最上層必須有 `year`，不能只做單季結構。

### 2) Next.js 直接可讀
優先使用 **JSON 檔案**，讓 Next.js 可以在 build time 或 runtime 直接 import / fetch。

### 3) 人工維護友善
檔案應該按年度 / 分站拆開，避免全部資料塞在一個大檔。

### 4) 保留未來擴充空間
先支援排位賽、正式賽、Cadillac 階段；未來可再加：
- Sprint
- Practice sessions
- Constructor / Driver standings timeline
- 技術升級紀錄
- 新聞事件與傳聞

---

## 建議目錄結構

```txt
src/
  data/
    seasons/
      2026/
        season.json
        rounds/
          01-australia.json
          02-china.json
          03-japan.json
      2027/
        season.json
        rounds/
          01-australia.json
```

---

## 檔案層級

### A. `season.json`
用途：年度層級資訊

```json
{
  "year": 2026,
  "slug": "f1-2026",
  "name": "Formula 1 2026 Season",
  "cadillac": {
    "teamName": "Cadillac Formula 1 Team",
    "entryYear": 2026,
    "seasonGoal": "從新軍站穩中後段，建立穩定完賽與開發節奏",
    "seasonNarrative": "Cadillac 的第一個 F1 賽季，重點不是立刻爭冠，而是建立組織、理解比賽節奏並逐步縮小差距。"
  },
  "rounds": [
    {
      "round": 1,
      "slug": "australia",
      "name": "Australian Grand Prix",
      "date": "2026-03-08",
      "file": "./rounds/01-australia.json"
    }
  ]
}
```

### B. `rounds/<round>.json`
用途：單一分站完整資料

```json
{
  "year": 2026,
  "round": 1,
  "slug": "australia",
  "grandPrixName": "Australian Grand Prix",
  "circuit": "Albert Park Circuit",
  "country": "Australia",
  "date": "2026-03-08",
  "qualifying": {},
  "race": {},
  "cadillac": {}
}
```

---

## 核心資料結構

## 1. 排位賽 `qualifying`
需求：
- 所有車隊 / 車手排名
- 最佳時間
- Q1 ~ Q3 參與人員

建議結構：

```json
{
  "qualifying": {
    "sessionDate": "2026-03-07",
    "entries": [
      {
        "position": 1,
        "driver": "Max Verstappen",
        "driverCode": "VER",
        "team": "Red Bull",
        "bestTime": "1:15.123",
        "status": "classified",
        "reached": "Q3",
        "segments": {
          "Q1": "1:16.002",
          "Q2": "1:15.601",
          "Q3": "1:15.123"
        }
      },
      {
        "position": 17,
        "driver": "Cadillac Driver A",
        "driverCode": "CDA",
        "team": "Cadillac",
        "bestTime": "1:17.888",
        "status": "eliminated",
        "reached": "Q1",
        "segments": {
          "Q1": "1:17.888",
          "Q2": null,
          "Q3": null
        }
      }
    ],
    "cutoffs": {
      "Q1Eliminated": ["CDA", "CDB", "SAR", "BOT", "ZHO"],
      "Q2Eliminated": ["ALO", "STR", "TSU", "HUL", "MAG"],
      "Q3Participants": ["VER", "LEC", "NOR", "HAM", "RUS", "PIA", "SAI", "PER", "ALB", "GAS"]
    }
  }
}
```

### 欄位說明
- `entries`: 給表格 / 排名頁直接使用
- `reached`: 表示該車手走到哪一節（Q1 / Q2 / Q3）
- `segments`: 保留每節成績，方便之後做比較 UI
- `cutoffs`: 快速呈現 Q1~Q3 人員名單，不必再從 entries 重算

---

## 2. 正式賽 `race`
需求：
- 完賽排名
- 狀態
- 時間

建議結構：

```json
{
  "race": {
    "sessionDate": "2026-03-08",
    "laps": 58,
    "entries": [
      {
        "position": 1,
        "driver": "Charles Leclerc",
        "driverCode": "LEC",
        "team": "Ferrari",
        "grid": 2,
        "status": "finished",
        "time": "1:31:22.452",
        "points": 25
      },
      {
        "position": 14,
        "driver": "Cadillac Driver A",
        "driverCode": "CDA",
        "team": "Cadillac",
        "grid": 17,
        "status": "finished",
        "time": "+1 Lap",
        "points": 0
      },
      {
        "position": 18,
        "driver": "Cadillac Driver B",
        "driverCode": "CDB",
        "team": "Cadillac",
        "grid": 19,
        "status": "DNF",
        "time": null,
        "points": 0,
        "note": "Power unit issue"
      }
    ]
  }
}
```

### `status` 建議值
- `finished`
- `DNF`
- `DNS`
- `DSQ`

這樣前端做 badge/filter 會很乾淨。

---

## 3. Cadillac 當站狀態 `cadillac`
這是專案靈魂，不能只是賽果附註。

建議結構：

```json
{
  "cadillac": {
    "phase": "entry-build",
    "phaseLabel": "新軍起步期",
    "competitiveTier": "backmarker",
    "weekendSummary": "Cadillac 這站的重點仍是完賽與資料累積，排位速度不足，但 race pace 比預期穩定。",
    "progress": [
      "兩台車都成功進入排位完整流程",
      "正賽策略執行比前站更完整"
    ],
    "problems": [
      "單圈速度明顯落後中段集團",
      "輪胎管理仍不成熟"
    ],
    "outlook": "短期目標仍是穩定完賽與縮小與 Haas / Williams 的差距。"
  }
}
```

### 建議 enum
#### `phase`
- `entry-build`：新軍建置期
- `survival`：先求穩定完賽
- `catching-midfield`：追近中段
- `midfield-fight`：具備中段對抗能力
- `points-contention`：穩定挑戰積分
- `upper-midfield`：上中段競爭
- `podium-hope`：有機會摸到頒獎台

#### `competitiveTier`
- `backmarker`
- `lower-midfield`
- `midfield`
- `upper-midfield`
- `front-runner`

---

## TypeScript 型別草案

```ts
export type SessionReach = 'Q1' | 'Q2' | 'Q3'
export type ResultStatus = 'classified' | 'eliminated' | 'finished' | 'DNF' | 'DNS' | 'DSQ'
export type CadillacPhase =
  | 'entry-build'
  | 'survival'
  | 'catching-midfield'
  | 'midfield-fight'
  | 'points-contention'
  | 'upper-midfield'
  | 'podium-hope'

export type CompetitiveTier =
  | 'backmarker'
  | 'lower-midfield'
  | 'midfield'
  | 'upper-midfield'
  | 'front-runner'

export interface QualifyingEntry {
  position: number
  driver: string
  driverCode: string
  team: string
  bestTime: string | null
  status: 'classified' | 'eliminated'
  reached: SessionReach
  segments: {
    Q1: string | null
    Q2: string | null
    Q3: string | null
  }
}

export interface RaceEntry {
  position: number
  driver: string
  driverCode: string
  team: string
  grid: number
  status: 'finished' | 'DNF' | 'DNS' | 'DSQ'
  time: string | null
  points: number
  note?: string
}

export interface CadillacRoundState {
  phase: CadillacPhase
  phaseLabel: string
  competitiveTier: CompetitiveTier
  weekendSummary: string
  progress: string[]
  problems: string[]
  outlook: string
}

export interface RoundData {
  year: number
  round: number
  slug: string
  grandPrixName: string
  circuit: string
  country: string
  date: string
  qualifying: {
    sessionDate: string
    entries: QualifyingEntry[]
    cutoffs: {
      Q1Eliminated: string[]
      Q2Eliminated: string[]
      Q3Participants: string[]
    }
  }
  race: {
    sessionDate: string
    laps: number
    entries: RaceEntry[]
  }
  cadillac: CadillacRoundState
}
```

---

## 結論：MVP 建議
第一版先做這三塊就夠，而且剛好完全對應你的需求：

1. **年度資料夾**
2. **每站一個 JSON 檔**
3. 每站包含：
   - `qualifying`
   - `race`
   - `cadillac`

這樣的好處：
- 夠穩，能撐一年以上
- 給 Next.js 很順
- 後面擴欄位不會痛
- 已經內建「Cadillac 是主角」的敘事層，而不是只有賽果資料庫
