import React from 'react';
import {BackdropProps, ContactShadow, H, W, drift, rng} from './shared';

// Sunset street: sun behind layered skyline, road, then a wide sidewalk where the character stands.
// Depth layers (far to near): sky, sun, far skyline, mid skyline, side buildings, road, lamps, sidewalk, front bokeh.

const HORIZON = 1300;

const skyline = (seed: number, minH: number, maxH: number, minW: number, maxW: number) => {
  const r = rng(seed);
  const out: {x: number; w: number; h: number; lit: {x: number; y: number}[]}[] = [];
  let x = -80;
  while (x < W + 80) {
    const w = minW + r() * (maxW - minW);
    const h = minH + r() * (maxH - minH);
    out.push({x, w, h, lit: Array.from({length: Math.floor(r() * 6)}, () => ({x: 4 + r() * Math.max(1, w - 14), y: 6 + r() * (h - 20)}))});
    x += w;
  }
  return out;
};

const FAR = skyline(3, 60, 180, 50, 110);
const MID = skyline(9, 110, 300, 70, 140);

const CLOUDS = (() => {
  const r = rng(17);
  return Array.from({length: 6}, () => ({x: r() * W, y: 420 + r() * 520, rx: 220 + r() * 160, ry: 12 + r() * 12, o: 0.18 + r() * 0.2}));
})();

const BOKEH = (() => {
  const r = rng(31);
  return Array.from({length: 12}, () => ({x: r() * W, y: 1000 + r() * 800, r: 18 + r() * 46, o: 0.05 + r() * 0.08, s: 0.2 + r() * 0.4}));
})();

const Lamp: React.FC<{x: number; scale: number; opacity: number}> = ({x, scale, opacity}) => (
  <g transform={`translate(${x} 1420) scale(${scale})`} opacity={opacity}>
    <circle cx={50} cy={-780} r={260} fill="url(#ss-lamp)" />
    <rect x={-7} y={-780} width={14} height={780} fill="#1a1424" />
    <path d="M 0 -780 Q 0 -820 50 -820" stroke="#1a1424" strokeWidth={12} fill="none" />
    <rect x={32} y={-826} width={46} height={16} rx={6} fill="#1a1424" />
    <ellipse cx={55} cy={-808} rx={18} ry={6} fill="#ffd9a0" />
  </g>
);

export const SunsetStreetBack: React.FC<BackdropProps> = ({frame, duration}) => {
  const d1 = drift(frame, duration, 6);
  const d2 = drift(frame, duration, 14);
  const d3 = drift(frame, duration, 26);
  const d4 = drift(frame, duration, 44);

  return (
    <>
      <defs>
        <linearGradient id="ss-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2b2d5b" />
          <stop offset="0.38" stopColor="#6b4a7a" />
          <stop offset="0.65" stopColor="#d9785f" />
          <stop offset="0.85" stopColor="#ffb36b" />
          <stop offset="1" stopColor="#ffd9a0" />
        </linearGradient>
        <radialGradient id="ss-sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1c9" stopOpacity="0.95" />
          <stop offset="0.25" stopColor="#ffc07a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff9a5a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="ss-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd9a0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ffb36b" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ss-road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3550" />
          <stop offset="1" stopColor="#2a2030" />
        </linearGradient>
        <linearGradient id="ss-walk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6b5168" />
          <stop offset="1" stopColor="#2a2030" />
        </linearGradient>
      </defs>

      {/* sky and sun (farthest) */}
      <rect x={-60} y={0} width={W + 120} height={HORIZON + 40} fill="url(#ss-sky)" />
      <g transform={`translate(${d1} 0)`}>
        <circle cx={680} cy={1180} r={560} fill="url(#ss-sun)" />
        <circle cx={680} cy={1180} r={110} fill="#fff1c9" />
        {CLOUDS.map((c, i) => (
          <ellipse key={i} cx={c.x + d1 * 2} cy={c.y} rx={c.rx} ry={c.ry} fill="#ffb08a" opacity={c.o} />
        ))}
      </g>

      {/* power lines */}
      <g transform={`translate(${d2} 0)`} stroke="#1a1424" strokeWidth={2.5} fill="none" opacity={0.75}>
        <path d="M -60 380 Q 540 470 1140 400" />
        <path d="M -60 410 Q 540 500 1140 430" />
        <path d="M -60 345 Q 540 430 1140 365" />
      </g>

      {/* far skyline: hazy, closest to the sky color */}
      <g transform={`translate(${d1 * 2} 0)`}>
        {FAR.map((b, i) => (
          <rect key={i} x={b.x} y={HORIZON - b.h} width={b.w - 3} height={b.h + 40} fill="#8a5d78" opacity={0.85} />
        ))}
      </g>

      {/* mid skyline with a few lit windows */}
      <g transform={`translate(${d2} 0)`}>
        {MID.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={HORIZON + 10 - b.h} width={b.w - 4} height={b.h + 40} fill="#4a3556" />
            {b.lit.map((l, j) => (
              <rect key={j} x={b.x + l.x} y={HORIZON + 10 - b.h + l.y} width={6} height={8} fill="#ffcf86" opacity={0.65} />
            ))}
          </g>
        ))}
      </g>

      {/* near side buildings framing the scene */}
      <g transform={`translate(${d3} 0)`}>
        <rect x={-120} y={460} width={330} height={880} fill="#241c33" />
        <rect x={880} y={640} width={300} height={700} fill="#221a31" />
        {[0, 1, 2, 3, 4, 5, 6].map((i) =>
          [0, 1, 2].map((j) => (
            <rect key={`${i}-${j}`} x={-70 + j * 80} y={520 + i * 110} width={36} height={54} fill="#ffcf86" opacity={(i * 3 + j) % 4 === 0 ? 0.55 : 0.08} />
          )),
        )}
        {[0, 1, 2, 3, 4].map((i) =>
          [0, 1, 2].map((j) => (
            <rect key={`r${i}-${j}`} x={920 + j * 80} y={700 + i * 120} width={36} height={54} fill="#ffcf86" opacity={(i + j) % 3 === 0 ? 0.5 : 0.07} />
          )),
        )}
      </g>

      {/* road */}
      <rect x={-60} y={HORIZON + 20} width={W + 120} height={130} fill="url(#ss-road)" />
      <ellipse cx={680} cy={HORIZON + 50} rx={340} ry={22} fill="#ffb36b" opacity={0.22} />
      {Array.from({length: 7}, (_, i) => (
        <rect key={i} x={i * 190 - 40 + d3 * 0.5} y={HORIZON + 92} width={90} height={8} fill="#e8b36b" opacity={0.45} />
      ))}

      {/* sidewalk (near ground) */}
      <rect x={-60} y={HORIZON + 150} width={W + 120} height={H - HORIZON - 150 + 60} fill="url(#ss-walk)" />
      <rect x={-60} y={HORIZON + 140} width={W + 120} height={16} fill="#7d6580" />
      {Array.from({length: 9}, (_, i) => (
        <line key={i} x1={540} y1={HORIZON + 40} x2={-480 + i * 255} y2={H + 40} stroke="#000" strokeOpacity={0.16} strokeWidth={2} />
      ))}
      {[1470, 1530, 1620, 1750].map((y) => (
        <rect key={y} x={-60} y={y} width={W + 120} height={2} fill="#000" opacity={0.16} />
      ))}

      {/* street lamps and tree (nearest scenery) */}
      <g transform={`translate(${d4 * 0.6} 0)`}>
        <Lamp x={110} scale={1} opacity={1} />
        <Lamp x={960} scale={0.78} opacity={0.9} />
        <rect x={1000} y={1020} width={18} height={320} fill="#18121f" />
        <ellipse cx={1010} cy={960} rx={90} ry={100} fill="#201833" />
        <ellipse cx={950} cy={1010} rx={70} ry={70} fill="#241b38" />
      </g>

      <ContactShadow opacity={0.45} />
    </>
  );
};

export const SunsetStreetFront: React.FC<BackdropProps> = ({frame}) => (
  <>
    <defs>
      <linearGradient id="ss-haze" x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stopColor="#ff9a5a" stopOpacity="0" />
        <stop offset="1" stopColor="#ff9a5a" stopOpacity="0.16" />
      </linearGradient>
      <radialGradient id="ss-vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#12081a" stopOpacity="0.55" />
      </radialGradient>
    </defs>
    <rect x={0} y={0} width={W} height={H} fill="url(#ss-haze)" />
    {BOKEH.map((b, i) => (
      <circle key={i} cx={b.x + 14 * Math.sin(frame / 50 + i)} cy={(((b.y - frame * b.s) % H) + H) % H} r={b.r} fill="#ffd9a0" opacity={b.o} />
    ))}
    <rect x={0} y={0} width={W} height={H} fill="url(#ss-vig)" />
  </>
);
