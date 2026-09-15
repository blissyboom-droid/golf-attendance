import { useState, type FormEvent } from 'react'
import type { Member } from '../types'

interface Props {
  members: Member[]
  onAdd: (name: string) => void
  onRemove: (id: string) => void
}

export function Members({ members, onAdd, onRemove }: Props) {
  const [name, setName] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onAdd(name)
    setName('')
  }

  return (
    <section className="card">
      <h2>Members</h2>
      <form className="row" onSubmit={submit}>
        <input
          type="text"
          placeholder="Member name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Member name"
        />
        <button type="submit" className="btn primary">
          Add
        </button>
      </form>

      {members.length === 0 ? (
        <p className="empty">No members yet. Add your first player above.</p>
      ) : (
        <ul className="list">
          {members.map((m) => (
            <li key={m.id} className="list-item">
              <span>{m.name}</span>
              <button
                className="btn ghost"
                onClick={() => onRemove(m.id)}
                aria-label={`Remove ${m.name}`}
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
