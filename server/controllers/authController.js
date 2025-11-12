// 业务逻辑控制器
// 负责处理具体请求逻辑，即从路由接收请求→操作数据（如读写JSON文件或数据库）→返回响应数据
import fs from 'fs/promises'
import { getDataDir, getDataFilePath } from '../utils/dataPath.js'

// 用户数据文件路径
const usersFilePath = getDataFilePath('users.json')

// 确保 data 目录存在
const dataDir = getDataDir()

const initializeUsersFile = async () => {
  try {
    await fs.access(dataDir)
  } catch {
    await fs.mkdir(dataDir, { recursive: true })
  }

  try {
    await fs.access(usersFilePath)
  } catch {
    const defaultUsers = [
      {
        id: 1,
        username: 'admin',
        password: '1',
        email: 'admin@example.com',
        name: '管理员',
      },
    ]
    await fs.writeFile(usersFilePath, JSON.stringify(defaultUsers, null, 2), 'utf8')
  }
}

// 初始化用户数据文件
initializeUsersFile().catch((error) => {
  console.error('初始化用户数据文件失败:', error)
})

// 读取用户数据（异步）
export const readUsers = async () => {
  try {
    const data = await fs.readFile(usersFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('读取用户数据失败:', error)
    return []
  }
}

// 输入验证和清理
const validateInput = (username, password) => {
  // 去除首尾空格
  const cleanUsername = typeof username === 'string' ? username.trim() : ''
  const cleanPassword = typeof password === 'string' ? password.trim() : ''

  // 基本验证
  if (!cleanUsername || !cleanPassword) {
    return { valid: false, error: '用户名和密码不能为空' }
  }

  // 长度验证
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return { valid: false, error: '用户名长度必须在3-20个字符之间' }
  }

  if (cleanPassword.length < 1 || cleanPassword.length > 100) {
    return { valid: false, error: '密码长度必须在1-100个字符之间' }
  }

  // 用户名格式验证（只允许字母、数字、下划线）
  if (!/^[a-zA-Z0-9_]+$/.test(cleanUsername)) {
    return { valid: false, error: '用户名只能包含字母、数字和下划线' }
  }

  return { valid: true, username: cleanUsername, password: cleanPassword }
}

// 登录控制器
export const login = async (req, res) => {
  try {
    const { username, password } = req.body

    // 输入验证
    const validation = validateInput(username, password)
    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        message: validation.error,
      })
    }

    // 读取用户数据
    const users = await readUsers()

    // 查找用户
    const user = users.find(
      (u) => u.username === validation.username && u.password === validation.password
    )

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误',
      })
    }

    // 登录成功，返回用户信息（不包含密码）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      message: '登录成功',
      data: {
        user: userWithoutPassword,
        token: `token_${user.id}_${Date.now()}`, // 简单的 token 生成（实际应用中应使用 JWT）
      },
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    })
  }
}

// 验证token控制器
export const verifyToken = async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: '未提供token',
      })
    }

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

    if (!token || token.trim() === '') {
      return res.status(401).json({
        success: false,
        message: '未提供token',
      })
    }

    // 简单的token验证（实际应用中应使用JWT）
    const tokenParts = token.split('_')
    if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
      return res.status(401).json({
        success: false,
        message: '无效的token格式',
      })
    }

    const userId = parseInt(tokenParts[1], 10)
    if (isNaN(userId) || userId <= 0) {
      return res.status(401).json({
        success: false,
        message: '无效的token',
      })
    }

    const users = await readUsers()
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return res.status(401).json({
        success: false,
        message: '用户不存在',
      })
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { password: _, ...userWithoutPassword } = user

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    })
  } catch (error) {
    console.error('验证token错误:', error)
    res.status(500).json({
      success: false,
      message: '服务器内部错误',
    })
  }
}

// 从 Authorization 头解析并返回用户（若无效则返回对应的错误响应）
const getUserFromRequest = async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader) {
    res.status(401).json({ success: false, message: '未提供token' })
    return null
  }
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader
  const tokenParts = token.split('_')
  if (tokenParts.length !== 3 || tokenParts[0] !== 'token') {
    res.status(401).json({ success: false, message: '无效的token格式' })
    return null
  }
  const userId = parseInt(tokenParts[1], 10)
  if (isNaN(userId) || userId <= 0) {
    res.status(401).json({ success: false, message: '无效的token' })
    return null
  }
  const users = await readUsers()
  const user = users.find((u) => u.id === userId)
  if (!user) {
    res.status(401).json({ success: false, message: '用户不存在' })
    return null
  }
  return { users, user }
}

// 获取当前用户资料
export const getProfile = async (req, res) => {
  try {
    const result = await getUserFromRequest(req, res)
    if (!result) return
    const { user } = result
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { password: _, ...userWithoutPassword } = user
    res.json({
      success: true,
      data: { user: userWithoutPassword },
    })
  } catch (error) {
    console.error('获取用户资料错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}

// 更新当前用户资料（name、email、修改密码）
export const updateProfile = async (req, res) => {
  try {
    const result = await getUserFromRequest(req, res)
    if (!result) return
    const { users, user } = result

    const { name, email, currentPassword, newPassword } = req.body || {}

    // 基础校验
    const cleanName = typeof name === 'string' ? name.trim() : ''
    const cleanEmail = typeof email === 'string' ? email.trim() : ''
    if (!cleanName || !cleanEmail) {
      return res.status(400).json({ success: false, message: '姓名和邮箱不能为空' })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return res.status(400).json({ success: false, message: '邮箱格式不正确' })
    }

    // 如果要修改密码，需要提供 currentPassword 与 newPassword
    if ((currentPassword || newPassword) && (!currentPassword || !newPassword)) {
      return res.status(400).json({ success: false, message: '修改密码需同时提供当前密码与新密码' })
    }
    if (currentPassword && currentPassword !== user.password) {
      return res.status(400).json({ success: false, message: '当前密码不正确' })
    }
    if (newPassword && (typeof newPassword !== 'string' || newPassword.trim().length < 1)) {
      return res.status(400).json({ success: false, message: '新密码不能为空' })
    }

    // 更新信息
    user.name = cleanName
    user.email = cleanEmail
    if (newPassword) {
      user.password = newPassword.trim()
    }

    // 写回文件
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf8')

    // 返回去除密码后的用户信息
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const { password: _, ...userWithoutPassword } = user
    res.json({
      success: true,
      message: '资料已更新',
      data: { user: userWithoutPassword },
    })
  } catch (error) {
    console.error('更新用户资料错误:', error)
    res.status(500).json({ success: false, message: '服务器内部错误' })
  }
}
