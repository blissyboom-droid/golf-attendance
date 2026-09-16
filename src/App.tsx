import { useEffect, useRef, useState } from 'react'
import { useAppState } from './useAppState'
import { practiceCountForMember } from './stats'
import { BERRIES_PER_CLUSTER } from './types'
import { Members } from './components/Members'
import { MemberPicker } from './components/MemberPicker'
import { MyGrape } from './components/MyGrape'
import { Leaderboard } from './components/Leaderboard'
import { CelebrationModal } from './components/CelebrationModal'

export default function App() {
  const {
    state,
    addMember,
    removeMember,
    addPractice,
    undoPractice,
    currentMemberId,
    setCurrentMemberId,
  } = useAppState()

  // Resolve the remembered id to an actual member. When it is null or stale the
  // hook resets it to null, so here we simply fall back to the picker.
  const currentMember =
    currentMemberId === null
      ? null
      : state.members.find((m) => m.id === currentMemberId) ?? null

  // Whether the current member's celebration has already been fired, so the
  // modal only appears once per 19 -> 20 crossing (not on every render).
  //
  // Re-seeded from the tracked member's completion state whenever that member
  // changes (mount, first pick, or "switch person"): if they are already at
  // >=20 they are treated as already-celebrated, so a reload or switching into
  // an already-complete member does NOT re-pop the modal. A genuine 19 -> 20
  // crossing during the session is not in the seed, so it still fires exactly
  // once. Undoing below 20 clears the flag so a later re-crossing fires again.
  const [celebratingMemberId, setCelebratingMemberId] = useState<string | null>(
    null,
  )
  const celebratedRef = useRef<boolean>()
  // Track which member the guard is currently seeded for, so we can re-seed it
  // whenever the tracked identity changes (switch person / first pick) instead
  // of blanket-clearing to false. `undefined` means "not yet seeded".
  const watchedMemberIdRef = useRef<string | null | undefined>(undefined)
  const trackedMemberId = currentMember === null ? null : currentMember.id
  if (watchedMemberIdRef.current !== trackedMemberId) {
    // The tracked member changed (including the initial mount). Seed the guard
    // from THIS member's completion state: an already-complete member is
    // treated as already-celebrated (no spurious re-fire on switch/first pick),
    // while a below-20 member starts un-celebrated so a genuine crossing fires.
    const count =
      currentMember === null
        ? 0
        : practiceCountForMember(state.practices, currentMember.id)
    celebratedRef.current = count >= BERRIES_PER_CLUSTER
    watchedMemberIdRef.current = trackedMemberId
  }

  // Watch only the current member for a completion transition.
  useEffect(() => {
    if (currentMember === null) return
    const count = practiceCountForMember(state.practices, currentMember.id)
    const isComplete = count >= BERRIES_PER_CLUSTER
    if (isComplete && !celebratedRef.current) {
      celebratedRef.current = true
      setCelebratingMemberId(currentMember.id)
    } else if (!isComplete && celebratedRef.current) {
      // Dropped back below 20 (e.g. via undo); allow celebrating again later.
      celebratedRef.current = false
    }
  }, [state.practices, currentMember])

  const celebratingMember =
    celebratingMemberId === null
      ? null
      : state.members.find((m) => m.id === celebratingMemberId) ?? null

  // Drop a stale celebration if that member was removed while the modal queued.
  useEffect(() => {
    if (celebratingMemberId !== null && celebratingMember === null) {
      setCelebratingMemberId(null)
    }
  }, [celebratingMemberId, celebratingMember])

  return (
    <div className="app">
      <header className="app-header">
        <img src="/golf.svg" alt="" width={32} height={32} />
        <div>
          <h1>Golf Attendance</h1>
          <p className="muted">Grow your grape, one practice at a time.</p>
        </div>
      </header>

      <main className="stack">
        {currentMember === null ? (
          <MemberPicker
            members={state.members}
            onSelect={setCurrentMemberId}
            onAdd={addMember}
          />
        ) : (
          <>
            <MyGrape
              member={currentMember}
              practices={state.practices}
              onAddPractice={addPractice}
              onUndoPractice={undoPractice}
              onSwitch={() => setCurrentMemberId(null)}
            />

            <Leaderboard
              members={state.members}
              practices={state.practices}
            />

            <Members
              members={state.members}
              onAdd={addMember}
              onRemove={removeMember}
            />
          </>
        )}
      </main>

      <footer className="app-footer">
        <span className="muted">
          Data is saved locally in your browser (localStorage).
        </span>
      </footer>

      {celebratingMember && (
        <CelebrationModal
          memberId={celebratingMember.id}
          memberName={celebratingMember.name}
          onClose={() => setCelebratingMemberId(null)}
        />
      )}
    </div>
  )
}
