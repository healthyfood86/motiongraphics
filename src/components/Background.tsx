import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../theme';
import { useTime } from '../hooks';
import { seededArray } from '../rng';

const GLOWS = seededArray(7, 4, (rand, i) => ({
  x: 10 + rand() * 80,
  y: 10 + rand() * 80,
  r: 22 + rand() * 18,
  hue: i % 2 === 0 ? COLORS.primary : COLORS.accent,
  speed: 0.02 + rand() * 0.02,
  phase: rand() * Math.PI * 2,
}));

const GRID_LINES_V = 14;
const GRID_LINES_H = 8;

export const Background: React.FC<{ energy?: number }> = ({ energy = 0 }) => {
  const { t } = useTime();

  return (
    <AbsoluteFill style={{ background: COLORS.bgDeep, overflow: 'hidden' }}>
      {/* deep radial base */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 90% at 50% 20%, ${COLORS.bg} 0%, ${COLORS.bgDeep} 65%, #000000 100%)`,
        }}
      />

      {/* drifting color glows */}
      {GLOWS.map((g, i) => {
        const drift = Math.sin(t * g.speed * 6 + g.phase) * 6;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${g.x + drift}%`,
              top: `${g.y + drift * 0.6}%`,
              width: `${g.r}vw`,
              height: `${g.r}vw`,
              borderRadius: '50%',
              background: g.hue,
              opacity: 0.07 + energy * 0.05,
              filter: 'blur(70px)',
              transform: 'translate(-50%,-50%)',
            }}
          />
        );
      })}

      {/* perspective grid floor, slow parallax drift */}
      <AbsoluteFill style={{ perspective: 700 }}>
        <div
          style={{
            position: 'absolute',
            left: '-20%',
            right: '-20%',
            bottom: '-10%',
            height: '60%',
            transform: `rotateX(72deg) translateY(${(t * 26) % 60}px)`,
            backgroundImage: `linear-gradient(${COLORS.line} 1px, transparent 1px), linear-gradient(90deg, ${COLORS.line} 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
            opacity: 0.5,
          }}
        />
      </AbsoluteFill>

      {/* vignette */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(80% 70% at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)',
        }}
      />

      <FilmGrain />
    </AbsoluteFill>
  );
};

const FilmGrain: React.FC = () => {
  const { frame } = useTime();
  return (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05, mixBlendMode: 'overlay' }}>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={frame % 300} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
  );
};
