import React, { useLayoutEffect, useRef } from 'react';
import { AbsoluteFill } from 'remotion';
import { useTime, clamp01 } from '../hooks';
import { seededArray } from '../rng';
import { COLORS } from '../theme';
import cues from '../beatmap.json';

const W = 1920;
const H = 1080;
const COUNT = 160;

const PARTICLES = seededArray(42, COUNT, (rand) => ({
  angle: rand() * Math.PI * 2,
  radius: 0.35 + rand() * 0.62, // fraction of min(W,H)
  speed: 0.15 + rand() * 0.35,
  size: 1.2 + rand() * 2.6,
  wobble: rand() * Math.PI * 2,
  wobbleSpeed: 0.6 + rand() * 1.2,
  hueMix: rand(),
  burstDir: rand() * Math.PI * 2,
}));

function lerpColor(a: string, b: string, m: number) {
  const pa = a.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const pb = b.match(/\w\w/g)!.map((x) => parseInt(x, 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * m));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}

export const ParticleField: React.FC<{ mode: 'intro' | 'ambient' | 'buildup' }> = ({ mode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { t } = useTime();

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, W, H);

    const impact = cues.cues.logoImpact;
    const cx = W / 2;
    const cy = H * 0.46;
    const minDim = Math.min(W, H);

    for (const p of PARTICLES) {
      let x: number, y: number, alpha: number, size = p.size;

      if (mode === 'intro') {
        // converge from scattered orbit toward the logo point as impact approaches
        const progress = clamp01(t / impact);
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        const radius = p.radius * minDim * (1 - easedProgress * 0.92);
        const ang = p.angle + t * p.speed * (1 - easedProgress * 0.6);
        const wob = Math.sin(t * p.wobbleSpeed + p.wobble) * 14 * (1 - easedProgress);
        x = cx + Math.cos(ang) * radius + wob;
        y = cy + Math.sin(ang) * radius * 0.7 + wob;
        alpha = 0.15 + 0.55 * easedProgress;
        size = p.size * (1 + easedProgress * 1.4);
        if (t > impact - 0.05) alpha *= clamp01((impact + 0.12 - t) / 0.17);
      } else if (mode === 'buildup') {
        // energetic outward swirl, denser near edges, speeding up
        const localT = t;
        const radius = p.radius * minDim * 1.05;
        const ang = p.angle + localT * p.speed * 3.2;
        x = cx + Math.cos(ang) * radius;
        y = cy + Math.sin(ang) * radius * 0.7;
        alpha = 0.25;
      } else {
        // ambient drift, low density ember-like sparkle
        const ang = p.angle + t * p.speed * 0.4;
        const radius = p.radius * minDim * 1.15;
        x = cx + Math.cos(ang) * radius;
        y = cy + Math.sin(ang) * radius * 0.75;
        alpha = 0.09;
      }

      const color = lerpColor(COLORS.primary, COLORS.accent, p.hueMix);
      ctx.beginPath();
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = size * 3;
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  });

  return (
    <AbsoluteFill>
      <canvas ref={canvasRef} width={W} height={H} style={{ width: '100%', height: '100%' }} />
    </AbsoluteFill>
  );
};
