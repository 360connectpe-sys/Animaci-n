import React from 'react';

/**
 * Shared SVG filters that make flat shapes read as cut and torn paper:
 * - paper:     torn edge + pale fiber rim + grain + soft cast shadow (characters, props)
 * - paperBg:   bigger tears and a deeper shadow (scenery layers)
 * - paperFine: tiny tear + small shadow (facial features)
 * - soft:      plain blur (light pools, reflections)
 * Noise seeds are fixed, so the texture never "boils" between frames; filters work in each piece's
 * own coordinates, so the texture travels with a rotating limb.
 */
const Grain: React.FC<{freq: number; seed: number}> = ({freq, seed}) => (
  <>
    <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={2} seed={seed} result="grain" />
    <feColorMatrix in="grain" type="saturate" values="0" result="grainG" />
    <feComponentTransfer in="grainG" result="grainT">
      <feFuncR type="linear" slope={0.38} intercept={0.76} />
      <feFuncG type="linear" slope={0.38} intercept={0.76} />
      <feFuncB type="linear" slope={0.38} intercept={0.76} />
      <feFuncA type="linear" slope={0} intercept={1} />
    </feComponentTransfer>
  </>
);

export const PaperDefs: React.FC = () => (
  <defs>
    <filter id="paper" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={0.05} numOctaves={3} seed={4} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={5} xChannelSelector="R" yChannelSelector="G" result="torn" />
      <feMorphology in="torn" operator="dilate" radius={1.2} result="fat" />
      <feTurbulence type="fractalNoise" baseFrequency={0.14} numOctaves={2} seed={9} result="warp2" />
      <feDisplacementMap in="fat" in2="warp2" scale={4} xChannelSelector="R" yChannelSelector="G" result="fatTorn" />
      <feFlood floodColor="#e4dccb" floodOpacity={0.75} result="rimC" />
      <feComposite in="rimC" in2="fatTorn" operator="in" result="rim" />
      <Grain freq={0.7} seed={2} />
      <feBlend in="torn" in2="grainT" mode="multiply" result="tex" />
      <feComposite in="tex" in2="torn" operator="in" result="texIn" />
      <feMerge result="piece">
        <feMergeNode in="rim" />
        <feMergeNode in="texIn" />
      </feMerge>
      <feDropShadow in="piece" dx={2.5} dy={4} stdDeviation={3.5} floodColor="#000" floodOpacity={0.5} />
    </filter>

    <filter id="paperBg" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={0.022} numOctaves={4} seed={11} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={14} xChannelSelector="R" yChannelSelector="G" result="torn" />
      <feMorphology in="torn" operator="dilate" radius={1.6} result="fat" />
      <feTurbulence type="fractalNoise" baseFrequency={0.1} numOctaves={2} seed={21} result="warp2" />
      <feDisplacementMap in="fat" in2="warp2" scale={6} xChannelSelector="R" yChannelSelector="G" result="fatTorn" />
      <feFlood floodColor="#cfc6b3" floodOpacity={0.45} result="rimC" />
      <feComposite in="rimC" in2="fatTorn" operator="in" result="rim" />
      <Grain freq={0.55} seed={7} />
      <feBlend in="torn" in2="grainT" mode="multiply" result="tex" />
      <feComposite in="tex" in2="torn" operator="in" result="texIn" />
      <feMerge result="piece">
        <feMergeNode in="rim" />
        <feMergeNode in="texIn" />
      </feMerge>
      <feDropShadow in="piece" dx={4} dy={7} stdDeviation={7} floodColor="#000" floodOpacity={0.55} />
    </filter>

    <filter id="paperFine" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={0.2} numOctaves={2} seed={5} result="warp" />
      <feDisplacementMap in="SourceGraphic" in2="warp" scale={1.6} xChannelSelector="R" yChannelSelector="G" result="torn" />
      <feDropShadow in="torn" dx={0.8} dy={1.2} stdDeviation={0.8} floodColor="#000" floodOpacity={0.45} />
    </filter>

    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={18} />
    </filter>
    <filter id="softSmall" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation={6} />
    </filter>

    <radialGradient id="lampGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffd98c" stopOpacity={0.9} />
      <stop offset="0.35" stopColor="#f2b75c" stopOpacity={0.35} />
      <stop offset="1" stopColor="#f2b75c" stopOpacity={0} />
    </radialGradient>
    <linearGradient id="lampCone" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#ffd98c" stopOpacity={0.32} />
      <stop offset="1" stopColor="#ffd98c" stopOpacity={0.04} />
    </linearGradient>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#081a20" />
      <stop offset="0.6" stopColor="#123039" />
      <stop offset="1" stopColor="#1b3c45" />
    </linearGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.48" r="0.72">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.7} />
    </radialGradient>
  </defs>
);
