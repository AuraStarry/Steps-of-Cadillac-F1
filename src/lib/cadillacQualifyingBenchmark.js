/**
 * Cadillac qualifying benchmark calculator (for current round JSON format)
 *
 * score = (Q1EliminatedAvg - CadillacTime) / (Q1EliminatedAvg - Q2EliminatedAvg)
 */

const DEFAULTS = {
  metric: 'cadillac-progress-index',
  samplePolicy: 'clean-average',
  viewMode: 'teamAverage',
  cadillacTeamMatchers: ['Cadillac'],
  // Optional manual exclusions by driver code, e.g. ['LAW']
  excludeDriverCodes: [],
};

function toSeconds(timeText) {
  if (!timeText || typeof timeText !== 'string') return null;

  // F1 format: m:ss.xxx (also tolerate ss.xxx)
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

function toLapTimeString(totalSeconds) {
  if (typeof totalSeconds !== 'number' || Number.isNaN(totalSeconds)) return null;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${seconds}`;
}

function average(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function isCadillacTeam(teamName, matchers) {
  const n = (teamName || '').toLowerCase();
  return matchers.some((m) => n.includes(m.toLowerCase()));
}

function getRepresentativeTime(entry) {
  // Rule per DATA_MODEL.md
  // reached Q1 -> use Q1
  // reached Q2 -> use Q2
  // reached Q3 -> still use Q2 for this benchmark
  if (entry?.reached === 'Q3') return entry?.segments?.Q2 ?? null;
  if (entry?.reached === 'Q2') return entry?.segments?.Q2 ?? null;
  return entry?.segments?.Q1 ?? null;
}

function buildExclusionSet(options) {
  return new Set((options.excludeDriverCodes || []).map((x) => String(x).toUpperCase()));
}

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

export function computeCadillacQualifyingBenchmark(roundData, userOptions = {}) {
  const options = { ...DEFAULTS, ...userOptions };

  const entries = roundData?.qualifying?.entries || [];
  const cutoffs = roundData?.qualifying?.cutoffs || {};

  const q1Codes = cutoffs.Q1Eliminated || [];
  const q2Codes = cutoffs.Q2Eliminated || [];

  const exclusionSet = buildExclusionSet(options);

  const q1 = collectBenchmarkSamples(entries, q1Codes, 'Q1', exclusionSet);
  const q2 = collectBenchmarkSamples(entries, q2Codes, 'Q2', exclusionSet);

  const q1Avg = average(q1.samples);
  const q2Avg = average(q2.samples);

  const cadillacEntries = entries.filter((e) => isCadillacTeam(e.team, options.cadillacTeamMatchers));

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
