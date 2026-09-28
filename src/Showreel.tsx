import React from 'react';
import { AbsoluteFill, Audio, staticFile, useVideoConfig, interpolate } from 'remotion';
import { loadFont } from '@remotion/google-fonts/Manrope';
import { useTime, popIn, EASE_OUT_EXPO } from './hooks';
import { COLORS, FONT_STACK, BRAND } from './theme';
import { Background } from './components/Background';
import { ParticleField } from './components/ParticleField';
import { LogoMark } from './components/LogoMark';
import { Wordmark } from './components/Wordmark';
import { KineticLine } from './components/KineticTitle';
import { ScreenFlash, ShockwaveRing, shakeTransform } from './components/Impact';
import { ProductShowcase } from './components/ProductShowcase';
import { FeatureRow } from './components/FeatureRow';
import { StatBlock } from './components/StatCounter';
import { EndCard } from './components/EndCard';
import cuesData from './beatmap.json';

loadFont('normal', { weights: ['700', '800'], subsets: ['latin'] });

const cues = cuesData.cues;

export const Showreel: React.FC = () => {
  const { fps } = useVideoConfig();
  const { frame, t } = useTime();

  const F = (s: number) => Math.round(s * fps);
  const fImpact = F(cues.logoImpact);
  const fSettle = F(cues.logoSettle);
  const fTitle = F(cues.titleStart);
  const fShowcase = F(cues.screenshotStart);
  const fArp = F(cues.arpStart);
  const fStats = F(cues.statsStart);
  const fBuildup = F(cues.buildupStart);
  const fClimax = F(cues.climaxHit);
  const fEnd = F(cues.end);

  // Whole-scene slow push-in (ken burns) for cinematic depth.
  const kenBurns = interpolate(frame, [0, fEnd], [1, 1.055], { extrapolateRight: 'clamp' });

  // Brand bug: logo+wordmark start centered/huge on impact, then dock to a
  // small persistent corner mark once the kinetic title takes over, and
  // disappear just before the climax hands off to the final end-card lockup.
  const dockStart = fTitle;
  const dockDur = fps * 0.6;
  const dockP = interpolate(frame, [dockStart, dockStart + dockDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_OUT_EXPO,
  });
  const brandLeft = interpolate(dockP, [0, 1], [50, 9]);
  const brandTop = interpolate(dockP, [0, 1], [44, 8]);
  const brandScale = interpolate(dockP, [0, 1], [1, 0.34]);
  const brandFadeOut = interpolate(frame, [fBuildup, fBuildup + fps * 0.25], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const logoScale = popIn(frame, fps, fImpact, { damping: 8, mass: 1, stiffness: 210 });
  const settleBounce = popIn(frame, fps, fSettle, { damping: 6, mass: 0.5, stiffness: 260 });
  const secondaryPulse = 1 + (interpolate(settleBounce, [0, 1], [0, 0.08]) - 0.08 * settleBounce);

  const showBrandBug = frame >= fImpact;

  // pre-title flash words during the riser build
  const flashWordDelay1 = 0;
  const flashWordDelay2 = F(0.9375);

  return (
    <AbsoluteFill style={{ background: COLORS.bgDeep, fontFamily: FONT_STACK }}>
      <AbsoluteFill style={{ transform: `scale(${kenBurns}) ${shakeTransform(t, cues.logoImpact, 14)} ${shakeTransform(t, cues.climaxHit, 20)}` }}>
        <Background energy={frame > fBuildup ? 1 : 0.3} />

        <AbsoluteFill>
          {frame < fImpact + fps * 0.3 && <ParticleField mode="intro" />}
          {frame >= fShowcase && frame < fBuildup && <ParticleField mode="ambient" />}
          {frame >= fBuildup && <ParticleField mode="buildup" />}
        </AbsoluteFill>

        {/* pre-impact flash words */}
        <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
          {(() => {
            const p1 = popIn(frame, fps, flashWordDelay1, { damping: 9, stiffness: 260 });
            const alive1 = frame < fImpact - 6;
            const p2 = popIn(frame, fps, flashWordDelay2, { damping: 9, stiffness: 260 });
            const alive2 = frame >= flashWordDelay2 && frame < fImpact - 6;
            return (
              <>
                {alive1 && frame < flashWordDelay2 - 4 && (
                  <div style={{ position: 'absolute', opacity: p1 * (1 - Math.max(0, (frame - (flashWordDelay2 - 14)) / 14)), transform: `scale(${interpolate(p1, [0, 1], [0.7, 1.15])})`, fontWeight: 800, fontSize: 64, color: COLORS.dim, letterSpacing: 4 }}>
                    IMAGINE.
                  </div>
                )}
                {alive2 && (
                  <div style={{ position: 'absolute', opacity: p2, transform: `scale(${interpolate(p2, [0, 1], [0.7, 1.15])})`, fontWeight: 800, fontSize: 64, color: COLORS.white, letterSpacing: 4 }}>
                    VISUALIZE.
                  </div>
                )}
              </>
            );
          })()}
        </AbsoluteFill>

        {/* logo mark: big center reveal, anchored exactly where particles/shockwave converge */}
        {showBrandBug && frame < fBuildup + fps * 0.1 && (
          <div
            style={{
              position: 'absolute',
              left: `${brandLeft}%`,
              top: `${brandTop}%`,
              width: 230,
              height: 230,
              transform: `translate(-50%,-50%) scale(${brandScale * secondaryPulse})`,
              opacity: brandFadeOut,
            }}
          >
            <LogoMark size={230} scale={logoScale} glowAmount={1} glyphProgress={interpolate(logoScale, [0, 1], [0, 1])} />
            {/* wordmark cascades in beside the mark only once it's already docking to the corner */}
            <div
              style={{
                position: 'absolute',
                left: '112%',
                top: '50%',
                transform: 'translateY(-50%)',
                opacity: interpolate(dockP, [0.15, 0.5], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                whiteSpace: 'nowrap',
              }}
            >
              <Wordmark frame={frame} startFrame={fTitle} fontSize={92} />
            </div>
          </div>
        )}

        <ShockwaveRing t={t} hitT={cues.logoImpact} color={COLORS.primary} />
        <ShockwaveRing t={t} hitT={cues.climaxHit} color={COLORS.warm} dur={0.9} />
        <ScreenFlash t={t} hitT={cues.logoImpact} color="#EAFBFF" peak={0.75} tau={0.035} />
        <ScreenFlash t={t} hitT={cues.climaxHit} color="#FFF3E9" peak={0.8} tau={0.04} />

        {/* kinetic tagline */}
        {frame >= fTitle && frame < fShowcase + fps * 0.25 && (
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingTop: 40,
              opacity: interpolate(frame, [fShowcase, fShowcase + fps * 0.22], [1, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
                easing: EASE_OUT_EXPO,
              }),
            }}
          >
            <div
              style={{
                transform: `translateY(${interpolate(frame, [fShowcase, fShowcase + fps * 0.4], [0, -80], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                  easing: EASE_OUT_EXPO,
                })}px) scale(${interpolate(frame, [fShowcase, fShowcase + fps * 0.3], [1, 0.9], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })})`,
              }}
            >
              <KineticLine frame={frame} startFrame={fTitle} text={BRAND.tagline} fontSize={78} />
              <div style={{ height: 14 }} />
              <KineticLine frame={frame} startFrame={fTitle + 10} text={BRAND.taglineLine2} fontSize={78} gradient />
            </div>
          </AbsoluteFill>
        )}

        {/* product showcase */}
        {frame >= fShowcase && frame < fBuildup && (
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: frame >= fArp ? 170 : 0,
              transform: `translateY(${frame >= fArp ? -90 : 0}px) scale(${frame >= fStats ? 0.86 : 1})`,
            }}
          >
            <ProductShowcase startFrame={fShowcase} />
          </AbsoluteFill>
        )}

        {/* feature icon row */}
        {frame >= fArp && frame < fStats + fps * 1.2 && (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 70 }}>
            <FeatureRow startFrame={fArp} />
          </AbsoluteFill>
        )}

        {/* stat counters */}
        {frame >= fStats + fps * 1.0 && frame < fBuildup && (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 300 }}>
            <StatBlock startFrame={fStats + Math.round(fps * 1.0)} />
          </AbsoluteFill>
        )}

        {/* buildup climax tagline slam */}
        {frame >= fBuildup && frame < fClimax + 4 && (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <KineticLine frame={frame} startFrame={fBuildup} text={BRAND.taglineLine2} fontSize={104} gradient wordStagger={3} />
          </AbsoluteFill>
        )}

        {/* final end card lockup */}
        {frame >= fClimax && (
          <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
            <EndCard startFrame={fClimax + 4} />
          </AbsoluteFill>
        )}
      </AbsoluteFill>

      {/* tail fade to black, matched to the audio's own fade-out */}
      <AbsoluteFill
        style={{
          background: '#000',
          opacity: interpolate(frame, [fEnd - Math.round(fps * 0.35), fEnd], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />

      <Audio src={staticFile('audio/score.wav')} />
    </AbsoluteFill>
  );
};
