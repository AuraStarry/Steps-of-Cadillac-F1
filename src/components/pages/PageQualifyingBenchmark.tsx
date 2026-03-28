import { loadQualifyingBenchmarks } from '@/lib/qualifying/loadQualifyingBenchmarks';

function scoreLabel(score: number | null) {
  if (score == null) return 'N/A';
  return score.toFixed(3);
}

export default async function PageQualifyingBenchmark() {
  const rounds = await loadQualifyingBenchmarks();

  return (
    <main className="page-root">
      <section className="hero">
        <p className="eyebrow">Cadillac F1 / Benchmark</p>
        <h1>Qualifying Benchmark Dashboard</h1>
        <p className="subtext">
          指標公式：score = (Q1EliminatedAvg - CadillacTime) / (Q1EliminatedAvg - Q2EliminatedAvg)
        </p>
      </section>

      <section className="cards">
        {rounds.map((round) => (
          <article key={round.round} className="card">
            <header>
              <h2>
                R{String(round.round).padStart(2, '0')} · {round.grandPrixName}
              </h2>
              <p>{round.date}</p>
            </header>

            <div className="metrics">
              <div>
                <span>Team Score</span>
                <strong>{scoreLabel(round.teamScore)}</strong>
              </div>
              <div>
                <span>Cadillac Avg Time</span>
                <strong>{round.teamCadillacTime ?? 'N/A'}</strong>
              </div>
              <div>
                <span>Q1 Eliminated Avg</span>
                <strong>{round.q1EliminatedAvg ?? 'N/A'}</strong>
              </div>
              <div>
                <span>Q2 Eliminated Avg</span>
                <strong>{round.q2EliminatedAvg ?? 'N/A'}</strong>
              </div>
            </div>

            <div>
              <h3>Drivers</h3>
              <ul className="drivers">
                {round.drivers.map((driver) => (
                  <li key={driver.driverCode}>
                    <span>{driver.driverCode}</span>
                    <span>{driver.cadillacTime ?? 'N/A'}</span>
                    <strong>{scoreLabel(driver.score)}</strong>
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
