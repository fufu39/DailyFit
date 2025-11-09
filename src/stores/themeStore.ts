import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 主题模式类型
type ColorScheme = 'light' | 'dark'

// 主题状态接口定义
interface ThemeState {
  colorScheme: ColorScheme // 当前主题模式
  toggleColorScheme: () => void // 切换主题方法
}

export const useThemeStore = create<ThemeState>()(
  // localStorage持久化：自动存储和恢复主题设置
  persist(
    (set) => ({
      // 初始状态：默认为浅色模式
      colorScheme: 'light',
      // 切换主题方法
      toggleColorScheme: () => {
        set((state) => ({
          colorScheme: state.colorScheme === 'light' ? 'dark' : 'light',
        }))
      },
    }),
    {
      name: 'theme-storage',
    }
  )
)
