import React from 'react';
import { useVideoConfig, interpolate } from 'remotion';
import { popIn } from '../hooks';
import { COLORS, FONT_STACK, GRADIENT_TEXT } from '../theme';

export const KineticLine: React.FC<{
  frame: number;
  startFrame: number;
  text: string;
  fontSize: number;
  gradient?: boolean;
  wordStagger?: number;
  align?: 'center' | 'left';
}> = ({ frame, startFrame, text, fontSize, gradient = false, wordStagger = 4, align = 'center' }) => {
  const { fps } = useVideoConfig();
  const words = text.split(' ');

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: align === 'center' ? 'center' : 'flex-start',
        gap: '0 0.32em',
        fontFamily: FONT_STACK,
        fontWeight: 800,
        fontSize,
        lineHeight: 1.05,
        letterSpacing: -1.5,
      }}
    >
      {words.map((w, i) => {
        const delay = startFrame + i * wordStagger;
        const p = popIn(frame, fps, delay, { damping: 13, mass: 0.7, stiffness: 210 });
        const rise = interpolate(p, [0, 1], [46, 0]);
        const blur = interpolate(p, [0, 1], [8, 0]);
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              opacity: p,
              transform: `translateY(${rise}px)`,
              filter: `blur(${blur}px)`,
              color: gradient ? undefined : COLORS.white,
              background: gradient ? GRADIENT_TEXT : undefined,
              WebkitBackgroundClip: gradient ? 'text' : undefined,
              backgroundClip: gradient ? 'text' : undefined,
              WebkitTextFillColor: gradient ? 'transparent' : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};
