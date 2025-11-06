import React, { lazy, Suspense } from 'react'
import { Route, Navigate, Routes } from 'react-router-dom'
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

// 定义路由元数据接口（拓展：是否登录，是否使用主布局包裹）
type CustomRouteObject = RouteObject & {
  path: string
  element: React.ReactNode
  requiresAuth?: boolean
  hasLayout?: boolean
}

// 定义全局通用的加载骨架（用于Suspense）
const RouterFallback: React.FC = () => (
  <Center style={{ height: '100vh', flexDirection: 'column' }}>
    <Loader size="xl" />
    <Title order={3} mt="md">
      页面加载中...
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

  // 守卫逻辑：在外部包裹 AuthGuard
  if (requiresAuth) {
    // AuthGuard 负责检查登录状态，未登录则重定向到 /login
    wrappedElement = <AuthGuard>{wrappedElement}</AuthGuard>
  }

  // 布局逻辑：仅当 hasLayout 为 true 时，才包裹 MainLayout
  if (hasLayout) {
    // MainLayout 包含 Header, Sidebar 等应用壳
    wrappedElement = <MainLayout>{wrappedElement}</MainLayout>
  }

  // 使用Suspense包裹，处理切换路由时的加载状态
  return <Suspense fallback={<RouterFallback />}>{wrappedElement}</Suspense>
}

// 核心路由配置数组
export const routesConfig: CustomRouteObject[] = [
  // 公开路由
  { path: '/', element: <HomePage />, hasLayout: true },
  { path: '/login', element: <LoginPage />, hasLayout: false },
  // 私有路由
  { path: '/dashboard', element: <DashboardPage />, requiresAuth: true, hasLayout: true },
  { path: '/logbook', element: <LogbookPage />, requiresAuth: true, hasLayout: true },
  { path: '/logbook/:id', element: <LogbookDetailPage />, requiresAuth: true, hasLayout: true },
  { path: '/profile', element: <ProfilePage />, requiresAuth: true, hasLayout: true },
  // 404路由
  {
    path: '*',
    hasLayout: false, // 404页不需要全局布局
    element: (
      // 使用 Navigate 代替手动跳转，确保 404 页直接重定向到首页
      <Navigate to="/" replace />
    ),
  },
]

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {routesConfig.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          // 传递所有需要的属性给 ElementWrapper，ElementWrapper 负责守卫和布局
          element={
            <ElementWrapper element={route.element} requiresAuth={route.requiresAuth} hasLayout={route.hasLayout} />
          }
        />
      ))}
    </Routes>
  )
}

export default AppRouter
