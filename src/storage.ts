import type { AppState } from './types'

const STORAGE_KEY = 'golf-attendance:v1'

export const emptyState: AppState = {
  members: [],
  events: [],
  attendance: {},
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyState
    const parsed = JSON.parse(raw) as Partial<AppState>
    return {
      members: parsed.members ?? [],
      events: parsed.events ?? [],
      attendance: parsed.attendance ?? {},
    }
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
