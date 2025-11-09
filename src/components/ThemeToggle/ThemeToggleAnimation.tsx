import { motion } from 'framer-motion'

interface ThemeToggleAnimationProps {
  isDark: boolean
  onAnimationComplete: () => void
}

export function ThemeToggleAnimation({ isDark, onAnimationComplete }: ThemeToggleAnimationProps) {
  // 获取目标主题的背景色（根据 isDark 参数）
  // 使用固定的颜色值，确保动画颜色正确
  const backgroundColor = isDark ? '#1a1b1e' : '#ffffff'

  return (
    <motion.div
      initial={{
        clipPath: 'circle(0% at 100% 0%)', // 从右上角开始，初始状态为右上角的一个小圆点
      }}
      animate={{
        clipPath: 'circle(150% at 100% 0%)', // 从右上角展开，半径足够大以覆盖整个屏幕（对角线距离约为141%）
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.15,
        },
      }}
      transition={{
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1], // 平滑的缓动函数
      }}
      onAnimationComplete={onAnimationComplete}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor,
        zIndex: 9999,
        pointerEvents: 'none',
        willChange: 'clip-path', // 使用 clip-path 动画，性能更好，不会触发回流重排
        isolation: 'isolate', // 创建新的层叠上下文，避免影响其他元素
        backfaceVisibility: 'hidden', // 优化渲染性能
        transform: 'translateZ(0)', // 启用硬件加速
      }}
    />
  )
}
