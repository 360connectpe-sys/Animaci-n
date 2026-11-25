import React from "react";
import { OL } from "../rig/Bean";
import { W, H, rnd } from "../ui/Frame";

/* Night street seen through the bus glass after a drizzle: out-of-focus shop lights and street lamps
   drifting right to left (the bus moves forward), plus droplets on the glass. speed in px/s. */
export const NightBokeh: React.FC<{ t: number; speed?: number; y0?: number; y1?: number; seed?: number; o?: number }> = ({ t, speed = 260, y0 = 200, y1 = 1500, seed = 1, o = 1 }) => {
  const cols = ["#ffb45a", "#ffd88a", "#f7f2e0", "#ff7a5c", "#9fd3ff", "#ffcf6b", "#7affc4"];
  const span = W + 600;
  return (<g opacity={o}>
    {Array.from({ length: 34 }).map((_, i) => {
      const depth = 0.45 + rnd(seed + i * 3) * 0.9;
      const x = ((rnd(seed + i) * span - t * speed * depth) % span + span) % span - 300;
      const y = y0 + rnd(seed + i * 7) * (y1 - y0);
      const r = 22 + rnd(seed + i * 11) * 70 * depth;
      return <circle key={i} cx={x} cy={y} r={r} fill={cols[i % cols.length]} opacity={0.10 + 0.22 * rnd(seed + i * 5)} />;
    })}
  </g>);
};

export const Droplets: React.FC<{ seed?: number; x0?: number; x1?: number; y0?: number; y1?: number; n?: number; t?: number }> = ({ seed = 3, x0 = 60, x1 = 1020, y0 = 200, y1 = 1480, n = 90, t = 0 }) => (
  <g>{Array.from({ length: n }).map((_, i) => {
    const x = x0 + rnd(seed + i) * (x1 - x0), y = y0 + rnd(seed + i * 13) * (y1 - y0), r = 2 + rnd(seed + i * 17) * 7;
    const tw = 0.5 + 0.5 * Math.sin(t * 1.3 + i);
    return (<g key={i}>
      <circle cx={x} cy={y} r={r} fill="#cfe6ff" opacity={0.10 + 0.08 * tw} />
      <circle cx={x - r * 0.3} cy={y - r * 0.35} r={r * 0.35} fill="#fff" opacity={0.35} />
    </g>);
  })}</g>
);

/* The bus window as a frame: glass from (gx0,gy0) to (gx1,gy1), dark painted panels around it, a grab rail. */
export const BusWindowFrame: React.FC<{ gx0?: number; gy0?: number; gx1?: number; gy1?: number; bar?: number }> = ({ gx0 = 60, gy0 = 190, gx1 = 1020, gy1 = 1480, bar = 420 }) => (
  <g>
    <path fillRule="evenodd" d={`M0,0 H${W} V${H} H0 Z M${gx0 + 30},${gy0} H${gx1 - 30} Q${gx1},${gy0} ${gx1},${gy0 + 30} V${gy1 - 30} Q${gx1},${gy1} ${gx1 - 30},${gy1} H${gx0 + 30} Q${gx0},${gy1} ${gx0},${gy1 - 30} V${gy0 + 30} Q${gx0},${gy0} ${gx0 + 30},${gy0} Z`} fill="#28303b" />
    <rect x={gx0 - 14} y={gy0 - 14} width={gx1 - gx0 + 28} height={gy1 - gy0 + 28} rx={40} fill="none" stroke="#14171c" strokeWidth={24} />
    <rect x={gx0 - 14} y={gy0 - 14} width={gx1 - gx0 + 28} height={gy1 - gy0 + 28} rx={40} fill="none" stroke={OL} strokeWidth={5} />
    {/* sliding pane rail */}
    <rect x={gx0} y={bar - 10} width={gx1 - gx0} height={20} fill="#9aa3ad" stroke={OL} strokeWidth={4} />
    <rect x={gx0 + (gx1 - gx0) * 0.48} y={bar - 30} width={60} height={40} rx={8} fill="#7c8590" stroke={OL} strokeWidth={4} />
    {/* sill */}
    <rect x={0} y={gy1 + 12} width={W} height={40} fill="#3a4450" stroke={OL} strokeWidth={5} />
    <path d={`M0,${gy1 + 22} H${W}`} stroke="#fff" strokeOpacity={0.12} strokeWidth={5} />
    {/* grab rail */}
    <rect x={-20} y={70} width={W + 40} height={26} rx={13} fill="#d8b23a" stroke={OL} strokeWidth={5} />
    <path d={`M0,78 H${W}`} stroke="#fff" strokeOpacity={0.35} strokeWidth={4} />
    {[180, 900].map((x) => <rect key={x} x={x - 10} y={0} width={20} height={78} fill="#8f969e" stroke={OL} strokeWidth={4} />)}
  </g>
);
