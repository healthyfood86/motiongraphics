import React from 'react';
import { useVideoConfig, interpolate } from 'remotion';
import { popIn, useTime } from '../hooks';
import { COLORS, FONT_STACK, BRAND } from '../theme';
import { LogoMark } from './LogoMark';

export const EndCard: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const { fps } = useVideoConfig();
  const { frame } = useTime();
  const p = popIn(frame, fps, startFrame, { damping: 9, mass: 0.8, stiffness: 190 });
  const scale = interpolate(p, [0, 1], [0.55, 1]);
  const urlP = popIn(frame, fps, startFrame + 10, { damping: 14, stiffness: 200 });
  const tagP = popIn(frame, fps, startFrame + 6, { damping: 14, stiffness: 200 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, transform: `scale(${scale})`, opacity: p }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <LogoMark size={110} scale={1} glowAmount={1.3} glyphProgress={1} />
        <div style={{ fontFamily: FONT_STACK, fontWeight: 800, fontSize: 68, color: COLORS.white, letterSpacing: -1.5 }}>{BRAND.name}</div>
      </div>
      <div
        style={{
          opacity: tagP,
          transform: `translateY(${interpolate(tagP, [0, 1], [16, 0])}px)`,
          fontFamily: FONT_STACK,
          fontWeight: 600,
          fontSize: 22,
          color: COLORS.dim,
          letterSpacing: 0.5,
        }}
      >
        {BRAND.subline}
      </div>
      <div
        style={{
          opacity: urlP,
          transform: `translateY(${interpolate(urlP, [0, 1], [16, 0])}px)`,
          fontFamily: FONT_STACK,
          fontWeight: 700,
          fontSize: 26,
          padding: '10px 26px',
          borderRadius: 999,
          background: `linear-gradient(90deg, ${COLORS.primary}22, ${COLORS.accent}22)`,
          border: `1px solid ${COLORS.primary}55`,
          color: COLORS.white,
        }}
      >
        {BRAND.domain}
      </div>
    </div>
  );
};
