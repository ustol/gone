// FM logo SVG — transparent bg, dark-mode aware via CSS --logo-ink variable
// Uses Cinzel Bold (loaded in index.css) to match the Roman serif letterforms in the brand logo.

export function FMIcon({ size = 40 }: { size?: number }) {
  const w = Math.round(size * (200 / 230))
  return (
    <svg
      viewBox="0 0 200 230"
      width={w}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ flexShrink: 0 }}
    >
      <defs>
        {/* Flame gradient — warm gold → amber → dark gold */}
        <linearGradient id="fm-flame" x1="0.35" y1="0" x2="0.65" y2="1">
          <stop offset="0%"   stopColor="#f8ee98" />
          <stop offset="25%"  stopColor="#e8c848" />
          <stop offset="65%"  stopColor="#c89828" />
          <stop offset="100%" stopColor="#a07018" />
        </linearGradient>
        {/* Flame inner highlight */}
        <linearGradient id="fm-glow" x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0%"   stopColor="rgba(255,255,230,0.85)" />
          <stop offset="70%"  stopColor="rgba(255,240,180,0.2)"  />
          <stop offset="100%" stopColor="rgba(255,240,180,0)"    />
        </linearGradient>
        {/* Swoosh — dark gold → bright gold → dark gold */}
        <linearGradient id="fm-swoosh" x1="0" y1="0.5" x2="1" y2="0.5">
          <stop offset="0%"   stopColor="#a07018" />
          <stop offset="40%"  stopColor="#e8c848" />
          <stop offset="60%"  stopColor="#e8c848" />
          <stop offset="100%" stopColor="#a07018" />
        </linearGradient>
      </defs>

      {/* ── Flame ── */}
      {/* Outer body: tall teardrop, tapers to sharp tip */}
      <path
        d="
          M100 6
          C97 17, 86 30, 87 50
          C88 41, 93 34, 100 24
          C107 34, 112 41, 113 50
          C114 30, 103 17, 100 6Z
        "
        fill="url(#fm-flame)"
      />
      {/* Inner glow — brighter centre core */}
      <path
        d="
          M100 15
          C98 23, 93 31, 94 44
          C95 37, 98 32, 100 26
          C102 32, 105 37, 106 44
          C107 31, 102 23, 100 15Z
        "
        fill="url(#fm-glow)"
      />

      {/* ── FM Monogram ── */}
      {/* Cinzel Bold — closest freely available match to the logo's Roman serif */}
      <text
        x="100"
        y="168"
        textAnchor="middle"
        fontFamily="Cinzel, 'Trajan Pro', Georgia, 'Times New Roman', serif"
        fontSize="90"
        fontWeight="700"
        letterSpacing="-3"
        fill="var(--logo-ink, #1c2f6b)"
      >
        FM
      </text>

      {/* ── Swoosh ── */}
      {/* Elegant S-curve beneath the letters, matching the logo's calligraphic flourish */}
      <path
        d="M22 182 C60 168, 140 194, 178 180"
        fill="none"
        stroke="url(#fm-swoosh)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
