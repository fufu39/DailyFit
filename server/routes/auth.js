// 定义API路由映射关系：每个接口URL和对应的控制器函数
import { login, verifyToken } from '../controllers/authController.js'

export default {
  login,
  verifyToken,
}
