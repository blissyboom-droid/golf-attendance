import { useId } from 'react'

interface Props {
  filled: number
  total: number
  glowing?: boolean
}

/**
 * A lush purple bunch of grapes drawn entirely in SVG (no bitmap images).
 *
 * The bunch shape comes ONLY from the berries themselves — there is no big
 * background silhouette shape behind them. The whole cluster is TILTED, leaning
 * like a real bunch hanging from a stem in the upper-left down to a point at
 * the lower-right.
 *
 * Layering / occlusion:
 *   - Every berry (decorative + earnable) is drawn with a FULLY OPAQUE fill and
 *     painted STRICTLY back-to-front, so each nearer berry cleanly and
 *     completely covers the ones behind it. A filled berry always reads as one
 *     clean solid berry with no other berry's outline showing on top of it.
 *   - A modest overlap lets the berries nestle together like a bunch without
 *     piling so heavily that hidden outlines poke through.
 *
 * Two kinds of berries:
 *   - Always-colored decorative BACK berries (never depend on `filled`) that
 *     sit deepest and darkest, so even at 0 earned the cluster already looks
 *     like a real (if darker) bunch.
 *   - Exactly 20 earnable FRONT berries. The first `filled` of them are painted
 *     with rich cartoon shading (volume gradient, inner shadow, bold white
 *     highlight); the rest render as light SOLID empty berries. They fill one
 *     at a time, from the deep top of the bunch toward the lower tip, as
 *     practices are logged.
 *
 * When `glowing` is true the whole cluster gets a soft pulsing glow via CSS
 * (`.grape-cluster.glowing`) plus the SVG glow filter, so the completion payoff
 * still triggers when all 20 earnable berries are filled.
 *
 * Everything is code-drawn vector art so it stays crisp at the ~240px hero
 * size. No visible number/counter is ever rendered — the goal stays secret.
 */

// Always-colored decorative BACK berries (never depend on `filled`). They sit
// deepest and darkest so the bunch already reads as a full shape at filled=0.
// Listed back-to-front (later entries are nearer / drawn on top).
const BACK_BERRIES: { cx: number; cy: number; r: number }[] = [
  { cx: 38, cy: 34, r: 9 },
  { cx: 52, cy: 30, r: 9.5 },
  { cx: 30, cy: 46, r: 9 },
  { cx: 46, cy: 44, r: 9.5 },
  { cx: 61, cy: 42, r: 9 },
  { cx: 40, cy: 58, r: 9 },
  { cx: 56, cy: 56, r: 9.5 },
  { cx: 71, cy: 54, r: 9 },
  { cx: 52, cy: 70, r: 9 },
  { cx: 68, cy: 68, r: 9 },
  { cx: 82, cy: 66, r: 8.5 },
  { cx: 64, cy: 82, r: 8.5 },
  { cx: 80, cy: 80, r: 8.5 },
  { cx: 76, cy: 94, r: 8 },
]

// Exactly 20 earnable FRONT berries in the 120x152 viewBox, forming a tilted
// bunch that leans from the upper-left down to a point at the lower-right.
// Listed AND filled back-to-front (top of the bunch first, tip last) so:
//   1. berries fill in a natural growing order as `filled` increases, and
//   2. later-drawn (nearer) berries cleanly occlude earlier (farther) ones,
//      fixing any bleed-through.
const FRONT_BERRIES: { cx: number; cy: number }[] = [
  // Top shoulder of the bunch (widest, upper-left)
  { cx: 45, cy: 38 },
  { cx: 59, cy: 36 },
  { cx: 72, cy: 40 },
  // Second diagonal band
  { cx: 38, cy: 51 },
  { cx: 52, cy: 49 },
  { cx: 66, cy: 50 },
  { cx: 79, cy: 52 },
  // Third band (mass leaning right)
  { cx: 47, cy: 63 },
  { cx: 61, cy: 62 },
  { cx: 75, cy: 64 },
  // Fourth band
  { cx: 55, cy: 75 },
  { cx: 69, cy: 76 },
  { cx: 83, cy: 78 },
  // Fifth band (narrowing, drifting lower-right)
  { cx: 63, cy: 88 },
  { cx: 77, cy: 90 },
  // Sixth band
  { cx: 70, cy: 101 },
  { cx: 84, cy: 103 },
  // Tapering toward the tip
  { cx: 77, cy: 114 },
  { cx: 84, cy: 126 },
  // Tip
  { cx: 82, cy: 138 },
]

const FRONT_RADIUS = 11

export function GrapeCluster({ filled, total, glowing }: Props) {
  // Unique ids so multiple <GrapeCluster/> instances never collide.
  const berryFill = useId()
  const berryShade = useId()
  const backBerryFill = useId()
  const leafFill = useId()
  const stemFill = useId()
  const glowId = useId()
  const shadowId = useId()

  // Render exactly the 20 earnable berries; clamp `filled` into range so a
  // stray out-of-range value can never paint more or fewer than the authored
  // positions. `total` (the goal, 20) is consumed here as an upper bound too,
  // so the drawing can never exceed the goal or the authored front positions.
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
            giving it a rounder, weightier feel. Opaque-safe: it only darkens
            the berry's own lower rim and never leaks past the berry circle. */}
        <radialGradient id={berryShade} cx="60%" cy="78%" r="70%">
          <stop offset="0%" stopColor="rgba(76, 29, 149, 0)" />
          <stop offset="72%" stopColor="rgba(76, 29, 149, 0)" />
          <stop offset="100%" stopColor="rgba(59, 20, 110, 0.55)" />
        </radialGradient>

        {/* BACK berries: darker, desaturated so they sit in shadow behind the
            front berries and read as depth. Always fully opaque. */}
        <radialGradient id={backBerryFill} cx="40%" cy="32%" r="80%">
          <stop offset="0%" stopColor="#8b6aa8" />
          <stop offset="45%" stopColor="#5f3f86" />
          <stop offset="100%" stopColor="#452b63" />
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

      {/* Soft cluster shadow for grounding, sitting under the tilted tip. */}
      <ellipse cx="78" cy="146" rx="30" ry="6" fill={`url(#${shadowId})`} />

      {/* Tapered, textured brown stem entering from the upper-left, curving
          into the top-left shoulder of the tilted bunch. */}
      <path
        d="M20 6 C24 14 30 22 38 28 C40 30 43 30 45 28 C43 22 36 14 24 4 Z"
        fill={`url(#${stemFill})`}
        stroke="#4a3317"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Stem highlight streak. */}
      <path
        d="M23 8 C28 15 33 21 40 26"
        stroke="rgba(255, 236, 200, 0.5)"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cartoon leaf tucked at the upper-left above the bunch shoulder. */}
      <path
        d="M24 8 C16 -2 -2 -2 -4 10 C-5 17 2 22 12 21 C24 20 30 12 30 6 Z"
        fill={`url(#${leafFill})`}
        stroke="#166534"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Leaf midrib. */}
      <path
        d="M27 8 C18 8 8 10 -2 12"
        stroke="#14532d"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaf side veins. */}
      <path
        d="M20 8.6 C17.4 6.6 14.6 5.4 12 4.8 M14 10.4 C11.4 8.8 8.6 7.8 6 7.6 M8 12.2 C5.6 11.2 3.2 10.8 1 10.8"
        stroke="#15803d"
        strokeWidth="0.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* ---- Always-colored decorative BACK berries (never depend on
          `filled`). Drawn first (deepest) and fully opaque so the earnable
          berries painted afterward cleanly cover them. ---- */}
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

      {/* ---- 20 earnable FRONT berries, painted back-to-front (array order)
          so each nearer berry fully occludes the ones behind it. ---- */}
      <g filter={glowing ? `url(#${glowId})` : undefined}>
        {FRONT_BERRIES.map((pos, i) => {
          const isFilled = i < painted
          if (!isFilled) {
            // Empty state: light SOLID (opaque) fill + thin SOLID outline so it
            // is clearly distinguishable from a painted berry yet never reads
            // as another berry's edge showing through. Because it is opaque and
            // drawn in depth order, any nearer berry fully covers it.
            return (
              <g key={i}>
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={FRONT_RADIUS}
                  fill="#ece7f2"
                  stroke="var(--grape-empty, #c4b5d4)"
                  strokeWidth={1.2}
                />
                {/* Subtle highlight so empty berries still read as round. */}
                <ellipse
                  cx={pos.cx - 3.2}
                  cy={pos.cy - 3.8}
                  rx={2.6}
                  ry={1.7}
                  fill="#ffffff"
                  transform={`rotate(-32 ${pos.cx - 3.2} ${pos.cy - 3.8})`}
                />
              </g>
            )
          }
          return (
            <g key={i}>
              {/* Base painted berry with volume gradient (opaque). */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={FRONT_RADIUS}
                fill={`url(#${berryFill})`}
                stroke="var(--grape-dark, #6b21a8)"
                strokeWidth={0.6}
              />
              {/* Lower-edge inner shadow for roundness (stays within the
                  berry, so it never bleeds over neighbors). */}
              <circle
                cx={pos.cx}
                cy={pos.cy}
                r={FRONT_RADIUS}
                fill={`url(#${berryShade})`}
              />
              {/* Bold primary specular highlight streak. */}
              <ellipse
                cx={pos.cx - 3.1}
                cy={pos.cy - 3.7}
                rx={3.6}
                ry={2.3}
                fill="rgba(255, 255, 255, 0.85)"
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
