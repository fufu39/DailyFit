import cors from 'cors'
import bodyParser from 'body-parser'

/**
 * 配置 Express 中间件
 */
export const setupMiddleware = (app) => {
  // CORS 配置
  app.use(cors())

  // Body parser 配置
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({ extended: true }))
}
