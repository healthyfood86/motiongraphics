import React from 'react';

// Line icons that draw themselves on: every stroke uses pathLength=1 so a
// single `draw` value (0..1) animates any shape via stroke-dashoffset.
type IconProps = { size: number; color: string; draw?: number; strokeWidth?: number };

const Svg: React.FC<IconProps & { children: React.ReactNode }> = ({ size, color, draw = 1, strokeWidth = 2.6, children }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" style={{ overflow: 'visible' }}>
    <g
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ strokeDasharray: 1, strokeDashoffset: 1 - draw }}
    >
      {children}
    </g>
  </svg>
);

export const SparkleIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M22 6 C23 16 26 19 36 20 C26 21 23 24 22 34 C21 24 18 21 8 20 C18 19 21 16 22 6 Z" pathLength={1} />
    <path d="M37 30 C37.5 34 39 35.5 43 36 C39 36.5 37.5 38 37 42 C36.5 38 35 36.5 31 36 C35 35.5 36.5 34 37 30 Z" pathLength={1} />
  </Svg>
);

export const LayoutIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="6" y="6" width="36" height="36" rx="3" pathLength={1} />
    <path d="M6 22 H26 V42" pathLength={1} />
    <path d="M26 30 H42" pathLength={1} />
    <path d="M16 22 V14" pathLength={1} />
  </Svg>
);

export const TagIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 8 V22 L26 42 L42 26 L22 6 H8 A2 2 0 0 0 6 8 Z" pathLength={1} />
    <circle cx="15" cy="15" r="3.2" pathLength={1} />
  </Svg>
);

export const PhoneIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path
      d="M14 6 L19 6 L22 15 L18 18 C20 24 24 28 30 30 L33 26 L42 29 L42 34 C42 38 39 42 34 41 C19 39 9 29 7 14 C6 9 10 6 14 6 Z"
      pathLength={1}
    />
  </Svg>
);

export const MailIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="5" y="10" width="38" height="28" rx="4" pathLength={1} />
    <path d="M6 12 L24 26 L42 12" pathLength={1} />
  </Svg>
);

export const GlobeIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="24" cy="24" r="18" pathLength={1} />
    <path d="M6 24 H42" pathLength={1} />
    <path d="M24 6 C31 12 31 36 24 42 C17 36 17 12 24 6 Z" pathLength={1} />
  </Svg>
);

export const ArrowIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M8 24 H40 M28 12 L40 24 L28 36" pathLength={1} />
  </Svg>
);

export const PILLAR_ICONS: Record<string, React.FC<IconProps>> = {
  future: SparkleIcon,
  practical: LayoutIcon,
  budget: TagIcon,
};
