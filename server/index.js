import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { setupMiddleware } from './middleware/index.js'
import authRoutes from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// 配置中间件
setupMiddleware(app)

// API 路由
app.post('/api/login', authRoutes.login)
app.get('/api/auth/verify', authRoutes.verifyToken)

// 在生产环境中提供静态文件
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'dist')
  app.use(express.static(distPath))

  // 所有非 API 路由都返回 index.html（支持前端路由）
  app.get('*', (req, res) => {
    // 排除 API 路由
    if (req.path.startsWith('/api')) {
      return res.status(404).json({ message: 'API 路由不存在' })
    }
    res.sendFile(path.join(distPath, 'index.html'))
  })
} else {
  // 开发环境：只提供 API 服务，前端由 Vite 开发服务器处理
  app.get('/', (req, res) => {
    res.json({ message: 'Express 服务器运行中，前端请访问 Vite 开发服务器' })
  })
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`)
  if (process.env.NODE_ENV !== 'production') {
    console.log('开发模式：前端请使用 Vite 开发服务器 (pnpm dev)')
  }
})
