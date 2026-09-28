import React from 'react';
import { AbsoluteFill } from 'remotion';
import { springAt, prog, kickPulse, EASE_OUT_EXPO, EASE_IN_OUT } from '../hooks';
import { BRAND, COLORS, FONT_STACK, SERIF, PHOTOS } from '../theme';
import { Photo } from '../components/Photo';
import { StripReveal, IrisReveal, DiagonalReveal } from '../components/Reveals';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const B = beatmap.beatSec;
const BAR = beatmap.barSec;

const LabelChip: React.FC<{ t: number; t0: number; fps: number; index: number; label: string; sub: string }> = ({ t, t0, fps, index, label, sub }) => {
  const a = springAt(t, t0, fps, { damping: 15, stiffness: 180 });
  const b = springAt(t, t0 + 0.08, fps, { damping: 15, stiffness: 180 });
  const c = springAt(t, t0 + 0.16, fps, { damping: 15, stiffness: 180 });
  const line = prog(t, t0 + 0.05, t0 + 0.6, EASE_OUT_EXPO);
  const out = prog(t, t0 + BAR - 0.55, t0 + BAR - 0.3, EASE_IN_OUT);
  return (
    <div style={{ position: 'absolute', left: 110, bottom: 110, opacity: 1 - out, transform: `translateX(${-out * 40}px)` }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 26 }}>
        <div
          style={{
            fontFamily: SERIF,
            fontStyle: 'italic',
            fontSize: 120,
            lineHeight: 0.8,
            color: COLORS.primary,
            transform: `translateY(${(1 - a) * 60}px)`,
            opacity: a,
          }}
        >
          0{index + 1}
        </div>
        <div style={{ paddingBottom: 6 }}>
          <div style={{ overflow: 'hidden' }}>
            <div
              style={{
                fontFamily: FONT_STACK,
                fontWeight: 800,
                fontSize: 64,
                color: COLORS.white,
                letterSpacing: -1,
                transform: `translateY(${(1 - b) * 110}%)`,
                textShadow: '0 4px 30px rgba(0,0,0,0.5)',
              }}
            >
              {label}
            </div>
          </div>
          <div style={{ height: 2, width: 420 * line, background: COLORS.primary, margin: '10px 0 12px' }} />
          <div
            style={{
              fontFamily: FONT_STACK,
              fontWeight: 600,
              fontSize: 24,
              color: COLORS.accent,
              opacity: c,
              transform: `translateY(${(1 - c) * 16}px)`,
            }}
          >
            {sub}
          </div>
        </div>
      </div>
    </div>
  );
};

const REVEALS = [StripReveal, IrisReveal, DiagonalReveal];
const KB = [
  { s0: 1.02, s1: 1.1, x0: 1.5, x1: -1.5 },
  { s0: 1.1, s1: 1.02, y0: -1, y1: 1 },
  { s0: 1.02, s1: 1.1, x0: -1.5, x1: 1 },
];

// Four tall panels, one specialty per beat of the bar, dropping into outlined slots.
const Specialties: React.FC<{ t: number; fps: number; bump: number }> = ({ t, fps, bump }) => {
  const t0 = C.portfolio[3];
  const exit = prog(t, C.pillars - 0.35, C.pillars + 0.15, EASE_IN_OUT);
  const gap = 18;
  const top = 150;
  const n = PHOTOS.specialties.length;
  const w = (1920 - gap * (n + 1)) / n;
  const title = springAt(t, t0, fps, { damping: 16, stiffness: 180 });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: COLORS.bgDeep, opacity: prog(t, t0, t0 + 0.25) * (1 - exit) }} />
      <div
        style={{
          position: 'absolute',
          top: 62,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT_STACK,
          fontWeight: 700,
          fontSize: 34,
          letterSpacing: 12,
          textTransform: 'uppercase',
          color: COLORS.primary,
          opacity: title * (1 - exit),
          transform: `translateY(${(1 - title) * -30}px)`,
        }}
      >
        {BRAND.specialtiesTitle}
      </div>
      {PHOTOS.specialties.map((sp, i) => {
        const at = t0 + i * B * 0.5; // on the 8th-note hats, so all four hold together before the exit
        const s = springAt(t, at, fps, { damping: 15, stiffness: 190, mass: 0.7 });
        const lab = springAt(t, at + 0.07, fps, { damping: 13, stiffness: 210 });
        const dir = i % 2 ? -1 : 1;
        const slot = prog(t, t0 + i * 0.04, t0 + 0.3 + i * 0.04, EASE_OUT_EXPO);
        const box: React.CSSProperties = { position: 'absolute', top, bottom: gap, left: gap + i * (w + gap), width: w, borderRadius: 18 };
        return (
          <React.Fragment key={sp.label}>
            <div style={{ ...box, border: `1px solid ${COLORS.line}`, opacity: slot * (1 - exit), transform: `scaleY(${slot})` }} />
            {t >= at && (
              <div style={{ ...box, overflow: 'hidden', transform: `translateY(${(1 - s) * dir * 110 + exit * -dir * 130}%)` }}>
                <Photo src={sp.src} pos={sp.pos} t={t} t0={at} dur={BAR} kb={{ s0: 1.18, s1: 1.06, y0: dir * 2, y1: 0 }} bump={bump} />
                <AbsoluteFill style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(10,9,8,0.8) 100%)' }} />
                <div
                  style={{
                    position: 'absolute',
                    left: 34,
                    right: 20,
                    bottom: 44,
                    opacity: lab,
                    transform: `translateY(${(1 - lab) * 50}px)`,
                  }}
                >
                  <div style={{ fontFamily: SERIF, fontStyle: 'italic', fontSize: 40, color: COLORS.primary, lineHeight: 1 }}>0{i + 1}</div>
                  <div style={{ height: 2, width: 60 * lab, background: COLORS.primary, margin: '14px 0 16px' }} />
                  <div style={{ fontFamily: FONT_STACK, fontWeight: 800, fontSize: 46, color: COLORS.white, letterSpacing: -0.5, whiteSpace: 'nowrap' }}>{sp.label}</div>
                </div>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

export const Portfolio: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const bump = kickPulse(t, beatmap.kicks, 0.1);
  return (
    <AbsoluteFill>
      {PHOTOS.portfolio.map((p, i) => {
        const t0 = C.portfolio[i];
        const next = C.portfolio[i + 1];
        if (t < t0 || t > next + 0.6) return null;
        const Reveal = REVEALS[i];
        return (
          <AbsoluteFill key={i}>
            <Reveal src={p.src} t={t} t0={t0} dur={BAR + 0.6} fps={fps} kb={KB[i]} bump={bump} />
            <AbsoluteFill style={{ background: 'linear-gradient(90deg, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0) 55%), linear-gradient(0deg, rgba(10,9,8,0.6) 0%, rgba(10,9,8,0) 45%)' }} />
            <LabelChip t={t} t0={t0 + 0.12} fps={fps} index={i} label={p.label} sub={p.sub} />
          </AbsoluteFill>
        );
      })}
      {t >= C.portfolio[3] && <Specialties t={t} fps={fps} bump={bump} />}
    </AbsoluteFill>
  );
};
