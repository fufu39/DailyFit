import fs from 'fs'
import { getDataFilePath } from '../utils/dataPath.js'

// const DATA_DIR = getDataDir()
const DATA_FILE = getDataFilePath('logbook.json')

// Vercel修复: Vercel 的文件系统是只读的。
// 在启动时创建目录或写入文件的操作 (fs.mkdirSync, fs.writeFileSync) 会导致部署失败。
// 你必须在部署前，手动在 server/data/ 目录中创建 logbook.json
// function ensureDataFile() {
//   if (!fs.existsSync(DATA_DIR)) {
//     fs.mkdirSync(DATA_DIR, { recursive: true })
//   }
//   if (!fs.existsSync(DATA_FILE)) {
//     fs.writeFileSync(DATA_FILE, '[]', 'utf-8')
//   }
// }

// 读取所有训练记录
function readAll() {
  // Vercel 修复: 移除了 ensureDataFile() 调用
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    // Vercel 调试:
    // 如果 logbook.json 没有被 git push, fs.readFileSync 会失败
    // 并进入这个 catch 块, 返回 []
    console.error('读取日志数据失败 (文件是否已 git push?):', error)
    return []
  }
}

// 写入所有训练记录到文件
function writeAll(records) {
  // Vercel 修复: Vercel 的文件系统是只读的。
  // 下面的 fs.writeFileSync 操作在 Vercel 上会失败, 导致 500 错误。
  // 要使"创建/更新/删除"功能可用, 你必须将数据存储迁移到外部数据库。
  fs.writeFileSync(DATA_FILE, JSON.stringify(records, null, 2), 'utf-8')
}

// 给每个训练记录生成唯一ID
function generateId(prefix = 'lg') {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}_${Date.now()}_${rand}`
}

// 如果前端未传详情数组，则在保存时为功能性/柔韧性补上默认项
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

// 分页获取训练记录列表，按创建时间倒序排列
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
  } catch (error) {
    console.error('读取日志列表错误:', error)
    res.status(500).json({ success: false, message: '读取日志失败' })
  }
}

// 根据ID获取单条训练记录
export const getOne = async (req, res) => {
  try {
    const id = req.params.id
    const all = readAll()
    const found = all.find((r) => r.id === id)
    if (!found) return res.status(404).json({ success: false, message: '未找到记录' })
    res.json({ success: true, data: found })
  } catch (error) {
    console.error('读取单条日志错误:', error)
    res.status(500).json({ success: false, message: '读取记录失败' })
  }
}

// 创建新的训练记录，根据训练类型处理对应的详情数组
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
    writeAll(all) // Vercel 修复: 此处调用 writeAll 会失败
    res.status(201).json({ success: true, data: record })
  } catch (error) {
    // Vercel 调试: 当 writeAll 失败时, 错误会在这里被捕获
    console.error('创建记录错误:', error)
    res.status(500).json({ success: false, message: '创建记录失败' })
  }
}

// 更新训练记录，根据ID查找并更新记录，保留原有ID
export const update = async (req, res) => {
  try {
    const id = req.params.id
    const partial = ensureDetailArraysByType(req.body || {})
    const all = readAll()
    const idx = all.findIndex((r) => r.id === id)
    if (idx === -1) return res.status(404).json({ success: false, message: '未找到记录' })
    const updated = { ...all[idx], ...partial, id: all[idx].id }
    all[idx] = updated
    writeAll(all) // Vercel 修复: 此处调用 writeAll 会失败
    res.json({ success: true, data: updated })
  } catch (error) {
    // Vercel 调试: 当 writeAll 失败时, 错误会在这里被捕获
    console.error('更新记录错误:', error)
    res.status(500).json({ success: false, message: '更新记录失败' })
  }
}

// 删除训练记录，根据ID删除记录，如果记录不存在返回404
export const remove = async (req, res) => {
  try {
    const id = req.params.id
    const all = readAll()
    const next = all.filter((r) => r.id !== id)
    if (next.length === all.length) {
      return res.status(404).json({ success: false, message: '未找到记录' })
    }
    writeAll(next) // Vercel 修复: 此处调用 writeAll 会失败
    res.json({ success: true })
  } catch (error) {
    // Vercel 调试: 当 writeAll 失败时, 错误会在这里被捕获
    console.error('删除记录错误:', error)
    res.status(500).json({ success: false, message: '删除记录失败' })
  }
}
