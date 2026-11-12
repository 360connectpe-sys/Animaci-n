import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {breath} from '../lib/anim';
import {Background} from './Dialogue';
import {NightRoomBack, NightRoomFront} from './backdrops/NightRoom';
import {SunsetStreetBack, SunsetStreetFront} from './backdrops/SunsetStreet';

export type SceneName = 'dialogue' | 'room' | 'street';
export type ExpressionName = 'neutral' | 'sad' | 'thoughtful';

type EyeSpot = {x: number; y: number; rot: number};

// Head layer per expression (same canvas, same neck seam) and where the closed-eye overlay goes.
// The sad face already has closed eyes, so it does not blink.
const EXPRESSIONS: Record<ExpressionName, {head: string; eyes: EyeSpot[] | null}> = {
  neutral: {
    head: 'head-front-neutral.png',
    eyes: [
      {x: 112.5, y: 58, rot: 0},
      {x: 138.75, y: 58, rot: 0},
    ],
  },
  sad: {head: 'head-front-sad.png', eyes: null},
  thoughtful: {
    head: 'head-front-thoughtful.png',
    eyes: [
      {x: 121, y: 44.6, rot: 6.8},
      {x: 149.4, y: 48, rot: 6.8},
    ],
  },
};

// 10 seconds at 30 fps. Layers come from tools/assets/split_character.py (same 252x680 canvas).
export const IDLE_DURATION = 300;
export const IDLE_SHORT_DURATION = 150; // 5 s version

const CANVAS_W = 252;
const CANVAS_H = 680;
const SCALE = 2.4;
const FIG_W = CANVAS_W * SCALE;
const FIG_H = CANVAS_H * SCALE;
const FEET_Y = 1700; // where the shoes touch the floor in the 1080x1920 frame

// Head pivot (neck) and eye centers, in layer canvas coordinates.
const NECK = {x: 123, y: 112};
// Closed-eye overlay (right eye from the sheet; the left eye is the same image mirrored).
const EYE_W = 15; // canvas px; the asset is 60x32 (4x)
const EYE_H = 8;

// Natural blinks: irregular spacing, one double blink. Frames at 30 fps.
const BLINK_STARTS = [40, 118, 205, 214, 268];
const BLINK_SHAPE = [0.55, 1, 1, 0.6, 0.2]; // closed amount over 5 frames

const blinkAmount = (frame: number): number => {
  for (const start of BLINK_STARTS) {
    const i = frame - start;
    if (i >= 0 && i < BLINK_SHAPE.length) return BLINK_SHAPE[i];
  }
  return 0;
};

const ClosedEyes: React.FC<{amount: number; eyes: EyeSpot[] | null}> = ({amount, eyes}) => {
  if (amount <= 0 || !eyes) return null;
  const src = staticFile('assets/characters/animation-parts/eyes/eye-closed-right.png');
  return (
    <>
      {eyes.map((e, i) => (
        <Img
          key={i}
          src={src}
          style={{
            position: 'absolute',
            left: (e.x - EYE_W / 2) * SCALE,
            top: (e.y - EYE_H / 2) * SCALE,
            width: EYE_W * SCALE,
            height: EYE_H * SCALE,
            opacity: amount,
            // eyes[0] is the left eye in the image: mirror the right-eye asset for it.
            transform: `rotate(${e.rot}deg)${i === 0 ? ' scaleX(-1)' : ''}`,
          }}
        />
      ))}
    </>
  );
};

export const CharacterIdle: React.FC<{scene?: SceneName; expression?: ExpressionName}> = ({
  scene = 'dialogue',
  expression = 'neutral',
}) => {
  const face = EXPRESSIONS[expression];
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  // Breathing: whole figure scales a hair taller on inhale, anchored at the feet.
  const b = breath(frame, fps, 4);
  const chest = 1 + 0.012 * b;

  // Natural head tilt: a slow roll plus a faster, smaller one. Rotation only, around the neck base,
  // so face and neck stay aligned with the body (no independent shifts).
  const t = frame / fps;
  const tilt = 2.4 * Math.sin(t * 1.1) + 0.5 * Math.sin(t * 2.3 + 1);

  const closed = blinkAmount(frame);

  // Fades in/out.
  const fade = interpolate(frame, [0, 15, durationInFrames - 20, durationInFrames - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const layer: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: FIG_W, height: FIG_H};

  return (
    <AbsoluteFill style={{backgroundColor: '#18141c', opacity: fade}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute'}}>
        {scene === 'room' ? (
          <NightRoomBack frame={frame} duration={durationInFrames} />
        ) : scene === 'street' ? (
          <SunsetStreetBack frame={frame} duration={durationInFrames} />
        ) : (
          <>
            <Background frame={frame} />
            <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
          </>
        )}
      </svg>

      <div
        style={{
          position: 'absolute',
          left: (width - FIG_W) / 2,
          top: FEET_Y - FIG_H,
          width: FIG_W,
          height: FIG_H,
          transformOrigin: '50% 100%',
          transform: `scaleY(${chest})`,
        }}
      >
        <Img src={staticFile('assets/characters/animation-parts/torso/body-front-no-head.png')} style={layer} />
        <div
          style={{
            ...layer,
            transformOrigin: `${NECK.x * SCALE}px ${NECK.y * SCALE}px`,
            transform: `rotate(${tilt}deg)`,
          }}
        >
          <Img src={staticFile(`assets/characters/animation-parts/head/${face.head}`)} style={layer} />
          <ClosedEyes amount={closed} eyes={face.eyes} />
        </div>
      </div>
      {scene !== 'dialogue' && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute'}}>
          {scene === 'room' ? (
            <NightRoomFront frame={frame} duration={durationInFrames} />
          ) : (
            <SunsetStreetFront frame={frame} duration={durationInFrames} />
          )}
        </svg>
      )}
    </AbsoluteFill>
  );
};
