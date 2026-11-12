import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Person, Look, Expression, Pose} from '../rig/Person';
import {blink, breath, smooth} from '../lib/anim';

// 20 seconds at 30 fps.
export const DIALOGUE_DURATION = 600;

// Narration timing. Audio starts are in frames; subtitle times come from public/audio/*.vtt.
const JOVEN_START = 30; // "¿Somos felices?" (~2.3 s)
const MAYOR_START = 165; // "Algunos días, sí. Y eso ya es mucho." (~4.7 s)

const SUBTITLES: {from: number; to: number; text: string}[] = [
  {from: JOVEN_START + 3, to: JOVEN_START + 69, text: '¿Somos felices?'},
  {from: MAYOR_START + 3, to: MAYOR_START + 71, text: 'Algunos días, sí.'},
  {from: MAYOR_START + 72, to: MAYOR_START + 140, text: 'Y eso ya es mucho.'},
];

const JOVEN_SPEAKS: [number, number] = [JOVEN_START + 3, JOVEN_START + 69];
const MAYOR_SPEAKS: [number, number] = [MAYOR_START + 3, MAYOR_START + 140];

// Same person at two ages: same face, skin and build; hair and wardrobe change.
const YOUNG: Look = {
  skin: '#c48a64',
  hair: '#2b1b14',
  shirt: '#4b6f8a',
  pants: '#2e3440',
  hairStyle: 'long',
  wrinkles: false,
};
const OLDER: Look = {
  skin: '#c48a64',
  hair: '#9c9c9c',
  shirt: '#6f5a48',
  pants: '#3b3f4a',
  hairStyle: 'long',
  wrinkles: true,
};

// Keyframed value helper.
const kf = (frame: number, keys: [number, number][]): number =>
  interpolate(
    frame,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

// Mouth opens only inside that character's own speaking window.
const mouthFor = (frame: number, [a, b]: [number, number]): number =>
  frame >= a && frame <= b ? 0.3 + 0.4 * Math.abs(Math.sin(frame * 0.55)) : 0;

const Background: React.FC<{frame: number}> = ({frame}) => {
  const bgX = kf(frame, [
    [0, 30],
    [600, -30],
  ]);
  const windowGlow = 0.85 + 0.15 * Math.sin(frame / 40);
  return (
    <>
      <defs>
        <linearGradient id="wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#262437" />
          <stop offset="1" stopColor="#3a2f3d" />
        </linearGradient>
        <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2430" />
          <stop offset="1" stopColor="#18141c" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.6" />
        </radialGradient>
      </defs>

      {/* far wall (slowest parallax layer) */}
      <g transform={`translate(${bgX * 0.2} 0)`}>
        <rect x={-100} y={0} width={1280} height={1450} fill="url(#wall)" />
      </g>

      {/* window and light (mid layer) */}
      <g transform={`translate(${bgX * 0.45} 0)`}>
        <rect x={640} y={300} width={360} height={520} rx={6} fill="#f6e7c1" opacity={windowGlow} />
        <rect x={820} y={300} width={6} height={520} fill="#3a2f3d" />
        <rect x={640} y={555} width={360} height={6} fill="#3a2f3d" />
        <polygon points="640,820 1000,820 1120,1450 520,1450" fill="#ffe2a0" opacity={0.1 * windowGlow} />
        <ellipse cx={820} cy={560} rx={420} ry={360} fill="url(#glow)" opacity={windowGlow} />
      </g>

      {/* plant (near layer, moves most) */}
      <g transform={`translate(${bgX * 0.8} 0)`}>
        <rect x={40} y={1260} width={110} height={130} rx={10} fill="#6b4a3a" />
        <ellipse cx={95} cy={1180} rx={60} ry={130} fill="#2f5d46" />
        <ellipse cx={55} cy={1220} rx={44} ry={96} fill="#3c7255" transform="rotate(-20 55 1220)" />
        <ellipse cx={135} cy={1215} rx={40} ry={90} fill="#3c7255" transform="rotate(18 135 1215)" />
      </g>

      {/* floor and rug (fixed) */}
      <rect x={-100} y={1450} width={1280} height={600} fill="url(#floor)" />
      <ellipse cx={540} cy={1500} rx={430} ry={70} fill="#5a3e46" opacity={0.6} />
    </>
  );
};

export const Dialogue: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();

  // Camera: still at the start, slow push-in during the dramatic pause, then a long slow drift.
  const cam = kf(frame, [
    [0, 1.0],
    [90, 1.0],
    [160, 1.07],
    [599, 1.12],
  ]);

  // Joven (young): asks the question, then waits.
  const young = {
    breath: breath(frame, fps, 4),
    headTilt: kf(frame, [
      [0, -2],
      [30, -5],
      [100, 4],
      [160, 6],
      [330, 2],
      [599, -1],
    ]),
    armL: [10, -50] as [number, number],
    armR: [-10 + 4 * breath(frame, fps, 4), 50] as [number, number],
  };
  const youngPose: Pose = {
    breath: young.breath,
    headTilt: young.headTilt,
    armL: young.armL,
    armR: young.armR,
  };
  const youngExpr: Expression = {
    brow: kf(frame, [
      [0, 0],
      [40, 0.5],
      [100, -0.4],
      [160, -0.2],
      [330, 0.1],
      [599, 0.2],
    ]),
    smile: kf(frame, [
      [0, 0],
      [40, -0.2],
      [100, -0.5],
      [160, -0.3],
      [330, 0.4],
      [599, 0.5],
    ]),
    mouthOpen: mouthFor(frame, JOVEN_SPEAKS),
    eyeOpen: blink(frame, 140, 0),
  };

  // Mayor (older): listens during the pause, then answers softly.
  const older = {
    breath: breath(frame, fps, 5.5, 1.3) * kf(frame, [
      [0, 1],
      [100, 0.4],
      [160, 0.4],
      [200, 1],
    ]),
    headTilt: kf(frame, [
      [0, -1],
      [100, 10],
      [160, 12],
      [200, 4],
      [330, 2],
      [599, -2],
    ]),
  };
  const olderPose: Pose = {
    breath: older.breath,
    headTilt: older.headTilt,
    armL: [10, -50],
    armR: [-10, 50 + 6 * smooth(frame, 100, 160)],
  };
  const olderExpr: Expression = {
    brow: kf(frame, [
      [0, 0.1],
      [100, -0.3],
      [160, -0.4],
      [200, 0.2],
    ]),
    smile: kf(frame, [
      [0, -0.2],
      [100, -0.4],
      [160, -0.3],
      [200, 0.5],
      [330, 0.4],
      [599, 0.5],
    ]),
    mouthOpen: mouthFor(frame, MAYOR_SPEAKS),
    eyeOpen: blink(frame, 170, 60),
  };

  // Fades: in at start, out at end.
  const fadeIn = smooth(frame, 0, 20);
  const fadeOut = 1 - smooth(frame, DIALOGUE_DURATION - 30, DIALOGUE_DURATION - 1);

  const activeSubs = SUBTITLES.filter((s) => frame >= s.from && frame <= s.to);

  return (
    <AbsoluteFill style={{backgroundColor: '#18141c', opacity: fadeIn * fadeOut}}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${width / 2} ${height / 2}) scale(${cam}) translate(${-width / 2} ${-height / 2})`}>
          <Background frame={frame} />
          <Person x={290} y={1200} facing={1} scale={1.1} look={YOUNG} pose={youngPose} expr={youngExpr} />
          <Person x={790} y={1200} facing={-1} scale={1.1} look={OLDER} pose={olderPose} expr={olderExpr} />
        </g>
        {/* lighting vignette (fixed) */}
        <rect x={0} y={0} width={width} height={height} fill="url(#vignette)" />
      </svg>

      {/* subtitles, synced to narration timings */}
      <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
        {activeSubs.map((s) => (
          <div
            key={s.text}
            style={{
              fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
              fontSize: 60,
              fontWeight: 600,
              color: '#ffffff',
              background: 'rgba(0,0,0,0.55)',
              padding: '18px 30px',
              borderRadius: 18,
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            {s.text}
          </div>
        ))}
      </AbsoluteFill>

      <Sequence from={JOVEN_START}>
        <Audio src={staticFile('audio/joven_pregunta.mp3')} />
      </Sequence>
      <Sequence from={MAYOR_START}>
        <Audio src={staticFile('audio/mayor_responde.mp3')} />
      </Sequence>
    </AbsoluteFill>
  );
};
