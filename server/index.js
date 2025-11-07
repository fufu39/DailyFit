// 整个服务的入口文件，启动 Express 服务、注册路由、中间件等
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupMiddleware } from './middleware/index.js'
import authRoutes from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename) // 获取当前文件所在目录的路径

const app = express() // 创建Express应用实例
const PORT = process.env.PORT || 3000 // 设置服务器监听端口
setupMiddleware(app) // 配置中间件

// 注册API路由
app.post('/api/login', authRoutes.login)
app.get('/api/auth/verify', authRoutes.verifyToken)

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// 在生产环境中提供静态文件
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))

  // 所有非 API 路由都返回 index.html（支持前端路由）
  app.get('*', (req, res) => {
    // 排除 API 路由
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: 'API 路由不存在',
      })
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
}
// 开发环境：只提供 API 服务，前端由 Vite 开发服务器处理
else {
  app.get('/', (req, res) => {
    res.json({
      message: 'Express 服务器运行中，前端请访问 Vite 开发服务器',
      api: {
        login: 'POST /api/login',
        verify: 'GET /api/auth/verify',
        health: 'GET /api/health',
      },
    })
  })
}

// 404 处理 - API 路由
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API 路由不存在',
    path: req.path,
  })
})

// 全局错误处理中间件
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
app.use((err, req, res, next) => {
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

// 处理未捕获的 Promise 拒绝
// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
process.on('unhandledRejection', (reason, promise) => {
  console.error('未处理的 Promise 拒绝:', reason)
})

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  console.error('未捕获的异常:', error)
  process.exit(1)
})

// 启动服务器
const server = app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
  if (process.env.NODE_ENV !== 'production') {
    console.log('处于开发模式中...')
  }
})

// 优雅关闭
const gracefulShutdown = (signal) => {
  console.log(`收到 ${signal} 信号，正在关闭服务器...`)
  server.close(() => {
    console.log('服务器已关闭')
    process.exit(0)
  })

  // 如果10秒后还没关闭，强制退出
  setTimeout(() => {
    console.error('强制关闭服务器')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))
