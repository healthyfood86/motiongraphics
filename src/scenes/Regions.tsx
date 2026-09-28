import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { springAt, prog, kickPulse, EASE_OUT_EXPO, EASE_IN_OUT } from '../hooks';
import { BRAND, COLORS, FONT_STACK, PHOTOS } from '../theme';
import { Photo } from '../components/Photo';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const B = beatmap.beatSec;

// Johor Bahru sits just north of Singapore across the Straits, so JB is drawn
// above SG — abstract, but not geographically wrong.
const PIN_X = 1060;
const JB = { x: PIN_X, y: 420 };
const SG = { x: PIN_X, y: 760 };
const ARC = `M ${SG.x} ${SG.y} C ${SG.x + 260} ${SG.y - 60}, ${JB.x + 260} ${JB.y + 60}, ${JB.x} ${JB.y}`;

function bezier(p: number) {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = [SG.x, SG.y, SG.x + 260, SG.y - 60, JB.x + 260, JB.y + 60, JB.x, JB.y];
  const u = 1 - p;
  return {
    x: u * u * u * x0 + 3 * u * u * p * x1 + 3 * u * p * p * x2 + p * p * p * x3,
    y: u * u * u * y0 + 3 * u * u * p * y1 + 3 * u * p * p * y2 + p * p * p * y3,
  };
}

const Pin: React.FC<{ t: number; at: number; fps: number; x: number; y: number; label: string; pulse: number }> = ({ t, at, fps, x, y, label, pulse }) => {
  const drop = springAt(t, at, fps, { damping: 9, stiffness: 220, mass: 0.7 });
  const lab = springAt(t, at + 0.06, fps, { damping: 15, stiffness: 180 });
  return (
    <>
      {[0, 1].map((k) => (
        <div
          key={k}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 30 + pulse * 70 + k * 40,
            height: 30 + pulse * 70 + k * 40,
            borderRadius: '50%',
            border: `2px solid ${COLORS.primary}`,
            opacity: (t >= at ? 1 : 0) * (0.15 + pulse * 0.5) * (1 - k * 0.5),
            transform: 'translate(-50%,-50%)',
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: COLORS.primary,
          boxShadow: `0 0 40px ${COLORS.primary}`,
          transform: `translate(-50%, ${-50 - (1 - drop) * 400}%) scale(${drop})`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          right: 1920 - x + 60,
          top: y,
          transform: `translateY(-50%) translateX(${(1 - lab) * -60}px)`,
          opacity: lab,
          fontFamily: FONT_STACK,
          fontWeight: 800,
          fontSize: 96,
          letterSpacing: -2,
          color: COLORS.white,
          whiteSpace: 'nowrap',
          textShadow: '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {label}
      </div>
    </>
  );
};

export const Regions: React.FC<{ t: number; fps: number }> = ({ t, fps }) => {
  const t0 = C.regions;
  const pulse = kickPulse(t, beatmap.kicks, 0.18);
  const sgAt = t0 + B;
  const jbAt = t0 + B * 2;
  const draw = prog(t, jbAt, jbAt + 0.7, EASE_OUT_EXPO);
  const exit = prog(t, C.buildup - 0.35, C.buildup, EASE_IN_OUT);
  const title = springAt(t, t0, fps, { damping: 16, stiffness: 170 });
  const loop = ((t - (jbAt + 0.7)) / 1.1) % 1;
  const dot = t > jbAt + 0.7 ? bezier(loop < 0 ? 0 : loop) : bezier(draw);

  return (
    <AbsoluteFill style={{ opacity: 1 - exit, transform: `scale(${1 + exit * 0.15})` }}>
      <AbsoluteFill style={{ opacity: prog(t, t0 - 0.2, t0 + 0.25) }}>
        <Photo src={PHOTOS.regionsBg} t={t} t0={t0} dur={3.5} kb={{ s0: 1.2, s1: 1.1, x0: 2, x1: -2 }} style={{ filter: 'blur(14px) brightness(0.3)' }} />
        <AbsoluteFill style={{ background: 'radial-gradient(60% 60% at 60% 50%, rgba(217,164,91,0.12), rgba(0,0,0,0))' }} />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          top: 150,
          width: '100%',
          textAlign: 'center',
          fontFamily: FONT_STACK,
          fontWeight: 700,
          fontSize: 30,
          letterSpacing: 10,
          textTransform: 'uppercase',
          color: COLORS.primary,
          opacity: title,
          transform: `translateY(${(1 - title) * 30}px)`,
        }}
      >
        {BRAND.regionsTitle}
      </div>

      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <path d={ARC} fill="none" stroke={COLORS.primary} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="2 14" strokeLinecap="round" pathLength={1000} opacity={draw} />
        <path d={ARC} fill="none" stroke={COLORS.primary} strokeWidth={3} pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw }} strokeLinecap="round" opacity={0.9} />
        {t > jbAt && <circle cx={dot.x} cy={dot.y} r={9} fill={COLORS.accent} style={{ filter: `drop-shadow(0 0 12px ${COLORS.primary})` }} />}
      </svg>

      <Pin t={t} at={sgAt} fps={fps} x={SG.x} y={SG.y} label={BRAND.regions[0]} pulse={t >= sgAt ? pulse : 0} />
      <Pin t={t} at={jbAt} fps={fps} x={JB.x} y={JB.y} label={BRAND.regions[1]} pulse={t >= jbAt ? pulse : 0} />
    </AbsoluteFill>
  );
};
