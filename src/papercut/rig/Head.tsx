import React from 'react';
import {Pt, clamp, closedSpline, lerp, lerpPts, shade} from '../lib/math';

/**
 * Paper-cut head, drawn facing +x. Origin = top of the neck.
 * `turn` morphs profile (0) into three-quarter view (1): outline, hair, ear and features move together.
 * Traits taken from the character sheets: short wavy black hair with volume on top and a fringe,
 * thick dark brows, dark brown eyes, straight nose, defined jaw, warm tan skin.
 */
export type HeadLook = {skin: string; hair: string; age: 'young' | 'adult'};
export type HeadState = {
  turn: number; // 0 profile .. 1 three-quarter
  blink: number; // 0 open .. 1 closed
  lid: number; // resting heaviness of the upper lid, 0..1
  brow: number; // -1 lowered .. 1 raised
  browTilt: number; // >0 worried/sad (inner ends up), <0 frown
  smile: number; // -1 .. 1
  mouthOpen: number; // 0 .. 1 (speech shapes)
  mouthWide: number; // 0 round .. 1 wide
  lookX: number; // -1 back .. 1 forward
  lookY: number; // -1 up .. 1 down
};

export const HEAD_REST: HeadState = {
  turn: 0,
  blink: 0,
  lid: 0,
  brow: 0,
  browTilt: 0,
  smile: 0,
  mouthOpen: 0,
  mouthWide: 0.5,
  lookX: 0,
  lookY: 0,
};

// Head outline, 17 points, same order in both views so they can be blended.
const PROFILE: Pt[] = [
  [-14, 2], [-30, -28], [-50, -62], [-45, -100], [-14, -124], [24, -120], [44, -98], [48, -82], [46, -73],
  [60, -57], [50, -51], [52, -43], [48, -36], [47, -28], [36, -17], [16, -11], [14, 2],
];
const THREE_Q: Pt[] = [
  [-12, 2], [-26, -28], [-44, -62], [-40, -102], [-10, -126], [26, -122], [46, -100], [52, -82], [52, -72],
  [55, -58], [50, -51], [49, -43], [46, -35], [42, -26], [30, -16], [10, -11], [10, 2],
];
// The adult jaw is a little more angular.
const ADULT_JAW: Record<number, [Pt, Pt]> = {
  13: [[48, -26], [44, -24]],
  14: [[38, -13], [32, -12]],
  15: [[14, -8], [8, -8]],
};

// Hair: wavy, messy volume on top (bumpy contour), a fringe of strands over the forehead, short nape.
const HAIR: Pt[] = (() => {
  const pts: Pt[] = [];
  const n = 15;
  for (let i = 0; i < n; i++) {
    const a = Math.PI * (0.93 + (1.06 * i) / (n - 1));
    const bump = 5 * Math.sin(i * 2.3) + (i % 2 ? 3 : -2);
    pts.push([2 + (61 + bump) * Math.cos(a), -96 + (51 + bump * 0.8) * Math.sin(a)]);
  }
  return pts.concat([
    [61, -101], [53, -91], [47, -104], [40, -89], [33, -103], [24, -92], [14, -104], [4, -97], [-8, -104],
    [-18, -95], [-26, -79], [-34, -60], [-47, -50],
  ] as Pt[]);
})();

const Eye: React.FC<{
  id: string;
  cx: number;
  cy: number;
  w: number;
  h: number;
  cover: number;
  lookX: number;
  lookY: number;
  front: number;
  opacity: number;
}> = ({id, cx, cy, w, h, cover, lookX, lookY, front, opacity}) => {
  if (w < 1 || opacity <= 0.01) return null;
  const s = Math.max(0.07, 1 - cover);
  const base = cy + h * 0.7;
  const almond = `M ${cx - w / 2} ${cy} Q ${cx} ${cy - h * 1.5} ${cx + w / 2} ${cy} Q ${cx} ${cy + h * 1.1} ${cx - w / 2} ${cy} Z`;
  const ix = cx + front * w * 0.16 + lookX * w * 0.16;
  const iy = cy + lookY * 1.6 + 0.4;
  const r = Math.min(h * 0.85, w * 0.27);
  return (
    <g opacity={opacity} transform={`translate(0 ${base}) scale(1 ${s}) translate(0 ${-base})`}>
      <clipPath id={id}>
        <path d={almond} />
      </clipPath>
      <path d={almond} fill="#e9e2d2" />
      <g clipPath={`url(#${id})`}>
        <circle cx={ix} cy={iy} r={r} fill="#4a2c1a" />
        <circle cx={ix} cy={iy} r={r * 0.48} fill="#120a06" />
        <circle cx={ix + r * 0.3} cy={iy - r * 0.35} r={0.9} fill="#fff" opacity={0.85} />
      </g>
      <path
        d={`M ${cx - w / 2 - 1} ${cy + 0.6} Q ${cx} ${cy - h * 1.6} ${cx + w / 2 + 1} ${cy - 0.4}`}
        stroke="#150e0a"
        strokeWidth={2.3}
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
};

const Brow: React.FC<{cx: number; cy: number; w: number; thick: number; angle: number; color: string}> = ({
  cx,
  cy,
  w,
  thick,
  angle,
  color,
}) => {
  if (w < 1) return null;
  const pts: Pt[] = [
    [cx - w / 2, cy + thick * 0.35],
    [cx - w * 0.1, cy - thick * 0.6],
    [cx + w / 2, cy - thick * 0.25],
    [cx + w / 2 - 1, cy + thick * 0.45],
    [cx - w * 0.1, cy + thick * 0.45],
  ];
  return (
    <g transform={`rotate(${angle} ${cx} ${cy})`}>
      <path d={closedSpline(pts)} fill={color} filter="url(#paperFine)" />
    </g>
  );
};

export const Head: React.FC<{uid: string; look: HeadLook; s: HeadState}> = ({uid, look, s}) => {
  const t = clamp(s.turn);
  const adult = look.age === 'adult';

  let profile = PROFILE;
  let threeQ = THREE_Q;
  if (adult) {
    profile = PROFILE.map((p, i) => (ADULT_JAW[i] ? ADULT_JAW[i][0] : p));
    threeQ = THREE_Q.map((p, i) => (ADULT_JAW[i] ? ADULT_JAW[i][1] : p));
  }
  const outline = lerpPts(profile, threeQ, t);

  // Young hair is a bit fuller on top; the 3/4 view pulls the cap slightly toward the face.
  const vol = adult ? 0.93 : 1.0;
  const hair = HAIR.map(([x, y]): Pt => {
    const yy = y < -110 ? -110 + (y + 110) * vol : y;
    return [lerp(x, x * 0.9 + 3, t), yy];
  });
  const hairTop = hair.slice(0, 15).map(([x, y]): Pt => [x * 0.8 + 4, -118 + (y + 118) * 0.7]);

  const skinDark = shade(look.skin, 0.82);
  const eyeH = adult ? 4.7 : 5.5;
  const cover = clamp(Math.max(s.blink, s.lid));

  const near = {cx: lerp(37, 26, t), cy: -77, w: lerp(13, 17, t)};
  const farW = t < 0.15 ? 0 : lerp(0, 10.5, clamp((t - 0.15) / 0.85));
  const far = {cx: lerp(52, 49, t), cy: -77, w: farW};
  const farOpacity = clamp((t - 0.15) / 0.3);

  const browRaise = s.brow * 3.5;
  const thick = adult ? 5.4 : 4.8;
  const tilt = s.browTilt * 14;

  const mx = lerp(43, 38, t);
  const my = lerp(-43, -41, t);
  const mw = lerp(9, 15, t) * (0.8 + 0.35 * s.mouthWide);
  const ear: Pt = [lerp(-8, -20, t), -60];

  return (
    <g>
      {/* skull and face */}
      <path d={closedSpline(outline)} fill={look.skin} filter="url(#paper)" />
      {/* cheek and jaw shading: a darker paper layer */}
      <path
        d={closedSpline([
          [lerp(10, 6, t), -12],
          [lerp(30, 26, t), -20],
          [lerp(36, 32, t), -40],
          [lerp(24, 20, t), -36],
          [lerp(12, 8, t), -24],
        ])}
        fill={skinDark}
        opacity={0.28}
      />
      {adult && (
        <path
          d={closedSpline([
            [lerp(14, 8, t), -9],
            [lerp(34, 28, t), -15],
            [lerp(46, 42, t), -26],
            [lerp(47, 45, t), -35],
            [lerp(40, 36, t), -33],
            [lerp(28, 24, t), -24],
            [lerp(14, 10, t), -18],
          ])}
          fill="#2a1d17"
          opacity={0.22}
        />
      )}
      {/* nose shade appears as the head turns */}
      <path d="M 51 -57 Q 46 -52 50 -50" stroke={skinDark} strokeWidth={2} fill="none" opacity={t} />

      {/* eyes and brows */}
      <Eye id={`${uid}-far`} {...far} h={eyeH * 0.9} cover={cover} lookX={s.lookX} lookY={s.lookY} front={0} opacity={farOpacity} />
      <Eye id={`${uid}-near`} {...near} h={eyeH} cover={cover} lookX={s.lookX} lookY={s.lookY} front={1 - t} opacity={1} />
      <Brow cx={far.cx + 1} cy={-86.5 - browRaise} w={far.w * 1.15} thick={thick * 0.9} angle={tilt} color={look.hair} />
      <Brow cx={near.cx} cy={-86.5 - browRaise} w={near.w * 1.2} thick={thick} angle={-tilt} color={look.hair} />

      {/* mouth: closed line with smile, or an open shape for speech */}
      {s.mouthOpen > 0.08 ? (
        <ellipse
          cx={mx}
          cy={my + s.mouthOpen * 2}
          rx={(mw / 2) * (0.7 + 0.3 * s.mouthWide)}
          ry={1.2 + s.mouthOpen * 5.5}
          fill="#3a1511"
          stroke="#6b2d24"
          strokeWidth={1.2}
        />
      ) : (
        <path
          d={`M ${mx - mw / 2} ${my - s.smile * 1.2} Q ${mx} ${my + s.smile * 4} ${mx + mw / 2} ${my - s.smile * 1.6}`}
          stroke="#5b2a21"
          strokeWidth={2.3}
          fill="none"
          strokeLinecap="round"
        />
      )}

      {/* hair: base cap plus a lighter top layer for depth */}
      <path d={closedSpline(hair)} fill={look.hair} filter="url(#paper)" />
      <path d={closedSpline(hairTop)} fill={shade(look.hair, 1.9)} opacity={0.55} filter="url(#paperFine)" />

      {/* ear sits over the hair edge */}
      <ellipse cx={ear[0]} cy={ear[1]} rx={8.5} ry={14} fill={look.skin} filter="url(#paperFine)" />
      <path
        d={`M ${ear[0] + 3} ${ear[1] - 8} Q ${ear[0] - 4} ${ear[1]} ${ear[0] + 2} ${ear[1] + 8}`}
        stroke={skinDark}
        strokeWidth={2}
        fill="none"
      />
    </g>
  );
};
