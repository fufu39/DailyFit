import { Button, Container, Group, Title } from '@mantine/core'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Illustration } from './Illustration.tsx'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <Container className={styles.root} fluid>
      <motion.div
        className={styles.inner}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <motion.div
          className={styles.image}
          initial={{ clipPath: 'inset(0 100% 0 0)' }}
          animate={{ clipPath: 'inset(0 0% 0 0)' }}
          transition={{ duration: 1.2, delay: 0.1, ease: 'easeOut' }}
        >
          <Illustration />
        </motion.div>
        <motion.div
          className={styles.content}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
        >
          <Title className={styles.title}>Nothing to see here</Title>
          <Group justify="center">
            <Button
              size="lg"
              variant="outline"
              fw={700}
              className={styles.button}
              onClick={() => navigate('/home', { replace: true })}
            >
              返回首页
            </Button>
          </Group>
        </motion.div>
      </motion.div>
    </Container>
  )
}
