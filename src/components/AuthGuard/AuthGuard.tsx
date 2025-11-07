// 路由守卫：检查登录状态，未登录则重定向到/login
import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import request from '../../utils/request.tsx'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const { isAuthenticated, token, logout } = useAuthStore()
  // 使用 ref 来跟踪是否正在验证和上次验证的 token，避免重复请求
  const isVerifyingRef = useRef(false)
  const lastTokenRef = useRef<string | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      // 如果没有 token，直接重定向
      if (!token || !isAuthenticated) {
        navigate('/login')
        return
      }
      // 如果正在验证中，跳过重复请求
      if (isVerifyingRef.current) {
        return
      }
      // 如果 token 没有变化，跳过验证（避免不必要的请求）
      if (lastTokenRef.current === token) {
        return
      }

      // 验证token是否有效
      try {
        isVerifyingRef.current = true
        lastTokenRef.current = token
        const response = await request.get('/auth/verify', {
          // 禁用缓存，确保每次请求都是新的
          headers: {
            'Cache-Control': 'no-cache',
          },
        })
        console.log('/auth/verify结果：', response.data)
        if (!response.data.success) {
          lastTokenRef.current = null
          logout()
          navigate('/login')
        }
      } catch {
        // token 无效，清除状态并重定向（错误已在拦截器中处理）
        lastTokenRef.current = null
        logout()
        navigate('/login')
      } finally {
        isVerifyingRef.current = false
      }
    }

    checkAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]) // 只依赖 token，避免因为其他依赖项变化导致的重复执行

  // 如果未认证，不渲染子组件
  if (!isAuthenticated || !token) {
    return null
  }

  return <>{children}</>
}
