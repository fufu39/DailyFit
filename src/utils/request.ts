import axios from 'axios'
import type { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../stores/authStore'
import { notifications } from '@mantine/notifications'

// API基础URL配置
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 响应数据接口
interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
}

// 创建 axios 实例
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 直接获取当前的state
    const authStore = useAuthStore.getState()
    const token = authStore.token

    // 如果存在 token，则添加到请求头
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError) => {
    // 请求错误处理
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  // 2xx范围内的状态码都会触发该函数
  (response: AxiosResponse<ApiResponse>) => {
    const { data } = response
    // 统一处理业务错误
    if (data.success === false) {
      const errorMessage = data.message || '请求失败，请稍后重试'
      notifications.show({
        title: '请求失败',
        message: errorMessage,
        color: 'red',
      })
      return Promise.reject(new Error(errorMessage))
    }
    return response
  },
  // 超出 2xx 范围的状态码都会触发该函数
  (error: AxiosError<ApiResponse>) => {
    const { response, request, message } = error
    // 处理 HTTP 错误响应
    if (response) {
      const { status, data } = response

      switch (status) {
        case 401: {
          // 未授权，token 过期或无效
          const authStore = useAuthStore.getState()
          authStore.logout()

          notifications.show({
            title: '登录已过期',
            message: '请重新登录',
            color: 'yellow',
          })
          break
        }

        case 403: {
          // 禁止访问
          notifications.show({
            title: '权限不足',
            message: data?.message || '您没有权限访问该资源',
            color: 'red',
          })
          break
        }

        case 404: {
          // 资源不存在
          notifications.show({
            title: '未找到资源',
            message: data?.message || '请求的资源不存在',
            color: 'red',
          })
          break
        }

        case 500: {
          // 服务器错误
          notifications.show({
            title: '服务器错误',
            message: data?.message || '服务器内部错误，请稍后重试',
            color: 'red',
          })
          break
        }

        default: {
          // 其他错误
          const errorMessage = data?.message || `请求失败 (${status})`
          notifications.show({
            title: '请求失败',
            message: errorMessage,
            color: 'red',
          })
        }
      }

      return Promise.reject(error)
    }

    // 请求已发出，但没有收到响应
    if (request) {
      notifications.show({
        title: '网络错误',
        message: '网络连接异常，请检查您的网络',
        color: 'red',
      })
      return Promise.reject(new Error('网络连接异常'))
    }

    // 其他错误
    notifications.show({
      title: '请求错误',
      message: message || '请求失败，请稍后重试',
      color: 'red',
    })
    return Promise.reject(error)
  }
)

// 导出配置好的axios实例
export default axiosInstance

// 导出类型
export type { ApiResponse, AxiosError }
