import type { Member, PracticeSession } from '../types'
import { BERRIES_PER_CLUSTER } from '../types'
import {
  filledBerries,
  isClusterComplete,
  practiceCountForMember,
} from '../stats'
import { GrapeCluster } from './GrapeCluster'

interface Props {
  member: Member
  practices: PracticeSession[]
  onAddPractice: (memberId: string) => void
  onUndoPractice: (memberId: string) => void
  onSwitch: () => void
}

/**
 * The single-current-user grape view: one large grape cluster for the current
 * member with their `${filled} / 20` counter and +1 / -1 controls. Because only
 * the current user's own buttons are shown, there is no way to accidentally
 * edit someone else's grape. A ghost "switch person" button returns to the
 * picker.
 */
export function MyGrape({
  member,
  practices,
  onAddPractice,
  onUndoPractice,
  onSwitch,
}: Props) {
  const count = practiceCountForMember(practices, member.id)
  const filled = filledBerries(count)
  const complete = isClusterComplete(count)

  return (
    <section className={`card my-grape${complete ? ' complete' : ''}`}>
      <div className="my-grape-head">
        <span className="grape-name">{member.name}</span>
        {complete && <span className="badge">Complete!</span>}
        <button
          type="button"
          className="btn ghost my-grape-switch"
          onClick={onSwitch}
        >
          다른 사람 선택 / Switch person
        </button>
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
          onClick={() => onAddPractice(member.id)}
        >
          +1 practice
        </button>
        <button
          className="btn undo"
          onClick={() => onUndoPractice(member.id)}
          disabled={count === 0}
          aria-label={`Undo a practice for ${member.name}`}
        >
          −1
        </button>
      </div>
    </section>
  )
}
