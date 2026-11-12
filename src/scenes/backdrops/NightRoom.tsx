import React from 'react';
import {BackdropProps, ContactShadow, H, W, drift, rng} from './shared';

// Night room: moonlit window on the left, bookshelf and warm lamp on the right.
// Depth layers (far to near): sky, city, wall + window, shelf + lamp, floor, front haze.

const STARS = (() => {
  const r = rng(7);
  return Array.from({length: 70}, () => ({x: 100 + r() * 320, y: 350 + r() * 300, r: 0.8 + r() * 1.6, o: 0.4 + r() * 0.6}));
})();

const CITY = (() => {
  const r = rng(11);
  const out: {x: number; w: number; h: number; lit: {x: number; y: number}[]}[] = [];
  let x = 96;
  while (x < 424) {
    const w = Math.min(26 + r() * 40, 424 - x);
    const h = 60 + r() * 150;
    out.push({x, w, h, lit: Array.from({length: Math.floor(r() * 5)}, () => ({x: 2 + r() * Math.max(1, w - 8), y: 4 + r() * (h - 14)}))});
    x += w + 2;
  }
  return out;
})();

const BOOKS = (() => {
  const r = rng(23);
  const palette = ['#6b3b3b', '#3b5a6b', '#7a6a3b', '#3b4a3b', '#5a3b6b', '#8a5a3b', '#2f3a55'];
  const out: {x: number; y: number; w: number; h: number; c: string}[] = [];
  for (let row = 0; row < 5; row++) {
    const base = 620 + row * 165;
    let x = 790;
    while (x < 1030) {
      const w = 14 + r() * 14;
      const h = 90 + r() * 55;
      out.push({x, y: base - h, w: Math.min(w, 1032 - x), h, c: palette[Math.floor(r() * palette.length)]});
      x += w + 1;
    }
  }
  return out;
})();

const MOTES = (() => {
  const r = rng(5);
  return Array.from({length: 36}, () => ({x: r() * W, y: r() * H, s: 0.15 + r() * 0.4, r: 1 + r() * 2.4, o: 0.1 + r() * 0.25}));
})();

export const NightRoomBack: React.FC<BackdropProps> = ({frame, duration}) => {
  const far = drift(frame, duration, 8);
  const mid = drift(frame, duration, 18);
  const near = drift(frame, duration, 34);
  const lampFlicker = 0.94 + 0.06 * Math.sin(frame / 9) * Math.sin(frame / 23);

  return (
    <>
      <defs>
        <linearGradient id="nr-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#141827" />
          <stop offset="1" stopColor="#262234" />
        </linearGradient>
        <linearGradient id="nr-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0a1030" />
          <stop offset="1" stopColor="#323663" />
        </linearGradient>
        <linearGradient id="nr-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#201c26" />
          <stop offset="1" stopColor="#0e0c12" />
        </linearGradient>
        <linearGradient id="nr-curtain" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1a1d33" />
          <stop offset="0.25" stopColor="#262a47" />
          <stop offset="0.5" stopColor="#171a2e" />
          <stop offset="0.75" stopColor="#262a47" />
          <stop offset="1" stopColor="#14172a" />
        </linearGradient>
        <radialGradient id="nr-moon" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#cfe0ff" stopOpacity="0.7" />
          <stop offset="1" stopColor="#cfe0ff" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="nr-lamp" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffcf86" stopOpacity="0.6" />
          <stop offset="0.5" stopColor="#ffb061" stopOpacity="0.18" />
          <stop offset="1" stopColor="#ffb061" stopOpacity="0" />
        </radialGradient>
        <clipPath id="nr-win">
          <rect x={90} y={340} width={340} height={660} />
        </clipPath>
      </defs>

      {/* wall */}
      <rect x={-60} y={0} width={W + 120} height={1450} fill="url(#nr-wall)" />
      {Array.from({length: 14}, (_, i) => (
        <rect key={i} x={i * 80 - 20} y={0} width={2} height={1450} fill="#fff" opacity={0.03} />
      ))}

      {/* sky and city seen through the window (far layers) */}
      <g clipPath="url(#nr-win)">
        <rect x={60} y={340} width={400} height={660} fill="url(#nr-sky)" />
        <g transform={`translate(${far} 0)`}>
          {STARS.map((s, i) => (
            <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff" opacity={s.o * (0.8 + 0.2 * Math.sin(frame / 14 + i))} />
          ))}
          <circle cx={176} cy={470} r={150} fill="url(#nr-moon)" />
          <circle cx={176} cy={470} r={34} fill="#f1eed6" />
        </g>
        <g transform={`translate(${mid} 0)`}>
          {CITY.map((b, i) => (
            <g key={i}>
              <rect x={b.x} y={1000 - b.h} width={b.w} height={b.h} fill="#0b0e1f" />
              {b.lit.map((l, j) => (
                <rect key={j} x={b.x + l.x} y={1000 - b.h + l.y} width={4} height={5} fill="#ffcf86" opacity={0.7} />
              ))}
            </g>
          ))}
        </g>
      </g>

      {/* window frame, sill and curtains (mid layer) */}
      <g transform={`translate(${mid * 0.6} 0)`}>
        <rect x={90} y={340} width={340} height={660} fill="none" stroke="#15151f" strokeWidth={16} />
        <rect x={258} y={340} width={8} height={660} fill="#15151f" />
        <rect x={90} y={660} width={340} height={8} fill="#15151f" />
        <rect x={66} y={1000} width={388} height={28} rx={4} fill="#1d1c28" />
        <path d="M 34 300 L 126 300 L 118 1120 L 30 1120 Z" fill="url(#nr-curtain)" />
        <path d="M 398 300 L 490 300 L 500 1120 L 410 1120 Z" fill="url(#nr-curtain)" />
        <rect x={20} y={286} width={490} height={14} rx={7} fill="#2a2a3c" />
      </g>

      {/* moonlight falling across the wall and floor */}
      <polygon points="90,1028 430,1028 940,1500 400,1500" fill="#9db8ff" opacity={0.06} />

      {/* bookshelf and lamp (near-mid layer) */}
      <g transform={`translate(${near * 0.5} 0)`}>
        <rect x={770} y={470} width={280} height={980} fill="#231c2a" />
        {[0, 1, 2, 3, 4].map((i) => (
          <rect key={i} x={770} y={620 + i * 165} width={280} height={10} fill="#16121c" />
        ))}
        {BOOKS.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c} opacity={0.85} />
        ))}
        <rect x={770} y={1290} width={280} height={160} fill="#1a1520" />
        <rect x={890} y={420} width={30} height={52} fill="#1a1520" />
        <polygon points="870,372 940,372 962,432 848,432" fill="#e9c27a" />
        <circle cx={905} cy={430} r={440 * lampFlicker} fill="url(#nr-lamp)" />
      </g>

      {/* floor and rug (near layer) */}
      <rect x={-60} y={1450} width={W + 120} height={H - 1450 + 60} fill="url(#nr-floor)" />
      <rect x={-60} y={1428} width={W + 120} height={22} fill="#17141d" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <rect key={i} x={-60} y={1450 + i * i * 9 + i * 18} width={W + 120} height={2} fill="#000" opacity={0.3} />
      ))}
      <ellipse cx={540} cy={1650} rx={520} ry={95} fill="#3b2c3a" opacity={0.5} />
      <ContactShadow />
    </>
  );
};

export const NightRoomFront: React.FC<BackdropProps> = ({frame}) => (
  <>
    <defs>
      <radialGradient id="nr-vig" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.5" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.62" />
      </radialGradient>
    </defs>
    {MOTES.map((m, i) => (
      <circle key={i} cx={m.x + 12 * Math.sin(frame / 40 + i)} cy={(((m.y - frame * m.s) % H) + H) % H} r={m.r} fill="#cfd8ff" opacity={m.o} />
    ))}
    <rect x={0} y={0} width={W} height={H} fill="url(#nr-vig)" />
  </>
);
