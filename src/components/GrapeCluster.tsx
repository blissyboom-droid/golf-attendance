import { useId } from 'react'

interface Props {
  filled: number
  total: number
  glowing?: boolean
}

/**
 * A classic purple grape cluster drawn entirely in SVG (no bitmap images).
 * Exactly `total` berries are laid out in a natural staggered pyramid. The
 * first `filled` berries are painted rich purple with a highlight; the rest
 * render as empty outlines. When `glowing` is true the whole cluster gets a
 * soft pulsing glow via CSS.
 *
 * The berry layout is a fixed pyramid of rows summing to 20 (the default
 * cluster size). If a different `total` is passed we still walk the same
 * positions and simply render as many berries as requested.
 */

// Staggered rows forming a downward-pointing cluster (widest at top),
// coordinates in the 100x120 viewBox. Ordered top -> bottom, left -> right
// so berries fill in a natural reading/growing order.
const BERRY_POSITIONS: { cx: number; cy: number }[] = (() => {
  // Rows form a downward-pointing cluster (widest at top). Each row is
  // horizontally offset by half a spacing from its neighbour so berries
  // nestle in the gaps rather than stacking directly on top of each other.
  const rows = [
    { count: 5, y: 40 },
    { count: 4, y: 58 },
    { count: 4, y: 76 },
    { count: 3, y: 94 },
    { count: 2, y: 112 },
    { count: 2, y: 130 },
  ]
  const spacing = 21
  const points: { cx: number; cy: number }[] = []
  for (const row of rows) {
    const rowWidth = (row.count - 1) * spacing
    const startX = 60 - rowWidth / 2
    for (let i = 0; i < row.count; i++) {
      points.push({ cx: startX + i * spacing, cy: row.y })
    }
  }
  return points
})()

const BERRY_RADIUS = 9

export function GrapeCluster({ filled, total, glowing }: Props) {
  const gradientId = useId()
  const glowId = useId()
  const positions = BERRY_POSITIONS.slice(0, total)

  return (
    <svg
      className={`grape-cluster${glowing ? ' glowing' : ''}`}
      viewBox="0 0 120 148"
      role="img"
      aria-label={`Grape cluster: ${filled} of ${total} berries filled`}
    >
      <defs>
        <radialGradient id={gradientId} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="55%" stopColor="var(--grape, #7e22ce)" />
          <stop offset="100%" stopColor="var(--grape-dark, #6b21a8)" />
        </radialGradient>
        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Brown stem */}
      <path
        d="M60 4 C60 14 60 22 60 30"
        stroke="#7c5a2e"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />

      {/* Green leaf */}
      <path
        d="M60 12 C70 2 88 2 94 12 C88 20 72 22 60 20 Z"
        fill="#16a34a"
        stroke="#15803d"
        strokeWidth="1"
      />
      <path
        d="M62 16 C72 12 82 10 92 12"
        stroke="#15803d"
        strokeWidth="0.8"
        fill="none"
      />

      {/* Berries */}
      <g filter={glowing ? `url(#${glowId})` : undefined}>
        {positions.map((pos, i) => {
          const isFilled = i < filled
          return (
            <g key={i}>
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={BERRY_RADIUS}
                fill={isFilled ? `url(#${gradientId})` : 'none'}
                stroke={isFilled ? 'var(--grape-dark, #6b21a8)' : 'var(--grape-empty, #c4b5d4)'}
                strokeWidth={isFilled ? 0.6 : 1.4}
                strokeDasharray={isFilled ? undefined : '3 2'}
              />
              {isFilled && (
                <ellipse
                  cx={pos.cx - 2.4}
                  cy={pos.cy - 2.8}
                  rx={2.4}
                  ry={1.7}
                  fill="rgba(255,255,255,0.55)"
                />
              )}
            </g>
          )
        })}
      </g>
    </svg>
  )
}
