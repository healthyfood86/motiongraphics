import React from 'react';
import { useVideoConfig, interpolate } from 'remotion';
import { popIn, useTime } from '../hooks';
import { COLORS, FONT_STACK, BRAND } from '../theme';
import { FEATURE_ICON_MAP } from '../icons/FeatureIcons';

export const FeatureRow: React.FC<{ startFrame: number; stagger?: number }> = ({ startFrame, stagger = 9 }) => {
  const { fps } = useVideoConfig();
  const { frame, t } = useTime();

  return (
    <div style={{ display: 'flex', gap: 28 }}>
      {BRAND.features.map((f, i) => {
        const delay = startFrame + i * stagger;
        const p = popIn(frame, fps, delay, { damping: 10, mass: 0.65, stiffness: 220 });
        const scale = interpolate(p, [0, 1], [0.4, 1]);
        const rise = interpolate(p, [0, 1], [50, 0]);
        const rot = interpolate(p, [0, 1], [-14, 0]);
        const float = Math.sin(t * 1.6 + i) * 4;
        const Icon = FEATURE_ICON_MAP[f.key];
        return (
          <div
            key={f.key}
            style={{
              opacity: p,
              transform: `translateY(${rise + float}px) rotate(${rot}deg) scale(${scale})`,
              width: 210,
              padding: '26px 20px',
              borderRadius: 20,
              background: 'rgba(255,255,255,0.045)',
              border: `1px solid ${COLORS.line}`,
              backdropFilter: 'blur(6px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background: `linear-gradient(135deg, ${COLORS.primary}33, ${COLORS.accent}33)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon size={30} color={COLORS.white} />
            </div>
            <div
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 700,
                fontSize: 18,
                color: COLORS.white,
                textAlign: 'center',
                lineHeight: 1.25,
              }}
            >
              {f.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
