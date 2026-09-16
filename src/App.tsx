import { useEffect, useRef, useState } from 'react'
import { useAppState } from './useAppState'
import { practiceCountForMember } from './stats'
import { BERRIES_PER_CLUSTER } from './types'
import { Members } from './components/Members'
import { Events } from './components/Events'
import { Attendance } from './components/Attendance'
import { MemberGrapes } from './components/MemberGrapes'
import { Leaderboard } from './components/Leaderboard'
import { CelebrationModal } from './components/CelebrationModal'

export default function App() {
  const {
    state,
    addMember,
    removeMember,
    addEvent,
    removeEvent,
    setAttendance,
    addPractice,
    undoPractice,
  } = useAppState()

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  // FIFO queue of member ids waiting to be celebrated. Keyed by id (not name)
  // so members sharing a display name never collide, and stored as a queue so
  // multiple members crossing 20 in the same update each get their own modal,
  // shown one after another.
  const [celebrationQueue, setCelebrationQueue] = useState<string[]>([])
  // Track which members have already had their celebration fired so the modal
  // only appears once per 19 -> 20 crossing, not on every render.
  //
  // Seeded lazily from the *initial* completion state on mount: members who are
  // already at >=20 when the app loads are treated as already-celebrated, so a
  // page reload does NOT re-pop the modal for them. A genuine 19 -> 20 crossing
  // during the session is not in this initial set, so it still fires exactly
  // once. Undoing below 20 removes the member so a later re-crossing fires again.
  const celebratedRef = useRef<Set<string>>()
  if (celebratedRef.current === undefined) {
    const seeded = new Set<string>()
    for (const member of state.members) {
      const count = practiceCountForMember(state.practices, member.id)
      if (count >= BERRIES_PER_CLUSTER) seeded.add(member.id)
    }
    celebratedRef.current = seeded
  }

  // Detect completion transitions after each state change.
  useEffect(() => {
    const celebrated = celebratedRef.current!
    const newlyComplete: string[] = []
    for (const member of state.members) {
      const count = practiceCountForMember(state.practices, member.id)
      const isComplete = count >= BERRIES_PER_CLUSTER
      if (isComplete && !celebrated.has(member.id)) {
        celebrated.add(member.id)
        newlyComplete.push(member.id)
      } else if (!isComplete && celebrated.has(member.id)) {
        // Dropped back below 20 (e.g. via undo); allow celebrating again later.
        celebrated.delete(member.id)
      }
    }
    if (newlyComplete.length > 0) {
      setCelebrationQueue((q) => [...q, ...newlyComplete])
    }
  }, [state.practices, state.members])

  // The member currently celebrating is the head of the queue. Resolve the id
  // to a member so the modal can display the name while keying by id.
  const celebratingId = celebrationQueue[0] ?? null
  const celebratingMember =
    celebratingId === null
      ? null
      : state.members.find((m) => m.id === celebratingId) ?? null

  // Drop stale queue entries for members that were removed while queued, so the
  // queue never stalls on an id with no matching member.
  useEffect(() => {
    if (celebratingId !== null && celebratingMember === null) {
      setCelebrationQueue((q) => q.slice(1))
    }
  }, [celebratingId, celebratingMember])

  // Keep selection valid: default to first event, clear if it was removed.
  useEffect(() => {
    if (state.events.length === 0) {
      if (selectedEventId !== null) setSelectedEventId(null)
      return
    }
    const stillExists = state.events.some((e) => e.id === selectedEventId)
    if (!stillExists) {
      setSelectedEventId(state.events[0].id)
    }
  }, [state.events, selectedEventId])

  const selectedEvent =
    state.events.find((e) => e.id === selectedEventId) ?? null

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
        <MemberGrapes
          members={state.members}
          practices={state.practices}
          onAddPractice={addPractice}
          onUndoPractice={undoPractice}
        />

        <div className="grid">
          <div className="column">
            <Leaderboard
              members={state.members}
              practices={state.practices}
            />
            <Members
              members={state.members}
              onAdd={addMember}
              onRemove={removeMember}
            />
          </div>
          <div className="column">
            <Events
              events={state.events}
              selectedEventId={selectedEventId}
              onAdd={addEvent}
              onRemove={removeEvent}
              onSelect={setSelectedEventId}
            />
            <Attendance
              event={selectedEvent}
              members={state.members}
              attendance={state.attendance}
              onSet={setAttendance}
            />
          </div>
        </div>
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
          // Dequeue the head so the next queued celebration (if any) shows next.
          onClose={() => setCelebrationQueue((q) => q.slice(1))}
        />
      )}
    </div>
  )
}
