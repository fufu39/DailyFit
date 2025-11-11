import axios from 'axios'
import type { AxiosError } from 'axios'

export type LogType = 'strength' | 'cardio' | 'functional' | 'flexibility'

export type StrengthItem = {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

export type CardioItem = {
  id: string
  activity: string
  durationMinutes: number
  distanceKm?: number
}

export type FunctionalItem = {
  id: string
  activity: string
  durationMinutes: number
}

export type FlexibilityItem = {
  id: string
  activity: string
  durationMinutes: number
}

export type LogbookRecord = {
  id: string
  date: string // ISO string (yyyy-MM-dd)
  type: LogType
  strengthItems?: StrengthItem[]
  cardioItems?: CardioItem[]
  functionalItems?: FunctionalItem[]
  flexibilityItems?: FlexibilityItem[]
  createdAt: number
}

export async function saveRecord(
  record: Omit<LogbookRecord, 'id' | 'createdAt'>
): Promise<LogbookRecord> {
  const res = await axios.post('/api/logbook', record)
  return res.data.data as LogbookRecord
}

export async function updateRecord(
  id: string,
  partial: Partial<LogbookRecord>
): Promise<LogbookRecord | undefined> {
  try {
    const res = await axios.put(`/api/logbook/${id}`, partial)
    return res.data.data as LogbookRecord
  } catch (e: unknown) {
    const err = e as AxiosError
    if (err.response?.status === 404) return undefined
    throw e
  }
}

export async function getRecordById(id: string): Promise<LogbookRecord | undefined> {
  try {
    const res = await axios.get(`/api/logbook/${id}`)
    return res.data.data as LogbookRecord
  } catch (e: unknown) {
    const err = e as AxiosError
    if (err.response?.status === 404) return undefined
    throw e
  }
}

export async function deleteRecord(id: string): Promise<void> {
  await axios.delete(`/api/logbook/${id}`)
}

export type PaginatedResult = {
  data: LogbookRecord[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function listPaginated(page: number, pageSize: number): Promise<PaginatedResult> {
  const res = await axios.get('/api/logbook', { params: { page, pageSize } })
  return res.data.data as PaginatedResult
}

export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseISOToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => Number(n))
  return new Date(y, (m || 1) - 1, d || 1)
}
