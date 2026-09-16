import { useId } from 'react'

interface Props {
  filled: number
  total: number
  glowing?: boolean
}

/**
 * A classic purple grape cluster drawn entirely in SVG (no bitmap images).
 * Exactly `total` berries are laid out in a natural staggered pyramid. The
 * first `filled` berries are painted with a rich, illustrated cartoon-style
 * shading (layered gradient, soft inner shadow, and specular highlights); the
 * rest render as clean dashed outlines. When `glowing` is true the whole
 * cluster gets a soft pulsing glow via CSS.
 *
 * The berry layout is a fixed pyramid of rows summing to 20 (the default
 * cluster size). If a different `total` is passed we still walk the same
 * positions and simply render as many berries as requested.
 *
 * Everything is code-drawn vector art so it stays crisp when displayed as a
 * single large hero grape.
 */

// Staggered rows forming a downward-pointing cluster (widest at top),
// coordinates in the 120x148 viewBox. Ordered top -> bottom, left -> right
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
  // Unique ids so multiple <GrapeCluster/> instances never collide.
  const berryFill = useId()
  const berryShade = useId()
  const leafFill = useId()
  const stemFill = useId()
  const glowId = useId()
  const shadowId = useId()

  const positions = BERRY_POSITIONS.slice(0, total)

  return (
    <svg
      className={`grape-cluster${glowing ? ' glowing' : ''}`}
      viewBox="0 0 120 152"
      role="img"
      aria-label={`Grape cluster: ${filled} of ${total} berries filled`}
    >
      <defs>
        {/* Main berry body: bright top-left highlight fading into a deep,
            saturated purple core and a darker rim for volume. */}
        <radialGradient id={berryFill} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="22%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="var(--grape, #7e22ce)" />
          <stop offset="100%" stopColor="var(--grape-dark, #6b21a8)" />
        </radialGradient>

        {/* Soft inner shadow overlay for the lower edge of each berry, giving
            it a rounder, weightier feel. */}
        <radialGradient id={berryShade} cx="60%" cy="78%" r="70%">
          <stop offset="0%" stopColor="rgba(76, 29, 149, 0)" />
          <stop offset="72%" stopColor="rgba(76, 29, 149, 0)" />
          <stop offset="100%" stopColor="rgba(59, 20, 110, 0.55)" />
        </radialGradient>

        {/* Two-tone cartoon leaf gradient. */}
        <linearGradient id={leafFill} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="55%" stopColor="#22c55e" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>

        {/* Tapered stem gradient with a woody highlight. */}
        <linearGradient id={stemFill} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#5b3f1e" />
          <stop offset="45%" stopColor="#8a6636" />
          <stop offset="100%" stopColor="#6b4a23" />
        </linearGradient>

        <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft grounding shadow behind the cluster. */}
        <radialGradient id={shadowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(59, 20, 110, 0.28)" />
          <stop offset="100%" stopColor="rgba(59, 20, 110, 0)" />
        </radialGradient>
      </defs>

      {/* Soft cluster shadow for grounding. */}
      <ellipse cx="60" cy="146" rx="34" ry="6" fill={`url(#${shadowId})`} />

      {/* Tapered, textured brown stem. */}
      <path
        d="M58.4 3 C58 12 58.6 21 59.6 29 L61.6 29 C62.4 21 62.6 12 61.6 3 Z"
        fill={`url(#${stemFill})`}
        stroke="#4a3317"
        strokeWidth="0.6"
      />
      {/* Stem highlight streak. */}
      <path
        d="M59.4 5 C59 13 59.4 21 60 28"
        stroke="rgba(255, 236, 200, 0.5)"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cartoon leaf with a smooth outline. */}
      <path
        d="M60 13 C68 1 88 -1 96 9 C99 15 96 22 88 25 C76 29 63 24 59 19 Z"
        fill={`url(#${leafFill})`}
        stroke="#166534"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Leaf midrib. */}
      <path
        d="M60.5 18 C70 15 80 12 92 11"
        stroke="#14532d"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaf side veins. */}
      <path
        d="M68 16.4 C70 13.6 72 11.6 74 10.4 M76 14.6 C78 12.4 80 11 82 10.2 M84 12.8 C85.6 11.4 87.4 10.6 89 10.4"
        stroke="#15803d"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Berries */}
      <g filter={glowing ? `url(#${glowId})` : undefined}>
        {positions.map((pos, i) => {
          const isFilled = i < filled
          if (!isFilled) {
            return (
              <circle
                key={i}
                cx={pos.cx}
                cy={pos.cy}
                r={BERRY_RADIUS}
                fill="none"
                stroke="var(--grape-empty, #c4b5d4)"
                strokeWidth={1.4}
                strokeDasharray="3 2"
              />
            )
          }
          return (
            <g key={i}>
              {/* Base painted berry with volume gradient. */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={BERRY_RADIUS}
                fill={`url(#${berryFill})`}
                stroke="var(--grape-dark, #6b21a8)"
                strokeWidth={0.6}
              />
              {/* Lower-edge inner shadow for roundness. */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={BERRY_RADIUS}
                fill={`url(#${berryShade})`}
              />
              {/* Primary specular highlight. */}
              <ellipse
                cx={pos.cx - 2.6}
                cy={pos.cy - 3.1}
                rx={2.6}
                ry={1.8}
                fill="rgba(255, 255, 255, 0.65)"
                transform={`rotate(-32 ${pos.cx - 2.6} ${pos.cy - 3.1})`}
              />
              {/* Subtle secondary highlight near the rim. */}
              <circle
                cx={pos.cx + 3}
                cy={pos.cy + 3.4}
                r={1}
                fill="rgba(233, 213, 255, 0.5)"
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
