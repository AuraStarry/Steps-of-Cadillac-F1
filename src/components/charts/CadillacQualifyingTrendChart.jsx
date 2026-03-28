'use client';

import { useMemo } from 'react';
import { scaleLinear, scalePoint } from '@visx/scale';
import { LinePath } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { ParentSize } from '@visx/responsive';
import { localPoint } from '@visx/event';
import { useTooltip, TooltipWithBounds, defaultStyles as defaultTooltipStyles } from '@visx/tooltip';
import styles from '@/components/pages/PageQualifyingBenchmark.module.scss';

const chartTheme = {
  axis: '#5f5f5f',
  grid: '#1c1c1c',
  line: '#d21b1e',
  bot: '#4E8FBA',
  per: '#A9BE57',
  point: '#f5f5f5',
  pointActive: '#d21b1e',
  text: '#f5f5f5',
  textDim: '#a3a3a3',
};

const driverColorMap = {
  BOT: chartTheme.bot,
  PER: chartTheme.per,
};

function scoreLabel(score) {
  if (score == null) return 'N/A';
  return score.toFixed(3);
}

function buildChartStats(rounds) {
  const validScores = rounds.map((round) => round.teamScore).filter((score) => score != null);
  const latest = rounds.at(-1) ?? null;
  const highest = validScores.length ? Math.max(...validScores) : null;
  const average = validScores.length
    ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length
    : null;

  return { latest, highest, average };
}

function TrendChartSvg({ rounds, width, height }) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip();

  const margin = { top: 20, right: 20, bottom: 42, left: 48 };
  const innerWidth = Math.max(width - margin.left - margin.right, 10);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 10);

  const data = useMemo(
    () => rounds.filter((round) => round.teamScore != null).map((round) => ({ ...round, label: `R${String(round.round).padStart(2, '0')}` })),
    [rounds],
  );

  if (!data.length) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-[var(--cad-text-dim)]">
        No benchmark data available.
      </div>
    );
  }

  const scores = data.flatMap((round) => [
    round.teamScore,
    ...(round.drivers || []).map((driver) => driver.score),
  ]).filter((score) => score != null);
  const minScore = Math.min(...scores);
  const maxScore = Math.max(...scores);
  const padding = Math.max((maxScore - minScore) * 0.2, 0.08);

  const driverCodes = Array.from(
    new Set(data.flatMap((round) => (round.drivers || []).map((driver) => driver.driverCode)).filter(Boolean)),
  );

  const driverSeries = driverCodes
    .map((driverCode) => ({
      driverCode,
      points: data
        .map((round) => {
          const driver = (round.drivers || []).find((entry) => entry.driverCode === driverCode);
          if (!driver || driver.score == null) return null;
          return {
            round: round.round,
            label: round.label,
            score: driver.score,
          };
        })
        .filter(Boolean),
    }))
    .filter((series) => series.points.length > 1);

  const xScale = scalePoint({
    domain: data.map((round) => round.label),
    range: [0, innerWidth],
    padding: 0.5,
  });

  const yScale = scaleLinear({
    domain: [minScore - padding, maxScore + padding],
    range: [innerHeight, 0],
    nice: true,
  });

  const tooltipStyles = {
    ...defaultTooltipStyles,
    background: 'transparent',
    border: 'none',
    boxShadow: 'none',
    padding: 0,
  };

  const handlePointerMove = (event) => {
    const coords = localPoint(event);
    if (!coords) return;

    const nearest = data.reduce(
      (best, datum) => {
        const x = xScale(datum.label) ?? 0;
        const distance = Math.abs(x - (coords.x - margin.left));
        if (!best || distance < best.distance) {
          return { datum, distance, x };
        }
        return best;
      },
      null,
    );

    if (!nearest) return;

    showTooltip({
      tooltipData: nearest.datum,
      tooltipLeft: nearest.x + margin.left,
      tooltipTop: (yScale(nearest.datum.teamScore) ?? 0) + margin.top,
    });
  };

  const latestRound = data.at(-1);

  return (
    <div className="relative h-full w-full" onPointerLeave={hideTooltip}>
      <svg width={width} height={height} onPointerMove={handlePointerMove}>
        <defs>
          <linearGradient id="cadillac-line-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a1214" />
            <stop offset="100%" stopColor={chartTheme.line} />
          </linearGradient>
        </defs>

        <Group left={margin.left} top={margin.top}>
          {[0.25, 0.5, 0.75].map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={innerWidth}
              y1={innerHeight * tick}
              y2={innerHeight * tick}
              stroke={chartTheme.grid}
              strokeWidth={1}
              strokeDasharray="4 8"
            />
          ))}

          <AxisLeft
            scale={yScale}
            stroke={chartTheme.axis}
            tickStroke={chartTheme.axis}
            numTicks={4}
            tickLabelProps={() => ({
              fill: chartTheme.textDim,
              fontSize: 11,
              textAnchor: 'end',
              dx: '-0.35em',
              dy: '0.33em',
            })}
            tickFormat={(value) => Number(value).toFixed(2)}
          />

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={chartTheme.axis}
            tickStroke={chartTheme.axis}
            tickLabelProps={() => ({
              fill: chartTheme.textDim,
              fontSize: 11,
              textAnchor: 'middle',
              dy: '0.9em',
            })}
          />

          {driverSeries.map((series) => (
            <LinePath
              key={series.driverCode}
              data={series.points}
              x={(datum) => xScale(datum.label) ?? 0}
              y={(datum) => yScale(datum.score) ?? 0}
              stroke={driverColorMap[series.driverCode] ?? chartTheme.textDim}
              opacity={0.58}
              strokeWidth={1.05}
              strokeDasharray="4 6"
              curve={null}
            />
          ))}

          <LinePath
            data={data}
            x={(datum) => xScale(datum.label) ?? 0}
            y={(datum) => yScale(datum.teamScore) ?? 0}
            stroke="url(#cadillac-line-glow)"
            strokeWidth={1.8}
            curve={null}
          />

          {data.map((datum) => {
            const isLatest = datum.round === latestRound.round;
            const isActive = tooltipData?.round === datum.round;
            const x = xScale(datum.label) ?? 0;
            const y = yScale(datum.teamScore) ?? 0;

            return (
              <g key={datum.round}>
                {(isActive || isLatest) && (
                  <circle cx={x} cy={y} r={isLatest ? 7 : 6} fill="rgba(210, 27, 30, 0.12)" />
                )}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive || isLatest ? 3.8 : 2.8}
                  fill={isActive || isLatest ? chartTheme.pointActive : chartTheme.point}
                  stroke={chartTheme.line}
                  strokeWidth={isActive || isLatest ? 1.25 : 0.9}
                />
              </g>
            );
          })}
        </Group>
      </svg>

      {tooltipData ? (
        <TooltipWithBounds left={tooltipLeft} top={tooltipTop} style={tooltipStyles}>
          <div className={`${styles.chartTooltip} px-3 py-2`}>
            <div className="heading-cadillac text-sm font-medium text-[var(--cad-text-strong)]">
              R{String(tooltipData.round).padStart(2, '0')} · {tooltipData.grandPrixName}
            </div>
            <div className="mt-1 text-xs text-[var(--cad-text-dim)]">{tooltipData.date}</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <span className="text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">Team Score</span>
              <strong className="text-base font-semibold text-[var(--cad-text-strong)]">
                {scoreLabel(tooltipData.teamScore)}
              </strong>
            </div>
            {(tooltipData.drivers || []).length ? (
              <div className="mt-3 space-y-2 border-t border-[var(--cad-line-soft)] pt-3">
                {(tooltipData.drivers || []).map((driver) => (
                  <div key={driver.driverCode} className="flex items-end justify-between gap-4 text-xs">
                    <span
                      className="heading-cadillac text-[11px] font-medium tracking-[0.12rem]"
                      style={{ color: driverColorMap[driver.driverCode] ?? 'var(--cad-text-dim)' }}
                    >
                      {driver.driverCode}
                    </span>
                    <strong className="font-semibold text-[var(--cad-text)]">{scoreLabel(driver.score)}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </TooltipWithBounds>
      ) : null}
    </div>
  );
}

export default function CadillacQualifyingTrendChart({ rounds }) {
  const stats = buildChartStats(rounds);

  return (
    <section className={`${styles.chartShell} ${styles.chartFrame} p-5 md:p-6`}>
      <header className="flex flex-col gap-3 border-b border-[var(--cad-line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className={`${styles.sectionTag} text-xs text-zinc-300`}>Trend / Season View</p>
          <div>
            <h2 className="heading-cadillac text-2xl font-semibold text-[var(--cad-text-strong)] md:text-3xl">
              Team Score Trend
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--cad-text-dim)]">
              Team score benchmarks Cadillac’s qualifying pace against the field baseline, where 0 is parity, positive values are faster, and negative values are slower.
            </p>
          </div>
        </div>

        <div className={`${styles.chartMeta} w-full md:max-w-lg`}>
          <div className={`${styles.chartMetaItem} px-3 py-3`}>
            <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">Latest</span>
            <strong className="mt-1 block text-lg font-semibold text-[var(--cad-text-strong)]">
              {scoreLabel(stats.latest?.teamScore ?? null)}
            </strong>
          </div>
          <div className={`${styles.chartMetaItem} px-3 py-3`}>
            <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">Season High</span>
            <strong className="mt-1 block text-lg font-semibold text-[var(--cad-text-strong)]">
              {scoreLabel(stats.highest)}
            </strong>
          </div>
          <div className={`${styles.chartMetaItem} px-3 py-3`}>
            <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">Season Avg</span>
            <strong className="mt-1 block text-lg font-semibold text-[var(--cad-text-strong)]">
              {scoreLabel(stats.average)}
            </strong>
          </div>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--cad-text-dim)]">
        <div className={`${styles.chartLegend} w-full`}>
          <div className={`${styles.chartLegendItem} px-3 py-2`}>
            <span className={styles.chartLegendSwatch} style={{ color: chartTheme.line }}>
              <span className={styles.chartLegendLine} />
            </span>
            <span>
              <strong className="font-medium text-[var(--cad-text)]">Team</strong> · Cadillac average score
            </span>
          </div>
          <div className={`${styles.chartLegendItem} px-3 py-2`}>
            <span className={styles.chartLegendSwatch} style={{ color: chartTheme.bot }}>
              <span className={styles.chartLegendDash} />
            </span>
            <span>
              <strong className="font-medium text-[var(--cad-text)]">BOT</strong>
            </span>
          </div>
          <div className={`${styles.chartLegendItem} px-3 py-2`}>
            <span className={styles.chartLegendSwatch} style={{ color: chartTheme.per }}>
              <span className={styles.chartLegendDash} />
            </span>
            <span>
              <strong className="font-medium text-[var(--cad-text)]">PER</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 h-[320px] w-full md:h-[380px]">
        <ParentSize>
          {({ width, height }) => <TrendChartSvg rounds={rounds} width={width} height={height} />}
        </ParentSize>
      </div>
    </section>
  );
}
