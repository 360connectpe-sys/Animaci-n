import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {PaperDefs} from '../paper/PaperDefs';
import {Puppet, Pose, Limb3} from '../rig/Puppet';
import {HEAD_REST} from '../rig/Head';
import {blinkAt, cycleLength, hipOnGround, walkCycle} from '../rig/motion';
import {clamp, easeOutBack, lerp, seg} from '../lib/math';
import {ADULT, YOUNG} from '../characters';
import {Bench, City, Clouds, GROUND, LampLight, PaperFrame, SEAT_Y, Shelter, Sky, Street, StreetLamp} from '../scenery/BusStop';
import {Puddle, Rain, Splashes} from '../scenery/Rain';

// 5 s test: the young self walks in, stops, turns his head toward the seated adult and raises a hand.
export const WALK_TEST_FRAMES = 150;

const X0 = -230;
const X1 = 372;
const WALK_END = 84; // frame where he stops

const xAt = (f: number) => {
  const t = clamp(f / WALK_END);
  return X0 + (X1 - X0) * (1 - Math.pow(1 - t, 2.2));
};
const ampAt = (f: number) => Math.pow(clamp(1 - f / WALK_END), 0.75);

/** Walk phase from the distance actually travelled, so the feet keep pace with the body. */
const phaseAt = (frame: number) => {
  let p = 0.4;
  for (let i = 0; i < Math.min(frame, WALK_END); i++) {
    p += (2 * Math.PI * (xAt(i + 1) - xAt(i))) / cycleLength(ampAt(i));
  }
  return p;
};

const youngPose = (frame: number, fps: number): Pose => {
  const amp = frame < WALK_END ? ampAt(frame) : 0;
  const w = walkCycle(phaseAt(frame), amp);
  const t = frame / fps;

  // Settle after stopping: a small damped sway of the torso.
  const since = frame - WALK_END;
  const settle = since > 0 ? 3.5 * Math.exp(-since / 7) * Math.cos(since / 2.6) : 0;

  // Head: looks up into the rain while walking, then turns down toward the adult.
  const look = seg(frame, 88, 106);
  // Hand: raises after the look, with a little overshoot, then two small waves.
  const raise = frame < 106 ? 0 : easeOutBack((frame - 106) / 18);
  const wave = frame > 120 ? 14 * Math.sin((frame - 120) / 3.6) * seg(frame, 120, 126) * (1 - seg(frame, 140, 150)) : 0;

  const armF: Limb3 = [lerp(w.armF[0], 58, raise), lerp(w.armF[1], 92, raise), lerp(w.armF[2], -6, raise) + wave];
  const legF = w.legF;
  const legB = w.legB;

  return {
    x: xAt(frame),
    y: hipOnGround(GROUND, legF, legB) + settle * 0.6,
    facing: 1,
    scale: 1,
    lean: w.lean + settle - 2 * raise,
    tilt: lerp(-9 + 2.5 * Math.sin(phaseAt(frame) * 2) * amp, 13, look),
    breath: Math.sin(t * 2.2),
    legF,
    legB,
    armF,
    armB: w.armB,
    head: {
      ...HEAD_REST,
      turn: lerp(0.05, 0.4, look),
      brow: lerp(0.25, 0.6, look),
      smile: lerp(0.05, 0.28, seg(frame, 108, 124)),
      lookY: lerp(-0.6, 0.7, look),
      lookX: lerp(0.2, 0.6, look),
      blink: blinkAt(frame, [34, 95, 138]),
    },
  };
};

const adultPose = (frame: number, fps: number): Pose => {
  const t = frame / fps;
  const notice = seg(frame, 116, 140);
  const b = Math.sin(t * 1.5);
  return {
    x: 790,
    y: SEAT_Y - 26,
    facing: -1,
    scale: 1,
    lean: 15 + 1.2 * b,
    tilt: lerp(24, 14, notice),
    breath: b,
    legF: [90, 92, 0],
    legB: [86, 88, 2],
    armF: [16, 84, 18],
    armB: [10, 86, 14],
    head: {
      ...HEAD_REST,
      turn: 0.3,
      lid: lerp(0.45, 0.3, notice),
      brow: -0.3,
      browTilt: 0.25,
      smile: -0.15,
      lookY: lerp(1, 0.3, notice),
      lookX: lerp(0, 0.6, notice),
      blink: blinkAt(frame, [46, 128]),
    },
  };
};

export const WalkTest: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const young = youngPose(frame, fps);
  const adult = adultPose(frame, fps);

  // Camera: slight push-in and a gentle pan that follows the young self.
  const zoom = lerp(1.2, 1.26, frame / WALK_TEST_FRAMES);
  const pan = -(young.x - X1) * 0.06;

  return (
    <AbsoluteFill style={{backgroundColor: '#061014'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <PaperDefs />
        <g transform={`translate(540 1230) scale(${zoom}) translate(-540 -1230)`}>
          <Sky />
          <Clouds frame={frame} pan={pan} />
          <City frame={frame} pan={pan} />
          <Rain frame={frame} seed={1} count={110} speed={34} length={24} width={1.1} opacity={0.3} />
          <g transform={`translate(${pan * 0.8} 0)`}>
            <Shelter />
            <Street frame={frame} />
            <StreetLamp />
            <Puddle frame={frame} cx={300} cy={GROUND + 90} rx={120} ry={18} glow={0.9} seed={3} />
            <Puddle frame={frame} cx={860} cy={GROUND + 110} rx={90} ry={14} seed={6} />
            <Rain frame={frame} seed={2} count={70} speed={48} length={38} width={1.7} opacity={0.4} />
            <Bench />
            {/* contact shadows */}
            <ellipse cx={young.x + 10} cy={GROUND + 6} rx={90} ry={12} fill="#000" opacity={0.45} filter="url(#softSmall)" />
            <Puppet uid="adult" look={ADULT} pose={adult} />
            <Puppet uid="young" look={YOUNG} pose={young} />
            <Splashes frame={frame} seed={9} count={26} y0={GROUND + 10} y1={GROUND + 140} />
            <LampLight frame={frame} />
          </g>
          <Rain frame={frame} seed={3} count={26} speed={70} length={70} width={3} opacity={0.35} slant={0.14} />
        </g>
        <rect x={0} y={0} width={1080} height={1920} fill="url(#vignette)" />
        <PaperFrame />
      </svg>
    </AbsoluteFill>
  );
};
