import { attachCadillacQualifyingBenchmark } from '@/lib/cadillacQualifyingBenchmark';
import { loadSeasonRounds } from '@/lib/benchmark/loadSeasonRounds';

function mapRoundToCard(round) {
  const withBenchmark = attachCadillacQualifyingBenchmark(round);
  const benchmark = withBenchmark.cadillac?.qualifyingBenchmark;

  return {
    id: `${withBenchmark.year}-q-${String(withBenchmark.round).padStart(2, '0')}`,
    round: withBenchmark.round,
    grandPrixName: withBenchmark.grandPrixName,
    date: withBenchmark.date,
    narrative: withBenchmark.cadillac?.historicalContext ?? null,
    heroMetric: {
      label: 'Team Score',
      value: benchmark?.teamAverage?.score ?? null,
    },
    supportingStats: [
      {
        label: 'Cadillac Avg Time',
        value: benchmark?.teamAverage?.cadillacTime ?? null,
      },
      {
        label: 'Q1 Eliminated Avg',
        value: benchmark?.benchmarks?.q1EliminatedAvg ?? null,
      },
      {
        label: 'Q2 Eliminated Avg',
        value: benchmark?.benchmarks?.q2EliminatedAvg ?? null,
      },
    ],
    drivers: (benchmark?.drivers ?? []).map((driver) => ({
      driverCode: driver.driverCode,
      primaryValue: driver.cadillacTime ?? 'N/A',
      score: driver.score,
      note: null,
    })),
    chartPoint: {
      round: withBenchmark.round,
      grandPrixName: withBenchmark.grandPrixName,
      date: withBenchmark.date,
      teamScore: benchmark?.teamAverage?.score ?? null,
      drivers: benchmark?.drivers ?? [],
    },
  };
}

export async function buildQualifyingBenchmarkPageModel() {
  const rounds = await loadSeasonRounds();
  const cards = rounds.map(mapRoundToCard);

  return {
    mode: 'qualifying',
    tag: null,
    title: 'Qualifying Benchmark Dashboard',
    description: 'Formula: Score = (Q1 Eliminated AvgT - Cadillac Time) / (Q1 Eliminated AvgT - Q2 Eliminated AvgT)',
    chart: {
      title: 'Team Score Trend',
      description:
        'Team score measures Cadillac’s qualifying pace versus the field-average baseline, so higher numbers indicate more positive progress.',
      teamLegend: 'Cadillac average score',
      latestLabel: 'Latest',
      highestLabel: 'Season High',
      averageLabel: 'Season Avg',
      rounds: cards.map((card) => card.chartPoint),
    },
    cards: [...cards].reverse(),
    cardConfig: {
      narrativeTitle: 'Key Context',
      driverPrimaryLabel: null,
    },
  };
}
