import React from 'react';
import { COLORS } from '../theme';

const common = {
  fill: 'none',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export const PhotoRealIcon: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.white }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" {...common}>
    <rect x="6" y="10" width="36" height="28" rx="4" stroke={color} strokeWidth={2.6} />
    <circle cx="17" cy="20" r="4" stroke={color} strokeWidth={2.6} />
    <path d="M6 32 L18 22 L27 30 L34 24 L42 32" stroke={color} strokeWidth={2.6} />
  </svg>
);

export const InstantIcon: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.white }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" {...common}>
    <path d="M26 4 L10 27 H22 L20 44 L38 19 H26 L26 4 Z" stroke={color} strokeWidth={2.6} fill={color} fillOpacity={0.12} />
  </svg>
);

export const MaterialsIcon: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.white }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" {...common}>
    <rect x="7" y="24" width="14" height="14" rx="3" stroke={color} strokeWidth={2.6} />
    <rect x="16" y="14" width="14" height="14" rx="3" stroke={color} strokeWidth={2.6} />
    <rect x="27" y="22" width="14" height="14" rx="3" stroke={color} strokeWidth={2.6} />
  </svg>
);

export const BeforeAfterIcon: React.FC<{ size: number; color?: string }> = ({ size, color = COLORS.white }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" {...common}>
    <rect x="5" y="9" width="38" height="30" rx="4" stroke={color} strokeWidth={2.6} />
    <line x1="24" y1="9" x2="24" y2="39" stroke={color} strokeWidth={2.6} strokeDasharray="3 4" />
    <circle cx="24" cy="24" r="5.5" stroke={color} strokeWidth={2.6} fill={COLORS.bgDeep} />
    <path d="M22 24 L20 22 M22 24 L20 26 M26 24 L28 22 M26 24 L28 26" stroke={color} strokeWidth={2.2} />
  </svg>
);

export const FEATURE_ICON_MAP: Record<string, React.FC<{ size: number; color?: string }>> = {
  photoreal: PhotoRealIcon,
  instant: InstantIcon,
  materials: MaterialsIcon,
  beforeafter: BeforeAfterIcon,
};
