import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Container,
  Title,
  SimpleGrid,
  Card,
  Text,
  Box,
  Button,
  Group,
  Avatar,
  Stack,
} from '@mantine/core'
import {
  IconChartLine,
  IconCalendarStats,
  IconTarget,
  IconUsers,
  IconTrophy,
  IconTrendingUp,
  IconStar,
  IconQuote,
  IconArrowRight,
} from '@tabler/icons-react'
import Lottie from 'lottie-react'
import styles from './HomePage.module.css'

// Slogan文字，用于逐个字符动画
const slogan = '记录你的每一次进步'

// 核心功能卡片数据
const features = [
  {
    icon: IconChartLine,
    title: '数据可视化',
    description: '丰富的图表展示体重、围度和训练数据趋势，支持自定义筛选，帮助科学分析进步。',
  },
  {
    icon: IconCalendarStats,
    title: '训练日志',
    description: '详细记录每次训练内容与时间，自动生成健身档案，便于回顾和发现成长。',
  },
  {
    icon: IconTarget,
    title: '目标管理',
    description: '设定个性化目标，系统智能提醒与进度追踪，让训练过程更有动力与方向感。',
  },
]

// Hero区域文字动画变体
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08, // 每个字符延迟0.08秒
      delayChildren: 0, // 整体延迟0秒
    },
  },
}

// 单个字符动画变体
const letterVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94] as const, // 平滑的缓动
    },
  },
}

// 核心功能卡片动画变体
const featureCardVariants = {
  hidden: {
    opacity: 0,
    y: 50,
  },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: i * 0.15, // 交错延迟
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
}

// 核心功能卡片悬停动画变体
const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.05,
    y: -8,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
}

// 平台数据卡片内容
const stats = [
  { label: '活跃用户', value: '10万+', icon: IconUsers },
  { label: '训练记录', value: '500万+', icon: IconTrendingUp },
  { label: '达成目标', value: '50万+', icon: IconTrophy },
]

// 用户评价
const testimonials = [
  {
    name: '张明',
    role: '健身爱好者',
    avatar: 'ZM',
    content:
      '使用DailyFit已经半年了，数据记录非常方便，图表展示也很直观，帮助我更好地追踪训练进度。',
    rating: 5,
  },
  {
    name: '李华',
    role: '专业教练',
    avatar: 'LH',
    content:
      '作为教练，我非常推荐我的学员使用DailyFit，它的目标管理功能非常实用，能有效激励学员坚持训练。',
    rating: 5,
  },
  {
    name: '王芳',
    role: '运动新手',
    avatar: 'WF',
    content:
      '刚开始健身时很迷茫，DailyFit的训练日志功能帮我建立了良好的记录习惯，现在我已经坚持3个月了！',
    rating: 5,
  },
]

// 在线Lottie动画URL
const LOTTIE_ANIMATION_URL = 'https://assets10.lottiefiles.com/packages/lf20_x62chJ.json'

// Lottie动画数据类型
interface LottieAnimationData {
  v: string
  fr: number
  ip: number
  op: number
  w: number
  h: number
  layers: unknown[]
  [key: string]: unknown
}

export default function HomePage() {
  const navigate = useNavigate()
  // Lottie动画数据状态
  const [lottieData, setLottieData] = useState<LottieAnimationData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 从在线URL加载Lottie动画
  useEffect(() => {
    const loadAnimation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(LOTTIE_ANIMATION_URL)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = (await response.json()) as LottieAnimationData
        // 验证数据格式
        if (!data || !data.v || !data.layers) {
          throw new Error('Invalid Lottie animation data format')
        }
        setLottieData(data)
        console.log('Lottie动画加载成功：', {
          version: data.v,
          layers: data.layers?.length || 0,
          duration: data.op || 'unknown',
        })
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load animation'
        console.error('Failed to load Lottie animation:', errorMessage)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    loadAnimation()
  }, [])

  return (
    <div className={styles.homePage}>
      {/* Hero区域 */}
      <Container size="xl" className={styles.heroSection}>
        <div className={styles.heroContent}>
          {/* 左侧Slogan文字区域 */}
          <motion.div
            className={styles.sloganContainer}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Title order={1} className={styles.sloganTitle}>
              {slogan.split('').map((char, index) => (
                <motion.span
                  key={index}
                  variants={letterVariants}
                  style={{ display: 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </Title>
            <Text size="lg" c="dimmed" className={styles.sloganSubtitle} mt="md">
              专业的健身数据管理平台，助您科学训练，持续进步
            </Text>
          </motion.div>

          {/* 右侧 Lottie 动画区域 */}
          <motion.div
            className={styles.lottieContainer}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            {isLoading ? (
              <Box
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '400px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--mantine-color-gray-1)',
                  borderRadius: '8px',
                }}
              >
                <Text c="dimmed">加载动画中...</Text>
              </Box>
            ) : error ? (
              <Box
                style={{
                  width: '100%',
                  height: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--mantine-color-gray-1)',
                  borderRadius: '8px',
                  gap: '8px',
                }}
              >
                <Text c="red" size="sm">
                  动画加载失败
                </Text>
                <Text c="dimmed" size="xs">
                  {error}
                </Text>
              </Box>
            ) : lottieData ? (
              <Lottie
                animationData={lottieData}
                loop={true}
                autoplay={true}
                className={styles.lottieAnimation}
              />
            ) : null}
          </motion.div>
        </div>
      </Container>

      {/* 核心功能区域 */}
      <Container size="xl" className={styles.featuresSection}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <Title order={2} ta="center" mb="xl" className={styles.featuresTitle}>
            核心功能
          </Title>
        </motion.div>

        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                custom={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-50px' }}
                variants={featureCardVariants}
              >
                <motion.div variants={cardHoverVariants} initial="rest" whileHover="hover">
                  <Card
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    withBorder
                    className={styles.featureCard}
                  >
                    <Box className={styles.featureIcon}>
                      <Icon size={48} stroke={1.5} />
                    </Box>
                    <Title order={3} size="h4" mt="md" mb="sm">
                      {feature.title}
                    </Title>
                    <Text size="sm" c="dimmed">
                      {feature.description}
                    </Text>
                  </Card>
                </motion.div>
              </motion.div>
            )
          })}
        </SimpleGrid>
      </Container>

      {/* 平台数据区域 */}
      <Box className={styles.statsSection}>
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <Title order={2} ta="center" mb="xl" className={styles.sectionTitle}>
              平台数据
            </Title>
          </motion.div>

          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card shadow="sm" padding="xl" radius="md" className={styles.statCard}>
                    <Stack align="center" gap="md">
                      <Box className={styles.statIcon}>
                        <Icon size={48} stroke={1.5} />
                      </Box>
                      <Title order={2} size="h1" className={styles.statValue}>
                        {stat.value}
                      </Title>
                      <Text size="xl" fw={700}>
                        {stat.label}
                      </Text>
                    </Stack>
                  </Card>
                </motion.div>
              )
            })}
          </SimpleGrid>
        </Container>
      </Box>

      {/* 用户评价区域 */}
      <Box className={styles.testimonialsSection}>
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <Title order={2} ta="center" mb="xl" className={styles.sectionTitle}>
              用户评价
            </Title>
          </motion.div>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  className={styles.testimonialCard}
                >
                  <Stack gap="md">
                    <Group gap="xs">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <IconStar
                          key={i}
                          size={18}
                          fill="var(--mantine-color-yellow-4)"
                          color="var(--mantine-color-yellow-4)"
                        />
                      ))}
                    </Group>
                    <Box className={styles.quoteIcon}>
                      <IconQuote size={32} stroke={1.5} />
                    </Box>
                    <Text size="sm" c="dimmed" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                      {testimonial.content}
                    </Text>
                    <Group gap="sm" mt="auto">
                      <Avatar color="blue" radius="xl">
                        {testimonial.avatar}
                      </Avatar>
                      <div>
                        <Text fw={500} size="sm">
                          {testimonial.name}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {testimonial.role}
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              </motion.div>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* 开启运动区域 */}
      <Box className={styles.ctaSection}>
        <Container size="xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.6 }}
          >
            <Card shadow="lg" padding="xl" radius="md" className={styles.ctaCard}>
              <Stack align="center" gap="lg">
                <Title order={2} ta="center" size="h1" className={styles.ctaTitle}>
                  开始您的健身之旅
                </Title>
                <Text size="lg" ta="center" c="dimmed" maw={600} className={styles.ctaSubTitle}>
                  加入 DailyFit，记录每一次训练，追踪每一份进步，成就更好的自己
                </Text>
                <Group gap="md" mt="md">
                  <Button
                    size="lg"
                    variant="filled"
                    rightSection={<IconArrowRight size={20} />}
                    className={styles.ctaButton}
                    onClick={() => navigate('/dashboard')}
                  >
                    立即开始
                  </Button>
                  <Button size="lg" variant="outline" className={styles.ctaButtonSecondary}>
                    了解更多
                  </Button>
                </Group>
              </Stack>
            </Card>
          </motion.div>
        </Container>
      </Box>
    </div>
  )
}
