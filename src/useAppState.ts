import { useCallback, useEffect, useState } from 'react'
import type { AppState, AttendanceStatus, GolfEvent, Member } from './types'
import { loadState, newId, saveState } from './storage'

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const addMember = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const member: Member = {
      id: newId(),
      name: trimmed,
      createdAt: new Date().toISOString(),
    }
    setState((s) => ({ ...s, members: [...s.members, member] }))
  }, [])

  const removeMember = useCallback((id: string) => {
    setState((s) => {
      const attendance = { ...s.attendance }
      for (const eventId of Object.keys(attendance)) {
        if (attendance[eventId][id]) {
          const copy = { ...attendance[eventId] }
          delete copy[id]
          attendance[eventId] = copy
        }
      }
      return {
        ...s,
        members: s.members.filter((m) => m.id !== id),
        attendance,
      }
    })
  }, [])

  const addEvent = useCallback(
    (title: string, date: string, location?: string) => {
      const trimmed = title.trim()
      if (!trimmed || !date) return
      const event: GolfEvent = {
        id: newId(),
        title: trimmed,
        date,
        location: location?.trim() || undefined,
        createdAt: new Date().toISOString(),
      }
      setState((s) => ({ ...s, events: [...s.events, event] }))
    },
    [],
  )

  const removeEvent = useCallback((id: string) => {
    setState((s) => {
      const attendance = { ...s.attendance }
      delete attendance[id]
      return {
        ...s,
        events: s.events.filter((e) => e.id !== id),
        attendance,
      }
    })
  }, [])

  const setAttendance = useCallback(
    (eventId: string, memberId: string, status: AttendanceStatus) => {
      setState((s) => {
        const forEvent = { ...(s.attendance[eventId] ?? {}) }
        forEvent[memberId] = status
        return {
          ...s,
          attendance: { ...s.attendance, [eventId]: forEvent },
        }
      })
    },
    [],
  )

  return {
    state,
    addMember,
    removeMember,
    addEvent,
    removeEvent,
    setAttendance,
  }
}
