import BenchmarkDashboard from '@/components/pages/BenchmarkDashboard';
import { buildQualifyingBenchmarkPageModel } from '@/lib/benchmark/buildQualifyingBenchmarkPageModel';

export default async function PageQualifyingBenchmark() {
  const model = await buildQualifyingBenchmarkPageModel();
  return <BenchmarkDashboard model={model} />;
}
