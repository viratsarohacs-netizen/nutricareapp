// Dependency-free bar chart for admin analytics (e.g. bookings or revenue by month).

export interface Bar {
  label: string;
  value: number;
}

export function BarChart({
  bars,
  height = 160,
  valuePrefix = "",
}: {
  bars: Bar[];
  height?: number;
  valuePrefix?: string;
}) {
  if (bars.length === 0) {
    return (
      <div className="grid place-items-center h-32 text-sm text-brand-600/60">
        No data yet.
      </div>
    );
  }
  const W = 560;
  const H = height;
  const padT = 18;
  const padB = 24;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const n = bars.length;
  const gap = 10;
  const bw = (W - gap * (n + 1)) / n;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Bar chart">
      {bars.map((b, i) => {
        const h = (b.value / max) * (H - padT - padB);
        const bx = gap + i * (bw + gap);
        const by = H - padB - h;
        return (
          <g key={i}>
            <rect
              x={bx}
              y={by}
              width={bw}
              height={Math.max(h, b.value > 0 ? 2 : 0)}
              rx="5"
              fill="var(--color-brand-500)"
            />
            {b.value > 0 && (
              <text
                x={bx + bw / 2}
                y={by - 5}
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                fill="var(--color-brand-800)"
              >
                {valuePrefix}
                {b.value}
              </text>
            )}
            <text
              x={bx + bw / 2}
              y={H - 8}
              fontSize="10"
              textAnchor="middle"
              fill="var(--color-brand-600)"
              opacity="0.7"
            >
              {b.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
