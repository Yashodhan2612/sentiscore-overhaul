/**
 * SentiScore brand logo — icon mark + wordmark
 *
 * Icon concept: "The Sentiment Pulse"
 * A Bloomberg-style EKG signal line with a scored peak — representing
 * raw sentiment data being analysed and outputted as a precise score.
 * The icon always uses a dark navy badge regardless of app theme,
 * keeping the brand mark immediately recognisable in both modes.
 */

interface SentiScoreLogoProps {
  /** Controls overall height (width scales proportionally) */
  height?: number;
  /** When true, only renders the square icon badge — no wordmark */
  iconOnly?: boolean;
  /** Extra className for the root <svg> element */
  className?: string;
}

const SentiScoreLogo = ({
  height = 32,
  iconOnly = false,
  className = "",
}: SentiScoreLogoProps) => {
  // The icon is always square; wordmark adds ~3.8× extra width
  const iconSize = height;
  const wordmarkWidth = iconOnly ? 0 : Math.round(height * 3.85);
  const gap = iconOnly ? 0 : Math.round(height * 0.33);
  const totalWidth = iconSize + gap + wordmarkWidth;

  // All icon geometry is defined in a 40×40 unit coordinate space
  // then uniformly scaled to `iconSize`.
  const scale = iconSize / 40;

  // ── Icon internals (40×40 units) ────────────────────────────────────
  // Rounded-rect badge occupies 36×36 at offset (2,2)
  const R = 8;               // corner radius of badge
  const baseY = 29;          // EKG baseline
  const peakX = 20;          // centred peak
  const peakY = 9;           // peak height
  const signalPath = [
    `M 4 ${baseY}`,
    `L 13 ${baseY}`,          // flat left
    `L 15 ${baseY - 5}`,      // small pre-blip
    `L ${peakX - 1} ${peakY}`,// ascent to peak
    `L ${peakX + 1} ${peakY}`,// flat at peak tip (micro-plateau)
    `L 25 ${baseY}`,          // descent
    `L 36 ${baseY}`,          // flat right
  ].join(" ");

  // Wordmark text properties — scale with height
  const fontSize     = Math.round(height * 0.52);
  const fontBaseline = Math.round(height * 0.68);

  return (
    <svg
      width={totalWidth}
      height={height}
      viewBox={`0 0 ${totalWidth} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SentiScore"
      className={className}
    >
      <defs>
        {/* Badge background — always dark navy */}
        <linearGradient id="ss-bg" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
          <stop offset="0%"   stopColor="#0C1526" />
          <stop offset="100%" stopColor="#14213A" />
        </linearGradient>

        {/* Amber glow filter on signal + peak */}
        <filter id="ss-glow" x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Subtle outer glow on peak dot */}
        <filter id="ss-halo" x="-100%" y="-100%" width="300%" height="300%" colorInterpolationFilters="sRGB">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="halo" />
          <feMerge>
            <feMergeNode in="halo" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* ── ICON BADGE ─────────────────────────────── */}
      <g transform={`scale(${scale})`}>
        {/* Badge background */}
        <rect x="2" y="2" width="36" height="36" rx={R} fill="url(#ss-bg)" />

        {/* Badge border */}
        <rect x="2" y="2" width="36" height="36" rx={R}
              stroke="#1E3860" strokeWidth="0.75" />

        {/* Horizontal guide at baseline — very subtle */}
        <line x1="4" y1={baseY} x2="36" y2={baseY}
              stroke="#1A3050" strokeWidth="0.5" />

        {/* Vertical centre guide — very subtle */}
        <line x1={peakX} y1="4" x2={peakX} y2="36"
              stroke="#1A3050" strokeWidth="0.5" strokeDasharray="2 3" />

        {/* Amber signal line */}
        <path d={signalPath}
              stroke="#F59E0B" strokeWidth="2.1"
              strokeLinecap="round" strokeLinejoin="round"
              filter="url(#ss-glow)" />

        {/* ── Score peak dot ── */}
        {/* Outer halo */}
        <circle cx={peakX} cy={peakY} r="6.5" fill="#F59E0B" opacity="0.12"
                filter="url(#ss-halo)" />
        {/* Amber ring */}
        <circle cx={peakX} cy={peakY} r="4"   fill="#0C1526" />
        <circle cx={peakX} cy={peakY} r="4"   stroke="#F59E0B" strokeWidth="1.5" />
        {/* Inner bright core */}
        <circle cx={peakX} cy={peakY} r="1.8" fill="#FCD34D" />

        {/* Small tick marks flanking the peak on baseline — "measurement" feel */}
        <line x1={peakX - 6} y1={baseY - 1.5} x2={peakX - 6} y2={baseY + 1.5}
              stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
        <line x1={peakX + 6} y1={baseY - 1.5} x2={peakX + 6} y2={baseY + 1.5}
              stroke="#F59E0B" strokeWidth="1" strokeLinecap="round" opacity="0.45" />
      </g>

      {/* ── WORDMARK ───────────────────────────────── */}
      {!iconOnly && (
        <text
          x={iconSize + gap}
          y={fontBaseline}
          fontFamily="'SF Pro Display', 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
          fontSize={fontSize}
          fontWeight="700"
          letterSpacing="-0.01em"
        >
          {/* "Senti" adapts to the app theme via currentColor */}
          <tspan fill="currentColor" opacity="0.92">Senti</tspan>
          {/* "Score" is always amber — the brand colour */}
          <tspan fill="#F59E0B">Score</tspan>
        </text>
      )}
    </svg>
  );
};

export default SentiScoreLogo;
