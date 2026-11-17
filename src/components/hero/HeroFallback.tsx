/**
 * Lightweight stand-in for the 3D scene on mobile, reduced-motion and no-WebGL devices.
 * Pure SVG + CSS: no WebGL context, no JS animation loop, so it costs almost nothing.
 */
const nodes = [
  [40, 150],
  [110, 70],
  [180, 130],
  [250, 60],
  [300, 150],
  [360, 90],
  [340, 210],
];
const edges = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [4, 6],
  [2, 4],
];

export default function HeroFallback() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md" aria-hidden="true">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-sky-500/10 via-transparent to-violet-500/15" />
      <svg viewBox="0 0 400 260" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="edge" x1="0" x2="1">
            <stop offset="0" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="1" stopColor="#a78bfa" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a][0]}
            y1={nodes[a][1]}
            x2={nodes[b][0]}
            y2={nodes[b][1]}
            stroke="url(#edge)"
            strokeWidth="1.2"
          />
        ))}
        {nodes.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="14" fill="none" stroke="#38bdf8" strokeOpacity="0.25" />
            <rect x={x - 6} y={y - 6} width="12" height="12" rx="2" fill="#0b1224" stroke="#7dd3fc" strokeOpacity="0.7" />
          </g>
        ))}
        {[0, 1, 2].map((i) => (
          <circle key={`p${i}`} r="3" fill="#c4b5fd">
            <animateMotion dur={`${4 + i}s`} repeatCount="indefinite" path={`M${nodes[0][0]} ${nodes[0][1]} L${nodes[4][0]} ${nodes[4][1]} L${nodes[6][0]} ${nodes[6][1]}`} />
          </circle>
        ))}
      </svg>
    </div>
  );
}
