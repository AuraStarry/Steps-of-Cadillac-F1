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

  return <BenchmarkDashboard model={activeModel} mode={mode} setMode={setMode} modeLabels={modeLabels} />;
}
