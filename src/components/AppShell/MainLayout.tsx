import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppShell,
  Burger,
  Group,
  Text,
  NavLink,
  Avatar,
  Menu,
  UnstyledButton,
  Stack,
  Box,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { AnimatePresence } from 'framer-motion'
// 导入Tabler Icons
import {
  IconHome,
  IconDashboard,
  IconCalendarWeek,
  IconUser,
  IconLogout,
  IconChevronDown,
  IconCheck,
  IconSun,
  IconMoon,
} from '@tabler/icons-react'
import logo from '../../assets/logo.png'
import styles from './MainLayout.module.css'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { notifications } from '@mantine/notifications'
import { ThemeToggleAnimation } from '../ThemeToggle/ThemeToggleAnimation'

// 定义组件 Props 的类型
interface MainLayoutProps {
  children: React.ReactNode
}

// 定义导航项结构类型
interface NavItem {
  label: string
  path: string
  icon: React.ComponentType<{ size?: number; stroke?: number }>
  requiresAuth?: boolean // 是否需要登录才能访问
}

// 导航数据配置
const navItems: NavItem[] = [
  { label: '首页', path: '/home', icon: IconHome },
  { label: '仪表盘', path: '/dashboard', icon: IconDashboard, requiresAuth: true },
  { label: '训练日志', path: '/logbook', icon: IconCalendarWeek, requiresAuth: true },
  { label: '个人资料', path: '/profile', icon: IconUser, requiresAuth: true },
]

export default function MainLayout({ children }: MainLayoutProps) {
  // 用于控制 Navbar 的开关状态，默认展开（true）
  const [opened, { toggle }] = useDisclosure(true)
  const navigate = useNavigate()
  const location = useLocation()
  // 控制用户下拉菜单的展开/收起状态
  const [userMenuOpened, setUserMenuOpened] = useState(false)
  // 控制主题切换动画
  const [isAnimating, setIsAnimating] = useState(false)
  // 记录动画的目标主题（切换后的主题）
  const [targetTheme, setTargetTheme] = useState<'light' | 'dark' | null>(null)
  const mainRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  // 导航处理函数
  const handleNavClick = (path: string) => {
    navigate(path)
  }

  const { user, logout } = useAuthStore()
  const { colorScheme, toggleColorScheme } = useThemeStore() // 从store中获取当前主题色和切换主题方法
  const isDark = colorScheme === 'dark'

  // 同步主题到 DOM
  useEffect(() => {
    document.documentElement.setAttribute('data-mantine-color-scheme', colorScheme)
    document.body.setAttribute('data-mantine-color-scheme', colorScheme)
  }, [colorScheme])

  // 路由切换时重置主内容区域的滚动位置
  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0 })
    }
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
    window.scrollTo({ top: 0, left: 0 })
  }, [location.pathname])

  // 主题切换处理函数
  const handleThemeToggle = () => {
    // 计算目标主题
    const newTheme = colorScheme === 'light' ? 'dark' : 'light'
    setTargetTheme(newTheme)
    setIsAnimating(true)

    // 在动画进行到60%时切换主题（360ms，动画总时长600ms）
    setTimeout(() => {
      toggleColorScheme()
    }, 360)
  }

  // 动画完成回调
  const handleAnimationComplete = () => {
    setIsAnimating(false)
    setTargetTheme(null)
  }

  // 登出处理函数
  const handleLogout = () => {
    logout()
    notifications.show({
      title: '退登成功',
      message: '欢迎下次再来~',
      icon: <IconCheck size={20} />,
      color: 'teal',
    })
    navigate('/login')
  }

  // 如果没有用户信息，显示默认值
  const displayUser = user || {
    name: '用户信息不存在',
    email: 'User not found',
  }

  return (
    <>
      {/* 主题切换动画 */}
      <AnimatePresence mode="wait">
        {isAnimating && targetTheme !== null && (
          <ThemeToggleAnimation
            key={targetTheme}
            isDark={targetTheme === 'dark'}
            onAnimationComplete={handleAnimationComplete}
          />
        )}
      </AnimatePresence>
      {/* 头部与侧边栏 */}
      <AppShell
        header={{ height: 75 }}
        navbar={{
          width: 300, // 侧边栏宽度
          breakpoint: 'sm', // 屏幕断点，区分移动端和桌面端
          collapsed: { mobile: !opened, desktop: !opened },
        }}
        padding="md"
        className={styles.appShell}
      >
        {/* AppShell.Header (头部导航栏) */}
        <AppShell.Header className={styles.header}>
          <Group h="100%" px="md" justify="space-between">
            <Group>
              {/* 汉堡菜单：小屏幕始终显示，大屏幕悬停 header 时显示，用于切换侧边栏 */}
              <Burger
                opened={opened}
                onClick={toggle}
                size="md"
                className={`${styles.burger} ${styles.burgerDesktop}`}
              />

              {/* Logo 和品牌名称：点击可回到首页 */}
              <Group
                gap="md"
                style={{ cursor: 'pointer' }}
                className={styles.brandGroup}
                onClick={() => handleNavClick('/home')}
              >
                <img src={logo} alt="DailyFit Logo" className={styles.logo} />
                <Text fw={700} size="lg" className={styles.brandText}>
                  DailyFit
                </Text>
                <Text
                  fw={700}
                  size="lg"
                  className={`${styles.brandText} ${styles.brandSubText}`}
                  style={{ marginLeft: '-8px' }}
                >
                  健身数据统计平台
                </Text>
              </Group>
            </Group>

            {/* 用户菜单区域 */}
            <Group gap="md">
              {/* Menu: 用户下拉菜单 */}
              <Menu
                width={200}
                position="bottom-end"
                opened={userMenuOpened}
                onChange={setUserMenuOpened}
              >
                <Menu.Target>
                  {/* 用户信息按钮：点击触发菜单 */}
                  <UnstyledButton className={styles.userButton}>
                    <Group gap="md">
                      {/* 用户头像 */}
                      <Avatar
                        variant={'light'}
                        size={42}
                        radius="xl"
                        color={user ? 'blue' : undefined}
                      >
                        {user ? displayUser.name.slice(0, 2).toUpperCase() : null}
                      </Avatar>
                      {/* 用户名和邮箱：仅在大屏幕 (>='sm') 显示 */}
                      <Box style={{ flex: 1 }} visibleFrom="sm">
                        <Text size="sm" fw={500}>
                          {displayUser.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {displayUser.email}
                        </Text>
                      </Box>
                      {/* 下拉箭头图标 */}
                      <IconChevronDown size={16} stroke={1.5} />
                    </Group>
                  </UnstyledButton>
                </Menu.Target>

                {/* 菜单下拉内容 */}
                <Menu.Dropdown>
                  <Menu.Item
                    leftSection={<IconUser size={16} />}
                    onClick={() => handleNavClick('/profile')}
                  >
                    个人资料
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={isDark ? <IconSun size={16} /> : <IconMoon size={16} />}
                    onClick={handleThemeToggle}
                  >
                    {isDark ? '浅色模式' : '深色模式'}
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    leftSection={<IconLogout size={16} />}
                    color="red"
                    onClick={handleLogout}
                  >
                    退出登录
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Group>
        </AppShell.Header>

        {/* AppShell.Navbar (侧边导航栏) */}
        <AppShell.Navbar p="md" className={styles.navbar}>
          <Stack gap="sm">
            {navItems.map((item) => {
              // 动态获取 Icon 组件
              const Icon = item.icon
              // 确定 NavLink 是否处于激活状态 (匹配精确路径或子路径)
              const isActive =
                location.pathname === item.path || location.pathname.startsWith(item.path + '/')

              return (
                // NavLink: Mantine 专用的导航链接组件
                <NavLink
                  key={item.path}
                  label={item.label}
                  leftSection={<Icon size={22} />} // 左侧图标
                  active={isActive} // 是否激活
                  onClick={() => handleNavClick(item.path)}
                  className={styles.navLink}
                  styles={{
                    label: { fontSize: '16px' },
                    body: { fontSize: '16px' },
                  }}
                />
              )
            })}
          </Stack>
        </AppShell.Navbar>

        {/* AppShell.Main (主内容区域) */}
        <AppShell.Main ref={mainRef} className={styles.main}>
          <Box ref={contentRef} className={styles.content}>
            {children}
          </Box>
        </AppShell.Main>
      </AppShell>
    </>
  )
}
