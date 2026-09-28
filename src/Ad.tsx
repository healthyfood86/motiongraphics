import React from 'react';
import { AbsoluteFill, Audio, staticFile, interpolate } from 'remotion';
import { loadFont as loadManrope } from '@remotion/google-fonts/Manrope';
import { loadFont as loadFraunces } from '@remotion/google-fonts/Fraunces';
import { useTime, prog } from './hooks';
import { COLORS } from './theme';
import { Background, FinishingLayer } from './components/Background';
import { ParticleField } from './components/ParticleField';
import { ScreenFlash, ShockwaveRing, shakeTransform } from './components/Impact';
import { BrandLockup } from './components/BrandLockup';
import { Hook } from './scenes/Hook';
import { Logo } from './scenes/Logo';
import { Portfolio } from './scenes/Portfolio';
import { Pillars } from './scenes/Pillars';
import { Regions } from './scenes/Regions';
import { Montage } from './scenes/Montage';
import { CTA } from './scenes/CTA';
import beatmap from './beatmap.json';

loadManrope('normal', { weights: ['500', '600', '700', '800'], subsets: ['latin'] });
loadFraunces('italic', { weights: ['400'], subsets: ['latin'] });

const C = beatmap.cues;

export const Ad: React.FC = () => {
  const { t, fps, frame } = useTime();
  const bugOpacity = prog(t, C.portfolio[0] + 0.2, C.portfolio[0] + 0.5) * (1 - prog(t, C.buildup - 0.3, C.buildup));

  return (
    <AbsoluteFill style={{ background: COLORS.bgDeep }}>
      <AbsoluteFill style={{ transform: `${shakeTransform(t, C.heroImpact, 14)} ${shakeTransform(t, C.cta, 18)}` }}>
        <Background />
        {t < C.heroImpact + 0.3 && <ParticleField mode="intro" impactT={C.heroImpact} />}
        {t < C.portfolio[0] + 0.1 && <Hook t={t} fps={fps} />}
        {t >= C.logo - 0.1 && t < C.portfolio[0] && <ParticleField mode="ambient" opacity={2} />}
        {t >= C.logo && t < C.portfolio[0] && <Logo t={t} fps={fps} frame={frame} />}
        {t >= C.portfolio[0] && t < C.pillars + 0.2 && <Portfolio t={t} fps={fps} />}
        {t >= C.pillars - 0.2 && t < C.regions + 0.05 && <Pillars t={t} fps={fps} frame={frame} />}
        {t >= C.regions - 0.2 && t < C.buildup && <Regions t={t} fps={fps} />}
        {t >= C.buildup && t < C.cta && <Montage t={t} />}
        {t >= C.cta && <CTA t={t} fps={fps} />}

        {bugOpacity > 0 && (
          <div style={{ position: 'absolute', left: 64, top: 52, opacity: bugOpacity, transformOrigin: 'left top' }}>
            <BrandLockup t={t} t0={0} fps={fps} size={20} descriptor={false} instant />
          </div>
        )}

        <ShockwaveRing t={t} hitT={C.heroImpact} color={COLORS.primary} cy="50%" />
        <ShockwaveRing t={t} hitT={C.cta} color={COLORS.primary} cy="42%" dur={0.9} />
        <ScreenFlash t={t} hitT={C.heroImpact} color="#FFF6EA" peak={0.75} tau={0.035} />
        {C.portfolio.map((p) => (
          <ScreenFlash key={p} t={t} hitT={p} color="#FFF6EA" peak={0.22} tau={0.03} />
        ))}
        <ScreenFlash t={t} hitT={C.pillars} color="#FFF6EA" peak={0.18} tau={0.03} />
        <ScreenFlash t={t} hitT={C.cta} color="#FFF3E2" peak={0.85} tau={0.045} />
        <ScreenFlash t={t} hitT={C.resolve} color="#FFF3E2" peak={0.2} tau={0.05} />
      </AbsoluteFill>

      <FinishingLayer />
      <AbsoluteFill style={{ background: '#000', opacity: interpolate(t, [C.end - 0.45, C.end], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }) }} />
      <Audio src={staticFile('audio/score.wav')} />
    </AbsoluteFill>
  );
};
