/**
 * Cadillac Race Benchmark
 * ---------------------------------------------------------------------------
 * Normalize Cadillac's race competitiveness against the points window.
 *
 * Formula:
 *   score = (P15GapToP10 - CadillacBestGapToP10) / (P15GapToP10)
 *
 * Interpretation:
 *   - score = 1  → Cadillac matched P10
 *   - score = 0  → Cadillac matched P15
 *   - score < 0  → Cadillac was further back than P15 pace/window
 *   - score > 1  → Cadillac finished ahead of the P10 reference
 *
 * Rules:
 * - Main reference is the fastest Cadillac classified finisher.
 * - Denominator uses the P10 ↔ P15 gap of classified finishers.
 * - Preserve supporting raw fields for card copy, tooltips, and future recalculation.
 */

const DEFAULTS = {
  metric: 'cadillac-race-points-window-index',
  viewMode: 'bestCar',
  cadillacTeamMatchers: ['Cadillac'],
};

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function roundScore(value) {
  if (typeof value !== 'number' || Number.isNaN(value)) return null;
  return Number(value.toFixed(4));
}

function isCadillacTeam(teamName, matchers) {
  const n = (teamName || '').toLowerCase();
  return matchers.some((m) => n.includes(String(m).toLowerCase()));
}

function isClassified(entry) {
  const status = String(entry?.status || '').toLowerCase();
  return status === 'classified';
}

function sortByPosition(entries) {
  return [...entries].sort((a, b) => {
    const aPos = toNumber(a.position) ?? Number.POSITIVE_INFINITY;
    const bPos = toNumber(b.position) ?? Number.POSITIVE_INFINITY;
    return aPos - bPos;
  });
}

function normalizeDriverEntry(entry, p10GapSeconds) {
  const gapToLeader = toNumber(entry?.gapToLeaderSeconds);
  const gapToP10 = gapToLeader != null && p10GapSeconds != null
    ? roundScore(gapToLeader - p10GapSeconds)
    : null;

  return {
    driverCode: entry?.driverCode ?? null,
    finishPosition: toNumber(entry?.position),
    status: entry?.status ?? null,
    gapToLeaderSeconds: gapToLeader,
    gapToP10Seconds: gapToP10,
    raceScore: null,
  };
}

export function computeCadillacRaceBenchmark(roundData, userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };
  const entries = roundData?.race?.entries || [];
  const classified = sortByPosition(entries.filter(isClassified));

  const p10 = classified.find((entry) => toNumber(entry.position) === 10) ?? null;
  const p15 = classified.find((entry) => toNumber(entry.position) === 15) ?? null;
  const cadillacClassified = classified.filter((entry) => isCadillacTeam(entry.team, options.cadillacTeamMatchers));
  const cadillacAll = sortByPosition(entries.filter((entry) => isCadillacTeam(entry.team, options.cadillacTeamMatchers)));

  const p10GapSeconds = toNumber(p10?.gapToLeaderSeconds);
  const p15GapSeconds = toNumber(p15?.gapToLeaderSeconds);
  const denominator = p10GapSeconds != null && p15GapSeconds != null
    ? p15GapSeconds - p10GapSeconds
    : null;

  const drivers = cadillacAll.map((entry) => {
    const normalized = normalizeDriverEntry(entry, p10GapSeconds);

    if (normalized.gapToP10Seconds != null && denominator != null && denominator !== 0) {
      normalized.raceScore = roundScore((denominator - normalized.gapToP10Seconds) / denominator);
    }

    return normalized;
  });

  const bestCadillac = drivers
    .filter((entry) => entry.status?.toLowerCase() === 'classified')
    .sort((a, b) => {
      const aGap = a.gapToP10Seconds ?? Number.POSITIVE_INFINITY;
      const bGap = b.gapToP10Seconds ?? Number.POSITIVE_INFINITY;
      return aGap - bGap;
    })[0] ?? null;

  return {
    metric: options.metric,
    viewMode: options.viewMode,
    benchmark: {
      targetPosition: 10,
      denominatorPosition: 15,
      p10GapToLeaderSeconds: p10GapSeconds,
      p15GapToLeaderSeconds: p15GapSeconds,
      p15GapToP10Seconds: denominator != null ? roundScore(denominator) : null,
      classifiedCount: classified.length,
    },
    bestCadillac: {
      driverCode: bestCadillac?.driverCode ?? null,
      finishPosition: bestCadillac?.finishPosition ?? null,
      gapToP10Seconds: bestCadillac?.gapToP10Seconds ?? null,
      raceScore: bestCadillac?.raceScore ?? null,
    },
    drivers,
  };
}

export function attachCadillacRaceBenchmark(roundData, userOptions = {}) {
  const benchmark = computeCadillacRaceBenchmark(roundData, userOptions);

  return {
    ...roundData,
    cadillac: {
      ...(roundData?.cadillac || {}),
      raceBenchmark: benchmark,
    },
  };
}
