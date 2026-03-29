import { attachCadillacRaceBenchmark } from '@/lib/cadillacRaceBenchmark';
import { loadSeasonRounds } from '@/lib/benchmark/loadSeasonRounds';

function formatGap(seconds) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) return 'N/A';
  const sign = seconds > 0 ? '+' : '';
  return `${sign}${seconds.toFixed(3)}s`;
}

function mapRoundToCard(round) {
  const withBenchmark = attachCadillacRaceBenchmark(round);
  const benchmark = withBenchmark.cadillac?.raceBenchmark;
  const driverNotes = withBenchmark.cadillac?.driverNotes ?? {};

  return {
    id: `${withBenchmark.year}-r-${String(withBenchmark.round).padStart(2, '0')}`,
    round: withBenchmark.round,
    grandPrixName: withBenchmark.grandPrixName,
    date: withBenchmark.date,
    narrative: null,
    heroMetric: {
      label: 'Race Score',
      value: benchmark?.bestCadillac?.raceScore ?? null,
    },
    supportingStats: [
      {
        label: 'Best Cadillac vs P10',
        value: formatGap(benchmark?.bestCadillac?.gapToP10Seconds),
      },
      {
        label: 'P15 vs P10 Window',
        value: formatGap(benchmark?.benchmark?.p15GapToP10Seconds),
      },
      {
        label: 'Best Cadillac Finish',
        value: benchmark?.bestCadillac?.finishPosition != null ? `P${benchmark.bestCadillac.finishPosition}` : 'N/A',
      },
    ],
    drivers: (benchmark?.drivers ?? []).map((driver) => ({
      driverCode: driver.driverCode,
      primaryValue: driver.finishPosition != null ? `P${driver.finishPosition} · ${formatGap(driver.gapToP10Seconds)}` : driver.status ?? 'N/A',
      score: driver.raceScore,
      note: driverNotes?.[driver.driverCode]?.headline ?? null,
    })),
    chartPoint: {
      round: withBenchmark.round,
      grandPrixName: withBenchmark.grandPrixName,
      date: withBenchmark.date,
      teamScore: benchmark?.bestCadillac?.raceScore ?? null,
      drivers: (benchmark?.drivers ?? []).map((driver) => ({
        driverCode: driver.driverCode,
        score: driver.raceScore,
      })),
    },
  };
}

export async function buildRaceBenchmarkPageModel() {
  const rounds = await loadSeasonRounds();
  const cards = rounds.map(mapRoundToCard);

  return {
    mode: 'race',
    tag: 'Cadillac F1 / Benchmark',
    title: 'Race Benchmark Dashboard',
    description: 'Formula: Score = (P15 Gap to P10 - Best Cadillac Gap to P10) / (P15 Gap to P10)',
    chart: {
      title: 'Race Score Trend',
      description:
        'Race score measures how close Cadillac’s best classified finisher came to the points window, using the P10-to-P15 gap as the normalized reference band.',
      teamLegend: 'Best classified Cadillac score',
      latestLabel: 'Latest',
      highestLabel: 'Season High',
      averageLabel: 'Season Avg',
      rounds: cards.map((card) => card.chartPoint),
    },
    cards: [...cards].reverse(),
    cardConfig: {
      narrativeTitle: null,
      driverPrimaryLabel: null,
    },
  };
}
