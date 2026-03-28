import { loadQualifyingBenchmarks } from '@/lib/qualifying/loadQualifyingBenchmarks';
import CadillacQualifyingTrendChart from '@/components/charts/CadillacQualifyingTrendChart';
import styles from '@/components/pages/PageQualifyingBenchmark.module.scss';

function scoreLabel(score) {
  if (score == null) return 'N/A';
  return score.toFixed(3);
}

export default async function PageQualifyingBenchmark() {
  const rounds = await loadQualifyingBenchmarks();
  const roundsDescending = [...rounds].reverse();

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-14 text-[var(--cad-text)]">
      <section className="space-y-2 border-b border-[var(--cad-line)] pb-6">
        <p className={`${styles.sectionTag} text-xs text-zinc-300`}>Cadillac F1 / Benchmark</p>
        <h1 className="heading-cadillac text-3xl font-semibold leading-tight text-[var(--cad-text-strong)] md:text-5xl">
          Qualifying Benchmark Dashboard
        </h1>
        <p className="max-w-4xl text-sm text-[var(--cad-text-dim)] md:text-base">
          Formula: Score = (Q1 Eliminated AvgT - Cadillac Time) / (Q1 Eliminated AvgT - Q2 Eliminated AvgT)
        </p>
      </section>

      <section className="mt-7">
        <CadillacQualifyingTrendChart rounds={rounds} />
      </section>

      <section className="mt-7 grid gap-4">
        {roundsDescending.map((round) => (
          <article
            key={round.round}
            className={`${styles.cardFrame} rounded-none border border-[var(--cad-line)] bg-[var(--cad-panel)] p-5`}
          >
            <header>
              <h2 className="heading-cadillac text-xl font-semibold text-[var(--cad-text-strong)]">
                R{String(round.round).padStart(2, '0')} · {round.grandPrixName}
              </h2>
              <p className="mt-1 text-sm text-[var(--cad-text-dim)]">{round.date}</p>
            </header>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`rounded-none p-3 ${styles.scoreAccent}`}>
                <span className="block text-[11px] uppercase tracking-[0.14rem] text-zinc-300">Team Score</span>
                <strong className="mt-1 block text-xl font-semibold text-[var(--cad-text-strong)]">
                  {scoreLabel(round.teamScore)}
                </strong>
              </div>
              <div className="rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] p-3">
                <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">
                  Cadillac Avg Time
                </span>
                <strong className="mt-1 block text-base font-semibold text-[var(--cad-text-strong)]">
                  {round.teamCadillacTime ?? 'N/A'}
                </strong>
              </div>
              <div className="rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] p-3">
                <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">
                  Q1 Eliminated Avg
                </span>
                <strong className="mt-1 block text-base font-semibold text-[var(--cad-text-strong)]">
                  {round.q1EliminatedAvg ?? 'N/A'}
                </strong>
              </div>
              <div className="rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] p-3">
                <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">
                  Q2 Eliminated Avg
                </span>
                <strong className="mt-1 block text-base font-semibold text-[var(--cad-text-strong)]">
                  {round.q2EliminatedAvg ?? 'N/A'}
                </strong>
              </div>
            </div>

            <div className="mt-4">
              <h3 className="heading-cadillac text-sm font-medium text-zinc-300">Drivers</h3>
              <ul className="mt-2 grid gap-2">
                {round.drivers.map((driver) => (
                  <li
                    key={driver.driverCode}
                    className="grid grid-cols-[64px_1fr_70px] items-center gap-2 rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] px-3 py-2"
                  >
                    <span className="heading-cadillac text-sm font-medium text-[var(--cad-text-strong)]">{driver.driverCode}</span>
                    <span className="text-sm text-zinc-300">{driver.cadillacTime ?? 'N/A'}</span>
                    <strong className="text-right text-sm font-semibold text-[var(--cad-text-strong)]">
                      {scoreLabel(driver.score)}
                    </strong>
                  </li>
                ))}
              </ul>
            </div>

            {round.historicalContext ? (
              <div className="mt-4">
                <h3 className="heading-cadillac text-sm font-medium text-zinc-300">Key Context</h3>
                <div className="mt-2 rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] px-2 py-4">
                  <p className="text-sm leading-6 text-[var(--cad-text-dim)]">{round.historicalContext}</p>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
