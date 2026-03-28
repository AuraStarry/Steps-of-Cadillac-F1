# PROJECT.md — Steps of Cadillac F1

> 開發流程：使用 PROJECT.md 作為唯一開發狀態真相來源；每次 session 結束前都要更新。

## ⚡ 快速入口
- **階段**: Phase 0 — Discovery / Scope 定義
- **DOING**: 依 Gore 需求定義長期賽事資料模型（year-aware、Next.js 可直接使用）
- **最後更新**: 2026-03-28 Session 2（完成專案定位與初版資料模型）

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
9. [ ] 建立基本部署流程

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

---

*⚠️ 此檔案是本專案開發狀態的唯一真相來源。*