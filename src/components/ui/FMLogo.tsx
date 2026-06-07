// Inline SVG logo components — dark mode via CSS variable --logo-ink

export function FMIcon({ size = 38 }: { size?: number }) {
  const w = Math.round(size * (58 / 72))
  return (
    <svg
      viewBox="0 0 58 72"
      width={w}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="fm-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f0d880" />
          <stop offset="55%"  stopColor="#c8a040" />
          <stop offset="100%" stopColor="#8a5f0e" />
        </linearGradient>
      </defs>

      {/* Outer flame */}
      <path
        d="M29 4 C25.5 13,19 20,21 31 C23 23,28 18,29 12 C30 18,35 23,37 31 C39 20,32.5 13,29 4Z"
        fill="url(#fm-gold)"
      />
      {/* Flame inner glow */}
      <path
        d="M29 11 C27.5 17,24 21,25 28 C26 23,28 20,29 16 C30 20,32 23,33 28 C34 21,30.5 17,29 11Z"
        fill="rgba(255,252,210,0.45)"
      />

      {/* FM monogram */}
      <text
        x="29"
        y="63"
        textAnchor="middle"
        fontFamily="Georgia,'Times New Roman',serif"
        fontSize="33"
        fontWeight="bold"
        letterSpacing="-1"
        fill="var(--logo-ink, #1c2f6b)"
      >
        FM
      </text>

      {/* Gold swoosh */}
      <path
        d="M5 60 C15 54,43 66,53 60"
        fill="none"
        stroke="url(#fm-gold)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
