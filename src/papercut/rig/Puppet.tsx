import React from 'react';
import {Pt, closedSpline, shade} from '../lib/math';
import {Head, HeadLook, HeadState} from './Head';

/**
 * Paper puppet: every body part is a separate paper piece hinged at a joint.
 * Drawn facing +x; `facing: -1` mirrors it. Root = pelvis.
 * Angle conventions (degrees, "forward" = the way the character faces):
 *   legs  [thighForward, kneeBend, footTilt]   arms [armForward, elbowBend, wristBend]
 *   lean  torso forward,  tilt  head forward/down
 */
export type Limb3 = [number, number, number];

export type Look = HeadLook & {
  top: string; // sweater / hoodie
  pants: string;
  shoe: string;
  sole: string;
  outfit: 'sweater' | 'hoodie';
  build: number; // torso width factor
  headScale: number;
};

export type Pose = {
  x: number;
  y: number;
  facing: number; // +1 right, -1 left; values in between squash the puppet while it turns around
  scale: number;
  opacity?: number;
  lean: number;
  tilt: number;
  breath: number; // -1..1
  legF: Limb3;
  legB: Limb3;
  armF: Limb3;
  armB: Limb3;
  head: HeadState;
};

export const THIGH = 175;
export const SHIN = 168;
export const FOOT_H = 32;
export const UPPER = 132;
export const FORE = 118;

const HIP_F: Pt = [8, 0];
const HIP_B: Pt = [-8, 0];
const SH_F: Pt = [10, -212];
const SH_B: Pt = [-6, -210];
const NECK: Pt = [3, -246];

const BACK = 0.68;

/** Paper fastener (brad) that "holds" a joint together. */
const Pin: React.FC<{x?: number; y?: number; show: boolean}> = ({x = 0, y = 0, show}) =>
  show ? (
    <g>
      <circle cx={x} cy={y} r={4.2} fill="#9c8656" filter="url(#paperFine)" />
      <circle cx={x - 1} cy={y - 1} r={1.4} fill="#d8c48f" />
    </g>
  ) : null; // far-side limbs are darker

/** Tapered capsule from (0,0) down to (0,len). */
const cap = (len: number, w0: number, w1: number) =>
  closedSpline([
    [-w0 / 2, -6],
    [w0 / 2, -6],
    [w0 / 2 + 1, len * 0.5],
    [w1 / 2, len + 5],
    [-w1 / 2, len + 5],
    [-w0 / 2 - 1, len * 0.5],
  ]);

const SHOE = closedSpline([
  [-20, -8],
  [16, -8],
  [34, 5],
  [60, 14],
  [66, 26],
  [60, 32],
  [-22, 32],
  [-26, 14],
]);
const SOLE = 'M -23 25 L 64 25 L 61 32 L -22 32 Z';
const HAND = closedSpline([
  [-11, -6],
  [11, -6],
  [14, 12],
  [13, 28],
  [6, 40],
  [-5, 40],
  [-13, 28],
  [-14, 10],
]);
const THUMB = closedSpline([
  [8, 4],
  [19, 8],
  [21, 19],
  [15, 21],
  [8, 14],
]);

/** Height from hip joint to sole for a leg pose (used to keep the feet on the ground). */
export const legReach = (l: Limb3) => {
  const r = Math.PI / 180;
  return THIGH * Math.cos(l[0] * r) + SHIN * Math.cos((l[0] - l[1]) * r) + FOOT_H;
};

const Leg: React.FC<{at: Pt; a: Limb3; look: Look; f: number}> = ({at, a, look, f}) => {
  const rT = -a[0];
  const rS = a[1];
  const rF = -(rT + rS) + a[2];
  const pants = shade(look.pants, f);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${rT})`}>
      <path d={cap(THIGH, 60, 47)} fill={pants} filter="url(#paper)" />
      <g transform={`translate(0 ${THIGH}) rotate(${rS})`}>
        <g transform={`translate(0 ${SHIN}) rotate(${rF})`}>
          <path d={SHOE} fill={shade(look.shoe, f)} filter="url(#paper)" />
          <path d={SOLE} fill={shade(look.sole, f)} />
        </g>
        <path d={cap(SHIN, 47, 40)} fill={pants} filter="url(#paper)" />
        <Pin show={f === 1} />
      </g>
    </g>
  );
};

const Arm: React.FC<{at: Pt; a: Limb3; look: Look; f: number}> = ({at, a, look, f}) => {
  const sleeve = shade(look.top, f);
  const skin = shade(look.skin, f);
  return (
    <g transform={`translate(${at[0]} ${at[1]}) rotate(${-a[0]})`}>
      <path d={cap(UPPER, 50, 36)} fill={sleeve} filter="url(#paper)" />
      <g transform={`translate(0 ${UPPER}) rotate(${-a[1]})`}>
        <g transform={`translate(0 ${FORE}) rotate(${-a[2]})`}>
          <path d={THUMB} fill={skin} filter="url(#paperFine)" />
          <path d={HAND} fill={skin} filter="url(#paper)" />
        </g>
        <path d={cap(FORE, 35, 30)} fill={sleeve} filter="url(#paper)" />
        <Pin show={f === 1} />
      </g>
      <Pin show={f === 1} />
    </g>
  );
};

const Torso: React.FC<{look: Look}> = ({look}) => {
  const b = look.build;
  const pts: Pt[] = [
    [-44, 6],
    [46, 6],
    [53, -60],
    [55, -140],
    [54, -200],
    [34, -236],
    [-14, -244],
    [-54, -228],
    [-60, -160],
    [-52, -60],
  ].map(([x, y]) => [x * b, y] as Pt);
  const dark = shade(look.top, 0.75);
  return (
    <>
      {look.outfit === 'hoodie' && (
        // hood folded behind the neck
        <path
          d={closedSpline([
            [-60 * b, -196],
            [-36, -256],
            [4, -262],
            [16, -240],
            [-18, -226],
            [-48 * b, -184],
          ])}
          fill={shade(look.top, 1.25)}
          filter="url(#paper)"
        />
      )}
      <path d={closedSpline(pts)} fill={look.top} filter="url(#paper)" />
      {look.outfit === 'sweater' ? (
        <>
          <path d="M -12 -238 Q 8 -222 26 -236" stroke={dark} strokeWidth={5} fill="none" />
          <path d={`M ${-46 * b} -6 L ${48 * b} -6`} stroke={dark} strokeWidth={7} opacity={0.6} />
        </>
      ) : (
        <>
          <path d="M 22 -232 L 26 -176 M 30 -230 L 34 -184" stroke="#bdb6a8" strokeWidth={2.2} opacity={0.8} />
          <path d={`M ${-30 * b} -40 Q 8 -52 ${44 * b} -40 L ${46 * b} -6 L ${-34 * b} -6 Z`} fill={dark} opacity={0.55} />
        </>
      )}
    </>
  );
};

export const Puppet: React.FC<{uid: string; look: Look; pose: Pose}> = ({uid, look, pose}) => {
  const p = pose;
  const torso = `rotate(${p.lean}) scale(1 ${1 + 0.012 * p.breath})`;
  return (
    <g transform={`translate(${p.x} ${p.y}) scale(${p.facing * p.scale} ${p.scale})`} opacity={p.opacity ?? 1}>
      {/* far side */}
      <g transform={torso}>
        <Arm at={SH_B} a={p.armB} look={look} f={BACK} />
      </g>
      <Leg at={HIP_B} a={p.legB} look={look} f={BACK} />
      {/* near leg and pelvis */}
      <Leg at={HIP_F} a={p.legF} look={look} f={1} />
      <path
        d={closedSpline([
          [-46 * look.build, -26],
          [48 * look.build, -26],
          [50, 16],
          [-48, 16],
        ])}
        fill={look.pants}
        filter="url(#paper)"
      />
      {/* torso, head and near arm move together */}
      <g transform={torso}>
        <rect x={-12} y={-262} width={26} height={40} rx={8} fill={shade(look.skin, 0.85)} filter="url(#paperFine)" />
        <Torso look={look} />
        <g transform={`translate(${NECK[0]} ${NECK[1]}) rotate(${p.tilt}) scale(${look.headScale})`}>
          <Head uid={uid} look={look} s={p.head} />
        </g>
        <Arm at={SH_F} a={p.armF} look={look} f={1} />
      </g>
    </g>
  );
};
