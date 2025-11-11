import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.join(__dirname, '..', 'data')
const DATA_FILE = path.join(DATA_DIR, 'logbook.json')

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
  }
}

function readAll() {
  ensureDataFile()
  const raw = fs.readFileSync(DATA_FILE, 'utf-8')
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(records) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

function generateId(prefix = 'lg') {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now()}_${rand}`
}

// 如果前端（或历史逻辑）未传详情数组，则在保存时为功能性/柔韧性补上默认项
function ensureDetailArraysByType(input) {
  const clone = { ...input }
  if (clone?.type === 'functional') {
    if (!Array.isArray(clone.functionalItems) || clone.functionalItems.length === 0) {
      clone.functionalItems = [
        { id: Math.random().toString(36).slice(2), activity: '', durationMinutes: 20 },
      ]
    }
  } else if (clone?.type === 'flexibility') {
    if (!Array.isArray(clone.flexibilityItems) || clone.flexibilityItems.length === 0) {
      clone.flexibilityItems = [
        { id: Math.random().toString(36).slice(2), activity: '', durationMinutes: 15 },
      ]
    }
  }
  return clone
}

export const list = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const pageSize = Math.max(1, parseInt(req.query.pageSize || '5', 10))
    const all = readAll().sort((a, b) => b.createdAt - a.createdAt)
    const total = all.length
    const totalPages = Math.max(1, Math.ceil(total / pageSize))
    const currentPage = Math.min(page, totalPages)
    const start = (currentPage - 1) * pageSize
    const data = all.slice(start, start + pageSize)
    res.json({ success: true, data: { data, page: currentPage, pageSize, total, totalPages } })
  } catch {
    res.status(500).json({ success: false, message: '读取日志失败' })
  }
}

export const getOne = async (req, res) => {
  try {
    const id = req.params.id
    const all = readAll()
    const found = all.find((r) => r.id === id)
    if (!found) return res.status(404).json({ success: false, message: '未找到记录' })
    res.json({ success: true, data: found })
  } catch {
    res.status(500).json({ success: false, message: '读取记录失败' })
  }
}

export const create = async (req, res) => {
  try {
    const payload = ensureDetailArraysByType(req.body || {})
    const now = Date.now()
    // 按类型稳妥生成详情数组，确保写盘一定包含功能性/柔韧性项目
    const strengthItems =
      payload.type === 'strength' && Array.isArray(payload.strengthItems)
        ? payload.strengthItems
        : undefined
    const cardioItems =
      payload.type === 'cardio' && Array.isArray(payload.cardioItems)
        ? payload.cardioItems
        : undefined
    const functionalItems =
      payload.type === 'functional'
        ? Array.isArray(payload.functionalItems) && payload.functionalItems.length > 0
          ? payload.functionalItems
          : [{ id: Math.random().toString(36).slice(2), activity: '', durationMinutes: 20 }]
        : undefined
    const flexibilityItems =
      payload.type === 'flexibility'
        ? Array.isArray(payload.flexibilityItems) && payload.flexibilityItems.length > 0
          ? payload.flexibilityItems
          : [{ id: Math.random().toString(36).slice(2), activity: '', durationMinutes: 15 }]
        : undefined
    const record = {
      id: generateId(),
      date: payload.date,
      type: payload.type,
      strengthItems,
      cardioItems,
      functionalItems,
      flexibilityItems,
      createdAt: now,
    }
    const all = readAll()
    all.unshift(record)
    writeAll(all)
    res.status(201).json({ success: true, data: record })
  } catch {
    res.status(500).json({ success: false, message: '创建记录失败' })
  }
}

export const update = async (req, res) => {
  try {
    const id = req.params.id
    const partial = ensureDetailArraysByType(req.body || {})
    const all = readAll()
    const idx = all.findIndex((r) => r.id === id)
    if (idx === -1) return res.status(404).json({ success: false, message: '未找到记录' })
    const updated = { ...all[idx], ...partial, id: all[idx].id }
    all[idx] = updated
    writeAll(all)
    res.json({ success: true, data: updated })
  } catch {
    res.status(500).json({ success: false, message: '更新记录失败' })
  }
}

export const remove = async (req, res) => {
  try {
    const id = req.params.id
    const all = readAll()
    const next = all.filter((r) => r.id !== id)
    if (next.length === all.length) {
      return res.status(404).json({ success: false, message: '未找到记录' })
    }
    writeAll(next)
    res.json({ success: true })
  } catch {
    res.status(500).json({ success: false, message: '删除记录失败' })
  }
}
