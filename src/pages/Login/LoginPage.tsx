import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Paper, TextInput, PasswordInput, Button, Title, Text, Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import request from '../../utils/request'
import { useAuthStore } from '../../stores/authStore'
import { notifications } from '@mantine/notifications'

export default function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await request.post<{
        success: boolean
        data: { user: { id: number; username: string; email: string; name: string }; token: string }
      }>('/login', {
        username,
        password,
      })

      if (response.data.success) {
        const { user, token } = response.data.data
        login(user, token)

        notifications.show({
          title: '登录成功',
          message: `欢迎回来，${user.name}！`,
          color: 'green',
        })

        navigate('/dashboard')
      }
    } catch (err: unknown) {
      // 错误已经在拦截器中处理了，这里只设置本地错误状态
      const errorMessage =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message || '登录失败，请稍后重试'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size={420} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md" style={{ width: '100%' }}>
        <Title order={2} ta="center" mb="md">
          登录
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
          请输入您的用户名和密码
        </Text>

        {error && (
          <Alert icon={<IconAlertCircle size={16} />} title="错误" color="red" mb="md">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack>
            <TextInput
              label="用户名"
              placeholder="请输入用户名"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
            <PasswordInput
              label="密码"
              placeholder="请输入密码"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" fullWidth mt="xl" loading={loading}>
              登录
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  )
}
