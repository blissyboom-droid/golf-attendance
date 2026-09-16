import type { Member, PracticeSession } from '../types'
import { BERRIES_PER_CLUSTER } from '../types'
import {
  filledBerries,
  isClusterComplete,
  practiceCountForMember,
} from '../stats'
import { GrapeCluster } from './GrapeCluster'

interface Props {
  members: Member[]
  practices: PracticeSession[]
  onAddPractice: (memberId: string) => void
  onUndoPractice: (memberId: string) => void
}

/**
 * The grape wall: one card per member showing their own grape cluster, a
 * `${filled} / 20` counter, and +1 / -1 controls. Each person sees their own
 * grape fill up as they log practice sessions.
 */
export function MemberGrapes({
  members,
  practices,
  onAddPractice,
  onUndoPractice,
}: Props) {
  return (
    <section className="card grape-wall">
      <h2>Grape Progress</h2>
      {members.length === 0 ? (
        <p className="empty">
          No members yet. Add a player, then log practices to grow their grape.
        </p>
      ) : (
        <div className="grape-grid">
          {members.map((m) => {
            const count = practiceCountForMember(practices, m.id)
            const filled = filledBerries(count)
            const complete = isClusterComplete(count)
            return (
              <div
                key={m.id}
                className={`grape-card${complete ? ' complete' : ''}`}
              >
                <div className="grape-card-head">
                  <span className="grape-name">{m.name}</span>
                  {complete && <span className="badge">Complete!</span>}
                </div>

                <GrapeCluster
                  filled={filled}
                  total={BERRIES_PER_CLUSTER}
                  glowing={complete}
                />

                <div className="grape-counter">
                  {filled} / {BERRIES_PER_CLUSTER}
                </div>

                <div className="grape-actions">
                  <button
                    className="btn primary"
                    onClick={() => onAddPractice(m.id)}
                  >
                    +1 practice
                  </button>
                  <button
                    className="btn undo"
                    onClick={() => onUndoPractice(m.id)}
                    disabled={count === 0}
                    aria-label={`Undo a practice for ${m.name}`}
                  >
                    −1
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
