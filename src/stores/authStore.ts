import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 用户信息接口定义：user对象的字段
interface User {
  id: number
  username: string
  email: string
  name: string
}
// 状态结构接口定义
interface AuthState {
  user: User | null // 当前登录的用户信息
  token: string | null // 登录token
  isAuthenticated: boolean // 是否已登录
  login: (user: User, token: string) => void // 登录方法
  updateUser: (user: User) => void // 更新用户资料
  logout: () => void // 登出方法
}

export const useAuthStore = create<AuthState>()(
  // localStorage持久化：自动存储和恢复
  persist(
    (set) => ({
      // 初始状态
      user: null,
      token: null,
      isAuthenticated: false,
      // 登录方法
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true,
        })
      },
      // 更新用户资料
      updateUser: (user) => {
        set((state) => ({
          ...state,
          user,
        }))
      },
      // 登出方法
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        })
      },
    }),
    // persist配置对象，也就是存储在localStorage中的 key
    {
      name: 'auth-storage',
    }
  )
)
