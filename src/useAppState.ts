import { useCallback, useEffect, useState } from 'react'
import type {
  AppState,
  AttendanceStatus,
  GolfEvent,
  Member,
  PracticeSession,
} from './types'
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
        practices: s.practices.filter((p) => p.memberId !== id),
      }
    })
  }, [])

  const addPractice = useCallback((memberId: string, date?: string) => {
    if (!memberId) return
    const session: PracticeSession = {
      id: newId(),
      memberId,
      date: date ?? new Date().toISOString(),
    }
    setState((s) => ({ ...s, practices: [...s.practices, session] }))
  }, [])

  // Undo removes the member's single latest-dated session. The UI only ever
  // logs sessions via the "+1 practice" button, which calls addPractice with no
  // `date` (i.e. `new Date().toISOString()`), so the latest-dated session is
  // always the one just added and always in the current month. The optional
  // backdated `date` parameter on addPractice is not exercised by any UI path,
  // so scoping the undo to the displayed month is unnecessary; the global-latest
  // and month-latest sessions coincide for all real usage.
  const undoPractice = useCallback((memberId: string) => {
    setState((s) => {
      let latestIndex = -1
      let latestDate = ''
      s.practices.forEach((p, i) => {
        if (p.memberId !== memberId) return
        if (latestIndex === -1 || p.date > latestDate) {
          latestIndex = i
          latestDate = p.date
        }
      })
      if (latestIndex === -1) return s
      return {
        ...s,
        practices: s.practices.filter((_, i) => i !== latestIndex),
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
    addPractice,
    undoPractice,
  }
}
