import { BERRIES_PER_CLUSTER } from './types'
import type { Member, PracticeSession } from './types'

/**
 * Pure helpers for turning practice sessions into grape-cluster progress and
 * the monthly leaderboard. All functions are side-effect free.
 *
 * "Past 20" behavior: once a member logs BERRIES_PER_CLUSTER (20) sessions the
 * grape cluster is considered full and stays full + glowing. Additional
 * sessions beyond 20 do NOT reset the cluster to a new empty one; they keep
 * counting toward practiceCountForMember and the monthly ranking. filledBerries
 * caps the number of *rendered* berries at 20, while the raw count keeps
 * growing for ranking purposes.
 */

/** Total number of sessions logged for a member. */
export function practiceCountForMember(
  practices: PracticeSession[],
  memberId: string,
): number {
  return practices.reduce(
    (total, p) => (p.memberId === memberId ? total + 1 : total),
    0,
  )
}

/**
 * Number of berries to render as filled, capped at BERRIES_PER_CLUSTER.
 * See the "past 20" note above: the count keeps growing but the grape only
 * ever shows 20 filled berries.
 */
export function filledBerries(count: number): number {
  return Math.min(count, BERRIES_PER_CLUSTER)
}

/**
 * Whether the cluster is complete (full + glowing). Stays true for any count
 * at or above BERRIES_PER_CLUSTER; it never resets.
 */
export function isClusterComplete(count: number): boolean {
  return count >= BERRIES_PER_CLUSTER
}

/**
 * Whether the member already logged a practice on the same LOCAL calendar day
 * as `ref`. Uses local (not UTC) year/month/day parts so the "once per day"
 * limit follows the user's own clock; stored dates are full UTC ISO strings so
 * we parse each via `new Date(...)` rather than comparing ISO prefixes.
 */
export function practicedToday(
  practices: PracticeSession[],
  memberId: string,
  ref: Date = new Date(),
): boolean {
  const refYear = ref.getFullYear()
  const refMonth = ref.getMonth()
  const refDay = ref.getDate()

  return practices.some((p) => {
    if (p.memberId !== memberId) return false
    const d = new Date(p.date)
    return (
      d.getFullYear() === refYear &&
      d.getMonth() === refMonth &&
      d.getDate() === refDay
    )
  })
}

/**
 * Rank members by how many sessions fall in the calendar month of refDate.
 * A session counts when its date is in the same year AND month as refDate.
 * All members are included (even with a 0 count) for completeness, sorted by
 * count descending.
 */
export function monthlyRanking(
  practices: PracticeSession[],
  members: Member[],
  refDate: Date = new Date(),
): { member: Member; count: number }[] {
  const refYear = refDate.getFullYear()
  const refMonth = refDate.getMonth()

  const counts = new Map<string, number>()
  for (const p of practices) {
    const d = new Date(p.date)
    if (d.getFullYear() === refYear && d.getMonth() === refMonth) {
      counts.set(p.memberId, (counts.get(p.memberId) ?? 0) + 1)
    }
  }

  return members
    .map((member) => ({ member, count: counts.get(member.id) ?? 0 }))
    .sort((a, b) => b.count - a.count)
}
