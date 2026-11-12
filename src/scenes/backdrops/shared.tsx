import React from 'react';

export const W = 1080;
export const H = 1920;
export const FEET_Y = 1700; // where the character's shoes touch the ground

export type BackdropProps = {frame: number; duration: number};

/** Small deterministic random generator, so scenery looks the same on every render. */
export const rng = (seed: number) => {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
};

/** Slow horizontal camera drift: +amp at the first frame, -amp at the last. */
export const drift = (frame: number, duration: number, amp: number): number =>
  amp * (1 - (2 * frame) / Math.max(1, duration - 1));

/** Soft contact shadow under the character's feet. */
export const ContactShadow: React.FC<{opacity?: number}> = ({opacity = 0.4}) => (
  <>
    <defs>
      <filter id="shared-blur" x="-20%" y="-100%" width="140%" height="300%">
        <feGaussianBlur stdDeviation="14" />
      </filter>
    </defs>
    <ellipse cx={W / 2} cy={FEET_Y - 6} rx={270} ry={26} fill="#000" opacity={opacity} filter="url(#shared-blur)" />
  </>
);
