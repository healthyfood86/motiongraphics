import React from 'react';
import { useVideoConfig } from 'remotion';
import { popIn, EASE_OUT_EXPO } from '../hooks';
import { interpolate } from 'remotion';
import { COLORS, FONT_STACK, BRAND } from '../theme';

export const Wordmark: React.FC<{ frame: number; startFrame: number; fontSize: number; stagger?: number }> = ({
  frame,
  startFrame,
  fontSize,
  stagger = 2.2,
}) => {
  const { fps } = useVideoConfig();
  const letters = BRAND.name.split('');

  return (
    <div style={{ display: 'flex', fontFamily: FONT_STACK, fontWeight: 800, fontSize, letterSpacing: -1 }}>
      {letters.map((ch, i) => {
        const delay = startFrame + i * stagger;
        const p = popIn(frame, fps, delay, { damping: 12, mass: 0.6, stiffness: 200 });
        const rise = interpolate(p, [0, 1], [26, 0]);
        const rot = interpolate(p, [0, 1], [10, 0]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              color: COLORS.white,
              opacity: p,
              transform: `translateY(${rise}px) rotate(${rot}deg)`,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};
