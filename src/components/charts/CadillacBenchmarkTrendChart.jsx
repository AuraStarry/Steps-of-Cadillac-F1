'use client';

import { useMemo, useState } from 'react';
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
  retirement: '#a78bfa',
};

const driverColorMap = {
  BOT: chartTheme.bot,
  PER: chartTheme.per,
};

function scoreLabel(score, fallback = 'N/A') {
  if (score == null) return fallback;
  return score.toFixed(3);
}

function shouldShowDriverScore(driver) {
  if (driver?.score == null) return false;
  const status = String(driver?.status || '').toLowerCase();
  return !['retired', 'dns', 'dsq'].includes(status);
}

function isNonClassifiedDriverStatus(driver) {
  const status = String(driver?.status || '').toLowerCase();
  return ['retired', 'dns', 'dsq'].includes(status);
}

function renderStatusMarker({ driverCode, point, xScale, yScale, markerScale = 1 }) {
  const x = xScale(point.label) ?? 0;
  const y = yScale(point.score) ?? 0;
  const color = driverColorMap[driverCode] ?? chartTheme.textDim;
  const status = String(point.status || '').toLowerCase();
  const crossHalfSize = 4 * markerScale;

  if (status === 'retired') {
    return (
      <g key={`${driverCode}-${point.round}-status-drop`} opacity={0.96}>
        <line x1={x - crossHalfSize} y1={y - crossHalfSize} x2={x + crossHalfSize} y2={y + crossHalfSize} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
        <line x1={x - crossHalfSize} y1={y + crossHalfSize} x2={x + crossHalfSize} y2={y - crossHalfSize} stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      </g>
    );
  }

  return (
    <circle
      key={`${driverCode}-${point.round}-status-drop`}
      cx={x}
      cy={y}
      r={3.6 * markerScale}
      fill="var(--cad-panel)"
      stroke={color}
      strokeWidth={1.5}
      opacity={0.96}
    />
  );
}

function hasChartEvent(round) {
  return round?.teamScore != null || (round?.drivers || []).some((driver) => isNonClassifiedDriverStatus(driver));
}

function buildChartStats(rounds) {
  const validScores = rounds.map((round) => round.teamScore).filter((score) => score != null);
  const latest = rounds.filter(hasChartEvent).at(-1) ?? null;
  const highest = validScores.length ? Math.max(...validScores) : null;
  const average = validScores.length ? validScores.reduce((sum, score) => sum + score, 0) / validScores.length : null;

  return { latest, highest, average };
}

function TrendChartSvg({ rounds, width, height }) {
  const { showTooltip, hideTooltip, tooltipData, tooltipLeft = 0, tooltipTop = 0 } = useTooltip();
  const [pinnedTooltip, setPinnedTooltip] = useState(null);

  const data = useMemo(
    () => rounds.filter(hasChartEvent).map((round) => ({ ...round, label: `R${String(round.round).padStart(2, '0')}` })),
    [rounds],
  );

  const showRetirementAxisCounts = data.some((round) => round.retirementCount != null);
  const retirementCountByLabel = new Map(data.map((round) => [round.label, round.retirementCount]));
  const margin = { top: 20, right: 20, bottom: showRetirementAxisCounts ? 58 : 42, left: 48 };
  const innerWidth = Math.max(width - margin.left - margin.right, 10);
  const innerHeight = Math.max(height - margin.top - margin.bottom, 10);

  if (!data.length) {
    return <div className="flex h-full items-center justify-center text-sm text-[var(--cad-text-dim)]">No benchmark data available.</div>;
  }

  const scores = data.flatMap((round) => [round.teamScore, ...(round.drivers || []).map((driver) => driver.score)]).filter((score) => score != null);
  const minScore = scores.length ? Math.min(...scores) : 0;
  const maxScore = scores.length ? Math.max(...scores) : 1;
  const padding = Math.max((maxScore - minScore) * 0.2, 0.08);
  const statusDropDepth = Math.max((maxScore - minScore) * 0.35, 0.25);
  const chartFloorScore = minScore - padding - statusDropDepth;

  const driverCodes = Array.from(new Set(data.flatMap((round) => (round.drivers || []).map((driver) => driver.driverCode)).filter(Boolean)));
  const driverSeries = driverCodes
    .map((driverCode) => ({
      driverCode,
      points: data
        .map((round) => {
          const driver = (round.drivers || []).find((entry) => entry.driverCode === driverCode);
          if (!driver) return null;
          if (shouldShowDriverScore(driver)) {
            return { round: round.round, label: round.label, score: driver.score, isStatusDrop: false };
          }
          if (isNonClassifiedDriverStatus(driver)) {
            return { round: round.round, label: round.label, score: chartFloorScore, isStatusDrop: true, status: driver.status };
          }
          return null;
        })
        .filter(Boolean),
    }))
    .filter((series) => series.points.length > 0);

  const teamLineData = data.filter((round) => round.teamScore != null);

  const xScale = scalePoint({ domain: data.map((round) => round.label), range: [0, innerWidth], padding: 0.5 });
  const yScale = scaleLinear({ domain: [chartFloorScore, maxScore + padding], range: [innerHeight, 0], nice: true });

  const tooltipStyles = { ...defaultTooltipStyles, background: 'transparent', border: 'none', boxShadow: 'none', padding: 0 };

  const findNearestDatum = (event) => {
    const coords = localPoint(event);
    if (!coords) return null;

    return data.reduce((best, datum) => {
      const x = xScale(datum.label) ?? 0;
      const distance = Math.abs(x - (coords.x - margin.left));
      if (!best || distance < best.distance) return { datum, distance, x };
      return best;
    }, null);
  };

  const showDatumTooltip = (nearest) => {
    if (!nearest) return;
    showTooltip({
      tooltipData: nearest.datum,
      tooltipLeft: nearest.x + margin.left,
      tooltipTop: (yScale(nearest.datum.teamScore ?? chartFloorScore) ?? 0) + margin.top,
    });
  };

  const handlePointerMove = (event) => {
    if (pinnedTooltip) return;
    showDatumTooltip(findNearestDatum(event));
  };

  const handlePointerLeave = () => {
    if (pinnedTooltip) return;
    hideTooltip();
  };

  const handleChartClick = (event) => {
    const nearest = findNearestDatum(event);
    if (!nearest) return;
    const nextPinnedRound = pinnedTooltip?.datum.round === nearest.datum.round ? null : nearest;
    setPinnedTooltip(nextPinnedRound);
    if (nextPinnedRound) return showDatumTooltip(nextPinnedRound);
    hideTooltip();
  };

  const activeTooltip = pinnedTooltip
    ? {
        tooltipData: pinnedTooltip.datum,
        tooltipLeft: pinnedTooltip.x + margin.left,
        tooltipTop: (yScale(pinnedTooltip.datum.teamScore ?? chartFloorScore) ?? 0) + margin.top,
      }
    : { tooltipData, tooltipLeft, tooltipTop };

  const latestRound = data.at(-1);
  const statusMarkerOccurrenceByKey = new Map();

  return (
    <div className="relative h-full w-full" onPointerLeave={handlePointerLeave}>
      <svg width={width} height={height} onPointerMove={handlePointerMove} onClick={handleChartClick}>
        <defs>
          <linearGradient id="cadillac-line-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8a1214" />
            <stop offset="100%" stopColor={chartTheme.line} />
          </linearGradient>
        </defs>

        <Group left={margin.left} top={margin.top}>
          {[0.25, 0.5, 0.75].map((tick) => (
            <line key={tick} x1={0} x2={innerWidth} y1={innerHeight * tick} y2={innerHeight * tick} stroke={chartTheme.grid} strokeWidth={1} strokeDasharray="4 8" />
          ))}

          <AxisLeft
            scale={yScale}
            stroke={chartTheme.axis}
            tickStroke={chartTheme.axis}
            numTicks={4}
            tickLabelProps={() => ({ fill: chartTheme.textDim, fontSize: 11, textAnchor: 'end', dx: '-0.35em', dy: '0.33em' })}
            tickFormat={(value) => Number(value).toFixed(2)}
          />

          <AxisBottom
            top={innerHeight}
            scale={xScale}
            stroke={chartTheme.axis}
            tickStroke={chartTheme.axis}
            tickLabelProps={() => ({ fill: chartTheme.textDim, fontSize: 11, textAnchor: 'middle', dy: '0.9em' })}
            tickComponent={({ x, y, formattedValue, ...tickProps }) => {
              const retirementCount = retirementCountByLabel.get(formattedValue);

              return (
                <text {...tickProps} x={x} y={y} textAnchor="middle" dominantBaseline="middle">
                  <tspan x={x} fill={chartTheme.textDim}>{formattedValue}</tspan>
                  {showRetirementAxisCounts && retirementCount != null ? (
                    <tspan x={x} dy="1.25em" fill={chartTheme.retirement} opacity={0.82}>-{retirementCount}</tspan>
                  ) : null}
                </text>
              );
            }}
          />

          {driverSeries.map((series) => (
            <g key={series.driverCode}>
              <LinePath
                data={series.points}
                x={(datum) => xScale(datum.label) ?? 0}
                y={(datum) => yScale(datum.score) ?? 0}
                stroke={driverColorMap[series.driverCode] ?? chartTheme.textDim}
                opacity={0.58}
                strokeWidth={1.05}
                strokeDasharray="4 6"
                curve={null}
              />
              {series.points
                .filter((point) => point.isStatusDrop)
                .map((point) => {
                  const overlapKey = `${point.label}-${point.score}`;
                  const overlapIndex = statusMarkerOccurrenceByKey.get(overlapKey) ?? 0;
                  statusMarkerOccurrenceByKey.set(overlapKey, overlapIndex + 1);

                  return renderStatusMarker({
                    driverCode: series.driverCode,
                    point,
                    xScale,
                    yScale,
                    markerScale: overlapIndex > 0 ? 1.07 : 1,
                  });
                })}
            </g>
          ))}

          {teamLineData.length > 1 ? (
            <LinePath data={teamLineData} x={(datum) => xScale(datum.label) ?? 0} y={(datum) => yScale(datum.teamScore) ?? 0} stroke="url(#cadillac-line-glow)" strokeWidth={1.8} curve={null} />
          ) : null}

          {teamLineData.map((datum) => {
            const isLatest = datum.round === latestRound.round;
            const isActive = activeTooltip.tooltipData?.round === datum.round;
            const x = xScale(datum.label) ?? 0;
            const y = yScale(datum.teamScore) ?? 0;

            return (
              <g key={datum.round}>
                {(isActive || isLatest) && <circle cx={x} cy={y} r={isLatest ? 7 : 6} fill="rgba(210, 27, 30, 0.12)" />}
                <circle cx={x} cy={y} r={isActive || isLatest ? 3.8 : 2.8} fill={isActive || isLatest ? chartTheme.pointActive : chartTheme.point} stroke={chartTheme.line} strokeWidth={isActive || isLatest ? 1.25 : 0.9} />
              </g>
            );
          })}
        </Group>
      </svg>

      {activeTooltip.tooltipData ? (
        <TooltipWithBounds left={activeTooltip.tooltipLeft} top={activeTooltip.tooltipTop} style={tooltipStyles}>
          <div className={`${styles.chartTooltip} px-3 py-2`}>
            <div className="heading-cadillac text-sm font-medium text-[var(--cad-text-strong)]">
              R{String(activeTooltip.tooltipData.round).padStart(2, '0')} · {activeTooltip.tooltipData.grandPrixName}
            </div>
            <div className="mt-1 text-xs text-[var(--cad-text-dim)]">{activeTooltip.tooltipData.date}</div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <span className="text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">Team Score</span>
              <strong className="text-base font-semibold text-[var(--cad-text-strong)]">{scoreLabel(activeTooltip.tooltipData.teamScore, activeTooltip.tooltipData.outcomeLabel ?? 'N/A')}</strong>
            </div>
            {(activeTooltip.tooltipData.drivers || []).length ? (
              <div className="mt-3 space-y-2 border-t border-[var(--cad-line-soft)] pt-3">
                {(activeTooltip.tooltipData.drivers || []).map((driver) => (
                  <div key={driver.driverCode} className="flex items-end justify-between gap-4 text-xs">
                    <div className="flex items-end gap-2">
                      <span className="heading-cadillac text-[11px] font-medium tracking-[0.12rem]" style={{ color: driverColorMap[driver.driverCode] ?? 'var(--cad-text-dim)' }}>
                        {driver.driverCode}
                      </span>
                      {driver.resultLabel ? <span className="text-[10px] uppercase tracking-[0.12rem] text-[var(--cad-text-dim)]">{driver.resultLabel}</span> : null}
                    </div>
                    <strong className="font-semibold text-[var(--cad-text)]">{shouldShowDriverScore(driver) ? scoreLabel(driver.score) : (driver.resultLabel ?? 'N/A')}</strong>
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

export default function CadillacBenchmarkTrendChart({ chart }) {
  const stats = buildChartStats(chart.rounds || []);

  return (
    <section className={`${styles.chartShell} ${styles.chartFrame} p-5 md:p-6`}>
      <header className="flex flex-col gap-3 border-b border-[var(--cad-line)] pb-5 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className={`${styles.sectionTag} text-xs text-zinc-300`}>Trend / Season View</p>
          <div>
            <h2 className="heading-cadillac text-2xl font-semibold text-[var(--cad-text-strong)] md:text-3xl">{chart.title}</h2>
            <p className="mt-1 max-w-2xl text-sm text-[var(--cad-text-dim)]">{chart.description}</p>
          </div>
        </div>

        <div className={`${styles.chartMeta} hidden w-full md:grid md:max-w-lg`}>
          <div className={`${styles.chartMetaItem} px-3 py-3`}>
            <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">{chart.latestLabel}</span>
            <strong className="mt-1 block text-lg font-semibold text-[var(--cad-text-strong)]">{scoreLabel(stats.latest?.teamScore ?? null, stats.latest?.outcomeLabel ?? 'N/A')}</strong>
          </div>
          <div className={`${styles.chartMetaItem} px-3 py-3`}>
            <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">{chart.highestLabel}</span>
            <strong className="mt-1 block text-lg font-semibold text-[var(--cad-text-strong)]">{scoreLabel(stats.highest)}</strong>
          </div>
          <div className={`${styles.chartMetaItem} px-3 py-3`}>
            <span className="block text-[11px] uppercase tracking-[0.14rem] text-[var(--cad-text-dim)]">{chart.averageLabel}</span>
            <strong className="mt-1 block text-lg font-semibold text-[var(--cad-text-strong)]">{scoreLabel(stats.average)}</strong>
          </div>
        </div>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--cad-text-dim)]">
        <div className={`${styles.chartLegend} w-full`}>
          <div className={`${styles.chartLegendItem} px-3 py-2`}>
            <span className={styles.chartLegendSwatch} style={{ color: chartTheme.line }}><span className={styles.chartLegendLine} /></span>
            <span><strong className="font-medium text-[var(--cad-text)]">Team</strong> · {chart.teamLegend}</span>
          </div>
          <div className={`${styles.chartLegendItem} px-3 py-2`}>
            <span className={styles.chartLegendSwatch} style={{ color: chartTheme.bot }}><span className={styles.chartLegendDash} /></span>
            <span><strong className="font-medium text-[var(--cad-text)]">BOT</strong></span>
          </div>
          <div className={`${styles.chartLegendItem} px-3 py-2`}>
            <span className={styles.chartLegendSwatch} style={{ color: chartTheme.per }}><span className={styles.chartLegendDash} /></span>
            <span><strong className="font-medium text-[var(--cad-text)]">PER</strong></span>
          </div>
          {chart.retirementLegend ? (
            <div className={`${styles.chartLegendItem} px-3 py-2`}>
              <span className={styles.chartLegendSwatch} style={{ color: chartTheme.retirement }}><span className={styles.chartLegendNumber}>-</span></span>
              <span>{chart.retirementLegend}</span>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5 h-[320px] w-full md:h-[380px]">
        <ParentSize>{({ width, height }) => <TrendChartSvg rounds={chart.rounds || []} width={width} height={height} />}</ParentSize>
      </div>
    </section>
  );
}
