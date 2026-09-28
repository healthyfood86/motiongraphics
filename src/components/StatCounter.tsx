import React from 'react';
import { useVideoConfig, interpolate } from 'remotion';
import { popIn, clamp01, EASE_OUT_EXPO } from '../hooks';
import { useTime } from '../hooks';
import { COLORS, FONT_STACK, BRAND } from '../theme';

const StatItem: React.FC<{ value: number; suffix: string; label: string; delay: number }> = ({ value, suffix, label, delay }) => {
  const { fps } = useVideoConfig();
  const { frame } = useTime();
  const p = popIn(frame, fps, delay, { damping: 14, mass: 0.7, stiffness: 160 });
  const countProgress = clamp01(interpolate(frame, [delay, delay + fps * 0.9], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT_EXPO,
  }));
  const shown = Math.round(value * countProgress);
  const rise = interpolate(p, [0, 1], [30, 0]);

  return (
    <div style={{ opacity: p, transform: `translateY(${rise}px)`, textAlign: 'center', width: 260 }}>
      <div
        style={{
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 58,
          background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`,
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {shown.toLocaleString()}
        {suffix}
      </div>
      <div style={{ fontFamily: FONT_STACK, fontSize: 19, color: COLORS.dim, marginTop: 6, fontWeight: 600 }}>{label}</div>
    </div>
  );
};

export const StatBlock: React.FC<{ startFrame: number; stagger?: number }> = ({ startFrame, stagger = 10 }) => (
  <div style={{ display: 'flex', gap: 56 }}>
    {BRAND.stats.map((s, i) => (
      <StatItem key={s.label} value={s.value} suffix={s.suffix} label={s.label} delay={startFrame + i * stagger} />
    ))}
  </div>
);
