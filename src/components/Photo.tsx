import React from 'react';
import { AbsoluteFill, Img, staticFile, interpolate, Easing } from 'remotion';

export type KenBurns = { s0?: number; s1?: number; x0?: number; x1?: number; y0?: number; y1?: number };

// A full-bleed photo with a slow Ken Burns drift between t0 and t0+dur.
// `bump` adds a tiny extra zoom (used to make photos breathe on kick drums).
export const Photo: React.FC<{
  src: string;
  t: number;
  t0: number;
  dur: number;
  kb?: KenBurns;
  bump?: number;
  pos?: string;
  style?: React.CSSProperties;
}> = ({ src, t, t0, dur, kb = {} as KenBurns, bump = 0, pos = '50% 50%', style }) => {
  const p = interpolate(t, [t0, t0 + dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(0.33, 0, 0.67, 1),
  });
  const { s0 = 1.08, s1 = 1.18, x0 = 0, x1 = 0, y0 = 0, y1 = 0 } = kb;
  const s = s0 + (s1 - s0) * p + bump * 0.02;
  const x = x0 + (x1 - x0) * p;
  const y = y0 + (y1 - y0) * p;
  return (
    <AbsoluteFill style={{ overflow: 'hidden', ...style }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: pos,
          transform: `translate(${x}%, ${y}%) scale(${s})`,
        }}
      />
    </AbsoluteFill>
  );
};
