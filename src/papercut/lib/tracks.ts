import {clamp, easeInOut, easeOut, easeOutBack, lerp} from './math';

/** Keyframe: [seconds, value] or [seconds, value, ease into this key]. */
export type Ease = 'io' | 'out' | 'in' | 'lin' | 'step' | 'back';
export type Key = [number, number] | [number, number, Ease];

const EASES: Record<Ease, (t: number) => number> = {
  io: easeInOut,
  out: easeOut,
  in: (t) => clamp(t) ** 3,
  lin: (t) => clamp(t),
  step: (t) => (t >= 1 ? 1 : 0),
  back: easeOutBack,
};

/** Value of a keyframed channel at time `s` (seconds). Holds the first/last value outside the keys. */
export const track = (s: number, keys: Key[] | undefined, fallback = 0): number => {
  if (!keys || keys.length === 0) return fallback;
  if (s <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t1, v1, e] = keys[i] as [number, number, Ease?];
    if (s <= t1) {
      const [t0, v0] = keys[i - 1];
      return lerp(v0, v1, EASES[e ?? 'io']((s - t0) / Math.max(1e-6, t1 - t0)));
    }
  }
  return keys[keys.length - 1][1];
};
