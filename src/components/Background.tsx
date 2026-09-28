import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../theme';
import { useTime } from '../hooks';
import { seededArray } from '../rng';

const GLOWS = seededArray(7, 3, (rand, i) => ({
  x: 15 + rand() * 70,
  y: 15 + rand() * 70,
  r: 26 + rand() * 16,
  hue: i === 1 ? COLORS.warm : COLORS.primary,
  phase: rand() * Math.PI * 2,
}));

export const Background: React.FC = () => {
  const { t } = useTime();
  return (
    <AbsoluteFill style={{ background: COLORS.bgDeep, overflow: 'hidden' }}>
      <AbsoluteFill style={{ background: `radial-gradient(110% 90% at 50% 30%, ${COLORS.bg} 0%, ${COLORS.bgDeep} 70%)` }} />
      {GLOWS.map((g, i) => {
        const drift = Math.sin(t * 0.25 + g.phase) * 5;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${g.x + drift}%`,
              top: `${g.y - drift * 0.6}%`,
              width: `${g.r}vw`,
              height: `${g.r}vw`,
              borderRadius: '50%',
              background: g.hue,
              opacity: 0.08,
              filter: 'blur(90px)',
              transform: 'translate(-50%,-50%)',
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

// Top-most finishing layer: vignette + animated film grain.
export const FinishingLayer: React.FC = () => {
  const { frame } = useTime();
  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(85% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)' }} />
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06, mixBlendMode: 'overlay' }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 300} stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};
