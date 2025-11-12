/* 定义数据结构，封装网络请求 */
import axios from 'axios'
import type { AxiosError } from 'axios'

// 训练记录类型：力量训练、有氧运动、功能性训练、柔韧性训练
export type LogType = 'strength' | 'cardio' | 'functional' | 'flexibility'

// 力量训练项目
export type StrengthItem = {
  id: string
  name: string
  sets: number
  reps: number
  weight: number
}

// 有氧运动项目
export type CardioItem = {
  id: string
  activity: string
  durationMinutes: number
  distanceKm?: number
}

// 功能性训练项目
export type FunctionalItem = {
  id: string
  activity: string
  durationMinutes: number
}

// 柔韧性训练项目
export type FlexibilityItem = {
  id: string
  activity: string
  durationMinutes: number
}

// 训练记录，包含日期、类型和对应的训练项目数组
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

// 保存新的训练记录
export async function saveRecord(
  record: Omit<LogbookRecord, 'id' | 'createdAt'>
): Promise<LogbookRecord> {
  const res = await axios.post('/api/logbook', record)
  console.log('保存训练记录：', res.data.data)
  return res.data.data as LogbookRecord
}

// 更新训练记录，如果记录不存在返回 undefined
export async function updateRecord(
  id: string,
  partial: Partial<LogbookRecord>
): Promise<LogbookRecord | undefined> {
  try {
    const res = await axios.put(`/api/logbook/${id}`, partial)
    console.log('更新训练记录：', res.data.data)
    return res.data.data as LogbookRecord
  } catch (e: unknown) {
    console.log(e)
    const err = e as AxiosError
    if (err.response?.status === 404) return undefined
    throw e
  }
}

// 根据ID获取训练记录，如果记录不存在返回undefined
export async function getRecordById(id: string): Promise<LogbookRecord | undefined> {
  try {
    const res = await axios.get(`/api/logbook/${id}`)
    console.log('根据ID获取训练记录：', res.data.data)
    return res.data.data as LogbookRecord
  } catch (e: unknown) {
    console.log(e)
    const err = e as AxiosError
    if (err.response?.status === 404) return undefined
    throw e
  }
}

// 删除训练记录
export async function deleteRecord(id: string): Promise<void> {
  const res = await axios.delete(`/api/logbook/${id}`)
  console.log('删除训练记录：', res.data.data)
}

// 分页查询结果
export type PaginatedResult = {
  data: LogbookRecord[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// 分页获取训练记录列表
export async function listPaginated(page: number, pageSize: number): Promise<PaginatedResult> {
  const res = await axios.get('/api/logbook', { params: { page, pageSize } })
  console.log('分页获取训练记录：', res.data.data)
  return res.data.data as PaginatedResult
}

// 将 Date 对象格式化为 ISO 日期字符串 (yyyy-MM-dd)
export function formatDateISO(date: Date): string {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

// 将 ISO 日期字符串 (yyyy-MM-dd) 解析为 Date 对象
export function parseISOToDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map((n) => Number(n))
  return new Date(y, (m || 1) - 1, d || 1)
}
