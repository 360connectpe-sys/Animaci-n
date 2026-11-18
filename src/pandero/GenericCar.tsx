import React from 'react';

/** Unbranded modern sedan in flat 2D (no logos, no model). `wheel` = rotation in degrees. */
export const GenericCar: React.FC<{width: number; wheel?: number; color?: string}> = ({width, wheel = 0, color = '#8a9099'}) => (
  <svg width={width} height={width * 0.37} viewBox="0 0 1000 370">
    <ellipse cx={500} cy={352} rx={430} ry={16} fill="#000" opacity={0.35} />
    {/* body */}
    <path d="M 60 270 Q 50 215 95 196 L 250 172 Q 330 92 450 80 L 640 80 Q 720 84 790 160 L 905 182 Q 952 196 950 240 L 948 286 Q 940 300 920 300 L 80 300 Q 62 296 60 270 Z" fill={color} />
    <path d="M 60 270 Q 50 215 95 196 L 250 172 L 905 182 Q 952 196 950 240 L 950 250 L 60 252 Z" fill="#fff" opacity={0.08} />
    {/* windows */}
    <path d="M 275 172 Q 340 108 448 100 L 520 100 L 520 172 Z" fill="#1d2a3a" />
    <path d="M 540 100 L 632 100 Q 700 104 760 168 L 540 172 Z" fill="#1d2a3a" />
    <path d="M 290 168 Q 345 116 430 106" stroke="#ffffff" strokeWidth={6} opacity={0.18} fill="none" />
    {/* door lines and handles */}
    <path d="M 528 176 L 528 296 M 300 180 Q 296 240 312 296 M 760 178 Q 770 240 760 296" stroke="#5d636c" strokeWidth={3} fill="none" />
    <rect x={430} y={196} width={46} height={9} rx={4} fill="#5d636c" />
    <rect x={660} y={196} width={46} height={9} rx={4} fill="#5d636c" />
    {/* lights */}
    <path d="M 70 214 Q 92 200 140 198 L 128 222 Q 96 226 70 226 Z" fill="#f4f1e2" />
    <path d="M 900 196 Q 936 200 946 222 L 900 224 Z" fill="#e31b23" />
    <rect x={64} y={262} width={60} height={10} rx={4} fill="#3b4048" />
    {/* wheels */}
    {[245, 760].map((cx) => (
      <g key={cx} transform={`translate(${cx} 296)`}>
        <circle r={64} fill="#1b1f24" />
        <circle r={40} fill="#c8ccd2" />
        <g transform={`rotate(${wheel})`}>
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <rect key={a} x={-5} y={-38} width={10} height={30} rx={4} fill="#8e949c" transform={`rotate(${a})`} />
          ))}
        </g>
        <circle r={10} fill="#5d636c" />
      </g>
    ))}
  </svg>
);
