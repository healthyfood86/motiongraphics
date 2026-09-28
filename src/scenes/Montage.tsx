import React from 'react';
import { AbsoluteFill } from 'remotion';
import { prog } from '../hooks';
import { PHOTOS } from '../theme';
import { Photo } from '../components/Photo';
import beatmap from '../beatmap.json';

const C = beatmap.cues;
const ROLL = beatmap.roll;

// One photo per snare-roll hit; the whole stack zooms harder as the roll accelerates.
export const Montage: React.FC<{ t: number }> = ({ t }) => {
  let i = -1;
  for (let k = 0; k < ROLL.length; k++) if (t >= ROLL[k]) i = k;
  if (i < 0) return null;
  const hitT = ROLL[i];
  const push = prog(t, C.buildup, C.cta, (x) => x * x);
  const punch = Math.exp(-(t - hitT) / 0.05);
  const scale = 1.05 + push * 0.35 + punch * 0.06;
  const bright = 0.75 + punch * 0.35 + push * 0.2;
  return (
    <AbsoluteFill style={{ background: '#000' }}>
      <AbsoluteFill style={{ transform: `scale(${scale}) rotate(${(i % 2 ? 1 : -1) * push * 1.5}deg)` }}>
        <Photo src={PHOTOS.montage[i % PHOTOS.montage.length]} t={t} t0={hitT} dur={0.2} kb={{ s0: 1, s1: 1 }} style={{ filter: `brightness(${bright}) contrast(1.08)` }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
