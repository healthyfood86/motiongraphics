import React from 'react';
import { COLORS } from '../theme';
import { interpolate } from 'remotion';

// Placeholder brand mark — a minimal "visualize a home" glyph (roofline +
// aperture dot) inside a rounded badge. Swap for the real Renoworks logo
// file by rendering an <Img src={staticFile('logo.svg')}/> in its place;
// every animation here (scale, glow, glyph draw-on) will still apply if
// the same wrapping props are kept.
export const LogoMark: React.FC<{ size: number; scale: number; glowAmount?: number; glyphProgress?: number }> = ({
  size,
  scale,
  glowAmount = 1,
  glyphProgress = 1,
}) => {
  const dash = interpolate(glyphProgress, [0, 1], [140, 0], { extrapolateRight: 'clamp', extrapolateLeft: 'clamp' });

  return (
    <div
      style={{
        width: size,
        height: size,
        transform: `scale(${scale})`,
        borderRadius: size * 0.26,
        background: `linear-gradient(145deg, ${COLORS.primary}, ${COLORS.accent})`,
        boxShadow: `0 ${size * 0.08}px ${size * 0.5}px rgba(25,211,197,${0.35 * glowAmount}), 0 0 ${size * 0.9}px rgba(47,111,237,${0.25 * glowAmount})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
      }}
    >
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 100 100" fill="none">
        {/* roofline */}
        <path
          d="M14 58 L50 26 L86 58"
          stroke={COLORS.bgDeep}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={140}
          strokeDashoffset={dash}
        />
        {/* base / walls */}
        <path
          d="M24 58 L24 82 L76 82 L76 58"
          stroke={COLORS.bgDeep}
          strokeWidth={9}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={140}
          strokeDashoffset={dash}
        />
        {/* aperture / visualize dot at the apex */}
        <circle cx={50} cy={26} r={7.5} fill={COLORS.bgDeep} opacity={glyphProgress} />
      </svg>
    </div>
  );
};
