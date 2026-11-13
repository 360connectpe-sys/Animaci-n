import React from 'react';
import {rng} from '../lib/math';

type RainProps = {
  frame: number;
  seed: number;
  count: number;
  speed: number; // px per frame
  length: number;
  width: number;
  opacity: number;
  slant?: number; // horizontal drift per vertical px
  top?: number;
  bottom?: number;
};

/** One depth layer of rain streaks. Positions are deterministic and loop seamlessly. */
export const Rain: React.FC<RainProps> = ({frame, seed, count, speed, length, width, opacity, slant = 0.12, top = -100, bottom = 1920}) => {
  const r = rng(seed);
  const span = bottom - top + length;
  const drops = Array.from({length: count}, () => ({x: r() * 1180 - 50, y: r() * span, v: 0.85 + r() * 0.3}));
  return (
    <g stroke="#b8d2db" strokeWidth={width} strokeLinecap="round" opacity={opacity}>
      {drops.map((d, i) => {
        const y = top + ((d.y + frame * speed * d.v) % span) - length;
        const x = d.x + (y - top) * slant;
        return <line key={i} x1={x} y1={y} x2={x + length * slant} y2={y + length} />;
      })}
    </g>
  );
};

/** Small splashes where drops hit a ground band. */
export const Splashes: React.FC<{frame: number; seed: number; count: number; y0: number; y1: number}> = ({frame, seed, count, y0, y1}) => {
  const r = rng(seed);
  const items = Array.from({length: count}, () => ({x: r() * 1080, y: y0 + r() * (y1 - y0), period: 14 + Math.floor(r() * 12), off: Math.floor(r() * 30)}));
  return (
    <g stroke="#cfe2e8" strokeWidth={1.6} fill="none" strokeLinecap="round">
      {items.map((s, i) => {
        const t = ((frame + s.off) % s.period) / s.period;
        if (t > 0.45) return null;
        const k = t / 0.45;
        const w = 4 + k * 10;
        return (
          <path
            key={i}
            d={`M ${s.x - w} ${s.y} Q ${s.x - w * 0.5} ${s.y - 6 * (1 - k)} ${s.x} ${s.y - 2} Q ${s.x + w * 0.5} ${s.y - 6 * (1 - k)} ${s.x + w} ${s.y}`}
            opacity={0.7 * (1 - k)}
          />
        );
      })}
    </g>
  );
};

/** Puddle with expanding ripple rings and a wobbling reflection of the lamp. */
export const Puddle: React.FC<{frame: number; cx: number; cy: number; rx: number; ry: number; glow?: number; seed: number}> = ({
  frame,
  cx,
  cy,
  rx,
  ry,
  glow = 0,
  seed,
}) => {
  const r = rng(seed);
  const rings = Array.from({length: 3}, () => ({x: cx + (r() - 0.5) * rx, y: cy + (r() - 0.5) * ry * 0.6, off: Math.floor(r() * 40)}));
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#0b171c" filter="url(#paper)" />
      {glow > 0 && (
        <ellipse
          cx={cx + 6 * Math.sin(frame / 9)}
          cy={cy}
          rx={rx * 0.35}
          ry={ry * 0.5}
          fill="#f2c26a"
          opacity={glow * (0.55 + 0.1 * Math.sin(frame / 5))}
          filter="url(#softSmall)"
        />
      )}
      {rings.map((g, i) => {
        const t = ((frame + g.off) % 40) / 40;
        return (
          <ellipse key={i} cx={g.x} cy={g.y} rx={4 + t * 34} ry={(4 + t * 34) * (ry / rx)} fill="none" stroke="#a9c6cf" strokeWidth={1.4} opacity={0.6 * (1 - t)} />
        );
      })}
    </g>
  );
};
