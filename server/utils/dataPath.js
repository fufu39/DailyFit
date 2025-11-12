// 数据文件路径工具函数
// 在 Vercel Serverless 环境中，使用 /tmp 目录（唯一可写目录）
// 在本地开发环境中，使用项目目录
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 项目数据目录（只读文件，如 dashboard.json）
const PROJECT_DATA_DIR = path.join(__dirname, '..', 'data')

/**
 * 获取可写数据目录路径（用于需要写入的文件，如 users.json, logbook.json）
 * @returns {string} 数据目录的绝对路径
 */
export function getDataDir() {
  // 在 Vercel 环境中，使用 /tmp/data 目录（Serverless 函数唯一可写目录）
  if (process.env.VERCEL) {
    return '/tmp/data'
  }
  // 本地开发环境，使用项目目录
  return PROJECT_DATA_DIR
}

/**
 * 获取指定数据文件的路径（可写文件）
 * @param {string} filename - 文件名（如 'users.json', 'logbook.json'）
 * @returns {string} 数据文件的绝对路径
 */
export function getDataFilePath(filename) {
  return path.join(getDataDir(), filename)
}

/**
 * 获取项目数据目录路径（只读文件，如 dashboard.json）
 * 在 Vercel 上，项目文件是只读的，但可以读取
 * @returns {string} 项目数据目录的绝对路径
 */
export function getProjectDataDir() {
  return PROJECT_DATA_DIR
}

/**
 * 获取项目数据文件路径（只读文件）
 * @param {string} filename - 文件名（如 'dashboard.json'）
 * @returns {string} 数据文件的绝对路径
 */
export function getProjectDataFilePath(filename) {
  return path.join(PROJECT_DATA_DIR, filename)
}
