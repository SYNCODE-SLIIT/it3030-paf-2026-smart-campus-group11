'use client';

import React from 'react';

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  defaultColor?: string;
  emptyLabel?: string;
}

const PADDING = { top: 16, right: 16, bottom: 30, left: 36 };

export function BarChart({
  data,
  height = 260,
  defaultColor = 'var(--yellow-400)',
  emptyLabel = 'No data yet',
}: BarChartProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [width, setWidth] = React.useState(640);
  const [hovered, setHovered] = React.useState<number | null>(null);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(Math.max(280, Math.floor(entry.contentRect.width)));
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hasData = data.some((d) => d.value > 0);

  if (!hasData) {
    return (
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height,
          borderRadius: 12,
          background: 'var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '.18em',
          textTransform: 'uppercase',
        }}
      >
        {emptyLabel}
      </div>
    );
  }

  const innerWidth = Math.max(20, width - PADDING.left - PADDING.right);
  const innerHeight = Math.max(20, height - PADDING.top - PADDING.bottom);
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const ceiling = Math.ceil(maxValue * 1.1);

  const barCount = data.length;
  const groupWidth = innerWidth / barCount;
  const barWidth = Math.min(46, groupWidth * 0.72);

  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, idx) => (ceiling / yTicks) * idx);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          {data.map((bar, idx) => {
            const color = bar.color ?? defaultColor;
            return (
              <linearGradient key={`bar-grad-${idx}`} id={`bar-grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.55} />
              </linearGradient>
            );
          })}
        </defs>

        {tickValues.map((value, idx) => {
          const y = PADDING.top + innerHeight - (value / ceiling) * innerHeight;
          return (
            <g key={`yt-${idx}`}>
              <line
                x1={PADDING.left}
                x2={width - PADDING.right}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeDasharray="4 4"
                strokeWidth={1}
                opacity={idx === 0 ? 0 : 0.6}
              />
              <text
                x={PADDING.left - 8}
                y={y + 3}
                textAnchor="end"
                fontSize={9}
                fontFamily="var(--font-mono)"
                fill="var(--text-muted)"
              >
                {Math.round(value).toLocaleString()}
              </text>
            </g>
          );
        })}

        {data.map((bar, idx) => {
          const ratio = bar.value / ceiling;
          const barHeight = innerHeight * ratio;
          const groupCenterX = PADDING.left + idx * groupWidth + groupWidth / 2;
          const x = groupCenterX - barWidth / 2;
          const y = PADDING.top + innerHeight - barHeight;
          const isHover = hovered === idx;

          return (
            <g
              key={`bar-${idx}`}
              onMouseEnter={() => setHovered(idx)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(0, barHeight)}
                rx={6}
                ry={6}
                fill={`url(#bar-grad-${idx})`}
                style={{
                  transition: 'opacity .15s, transform .15s',
                  opacity: hovered === null || isHover ? 1 : 0.55,
                  filter: isHover ? `drop-shadow(0 6px 14px ${(bar.color ?? defaultColor)}55)` : undefined,
                }}
              >
                <title>{`${bar.label}: ${bar.value}`}</title>
              </rect>
              <text
                x={groupCenterX}
                y={y - 6}
                textAnchor="middle"
                fontSize={11}
                fontFamily="var(--font-display)"
                fontWeight={700}
                fill="var(--text-h)"
                opacity={isHover ? 1 : 0.85}
              >
                {bar.value}
              </text>
              <text
                x={groupCenterX}
                y={height - 10}
                textAnchor="middle"
                fontSize={10}
                fontFamily="var(--font-mono)"
                fill="var(--text-muted)"
              >
                {bar.label.length > 14 ? `${bar.label.slice(0, 12)}…` : bar.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
