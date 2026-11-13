import React from 'react';
import {clamp, closedSpline, lerp, rng} from '../lib/math';
import {GROUND} from './BusStop';

const PAPER_TONES = ['#d9cfbb', '#9fb3b8', '#6e858c', '#c9a24e', '#b8aa90'];

/** A gust of wind carrying small torn paper scraps across the frame between t0 and t1 (seconds). */
export const PaperGust: React.FC<{s: number; t0: number; t1: number; seed: number; count: number}> = ({s, t0, t1, seed, count}) => {
  if (s < t0 || s > t1 + 2) return null;
  const r = rng(seed);
  const bits = Array.from({length: count}, () => ({
    y: 500 + r() * 1100,
    delay: r() * (t1 - t0) * 0.7,
    speed: 520 + r() * 520,
    spin: (r() - 0.5) * 720,
    size: 10 + r() * 22,
    tone: PAPER_TONES[Math.floor(r() * PAPER_TONES.length)],
    flutter: 20 + r() * 50,
    shape: [0, 1, 2, 3].map(() => 0.6 + r() * 0.5),
  }));
  return (
    <g>
      {bits.map((b, i) => {
        const t = s - t0 - b.delay;
        if (t < 0) return null;
        const x = -80 + t * b.speed;
        if (x > 1200) return null;
        const y = b.y + Math.sin(t * 3 + i) * b.flutter - t * 40;
        const k = b.size;
        const pts: [number, number][] = [
          [-k * b.shape[0], -k * 0.6],
          [k * b.shape[1], -k * 0.5 * b.shape[2]],
          [k * 0.8, k * 0.6],
          [-k * 0.7, k * 0.5 * b.shape[3]],
        ];
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${t * b.spin}) scale(1 ${0.4 + 0.6 * Math.abs(Math.cos(t * 4 + i))})`}>
            <path d={closedSpline(pts)} fill={b.tone} opacity={0.9} filter="url(#paperFine)" />
          </g>
        );
      })}
    </g>
  );
};

/** Paper-mosaic silhouette of a person; pieces can drift apart with the wind. */
const inside = (x: number, y: number) => {
  if ((x - 0) ** 2 + (y + 152) ** 2 < 26 ** 2) return true; // head
  if (y > -124 && y < 0 && Math.abs(x) < 34 - (y + 124) * 0.04) return true; // torso
  if (y >= 0 && y < 150 && (Math.abs(x - 14) < 12 || Math.abs(x + 14) < 12)) return true; // legs
  if (y > -116 && y < -20 && Math.abs(x) > 30 && Math.abs(x) < 46) return true; // arms
  return false;
};
const CELL = 20;
const MOSAIC = (() => {
  const out: {x: number; y: number}[] = [];
  for (let y = -180; y < 150; y += CELL * 0.75)
    for (let x = -50; x < 50; x += CELL * 0.75) if (inside(x + CELL / 2, y + CELL / 2)) out.push({x, y});
  return out;
})();

export type Memory = {x: number; y: number; scale: number; appear: number; fade?: number; breakAt?: number; tone: string};

export const Silhouette: React.FC<{s: number; m: Memory; seed: number}> = ({s, m, seed}) => {
  const a = clamp((s - m.appear) / 1.6);
  if (a <= 0) return null;
  const fade = m.fade !== undefined ? 1 - clamp((s - m.fade) / 2.2) : 1;
  if (fade <= 0) return null;
  const r = rng(seed);
  const sway = Math.sin(s * 0.8 + seed) * 3;
  // Intact: one cut-out figure. Breaking: the figure gives way to shards that blow away.
  const solid = m.breakAt !== undefined ? 1 - clamp((s - m.breakAt) / 0.35) : 1;
  const breaking = m.breakAt !== undefined && s >= m.breakAt;
  return (
    <g transform={`translate(${m.x + sway} ${m.y}) scale(${m.scale})`} opacity={0.82 * a * fade}>
      {solid > 0 && (
        <g filter="url(#paper)" opacity={solid}>
          <circle cx={0} cy={-152} r={25} fill={m.tone} />
          <path d={closedSpline([[-40, -118], [40, -118], [47, -36], [34, 4], [-34, 4], [-47, -36]])} fill={m.tone} />
          <path d={closedSpline([[-27, -4], [-3, -4], [-5, 150], [-25, 150]])} fill={m.tone} />
          <path d={closedSpline([[3, -4], [27, -4], [25, 150], [5, 150]])} fill={m.tone} />
        </g>
      )}
      {breaking && (
        <g filter="url(#paper)">
      {MOSAIC.map((c, i) => {
        const delay = r() * 1.6 + (150 - c.y) / 260;
        const spin = (r() - 0.5) * 540;
        const lift = 30 + r() * 80;
        const t = m.breakAt !== undefined ? Math.max(0, s - m.breakAt - delay) : 0;
        const dx = t * t * 140 + t * 60;
        const dy = -t * lift + t * t * 25;
        const o = 1 - clamp(t / 2.4);
        if (o <= 0) return null;
        // irregular torn shard, slightly rotated even at rest
        const j = [r(), r(), r(), r()].map((v) => 0.55 + v * 0.5);
        const cxp = c.x + CELL / 2;
        const cyp = c.y + CELL / 2;
        const shard: [number, number][] = [
          [cxp - CELL * 0.6 * j[0], cyp - CELL * 0.5],
          [cxp + CELL * 0.6 * j[1], cyp - CELL * 0.55 * j[2]],
          [cxp + CELL * 0.55, cyp + CELL * 0.6 * j[3]],
          [cxp - CELL * 0.5 * j[2], cyp + CELL * 0.55],
        ];
        const rest = (r() - 0.5) * 24;
        return (
          <path
            key={i}
            d={`M ${shard.map((q) => q.join(' ')).join(' L ')} Z`}
            fill={m.tone}
            opacity={o}
            transform={`translate(${dx} ${dy}) rotate(${rest + t * spin} ${cxp} ${cyp})`}
          />
        );
      })}
        </g>
      )}
    </g>
  );
};

/**
 * Paper bus seen from the side, front to the left. `x` is the front bumper position.
 * Headlights throw light ahead; interior windows glow warm.
 */
export const Bus: React.FC<{x: number; s: number; scale?: number; door?: number}> = ({x, s, scale = 1.4, door = 0}) => {
  const W = 1050;
  const H = 330;
  const base = GROUND - 26;
  const wheelSpin = (x / (2 * Math.PI * 42)) * 360;
  return (
    <g transform={`translate(${x} ${base}) scale(${scale})`}>
      {/* headlight beams */}
      <polygon points="0,-90 -520,-170 -520,40 0,-55" fill="#ffe2a3" opacity={0.14} style={{mixBlendMode: 'screen'}} />
      <path
        d={closedSpline([
          [30, -H + 30],
          [W - 10, -H + 10],
          [W, -H + 40],
          [W, -40],
          [0, -40],
          [-6, -140],
          [6, -H + 60],
        ])}
        fill="#2e5560"
        filter="url(#paper)"
      />
      <rect x={10} y={-120} width={W - 10} height={24} fill="#1b363e" />
      {/* windows */}
      {Array.from({length: 7}, (_, i) => (
        <rect key={i} x={170 + i * 122} y={-H + 60} width={104} height={110} rx={6} fill="#e8b85a" opacity={0.75} filter="url(#paperFine)" />
      ))}
      <rect x={24} y={-H + 56} width={120} height={140} rx={10} fill="#e8c27a" opacity={0.8} filter="url(#paperFine)" />
      {/* front door (opens by sliding) */}
      <rect x={60} y={-H + 70} width={90} height={H - 112} fill="#f0cf8a" opacity={0.85} />
      <rect x={60 + door * 70} y={-H + 70} width={90 - door * 70} height={H - 112} fill="#24474f" stroke="#10242a" strokeWidth={4} />
      {/* headlight and destination sign */}
      <ellipse cx={8} cy={-80} rx={12} ry={18} fill="#fff1c9" />
      <circle cx={8} cy={-80} r={70} fill="url(#lampGlow)" style={{mixBlendMode: 'screen'}} />
      <rect x={30} y={-H + 18} width={180} height={30} rx={4} fill="#c9a24e" />
      <text x={120} y={-H + 41} textAnchor="middle" fontFamily="Georgia, serif" fontSize={22} fill="#1a1a1a">
        CENTRO
      </text>
      {/* wheels */}
      {[190, W - 210].map((wx) => (
        <g key={wx} transform={`translate(${wx} -36) rotate(${-wheelSpin})`}>
          <circle r={46} fill="#0b1114" filter="url(#paper)" />
          <rect x={-4} y={-30} width={8} height={60} fill="#55626a" />
          <rect x={-30} y={-4} width={60} height={8} fill="#55626a" />
        </g>
      ))}
      {/* rain sheen on the roof */}
      <rect x={30} y={-H + 6} width={W - 60} height={6} fill="#b8d2db" opacity={0.25 + 0.1 * Math.sin(s * 9)} />
    </g>
  );
};

/** Dialogue caption on a strip of torn cream paper; long lines wrap. */
export const PaperCaption: React.FC<{text: string; opacity: number}> = ({text, opacity}) => {
  if (opacity <= 0) return null;
  const lines: string[] = [];
  for (const word of text.split(' ')) {
    const last = lines[lines.length - 1];
    if (last !== undefined && (last + ' ' + word).length <= 30) lines[lines.length - 1] = last + ' ' + word;
    else lines.push(word);
  }
  const longest = Math.max(...lines.map((l) => l.length));
  const w = Math.min(1000, 110 + longest * 21);
  const h = 44 + lines.length * 50;
  const top = 1720 - h;
  return (
    <g opacity={opacity}>
      <rect x={540 - w / 2} y={top} width={w} height={h} fill="#e4dccb" filter="url(#paperBg)" />
      {lines.map((l, i) => (
        <text key={i} x={540} y={top + 58 + i * 50} textAnchor="middle" fontFamily="Georgia, serif" fontSize={40} fill="#1f1b16">
          {l}
        </text>
      ))}
    </g>
  );
};

export {lerp};
