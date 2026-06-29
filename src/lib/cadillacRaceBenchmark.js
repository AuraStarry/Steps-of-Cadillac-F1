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
 * - If no Cadillac car is classified, preserve the round as an explicit non-classified
 *   outcome instead of treating it as missing data.
 * - Denominator uses the P10 ↔ P15 gap of classified finishers.
 * - Preserve supporting raw fields for card copy, tooltips, and future recalculation.
 */

const DEFAULTS = {
  metric: 'cadillac-race-points-window-index',
  viewMode: 'bestCar',
  cadillacTeamMatchers: ['Cadillac'],
};

function toNumber(value) {
  if (value == null || value === '') return null;
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

function normalizedStatus(entry) {
  return String(entry?.status || '').toLowerCase();
}

function isClassified(entry) {
  return normalizedStatus(entry) === 'classified';
}

function isNonClassified(entry) {
  return ['retired', 'dns', 'dsq', 'not-classified'].includes(normalizedStatus(entry));
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
    officialStatus: entry?.officialStatus ?? null,
    laps: toNumber(entry?.laps),
    gapToLeaderSeconds: gapToLeader,
    gapToP10Seconds: gapToP10,
    gapToP10Positions: null,
    raceScore: null,
  };
}

function hasMonotonicLeaderGaps(classifiedEntries) {
  let prev = -Infinity;

  for (const entry of classifiedEntries) {
    const gap = toNumber(entry?.gapToLeaderSeconds);
    if (gap == null) return false;
    if (gap < prev) return false;
    prev = gap;
  }

  return true;
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
  const timeDenominator = p10GapSeconds != null && p15GapSeconds != null
    ? p15GapSeconds - p10GapSeconds
    : null;

  const hasReliableTimeScale = hasMonotonicLeaderGaps(classified)
    && timeDenominator != null
    && timeDenominator > 0;

  const positionDenominator = 5; // P10 -> P15 window

  const drivers = cadillacAll.map((entry) => {
    const normalized = normalizeDriverEntry(entry, p10GapSeconds);

    if (!isClassified(entry)) {
      return normalized;
    }

    if (hasReliableTimeScale && normalized.gapToP10Seconds != null) {
      normalized.raceScore = roundScore((timeDenominator - normalized.gapToP10Seconds) / timeDenominator);
      return normalized;
    }

    if (normalized.finishPosition != null) {
      normalized.gapToP10Positions = normalized.finishPosition - 10;
      normalized.raceScore = roundScore((positionDenominator - normalized.gapToP10Positions) / positionDenominator);
    }

    return normalized;
  });

  const bestCadillac = drivers
    .filter((entry) => String(entry.status || '').toLowerCase() === 'classified')
    .sort((a, b) => {
      if (hasReliableTimeScale) {
        const aGap = a.gapToP10Seconds ?? Number.POSITIVE_INFINITY;
        const bGap = b.gapToP10Seconds ?? Number.POSITIVE_INFINITY;
        return aGap - bGap;
      }

      const aPosGap = a.gapToP10Positions ?? Number.POSITIVE_INFINITY;
      const bPosGap = b.gapToP10Positions ?? Number.POSITIVE_INFINITY;
      if (aPosGap !== bPosGap) return aPosGap - bPosGap;

      const aPos = a.finishPosition ?? Number.POSITIVE_INFINITY;
      const bPos = b.finishPosition ?? Number.POSITIVE_INFINITY;
      return aPos - bPos;
    })[0] ?? null;

  const nonClassifiedCadillacs = drivers.filter((entry) => isNonClassified(entry));
  const outcomeStatus = !entries.length
    ? 'no-race-data'
    : bestCadillac
      ? 'classified'
      : nonClassifiedCadillacs.length
        ? 'no-cadillac-classified'
        : 'no-cadillac-entry';
  const cadillacRetirementCount = nonClassifiedCadillacs.length;

  return {
    metric: options.metric,
    viewMode: options.viewMode,
    benchmark: {
      targetPosition: 10,
      denominatorPosition: 15,
      scaleMode: hasReliableTimeScale ? 'time-gap' : 'position-gap-fallback',
      p10GapToLeaderSeconds: p10GapSeconds,
      p15GapToLeaderSeconds: p15GapSeconds,
      p15GapToP10Seconds: timeDenominator != null ? roundScore(timeDenominator) : null,
      p15GapToP10Positions: positionDenominator,
      classifiedCount: classified.length,
    },
    outcome: {
      status: outcomeStatus,
      cadillacEntryCount: cadillacAll.length,
      cadillacClassifiedCount: cadillacClassified.length,
      cadillacNonClassifiedCount: cadillacRetirementCount,
    },
    bestCadillac: {
      driverCode: bestCadillac?.driverCode ?? null,
      finishPosition: bestCadillac?.finishPosition ?? null,
      gapToP10Seconds: bestCadillac?.gapToP10Seconds ?? null,
      gapToP10Positions: bestCadillac?.gapToP10Positions ?? null,
      raceScore: bestCadillac?.raceScore ?? null,
      resultStatus: bestCadillac?.status ?? null,
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
