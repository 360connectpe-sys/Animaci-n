import React from 'react';
import {AbsoluteFill, interpolate} from 'remotion';

export type Cue = {from: number; to: number; text: string};

/** Bottom-centered subtitles with a short fade in and out. Frames are composition frames. */
export const Subtitles: React.FC<{frame: number; cues: Cue[]}> = ({frame, cues}) => (
  <AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
    {cues
      .filter((c) => frame >= c.from && frame <= c.to)
      .map((c) => (
        <div
          key={c.text}
          style={{
            opacity: interpolate(frame, [c.from, c.from + 4, c.to - 4, c.to], [0, 1, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
            fontSize: 56,
            fontWeight: 600,
            lineHeight: 1.25,
            color: '#ffffff',
            background: 'rgba(0,0,0,0.55)',
            padding: '18px 30px',
            borderRadius: 18,
            textAlign: 'center',
            maxWidth: 900,
          }}
        >
          {c.text}
        </div>
      ))}
  </AbsoluteFill>
);
