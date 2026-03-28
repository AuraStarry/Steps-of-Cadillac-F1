import fs from 'node:fs/promises';
import path from 'node:path';
import season2026 from '@/data/seasons/2026/season.json';
import { attachCadillacQualifyingBenchmark } from '@/lib/cadillacQualifyingBenchmark';

async function loadRound(filePath) {
  const absolutePath = path.join(process.cwd(), 'src/data/seasons/2026/rounds', filePath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(raw);
}

export async function loadQualifyingBenchmarks() {
  const cards = await Promise.all(
    season2026.rounds.map(async (roundMeta) => {
      const fileName = path.basename(roundMeta.file);
      const round = await loadRound(fileName);
      const withBenchmark = attachCadillacQualifyingBenchmark(round);
      const benchmark = withBenchmark.cadillac?.qualifyingBenchmark;

      return {
        round: withBenchmark.round,
        grandPrixName: withBenchmark.grandPrixName,
        date: withBenchmark.date,
        whyItMatters: withBenchmark.cadillac?.whyItMatters ?? null,
        teamScore: benchmark?.teamAverage?.score ?? null,
        teamCadillacTime: benchmark?.teamAverage?.cadillacTime ?? null,
        q1EliminatedAvg: benchmark?.benchmarks?.q1EliminatedAvg ?? null,
        q2EliminatedAvg: benchmark?.benchmarks?.q2EliminatedAvg ?? null,
        drivers: benchmark?.drivers ?? [],
      };
    }),
  );

  return cards.sort((a, b) => a.round - b.round);
}
