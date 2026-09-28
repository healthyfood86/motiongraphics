import React from 'react';
import { useVideoConfig, interpolate } from 'remotion';
import { popIn, useTime, clamp01, EASE_OUT_EXPO, EASE_IN_OUT } from '../hooks';
import { COLORS, FONT_STACK, BRAND } from '../theme';
import { MaterialsIcon, PhotoRealIcon, BeforeAfterIcon, InstantIcon } from '../icons/FeatureIcons';

const TOOL_ICONS = [PhotoRealIcon, MaterialsIcon, BeforeAfterIcon, InstantIcon];

// The product "screen" is rebuilt from primitive vector layers (sky, roof,
// walls, windows, a live before/after wipe, floating material swatches)
// rather than a flat screenshot, so every piece can animate independently.
const HouseCanvas: React.FC<{ frame: number; startFrame: number; fps: number }> = ({ frame, startFrame, fps }) => {
  const local = frame - startFrame;
  const wipe = clamp01(
    interpolate(local, [fps * 0.6, fps * 2.6], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: EASE_IN_OUT,
    })
  );
  // wipePct is the clip-inset from the left, so it must SHRINK over time
  // (92 -> 8) for the "after" region [wipePct, 100] to grow and sweep the
  // renovated house into view as the demo plays.
  const wipePct = 92 - wipe * 84;

  const windowPop = (i: number) => popIn(frame, fps, startFrame + fps * 0.5 + i * 3, { damping: 12, stiffness: 200 });

  const HouseBody: React.FC<{ variant: 'before' | 'after' }> = ({ variant }) => {
    const roof = variant === 'before' ? '#5B6472' : COLORS.warm;
    const wall = variant === 'before' ? '#8B93A0' : '#EDE7DD';
    const trim = variant === 'before' ? '#6E7684' : COLORS.primaryDeep;
    return (
      <svg width="100%" height="100%" viewBox="0 0 640 400" preserveAspectRatio="xMidYMax slice">
        <rect x="0" y="0" width="640" height="400" fill={variant === 'before' ? '#20242C' : '#0C2A2E'} />
        <rect x="0" y="300" width="640" height="100" fill={variant === 'before' ? '#171A20' : '#0A1F22'} />
        {/* tree */}
        <rect x="60" y="230" width="14" height="70" fill="#4A3A2A" />
        <circle cx="67" cy="205" r="46" fill={variant === 'before' ? '#3B4A3B' : '#2E7D5B'} />
        {/* house walls */}
        <rect x="180" y="190" width="320" height="130" fill={wall} />
        {/* roof */}
        <path d="M160 190 L340 90 L520 190 Z" fill={roof} />
        {/* trim / fascia */}
        <rect x="170" y="184" width="340" height="10" fill={trim} />
        {/* door */}
        <rect x="320" y="250" width="46" height="70" rx="3" fill={variant === 'before' ? '#454B55' : '#7A4A2E'} />
        <circle cx="358" cy="286" r="2.5" fill="#F5F8FC" />
        {/* windows */}
        {[[210, 220], [270, 220], [400, 220], [450, 220]].map(([wx, wy], i) => (
          <g key={i} transform={`translate(${wx} ${wy}) scale(${windowPop(i)})`} style={{ transformOrigin: 'center' }}>
            <rect x={-18} y={-16} width={36} height={36} rx={3} fill={variant === 'before' ? '#2B3038' : '#FFD98C'} opacity={variant === 'before' ? 0.9 : 0.95} />
            <line x1={0} y1={-16} x2={0} y2={20} stroke={trim} strokeWidth={2} />
            <line x1={-18} y1={2} x2={18} y2={2} stroke={trim} strokeWidth={2} />
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', borderRadius: 14 }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <HouseBody variant="before" />
      </div>
      <div style={{ position: 'absolute', inset: 0, clipPath: `inset(0 0 0 ${wipePct}%)` }}>
        <HouseBody variant="after" />
      </div>
      {/* wipe divider + drag handle */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: `${wipePct}%`,
          width: 3,
          background: COLORS.white,
          opacity: 0.9,
          boxShadow: `0 0 18px ${COLORS.white}`,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: `${wipePct}%`,
          top: '50%',
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: COLORS.white,
          transform: 'translate(-50%,-50%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
        }}
      >
        <svg width={20} height={20} viewBox="0 0 24 24">
          <path d="M9 6 L3 12 L9 18 M15 6 L21 12 L15 18" stroke={COLORS.bgDeep} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {/* labels */}
      <div style={{ position: 'absolute', left: 16, top: 14, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 13, color: '#fff', opacity: 0.65, letterSpacing: 1 }}>
        BEFORE
      </div>
      <div style={{ position: 'absolute', right: 16, top: 14, fontFamily: FONT_STACK, fontWeight: 700, fontSize: 13, color: COLORS.warm, letterSpacing: 1 }}>
        AFTER
      </div>
    </div>
  );
};

const SwatchChip: React.FC<{ color: string; x: number; y: number; frame: number; delay: number; fps: number; selected?: boolean }> = ({
  color,
  x,
  y,
  frame,
  delay,
  fps,
  selected,
}) => {
  const p = popIn(frame, fps, delay, { damping: 11, stiffness: 220 });
  const scale = interpolate(p, [0, 1], [0.3, 1]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: 46,
        height: 46,
        borderRadius: 12,
        background: color,
        opacity: p,
        transform: `scale(${scale})`,
        border: selected ? `3px solid ${COLORS.white}` : '3px solid rgba(255,255,255,0.15)',
        boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
      }}
    />
  );
};

export const ProductShowcase: React.FC<{ startFrame: number }> = ({ startFrame }) => {
  const { fps } = useVideoConfig();
  const { frame, t } = useTime();
  const local = frame - startFrame;

  const chromeP = popIn(frame, fps, startFrame, { damping: 15, mass: 0.9, stiffness: 130 });
  const tilt = interpolate(chromeP, [0, 1], [18, 0]);
  const scaleIn = interpolate(chromeP, [0, 1], [0.75, 1]);
  const floatY = Math.sin(t * 0.9) * 6;

  const urlP = popIn(frame, fps, startFrame + fps * 0.15, { damping: 14, stiffness: 220 });

  return (
    <div
      style={{
        width: 980,
        height: 560,
        perspective: 1400,
        opacity: interpolate(chromeP, [0, 0.15], [0, 1], { extrapolateRight: 'clamp' }),
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          transform: `rotateX(${tilt}deg) scale(${scaleIn}) translateY(${floatY}px)`,
          transformStyle: 'preserve-3d',
          borderRadius: 18,
          background: COLORS.panel,
          border: `1px solid ${COLORS.line}`,
          boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* top bar */}
        <div style={{ height: 52, display: 'flex', alignItems: 'center', padding: '0 18px', gap: 14, background: COLORS.panelLight, borderBottom: `1px solid ${COLORS.line}` }}>
          <div style={{ display: 'flex', gap: 8 }}>
            {['#FF5F57', '#FEBC2E', '#28C840'].map((c, i) => {
              const dp = popIn(frame, fps, startFrame + i * 2, { damping: 10, stiffness: 260 });
              return <div key={c} style={{ width: 13, height: 13, borderRadius: '50%', background: c, opacity: dp, transform: `scale(${dp})` }} />;
            })}
          </div>
          <div
            style={{
              flex: 1,
              maxWidth: 380,
              height: 28,
              borderRadius: 14,
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              padding: '0 12px',
              gap: 8,
              opacity: urlP,
              transform: `translateY(${interpolate(urlP, [0, 1], [-8, 0])}px)`,
            }}
          >
            <svg width={12} height={12} viewBox="0 0 24 24"><path d="M6 10 V8 a6 6 0 0 1 12 0 v2 M4 10 h16 v10 h-16 Z" stroke={COLORS.dim} strokeWidth={2} fill="none" /></svg>
            <span style={{ fontFamily: FONT_STACK, fontSize: 13, color: COLORS.dim, fontWeight: 600 }}>{BRAND.domain}</span>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex' }}>
          {/* tool rail */}
          <div style={{ width: 74, background: COLORS.panelLight, borderRight: `1px solid ${COLORS.line}`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, paddingTop: 22 }}>
            {TOOL_ICONS.map((Icon, i) => {
              const dp = popIn(frame, fps, startFrame + fps * 0.25 + i * 4, { damping: 12, stiffness: 220 });
              return (
                <div
                  key={i}
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 12,
                    background: i === 1 ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.accent})` : 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: dp,
                    transform: `scale(${dp})`,
                  }}
                >
                  <Icon size={20} color={COLORS.white} />
                </div>
              );
            })}
          </div>

          {/* canvas */}
          <div style={{ flex: 1, position: 'relative', padding: 14 }}>
            <div style={{ width: '100%', height: '100%', opacity: interpolate(chromeP, [0.3, 1], [0, 1], { extrapolateLeft: 'clamp' }) }}>
              <HouseCanvas frame={frame} startFrame={startFrame + Math.round(fps * 0.35)} fps={fps} />
            </div>
            {/* material swatches floating over the canvas */}
            <SwatchChip color="#8B93A0" x={26} y={62} frame={frame} delay={startFrame + fps * 1.1} fps={fps} />
            <SwatchChip color={COLORS.warm} x={80} y={62} frame={frame} delay={startFrame + fps * 1.2} fps={fps} selected />
            <SwatchChip color="#D9C79E" x={134} y={62} frame={frame} delay={startFrame + fps * 1.3} fps={fps} />
            <SwatchChip color="#7A4A2E" x={188} y={62} frame={frame} delay={startFrame + fps * 1.4} fps={fps} />
          </div>
        </div>
      </div>
    </div>
  );
};
