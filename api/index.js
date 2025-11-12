// Vercel Serverless Function 入口文件
// 将 Express 应用转换为 Serverless Function
import express from 'express'
import fs from 'fs'
import { setupMiddleware } from '../server/middleware/index.js'
import authRoutes from '../server/routes/auth.js'
import dashboardRoutes from '../server/routes/dashboard.js'
import logbookRoutes from '../server/routes/logbook.js'

const app = express() // 创建Express应用实例
setupMiddleware(app)

// 启动时确保数据文件存在
;(async () => {
  try {
    // 使用工具函数获取数据目录路径
    const { getDataDir, getDataFilePath } = await import('../server/utils/dataPath.js')
    const dataDir = getDataDir()
    const logbookFile = getDataFilePath('logbook.json')
    const usersFile = getDataFilePath('users.json')

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    if (!fs.existsSync(logbookFile)) {
      fs.writeFileSync(logbookFile, '[]', 'utf-8')
    }
    if (!fs.existsSync(usersFile)) {
      const defaultUsers = [
        {
          id: 1,
          username: 'admin',
          password: '1',
          email: 'admin@example.com',
          name: '管理员',
        },
      ]
      fs.writeFileSync(usersFile, JSON.stringify(defaultUsers, null, 2), 'utf-8')
    }
  } catch (e) {
    console.error('初始化数据文件失败:', e)
  }
})()

// 注册API路由
app.post('/api/login', authRoutes.login)
app.get('/api/auth/verify', authRoutes.verifyToken)
app.get('/api/profile', authRoutes.getProfile)
app.put('/api/profile', authRoutes.updateProfile)
app.get('/api/dashboard', dashboardRoutes.getDashboard)
app.get('/api/logbook', logbookRoutes.list)
app.get('/api/logbook/:id', logbookRoutes.getOne)
app.post('/api/logbook', logbookRoutes.create)
app.put('/api/logbook/:id', logbookRoutes.update)
app.delete('/api/logbook/:id', logbookRoutes.remove)

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL ? 'vercel' : 'local',
  })
})

// 404 处理 - API 路由
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 路由不存在',
    path: req.path,
  })
})

// 全局错误处理中间件
// Express 错误处理中间件必须包含 4 个参数，即使不使用 next
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err, req, res, _next) => {
  console.error('未处理的错误:', err)

  // 如果是开发环境，返回详细错误信息
  if (process.env.NODE_ENV !== 'production') {
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || '服务器内部错误',
      error: err.stack,
    })
  }

  // 生产环境只返回通用错误信息
  res.status(err.status || 500).json({
    success: false,
    message: '服务器内部错误',
  })
})

// 注意：在 Serverless 环境中，不需要设置 process.on 监听器
// Vercel 会自动处理未捕获的异常和 Promise 拒绝

// 关键改动：导出 app 实例，而不是启动服务器
// Vercel 会接管 app 实例并处理请求
export default app
