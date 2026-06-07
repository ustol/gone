import type { WreathTypeConfig } from '@/lib/wreathTypes'

interface Props {
  config: WreathTypeConfig
  size?: number
}

export default function WreathIcon({ config, size = 96 }: Props) {
  const cx = 50
  const cy = 50
  const ringR = 37
  const leafCount = 20
  const flowerCount = config.petalCount <= 8 ? 6 : 8
  const petalR = config.petalCount >= 12 ? 8 : 5.5
  const petalDist = config.petalCount >= 12 ? 5 : 4.5

  // Generate leaf positions
  const leaves = Array.from({ length: leafCount }, (_, i) => {
    const a = (i / leafCount) * Math.PI * 2
    const x = cx + ringR * Math.cos(a)
    const y = cy + ringR * Math.sin(a)
    const rot = (a * 180) / Math.PI + 90
    return { x, y, rot }
  })

  // Generate flower positions
  const flowers = Array.from({ length: flowerCount }, (_, i) => {
    const a = (i / flowerCount) * Math.PI * 2
    const x = cx + ringR * Math.cos(a)
    const y = cy + ringR * Math.sin(a)
    return { x, y, a }
  })

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <circle cx={cx} cy={cy} r="48" fill={config.bgColor} />

      {/* Outer glow ring */}
      <circle
        cx={cx}
        cy={cy}
        r="44"
        fill="none"
        stroke={config.flowerColors[0]}
        strokeWidth="0.5"
        opacity="0.25"
      />

      {/* Leaf ring */}
      {leaves.map((l, i) => (
        <ellipse
          key={i}
          cx={l.x}
          cy={l.y}
          rx="2.8"
          ry="6"
          fill={config.leafColor}
          transform={`rotate(${l.rot}, ${l.x}, ${l.y})`}
          opacity="0.9"
        />
      ))}

      {/* Flowers */}
      {flowers.map((f, fi) => {
        const petals = Array.from({ length: config.petalCount <= 4 ? 4 : config.petalCount <= 8 ? 5 : 8 }, (_, pi) => {
          const pa = f.a + (pi / (config.petalCount <= 4 ? 4 : config.petalCount <= 8 ? 5 : 8)) * Math.PI * 2
          return {
            px: f.x + petalDist * Math.cos(pa),
            py: f.y + petalDist * Math.sin(pa),
          }
        })
        return (
          <g key={fi}>
            {petals.map((p, pi) => (
              <ellipse
                key={pi}
                cx={p.px}
                cy={p.py}
                rx={petalR * 0.55}
                ry={petalR * 0.8}
                fill={fi % 2 === 0 ? config.flowerColors[0] : config.flowerColors[1]}
                transform={`rotate(${((pi / petals.length) * 360) + (f.a * 180) / Math.PI}, ${p.px}, ${p.py})`}
                opacity="0.95"
              />
            ))}
            {/* Flower center */}
            <circle cx={f.x} cy={f.y} r="2.5" fill={config.centerColor} opacity="0.9" />
          </g>
        )
      })}

      {/* Inner empty circle (center of wreath) */}
      <circle cx={cx} cy={cy} r="24" fill={config.bgColor} />

      {/* Inner decorative ring */}
      <circle
        cx={cx}
        cy={cy}
        r="22"
        fill="none"
        stroke={config.flowerColors[1]}
        strokeWidth="0.8"
        strokeDasharray="3 2"
        opacity="0.4"
      />

      {/* Ribbon bow at bottom */}
      <ellipse cx={44} cy={90} rx="6" ry="3.5" fill={config.flowerColors[0]} opacity="0.8" transform="rotate(-20, 44, 90)" />
      <ellipse cx={56} cy={90} rx="6" ry="3.5" fill={config.flowerColors[0]} opacity="0.8" transform="rotate(20, 56, 90)" />
      <circle cx={50} cy={90} r="3" fill={config.flowerColors[1]} opacity="0.9" />
    </svg>
  )
}
