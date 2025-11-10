import { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Container,
  Grid,
  Card,
  Title,
  Text,
  Skeleton,
  Stack,
  Group,
  ActionIcon,
  Modal,
  Box,
  Badge,
  Select,
  Tooltip,
  Table,
  ScrollArea,
} from '@mantine/core'
import {
  IconEye,
  IconTrophy,
  IconCalendar,
  IconChartLine,
  IconRadar,
  IconChartBar,
  IconChartPie,
  IconClipboardList,
  IconClock,
  IconCheck,
  IconX,
} from '@tabler/icons-react'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import Lottie from 'lottie-react'
import axiosInstance from '../../utils/request'
import styles from './DashboardPage.module.css'

// Lottie 加载动画 URL（旋转加载动画）
const LOTTIE_LOADING_URL = 'https://assets5.lottiefiles.com/packages/lf20_jcikwtux.json'

// 接口数据类型定义
interface DashboardData {
  trainingCalendar: Array<[string, number]>
  weightTrend: Array<[string, number]>
  personalRecords: Array<{
    name: string
    value: string
    date: string
    icon: string
  }>
  bodyPartDistribution: Array<{
    name: string
    value: number
  }>
  weeklyTrainingHours?: Array<[string, number]>
  exerciseTypeDistribution?: Array<{
    name: string
    value: number
  }>
  recentTrainingRecords?: Array<{
    date: string
    dateString: string
    exerciseType: string
    bodyPart: string
    duration: string
    intensity: string
    calories: string
  }>
  weeklyTrainingPlan?: Array<{
    day: string
    date: string
    dateString: string
    type: string
    exercises: string
    duration: string
    status: 'pending' | 'completed' | 'missed'
  }>
}

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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const [lottieData, setLottieData] = useState<LottieAnimationData | null>(null)
  const [showLottie, setShowLottie] = useState(true)
  const [openedModal, setOpenedModal] = useState<string | null>(null)

  // 训练日历状态
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedDateData, setSelectedDateData] = useState<number | null>(null)
  const [isMobile, setIsMobile] = useState<boolean>(false)

  // ECharts实例引用
  const weightChartRef = useRef<HTMLDivElement>(null)
  const radarChartRef = useRef<HTMLDivElement>(null)
  const weeklyChartRef = useRef<HTMLDivElement>(null)
  const pieChartRef = useRef<HTMLDivElement>(null)
  const weightChartInstance = useRef<echarts.ECharts | null>(null)
  const radarChartInstance = useRef<echarts.ECharts | null>(null)
  const weeklyChartInstance = useRef<echarts.ECharts | null>(null)
  const pieChartInstance = useRef<echarts.ECharts | null>(null)

  // 加载Lottie动画数据
  useEffect(() => {
    const loadLottie = async () => {
      try {
        const response = await fetch(LOTTIE_LOADING_URL)
        if (response.ok) {
          const animationData = (await response.json()) as LottieAnimationData
          setLottieData(animationData)
        }
      } catch (error) {
        console.error('加载 Lottie 动画失败:', error)
      }
    }
    loadLottie()
  }, [])

  // 获取仪表盘数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axiosInstance.get<{ success: boolean; data: DashboardData }>(
          '/dashboard'
        )
        console.log('仪表盘数据：', response.data.data)

        if (response.data.success) {
          setData(response.data.data)
        }
      } catch (error) {
        console.error('获取仪表盘数据失败:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // 检测窗口大小，判断是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Loading 时隐藏 body 滚动条
  useEffect(() => {
    if (showLottie && isFirstLoad) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [showLottie, isFirstLoad])

  // 控制首次加载时的 Lottie 动画显示与淡出
  useEffect(() => {
    if (!isFirstLoad) return

    if (!isLoading) {
      let exitTimeout: number | null = null
      const timeout = window.setTimeout(() => {
        setShowLottie(false)
        exitTimeout = window.setTimeout(() => {
          setIsFirstLoad(false)
        }, 300)
      }, 1500)
      return () => {
        window.clearTimeout(timeout)
        if (exitTimeout !== null) {
          window.clearTimeout(exitTimeout)
        }
      }
    }

    setShowLottie(true)
  }, [isLoading, isFirstLoad])

  // 获取指定年份的训练数据
  const yearTrainingData = useMemo(() => {
    if (!data) return {}
    const dataMap: Record<string, number> = {}

    data.trainingCalendar.forEach(([date, value]) => {
      const dateObj = new Date(date)
      if (dateObj.getFullYear() === selectedYear) {
        dataMap[date] = value
      }
    })
    console.log('dataMap：', dataMap)

    return dataMap
  }, [data, selectedYear])

  const heatmapWeeks = useMemo(() => {
    if (!data) return []

    // 获取年份的第一天和最后一天
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear, 11, 31)

    // 计算第一天是星期几（0=周日，1=周一...）
    const startDayOfWeek = startDate.getDay()

    // 生成所有日期
    const days: Array<{ date: Date; dateString: string; value: number | null }> = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(
        currentDate.getDate()
      ).padStart(2, '0')}`
      days.push({
        date: new Date(currentDate),
        dateString,
        value: yearTrainingData[dateString] ?? null,
      })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // 按周分组（从周日开始）
    const weeks: (typeof days)[] = []
    let currentWeek: typeof days = []

    // 填充第一周前面的空白
    for (let i = 0; i < startDayOfWeek; i++) {
      currentWeek.push({
        date: new Date(0),
        dateString: '',
        value: null,
      })
    }

    // 填充日期
    days.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    // 如果最后一周不满7天，填充空白
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          dateString: '',
          value: null,
        })
      }
      weeks.push(currentWeek)
    }

    return weeks
  }, [data, selectedYear, yearTrainingData])

  // 处理日期点击
  const handleDateClick = (date: string) => {
    const value = yearTrainingData[date]
    if (value !== undefined) {
      setSelectedDate(date)
      setSelectedDateData(value)
      setOpenedModal('calendar')
    }
  }

  // 初始化体重趋势图表
  useEffect(() => {
    if (!data || !weightChartRef.current) return

    // 安全地销毁旧实例
    if (weightChartInstance.current && !weightChartInstance.current.isDisposed()) {
      try {
        weightChartInstance.current.dispose()
      } catch {
        // 忽略已销毁的实例错误
      }
    }

    const chart = echarts.init(weightChartRef.current)
    weightChartInstance.current = chart

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          if (Array.isArray(params) && params.length > 0) {
            const param = params[0] as { axisValue: string; value: number }
            return `${param.axisValue}<br/>体重: ${param.value}kg`
          }
          return ''
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: data.weightTrend.map((item) => item[0]),
      },
      yAxis: {
        type: 'value',
        name: '体重(kg)',
      },
      series: [
        {
          name: '体重',
          type: 'line',
          smooth: true,
          data: data.weightTrend.map((item) => item[1]),
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(58, 77, 233, 0.3)' },
                { offset: 1, color: 'rgba(58, 77, 233, 0.1)' },
              ],
            },
          },
          lineStyle: {
            color: '#3a4de9',
            width: 3,
          },
          itemStyle: {
            color: '#3a4de9',
          },
          animation: true,
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => {
      if (!chart.isDisposed()) {
        chart.resize()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (!chart.isDisposed()) {
        chart.dispose()
      }
    }
  }, [data])

  // 初始化周训练时长柱状图
  useEffect(() => {
    if (!data || !weeklyChartRef.current || !data.weeklyTrainingHours) return

    if (weeklyChartInstance.current && !weeklyChartInstance.current.isDisposed()) {
      try {
        weeklyChartInstance.current.dispose()
      } catch {
        // 忽略已销毁的实例错误
      }
    }

    const chart = echarts.init(weeklyChartRef.current)
    weeklyChartInstance.current = chart

    const option: EChartsOption = {
      tooltip: {
        trigger: 'axis',
        formatter: (params: unknown) => {
          if (Array.isArray(params) && params.length > 0) {
            const param = params[0] as { axisValue: string; value: number }
            return `${param.axisValue}<br/>训练时长: ${param.value}小时`
          }
          return ''
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.weeklyTrainingHours.map((item) => item[0]),
      },
      yAxis: {
        type: 'value',
        name: '小时',
      },
      series: [
        {
          name: '训练时长',
          type: 'bar',
          data: data.weeklyTrainingHours.map((item) => item[1]),
          itemStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#3a4de9' },
                { offset: 1, color: '#5b6ef7' },
              ],
            },
          },
          animation: true,
          animationDuration: 1500,
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => {
      if (!chart.isDisposed()) {
        chart.resize()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (!chart.isDisposed()) {
        chart.dispose()
      }
    }
  }, [data])

  // 初始化运动类型分布饼图
  useEffect(() => {
    if (!data || !pieChartRef.current || !data.exerciseTypeDistribution) return

    if (pieChartInstance.current && !pieChartInstance.current.isDisposed()) {
      try {
        pieChartInstance.current.dispose()
      } catch {
        // 忽略已销毁的实例错误
      }
    }

    const chart = echarts.init(pieChartRef.current)
    pieChartInstance.current = chart

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: '运动类型',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}: {d}%',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          data: data.exerciseTypeDistribution.map((item) => ({
            value: item.value,
            name: item.name,
          })),
          animation: true,
          animationDuration: 1500,
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => {
      if (!chart.isDisposed()) {
        chart.resize()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (!chart.isDisposed()) {
        chart.dispose()
      }
    }
  }, [data])

  // 初始化训练部位分布雷达图
  useEffect(() => {
    if (!data || !radarChartRef.current) return

    // 安全地销毁旧实例
    if (radarChartInstance.current && !radarChartInstance.current.isDisposed()) {
      try {
        radarChartInstance.current.dispose()
      } catch {
        // 忽略已销毁的实例错误
      }
    }

    const chart = echarts.init(radarChartRef.current)
    radarChartInstance.current = chart

    // 计算最大值，避免使用固定的30
    const maxValue = Math.max(...data.bodyPartDistribution.map((item) => item.value), 10)
    const roundedMax = Math.ceil(maxValue / 10) * 10

    const option: EChartsOption = {
      tooltip: {
        trigger: 'item',
      },
      radar: {
        indicator: data.bodyPartDistribution.map((item) => ({
          name: item.name,
          max: roundedMax,
        })),
        center: ['50%', '55%'],
        radius: '70%',
        axisName: {
          color: '#333',
          fontSize: 14,
          fontWeight: 500,
        },
        splitArea: {
          show: true,
          areaStyle: {
            color: ['rgba(58, 77, 233, 0.05)', 'rgba(58, 77, 233, 0.1)'],
          },
        },
      },
      series: [
        {
          name: '训练部位分布',
          type: 'radar',
          data: [
            {
              value: data.bodyPartDistribution.map((item) => item.value),
              name: '训练占比',
              areaStyle: {
                color: 'rgba(58, 77, 233, 0.3)',
              },
              lineStyle: {
                color: '#3a4de9',
                width: 2,
              },
              itemStyle: {
                color: '#3a4de9',
              },
            },
          ],
          animation: true,
          animationDuration: 1500,
        },
      ],
    }

    chart.setOption(option)

    const handleResize = () => {
      if (!chart.isDisposed()) {
        chart.resize()
      }
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (!chart.isDisposed()) {
        chart.dispose()
      }
    }
  }, [data])

  // 生成 GitHub 风格的热力图
  const renderHeatmapCalendar = () => {
    if (!data) return null

    const weeks = heatmapWeeks
    const monthLabels = [
      '1月',
      '2月',
      '3月',
      '4月',
      '5月',
      '6月',
      '7月',
      '8月',
      '9月',
      '10月',
      '11月',
      '12月',
    ]
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']

    // 计算每个月的第一天所在的周索引（用于对齐显示月份标签到月份开始）
    const monthPositions: Record<number, number> = {}

    // 遍历所有周，找到每个月的第一天所在的周
    weeks.forEach((week, weekIndex) => {
      week.forEach((day) => {
        if (day.dateString && day.date.getTime() !== 0) {
          const date = day.date
          const month = date.getMonth()
          const dayOfMonth = date.getDate()

          // 如果是该月的第一天，且该月还没有记录位置，则记录
          if (dayOfMonth === 1 && monthPositions[month] === undefined) {
            monthPositions[month] = weekIndex
          }
        }
      })
    })

    // 获取强度颜色
    const getIntensityColor = (intensity: number | null) => {
      if (intensity === null) return '#ebedf0'
      const intensityColors = ['#ebedf0', '#c6e48b', '#7bc96f', '#239a3b', '#196127']
      return intensityColors[Math.min(intensity, 4)]
    }

    // 格式化日期显示
    const formatDate = (dateString: string) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }

    return (
      <Stack gap="md">
        {/* 年份选择器 */}
        <Group justify="space-between" align="center" mb="sm">
          <Title order={4}>训练日历</Title>
          <Select
            value={selectedYear.toString()}
            onChange={(value) => value && setSelectedYear(parseInt(value, 10))}
            data={['2023', '2024', '2025'].map((year) => ({ value: year, label: `${year}年` }))}
            w={120}
            size="sm"
          />
        </Group>

        {/* 图例 */}
        <Group gap="xs" justify="flex-end" mb="xs">
          <Text size="xs" c="dimmed" mr="sm">
            强度
          </Text>
          {['无', '低', '中', '高', '极高'].map((label, index) => (
            <Group key={index} gap={4}>
              <Box
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: getIntensityColor(index),
                  border: '1px solid rgba(0,0,0,0.1)',
                }}
              />
              <Text size="xs" c="dimmed">
                {label}
              </Text>
            </Group>
          ))}
        </Group>

        {/* 热力图 */}
        <Box className={styles.heatmapContainer}>
          {/* 月份标签 */}
          <Box className={styles.monthLabels}>
            {monthLabels.map((month, index) => {
              // index 是月份标签索引（0-11），对应月份数字（0-11）
              const monthNum = index
              const weekIndex = monthPositions[monthNum]
              // 如果该月没有位置数据，跳过（理论上不应该发生，因为生成了一整年的数据）
              if (weekIndex === undefined) return null

              // 基于实际周列位置计算：每个周列宽度 = 方块宽度 + gap
              // 响应式：移动端使用 9px 方块 + 3px gap，桌面端使用 11px 方块 + 3px gap
              // 左侧padding：移动端 30px，桌面端 40px
              // 周列开始位置 = 左侧padding + weekIndex * 周列宽度
              // 月份标签左边缘对齐到周列开始位置
              const dayWidth = isMobile ? 9 : 11 // 日期方块宽度（响应式）
              const gap = 3 // 间距
              const weekColumnWidth = dayWidth + gap // 周列宽度
              const leftPadding = isMobile ? 30 : 40 // 左侧padding（响应式，与weekLabels对齐）
              const position = leftPadding + weekIndex * weekColumnWidth

              // 检查是否与前面的月份标签重叠，如果重叠则跳过（避免显示重复的月份标签）
              // 由于月份标签按照1-12月的顺序渲染，1月会最先显示在最前面
              const shouldShow =
                index === 0 ||
                monthPositions[monthNum - 1] === undefined ||
                weekIndex !== monthPositions[monthNum - 1]

              if (!shouldShow) return null

              return (
                <Box
                  key={index}
                  className={styles.monthLabel}
                  style={{ left: `${position}px` }}
                  data-week-index={weekIndex}
                  data-month={monthNum}
                >
                  {month}
                </Box>
              )
            })}
          </Box>

          {/* 星期标签 */}
          <Box className={styles.weekLabels}>
            {weekDays.map((day, index) => {
              // 只在特定位置显示标签（如周一、周三、周五）
              if (index % 2 === 0) {
                return (
                  <Box key={index} className={styles.weekLabel}>
                    {day}
                  </Box>
                )
              }
              return <Box key={index} className={styles.weekLabel} />
            })}
          </Box>

          {/* 热力图网格 */}
          <Box className={styles.heatmapGrid}>
            {weeks.map((week, weekIndex) => (
              <Box key={weekIndex} className={styles.heatmapWeek}>
                {week.map((day, dayIndex) => {
                  if (!day.dateString || day.date.getTime() === 0) {
                    return (
                      <Box
                        key={`${weekIndex}-${dayIndex}`}
                        className={styles.heatmapDay}
                        style={{ backgroundColor: 'transparent' }}
                      />
                    )
                  }

                  const hasData = day.value !== null
                  const intensity = day.value ?? 0
                  const bgColor = getIntensityColor(intensity)
                  return (
                    <Tooltip
                      key={day.dateString}
                      label={
                        hasData
                          ? `${formatDate(day.dateString)} - 训练强度: ${intensity}/5`
                          : formatDate(day.dateString)
                      }
                      position="top"
                      withArrow
                    >
                      <Box
                        className={styles.heatmapDay}
                        style={{
                          backgroundColor: bgColor,
                          cursor: hasData ? 'pointer' : 'default',
                        }}
                        onClick={() => hasData && handleDateClick(day.dateString)}
                      />
                    </Tooltip>
                  )
                })}
              </Box>
            ))}
          </Box>
        </Box>
      </Stack>
    )
  }

  // 容器动画变体
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  // 卡片动画变体
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  }

  // 骨架屏组件
  const SkeletonCard = () => (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Skeleton height={24} width="60%" />
        <Skeleton height={200} />
      </Stack>
    </Card>
  )

  return (
    <Container
      size="xl"
      className={`${styles.dashboardContainer} ${showLottie && isFirstLoad ? styles.loading : ''}`}
    >
      {/* Lottie加载动画：首次加载时显示 */}
      <AnimatePresence>
        {showLottie && isFirstLoad && lottieData && (
          <motion.div
            className={styles.lottieOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box className={styles.lottieContainer}>
              <Lottie animationData={lottieData} loop={true} autoplay={true} />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 仪表盘内容 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showLottie && isFirstLoad ? 0 : 1 }}
        transition={{ duration: 0.5, delay: showLottie && isFirstLoad ? 0.3 : 0 }}
      >
        {/* <Title order={1} mb="xl" className={styles.pageTitle}>
          仪表盘
        </Title> */}

        {isLoading && !data ? (
          // 骨架屏 - 显示8个卡片
          <Grid className={styles.gridContainer}>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
              <SkeletonCard />
            </Grid.Col>
          </Grid>
        ) : data ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            style={{ width: '100%', height: '100%' }}
          >
            <Grid className={styles.gridContainer}>
              {/* 卡片1: 训练日历 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconCalendar size={24} />
                        <Title order={3} size="h4">
                          训练日历
                        </Title>
                      </Group>
                    </Group>
                    {renderHeatmapCalendar()}
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片2: 体重趋势 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconChartLine size={24} />
                        <Title order={3} size="h4">
                          体重趋势
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('weight')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    <div ref={weightChartRef} className={styles.chartContainer} />
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片3: 个人纪录 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconTrophy size={24} />
                        <Title order={3} size="h4">
                          个人纪录(PR)
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('records')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    <Stack gap="sm" mt="md">
                      {data.personalRecords.map((record, index) => (
                        <Group
                          key={index}
                          justify="space-between"
                          p="xs"
                          className={styles.recordItem}
                        >
                          <Text fw={500}>{record.name}</Text>
                          <Group gap="xs">
                            <Text c="blue" fw={700}>
                              {record.value}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {record.date}
                            </Text>
                          </Group>
                        </Group>
                      ))}
                    </Stack>
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片4: 训练部位分布 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconRadar size={24} />
                        <Title order={3} size="h4">
                          训练部位分布
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('distribution')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    <div ref={radarChartRef} className={styles.chartContainer} />
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片5: 周训练时长 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconChartBar size={24} />
                        <Title order={3} size="h4">
                          周训练时长
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('weekly')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    {data.weeklyTrainingHours && data.weeklyTrainingHours.length > 0 ? (
                      <div ref={weeklyChartRef} className={styles.chartContainer} />
                    ) : (
                      <Box
                        style={{
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          暂无数据
                        </Text>
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片6: 运动类型分布 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div
                  variants={cardVariants}
                  whileHover={{ y: -5 }}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconChartPie size={24} />
                        <Title order={3} size="h4">
                          运动类型分布
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('exercise')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    {data.exerciseTypeDistribution && data.exerciseTypeDistribution.length > 0 ? (
                      <div ref={pieChartRef} className={styles.chartContainer} />
                    ) : (
                      <Box
                        style={{
                          height: 300,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text size="sm" c="dimmed">
                          暂无数据
                        </Text>
                      </Box>
                    )}
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片7: 最近训练记录表格 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconClock size={24} />
                        <Title order={3} size="h4">
                          最近训练记录
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('trainingRecords')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    <ScrollArea h={300}>
                      <Table className={styles.dataTable} highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>日期</Table.Th>
                            <Table.Th>类型</Table.Th>
                            <Table.Th>部位</Table.Th>
                            <Table.Th>时长</Table.Th>
                            <Table.Th>强度</Table.Th>
                            <Table.Th>卡路里</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {data.recentTrainingRecords && data.recentTrainingRecords.length > 0 ? (
                            data.recentTrainingRecords.map((record, index) => (
                              <Table.Tr key={index}>
                                <Table.Td>
                                  <Text size="sm" fw={500}>
                                    {record.date}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Badge size="sm" variant="light" color="blue">
                                    {record.exerciseType}
                                  </Badge>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm">{record.bodyPart}</Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dimmed">
                                    {record.duration}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Badge
                                    size="sm"
                                    variant="light"
                                    color={
                                      record.intensity === '高'
                                        ? 'red'
                                        : record.intensity === '中'
                                          ? 'yellow'
                                          : 'green'
                                    }
                                  >
                                    {record.intensity}
                                  </Badge>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="orange" fw={500}>
                                    {record.calories}
                                  </Text>
                                </Table.Td>
                              </Table.Tr>
                            ))
                          ) : (
                            <Table.Tr>
                              <Table.Td
                                colSpan={6}
                                style={{ textAlign: 'center', padding: '2rem' }}
                              >
                                <Text size="sm" c="dimmed">
                                  暂无训练记录
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          )}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Card>
                </motion.div>
              </Grid.Col>

              {/* 卡片8: 本周训练计划表格 */}
              <Grid.Col span={{ base: 12, md: 6 }} className={styles.gridCol}>
                <motion.div variants={cardVariants} whileHover={{ y: -5 }}>
                  <Card shadow="sm" padding="lg" radius="md" withBorder className={styles.card}>
                    <Group justify="space-between" mb="md">
                      <Group gap="xs">
                        <IconClipboardList size={24} />
                        <Title order={3} size="h4">
                          本周训练计划
                        </Title>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        className={styles.detailButton}
                        onClick={() => setOpenedModal('plan')}
                      >
                        <IconEye size={18} />
                      </ActionIcon>
                    </Group>
                    <ScrollArea h={300}>
                      <Table className={styles.dataTable} highlightOnHover>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>日期</Table.Th>
                            <Table.Th>类型</Table.Th>
                            <Table.Th>训练内容</Table.Th>
                            <Table.Th>时长</Table.Th>
                            <Table.Th>状态</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {data.weeklyTrainingPlan && data.weeklyTrainingPlan.length > 0 ? (
                            data.weeklyTrainingPlan.map((plan, index) => (
                              <Table.Tr key={index}>
                                <Table.Td>
                                  <Stack gap={2}>
                                    <Text size="sm" fw={600}>
                                      {plan.day}
                                    </Text>
                                    <Text size="xs" c="dimmed">
                                      {plan.date}
                                    </Text>
                                  </Stack>
                                </Table.Td>
                                <Table.Td>
                                  <Badge size="sm" variant="light" color="violet">
                                    {plan.type}
                                  </Badge>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" lineClamp={1} style={{ maxWidth: 150 }}>
                                    {plan.exercises || '休息'}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  <Text size="sm" c="dimmed">
                                    {plan.duration}
                                  </Text>
                                </Table.Td>
                                <Table.Td>
                                  {plan.status === 'completed' ? (
                                    <Badge
                                      size="sm"
                                      color="green"
                                      leftSection={<IconCheck size={12} />}
                                    >
                                      已完成
                                    </Badge>
                                  ) : plan.status === 'missed' ? (
                                    <Badge size="sm" color="red" leftSection={<IconX size={12} />}>
                                      已错过
                                    </Badge>
                                  ) : (
                                    <Badge size="sm" color="gray" variant="light">
                                      待完成
                                    </Badge>
                                  )}
                                </Table.Td>
                              </Table.Tr>
                            ))
                          ) : (
                            <Table.Tr>
                              <Table.Td
                                colSpan={5}
                                style={{ textAlign: 'center', padding: '2rem' }}
                              >
                                <Text size="sm" c="dimmed">
                                  暂无训练计划
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          )}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Card>
                </motion.div>
              </Grid.Col>
            </Grid>
          </motion.div>
        ) : null}
      </motion.div>

      {/* 详情模态框 */}
      <Modal
        opened={openedModal !== null}
        onClose={() => {
          setOpenedModal(null)
          setSelectedDate(null)
          setSelectedDateData(null)
        }}
        title={
          openedModal === 'calendar'
            ? '训练详情'
            : openedModal === 'weight'
              ? '体重趋势详情'
              : openedModal === 'records'
                ? '个人纪录详情'
                : openedModal === 'distribution'
                  ? '训练部位分布详情'
                  : openedModal === 'weekly'
                    ? '周训练时长详情'
                    : openedModal === 'exercise'
                      ? '运动类型分布详情'
                      : openedModal === 'trainingRecords'
                        ? '最近训练记录详情'
                        : '本周训练计划详情'
        }
        size="xl"
        centered
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
      >
        {openedModal === 'calendar' && data && selectedDate && selectedDateData !== null && (
          <Stack gap="md">
            <Text size="lg" fw={600}>
              {selectedDate} 训练详情
            </Text>
            <Group>
              <Badge size="lg" color="blue" variant="light">
                训练强度: {selectedDateData}/5
              </Badge>
            </Group>
            <Text size="sm" c="dimmed">
              总训练天数: {data.trainingCalendar.length} 天
            </Text>
          </Stack>
        )}
        {openedModal === 'weight' && data && (
          <Stack gap="md">
            <Text>近30天的体重变化趋势，帮助您追踪身体变化。</Text>
            <Text size="sm" c="dimmed">
              当前体重: {data.weightTrend[data.weightTrend.length - 1][1]}kg
            </Text>
          </Stack>
        )}
        {openedModal === 'records' && data && (
          <Stack gap="md">
            <Text>您的个人最佳成绩记录，继续努力突破自己！</Text>
            {data.personalRecords.map((record, index) => (
              <Group key={index} justify="space-between" p="md" className={styles.recordItem}>
                <Text fw={500} size="lg">
                  {record.name}
                </Text>
                <Group gap="md">
                  <Text c="blue" fw={700} size="lg">
                    {record.value}
                  </Text>
                  <Text size="sm" c="dimmed">
                    达成日期: {record.date}
                  </Text>
                </Group>
              </Group>
            ))}
          </Stack>
        )}
        {openedModal === 'distribution' && data && (
          <Stack gap="md">
            <Text>各部位训练占比分析，帮助您平衡训练计划。</Text>
            {data.bodyPartDistribution.map((item, index) => (
              <Group key={index} justify="space-between" p="sm">
                <Text fw={500}>{item.name}</Text>
                <Text c="blue" fw={700}>
                  {item.value}%
                </Text>
              </Group>
            ))}
          </Stack>
        )}
        {openedModal === 'weekly' && data && data.weeklyTrainingHours && (
          <Stack gap="md">
            <Text>每周训练时长统计，帮助您了解训练频率。</Text>
            {data.weeklyTrainingHours.map((item, index) => (
              <Group key={index} justify="space-between" p="sm">
                <Text fw={500}>{item[0]}</Text>
                <Text c="blue" fw={700}>
                  {item[1]} 小时
                </Text>
              </Group>
            ))}
          </Stack>
        )}
        {openedModal === 'exercise' && data && data.exerciseTypeDistribution && (
          <Stack gap="md">
            <Text>运动类型分布，展示您的训练偏好。</Text>
            {data.exerciseTypeDistribution.map((item, index) => (
              <Group key={index} justify="space-between" p="sm">
                <Text fw={500}>{item.name}</Text>
                <Text c="blue" fw={700}>
                  {item.value} 次
                </Text>
              </Group>
            ))}
          </Stack>
        )}
        {openedModal === 'trainingRecords' && data && data.recentTrainingRecords && (
          <Stack gap="md">
            <Text>最近10次训练记录，帮助您回顾训练历史。</Text>
            <ScrollArea h={400}>
              <Table className={styles.dataTable} highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>日期</Table.Th>
                    <Table.Th>类型</Table.Th>
                    <Table.Th>部位</Table.Th>
                    <Table.Th>时长</Table.Th>
                    <Table.Th>强度</Table.Th>
                    <Table.Th>卡路里</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.recentTrainingRecords.map((record, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {record.date}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="blue">
                          {record.exerciseType}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{record.bodyPart}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {record.duration}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          size="sm"
                          variant="light"
                          color={
                            record.intensity === '高'
                              ? 'red'
                              : record.intensity === '中'
                                ? 'yellow'
                                : 'green'
                          }
                        >
                          {record.intensity}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="orange" fw={500}>
                          {record.calories}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        )}
        {openedModal === 'plan' && data && data.weeklyTrainingPlan && (
          <Stack gap="md">
            <Text>本周训练计划详情，帮助您合理安排训练时间。</Text>
            <ScrollArea h={400}>
              <Table className={styles.dataTable} highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>日期</Table.Th>
                    <Table.Th>类型</Table.Th>
                    <Table.Th>训练内容</Table.Th>
                    <Table.Th>时长</Table.Th>
                    <Table.Th>状态</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.weeklyTrainingPlan.map((plan, index) => (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <Stack gap={2}>
                          <Text size="sm" fw={600}>
                            {plan.day}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {plan.date}
                          </Text>
                        </Stack>
                      </Table.Td>
                      <Table.Td>
                        <Badge size="sm" variant="light" color="violet">
                          {plan.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{plan.exercises || '休息'}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {plan.duration}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        {plan.status === 'completed' ? (
                          <Badge size="sm" color="green" leftSection={<IconCheck size={12} />}>
                            已完成
                          </Badge>
                        ) : plan.status === 'missed' ? (
                          <Badge size="sm" color="red" leftSection={<IconX size={12} />}>
                            已错过
                          </Badge>
                        ) : (
                          <Badge size="sm" color="gray" variant="light">
                            待完成
                          </Badge>
                        )}
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </Stack>
        )}
      </Modal>
    </Container>
  )
}
