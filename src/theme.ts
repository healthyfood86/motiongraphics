// ---------------------------------------------------------------------------
// BRAND LAYER — the only file that should need to change once real brand
// assets (logo file, exact hex codes, copy) are pulled from renoworks.sg.
// Everything else (motion, layout, timing) reads from here.
// ---------------------------------------------------------------------------

export const BRAND = {
  name: 'Renoworks',
  domain: 'renoworks.sg',
  tagline: 'SEE YOUR RENOVATION',
  taglineLine2: 'BEFORE IT EXISTS',
  subline: 'Photo-realistic renovation visualization',
  stats: [
    { value: 10000, suffix: '+', label: 'Renovations visualized' },
    { value: 50, suffix: '+', label: 'Material brands' },
    { value: 100, suffix: '%', label: 'Photo-realistic' },
  ],
  features: [
    { key: 'photoreal', label: 'Photo-real render' },
    { key: 'instant', label: 'Instant preview' },
    { key: 'materials', label: 'Material library' },
    { key: 'beforeafter', label: 'Before / after' },
  ],
} as const;

export const COLORS = {
  bg: '#070B14',
  bgDeep: '#03060B',
  panel: '#0F1826',
  panelLight: '#152238',
  primary: '#19D3C5', // teal
  primaryDeep: '#0EA5A0',
  accent: '#2F6FED', // blue
  warm: '#FF7A45', // renovation warmth accent
  warmDeep: '#E85D2A',
  white: '#F5F8FC',
  dim: '#7C8BA3',
  line: 'rgba(255,255,255,0.08)',
} as const;

export const GRADIENT = `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.accent} 55%, ${COLORS.warm} 100%)`;
export const GRADIENT_TEXT = `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.accent})`;

export const FONT_STACK = 'Manrope, Inter, -apple-system, sans-serif';
