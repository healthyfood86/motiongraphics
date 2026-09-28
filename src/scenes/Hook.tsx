import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { springAt, prog, EASE_IN_OUT, EASE_OUT_EXPO } from '../hooks';
import { BRAND, COLORS, FONT_STACK, PHOTOS } from '../theme';
import { Photo } from '../components/Photo';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const B = beatmap.beatSec;

const Word: React.FC<{ text: string; t: number; t0: number; t1: number; fps: number; x: string; align: 'left' | 'right' }> = ({
  text,
  t,
  t0,
  t1,
  fps,
  x,
  align,
}) => {
  if (t < t0 || t > t1 + 0.3) return null;
  const s = springAt(t, t0, fps, { damping: 13, stiffness: 210, mass: 0.6 });
  const out = prog(t, t1, t1 + 0.25, EASE_IN_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        [align]: x,
        transform: `translateY(-50%) translateX(${(1 - s) * (align === 'left' ? -60 : 60) + out * (align === 'left' ? -40 : 40)}px)`,
        fontFamily: FONT_STACK,
        fontWeight: 800,
        fontSize: 118,
        letterSpacing: -2,
        color: COLORS.white,
        opacity: Math.min(1, s * 1.4) * (1 - out),
        filter: `blur(${out * 12}px)`,
        whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

// Vertical photo sliver that slides in, then widens toward full-frame as the riser builds.
const Sliver: React.FC<{ src: string; t: number; t0: number; fps: number; left: number; fromTop: boolean }> = ({ src, t, t0, fps, left, fromTop }) => {
  if (t < t0) return null;
  const s = springAt(t, t0, fps, { damping: 16, stiffness: 150 });
  const grow = prog(t, B * 3, C.heroImpact, (x) => x * x * x);
  const w = 20 + grow * 14;
  const l = left - grow * 7;
  return (
    <AbsoluteFill
      style={{
        clipPath: `inset(0 ${100 - l - w}% 0 ${l}%)`,
        transform: `translateY(${(1 - s) * (fromTop ? -100 : 100)}%)`,
      }}
    >
      <Photo src={src} t={t} t0={t0} dur={2} kb={{ s0: 1.25, s1: 1.1, y0: fromTop ? -3 : 3, y1: 0 }} style={{ filter: 'brightness(0.85)' }} />
    </AbsoluteFill>
  );
};

export const Hook: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const hit = C.heroImpact;
  const heroIn = springAt(t, hit, fps, { damping: 15, stiffness: 120, mass: 1 });
  const settle = springAt(t, C.heroSettle, fps, { damping: 7, stiffness: 300, mass: 0.4 });
  const settleBump = (1 - settle) * 0.04;

  // "Within budget." letters fly in from wide tracking and lock on the hit
  const tracking = interpolate(heroIn, [0, 1], [0.22, -0.02]);
  const bigScale = interpolate(heroIn, [0, 1], [1.25, 1]) + settleBump;
  // hand-off to the logo scene: hero darkens + blurs, headline lifts away
  const out = prog(t, C.logo - B, C.logo + 0.2, EASE_OUT_EXPO);

  return (
    <AbsoluteFill>
      <Sliver src={PHOTOS.hookSlivers[0]} t={t} t0={0} fps={fps} left={14} fromTop={false} />
      <Sliver src={PHOTOS.hookSlivers[1]} t={t} t0={B * 2} fps={fps} left={66} fromTop />
      <Word text={BRAND.hook[0]} t={t} t0={0.02} t1={B * 2 - 0.27} fps={fps} x="40%" align="left" />
      <Word text={BRAND.hook[1]} t={t} t0={B * 2 + 0.02} t1={hit - 0.1} fps={fps} x="38%" align="right" />

      {t >= hit && (
        <AbsoluteFill>
          <AbsoluteFill style={{ transform: `scale(${interpolate(heroIn, [0, 1], [1.35, 1])})` }}>
            <Photo
              src={PHOTOS.hero}
              t={t}
              t0={hit}
              dur={C.logo + 3.75 - hit}
              kb={{ s0: 1.04, s1: 1.16, x0: 0, x1: -2 }}
              style={{ filter: `brightness(${1 - out * 0.62}) blur(${out * 10}px)` }}
            />
          </AbsoluteFill>
          <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(10,9,8,0.1) 0%, rgba(10,9,8,0.55) 100%)' }} />
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', opacity: 1 - out }}>
            <div
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 800,
                fontSize: 150,
                letterSpacing: `${tracking}em`,
                color: COLORS.white,
                transform: `scale(${bigScale}) translateY(${out * -80}px)`,
                textShadow: '0 10px 60px rgba(0,0,0,0.55)',
                whiteSpace: 'nowrap',
              }}
            >
              {BRAND.hook[2]}
            </div>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
