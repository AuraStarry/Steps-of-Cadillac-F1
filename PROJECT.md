# PROJECT.md — Steps of Cadillac F1

> 開發流程：使用 PROJECT.md 作為唯一開發狀態真相來源；每次 session 結束前都要更新。

## ⚡ 快速入口
- **階段**: Phase 1 進行中（前端骨架已啟動）
- **DOING**: 建立 Cadillac race-card 記者模式（補齊階段事件 / 特殊事件的研究工作流）
- **最後更新**: 2026-03-28 Session 18（cadillac-reporter-mode skill + source map）

## 📋 當前 Phase TODO（按開發順序）

### Phase 0 — Discovery
1. [x] 定義專案目標（資訊站 / 內容企劃 / 工具型網站）
   - 定位：長期追蹤型 F1 資訊 / 敘事網站，以 Cadillac F1 作為主角
2. [ ] 定義目標受眾與主要使用情境
3. [x] 收斂 MVP 範圍（先做什麼、先不做什麼）
   - MVP 先做：每站 `qualifying` / `race` / `cadillac` 狀態
4. [x] 建立資訊來源清單（官方公告、F1 新聞來源）
   - 已整理 Cadillac 官方、FIA documents、OpenF1、Jolpica 與媒體補位的 source ladder，並落地 `skills/cadillac-reporter-mode/`
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
- 參照 https://www.cadillacf1team.com/ 萃取視覺邏輯並落地：
  - Typography：Heading 改為 condensed uppercase 系（`Barlow Condensed`），Body 為 `Montserrat`
  - Color System：建立黑/灰層次 + Cadillac 紅（`--cad-accent: #e61c1f`）
  - UI Grammar：卡片改為硬邊框 + 幾何斜角切邊（clip-path）+ 小方塊 section tag 語彙
  - 保留 Tailwind 為主，SCSS Module 用於品牌細節效果（accent panel / frame）
- 依 Gore 指示進一步改為 Dark-first 數據導向：
  - 背景改為更深黑階（`--cad-bg: #030303`）與 3 層面板對比（bg / panel / panel-2）
  - 文字層級分離（`text / text-strong / text-dim`）提升表格型資訊可讀性
  - accent 紅改為更克制，只保留在 score 焦點與 section marker
- 因 Vercel 阻擋「Vulnerable version of Next.js」：升級 `next` 到 `16.2.1`、`eslint-config-next` 到 `16.2.1`
- 驗證 `pnpm build` 通過（Next.js 16.2.1）
- 首頁在 round 列表上方導入 visx 折線圖：新增 team score season trend，latest round 以 Cadillac red 強調
- round 卡片列表改為最新在上，保留圖表使用時間正序呈現趨勢
- 新增首頁 chart shell / tooltip / meta cards 的品牌化 dark theme 樣式
- 安裝 `@visx/axis`、`@visx/event`、`@visx/group`、`@visx/responsive`、`@visx/scale`、`@visx/shape`、`@visx/tooltip`
- 再次驗證 `pnpm build` 通過（含 visx 導入後）
- 進一步降低 chart 背景紅色 overlay 透明度，減少對閱讀的干擾
- 將首頁 team trend 主線收細，降低圖表重量感
- 以低對比、虛線的方式加入兩位 Cadillac 車手 score traces，保留 team line 作為主視覺焦點
- tooltip 補充每站兩位車手 score，讓細節進入 hover 層而不是常駐搶畫面
- 再次驗證 `pnpm build` 通過（細化 chart 視覺後）
- 依 Gore 決策改採 helmet-inspired driver identity：BOT / PER 不直接使用原始安全帽色，而是轉為適配 Cadillac dark theme 的 muted blue / muted chartreuse
- 圖表新增簡潔 legend，讓閱讀者一眼辨識 Team / BOT / PER 三條線段的所屬與意義
- 完全移除 chart 背景的紅色漸層干擾，保留更純淨的 dark panel 閱讀體驗
- tooltip 內的 driver code 也與圖表 driver line 保持同色系映射，提升一致性
- 再次驗證 `pnpm build` 通過（legend + driver color system 調整後）
- 研究 Cadillac race-card 敘事資料來源，確認可分成 5 層 source ladder：Cadillac 官方、FIA documents、OpenF1、Jolpica、媒體補位
- 新增 `skills/cadillac-reporter-mode/SKILL.md`，定義記者模式的研究流程、證據優先級、輸出 schema 與 confidence 規則
- 新增 `skills/cadillac-reporter-mode/references/source-map.md`，整理實際可用網址、端點、用途與 sanity rules
- 使用 `quick_validate.py` 驗證新 skill 結構通過

---

*⚠️ 此檔案是本專案開發狀態的唯一真相來源。*