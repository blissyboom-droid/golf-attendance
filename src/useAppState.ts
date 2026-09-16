import { useCallback, useEffect, useState } from 'react'
import type { AppState, Member, PracticeSession } from './types'
import { practicedToday } from './stats'
import {
  loadCurrentMemberId,
  loadState,
  newId,
  saveCurrentMemberId,
  saveState,
} from './storage'

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState())
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(() =>
    loadCurrentMemberId(),
  )

  useEffect(() => {
    saveState(state)
  }, [state])

  useEffect(() => {
    saveCurrentMemberId(currentMemberId)
  }, [currentMemberId])

  // Guard against a stale remembered id: if the current member was removed (or
  // otherwise no longer exists) reset the selection so we fall back to the
  // picker instead of getting stuck on a phantom id.
  useEffect(() => {
    if (
      currentMemberId !== null &&
      !state.members.some((m) => m.id === currentMemberId)
    ) {
      setCurrentMemberId(null)
    }
  }, [currentMemberId, state.members])

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
    setState((s) => ({
      ...s,
      members: s.members.filter((m) => m.id !== id),
      practices: s.practices.filter((p) => p.memberId !== id),
    }))
  }, [])

  const addPractice = useCallback((memberId: string, date?: string) => {
    if (!memberId) return
    // Reference date for the once-per-local-day guard: use the passed `date`
    // when provided, otherwise "now". Reuse the same Date for the session
    // timestamp so the guard and the stored value agree.
    const now = new Date()
    const refDate = date ? new Date(date) : now
    const session: PracticeSession = {
      id: newId(),
      memberId,
      date: date ?? now.toISOString(),
    }
    // Defense-in-depth: MyGrape already disables the button and re-checks in its
    // handler, but both derive from the same render's `practices` prop, so two
    // synchronous clicks could slip through before React re-renders. The state
    // updater receives the freshest `s.practices`, so re-check here against `s`
    // and drop the duplicate rather than trusting the caller.
    setState((s) => {
      if (practicedToday(s.practices, memberId, refDate)) return s
      return { ...s, practices: [...s.practices, session] }
    })
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

  return {
    state,
    addMember,
    removeMember,
    addPractice,
    undoPractice,
    currentMemberId,
    setCurrentMemberId,
  }
}
