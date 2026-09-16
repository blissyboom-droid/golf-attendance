import type { Member, PracticeSession } from '../types'
import { monthlyRanking } from '../stats'

interface Props {
  members: Member[]
  practices: PracticeSession[]
}

const MEDALS = ['🥇', '🥈', '🥉']

/**
 * Monthly ranking chart: sorts members by how many practice sessions fall in
 * the current calendar month and shows them with a rank/medal + count.
 */
export function Leaderboard({ members, practices }: Props) {
  const now = new Date()
  const monthLabel = now.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })
  const ranking = monthlyRanking(practices, members, now)
  const anyPractices = ranking.some((r) => r.count > 0)

  return (
    <section className="card">
      <h2>Monthly Ranking</h2>
      <p className="muted leaderboard-month">{monthLabel}</p>

      {members.length === 0 || !anyPractices ? (
        <p className="empty">
          No practices logged this month yet. Tap “+1 practice” to climb the
          board!
        </p>
      ) : (
        <ol className="leaderboard">
          {ranking.map((row, i) => (
            <li key={row.member.id} className="leaderboard-row">
              <span className="rank">{MEDALS[i] ?? `#${i + 1}`}</span>
              <span className="rank-name">{row.member.name}</span>
              <span className="rank-count">
                {row.count} {row.count === 1 ? 'practice' : 'practices'}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
