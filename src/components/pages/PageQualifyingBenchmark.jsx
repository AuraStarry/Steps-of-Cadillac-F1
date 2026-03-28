import { loadQualifyingBenchmarks } from '@/lib/qualifying/loadQualifyingBenchmarks';
import styles from '@/components/pages/PageQualifyingBenchmark.module.scss';

function scoreLabel(score) {
  if (score == null) return 'N/A';
  return score.toFixed(3);
}

export default async function PageQualifyingBenchmark() {
  const rounds = await loadQualifyingBenchmarks();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl bg-slate-950 px-5 py-14 text-slate-100">
      <section className="space-y-2">
        <p className="text-xs uppercase tracking-[0.12em] text-sky-300">Cadillac F1 / Benchmark</p>
        <h1 className="text-3xl font-semibold leading-tight md:text-5xl">Qualifying Benchmark Dashboard</h1>
        <p className="text-sm text-slate-400 md:text-base">
          指標公式：score = (Q1EliminatedAvg - CadillacTime) / (Q1EliminatedAvg - Q2EliminatedAvg)
        </p>
      </section>

      <section className="mt-7 grid gap-4">
        {rounds.map((round) => (
          <article
            key={round.round}
            className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-5"
          >
            <header>
              <h2 className="text-xl font-semibold">
                R{String(round.round).padStart(2, '0')} · {round.grandPrixName}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{round.date}</p>
            </header>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`rounded-xl p-3 ${styles.scoreAccent}`}>
                <span className="block text-xs text-slate-300">Team Score</span>
                <strong className="mt-1 block text-xl font-semibold">{scoreLabel(round.teamScore)}</strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="block text-xs text-slate-400">Cadillac Avg Time</span>
                <strong className="mt-1 block text-base font-semibold">{round.teamCadillacTime ?? 'N/A'}</strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="block text-xs text-slate-400">Q1 Eliminated Avg</span>
                <strong className="mt-1 block text-base font-semibold">{round.q1EliminatedAvg ?? 'N/A'}</strong>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="block text-xs text-slate-400">Q2 Eliminated Avg</span>
                <strong className="mt-1 block text-base font-semibold">{round.q2EliminatedAvg ?? 'N/A'}</strong>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="text-sm font-medium text-slate-300">Drivers</h3>
              <ul className="mt-2 grid gap-2">
                {round.drivers.map((driver) => (
                  <li
                    key={driver.driverCode}
                    className="grid grid-cols-[64px_1fr_70px] items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
                  >
                    <span className="text-sm font-medium">{driver.driverCode}</span>
                    <span className="text-sm text-slate-300">{driver.cadillacTime ?? 'N/A'}</span>
                    <strong className="text-right text-sm font-semibold">{scoreLabel(driver.score)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
