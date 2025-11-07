import React, { lazy, Suspense } from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { Center, Loader, Title } from '@mantine/core'

import MainLayout from '../components/AppShell/MainLayout'
import AuthGuard from '../components/AuthGuard/AuthGuard'
// 路由懒加载
const LoginPage = lazy(() => import('../pages/Login/LoginPage'))
const DashboardPage = lazy(() => import('../pages/Dashboard/DashboardPage'))
const HomePage = lazy(() => import('../pages/Home/HomePage'))
const LogbookPage = lazy(() => import('../pages/Logbook/LogbookPage'))
const LogbookDetailPage = lazy(() => import('../pages/Logbook/LogbookDetailPage'))
const ProfilePage = lazy(() => import('../pages/Profile/ProfilePage'))
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage'))

// 定义路由元数据接口（拓展：是否登录，是否使用主布局包裹）
type CustomRouteObject = RouteObject & {
  path: string
  element: React.ReactNode
  requiresAuth?: boolean
  hasLayout?: boolean
}

// 定义全局通用的加载骨架（用于Suspense）
const RouterFallback: React.FC = () => (
  <Center
    style={{
      minHeight: '100vh',
      flexDirection: 'column',
    }}
  >
    <Loader size="xl" color="blue" variant="bars" />
    <Title
      order={2}
      mt="lg"
      fw={600}
      style={{
        color: 'var(--mantine-color-blue-8, #1864ab)',
        letterSpacing: 1,
        textShadow: '0 2px 8px rgba(24, 100, 171, 0.06)',
      }}
    >
      页面加载中...
    </Title>
    <Title
      order={5}
      mt={8}
      fw={400}
      c="dimmed"
      style={{
        fontSize: 18,
        fontWeight: 400,
        marginTop: 0,
      }}
    >
      Please wait for a moment
    </Title>
  </Center>
)

// 路由渲染包装器：负责嵌套 MainLayout 和 AuthGuard
const ElementWrapper: React.FC<{
  element: React.ReactNode
  requiresAuth?: boolean
  hasLayout?: boolean
}> = ({ element, requiresAuth = false, hasLayout = true }) => {
  let wrappedElement = element
  // 守卫逻辑：负责检查登录状态，未登录则重定向到/login
  if (requiresAuth) {
    wrappedElement = <AuthGuard>{wrappedElement}</AuthGuard>
  }
  // 布局逻辑：MainLayout包含Header, Sidebar等结构
  if (hasLayout) {
    wrappedElement = <MainLayout>{wrappedElement}</MainLayout>
  }
  // 使用Suspense包裹，处理切换路由时的加载状态
  return <Suspense fallback={<RouterFallback />}>{wrappedElement}</Suspense>
}

// 核心路由配置数组
export const routesConfig: CustomRouteObject[] = [
  // 公开路由
  { path: '/', element: <Navigate to="/home" replace />, hasLayout: false },
  { path: '/home', element: <HomePage />, hasLayout: true },
  { path: '/login', element: <LoginPage />, hasLayout: false },
  // 私有路由
  { path: '/dashboard', element: <DashboardPage />, requiresAuth: true, hasLayout: true },
  { path: '/logbook', element: <LogbookPage />, requiresAuth: true, hasLayout: true },
  { path: '/logbook/:id', element: <LogbookDetailPage />, requiresAuth: true, hasLayout: true },
  { path: '/profile', element: <ProfilePage />, requiresAuth: true, hasLayout: true },
  // 404路由
  { path: '*', hasLayout: false, element: <NotFoundPage /> },
]

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {routesConfig.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            <ElementWrapper element={route.element} requiresAuth={route.requiresAuth} hasLayout={route.hasLayout} />
          }
        />
      ))}
    </Routes>
  )
}

export default AppRouter
