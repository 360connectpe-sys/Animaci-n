import React from "react";
import { OL } from "../rig/Bean";
import { FONT } from "../fonts";
import { W, rnd } from "../ui/Frame";

/* The bakery sign, the same in every shot: only the first half lights up. */
export const BakerySign: React.FC<{ x: number; y: number; s?: number; t: number; flicker?: boolean }> = ({ x, y, s = 1, t, flicker = true }) => {
  const word = "PANADERÍA";
  const lit = 5; // PANAD lit, ERÍA dark
  const fl = flicker ? (Math.sin(t * 23) > 0.97 ? 0.55 : 1) : 1;
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <rect x={-200} y={-58} width={400} height={116} rx={14} fill="#2a2420" stroke={OL} strokeWidth={6} />
      <rect x={-188} y={-46} width={392 - 16} height={92} rx={8} fill="#3a322b" />
      <ellipse cx={-80} cy={0} rx={200} ry={90} fill="#ffcf6b" opacity={0.18 * fl} />
      <text x={-172} y={22} fontFamily={FONT} fontWeight={700} fontSize={60} style={{ letterSpacing: 4 }}>
        <tspan fill="#ffe39a" opacity={fl} style={{ filter: "drop-shadow(0 0 8px rgba(255,200,90,0.9))" }}>{word.slice(0, lit)}</tspan>
        <tspan fill="#8a7c6c">{word.slice(lit)}</tspan>
      </text>
      <path d="M-150,-58 L-150,-110 M150,-58 L150,-110" stroke="#555" strokeWidth={6} />
    </g>
  );
};

export const Bread: React.FC<{ x: number; y: number; s?: number; r?: number }> = ({ x, y, s = 1, r = 0 }) => (
  <g transform={`translate(${x},${y}) rotate(${r}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={34} ry={20} fill="#d9934a" stroke={OL} strokeWidth={4} />
    <path d="M-16,-8 Q0,-16 16,-8" stroke="#a8682c" strokeWidth={4} fill="none" strokeLinecap="round" />
    <ellipse cx={-10} cy={-8} rx={10} ry={4} fill="#fff" opacity={0.25} />
  </g>
);

/* Paper bag with two breads peeking out (pan francés). k = crinkle 0..1 */
export const BreadBag: React.FC<{ k?: number; breads?: number }> = ({ k = 0, breads = 2 }) => (
  <g>
    {breads > 0 ? <Bread x={-14} y={-112} r={-18} s={0.9} /> : null}
    {breads > 1 ? <Bread x={16} y={-104} r={14} s={0.9} /> : null}
    <path d={`M-48,-100 L48,-100 L${54 + k * 2},0 L${-54 - k * 2},0 Z`} fill="#c9a36b" stroke={OL} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M-48,-100 l10,10 l10,-10 l10,10 l10,-10 l10,10 l10,-10 l10,10 l10,-10 l10,10 l8,-10`} fill="none" stroke={OL} strokeWidth={3} />
    <path d="M-30,-70 L-34,-14" stroke="#fff" strokeOpacity={0.3} strokeWidth={6} strokeLinecap="round" />
    <path d={`M10,-60 l${8 + k * 6},10 M-6,-30 l${-6 - k * 4},12`} stroke="#9e7a46" strokeWidth={3} strokeLinecap="round" />
  </g>
);

/* The corner, at night after the drizzle: the bakery on the corner (left), her house next to it (right).
   doorK 0..1 = how far her door is open; inside = what stands in the doorway (drawn behind the frame). */
export const Corner: React.FC<{ t: number; doorK?: number; inside?: React.ReactNode }> = ({ t, doorK = 0, inside }) => {
  const DX0 = 640, DX1 = 900, DY0 = 960, DY1 = 1530;
  return (
    <g>
      <defs>
        <linearGradient id="csky" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#0f1526" /><stop offset={1} stopColor="#2a3250" /></linearGradient>
        <linearGradient id="cwall" x1={0} y1={0} x2={1} y2={0}><stop offset={0} stopColor="#8c7f62" /><stop offset={0.45} stopColor="#5d6b6c" /><stop offset={1} stopColor="#46545a" /></linearGradient>
        <linearGradient id="cwalk" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#5a5a5c" /><stop offset={1} stopColor="#3b3c40" /></linearGradient>
        <linearGradient id="cin" x1={0} y1={0} x2={0} y2={1}><stop offset={0} stopColor="#ffd796" /><stop offset={1} stopColor="#e9a65a" /></linearGradient>
        <radialGradient id="cglow"><stop offset={0} stopColor="#ffbf6a" stopOpacity={0.55} /><stop offset={1} stopColor="#ffbf6a" stopOpacity={0} /></radialGradient>
      </defs>
      <rect width={W} height={1600} fill="url(#csky)" />
      {/* far buildings */}
      {Array.from({ length: 9 }).map((_, i) => {
        const x = i * 130 - 20, h = 260 + rnd(i + 4) * 260;
        return (<g key={i}><rect x={x} y={760 - h} width={124} height={h + 40} fill="#1b2238" />
          {Array.from({ length: 10 }).map((__, j) => rnd(i * 17 + j) > 0.62 ? <rect key={j} x={x + 16 + (j % 3) * 36} y={790 - h + Math.floor(j / 3) * 50} width={18} height={24} fill="#ffd68a" opacity={0.7} /> : null)}
        </g>);
      })}
      {/* house facade */}
      <rect x={360} y={700} width={W - 360} height={860} fill="url(#cwall)" stroke={OL} strokeWidth={6} />
      <rect x={350} y={690} width={W - 340} height={34} fill="#3e4a50" stroke={OL} strokeWidth={5} />
      {/* window with iron grill */}
      <rect x={420} y={1010} width={170} height={220} fill="#1f2a36" stroke={OL} strokeWidth={6} />
      <rect x={428} y={1018} width={154} height={204} fill="#ffcf86" opacity={0.18} />
      {[455, 490, 525, 560].map((x) => <path key={x} d={`M${x},1010 V1230`} stroke="#222" strokeWidth={6} />)}
      <path d="M420,1120 H590" stroke="#222" strokeWidth={6} />
      <rect x={410} y={1230} width={190} height={18} fill="#6b6f70" stroke={OL} strokeWidth={4} />
      {/* house number */}
      <rect x={925} y={1050} width={96} height={50} rx={6} fill="#e9e1cf" stroke={OL} strokeWidth={4} />
      <text x={973} y={1086} textAnchor="middle" fontFamily={FONT} fontWeight={700} fontSize={32} fill={OL}>1247</text>
      {/* doorway: warm interior, door swings inward (hinge on the right edge) */}
      <rect x={DX0} y={DY0} width={DX1 - DX0} height={DY1 - DY0} fill="url(#cin)" />
      <rect x={DX0} y={DY0 + 330} width={DX1 - DX0} height={DY1 - DY0 - 330} fill="#c98b4c" opacity={0.5} />
      {inside}
      {(() => {
        const w = (DX1 - DX0) * (1 - 0.78 * doorK);
        const x = DX1 - w;
        return (<g>
          <path d={`M${x},${DY0 + 8 * doorK} L${DX1},${DY0} L${DX1},${DY1} L${x},${DY1 - 8 * doorK} Z`} fill="#2f6a69" stroke={OL} strokeWidth={6} strokeLinejoin="round" />
          {doorK < 0.6 ? <g opacity={1 - doorK / 0.6}>
            <rect x={x + w * 0.14} y={DY0 + 50} width={w * 0.72} height={210} fill="none" stroke="#24524f" strokeWidth={6} />
            <rect x={x + w * 0.14} y={DY0 + 300} width={w * 0.72} height={210} fill="none" stroke="#24524f" strokeWidth={6} />
            <rect x={x + w * 0.08} y={DY0 + 280} width={16} height={46} rx={6} fill="#c9c2a6" stroke={OL} strokeWidth={3} />
          </g> : null}
        </g>);
      })()}
      <rect x={DX0 - 16} y={DY0 - 16} width={DX1 - DX0 + 32} height={DY1 - DY0 + 16} fill="none" stroke="#3a4448" strokeWidth={18} />
      <rect x={DX0 - 26} y={DY0 - 26} width={DX1 - DX0 + 52} height={DY1 - DY0 + 26} fill="none" stroke={OL} strokeWidth={5} />
      <rect x={DX0 - 40} y={DY1} width={DX1 - DX0 + 80} height={26} fill="#77736a" stroke={OL} strokeWidth={5} />
      {/* bakery on the corner */}
      <rect x={-20} y={760} width={392} height={800} fill="#d9c49a" stroke={OL} strokeWidth={6} />
      <rect x={-20} y={760} width={392} height={800} fill="#ffb562" opacity={0.18} />
      <rect x={10} y={960} width={300} height={360} fill="url(#cin)" stroke={OL} strokeWidth={6} />
      {[1040, 1130, 1220].map((y, r) => <g key={y}><rect x={20} y={y} width={280} height={10} fill="#8a5a32" />
        {Array.from({ length: 5 }).map((_, i) => <Bread key={i} x={50 + i * 54 + (r % 2) * 20} y={y - 14} s={0.7} r={(i % 2) * 12 - 6} />)}</g>)}
      <rect x={10} y={960} width={300} height={360} fill="#fff" opacity={0.06} />
      <path d="M-20,900 L372,900 L392,950 L-20,950 Z" fill="#a8452f" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 8 }).map((_, i) => <path key={i} d={`M${i * 52},900 L${i * 52 + 6},950`} stroke="#e6d2b0" strokeWidth={10} />)}
      <BakerySign x={190} y={830} s={0.8} t={t} />
      {/* warm spill on the facade and the pavement */}
      <ellipse cx={240} cy={1250} rx={520} ry={420} fill="url(#cglow)" />
      {/* sidewalk + curb + wet street */}
      <rect x={0} y={1548} width={W} height={170} fill="url(#cwalk)" stroke={OL} strokeWidth={5} />
      {Array.from({ length: 6 }).map((_, i) => <path key={i} d={`M${i * 200 - 40},1548 L${i * 200 - 90},1718`} stroke="#2e2f33" strokeWidth={4} />)}
      <rect x={0} y={1718} width={W} height={30} fill="#7c7b77" stroke={OL} strokeWidth={5} />
      <rect x={0} y={1748} width={W} height={180} fill="#1d2028" />
      {/* reflections on the wet ground */}
      <rect x={30} y={1560} width={260} height={150} fill="#ffcf86" opacity={0.16} />
      <rect x={DX0 + 20} y={1560} width={(DX1 - DX0 - 40)} height={150} fill="#ffcf86" opacity={0.10 + 0.18 * doorK} />
      {[120, 430, 760, 980].map((x, i) => <rect key={i} x={x} y={1770} width={40 + i * 10} height={130} fill={i % 2 ? "#ffcf86" : "#9fc6ff"} opacity={0.10} />)}
      <ellipse cx={520} cy={1650} rx={140} ry={16} fill="#9fb6d0" opacity={0.18} />
    </g>
  );
};
