import React from 'react';
import { AbsoluteFill, interpolate, spring } from 'remotion';
import { Photo, KenBurns } from './Photo';
import { COLORS } from '../theme';

type RevealProps = {
  src: string;
  t: number;
  t0: number; // moment the reveal starts (the downbeat)
  dur: number; // how long the photo stays on screen (for the Ken Burns drift)
  fps: number;
  kb?: KenBurns;
  bump?: number;
};

const sp = (t: number, t0: number, fps: number, damping = 16, stiffness = 140, mass = 0.8) =>
  spring({ frame: Math.round((t - t0) * fps), fps, config: { damping, stiffness, mass } });

// The photo is sliced into vertical strips (each one a clipped copy of the
// same Ken-Burns layer, so they line up perfectly) that shoot up in a stagger.
export const StripReveal: React.FC<RevealProps & { strips?: number }> = ({ strips = 7, ...p }) => (
  <AbsoluteFill>
    {Array.from({ length: strips }, (_, i) => {
      const s = sp(p.t, p.t0 + i * 0.028, p.fps, 18, 170);
      const w = 100 / strips;
      return (
        <AbsoluteFill
          key={i}
          style={{
            clipPath: `inset(0 ${100 - (i + 1) * w - 0.05}% 0 ${i * w}%)`,
            transform: `translateY(${(1 - s) * (i % 2 ? -110 : 110)}%)`,
          }}
        >
          <Photo src={p.src} t={p.t} t0={p.t0} dur={p.dur} kb={p.kb} bump={p.bump} />
        </AbsoluteFill>
      );
    })}
  </AbsoluteFill>
);

// Circular iris opening from the centre, led by a thin brass ring.
export const IrisReveal: React.FC<RevealProps> = (p) => {
  const s = sp(p.t, p.t0, p.fps, 20, 90, 1);
  const r = s * 80;
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `circle(${r}% at 50% 50%)` }}>
        <Photo src={p.src} t={p.t} t0={p.t0} dur={p.dur} kb={p.kb} bump={p.bump} />
      </AbsoluteFill>
      {s < 0.995 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: `${r * 2 * 1.1}vmax`,
            height: `${r * 2 * 1.1}vmax`,
            transform: 'translate(-50%,-50%)',
            borderRadius: '50%',
            border: `3px solid ${COLORS.primary}`,
            opacity: 1 - s,
            boxShadow: `0 0 40px ${COLORS.primary}`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};

// Two diagonal halves slam in from opposite corners and meet.
export const DiagonalReveal: React.FC<RevealProps> = (p) => {
  const a = sp(p.t, p.t0, p.fps, 17, 150);
  const b = sp(p.t, p.t0 + 0.06, p.fps, 17, 150);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: 'polygon(0 0, 101% 0, 0 101%)',
          transform: `translate(${(1 - a) * -60}%, ${(1 - a) * -60}%)`,
        }}
      >
        <Photo src={p.src} t={p.t} t0={p.t0} dur={p.dur} kb={p.kb} bump={p.bump} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          clipPath: 'polygon(100% -1%, 100% 100%, -1% 100%)',
          transform: `translate(${(1 - b) * 60}%, ${(1 - b) * 60}%)`,
        }}
      >
        <Photo src={p.src} t={p.t} t0={p.t0} dur={p.dur} kb={p.kb} bump={p.bump} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Grid of tiles popping in from the centre outward.
export const TileReveal: React.FC<RevealProps & { cols?: number; rows?: number }> = ({ cols = 6, rows = 4, ...p }) => {
  const tiles = [];
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const maxD = Math.hypot(cx, cy);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const d = Math.hypot(c - cx, r - cy) / maxD;
      const s = sp(p.t, p.t0 + d * 0.22, p.fps, 13, 200, 0.6);
      const x0 = (c / cols) * 100;
      const y0 = (r / rows) * 100;
      tiles.push(
        <AbsoluteFill
          key={`${r}-${c}`}
          style={{
            clipPath: `inset(${y0}% ${100 - x0 - 100 / cols - 0.05}% ${100 - y0 - 100 / rows - 0.05}% ${x0}%)`,
            transform: `scale(${interpolate(s, [0, 1], [0.6, 1])})`,
            transformOrigin: `${x0 + 50 / cols}% ${y0 + 50 / rows}%`,
            opacity: Math.min(1, s * 1.6),
          }}
        >
          <Photo src={p.src} t={p.t} t0={p.t0} dur={p.dur} kb={p.kb} bump={p.bump} />
        </AbsoluteFill>
      );
    }
  }
  return <AbsoluteFill>{tiles}</AbsoluteFill>;
};
