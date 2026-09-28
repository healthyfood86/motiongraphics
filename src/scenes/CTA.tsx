import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { springAt, prog, kickPulse, EASE_IN_OUT, EASE_OUT_EXPO } from '../hooks';
import { BRAND, COLORS, FONT_STACK, GRADIENT_TEXT, PHOTOS } from '../theme';
import { Photo } from '../components/Photo';
import { BrandLockup } from '../components/BrandLockup';
import { ParticleField } from '../components/ParticleField';
import { PhoneIcon, GlobeIcon, ArrowIcon } from '../icons/Icons';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const B = beatmap.beatSec;
const CLICK_T = C.ctaPulses[2];

const PhoneCard: React.FC<{ t: number; at: number; fps: number; country: string; phone: string; name: string }> = ({ t, at, fps, country, phone, name }) => {
  const s = springAt(t, at, fps, { damping: 13, stiffness: 200 });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        padding: '18px 34px 18px 20px',
        borderRadius: 24,
        background: 'rgba(27,24,20,0.78)',
        border: `1px solid ${COLORS.line}`,
        boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        opacity: Math.min(1, s * 1.4),
        transform: `translateY(${(1 - s) * 60}px) scale(${interpolate(s, [0, 1], [0.8, 1])})`,
      }}
    >
      <div style={{ width: 70, height: 70, borderRadius: 35, background: 'rgba(217,164,91,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <PhoneIcon size={34} color={COLORS.primary} draw={prog(t, at, at + 0.5, EASE_OUT_EXPO)} />
      </div>
      <div>
        <div style={{ fontFamily: FONT_STACK, fontWeight: 700, fontSize: 18, letterSpacing: 4, textTransform: 'uppercase', color: COLORS.primary }}>{country}</div>
        <div style={{ fontFamily: FONT_STACK, fontWeight: 800, fontSize: 40, color: COLORS.white, lineHeight: 1.15 }}>{phone}</div>
        <div style={{ fontFamily: FONT_STACK, fontWeight: 600, fontSize: 23, color: COLORS.dim }}>{name}</div>
      </div>
    </div>
  );
};

const Cursor: React.FC<{ t: number }> = ({ t }) => {
  const a = C.ctaPulses[1] + B * 2;
  if (t < a) return null;
  const move = prog(t, a, CLICK_T - 0.04, EASE_IN_OUT);
  const x = interpolate(move, [0, 1], [1560, 1090]);
  const y = interpolate(move, [0, 1], [1040, 672]);
  const press = Math.exp(-Math.max(0, t - CLICK_T) / 0.08) * (t >= CLICK_T ? 1 : 0);
  const fadeOut = prog(t, CLICK_T + 0.6, CLICK_T + 0.9);
  return (
    <svg
      width={56}
      height={56}
      viewBox="0 0 24 24"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${1 - press * 0.18})`,
        opacity: prog(t, a, a + 0.15) * (1 - fadeOut),
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.5))',
      }}
    >
      <path d="M4 2 L4 19 L8.5 15 L11.5 21.5 L14.5 20 L11.5 13.8 L17.5 13.5 Z" fill={COLORS.white} stroke={COLORS.bgDeep} strokeWidth={1.2} strokeLinejoin="round" />
    </svg>
  );
};

export const CTA: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const t0 = C.cta;
  const pulse = kickPulse(t, beatmap.kicks, 0.12);
  const lead = springAt(t, t0, fps, { damping: 14, stiffness: 200 });
  const big = springAt(t, t0, fps, { damping: 10, stiffness: 150, mass: 0.9 });
  const tail = springAt(t, t0 + B * 2, fps, { damping: 16, stiffness: 170 });
  const btn = springAt(t, t0 + B * 3, fps, { damping: 10, stiffness: 200, mass: 0.7 });
  const click = t >= CLICK_T ? Math.exp(-(t - CLICK_T) / 0.1) : 0;
  const ripple = prog(t, CLICK_T, CLICK_T + 0.6, EASE_OUT_EXPO);
  const resolve = springAt(t, C.resolve, fps, { damping: 8, stiffness: 260, mass: 0.5 });
  const resolveBump = t >= C.resolve ? (1 - resolve) * 0.03 : 0;

  // shine sweep across the button on each CTA bar
  const shineStarts = [...C.ctaPulses, C.resolve].map((x) => x + 0.35);
  let shine = -1;
  for (const s of shineStarts) if (t >= s && t < s + 0.7) shine = (t - s) / 0.7;

  return (
    <AbsoluteFill>
      <Photo src={PHOTOS.ctaBg} t={t} t0={t0} dur={C.end - t0} kb={{ s0: 1.3, s1: 1.12 }} style={{ filter: 'blur(18px) brightness(0.26) saturate(0.85)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(55% 55% at 50% 50%, rgba(217,164,91,0.16), rgba(0,0,0,0) 70%)' }} />
      <ParticleField mode="ambient" opacity={2.5} />

      <AbsoluteFill style={{ alignItems: 'center', paddingTop: 96, transform: `scale(${1 + resolveBump})` }}>
        <BrandLockup t={t} t0={t0 + 0.12} fps={fps} size={40} descriptor={false} />

        <div
          style={{
            marginTop: 56,
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: 58,
            color: COLORS.accent,
            opacity: lead,
            transform: `translateY(${(1 - lead) * -40}px)`,
          }}
        >
          {BRAND.cta.lead}
        </div>
        <div
          style={{
            fontFamily: FONT_STACK,
            fontWeight: 800,
            fontSize: 200,
            lineHeight: 1,
            letterSpacing: `${interpolate(big, [0, 1], [0.14, -0.01])}em`,
            background: GRADIENT_TEXT,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            transform: `scale(${interpolate(big, [0, 1], [1.5, 1]) + pulse * 0.012})`,
            opacity: Math.min(1, big * 2),
            filter: `drop-shadow(0 12px 50px rgba(217,164,91,${0.25 + pulse * 0.2}))`,
            whiteSpace: 'nowrap',
          }}
        >
          {BRAND.cta.big}
        </div>
        <div
          style={{
            marginTop: 22,
            fontFamily: FONT_STACK,
            fontWeight: 500,
            fontSize: 32,
            color: COLORS.dim,
            opacity: tail,
            transform: `translateY(${(1 - tail) * 24}px)`,
          }}
        >
          {BRAND.cta.tail}
        </div>

        <div style={{ position: 'relative', marginTop: 40 }}>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 560 + ripple * 260,
              height: 116 + ripple * 120,
              borderRadius: 999,
              border: `3px solid ${COLORS.primary}`,
              transform: 'translate(-50%,-50%)',
              opacity: t >= CLICK_T ? 1 - ripple : 0,
            }}
          />
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              padding: '0 56px',
              height: 116,
              borderRadius: 999,
              background: `linear-gradient(180deg, #E8B872, ${COLORS.primaryDeep})`,
              boxShadow: `0 20px 60px rgba(217,164,91,${0.3 + pulse * 0.35}), inset 0 1px 0 rgba(255,255,255,0.4)`,
              transform: `scale(${btn * (1 + pulse * 0.035 - click * 0.07)})`,
              opacity: Math.min(1, btn * 2),
            }}
          >
            <span style={{ fontFamily: FONT_STACK, fontWeight: 800, fontSize: 44, color: COLORS.bgDeep }}>{BRAND.cta.button}</span>
            <ArrowIcon size={44} color={COLORS.bgDeep} strokeWidth={3.4} draw={prog(t, t0 + B * 3.3, t0 + B * 4.5, EASE_OUT_EXPO)} />
            {shine >= 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  bottom: 0,
                  left: `${-30 + shine * 140}%`,
                  width: '22%',
                  background: 'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.55), rgba(255,255,255,0))',
                  transform: 'skewX(-20deg)',
                }}
              />
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 30, marginTop: 44 }}>
          {BRAND.contacts.map((c, i) => (
            <PhoneCard key={c.phone} t={t} at={C.ctaPulses[1] + i * B} fps={fps} country={c.country} phone={c.phone} name={c.name} />
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            marginTop: 26,
            fontFamily: FONT_STACK,
            fontWeight: 700,
            fontSize: 26,
            color: COLORS.accent,
            opacity: springAt(t, C.ctaPulses[1] + B * 2, fps, { damping: 16, stiffness: 170 }),
          }}
        >
          <GlobeIcon size={26} color={COLORS.primary} draw={prog(t, C.ctaPulses[1] + B * 2, C.ctaPulses[1] + B * 3, EASE_OUT_EXPO)} />
          {BRAND.domain}
        </div>
      </AbsoluteFill>

      <Cursor t={t} />
    </AbsoluteFill>
  );
};
