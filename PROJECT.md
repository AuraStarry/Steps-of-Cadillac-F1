# PROJECT.md — Steps of Cadillac F1

> 開發流程：使用 PROJECT.md 作為唯一開發狀態真相來源；每次 session 結束前都要更新。

## ⚡ 快速入口
- **階段**: Phase 1 進行中（前端骨架已啟動）
- **DOING**: 共用 Benchmark Framework 第二階段視覺增強（branding / header hierarchy / SEO polish）
- **最後更新**: 2026-03-29 Session 41（site title + top branding tag refinement）

## 📋 當前 Phase TODO（按開發順序）

### Phase 0 — Discovery
1. [x] 定義專案目標（資訊站 / 內容企劃 / 工具型網站）
   - 定位：長期追蹤型 F1 資訊 / 敘事網站，以 Cadillac F1 作為主角
2. [x] 定義目標受眾與主要使用情境
   - 讀者預設為會看 F1、但未必持續追 Cadillac 的英文讀者；核心使用情境是用單一 dashboard 快速理解 Cadillac 在 `qualifying` / `race` 距離競爭帶與積分圈還有多遠
3. [x] 收斂 MVP 範圍（先做什麼、先不做什麼）
   - MVP 先做：每站 `qualifying` / `race` / `cadillac` 狀態
   - 呈現策略：首頁作為共用 benchmark surface，可在 Qualifying / Race 內容模式間切換
4. [x] 建立資訊來源清單（官方公告、F1 新聞來源）
   - 已整理 Cadillac 官方、FIA documents、OpenF1、Jolpica 與媒體補位的 source ladder，並落地 `skills/cadillac-reporter-mode/`
5. [x] 決定內容更新節奏（daily / race-week / ad-hoc）
   - 採 race-week / ad-hoc 為主：賽事週更新結果與敘事欄位，非賽事週只做必要補完與結構優化

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
10. [ ] 共用 Benchmark Framework（Qualifying / Race） ← DOING
   - [x] 在 `PROJECT.md` 固化本輪 spec：shared page shell、mode switch、Race Benchmark 公式、reporter-mode 雙輸出
   - [x] 更新 `skills/cadillac-reporter-mode/`：單一 research workflow 支援 `historicalContext` + `driverNotes`
   - [x] 定義 race benchmark data shape 與計算規格（最快 Cadillac classified finisher 對 P10，分母採 P10-P15）
   - [x] 抽出 shared benchmark page model / shell / chart / round-card framework
   - [x] 讓 Qualifying 頁先搬入 shared framework，確保現有功能不退化
   - [x] 建立 Race 頁資料 loader / benchmark 計算 / 英文欄位文案
   - [x] 在共用 surface 內加入 Qualifying / Race mode switch，先完成內容切換，不先做數字翻牌動畫
   - [x] 將 race driver rows 接上 `driverNotes` 呈現
   - [x] 驗證 `pnpm build` 與必要互動流程
   - [x] 補齊 round `race.entries` 原始資料（R1-R3 已補齊）
   - [ ] 第二階段視覺增強：研究數字牌翻轉 transition（可延後到主要功能完成後）
11. [ ] 時間線視圖（Cadillac F1 發展節點）
12. [ ] 資料卡片（車隊、車手、市場傳聞）
13. [ ] 搜尋 / 篩選
14. [ ] 手機版 UX 優化

## 🧭 工作規則（協作開發模式）
- 開工前先讀 `PROJECT.md`（先看快速入口 + DOING + 當前 TODO）
- 僅從最前面的未完成項目往下做，不跳號
- 若中途切換任務，需在 TODO 註記原因與中斷點
- 網站對外內容一律使用英文（標題、說明、卡片文案、敘事欄位、driver notes）
- 每次 session 結束前至少更新：
  1) 快速入口（階段 / DOING / 最後更新）
  2) TODO 勾選狀態與新拆分項
  3) Change Log

## 📝 Change Log
### 2026-03-29
- 將全站 `head title` / Open Graph / Twitter / JSON-LD 名稱統一收斂為 `STEPS OF CADILLAC`，並同步調整 description / keyword 語義
- 首頁頂部新增獨立品牌簽名標籤 `STEPS OF CADILLAC`，與 Qualifying / Race mode 的內容切換層級分離，強化頁首優雅度與品牌辨識
- 補修 `layout.jsx` metadata title template / `html lang` / `body` 呈現細節，讓全站 SEO 與語意設定一致
- 驗證 `pnpm build` 通過（site title + top branding tag + SEO metadata polish）
- Race card 調整：`Best Cadillac Finish` supporting stat 改為第一張，將核心完賽名次資訊前置
- Race drivers row 調整：移除 `Pxx · +/-gap to P10` 複合顯示，改為僅顯示 finish position（`Pxx`）
- Drivers 區塊視覺調整：driver code 顏色改為與 trend chart 一致（BOT 藍 / PER 綠）
- 驗證 `pnpm build` 通過（race card order + driver row simplification + driver color alignment）
- 修正 Race Trend team line 在 `position-gap-fallback` 模式下的 best Cadillac 選取邏輯：不再沿用失真的 `gapToP10Seconds` 排序，改依 `gapToP10Positions` / finish position 決定，避免 R3 Japanese GP 錯誤跟到 Bottas
- 驗證 `pnpm build` 通過（race trend best-car fallback 修正後）
- 重構 `skills/cadillac-reporter-mode/SKILL.md`：明確要求 driverNotes 以「當次遭遇 / 策略 / neutralisation timing」為主，將積分距離與泛用 pace 描述降級為 fallback
- 依新準則重寫 2026 R1-R3 的 `cadillac.historicalContext` 與 `driverNotes`，補入 China 首圈隊友碰撞 / deployment loss、Japan hard-tyre offset 與 lap-22 Safety Car timing 等敘事
- 補齊 2026 R3 日本站 round JSON 的 `race.entries`（來源：Jolpica Ergast-compatible results），並新增 Cadillac `driverNotes`
- 驗證 `pnpm build` 通過（R3 Japanese GP race data 補齊後）
- 補齊 2026 R1-R2 round JSON 的 `race.entries`（來源：Jolpica Ergast-compatible results），R3 暫不寫入以避免賽後早期資料波動
- `race.entries` 新增欄位規格：`status`（normalized）、`officialStatus`、`finishTime`、`gapToLeaderSeconds`，供 Race Benchmark 計算與 UI 呈現
- 補上 R1-R2 `cadillac.driverNotes`（BOT / PER 英文短註），Race mode 車手列可直接顯示 driver-level narrative
- 修正 Race Benchmark 計算邏輯：當 `gapToLeaderSeconds` 在分類成績中不具單調性（典型於 lapped 顯示）時，自動改用 `position-gap-fallback`，避免出現 P10 之外卻 >1 的錯誤分數
- Race card 會依 `scaleMode` 切換顯示秒差或 position gap，確保指標語意一致
- 驗證 `pnpm build` 通過（race score fallback 修正後）
- 驗證 `pnpm build` 通過（R1-R2 driver notes 補齊後）
- 驗證 `pnpm build` 通過（R1-R2 race data 補齊後）
- 首頁升級為單一 benchmark surface：新增 `BenchmarkModeSurface`，可在 Qualifying / Race 模式間切換內容
- 完成 `src/app/page.jsx` 文案更新與 JSON-LD `inLanguage: en`，首頁 metadata 由 qualifying-only 改為 dual-mode benchmark 描述
- 驗證 `pnpm build` 通過（mode switch + dual model 串接後）
- 與 Gore 敲定 Race Benchmark 第一版產品 spec：主體改為 `Cadillac 最快的 classified finisher` 相對 `P10` 的接近程度，正規化分母採 `P10-P15`
- 敲定內容架構方向：不新增獨立 driver reporter skill，改為升級既有 `cadillac-reporter-mode`，以單一 research workflow 同時支援 team-level `historicalContext` 與 race driver-level `driverNotes`
- 敲定頁面架構方向：Qualifying / Race 不走兩張完全獨立頁，而是收斂為 shared benchmark framework + mode switch，先完成內容切換，再於後續研究數字牌翻轉 transition
- 將網站內容規則寫入專案協作規範：所有對外網站內容一律使用英文
- 新增 `src/lib/cadillacRaceBenchmark.js`，正式落地 Race Benchmark 第一版公式與 data shape（best Cadillac classified finisher vs P10，denominator = P15-P10）
- 新增 `src/lib/benchmark/` page-model 層：抽出 season round loader、qualifying page model、race page model，開始把 domain logic 與 UI shell 分離
- 新增共用 `BenchmarkDashboard` 與 `CadillacBenchmarkTrendChart`，讓 Qualifying 頁面先搬入 shared framework，保留既有卡片/趨勢圖表現
- 驗證 `pnpm build` 通過（shared framework + race benchmark module 後）
- 修正手機版 Team Score Trend 圖表互動：點擊節點後會鎖定並顯示資料卡，再次點擊同節點可關閉，桌機 hover 行為維持不變
- 驗證 `pnpm build` 通過（mobile tap tooltip fix 後）
- 依 Gore 指示將網站標題統一改為 `STEPS OF CADILLAC F1`（layout metadata + page metadata + JSON-LD）
- 新增社群分享圖：匯入 `public/social-share.jpg`，並接上 Open Graph / Twitter images metadata
- 驗證 `pnpm build` 通過（title + social share image 更新後）

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
- 依 Gore 的需求微調記者模式：從較完整事件筆記收斂為「關鍵轉折層」，預設只保留最重要的 progress / disruption，避免膨脹成大報告
- 為 skill 補上 compact output 建議格式（headline + keyTurns），方便直接嵌入 race card
- 再次收斂記者模式：每站只保留唯一一個 `keyNarrative`，不再並列 progress / disruption，避免內容發水
- 依 Gore 最新需求再縮成最小落地格式：直接寫入 round data，並接到首頁卡片顯示
- 進一步修正文案語義：將欄位改名為 `cadillac.historicalContext`，卡片標題使用 `Key Context`，並將區塊移到 Drivers 下方、標題置於灰色內容區塊外
- 再次驗證 `pnpm build` 通過（historicalContext + card layout 調整後）
- 補完 R1 澳洲與 R2 中國的 `cadillac.historicalContext`，讓首頁前 3 站卡片都已有 Key Context 文案
- 再次驗證 `pnpm build` 通過（R1-R3 historicalContext 全覆蓋後）
- 依 Gore 指示調整 research weighting：改以外部新聞 / paddock 視角作為 Key Context 主敘事，官方文案降為補充來源
- 重寫 R1-R3 的 `historicalContext`，讓卡片更接近當時外界真正關注的事情，而不是 Cadillac 自我描述
- 小幅優化 `cadillac-reporter-mode`：將 Key Context 預設字數進一步壓短，要求首稿後再壓縮一次，刪去 setup / hedging / 無效子句，讓卡片更俐落
- 依新版 skill 規則重寫 R1-R3 的 `historicalContext`，拿掉機械式的固定句首（如 `From the outside`），並統一成更短、更像專欄摘要的卡片文案
- 再次驗證 `pnpm build` 通過（R1-R3 Key Context tighten rewrite 後）
- UI 微調：`Key Context` 內容框左右 padding 改為與 Drivers 一致（`calc(var(--spacing) * 2)` 對應 `px-2`），上下 padding 維持不變
- 再次驗證 `pnpm build` 通過（Key Context spacing alignment 後）
- 補完全站 SEO 欄位：`layout metadata` 新增 `metadataBase/title template/keywords/alternates/openGraph/twitter/robots`
- 首頁補上 page-level metadata 與 JSON-LD（`WebSite` + `SportsTeam` about）
- 新增 `src/app/robots.js` 與 `src/app/sitemap.js`，確保搜尋引擎 crawl/discovery 路徑完整
- 驗證 `pnpm build` 通過（含 `/robots.txt`、`/sitemap.xml` 靜態輸出）
- 依 Gore 回饋更新 Team Score Trend 標題下方說明：改為明確解釋 `score=0` 基準與正負值意義（>0 較快、<0 較慢）
- 驗證 `pnpm build` 通過（文案更新後）
- 依 Gore 回饋將 Team Score Trend 說明收斂為單句：同時定義 benchmark 基準、0 的意義與正負值方向
- 驗證 `pnpm build` 通過（單句文案版）
- 依 Gore 回饋修正 Team Score Trend baseline 語義：改為直接點出是對 field-average baseline 的相對衡量，並收斂成「數字越大＝正面進展越多」
- 驗證 `pnpm build` 通過（baseline 語義修正版）

---

*⚠️ 此檔案是本專案開發狀態的唯一真相來源。*