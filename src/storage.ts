import type { AppState } from './types'

const STORAGE_KEY = 'golf-attendance:v2'
const LEGACY_STORAGE_KEY = 'golf-attendance:v1'

export const emptyState: AppState = {
  members: [],
  events: [],
  attendance: {},
  practices: [],
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppState>
      return {
        members: parsed.members ?? [],
        events: parsed.events ?? [],
        attendance: parsed.attendance ?? {},
        practices: parsed.practices ?? [],
      }
    }

    // Non-destructive migration: if only the old v1 key exists, carry over
    // members/events/attendance and start with an empty practices list. The
    // v1 key is left in place so older builds keep working.
    const legacyRaw = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacyRaw) {
      const legacy = JSON.parse(legacyRaw) as Partial<AppState>
      return {
        members: legacy.members ?? [],
        events: legacy.events ?? [],
        attendance: legacy.attendance ?? {},
        practices: [],
      }
    }

    return emptyState
  } catch (err) {
    console.error('Failed to load state, starting fresh.', err)
    return emptyState
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (err) {
    console.error('Failed to save state.', err)
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
