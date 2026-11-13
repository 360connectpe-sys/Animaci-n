export type Pt = [number, number];

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOut = (t: number) => 1 - Math.pow(1 - clamp(t), 3);
export const easeOutBack = (t: number) => {
  const x = clamp(t);
  const c = 1.5;
  return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
};
/** Eased 0..1 progress between two frames. */
export const seg = (frame: number, a: number, b: number, ease = easeInOut) => ease((frame - a) / (b - a));

export const lerpPts = (a: Pt[], b: Pt[], t: number): Pt[] => a.map((p, i) => [lerp(p[0], b[i][0], t), lerp(p[1], b[i][1], t)]);

/** Smooth closed path through points (Catmull-Rom as cubic Béziers). */
export const closedSpline = (pts: Pt[], k = 1 / 6): string => {
  const n = pts.length;
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k];
    const c2 = [p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + ' Z';
};

/** Deterministic random numbers so scenery is identical on every render. */
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

/** Darken a #rrggbb color (f < 1) for limbs on the far side of the body. */
export const shade = (hex: string, f: number) => {
  const n = parseInt(hex.slice(1), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(clamp(v * f, 0, 255)));
  return `#${c.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
};
