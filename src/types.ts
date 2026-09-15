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

export interface AppState {
  members: Member[]
  events: GolfEvent[]
  attendance: AttendanceMap
}
