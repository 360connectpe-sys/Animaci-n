import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PaperDefs} from '../paper/PaperDefs';
import {Puppet, Pose} from '../rig/Puppet';
import {Head, HEAD_REST, HeadState} from '../rig/Head';
import {hipOnGround} from '../rig/motion';
import {ADULT, YOUNG} from '../characters';

// Still sheet to review the two characters: full body, seated pose and interchangeable expressions.
const standing = (x: number, facing: 1 | -1, head: HeadState): Pose => ({
  x,
  y: hipOnGround(1120, [0, 3, 0], [0, 3, 0]),
  facing,
  scale: 1,
  lean: 0,
  tilt: 0,
  breath: 0,
  legF: [6, 4, 0],
  legB: [-5, 3, 0],
  armF: [6, 14, 4],
  armB: [-4, 12, 4],
  head,
});

const EXPR: {label: string; who: 'young' | 'adult'; s: Partial<HeadState>}[] = [
  {label: 'curioso', who: 'young', s: {turn: 0.45, brow: 0.6, smile: 0.25}},
  {label: 'esperanzado', who: 'young', s: {turn: 0.8, brow: 0.35, browTilt: 0.2, smile: 0.4, lookY: -0.4}},
  {label: 'decepcionado', who: 'young', s: {turn: 0.5, brow: -0.2, browTilt: 0.8, smile: -0.5, lid: 0.35, lookY: 0.9}},
  {label: 'reservado', who: 'adult', s: {turn: 0.45, brow: -0.35, lid: 0.35, smile: -0.1}},
  {label: 'hablando', who: 'adult', s: {turn: 0.7, brow: -0.1, lid: 0.25, mouthOpen: 0.6}},
  {label: 'triste', who: 'adult', s: {turn: 0.3, brow: -0.1, browTilt: 0.9, lid: 0.5, smile: -0.4, lookY: 1}},
];

export const CharacterSheet: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#132a31'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <PaperDefs />
      <rect x={40} y={60} width={1000} height={1110} fill="#1d3a43" filter="url(#paperBg)" />
      <rect x={40} y={1200} width={1000} height={680} fill="#e2d9c6" filter="url(#paperBg)" />
      <text x={70} y={120} fill="#e8b85a" fontFamily="Georgia, serif" fontSize={40}>
        Joven · 17
      </text>
      <text x={720} y={120} fill="#e8b85a" fontFamily="Georgia, serif" fontSize={40}>
        Adulto · 22
      </text>
      <Puppet uid="sheet-y" look={YOUNG} pose={standing(300, 1, {...HEAD_REST, turn: 0.35, brow: 0.4, smile: 0.2})} />
      <Puppet uid="sheet-a" look={ADULT} pose={standing(780, -1, {...HEAD_REST, turn: 0.35, brow: -0.3, lid: 0.35})} />
      {EXPR.map((e, i) => {
        const x = 200 + (i % 3) * 340;
        const y = 1500 + Math.floor(i / 3) * 330;
        const look = e.who === 'young' ? YOUNG : ADULT;
        return (
          <g key={e.label}>
            <g transform={`translate(${x} ${y}) scale(1.9)`}>
              <Head uid={`ex-${i}`} look={look} s={{...HEAD_REST, ...e.s}} />
            </g>
            <text x={x} y={y + 50} textAnchor="middle" fill="#2a2a2a" fontFamily="Georgia, serif" fontSize={30}>
              {e.label}
            </text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);
