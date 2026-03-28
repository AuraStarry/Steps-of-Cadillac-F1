import fs from 'node:fs/promises';
import path from 'node:path';
import season2026 from '@/data/seasons/2026/season.json';
import { attachCadillacQualifyingBenchmark } from '@/lib/cadillacQualifyingBenchmark';

type QualifyingEntry = {
  driver: string;
  driverCode: string;
  team: string;
};

type RoundData = {
  round: number;
  grandPrixName: string;
  date: string;
  qualifying: {
    entries: QualifyingEntry[];
  };
  cadillac?: {
    qualifyingBenchmark?: {
      teamAverage?: {
        score: number | null;
        cadillacTime: string | null;
      };
      benchmarks?: {
        q1EliminatedAvg: string | null;
        q2EliminatedAvg: string | null;
      };
      drivers?: Array<{
        driverCode: string;
        score: number | null;
        cadillacTime: string | null;
      }>;
    };
  };
};

export type QualifyingBenchmarkCard = {
  round: number;
  grandPrixName: string;
  date: string;
  teamScore: number | null;
  teamCadillacTime: string | null;
  q1EliminatedAvg: string | null;
  q2EliminatedAvg: string | null;
  drivers: Array<{
    driverCode: string;
    score: number | null;
    cadillacTime: string | null;
  }>;
};

async function loadRound(filePath: string): Promise<RoundData> {
  const absolutePath = path.join(process.cwd(), 'src/data/seasons/2026/rounds', filePath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(raw) as RoundData;
}

export async function loadQualifyingBenchmarks(): Promise<QualifyingBenchmarkCard[]> {
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
