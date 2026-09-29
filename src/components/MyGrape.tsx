import type { Member, PracticeSession } from '../types'
import { BERRIES_PER_CLUSTER } from '../types'
import {
  filledBerries,
  isClusterComplete,
  practiceCountForMember,
  practicedToday,
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
 * member with +1 / -1 controls. There is no visible progress counter or goal —
 * the grape quietly fills as practices are logged and the reward stays a
 * surprise. Because only the current user's own buttons are shown, there is no
 * way to accidentally edit someone else's grape. A ghost "switch person" button
 * returns to the picker.
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
  const alreadyToday = practicedToday(practices, member.id)

  return (
    <section className={`card my-grape${complete ? ' complete' : ''}`}>
      <div className="my-grape-head">
        <span className="grape-name">{member.name}</span>
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

      <div className="grape-actions">
        <button
          className="btn primary"
          onClick={() => {
            if (!practicedToday(practices, member.id)) onAddPractice(member.id)
          }}
          disabled={alreadyToday}
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

      {alreadyToday && (
        <p className="grape-daily-note">
          오늘은 이미 기록했어요 🌙 / You've already logged today.
        </p>
      )}
    </section>
  )
}
