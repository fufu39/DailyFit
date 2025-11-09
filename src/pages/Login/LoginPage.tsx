import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form' // 导入React Hook Form用于表单状态管理
import { motion, AnimatePresence } from 'framer-motion'
import { TextInput, PasswordInput, Button, Title, Stack, Loader } from '@mantine/core'
import {
  IconCheck,
  IconRun,
  IconBike,
  IconSwimming,
  IconPlayBasketball,
  IconSnowboarding,
  IconPlayVolleyball,
} from '@tabler/icons-react'
import request from '../../utils/request.tsx'
import { useAuthStore } from '../../stores/authStore'
import { notifications } from '@mantine/notifications'
import logo from '../../assets/logo.png'
import styles from './LoginPage.module.css'

// 定义RHF的表单数据类型
interface LoginFormData {
  username: string
  password: string
}

// 定义登录API的响应数据类型
interface LoginResponse {
  success: boolean
  data: { user: { id: number; username: string; email: string; name: string }; token: string }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const [showCard, setShowCard] = useState(true) // 控制登录卡片显示/隐藏（用于登录成功后的淡出）
  const [shakeKey, setShakeKey] = useState(0) // 控制晃动动画的key（key改变会重新触发动画）
  const [isInitialMount, setIsInitialMount] = useState(true) // 标记是否为初始挂载（用于控制只在首次加载时播放淡入动画）
  const [isLoading, setIsLoading] = useState(false) // 控制登录按钮的加载状态

  // 打字效果相关状态
  const words = useMemo(
    () => [
      'Tracking',
      'Improving',
      'Challenging',
      'Moving',
      'Striving',
      'Growing',
      'Engaging',
      'Achieving',
      'Competing',
      'Winning',
    ],
    []
  )
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(100) // 打字速度（毫秒）

  // 背景图片
  const backgroundImages = [
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1486286701208-1d58e9338013?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
    'https://images.unsplash.com/photo-1626721105368-a69248e93b32?ixlib=rb-4.1.0&auto=format&fit=crop&w=1740&q=80',
  ]
  const [currentBgIndex, setCurrentBgIndex] = useState(0) // 当前背景图片的索引

  // 预加载所有背景图片
  useEffect(() => {
    backgroundImages.forEach((url) => {
      const img = new Image()
      img.src = url
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 点击Logo切换背景图片
  const handleLogoClick = () => {
    setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length)
  }

  // 监听shakeKey，0.5s后重置
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
        setIsInitialMount(false) // 300ms后标记为非初始挂载
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isInitialMount])

  // 打字效果逻辑
  useEffect(() => {
    const currentWord = words[currentWordIndex]
    let timeout: ReturnType<typeof setTimeout>

    if (!isDeleting) {
      // 打字阶段
      if (displayedText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length + 1))
        }, typingSpeed)
      } else {
        // 打字完成，等待2秒后开始删除
        timeout = setTimeout(() => {
          setIsDeleting(true)
          setTypingSpeed(100) // 删除时速度稍快
        }, 2400)
      }
    } else {
      // 删除阶段
      if (displayedText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayedText(currentWord.slice(0, displayedText.length - 1))
        }, typingSpeed)
      } else {
        setIsDeleting(false)
        setCurrentWordIndex((prev) => (prev + 1) % words.length)
        setTypingSpeed(100)
      }
    }

    return () => clearTimeout(timeout)
  }, [displayedText, isDeleting, currentWordIndex, words, typingSpeed])

  // 初始化React Hook Form
  const {
    register, // 用于注册输入框
    handleSubmit, // 用于包装onSubmit事件
    formState: { errors }, // 包含表单的错误状态
    setError, // 用于手动设置错误（例如API返回的错误）
  } = useForm<LoginFormData>({
    defaultValues: {
      // 表单默认值
      username: 'fufu39',
      password: '1',
    },
  })

  // 监测用户是否已登录，如果已登录则跳转到home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home', { replace: true })
    }
  }, [isAuthenticated, navigate])

  // RHF的onSubmit回调，表单验证通过后才调用handleLogin
  const onSubmit = (data: LoginFormData) => {
    handleLogin(data)
  }

  // 核心：处理登录逻辑
  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true)
    try {
      const response = await request.post<LoginResponse>('/login', {
        username: data.username,
        password: data.password,
      })
      console.log('/login结果：', response.data)

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
        // 等待淡出动画 (300ms) 完成后跳转
        setTimeout(() => {
          navigate('/home')
        }, 300)
      }
    } catch (err: unknown) {
      setShakeKey((prev) => prev + 1) // 触发晃动动画

      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        '用户名或密码错误'

      // 使用RHF的setError将错误信息显示在密码框下方
      setError('password', {
        type: 'manual',
        message: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 定义Framer Motion动画变体 (variants)
  const cardVariants = {
    initial: {
      // 初始状态 (进入前)
      opacity: 0,
      scale: 0.9,
    },
    animate: {
      // 动画状态 (进入后)
      opacity: 1,
      scale: 1,
      x: 0,
    },
    shake: {
      x: [0, -5, 5, -5, 5, 0], // x轴位移的关键帧
    },
  }

  return (
    <div className={styles.loginContainer}>
      {/* 背景图片层 */}
      <AnimatePresence>
        <motion.div
          key={`bg-${currentBgIndex}`} // key随index变化，触发AnimatePresence
          className={styles.backgroundLayer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            backgroundImage: `url(${backgroundImages[currentBgIndex]})`, // 动态设置背景图
          }}
        />
      </AnimatePresence>
      {/* Logo */}
      <img
        src={logo}
        alt="DailyFit Logo"
        className={styles.logo}
        onClick={handleLogoClick} // 点击切换背景
        style={{ cursor: 'pointer' }}
      />
      {/* 装饰性运动图标元素 */}
      <div className={`${styles.decorativeIcon} ${styles.icon1}`}>
        <div className={styles.iconWrapper}>
          <IconRun size={60} color="rgb(255, 255, 255)" stroke={2} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon2}`}>
        <div className={styles.iconWrapper}>
          <IconPlayBasketball size={50} color="rgb(255, 255, 255)" stroke={2} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon3}`}>
        <div className={styles.iconWrapper}>
          <IconBike size={64} color="rgba(255, 255, 255)" stroke={2} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon4}`}>
        <div className={styles.iconWrapper}>
          <IconSwimming size={66} color="rgba(255, 255, 255)" stroke={2} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon5}`}>
        <div className={styles.iconWrapper}>
          <IconPlayVolleyball size={68} color="rgba(255, 255, 255)" stroke={2} />
        </div>
      </div>
      <div className={`${styles.decorativeIcon} ${styles.icon6}`}>
        <div className={styles.iconWrapper}>
          <IconSnowboarding size={52} color="rgba(255, 255, 255)" stroke={2} />
        </div>
      </div>
      {/* 描述文字 - 移出卡片容器，独立定位 */}
      <div className={styles.descriptionText}>
        <div className={styles.descriptionLine1}>Your daily fit, simplified</div>
        <div className={styles.descriptionLine2}>
          Keep <span className={styles.typingText}>{displayedText}</span>
          <span className={styles.cursor}>|</span>
        </div>
      </div>
      {/* 登录框 */}
      <AnimatePresence mode="wait">
        {showCard && (
          <motion.div
            key={shakeKey > 0 ? `login-card-shake-${shakeKey}` : 'login-card'}
            variants={cardVariants}
            // 初始动画：仅在isInitialMount且shakeKey为0时播放initial
            initial={isInitialMount && shakeKey === 0 ? 'initial' : false}
            // 激活的动画：如果shakeKey>0，播放shake，否则播放animate
            animate={shakeKey > 0 ? 'shake' : 'animate'}
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
            {/* 玻璃拟态卡片 */}
            <div className={styles.glassCard}>
              <Title order={2} className={styles.title}>
                Login to your account
              </Title>

              {/* 表单：使用RHF的handleSubmit包装 */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack>
                  <div className={styles.inputWrapper}>
                    <TextInput
                      label="Username"
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
                      label="Password"
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
                    {isLoading ? '正在登录中...' : '登录'}
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
