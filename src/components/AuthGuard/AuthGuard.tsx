// 路由守卫：检查登录状态，未登录则重定向到/login
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import request from '../../utils/request'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const { isAuthenticated, token, logout } = useAuthStore()

  useEffect(() => {
    const checkAuth = async () => {
      // 如果没有 token，直接重定向
      if (!token || !isAuthenticated) {
        navigate('/login')
        return
      }

      // 验证 token 是否有效
      try {
        const response = await request.get('/auth/verify')
        if (!response.data.success) {
          logout()
          navigate('/login')
        }
      } catch {
        // token 无效，清除状态并重定向（错误已在拦截器中处理）
        logout()
        navigate('/login')
      }
    }

    checkAuth()
  }, [token, isAuthenticated, navigate, logout])

  // 如果未认证，不渲染子组件
  if (!isAuthenticated || !token) {
    return null
  }

  return <>{children}</>
}
