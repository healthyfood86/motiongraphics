import { useCurrentFrame, useVideoConfig, interpolate, Easing, spring } from 'remotion';

export function useTime() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, fps, t: frame / fps };
}

// Punchy "overshoot" pop — snaps past 1 then settles. This is the core
// motion signature used for every reveal in the piece (logo, icons, type).
export function popIn(frame: number, fps: number, delayFrames = 0, cfg?: { damping?: number; mass?: number; stiffness?: number }) {
  return spring({
    frame: frame - delayFrames,
    fps,
    config: {
      damping: cfg?.damping ?? 11,
      mass: cfg?.mass ?? 0.7,
      stiffness: cfg?.stiffness ?? 170,
    },
  });
}

// Same spring as popIn, but keyed to a time in seconds (cue times come from the beat map).
export function springAt(t: number, t0: number, fps: number, cfg?: { damping?: number; mass?: number; stiffness?: number }) {
  return spring({
    frame: Math.round((t - t0) * fps),
    fps,
    config: { damping: cfg?.damping ?? 11, mass: cfg?.mass ?? 0.7, stiffness: cfg?.stiffness ?? 170 },
  });
}

// Clamped 0..1 progress between two times, with an optional easing.
export function prog(t: number, a: number, b: number, easing: (x: number) => number = (x) => x) {
  return easing(clamp01((t - a) / (b - a)));
}

export function ease(t: number, from: number, to: number, a = 0, b = 0, c = 1, d = 1) {
  return interpolate(t, [from, to], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(a, b, c, d),
  });
}

export const EASE_OUT_EXPO = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_OUT_BACK = Easing.bezier(0.34, 1.56, 0.64, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);

export function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

// 1 on a kick, decaying to 0 — lets any element "breathe" with the drums.
export function kickPulse(t: number, kicks: number[], tau = 0.12) {
  let last = -Infinity;
  for (const k of kicks) {
    if (k <= t) last = k;
    else break;
  }
  return last === -Infinity ? 0 : Math.exp(-(t - last) / tau);
}

// A short decaying oscillation — used for screen-shake / secondary bounce
// after an impact hit lands.
export function decayShake(tSinceHit: number, freq = 18, tau = 0.12, amp = 1) {
  if (tSinceHit < 0) return 0;
  return amp * Math.exp(-tSinceHit / tau) * Math.sin(2 * Math.PI * freq * tSinceHit);
}
