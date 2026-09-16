import type { AppState } from './types'

const STORAGE_KEY = 'golf-attendance:v3'
const STORAGE_KEY_V2 = 'golf-attendance:v2'
const STORAGE_KEY_V1 = 'golf-attendance:v1'
const CURRENT_MEMBER_KEY = 'golf-attendance:current-member'

export const emptyState: AppState = {
  members: [],
  practices: [],
}

/**
 * Carry forward only the fields that survive into v3 (members + practices),
 * dropping any legacy events/attendance. Practices default to [] when absent
 * (e.g. migrating from a v1 blob that predates practice logging).
 */
function migrateForward(raw: string): AppState {
  const parsed = JSON.parse(raw) as Partial<AppState>
  return {
    members: parsed.members ?? [],
    practices: parsed.practices ?? [],
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return migrateForward(raw)

    // Non-destructive migration: read the newest legacy key that exists and
    // carry over members/practices only, dropping events/attendance. Legacy
    // keys are left in place so older builds keep working.
    const v2Raw = localStorage.getItem(STORAGE_KEY_V2)
    if (v2Raw) return migrateForward(v2Raw)

    const v1Raw = localStorage.getItem(STORAGE_KEY_V1)
    if (v1Raw) return migrateForward(v1Raw)

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

/** The remembered "who am I" selection for this browser (per-device). */
export function loadCurrentMemberId(): string | null {
  try {
    return localStorage.getItem(CURRENT_MEMBER_KEY)
  } catch (err) {
    console.error('Failed to load current member id.', err)
    return null
  }
}

export function saveCurrentMemberId(id: string | null): void {
  try {
    if (id === null) {
      localStorage.removeItem(CURRENT_MEMBER_KEY)
    } else {
      localStorage.setItem(CURRENT_MEMBER_KEY, id)
    }
  } catch (err) {
    console.error('Failed to save current member id.', err)
  }
}

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
