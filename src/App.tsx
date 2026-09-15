import { useEffect, useState } from 'react'
import { useAppState } from './useAppState'
import { Members } from './components/Members'
import { Events } from './components/Events'
import { Attendance } from './components/Attendance'

export default function App() {
  const {
    state,
    addMember,
    removeMember,
    addEvent,
    removeEvent,
    setAttendance,
  } = useAppState()

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

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
          <p className="muted">Track who's playing each round.</p>
        </div>
      </header>

      <main className="grid">
        <div className="column">
          <Members
            members={state.members}
            onAdd={addMember}
            onRemove={removeMember}
          />
          <Events
            events={state.events}
            selectedEventId={selectedEventId}
            onAdd={addEvent}
            onRemove={removeEvent}
            onSelect={setSelectedEventId}
          />
        </div>
        <div className="column">
          <Attendance
            event={selectedEvent}
            members={state.members}
            attendance={state.attendance}
            onSet={setAttendance}
          />
        </div>
      </main>

      <footer className="app-footer">
        <span className="muted">
          Data is saved locally in your browser (localStorage).
        </span>
      </footer>
    </div>
  )
}
