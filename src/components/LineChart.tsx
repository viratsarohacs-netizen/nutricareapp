// Dependency-free, theme-aware SVG line chart (weight trend).
// Pure render (no hooks) so it works in server or client components.

export interface Point {
  label: string; // x-axis label (date)
  y: number;
}

export function LineChart({
  points,
  goal,
  unit = "kg",
  height = 200,
}: {
  points: Point[];
  goal?: number | null;
  unit?: string;
  height?: number;
}) {
  const W = 560;
  const H = height;
  const padL = 40;
  const padR = 14;
  const padT = 16;
  const padB = 26;

  if (points.length === 0) {
    return (
      <div className="grid place-items-center h-40 text-sm text-brand-600/60">
        No entries yet — log your first weight to see your trend.
      </div>
    );
  }

  const ys = points.map((p) => p.y);
  if (goal != null) ys.push(goal);
  let min = Math.min(...ys);
  let max = Math.max(...ys);
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const span = max - min;
  min -= span * 0.12;
  max += span * 0.12;

  const n = points.length;
  const x = (i: number) =>
    n === 1 ? (padL + (W - padR)) / 2 : padL + (i / (n - 1)) * (W - padL - padR);
  const y = (v: number) =>
    padT + (1 - (v - min) / (max - min)) * (H - padT - padB);

  const line = points.map((p, i) => `${x(i)},${y(p.y)}`).join(" ");
  const area =
    `${x(0)},${H - padB} ` +
    points.map((p, i) => `${x(i)},${y(p.y)}`).join(" ") +
    ` ${x(n - 1)},${H - padB}`;

  const gridVals = [max, (max + min) / 2, min];
  const last = points[n - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Weight trend">
      <defs>
        <linearGradient id="wt-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-400)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-brand-400)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* gridlines + y labels */}
      {gridVals.map((v, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={W - padR}
            y1={y(v)}
            y2={y(v)}
            stroke="var(--color-brand-100)"
            strokeWidth="1"
          />
          <text x={4} y={y(v) + 3} fontSize="10" fill="var(--color-brand-600)" opacity="0.7">
            {v.toFixed(0)}
          </text>
        </g>
      ))}

      {/* goal line */}
      {goal != null && (
        <g>
          <line
            x1={padL}
            x2={W - padR}
            y1={y(goal)}
            y2={y(goal)}
            stroke="var(--color-brand-500)"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text
            x={W - padR}
            y={y(goal) - 4}
            fontSize="10"
            textAnchor="end"
            fill="var(--color-brand-600)"
          >
            goal {goal}
            {unit}
          </text>
        </g>
      )}

      <polygon points={area} fill="url(#wt-fill)" />
      <polyline
        points={line}
        fill="none"
        stroke="var(--color-brand-600)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p.y)} r={i === n - 1 ? 4 : 2.5} fill="var(--color-brand-700)" />
      ))}

      {/* last value label */}
      <text
        x={x(n - 1)}
        y={y(last.y) - 9}
        fontSize="11"
        fontWeight="700"
        textAnchor="end"
        fill="var(--color-brand-800)"
      >
        {last.y}
        {unit}
      </text>

      {/* x labels: first + last */}
      <text x={padL} y={H - 8} fontSize="10" fill="var(--color-brand-600)" opacity="0.7">
        {points[0].label}
      </text>
      {n > 1 && (
        <text
          x={W - padR}
          y={H - 8}
          fontSize="10"
          textAnchor="end"
          fill="var(--color-brand-600)"
          opacity="0.7"
        >
          {last.label}
        </text>
      )}
    </svg>
  );
}
