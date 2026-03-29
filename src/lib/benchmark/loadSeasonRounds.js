import fs from 'node:fs/promises';
import path from 'node:path';
import season2026 from '@/data/seasons/2026/season.json';

async function loadRound(filePath) {
  const absolutePath = path.join(process.cwd(), 'src/data/seasons/2026/rounds', filePath);
  const raw = await fs.readFile(absolutePath, 'utf8');
  return JSON.parse(raw);
}

export async function loadSeasonRounds() {
  const rounds = await Promise.all(
    season2026.rounds.map(async (roundMeta) => {
      const fileName = path.basename(roundMeta.file);
      return loadRound(fileName);
    }),
  );

  return rounds.sort((a, b) => a.round - b.round);
}
