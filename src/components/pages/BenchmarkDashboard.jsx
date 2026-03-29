import CadillacBenchmarkTrendChart from '@/components/charts/CadillacBenchmarkTrendChart';
import styles from '@/components/pages/PageQualifyingBenchmark.module.scss';

function scoreLabel(score) {
  if (score == null) return 'N/A';
  return score.toFixed(3);
}

export default function BenchmarkDashboard({ model }) {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-5 py-14 text-[var(--cad-text)]">
      <section className="space-y-2 border-b border-[var(--cad-line)] pb-6">
        <p className={`${styles.sectionTag} text-xs text-zinc-300`}>{model.tag}</p>
        <h1 className="heading-cadillac text-3xl font-semibold leading-tight text-[var(--cad-text-strong)] md:text-5xl">{model.title}</h1>
        <p className="max-w-4xl text-sm text-[var(--cad-text-dim)] md:text-base">{model.description}</p>
      </section>

      <section className="mt-7">
        <CadillacBenchmarkTrendChart chart={model.chart} />
      </section>

      <section className="mt-7 grid gap-4">
        {model.cards.map((card) => (
          <article key={card.id} className={`${styles.cardFrame} rounded-none border border-[var(--cad-line)] bg-[var(--cad-panel)] p-5`}>
            <header>
              <h2 className="heading-cadillac text-xl font-semibold text-[var(--cad-text-strong)]">
                R{String(card.round).padStart(2, '0')} · {card.grandPrixName}
              </h2>
              <p className="mt-1 text-sm text-[var(--cad-text-dim)]">{card.date}</p>
            </header>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className={`rounded-none p-3 ${styles.scoreAccent}`}>
                <span className="block text-[11px] uppercase tracking-[0.14rem] text-zinc-300">{card.heroMetric.label}</span>
                <strong className="mt-1 block text-xl font-semibold text-[var(--cad-text-strong)]">{scoreLabel(card.heroMetric.value)}</strong>
              </div>
              {card.supportingStats.map((stat) => (
                <div key={stat.label} className="rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] p-3">
                  <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">{stat.label}</span>
                  <strong className="mt-1 block text-base font-semibold text-[var(--cad-text-strong)]">{stat.value ?? 'N/A'}</strong>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <h3 className="heading-cadillac text-sm font-medium text-zinc-300">Drivers</h3>
              <ul className="mt-2 grid gap-2">
                {card.drivers.map((driver) => (
                  <li key={driver.driverCode} className="rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] px-3 py-2">
                    <div className="grid grid-cols-[64px_1fr_70px] items-center gap-2">
                      <span className="heading-cadillac text-sm font-medium text-[var(--cad-text-strong)]">{driver.driverCode}</span>
                      <span className="text-sm text-zinc-300">{driver.primaryValue ?? 'N/A'}</span>
                      <strong className="text-right text-sm font-semibold text-[var(--cad-text-strong)]">{scoreLabel(driver.score)}</strong>
                    </div>
                    {driver.note ? <p className="mt-2 text-sm leading-6 text-[var(--cad-text-dim)]">{driver.note}</p> : null}
                  </li>
                ))}
              </ul>
            </div>

            {model.cardConfig?.narrativeTitle && card.narrative ? (
              <div className="mt-4">
                <h3 className="heading-cadillac text-sm font-medium text-zinc-300">{model.cardConfig.narrativeTitle}</h3>
                <div className="mt-2 rounded-none border border-[var(--cad-line-soft)] bg-[var(--cad-panel-2)] px-2 py-4">
                  <p className="text-sm leading-6 text-[var(--cad-text-dim)]">{card.narrative}</p>
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </section>
    </main>
  );
}
