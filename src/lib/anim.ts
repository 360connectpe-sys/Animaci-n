// Small animation helpers shared by rigs and scenes.

/** Eye-open factor: 1 = open, ~0 = closed. Blinks for ~6 frames every `period` frames. */
export const blink = (frame: number, period = 150, offset = 0): number => {
  const f = (frame + offset) % period;
  if (f < 3) return 0.15;
  if (f < 5) return 0.5;
  return 1;
};

/** Breathing signal in [-1, 1], one cycle every `periodSeconds`. */
export const breath = (frame: number, fps: number, periodSeconds = 4, phase = 0): number =>
  Math.sin((frame / fps) * ((2 * Math.PI) / periodSeconds) + phase);

/** Smooth 0..1 progress between two frames. */
export const smooth = (frame: number, start: number, end: number): number => {
  const t = Math.min(1, Math.max(0, (frame - start) / (end - start)));
  return t * t * (3 - 2 * t);
};
