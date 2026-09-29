import { useState, type FormEvent } from 'react'
import type { Member } from '../types'

interface Props {
  members: Member[]
  onSelect: (id: string) => void
  onAdd: (name: string) => void
}

/**
 * First-visit "who are you?" screen, shown whenever there is no valid current
 * member remembered for this browser. Pick an existing name (remembered on this
 * device) or add yourself. There is no login or PIN by design.
 */
export function MemberPicker({ members, onSelect, onAdd }: Props) {
  const [name, setName] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onAdd(name)
    setName('')
  }

  return (
    <section className="card member-picker">
      <h2>누구세요? / Who are you?</h2>
      <p className="muted">
        이름을 한 번만 고르면 이 브라우저에 기억돼요. 다음에 올 때 자동으로 내
        포도가 보여요. (Pick your name once; it is remembered on this device.)
      </p>

      {members.length > 0 && (
        <div className="picker-list">
          {members.map((m) => (
            <button
              key={m.id}
              type="button"
              className="btn picker-name"
              onClick={() => onSelect(m.id)}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      <form className="row picker-add" onSubmit={submit}>
        <input
          type="text"
          placeholder="새 이름 추가 / Add a new name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="New member name"
        />
        <button type="submit" className="btn primary">
          추가 / Add
        </button>
      </form>
    </section>
  )
}
