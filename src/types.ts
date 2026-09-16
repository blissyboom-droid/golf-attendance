export interface Member {
  id: string
  name: string
  createdAt: string
}

export interface GolfEvent {
  id: string
  title: string
  /** ISO date string (YYYY-MM-DD) */
  date: string
  location?: string
  createdAt: string
}

export type AttendanceStatus = 'present' | 'absent' | 'maybe'

/** Map of eventId -> memberId -> status */
export type AttendanceMap = Record<string, Record<string, AttendanceStatus>>

/** A single logged practice/attendance for a member. */
export interface PracticeSession {
  id: string
  memberId: string
  /** ISO datetime string (e.g. from new Date().toISOString()) */
  date: string
}

/**
 * Number of berries in one grape cluster. When a member reaches this many
 * practice sessions their grape is full (and glows).
 */
export const BERRIES_PER_CLUSTER = 20

export interface AppState {
  members: Member[]
  events: GolfEvent[]
  attendance: AttendanceMap
  practices: PracticeSession[]
}
