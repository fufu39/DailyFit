import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { TextInput, PasswordInput, Button, Title, Text, Stack, Loader } from '@mantine/core'
import { IconCheck, IconRun, IconBarbell, IconBike, IconSwimming, IconYoga, IconHeartbeat } from '@tabler/icons-react'
import request from '../../utils/request.tsx'
import { useAuthStore } from '../../stores/authStore'
import { notifications } from '@mantine/notifications'
import logo from '../../assets/logo.png'
import styles from './LoginPage.module.css'

interface LoginFormData {
  username: string
  password: string
}

interface LoginResponse {
  success: boolean
  data: { user: { id: number; username: string; email: string; name: string }; token: string }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [showCard, setShowCard] = useState(true)
  const [shakeKey, setShakeKey] = useState(0)
  const [isInitialMount, setIsInitialMount] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  // 背景图片URL列表
  // 先cover居中再固定大小
  const backgroundImages = [
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1486286701208-1d58e9338013?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1626721105368-a69248e93b32?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
  ]
  const [currentBgIndex, setCurrentBgIndex] = useState(0)

  // 切换背景图片
  const handleLogoClick = () => {
    setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length)
  }

  // 监听晃动动画完成，重置状态
  useEffect(() => {
    if (shakeKey > 0) {
      const timer = setTimeout(() => {
        setShakeKey(0)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [shakeKey])

  // 标记初始挂载完成
  useEffect(() => {
    if (isInitialMount) {
      const timer = setTimeout(() => {
        setIsInitialMount(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isInitialMount])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    defaultValues: {
      username: '',
      password: '',
    },
  })

  // 检查用户是否已登录，如果已登录则跳转到 home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // 处理登录
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await request.post<LoginResponse>('/login', {
        username: data.username,
        password: data.password,
      })

      if (response.data.success) {
        const { user, token } = response.data.data
        login(user, token)

        notifications.show({
          title: '登录成功',
          message: `欢迎回来，${user.name}~`,
          icon: <IconCheck size={20} />,
          color: 'teal',
        })

        // 触发淡出动画
        setShowCard(false)

        // 等待动画完成后导航
        setTimeout(() => {
          navigate('/dashboard')
        }, 300)
      }
    } catch (err: unknown) {
      // 登录失败时触发晃动动画
      setShakeKey((prev) => prev + 1)

      // 设置表单错误
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '用户名或密码错误'
      setError('password', {
        type: 'manual',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = (data: LoginFormData) => {
    handleLogin(data)
  }

  // 定义动画变体
  const cardVariants = {
    initial: {
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      opacity: 1,
      scale: 1,
      x: 0,
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0],
    },
    exit: {
      opacity: 0,
    },
  }

  return (
    <div
      className={styles.loginContainer}
      style={{
        backgroundImage: `url(${backgroundImages[currentBgIndex]})`,
      }}
    >
      {/* Logo */}
      <img
        src={logo}
        alt="DailyFit Logo"
        className={styles.logo}
        onClick={handleLogoClick}
        style={{ cursor: 'pointer' }}
      />

      {/* 装饰性运动图标元素 */}
      <div className={`${styles.decorativeIcon} ${styles.icon1}`}>
        <div className={styles.iconWrapper}>
          <IconRun size={56} color="rgba(255, 255, 255, 0.95)" stroke={2.5} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon2}`}>
        <div className={styles.iconWrapper}>
          <IconBarbell size={48} color="rgba(255, 255, 255, 0.95)" stroke={2.5} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon3}`}>
        <div className={styles.iconWrapper}>
          <IconBike size={44} color="rgba(255, 255, 255, 0.95)" stroke={2.5} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon4}`}>
        <div className={styles.iconWrapper}>
          <IconSwimming size={40} color="rgba(255, 255, 255, 0.95)" stroke={2.5} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon5}`}>
        <div className={styles.iconWrapper}>
          <IconYoga size={38} color="rgba(255, 255, 255, 0.95)" stroke={2.5} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon6}`}>
        <div className={styles.iconWrapper}>
          <IconHeartbeat size={36} color="rgba(255, 255, 255, 0.95)" stroke={2.5} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {showCard && (
          <motion.div
            key={shakeKey > 0 ? `login-card-shake-${shakeKey}` : 'login-card'}
            variants={cardVariants}
            initial={isInitialMount && shakeKey === 0 ? 'initial' : false}
            animate={shakeKey > 0 ? 'shake' : 'animate'}
            exit="exit"
            transition={
              shakeKey > 0
                ? {
                    x: {
                      duration: 0.5,
                      ease: 'easeInOut' as const,
                      times: [0, 0.2, 0.4, 0.6, 0.8, 1],
                    },
                  }
                : {
                    opacity: { duration: 0.3, ease: 'easeOut' as const },
                    scale: { duration: 0.3, ease: 'easeOut' as const },
                  }
            }
            className={styles.cardWrapper}
          >
            <div className={styles.glassCard}>
              <Title order={2} className={styles.title}>
                登录
              </Title>
              <Text className={styles.subtitle}>请输入您的用户名和密码</Text>

              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack>
                  <div className={styles.inputWrapper}>
                    <TextInput
                      label="用户名"
                      placeholder="请输入用户名"
                      {...register('username', {
                        required: '请输入用户名',
                      })}
                      error={errors.username?.message}
                      disabled={isLoading}
                    />
                  </div>
                  <div className={styles.inputWrapper}>
                    <PasswordInput
                      label="密码"
                      placeholder="请输入密码"
                      {...register('password', {
                        required: '请输入密码',
                      })}
                      error={errors.password?.message}
                      disabled={isLoading}
                    />
                  </div>
                  <Button
                    type="submit"
                    fullWidth
                    className={styles.submitButton}
                    disabled={isLoading}
                    leftSection={isLoading ? <Loader size="sm" color="white" /> : null}
                  >
                    {isLoading ? '登录中...' : '登录'}
                  </Button>
                </Stack>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
