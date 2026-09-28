import React from 'react';
import { interpolate } from 'remotion';
import { springAt } from '../hooks';
import { BRAND, COLORS, FONT_STACK, SERIF } from '../theme';

const Letters: React.FC<{ text: string; t: number; t0: number; fps: number; stagger: number; size: number }> = ({
  text,
  t,
  t0,
  fps,
  stagger,
  size,
}) => (
  <span style={{ display: 'inline-flex', overflow: 'hidden', padding: '0.08em 0' }}>
    {text.split('').map((ch, i) => {
      const s = springAt(t, t0 + i * stagger, fps, { damping: 14, stiffness: 190, mass: 0.6 });
      return (
        <span
          key={i}
          style={{
            display: 'inline-block',
            fontFamily: FONT_STACK,
            fontWeight: 800,
            fontSize: size,
            letterSpacing: size * 0.14,
            color: COLORS.white,
            transform: `translateY(${(1 - s) * 105}%) rotate(${(1 - s) * 8}deg)`,
            opacity: Math.min(1, s * 1.5),
          }}
        >
          {ch}
        </span>
      );
    })}
  </span>
);

// Typographic lockup: EDEN & DESIGN, the ampersand landing last as the accent.
export const BrandLockup: React.FC<{ t: number; t0: number; fps: number; size: number; descriptor?: boolean; instant?: boolean }> = ({
  t,
  t0,
  fps,
  size,
  descriptor = true,
  instant = false,
}) => {
  const tt = instant ? t0 + 10 : t;
  const stagger = 0.03;
  const ampT = t0 + 0.2;
  const amp = springAt(tt, ampT, fps, { damping: 9, stiffness: 160, mass: 0.8 });
  const line = interpolate(tt, [t0 + 0.3, t0 + 0.9], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const desc = springAt(tt, t0 + 0.5, fps, { damping: 16, stiffness: 150 });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: size * 0.28 }}>
        <Letters text={BRAND.nameA.toUpperCase()} t={tt} t0={t0} fps={fps} stagger={stagger} size={size} />
        <span
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontWeight: 400,
            fontSize: size * 1.45,
            lineHeight: 1,
            color: COLORS.primary,
            transform: `scale(${amp}) rotate(${(1 - amp) * -40}deg)`,
            opacity: Math.min(1, amp * 2),
            textShadow: `0 0 ${size * 0.5}px rgba(217,164,91,${0.45 * amp})`,
            marginTop: -size * 0.12,
          }}
        >
          &amp;
        </span>
        <Letters text={BRAND.nameB.toUpperCase()} t={tt} t0={t0 + 0.08} fps={fps} stagger={stagger} size={size} />
      </div>
      {descriptor && (
        <>
          <div
            style={{
              marginTop: size * 0.3,
              height: 2,
              width: size * 9 * line,
              background: `linear-gradient(90deg, transparent, ${COLORS.primary}, transparent)`,
            }}
          />
          <div
            style={{
              marginTop: size * 0.28,
              fontFamily: FONT_STACK,
              fontWeight: 700,
              fontSize: size * 0.24,
              letterSpacing: size * 0.09,
              color: COLORS.dim,
              textTransform: 'uppercase',
              opacity: desc,
              transform: `translateY(${(1 - desc) * 20}px)`,
            }}
          >
            {BRAND.descriptor}
          </div>
        </>
      )}
    </div>
  );
};
