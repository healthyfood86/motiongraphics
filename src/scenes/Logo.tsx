import React from 'react';
import { AbsoluteFill } from 'remotion';
import { springAt, prog, EASE_IN_OUT } from '../hooks';
import { BRAND, COLORS, FONT_STACK } from '../theme';
import { BrandLockup } from '../components/BrandLockup';
import { KineticLine } from '../components/KineticTitle';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const B = beatmap.beatSec;

export const Logo: React.FC<{ t: number; fps: number; frame: number }> = ({ t, fps, frame }) => {
  const t0 = C.logo;
  const exit = prog(t, C.portfolio[0] - B, C.portfolio[0], EASE_IN_OUT);
  const regions = springAt(t, t0 + B * 4, fps, { damping: 15, stiffness: 160 });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 1 - exit,
        transform: `scale(${1 + exit * 0.12})`,
        filter: `blur(${exit * 14}px)`,
      }}
    >
      <div style={{ transform: 'translateY(-60px)' }}>
        <BrandLockup t={t} t0={t0} fps={fps} size={112} />
      </div>
      <div style={{ position: 'absolute', top: '63%', width: 1400 }}>
        <KineticLine frame={frame} startFrame={Math.round((t0 + B * 2) * fps)} text={BRAND.statement} fontSize={44} wordStagger={3} />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '74%',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: FONT_STACK,
          fontWeight: 700,
          fontSize: 26,
          letterSpacing: 6,
          textTransform: 'uppercase',
          color: COLORS.primary,
          opacity: regions,
          transform: `translateY(${(1 - regions) * 24}px)`,
        }}
      >
        <span>{BRAND.regions[0]}</span>
        <span style={{ width: 8, height: 8, borderRadius: 4, background: COLORS.primary, transform: `scale(${regions})` }} />
        <span>{BRAND.regions[1]}</span>
      </div>
    </AbsoluteFill>
  );
};
