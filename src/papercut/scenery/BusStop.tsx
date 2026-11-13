import React from 'react';
import {Pt, closedSpline, rng} from '../lib/math';

// Rainy night bus stop built from torn paper layers. Every element is its own component so it
// can be reused and animated separately. `pan` is the camera's horizontal offset (parallax).

export const GROUND = 1500; // top of the sidewalk, where feet stand
export const SEAT_Y = 1326; // top of the bench seat

/** Wobbly strip shape for clouds and torn bands. */
const strip = (x: number, y: number, w: number, h: number, seed: number, n = 9): string => {
  const r = rng(seed);
  const top: Pt[] = Array.from({length: n}, (_, i) => [x + (w * i) / (n - 1), y - r() * h * 0.6]);
  const bot: Pt[] = Array.from({length: n}, (_, i) => [x + w - (w * i) / (n - 1), y + h * 0.4 + r() * h * 0.6]);
  return closedSpline(top.concat(bot));
};

export const Sky: React.FC = () => <rect x={-200} y={-200} width={1480} height={1800} fill="url(#sky)" />;

export const Clouds: React.FC<{frame: number; pan: number}> = ({frame, pan}) => (
  <g transform={`translate(${pan * 0.1} 0)`}>
    {[
      {x: -260, y: 170, w: 760, h: 70, c: '#1d3a43', s: 3, v: 0.25},
      {x: 380, y: 250, w: 860, h: 80, c: '#21414b', s: 5, v: 0.18},
      {x: -120, y: 360, w: 680, h: 60, c: '#1a353e', s: 8, v: 0.3},
    ].map((c) => (
      <path key={c.s} d={strip(c.x + frame * c.v, c.y, c.w, c.h, c.s)} fill={c.c} filter="url(#paperBg)" />
    ))}
  </g>
);

const BUILDINGS = (seed: number, minH: number, maxH: number) => {
  const r = rng(seed);
  const out: {x: number; w: number; h: number; lit: {x: number; y: number}[]}[] = [];
  let x = -160;
  while (x < 1240) {
    const w = 110 + r() * 120;
    const h = minH + r() * (maxH - minH);
    const lit = Array.from({length: 2 + Math.floor(r() * 4)}, () => ({x: 18 + Math.floor(r() * ((w - 50) / 28)) * 28, y: 30 + Math.floor(r() * ((h - 80) / 46)) * 46}));
    out.push({x, w, h, lit});
    x += w + 8 + r() * 20;
  }
  return out;
};
const FAR = BUILDINGS(14, 420, 760);
const NEAR = BUILDINGS(27, 260, 560);

export const City: React.FC<{frame: number; pan: number}> = ({frame, pan}) => (
  <>
    <g transform={`translate(${pan * 0.25} 0)`}>
      {FAR.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={1330 - b.h} width={b.w} height={b.h + 40} fill="#14303a" filter="url(#paperBg)" />
          {b.lit.map((l, j) => (
            <rect key={j} x={b.x + l.x} y={1330 - b.h + l.y} width={16} height={24} fill="#d9a54d" opacity={0.55 + 0.1 * Math.sin(frame / 20 + i + j)} />
          ))}
        </g>
      ))}
    </g>
    <g transform={`translate(${pan * 0.45} 0)`}>
      {NEAR.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={1400 - b.h} width={b.w} height={b.h + 40} fill="#0f232b" filter="url(#paperBg)" />
          {b.lit.slice(0, 2).map((l, j) => (
            <rect key={j} x={b.x + l.x} y={1400 - b.h + l.y} width={18} height={26} fill="#e8b85a" opacity={0.7} />
          ))}
        </g>
      ))}
    </g>
  </>
);

/** Street lamp; returns the head position so the light can be placed. */
export const LAMP = {x: 150, y: 520, headX: 238, headY: 548};

export const StreetLamp: React.FC = () => (
  <g>
    <rect x={LAMP.x - 9} y={LAMP.y} width={18} height={GROUND - LAMP.y + 6} fill="#0c161a" filter="url(#paper)" />
    <path d={`M ${LAMP.x} ${LAMP.y + 10} Q ${LAMP.x + 10} ${LAMP.y - 30} ${LAMP.headX} ${LAMP.y - 10}`} stroke="#0c161a" strokeWidth={14} fill="none" />
    <path d={closedSpline([[LAMP.headX - 34, LAMP.headY - 30], [LAMP.headX + 34, LAMP.headY - 30], [LAMP.headX + 26, LAMP.headY], [LAMP.headX - 26, LAMP.headY]])} fill="#0c161a" filter="url(#paper)" />
    <ellipse cx={LAMP.headX} cy={LAMP.headY + 2} rx={22} ry={6} fill="#ffe2a3" />
  </g>
);

/** Warm lamp light: cone, glow and pool on the ground (drawn above characters with screen blending). */
export const LampLight: React.FC<{frame: number}> = ({frame}) => {
  const flick = 0.93 + 0.07 * Math.sin(frame / 3.1) * Math.sin(frame / 7.3);
  return (
    <g style={{mixBlendMode: 'screen'}} opacity={flick}>
      <polygon points={`${LAMP.headX - 20},${LAMP.headY} ${LAMP.headX + 20},${LAMP.headY} ${LAMP.headX + 260},${GROUND + 20} ${LAMP.headX - 230},${GROUND + 20}`} fill="url(#lampCone)" />
      <circle cx={LAMP.headX} cy={LAMP.headY} r={190} fill="url(#lampGlow)" />
      <ellipse cx={LAMP.headX + 10} cy={GROUND + 18} rx={250} ry={34} fill="#f2c26a" opacity={0.28} filter="url(#soft)" />
    </g>
  );
};

/** Bus shelter (back panel, posts, roof, sign) and bench. */
export const Shelter: React.FC = () => (
  <g>
    <rect x={500} y={690} width={540} height={740} fill="#244a54" opacity={0.75} filter="url(#paperBg)" />
    <rect x={520} y={720} width={500} height={6} fill="#3e6670" opacity={0.6} />
    {[488, 1040].map((x) => (
      <rect key={x} x={x - 10} y={640} width={20} height={GROUND - 640 + 4} fill="#0a1519" filter="url(#paper)" />
    ))}
    <path d={closedSpline([[450, 640], [1090, 610], [1100, 648], [460, 680]])} fill="#0d1d22" filter="url(#paperBg)" />
    <g>
      <rect x={1012} y={430} width={8} height={180} fill="#0a1519" />
      <rect x={968} y={380} width={96} height={70} rx={8} fill="#c9a24e" filter="url(#paper)" />
      <text x={1016} y={426} textAnchor="middle" fontFamily="Georgia, serif" fontSize={26} fill="#1a1a1a">
        BUS
      </text>
    </g>
  </g>
);

export const Bench: React.FC = () => (
  <g>
    <rect x={560} y={SEAT_Y - 92} width={440} height={30} rx={4} fill="#3b3027" filter="url(#paper)" />
    <rect x={560} y={SEAT_Y - 48} width={440} height={26} rx={4} fill="#43362b" filter="url(#paper)" />
    <rect x={550} y={SEAT_Y} width={460} height={24} rx={4} fill="#4a3c2f" filter="url(#paper)" />
    {[590, 970].map((x) => (
      <rect key={x} x={x - 8} y={SEAT_Y + 20} width={16} height={GROUND - SEAT_Y - 16} fill="#14100c" filter="url(#paper)" />
    ))}
  </g>
);

export const Street: React.FC<{frame: number}> = ({frame}) => (
  <g>
    <rect x={-200} y={GROUND - 6} width={1480} height={150} fill="#283136" filter="url(#paperBg)" />
    <rect x={-200} y={GROUND + 140} width={1480} height={34} fill="#1c2427" filter="url(#paper)" />
    <rect x={-200} y={GROUND + 172} width={1480} height={300} fill="#10181c" />
    {/* wet road reflection of the lamp */}
    <rect x={LAMP.headX - 30 + 4 * Math.sin(frame / 6)} y={GROUND + 180} width={60} height={220} fill="#e9b65c" opacity={0.22} filter="url(#soft)" />
    {[0, 1, 2, 3, 4].map((i) => (
      <rect key={i} x={i * 260 - 40} y={GROUND + 300} width={130} height={10} fill="#c7c0ae" opacity={0.35} filter="url(#paperFine)" />
    ))}
  </g>
);

/** Torn dark paper bands that frame the shot like a handmade diorama. */
export const PaperFrame: React.FC = () => (
  <g>
    <path d={strip(-60, 30, 1200, 120, 41, 14)} fill="#071014" filter="url(#paperBg)" />
    <path d={strip(-60, 1880, 1200, 140, 43, 14)} fill="#071014" filter="url(#paperBg)" />
  </g>
);
