import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 用户数据文件路径
const usersFilePath = path.join(__dirname, '..', 'data', 'users.json')

// 确保 data 目录存在
const dataDir = path.join(__dirname, '..', 'data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// 初始化用户数据文件（如果不存在）
const initializeUsersFile = () => {
  if (!fs.existsSync(usersFilePath)) {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: 'admin123', // 实际应用中应该使用加密密码
        email: 'admin@example.com',
        name: '管理员',
      },
      {
        id: 2,
        username: 'user',
        password: 'user123',
        email: 'user@example.com',
        name: '用户',
      },
    ]
    fs.writeFileSync(usersFilePath, JSON.stringify(defaultUsers, null, 2), 'utf8')
  }
}

// 初始化用户数据文件
initializeUsersFile()

/**
 * 读取用户数据
 */
export const readUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取用户数据失败:', error)
    return []
  }
}

/**
 * 登录控制器
 */
export const login = (req, res) => {
  const { username, password } = req.body

  // 验证输入
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: '用户名和密码不能为空',
    })
  }

  // 读取用户数据
  const users = readUsers()

  // 查找用户
  const user = users.find((u) => u.username === username && u.password === password)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: '用户名或密码错误',
    })
  }

  // 登录成功，返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    message: '登录成功',
    data: {
      user: userWithoutPassword,
      token: `token_${user.id}_${Date.now()}`, // 简单的 token 生成（实际应用中应使用 JWT）
    },
  })
}

/**
 * 验证 token 控制器
 */
export const verifyToken = (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '未提供 token',
    })
  }

  // 简单的 token 验证（实际应用中应使用 JWT）
  const tokenParts = token.split('_')
  if (tokenParts.length !== 3) {
    return res.status(401).json({
      success: false,
      message: '无效的 token',
    })
  }

  const userId = parseInt(tokenParts[1])
  const users = readUsers()
  const user = users.find((u) => u.id === userId)

  if (!user) {
    return res.status(401).json({
      success: false,
      message: '用户不存在',
    })
  }

  const { password: _, ...userWithoutPassword } = user

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
    },
  })
}
