import { useState, type FormEvent } from 'react'
import type { GolfEvent } from '../types'

interface Props {
  events: GolfEvent[]
  selectedEventId: string | null
  onAdd: (title: string, date: string, location?: string) => void
  onRemove: (id: string) => void
  onSelect: (id: string) => void
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function Events({
  events,
  selectedEventId,
  onAdd,
  onRemove,
  onSelect,
}: Props) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [location, setLocation] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onAdd(title, date, location)
    setTitle('')
    setDate('')
    setLocation('')
  }

  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date))

  return (
    <section className="card">
      <h2>Events</h2>
      <form className="event-form" onSubmit={submit}>
        <input
          type="text"
          placeholder="Event title (e.g. Saturday Round)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          aria-label="Event title"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Event date"
        />
        <input
          type="text"
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          aria-label="Event location"
        />
        <button type="submit" className="btn primary">
          Add event
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="empty">No events yet. Schedule a round above.</p>
      ) : (
        <ul className="list">
          {sorted.map((ev) => (
            <li
              key={ev.id}
              className={
                'list-item selectable' +
                (ev.id === selectedEventId ? ' selected' : '')
              }
              onClick={() => onSelect(ev.id)}
            >
              <div>
                <strong>{ev.title}</strong>
                <div className="muted">
                  {formatDate(ev.date)}
                  {ev.location ? ` · ${ev.location}` : ''}
                </div>
              </div>
              <button
                className="btn ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemove(ev.id)
                }}
                aria-label={`Remove ${ev.title}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
