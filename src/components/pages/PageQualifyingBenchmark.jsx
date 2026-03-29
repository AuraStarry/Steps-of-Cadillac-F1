import BenchmarkModeSurface from '@/components/pages/BenchmarkModeSurface';
import { buildQualifyingBenchmarkPageModel } from '@/lib/benchmark/buildQualifyingBenchmarkPageModel';
import { buildRaceBenchmarkPageModel } from '@/lib/benchmark/buildRaceBenchmarkPageModel';

export default async function PageQualifyingBenchmark() {
  const [qualifyingModel, raceModel] = await Promise.all([
    buildQualifyingBenchmarkPageModel(),
    buildRaceBenchmarkPageModel(),
  ]);

  return <BenchmarkModeSurface qualifyingModel={qualifyingModel} raceModel={raceModel} />;
}
