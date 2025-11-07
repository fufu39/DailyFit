import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AppShell, Burger, Group, Text, NavLink, Avatar, Menu, UnstyledButton, Stack, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
// 导入Tabler Icons
import { IconHome, IconDashboard, IconCalendarWeek, IconUser, IconLogout, IconChevronDown } from '@tabler/icons-react'
import logo from '../../assets/logo.png'
import styles from './MainLayout.module.css'
import { useAuthStore } from '../../stores/authStore'
import { notifications } from '@mantine/notifications'

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

  // 导航处理函数
  const handleNavClick = (path: string) => {
    navigate(path)
  }

  const { user, logout } = useAuthStore()

  // 登出处理函数
  const handleLogout = () => {
    logout()
    notifications.show({
      title: '已退出登录',
      message: '您已成功退出登录',
      color: 'blue',
    })
    navigate('/login')
  }

  // 如果没有用户信息，显示默认值
  const displayUser = user || {
    name: '用户信息不存在',
    email: 'User not found',
  }

  return (
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
            <Burger opened={opened} onClick={toggle} size="md" className={`${styles.burger} ${styles.burgerDesktop}`} />

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
            <Menu width={200} position="bottom-end" opened={userMenuOpened} onChange={setUserMenuOpened}>
              <Menu.Target>
                {/* 用户信息按钮：点击触发菜单 */}
                <UnstyledButton className={styles.userButton}>
                  <Group gap="md">
                    {/* 用户头像 */}
                    <Avatar variant={'light'} size={42} radius="xl" color={user ? 'blue' : undefined}>
                      {user ? displayUser.name.charAt(0).toUpperCase() : null}
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
                <Menu.Item leftSection={<IconUser size={16} />} onClick={() => handleNavClick('/profile')}>
                  个人资料
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={handleLogout}>
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
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')

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
      <AppShell.Main className={styles.main}>
        <Box className={styles.content}>{children}</Box>
      </AppShell.Main>
    </AppShell>
  )
}
