import cors from 'cors'
import express from 'express'

// 中间件函数：在请求到达控制器前执行
// 常用于验证token、日志记录、CORS跨域处理、请求体解析
export const setupMiddleware = (app) => {
  // CORS配置 - 限制允许的源
  // 在 Vercel 上，前后端在同一域名，CORS 配置更宽松
  const corsOptions = {
    origin: process.env.VERCEL
      ? true // Vercel 环境：允许所有源（因为前后端同域）
      : process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'http://localhost:5173'
        : ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }
  app.use(cors(corsOptions))

  // Body parser配置 - 使用Express内置中间件
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // 请求日志中间件
  app.use((req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - ${req.ip}`)
    })
    next()
  })

  // 安全响应头
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    next()
  })

  // API路由禁用缓存（防止浏览器缓存 API 响应，确保获取最新数据）
  app.use('/api', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')
    next()
  })
}
