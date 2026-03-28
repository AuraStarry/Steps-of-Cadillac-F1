/**
 * Cadillac Qualifying Benchmark
 * ---------------------------------------------------------------------------
 * 這個模組把 Cadillac 在排位賽的相對表現，標準化成可比較的 score。
 *
 * 公式：
 *   score = (Q1EliminatedAvg - CadillacTime) / (Q1EliminatedAvg - Q2EliminatedAvg)
 *
 * 解讀：
 *   - score = 0  → 等於 Q1 淘汰組平均
 *   - score = 1  → 等於 Q2 淘汰組平均
 *   - score < 0  → 比 Q1 淘汰組平均更慢
 *   - score > 1  → 比 Q2 淘汰組平均更快
 *
 * 注意：
 * - 此檔案刻意保留完整註解，因為這是「資料邏輯規格」的一部分。
 * - 若你是 AI/自動化代理，除非該段邏輯被刪除，否則不要刪註解。
 */

const DEFAULTS = {
  /** 指標名稱（供前端與資料層識別） */
  metric: 'cadillac-progress-index',

  /** 樣本策略標籤（目前採 clean-average） */
  samplePolicy: 'clean-average',

  /** 前端初始視角（可切換 teamAverage / driver） */
  viewMode: 'teamAverage',

  /** 用來識別 Cadillac 車隊的字串（模糊包含） */
  cadillacTeamMatchers: ['Cadillac'],

  /** 手動排除樣本（driverCode），例如 ['LAW'] */
  excludeDriverCodes: [],
};

/**
 * 把圈速字串轉成秒數。
 * 支援：
 * - m:ss.xxx (例如 1:30.245)
 * - ss.xxx   (容錯)
 */
function toSeconds(timeText) {
  if (!timeText || typeof timeText !== 'string') return null;

  const mss = timeText.match(/^(\d+):(\d{1,2}\.\d{3})$/);
  if (mss) {
    const minutes = Number(mss[1]);
    const seconds = Number(mss[2]);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }

  const ss = timeText.match(/^\d+\.\d{3}$/);
  if (ss) return Number(timeText);

  return null;
}

/** 把秒數格式化回 m:ss.xxx */
function toLapTimeString(totalSeconds) {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds)) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${seconds}`;
}

/** 計算平均值；空陣列回傳 null */
function average(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

/** 判斷某筆 entries 是否屬於 Cadillac 車手 */
function isCadillacTeam(teamName, matchers) {
  const n = (teamName || '').toLowerCase();
  return matchers.some((m) => n.includes(m.toLowerCase()));
}

/**
 * 代表時間選取規則（依 DATA_MODEL.md）：
 * - 止步 Q1：用 Q1
 * - 止步 Q2：用 Q2
 * - 進 Q3：仍用 Q2（此 benchmark 針對 Q1/Q2 分界）
 */
function getRepresentativeTime(entry) {
  if (entry?.reached === 'Q3') return entry?.segments?.Q2 ?? null;
  if (entry?.reached === 'Q2') return entry?.segments?.Q2 ?? null;
  return entry?.segments?.Q1 ?? null;
}

/** 建立 manual exclusion set，統一轉成大寫比較 */
function buildExclusionSet(options) {
  return new Set((options.excludeDriverCodes || []).map((x) => String(x).toUpperCase()));
}

/**
 * 收集某一組 benchmark 樣本（Q1 淘汰組或 Q2 淘汰組）。
 *
 * @param {Array} entries qualifying.entries
 * @param {Array<string>} codes driverCode list（來自 cutoffs）
 * @param {'Q1'|'Q2'} sessionKey 取樣節次
 * @param {Set<string>} exclusionSet 手動排除集合
 * @returns {{samples: number[], excludedEntries: Array}}
 */
function collectBenchmarkSamples(entries, codes, sessionKey, exclusionSet) {
  const samples = [];
  const excludedEntries = [];

  for (const entry of entries) {
    if (!codes.includes(entry.driverCode)) continue;

    if (exclusionSet.has(entry.driverCode)) {
      excludedEntries.push({
        driverCode: entry.driverCode,
        session: sessionKey,
        reason: 'manual-excluded-by-config',
      });
      continue;
    }

    const raw = entry?.segments?.[sessionKey];
    const sec = toSeconds(raw);

    if (sec == null) {
      excludedEntries.push({
        driverCode: entry.driverCode,
        session: sessionKey,
        reason: 'no-valid-session-time',
      });
      continue;
    }

    samples.push(sec);
  }

  return { samples, excludedEntries };
}

/**
 * 計算 Cadillac qualifying benchmark（純函式，不改動輸入）。
 *
 * 期待 roundData 結構：
 * - roundData.qualifying.entries[]
 * - roundData.qualifying.cutoffs.Q1Eliminated[] / Q2Eliminated[]
 *
 * @param {object} roundData 單站 JSON
 * @param {object} userOptions 覆寫預設選項
 * @returns {object} qualifyingBenchmark payload
 */
export function computeCadillacQualifyingBenchmark(roundData, userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };

  const entries = roundData?.qualifying?.entries || [];
  const cutoffs = roundData?.qualifying?.cutoffs || {};

  const q1Codes = cutoffs.Q1Eliminated || [];
  const q2Codes = cutoffs.Q2Eliminated || [];

  const exclusionSet = buildExclusionSet(options);

  // benchmark 分母兩端：Q1 淘汰組平均、Q2 淘汰組平均
  const q1 = collectBenchmarkSamples(entries, q1Codes, 'Q1', exclusionSet);
  const q2 = collectBenchmarkSamples(entries, q2Codes, 'Q2', exclusionSet);

  const q1Avg = average(q1.samples);
  const q2Avg = average(q2.samples);

  // 取得 Cadillac 車手條目
  const cadillacEntries = entries.filter((e) => isCadillacTeam(e.team, options.cadillacTeamMatchers));

  // 個別車手 score
  const drivers = cadillacEntries.map((entry) => {
    const rep = getRepresentativeTime(entry);
    const repSec = toSeconds(rep);

    let score = null;
    if (repSec != null && q1Avg != null && q2Avg != null && q1Avg !== q2Avg) {
      score = (q1Avg - repSec) / (q1Avg - q2Avg);
      score = Number(score.toFixed(4));
    }

    return {
      driverCode: entry.driverCode,
      cadillacTime: rep,
      score,
    };
  });

  // 車隊平均時間 / 分數
  const driverTimesSec = drivers
    .map((d) => toSeconds(d.cadillacTime))
    .filter((v) => v != null);

  const teamAvgSec = average(driverTimesSec);

  let teamScore = null;
  if (teamAvgSec != null && q1Avg != null && q2Avg != null && q1Avg !== q2Avg) {
    teamScore = (q1Avg - teamAvgSec) / (q1Avg - q2Avg);
    teamScore = Number(teamScore.toFixed(4));
  }

  return {
    metric: options.metric,
    samplePolicy: options.samplePolicy,
    viewMode: options.viewMode,
    benchmarks: {
      q1EliminatedAvg: toLapTimeString(q1Avg),
      q2EliminatedAvg: toLapTimeString(q2Avg),
    },
    teamAverage: {
      cadillacTime: toLapTimeString(teamAvgSec),
      score: teamScore,
    },
    drivers,
    excludedEntries: [...q1.excludedEntries, ...q2.excludedEntries],
  };
}

/**
 * 把 benchmark 掛回 roundData.cadillac.qualifyingBenchmark。
 * - 回傳新物件（immutable style）
 * - 不直接 mutate 傳入的 roundData
 */
export function attachCadillacQualifyingBenchmark(roundData, userOptions = {}) {
  const benchmark = computeCadillacQualifyingBenchmark(roundData, userOptions);

  return {
    ...roundData,
    cadillac: {
      ...(roundData?.cadillac || {}),
      qualifyingBenchmark: benchmark,
    },
  };
}
