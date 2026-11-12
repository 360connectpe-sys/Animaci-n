import React from 'react';

/**
 * Articulated seated person drawn in SVG.
 * Local origin = hip center. Figure faces +x when facing = 1, -x when facing = -1.
 * Units are canvas pixels before `scale`.
 */

export type Expression = {
  brow: number; // -1 worried .. 1 raised
  smile: number; // -1 frown .. 1 smile
  mouthOpen: number; // 0 closed .. 1 open
  eyeOpen: number; // 0 closed .. 1 open (drive from blink())
};

export type Pose = {
  breath: number; // -1..1, chest rises on positive values
  headTilt: number; // degrees, positive = tilt toward the figure's front
  armL: [number, number]; // [upper arm, forearm] angles in degrees
  armR: [number, number];
};

export type Look = {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  hairStyle: 'short' | 'long';
  wrinkles: boolean;
};

export type PersonProps = {
  x: number;
  y: number;
  facing: 1 | -1;
  scale: number;
  look: Look;
  pose: Pose;
  expr: Expression;
};

const NECK_Y = -420;
const SHOULDER_Y = -380;
const SHOULDER_X = 118;
const UPPER_ARM = 170;
const FOREARM = 150;

const Arm: React.FC<{side: -1 | 1; angles: [number, number]; look: Look}> = ({side, angles, look}) => (
  <g transform={`translate(${side * SHOULDER_X} ${SHOULDER_Y}) rotate(${angles[0]})`}>
    <rect x={-24} y={-6} width={48} height={UPPER_ARM} rx={24} fill={look.shirt} />
    <g transform={`translate(0 ${UPPER_ARM - 4}) rotate(${angles[1]})`}>
      <rect x={-19} y={0} width={38} height={FOREARM} rx={19} fill={look.skin} />
      <circle cx={0} cy={FOREARM + 6} r={22} fill={look.skin} />
    </g>
  </g>
);

const Face: React.FC<{look: Look; expr: Expression}> = ({look, expr}) => {
  const eyeRy = 13 * Math.max(0.08, expr.eyeOpen);
  const browY = -140 - expr.brow * 14;
  const smileY = -60 + expr.smile * 16;
  const mouthRy = 4 + expr.mouthOpen * 18;
  return (
    <g>
      {/* eyes */}
      {[-34, 34].map((ex) => (
        <g key={ex}>
          <ellipse cx={ex} cy={-108} rx={11} ry={eyeRy} fill="#2a1d1a" />
          {expr.eyeOpen > 0.6 && <circle cx={ex + 3} cy={-112} r={3} fill="#ffffff" />}
        </g>
      ))}
      {/* brows */}
      <path d={`M -56 ${browY + 4} Q -36 ${browY - 8} -14 ${browY}`} stroke={look.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={`M 56 ${browY + 4} Q 36 ${browY - 8} 14 ${browY}`} stroke={look.hair} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* mouth */}
      {expr.mouthOpen > 0.12 ? (
        <ellipse cx={0} cy={-58} rx={22} ry={mouthRy} fill="#7a2e2e" />
      ) : (
        <path d={`M -26 -60 Q 0 ${smileY} 26 -60`} stroke="#7a2e2e" strokeWidth={5} fill="none" strokeLinecap="round" />
      )}
      {look.wrinkles && (
        <g stroke="#00000030" strokeWidth={3} fill="none" strokeLinecap="round">
          <path d="M -50 -170 Q 0 -182 50 -170" />
          <path d="M -40 -70 Q -48 -50 -36 -30" />
          <path d="M 40 -70 Q 48 -50 36 -30" />
        </g>
      )}
    </g>
  );
};

export const Person: React.FC<PersonProps> = ({x, y, facing, scale, look, pose, expr}) => {
  const chestScale = 1 + 0.012 * pose.breath;
  return (
    <g transform={`translate(${x} ${y}) scale(${facing * scale} ${scale})`}>
      {/* stool */}
      <rect x={-150} y={0} width={300} height={26} rx={10} fill="#4a3f38" />
      <rect x={-120} y={26} width={22} height={170} fill="#3a322d" />
      <rect x={98} y={26} width={22} height={170} fill="#3a322d" />

      {/* legs (behind upper body) */}
      <rect x={-10} y={-70} width={210} height={70} rx={34} fill={look.pants} />
      <rect x={180} y={-30} width={52} height={270} rx={26} fill={look.pants} />
      <ellipse cx={206} cy={252} rx={46} ry={20} fill="#2b2320" />

      <g transform={`scale(1 ${chestScale})`}>
        {/* long hair behind head */}
        {look.hairStyle === 'long' && (
          <rect x={-100} y={NECK_Y - 120} width={200} height={190} rx={70} fill={look.hair} />
        )}

        {/* torso */}
        <path
          d="M -120 0 Q -138 -200 -110 -390 Q 0 -420 110 -390 Q 138 -200 120 0 Z"
          fill={look.shirt}
        />

        {/* neck */}
        <rect x={-26} y={NECK_Y - 10} width={52} height={70} fill={look.skin} />

        {/* arms */}
        <Arm side={-1} angles={pose.armL} look={look} />
        <Arm side={1} angles={pose.armR} look={look} />

        {/* head: rotates around the neck */}
        <g transform={`translate(0 ${NECK_Y}) rotate(${pose.headTilt})`}>
          <ellipse cx={0} cy={-100} rx={88} ry={105} fill={look.skin} />
          {look.hairStyle === 'short' ? (
            <path d="M -92 -110 Q -98 -215 0 -210 Q 98 -215 92 -110 Q 60 -152 0 -166 Q -60 -152 -92 -110 Z" fill={look.hair} />
          ) : (
            <path d="M -92 -110 Q -98 -215 0 -210 Q 98 -215 92 -110 Q 50 -168 0 -170 Q -50 -168 -92 -110 Z" fill={look.hair} />
          )}
          <Face look={look} expr={expr} />
        </g>
      </g>
    </g>
  );
};
