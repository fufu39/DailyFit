import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import './index.css'
import App from './App.tsx'
import { MantineProvider, ColorSchemeScript, createTheme } from '@mantine/core'
import { useThemeStore } from './stores/themeStore'

// 创建一个自定义的Mantine主题对象
const theme = createTheme({
  primaryColor: 'blue', // 设置全局主色调为蓝色
})

// 主题提供对象：从store中订阅主题，然后强制注入到MantineProvider
function ThemeProvider({ children }: { children: React.ReactNode }) {
  // 获取当前主题色
  const colorScheme = useThemeStore((state) => state.colorScheme)

  // 在元素上添加自定义属性
  useEffect(() => {
    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme)
    // 下面这行body上添加是可选的
    document.body.setAttribute('data-mantine-color-scheme', colorScheme)
  }, [colorScheme])

  return (
    <MantineProvider theme={theme} forceColorScheme={colorScheme}>
      {children}
    </MantineProvider>
  )
}

// 防止页面闪烁
function getInitialColorScheme(): 'light' | 'dark' {
  try {
    // 直接读取本地存储的主题色
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (parsed?.state?.colorScheme) {
        return parsed.state.colorScheme
      }
    }
  } catch {
    // (忽略解析错误)
  }
  // 默认返回light
  return 'light'
}
const initialColorScheme = getInitialColorScheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 防止闪烁脚本，确保直接显示正确主题色 */}
    <ColorSchemeScript defaultColorScheme={initialColorScheme} />
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
)
