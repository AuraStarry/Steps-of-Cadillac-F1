'use client';

import { useMemo, useState } from 'react';
import BenchmarkDashboard from '@/components/pages/BenchmarkDashboard';

const modeLabels = {
  qualifying: 'Qualifying',
  race: 'Race',
};

export default function BenchmarkModeSurface({ qualifyingModel, raceModel }) {
  const [mode, setMode] = useState('qualifying');

  const activeModel = useMemo(() => (mode === 'race' ? raceModel : qualifyingModel), [mode, qualifyingModel, raceModel]);

  return (
    <div>
      <section className="mx-auto w-full max-w-6xl px-5 pt-10">
        <div className="inline-flex border border-[var(--cad-line)] bg-[var(--cad-panel)] p-1">
          {['qualifying', 'race'].map((item) => {
            const active = mode === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`heading-cadillac px-4 py-2 text-xs tracking-[0.12rem] transition ${
                  active
                    ? 'bg-[var(--cad-accent)] text-[var(--cad-text-strong)]'
                    : 'bg-transparent text-[var(--cad-text-dim)] hover:text-[var(--cad-text-strong)]'
                }`}
                aria-pressed={active}
              >
                {modeLabels[item]}
              </button>
            );
          })}
        </div>
      </section>

      <BenchmarkDashboard model={activeModel} />
    </div>
  );
}
