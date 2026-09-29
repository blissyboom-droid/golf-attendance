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
// They ride just OUTSIDE / behind the front berries around the bunch outline so
// a generous arc of each one peeks out (every back berry stays ~33-85% visible)
// rather than being buried in an interior gap. This adds depth and fullness and
// keeps the tilted-bunch silhouette reading as one bunch even at filled=0.
const BACK_BERRIES: { cx: number; cy: number; r: number }[] = [
  { cx: 49, cy: 37, r: 9.5 },
  { cx: 70, cy: 36, r: 9.5 },
  { cx: 26, cy: 74, r: 9.5 },
  { cx: 36, cy: 94, r: 9.5 },
  { cx: 111, cy: 73, r: 9.5 },
  { cx: 114, cy: 95, r: 9.5 },
  { cx: 111, cy: 113, r: 9.5 },
  { cx: 23, cy: 56, r: 9 },
  { cx: 58, cy: 113, r: 9.5 },
  { cx: 71, cy: 130, r: 9.5 },
  { cx: 117, cy: 131, r: 9 },
  { cx: 82, cy: 149, r: 9 },
  { cx: 111, cy: 151, r: 9 },
  { cx: 89, cy: 168, r: 8.5 },
]

// Exactly 20 earnable FRONT berries in the 150x190 viewBox, forming a tilted
// bunch that leans from the upper-left shoulder down to a point at the
// lower-right. Centers are spaced roughly ~20px apart (>= 1.6 * FRONT_RADIUS)
// so adjacent berries only lightly touch: every berry stays about 81-100%
// visible, with no berry buried behind a nearer neighbor.
// Listed AND filled back-to-front (top of the bunch first, tip last) so:
//   1. berries fill in a natural growing order as `filled` increases, and
//   2. later-drawn (nearer) berries cleanly occlude earlier (farther) ones,
//      fixing any bleed-through.
const FRONT_BERRIES: { cx: number; cy: number }[] = [
  // Band 1 — top shoulder of the bunch (upper-left)
  { cx: 40, cy: 46 },
  { cx: 61, cy: 44 },
  { cx: 83, cy: 46 },
  // Band 2 (drifting down and right)
  { cx: 34, cy: 64 },
  { cx: 55, cy: 62 },
  { cx: 75, cy: 62 },
  { cx: 97, cy: 66 },
  // Band 3 (widest mass, leaning right)
  { cx: 44, cy: 81 },
  { cx: 65, cy: 80 },
  { cx: 86, cy: 82 },
  { cx: 107, cy: 84 },
  // Band 4
  { cx: 57, cy: 99 },
  { cx: 78, cy: 99 },
  { cx: 99, cy: 101 },
  // Band 5 (narrowing, drifting lower-right)
  { cx: 70, cy: 117 },
  { cx: 91, cy: 118 },
  // Band 6
  { cx: 83, cy: 135 },
  { cx: 104, cy: 136 },
  // Single-file tail toward the tip
  { cx: 96, cy: 153 },
  // Tip
  { cx: 101, cy: 171 },
]

const FRONT_RADIUS = 12

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
      viewBox="0 0 150 190"
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
      <ellipse cx="101" cy="185" rx="30" ry="6" fill={`url(#${shadowId})`} />

      {/* Tapered, textured brown stem entering from the top, curving into the
          upper-left shoulder of the tilted bunch. All coords are >= 0. */}
      <path
        d="M30 8 C34 16 40 24 48 30 C50 32 53 32 55 30 C53 24 46 16 34 6 Z"
        fill={`url(#${stemFill})`}
        stroke="#4a3317"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />
      {/* Stem highlight streak. */}
      <path
        d="M33 10 C38 17 43 23 50 28"
        stroke="rgba(255, 236, 200, 0.5)"
        strokeWidth="0.7"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cartoon leaf tucked at the upper-left above the bunch shoulder.
          Shifted fully inside the viewBox (no negative coords). */}
      <path
        d="M34 10 C26 0 8 0 6 12 C5 19 12 24 22 23 C34 22 40 14 40 8 Z"
        fill={`url(#${leafFill})`}
        stroke="#166534"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      {/* Leaf midrib. */}
      <path
        d="M37 10 C28 10 18 12 8 14"
        stroke="#14532d"
        strokeWidth="1"
        strokeLinecap="round"
        fill="none"
      />
      {/* Leaf side veins. */}
      <path
        d="M30 10.6 C27.4 8.6 24.6 7.4 22 6.8 M24 12.4 C21.4 10.8 18.6 9.8 16 9.6 M18 14.2 C15.6 13.2 13.2 12.8 11 12.8"
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
