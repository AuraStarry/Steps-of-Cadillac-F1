# PROJECT.md — Steps of Cadillac F1

> 開發流程：使用 PROJECT.md 作為唯一開發狀態真相來源；每次 session 結束前都要更新。

## ⚡ 快速入口
- **階段**: Phase 0 / Phase 1 交界 — Discovery 收斂中
- **DOING**: 補完 2026 賽季至今排位賽資料，並建立 season/round JSON 資料骨架
- **最後更新**: 2026-03-28 Session 6（2026 R1-R3 qualifying data）

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
6. [ ] 建立技術棧與目錄結構
7. [ ] 初始化首頁與共用版型
8. [x] 建立內容資料模型（文章 / 時間線 / 引用來源）
   - 已完成初版 `DATA_MODEL.md`：年度/分站 JSON 結構 + TypeScript 型別草案
   - 已補充 Cadillac qualifying benchmark：score 公式、teamAverage / driver 雙視角、方案 B 清洗規則
9. [!] 建立基本部署流程（中斷：下一步應開始 importer / 資料目錄骨架）
<!-- CONTEXT
- 已完成 benchmark 規格落地：DATA_MODEL.md + DATA_FETCH_SKILL.md 都已同步。
- 最新 commit: 2c27109 docs: define cadillac qualifying benchmark
- 中斷原因：目前 session 仍在超級模式（gpt-5.4），依 staged-dev 規則先停止到這裡。
- 下一步優先事項：
  1. 初始化技術棧（建議 Next.js + TypeScript）與 src/data/seasons/... 目錄
  2. 寫 importer 設計 / 首版 script，把 Jolpica qualifying/results 轉成 round JSON
  3. 用 2026 round 3 日本站做第一筆實測資料
-->

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

---

*⚠️ 此檔案是本專案開發狀態的唯一真相來源。*