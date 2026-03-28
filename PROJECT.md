# PROJECT.md — Steps of Cadillac F1

> 開發流程：使用 PROJECT.md 作為唯一開發狀態真相來源；每次 session 結束前都要更新。

## ⚡ 快速入口
- **階段**: Phase 1 進行中（前端骨架已啟動）
- **DOING**: 依 Gore 決策從 TypeScript 降級為純 JavaScript，保留 Tailwind + SCSS Module 策略
- **最後更新**: 2026-03-28 Session 11（TS → JS）

## 📋 當前 Phase TODO（按開發順序）

### Phase 0 — Discovery
1. [x] 定義專案目標（資訊站 / 內容企劃 / 工具型網站）
   - 定位：長期追蹤型 F1 資訊 / 敘事網站，以 Cadillac F1 作為主角
2. [ ] 定義目標受眾與主要使用情境
3. [x] 收斂 MVP 範圍（先做什麼、先不做什麼）
   - MVP 先做：每站 `qualifying` / `race` / `cadillac` 狀態
4. [ ] 建立資訊來源清單（官方公告、F1 新聞來源）
5. [ ] 決定內容更新節奏（daily / race-week / ad-hoc）

### Phase 1 — 基礎建置
6. [x] 建立技術棧與目錄結構
   - 採用 Next.js App Router + TypeScript + pnpm
   - 建立 `src/app`、`src/components/pages`、`src/lib/qualifying` 目錄
7. [x] 初始化首頁與共用版型
   - `src/app/page.tsx` 目前僅引入 `PageQualifyingBenchmark`
   - `PageQualifyingBenchmark` 獨立為頁面級 component，方便未來 route 搬遷
8. [x] 建立內容資料模型（文章 / 時間線 / 引用來源）
   - 已完成初版 `DATA_MODEL.md`：年度/分站 JSON 結構 + TypeScript 型別草案
   - 已補充 Cadillac qualifying benchmark：score 公式、teamAverage / driver 雙視角、方案 B 清洗規則
9. [ ] 建立基本部署流程
   - 備註：本輪依 Gore 指示先啟動前端頁面，部署與 importer 稍後銜接

### Phase 2 — 功能迭代
10. [ ] 時間線視圖（Cadillac F1 發展節點）
11. [ ] 資料卡片（車隊、車手、市場傳聞）
12. [ ] 搜尋 / 篩選
13. [ ] 手機版 UX 優化

## 🧭 工作規則（協作開發模式）
- 開工前先讀 `PROJECT.md`（先看快速入口 + DOING + 當前 TODO）
- 僅從最前面的未完成項目往下做，不跳號
- 若中途切換任務，需在 TODO 註記原因與中斷點
- 每次 session 結束前至少更新：
  1) 快速入口（階段 / DOING / 最後更新）
  2) TODO 勾選狀態與新拆分項
  3) Change Log

## 📝 Change Log
### 2026-03-28
- 初始化 GitHub repo：`AuraStarry/Steps-of-Cadillac-F1`
- 建立 `PROJECT.md` 協作開發模式
- 根據 Gore 定義專案主軸：以 Cadillac F1 為主角，長期記錄其向上挑戰歷程
- 建立 `DATA_MODEL.md`，定義 year-aware 的 Next.js 用 JSON 資料結構
- 研究資料來源：初步比較 Jolpica/Ergast、OpenF1、官方/商業 API，結論先以 Jolpica/Ergast 作為主資料來源
- 驗證 Jolpica 即時性：2026-03-28 日本站（Round 3）排位賽已可於當日取得結果
- 建立 `DATA_FETCH_SKILL.md`，整理資料抓取端點、即時性判斷與 mapping 規則
- 定義 Cadillac qualifying benchmark：採 score normalization、teamAverage / driver 可切換、方案 B 清洗樣本
- 補完 2026 賽季至今（R1~R3）排位賽資料：新增 `src/data/seasons/2026/season.json` 與 `rounds/01~03` JSON
- 新增 `src/lib/cadillacQualifyingBenchmark.js`：抽離 benchmark 計算邏輯（含 `compute...` 與 `attach...`）
- 補強 `src/lib/cadillacQualifyingBenchmark.js` 註解與規格說明，降低後續維護誤改風險
- 新增 `AGENT.md`：明確規範 AI 不得任意刪除註解，除非對應程式邏輯已移除
- 初始化 Next.js + TypeScript + App Router 專案骨架（含 `package.json`、`tsconfig.json`、`next.config.ts`）
- 建立首頁架構：`src/app/page.tsx` 只做 `PageQualifyingBenchmark` 引入，便於後續改 route
- 新增 `src/components/pages/PageQualifyingBenchmark.tsx`，將排位 Benchmark 首頁內容獨立成可搬遷頁面組件
- 新增 `src/lib/qualifying/loadQualifyingBenchmarks.ts`，統一讀取 round JSON 並掛載 benchmark 計算
- 完成 `pnpm lint`、`pnpm build` 驗證（皆通過）
- 與 Gore 確認前端策略：App Router 保持、首頁 route 先不規劃搬遷、資料層先維持本地 JSON
- 導入 Tailwind CSS（主樣式）並新增 PostCSS 設定：`postcss.config.mjs`
- 精簡 `globals.css` 為全域樣式用途（含 tailwind import + reset）
- 安裝 `sass` 並新增 `PageQualifyingBenchmark.module.scss`，保留 SCSS Module 客製化能力
- 依 Gore 決策將前端程式碼改為純 JavaScript：`layout/page/component/lib` 全部從 TS/TSX 轉為 JS/JSX
- 移除 TypeScript 設定檔與相依（`tsconfig.json`、`next-env.d.ts`、`typescript` 與 `@types/*`）
- `next.config.ts` 改為 `next.config.mjs`，維持同等設定與行為

---

*⚠️ 此檔案是本專案開發狀態的唯一真相來源。*