import React from 'react';

/**
 * Flat 2D presenter (generic corporate illustration, not a likeness): navy suit, white shirt, red tie.
 * Talks with `mouth` (0..1, from word timings), blinks, breathes, nods and can raise a pointing hand.
 */
export const Presenter: React.FC<{t: number; mouth: number; wide: number; blink: number; point: number; nod: number}> = ({
  t,
  mouth,
  wide,
  blink,
  point,
  nod,
}) => {
  const breath = Math.sin(t * 1.7);
  const head = 2.2 * Math.sin(t * 1.1) + nod * 4;
  const eyeH = Math.max(0.6, 7 * (1 - blink));
  const skin = '#c99172';
  const skinShade = '#b07a5c';
  return (
    <g clipPath="url(#presenter-bust)">
      <clipPath id="presenter-bust">
        <rect x={-400} y={-300} width={800} height={630} />
      </clipPath>
      {/* body */}
      <g transform={`translate(0 ${breath * 2})`}>
        <path d="M -190 330 Q -185 150 -60 118 L 60 118 Q 185 150 190 330 Z" fill="#132c5c" />
        <path d="M -60 118 L 0 230 L 60 118 Z" fill="#f4f6fb" />
        <path d="M -12 132 L 12 132 L 18 150 L 8 250 L 0 262 L -8 250 L -18 150 Z" fill="#d81f2a" />
        <path d="M -60 118 L -10 240 L -40 270 L -92 150 Z" fill="#0d214a" />
        <path d="M 60 118 L 10 240 L 40 270 L 92 150 Z" fill="#0d214a" />
        <circle cx={-118} cy={200} r={9} fill="#e8b43a" />
        {/* pointing arm (raises toward the content) */}
        <g transform={`translate(150 200) rotate(${-point * 118})`}>
          <path d="M -26 0 L 26 0 L 22 128 L -20 128 Z" fill="#132c5c" />
          <g opacity={point > 0.05 ? 1 : 0}>
            <rect x={-22} y={118} width={44} height={16} fill="#f4f6fb" />
            <ellipse cx={0} cy={150} rx={22} ry={24} fill={skin} />
          </g>
          <rect x={-5} y={160} width={10} height={30} rx={5} fill={skin} opacity={point > 0.3 ? 1 : 0} />
        </g>
      </g>
      {/* neck and head */}
      <rect x={-30} y={70} width={60} height={60} fill={skinShade} />
      <g transform={`translate(0 ${breath * 2.6}) rotate(${head} 0 90)`}>
        <ellipse cx={-80} cy={10} rx={14} ry={22} fill={skinShade} />
        <ellipse cx={80} cy={10} rx={14} ry={22} fill={skinShade} />
        <path d="M -78 -30 Q -80 70 -40 96 Q 0 116 40 96 Q 80 70 78 -30 Q 70 -100 0 -104 Q -70 -100 -78 -30 Z" fill={skin} />
        {/* hair */}
        <path d="M -84 -10 Q -96 -96 -20 -118 Q 40 -132 78 -92 Q 98 -60 86 -8 Q 76 -50 50 -62 Q 10 -50 -30 -66 Q -60 -60 -84 -10 Z" fill="#1d1612" />
        {/* brows */}
        <path d="M -54 -34 Q -36 -44 -16 -36" stroke="#1d1612" strokeWidth={8} fill="none" strokeLinecap="round" />
        <path d="M 16 -36 Q 36 -44 54 -34" stroke="#1d1612" strokeWidth={8} fill="none" strokeLinecap="round" />
        {/* eyes */}
        <ellipse cx={-34} cy={-10} rx={8} ry={eyeH} fill="#2b1a10" />
        <ellipse cx={34} cy={-10} rx={8} ry={eyeH} fill="#2b1a10" />
        {/* nose */}
        <path d="M 2 -6 Q -8 26 6 30" stroke={skinShade} strokeWidth={5} fill="none" strokeLinecap="round" />
        {/* mouth: smile when closed, open shape while speaking */}
        {mouth > 0.08 ? (
          <g>
            <ellipse cx={0} cy={58} rx={16 + 10 * wide} ry={4 + 13 * mouth} fill="#5a1d17" />
            <rect x={-12 - 6 * wide} y={50 - 2 * mouth} width={24 + 12 * wide} height={5} rx={2} fill="#fff" opacity={0.9} />
          </g>
        ) : (
          <path d="M -24 54 Q 0 70 24 54" stroke="#5a1d17" strokeWidth={6} fill="none" strokeLinecap="round" />
        )}
      </g>
    </g>
  );
};
