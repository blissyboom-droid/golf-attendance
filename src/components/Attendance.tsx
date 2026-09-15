import type {
  AttendanceMap,
  AttendanceStatus,
  GolfEvent,
  Member,
} from '../types'

interface Props {
  event: GolfEvent | null
  members: Member[]
  attendance: AttendanceMap
  onSet: (eventId: string, memberId: string, status: AttendanceStatus) => void
}

const STATUSES: { value: AttendanceStatus; label: string }[] = [
  { value: 'present', label: 'Present' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'absent', label: 'Absent' },
]

export function Attendance({ event, members, attendance, onSet }: Props) {
  if (!event) {
    return (
      <section className="card">
        <h2>Attendance</h2>
        <p className="empty">Select an event to mark attendance.</p>
      </section>
    )
  }

  const forEvent = attendance[event.id] ?? {}
  const counts = members.reduce(
    (acc, m) => {
      const s = forEvent[m.id]
      if (s === 'present') acc.present++
      else if (s === 'maybe') acc.maybe++
      else if (s === 'absent') acc.absent++
      else acc.unset++
      return acc
    },
    { present: 0, maybe: 0, absent: 0, unset: 0 },
  )

  return (
    <section className="card">
      <h2>Attendance — {event.title}</h2>
      <div className="counts">
        <span className="pill present">Present {counts.present}</span>
        <span className="pill maybe">Maybe {counts.maybe}</span>
        <span className="pill absent">Absent {counts.absent}</span>
        <span className="pill">No response {counts.unset}</span>
      </div>

      {members.length === 0 ? (
        <p className="empty">Add members first to track attendance.</p>
      ) : (
        <ul className="list">
          {members.map((m) => {
            const current = forEvent[m.id]
            return (
              <li key={m.id} className="list-item">
                <span>{m.name}</span>
                <div className="status-group" role="group" aria-label={`Status for ${m.name}`}>
                  {STATUSES.map((s) => (
                    <button
                      key={s.value}
                      className={
                        'btn status ' +
                        s.value +
                        (current === s.value ? ' active' : '')
                      }
                      onClick={() => onSet(event.id, m.id, s.value)}
                      aria-pressed={current === s.value}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
