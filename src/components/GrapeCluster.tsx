import { useId } from 'react'

interface Props {
  filled: number
  total: number
  glowing?: boolean
}

/**
 * A lush purple bunch of grapes drawn entirely in SVG (no bitmap images).
 *
 * The drawing is layered so it always reads as a complete, full bunch:
 *   1. A soft desaturated SILHOUETTE / underdrawing shaped like a real
 *      rounded-triangular cluster (wider at the top, tapering to a point).
 *   2. A fixed set of always-colored BACK berries painted slightly darker and
 *      desaturated for depth. These sit behind and between the front berries
 *      and NEVER depend on `filled`, so even at 0 earned the cluster looks
 *      like a real (if lighter) bunch.
 *   3. Exactly 20 earnable FRONT berries. The first `filled` of them are
 *      painted with rich cartoon shading (volume gradient, inner shadow,
 *      specular highlight); the rest render as faint outlines. They fill one
 *      at a time, top -> bottom / left -> right, as practices are logged.
 *
 * When `glowing` is true the whole cluster gets a soft pulsing glow via CSS
 * (`.grape-cluster.glowing`) plus the SVG glow filter, so the completion
 * payoff still triggers when all 20 front berries are filled.
 *
 * Everything is code-drawn vector art so it stays crisp at the ~240px hero
 * size. No visible number/counter is ever rendered — the goal stays secret.
 */

// Exactly 20 hand-authored FRONT-berry positions in the 120x152 viewBox.
// They overlap each other (and the back berries) to form a natural
// rounded-triangular bunch, widest at the top and tapering to a point at the
// bottom. Ordered top -> bottom, left -> right so they fill in a natural
// growing order as `filled` increases. Larger radius than the old sparse grid
// so the berries nestle together into a lush cluster.
const FRONT_BERRIES: { cx: number; cy: number }[] = [
  // Row 1 (widest) — 4 berries
  { cx: 40, cy: 48 },
  { cx: 54, cy: 46 },
  { cx: 68, cy: 46 },
  { cx: 82, cy: 48 },
  // Row 2 — 4 berries (offset to nestle in the gaps above)
  { cx: 33, cy: 62 },
  { cx: 47, cy: 62 },
  { cx: 61, cy: 62 },
  { cx: 75, cy: 62 },
  // Row 3 — 3 berries
  { cx: 41, cy: 77 },
  { cx: 55, cy: 78 },
  { cx: 69, cy: 77 },
  // Row 4 — 3 berries
  { cx: 34, cy: 91 },
  { cx: 48, cy: 92 },
  { cx: 62, cy: 91 },
  // Row 5 — 2 berries
  { cx: 43, cy: 105 },
  { cx: 57, cy: 105 },
  // Row 6 — 2 berries
  { cx: 48, cy: 118 },
  { cx: 62, cy: 118 },
  // Row 7 — 1 berry
  { cx: 55, cy: 130 },
  // Row 8 (tip) — 1 berry
  { cx: 58, cy: 141 },
]

// Always-colored BACK berries (never depend on `filled`) that peek out from
// behind and between the front berries to give the bunch depth. Painted with a
// darker, desaturated gradient so they read as being in shadow.
const BACK_BERRIES: { cx: number; cy: number; r: number }[] = [
  { cx: 47, cy: 53, r: 10 },
  { cx: 61, cy: 53, r: 10 },
  { cx: 75, cy: 54, r: 9.5 },
  { cx: 40, cy: 70, r: 10 },
  { cx: 54, cy: 70, r: 10 },
  { cx: 68, cy: 70, r: 10 },
  { cx: 48, cy: 84, r: 9.5 },
  { cx: 62, cy: 84, r: 9.5 },
  { cx: 41, cy: 99, r: 9 },
  { cx: 55, cy: 99, r: 9 },
  { cx: 50, cy: 112, r: 8.5 },
  { cx: 55, cy: 124, r: 8 },
]

const FRONT_RADIUS = 11

export function GrapeCluster({ filled, total, glowing }: Props) {
  // Unique ids so multiple <GrapeCluster/> instances never collide.
  const berryFill = useId()
  const berryShade = useId()
  const backBerryFill = useId()
  const silhouetteFill = useId()
  const leafFill = useId()
  const stemFill = useId()
  const glowId = useId()
  const shadowId = useId()

  // Render exactly the 20 front berries; clamp `filled` into range so a stray
  // out-of-range value can never paint more or fewer than the authored
  // positions. `total` (the goal, 20) is read here as an upper bound too, so
  // the drawing can never exceed the goal or the 20 authored front positions.
  const painted = Math.max(0, Math.min(filled, total, FRONT_BERRIES.length))

  return (
    <svg
      className={`grape-cluster${glowing ? ' glowing' : ''}`}
      viewBox="0 0 120 152"
      role="img"
      aria-label="Grape cluster"
    >
      <defs>
        {/* Main FRONT berry body: bright top-left highlight fading into a
            deep, saturated purple core and a darker rim for volume. */}
        <radialGradient id={berryFill} cx="36%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#e9d5ff" />
          <stop offset="22%" stopColor="#c084fc" />
          <stop offset="60%" stopColor="var(--grape, #7e22ce)" />
          <stop offset="100%" stopColor="var(--grape-dark, #6b21a8)" />
        </radialGradient>

        {/* Soft inner shadow overlay for the lower edge of each front berry,
            giving it a rounder, weightier feel. */}
        <radialGradient id={berryShade} cx="60%" cy="78%" r="70%">
          <stop offset="0%" stopColor="rgba(76, 29, 149, 0)" />
          <stop offset="72%" stopColor="rgba(76, 29, 149, 0)" />
          <stop offset="100%" stopColor="rgba(59, 20, 110, 0.55)" />
        </radialGradient>

        {/* BACK berries: darker, desaturated so they sit in shadow behind the
            front berries and read as depth. Always colored. */}
        <radialGradient id={backBerryFill} cx="40%" cy="32%" r="80%">
          <stop offset="0%" stopColor="#8b6aa8" />
          <stop offset="45%" stopColor="#5f3f86" />
          <stop offset="100%" stopColor="#452b63" />
        </radialGradient>

        {/* Soft desaturated purple SILHOUETTE / underdrawing so a full-bunch
            outline is always visible, even before any berry is earned. */}
        <radialGradient id={silhouetteFill} cx="50%" cy="34%" r="72%">
          <stop offset="0%" stopColor="#7d5c9e" />
          <stop offset="100%" stopColor="#4a2f6b" />
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
      <ellipse cx="60" cy="148" rx="34" ry="6" fill={`url(#${shadowId})`} />

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

      {/* ---- Fixed decorative BACK layer (never depends on `filled`) ---- */}

      {/* Full-bunch silhouette / underdrawing: rounded-triangular, wider at
          the top and tapering to a point at the bottom. Always visible. */}
      <path
        d="M60 30
           C40 30 26 38 26 52
           C26 62 30 68 36 74
           C30 80 30 90 37 98
           C33 106 36 116 44 122
           C44 130 50 138 60 145
           C70 138 76 130 76 122
           C84 116 87 106 83 98
           C90 90 90 80 84 74
           C90 68 94 62 94 52
           C94 38 80 30 60 30 Z"
        fill={`url(#${silhouetteFill})`}
        opacity="0.9"
      />

      {/* Always-colored back berries for depth. */}
      <g>
        {BACK_BERRIES.map((b, i) => (
          <g key={`back-${i}`}>
            <circle
              cx={b.cx}
              cy={b.cy}
              r={b.r}
              fill={`url(#${backBerryFill})`}
              stroke="#3b1f5a"
              strokeWidth={0.5}
            />
            {/* Faint highlight so back berries still read as round. */}
            <ellipse
              cx={b.cx - b.r * 0.28}
              cy={b.cy - b.r * 0.32}
              rx={b.r * 0.2}
              ry={b.r * 0.14}
              fill="rgba(233, 213, 255, 0.28)"
            />
          </g>
        ))}
      </g>

      {/* ---- 20 earnable FRONT berries ---- */}
      <g filter={glowing ? `url(#${glowId})` : undefined}>
        {FRONT_BERRIES.map((pos, i) => {
          const isFilled = i < painted
          if (!isFilled) {
            // Faint empty state: light fill + thin dashed outline, clearly
            // distinguishable from a painted berry, with no text.
            return (
              <circle
                key={i}
                cx={pos.cx}
                cy={pos.cy}
                r={FRONT_RADIUS}
                fill="rgba(196, 181, 212, 0.28)"
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
                r={FRONT_RADIUS}
                fill={`url(#${berryFill})`}
                stroke="var(--grape-dark, #6b21a8)"
                strokeWidth={0.6}
              />
              {/* Lower-edge inner shadow for roundness. */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={FRONT_RADIUS}
                fill={`url(#${berryShade})`}
              />
              {/* Primary specular highlight. */}
              <ellipse
                cx={pos.cx - 3.1}
                cy={pos.cy - 3.7}
                rx={3.1}
                ry={2.1}
                fill="rgba(255, 255, 255, 0.65)"
                transform={`rotate(-32 ${pos.cx - 3.1} ${pos.cy - 3.7})`}
              />
              {/* Subtle secondary highlight near the rim. */}
              <circle
                cx={pos.cx + 3.6}
                cy={pos.cy + 4}
                r={1.2}
                fill="rgba(233, 213, 255, 0.5)"
              />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
