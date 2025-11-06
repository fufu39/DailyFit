import { Button, Container, Group, Text, Title } from '@mantine/core'
import { Illustration } from './Illustration.tsx'
import styles from './NotFoundPage.module.css'

export default function NotFoundPage() {
  return (
    <Container className={styles.root}>
      <div className={styles.inner}>
        <Illustration className={styles.image} />
        <div className={styles.content}>
          <Title className={styles.title}>Nothing to see here</Title>
          <Text c="dimmed" size="lg" ta="center" className={styles.description}>
            Page you are trying to open does not exist. You may have mistyped the address, or the page has been moved to
            another URL. If you think this is an error contact support.
          </Text>
          <Group justify="center">
            <Button size="md">Take me back to home page</Button>
          </Group>
        </div>
      </div>
    </Container>
  )
}
