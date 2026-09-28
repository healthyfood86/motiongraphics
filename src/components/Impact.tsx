import React from 'react';
import { AbsoluteFill } from 'remotion';
import { decayShake } from '../hooks';
import { COLORS } from '../theme';

// Full-frame flash that spikes at `hitT` and decays exponentially. Used to
// sell every impact hit in the score as a visible, felt beat.
export const ScreenFlash: React.FC<{ t: number; hitT: number; tau?: number; color?: string; peak?: number }> = ({
  t,
  hitT,
  tau = 0.04,
  color = '#FFFFFF',
  peak = 0.7,
}) => {
  const dt = t - hitT;
  if (dt < 0 || dt > tau * 6) return null;
  const alpha = peak * Math.exp(-dt / tau);
  return <AbsoluteFill style={{ background: color, opacity: alpha, mixBlendMode: 'screen' }} />;
};

export const ShockwaveRing: React.FC<{ t: number; hitT: number; dur?: number; color?: string; cx?: string; cy?: string }> = ({
  t,
  hitT,
  dur = 0.7,
  color = COLORS.primary,
  cx = '50%',
  cy = '46%',
}) => {
  const dt = t - hitT;
  if (dt < 0 || dt > dur) return null;
  const p = dt / dur;
  const eased = 1 - Math.pow(1 - p, 2);
  const size = 40 + eased * 1500;
  const opacity = (1 - p) * 0.55;
  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          position: 'absolute',
          left: cx,
          top: cy,
          width: size,
          height: size,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          opacity,
          transform: 'translate(-50%,-50%)',
          boxShadow: `0 0 40px ${color}`,
        }}
      />
    </AbsoluteFill>
  );
};

// Returns a CSS transform string for a decaying shake — wrap the whole
// frame in a div with this transform right after any impact hit.
export function shakeTransform(t: number, hitT: number, amp = 10) {
  const dt = t - hitT;
  const dx = decayShake(dt, 22, 0.1, amp);
  const dy = decayShake(dt, 27, 0.09, amp * 0.7);
  return `translate(${dx}px, ${dy}px)`;
}
