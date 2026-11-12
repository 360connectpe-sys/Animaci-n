import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {blink, breath} from '../lib/anim';
import {Background} from './Dialogue';

// 10 seconds at 30 fps. Layers come from tools/assets/split_character.py (same 252x680 canvas).
export const IDLE_DURATION = 300;
export const IDLE_SHORT_DURATION = 150; // 5 s version, no blinking

const CANVAS_W = 252;
const CANVAS_H = 680;
const SCALE = 2.4;
const FIG_W = CANVAS_W * SCALE;
const FIG_H = CANVAS_H * SCALE;
const FEET_Y = 1700; // where the shoes touch the floor in the 1080x1920 frame

// Head pivot (neck) and eye centers, in layer canvas coordinates.
const NECK = {x: 123, y: 112};
const EYES = [112.5, 138.75];
const EYE_Y = 58;
const SKIN = 'rgb(222,148,112)';
const LASH = '#2a1b17';

const Eyelids: React.FC<{cover: number}> = ({cover}) => {
  if (cover < 0.05) return null;
  const top = EYE_Y - 4.5;
  const height = 9.5 * cover;
  return (
    <svg
      width={FIG_W}
      height={FIG_H}
      viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
      style={{position: 'absolute', left: 0, top: 0}}
    >
      {EYES.map((x) => (
        <g key={x}>
          <ellipse cx={x} cy={top + height / 2} rx={7.6} ry={Math.max(0.01, height / 2)} fill={SKIN} />
          {cover > 0.6 && (
            <path
              d={`M ${x - 6.5} ${top + height - 0.5} Q ${x} ${top + height + 1.2} ${x + 6.5} ${top + height - 0.5}`}
              stroke={LASH}
              strokeWidth={0.9}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>
      ))}
    </svg>
  );
};

export const CharacterIdle: React.FC<{blinking?: boolean}> = ({blinking = true}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();

  // Breathing: whole figure scales a hair taller on inhale, anchored at the feet.
  const b = breath(frame, fps, 4);
  const chest = 1 + 0.012 * b;

  // Natural head tilt: a slow roll plus a faster, smaller one. Rotation only, around the neck base,
  // so face and neck stay aligned with the body (no independent shifts).
  const t = frame / fps;
  const tilt = 2.4 * Math.sin(t * 1.1) + 0.5 * Math.sin(t * 2.3 + 1);

  // Blink: eyelids cover the eyes for a few frames every ~3.5 s.
  const cover = blinking ? Math.min(1, (1 - blink(frame, 105, 40)) / 0.85) : 0;

  // Fades in/out.
  const fade = interpolate(frame, [0, 15, durationInFrames - 20, durationInFrames - 1], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const layer: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: FIG_W, height: FIG_H};

  return (
    <AbsoluteFill style={{backgroundColor: '#18141c', opacity: fade}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute'}}>
        <Background frame={frame} />
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
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
          <Img src={staticFile('assets/characters/animation-parts/head/head-front-neutral.png')} style={layer} />
          <Eyelids cover={cover} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
