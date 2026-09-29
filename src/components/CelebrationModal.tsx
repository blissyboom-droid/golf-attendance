import { useId } from 'react'

interface Props {
  /** Stable member id used to pick a deterministic quote (unique per member). */
  memberId: string
  /** Member's display name (may collide across members; shown, not keyed on). */
  memberName: string
  onClose: () => void
}

/**
 * Modal shown when a member fills all 20 berries. Displays their name, an
 * inspirational quote, and a code-drawn SVG celebration (a glowing trophy with
 * confetti and sparkle rays). No bitmap images are used.
 */

const QUOTES: string[] = [
  '"The more I practice, the luckier I get." — Gary Player',
  '"Success is the sum of small efforts repeated day in and day out."',
  '"Persistence can change failure into extraordinary achievement." — Matt Biondi',
  '"The harder you work, the harder it is to surrender." — Vince Lombardi',
  '"Golf is a game of inches; the most important are between your ears." — Bobby Jones',
  '"It always seems impossible until it is done." — Nelson Mandela',
  '"Champions keep playing until they get it right." — Billie Jean King',
]

function pickQuote(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return QUOTES[Math.abs(hash) % QUOTES.length]
}

export function CelebrationModal({ memberId, memberName, onClose }: Props) {
  const glowId = useId()
  const cupId = useId()
  // Seed the quote by the stable member id so members sharing a display name
  // still get their own deterministic quote instead of colliding.
  const quote = pickQuote(memberId)

  const confettiColors = ['#7e22ce', '#16a34a', '#d97706', '#dc2626', '#0ea5e9']

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={`${memberName} completed a grape cluster`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn ghost modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>

        <svg
          className="celebration-art"
          viewBox="0 0 200 160"
          role="img"
          aria-label="Celebration trophy with confetti"
        >
          <defs>
            <radialGradient id={cupId} cx="40%" cy="30%" r="75%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="60%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
            <filter id={glowId} x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Sparkle rays behind the trophy */}
          <g stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
            <line x1="100" y1="10" x2="100" y2="26" />
            <line x1="60" y1="20" x2="70" y2="34" />
            <line x1="140" y1="20" x2="130" y2="34" />
            <line x1="40" y1="55" x2="56" y2="60" />
            <line x1="160" y1="55" x2="144" y2="60" />
          </g>

          {/* Confetti dots */}
          {Array.from({ length: 14 }).map((_, i) => {
            const x = 12 + ((i * 37) % 176)
            const y = 12 + ((i * 53) % 130)
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r={i % 3 === 0 ? 3 : 2}
                fill={confettiColors[i % confettiColors.length]}
                opacity={0.85}
              />
            )
          })}

          {/* Trophy */}
          <g filter={`url(#${glowId})`}>
            {/* Cup body */}
            <path
              d="M74 44 H126 V64 C126 82 114 94 100 94 C86 94 74 82 74 64 Z"
              fill={`url(#${cupId})`}
              stroke="#92400e"
              strokeWidth="1.5"
            />
            {/* Handles */}
            <path
              d="M74 48 C62 48 60 66 74 70"
              fill="none"
              stroke="#b45309"
              strokeWidth="3"
            />
            <path
              d="M126 48 C138 48 140 66 126 70"
              fill="none"
              stroke="#b45309"
              strokeWidth="3"
            />
            {/* Stem + base */}
            <rect x="96" y="94" width="8" height="14" fill="#b45309" />
            <rect x="82" y="108" width="36" height="7" rx="2" fill="#92400e" />
            <rect x="76" y="115" width="48" height="8" rx="2" fill="#78350f" />
            {/* Star on cup */}
            <path
              d="M100 54 l3 6 6 1 -4.5 4.5 1 6 -5.5 -3 -5.5 3 1 -6 -4.5 -4.5 6 -1 Z"
              fill="#fff7ed"
              opacity="0.9"
            />
          </g>
        </svg>

        <h2 className="celebration-title">
          🎉 {memberName} filled a full grape cluster!
        </h2>
        <p className="celebration-quote">{quote}</p>
        <button className="btn primary" onClick={onClose}>
          Keep going
        </button>
      </div>
    </div>
  )
}
