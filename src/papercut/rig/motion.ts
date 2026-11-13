import type {Limb3} from './Puppet';
import {FOOT_H, SHIN, THIGH, legReach} from './Puppet';

/** Leg and arm angles for a walk cycle at phase p; amp 0..1 scales the stride (0 = standing). */
export const walkCycle = (p: number, amp: number) => {
  const leg = (q: number): Limb3 => {
    const s = Math.sin(q);
    const c = Math.cos(q);
    const thigh = 24 * s * amp;
    const knee = 3 + amp * 40 * Math.pow(Math.max(0, c), 1.6);
    // heel lifts at push-off, toe lifts slightly at heel strike
    const foot = amp * (22 * Math.max(0, -s) * Math.max(0, c) - 10 * Math.max(0, s) * Math.max(0, -c));
    return [thigh, knee, foot];
  };
  const s = Math.sin(p);
  return {
    legF: leg(p),
    legB: leg(p + Math.PI),
    armF: [-16 * s * amp, 12 + 10 * amp * Math.max(0, -s), 4] as Limb3,
    armB: [16 * s * amp, 12 + 10 * amp * Math.max(0, s), 4] as Limb3,
    lean: 4 * amp,
  };
};

/** Hip height that keeps the lower foot on the ground. */
export const hipOnGround = (ground: number, legF: Limb3, legB: Limb3) => ground - Math.max(legReach(legF), legReach(legB));

/** Ground distance covered by one full walk cycle for a given stride amplitude. */
export const cycleLength = (amp: number) => 4 * (175 + 168) * Math.sin((24 * Math.max(0.3, amp) * Math.PI) / 180);

/** Blink: closed amount for a few frames from each start frame. */
export const blinkAt = (frame: number, starts: number[]) => {
  const shape = [0.5, 1, 1, 0.55, 0.15];
  for (const s of starts) {
    const i = frame - s;
    if (i >= 0 && i < shape.length) return shape[i];
  }
  return 0;
};

const R2D = 180 / Math.PI;

/**
 * Two-bone leg IK: angles that put the ankle on a target point (scene px). Knee bends backward.
 * `facing` is +1/-1; the result uses the puppet's forward-positive convention.
 */
export const legIK = (hipX: number, hipY: number, ankleX: number, ankleY: number, facing: number): Limb3 => {
  const dx = (ankleX - hipX) * Math.sign(facing || 1);
  const dy = ankleY - hipY;
  const d = Math.min(Math.hypot(dx, dy), THIGH + SHIN - 0.5);
  const base = Math.atan2(dx, dy) * R2D;
  const c = (a: number) => Math.min(1, Math.max(-1, a));
  const a1 = Math.acos(c((THIGH * THIGH + d * d - SHIN * SHIN) / (2 * THIGH * d))) * R2D;
  const inner = Math.acos(c((THIGH * THIGH + SHIN * SHIN - d * d) / (2 * THIGH * SHIN))) * R2D;
  return [base + a1, 180 - inner, 0];
};

export const ANKLE_ABOVE_GROUND = FOOT_H;
