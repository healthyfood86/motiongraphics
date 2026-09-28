import React from 'react';
import { AbsoluteFill, interpolate } from 'remotion';
import { springAt, prog, kickPulse, EASE_OUT_EXPO, EASE_IN_OUT } from '../hooks';
import { BRAND, COLORS, FONT_STACK, PHOTOS } from '../theme';
import { Photo } from '../components/Photo';
import { KineticLine } from '../components/KineticTitle';
import { PILLAR_ICONS } from '../icons/Icons';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const B = beatmap.beatSec;

export const Pillars: React.FC<{ t: number; fps: number; frame: number }> = ({ t, fps, frame }) => {
  const t0 = C.pillars;
  const exitT = C.regions - B;
  const pulse = kickPulse(t, beatmap.kicks, 0.1);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: prog(t, t0 - 0.2, t0 + 0.3) }}>
        <Photo src={PHOTOS.ctaBg} t={t} t0={t0} dur={4} kb={{ s0: 1.15, s1: 1.25 }} style={{ filter: 'blur(16px) brightness(0.32) saturate(0.9)' }} />
      </AbsoluteFill>

      <div style={{ position: 'absolute', top: 120, left: 0, right: 0, opacity: 1 - prog(t, exitT, exitT + 0.3) }}>
        <KineticLine frame={frame} startFrame={Math.round(t0 * fps)} text={BRAND.pillarsTitle} fontSize={70} wordStagger={3} />
      </div>

      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 150 }}>
        <div style={{ display: 'flex', gap: 40 }}>
          {BRAND.pillars.map((p, i) => {
            const at = t0 + B * (i + 1);
            const s = springAt(t, at, fps, { damping: 12, stiffness: 190, mass: 0.7 });
            const draw = prog(t, at + 0.05, at + 0.7, EASE_OUT_EXPO);
            const out = prog(t, exitT + i * 0.05, exitT + 0.35 + i * 0.05, EASE_IN_OUT);
            const Icon = PILLAR_ICONS[p.key];
            const float = Math.sin(t * 1.8 + i * 1.3) * 5;
            return (
              <div
                key={p.key}
                style={{
                  width: 520,
                  borderRadius: 26,
                  overflow: 'hidden',
                  background: 'rgba(27,24,20,0.82)',
                  border: `1px solid ${COLORS.line}`,
                  boxShadow: '0 40px 80px rgba(0,0,0,0.45)',
                  opacity: Math.min(1, s * 1.5) * (1 - out),
                  transform: `translateY(${(1 - s) * 140 + float - out * 200}px) rotate(${(1 - s) * (i - 1) * 8}deg) scale(${interpolate(s, [0, 1], [0.7, 1]) + pulse * 0.012})`,
                }}
              >
                <div style={{ position: 'relative', height: 280 }}>
                  <Photo src={PHOTOS.pillars[i]} t={t} t0={at} dur={3.5} kb={{ s0: 1.25, s1: 1.1 }} />
                </div>
                <div style={{ position: 'relative', padding: '0 36px 38px' }}>
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: 42,
                      marginTop: -42,
                      background: COLORS.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 12px 30px rgba(217,164,91,0.4)',
                      transform: `scale(${springAt(t, at + 0.1, fps, { damping: 9, stiffness: 240 })})`,
                    }}
                  >
                    <Icon size={42} color={COLORS.bgDeep} draw={draw} strokeWidth={3} />
                  </div>
                  <div style={{ fontFamily: FONT_STACK, fontWeight: 800, fontSize: 40, color: COLORS.white, marginTop: 22 }}>{p.title}</div>
                  <div style={{ fontFamily: FONT_STACK, fontWeight: 500, fontSize: 24, color: COLORS.dim, marginTop: 10, lineHeight: 1.35 }}>{p.body}</div>
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
