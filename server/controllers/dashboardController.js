// 仪表盘数据控制器
// 负责从 JSON 文件读取和返回仪表盘所需的各种统计数据

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 读取仪表盘数据
const readDashboardData = () => {
  try {
    const dataPath = path.join(__dirname, '..', 'data', 'dashboard.json')
    const fileContent = fs.readFileSync(dataPath, 'utf-8')
    return JSON.parse(fileContent)
  } catch (error) {
    console.error('读取仪表盘数据文件错误:', error)
    throw error
  }
}

// 获取仪表盘数据控制器
export const getDashboard = async (req, res) => {
  try {
    // 从 JSON 文件读取所有仪表盘数据
    const dashboardData = readDashboardData()

    res.json({
      success: true,
      data: dashboardData,
    })
  } catch (error) {
    console.error('获取仪表盘数据错误:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    })
  }
}
