import { useEffect, useMemo, useState } from 'react'
import {
  Avatar,
  Box,
  Button,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Title,
  Divider,
} from '@mantine/core'
import { useForm } from 'react-hook-form'
import { notifications } from '@mantine/notifications'
import { IconCheck, IconUser, IconAt, IconKey, IconExclamationMark } from '@tabler/icons-react'
import request from '../../utils/request'
import { useAuthStore } from '../../stores/authStore'
import styles from './ProfilePage.module.css'

type ProfileForm = {
  username: string
  name: string
  email: string
  currentPassword?: string
  newPassword?: string
}

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const initials = useMemo(() => {
    if (!user?.name) return 'U'
    const str = user.name.trim()
    // 截取前两位字符作为用户头像
    return str.slice(0, 2).toUpperCase()
  }, [user?.name])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
    watch,
  } = useForm<ProfileForm>({
    defaultValues: {
      username: user?.username || '',
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
    },
  })

  // 加载服务端资料，保持与后端一致
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await request.get('/profile')
        if (res.data?.success) {
          const serverUser = res.data.data.user
          reset({
            username: serverUser.username,
            name: serverUser.name,
            email: serverUser.email,
            currentPassword: '',
            newPassword: '',
          })
        }
      } catch {
        // 静默失败，沿用本地信息
      }
    }
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 本地用户变化时同步默认值
  useEffect(() => {
    reset((prev) => ({
      ...prev,
      username: user?.username || '',
      name: user?.name || '',
      email: user?.email || '',
    }))
  }, [user?.username, user?.name, user?.email, reset])

  const onSubmit = async (data: ProfileForm) => {
    // 检查当前密码和新密码是否相同
    const trimmedCurrentPassword = data.currentPassword?.trim()
    const trimmedNewPassword = data.newPassword?.trim()

    if (
      trimmedCurrentPassword &&
      trimmedNewPassword &&
      trimmedCurrentPassword === trimmedNewPassword
    ) {
      notifications.show({
        title: '提示',
        message: '新密码不能与当前密码相同',
        icon: <IconExclamationMark size={20} />,
        color: 'yellow',
      })
      return
    }

    setLoading(true)
    try {
      const payload = {
        name: data.name.trim(),
        email: data.email.trim(),
        currentPassword: trimmedCurrentPassword || undefined,
        newPassword: trimmedNewPassword || undefined,
      }
      const res = await request.put('/profile', payload)
      if (res.data?.success) {
        const updated = res.data.data.user
        updateUser(updated)
        notifications.show({
          title: '已保存',
          message: '个人资料更新成功',
          icon: <IconCheck size={20} />,
          color: 'teal',
        })
        reset({
          username: updated.username,
          name: updated.name,
          email: updated.email,
          currentPassword: '',
          newPassword: '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const currentPassword = watch('currentPassword')
  const newPassword = watch('newPassword')

  return (
    <Box className={styles.page}>
      <Container size="sm" className={styles.content} p={0}>
        <Stack gap="lg">
          <Group align="center" className={styles.headerRow}>
            <Avatar radius="xl" size={64} className={styles.avatar}>
              {initials}
            </Avatar>
            <Box className={styles.titleWrap}>
              <Title order={3}>个人资料</Title>
              <Text className={styles.subtitle}>查看与更新你的个人资料</Text>
            </Box>
          </Group>

          <Paper withBorder p="lg" radius="md" className={styles.card}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate className={styles.form}>
              <Stack gap="md">
                <TextInput
                  label="用户名"
                  leftSection={<IconUser size={18} />}
                  {...register('username')}
                  disabled
                />
                <TextInput
                  label="姓名"
                  placeholder="请输入姓名"
                  leftSection={<IconUser size={18} />}
                  {...register('name', {
                    required: '姓名不能为空',
                    validate: (v) => (v?.trim() ? true : '姓名不能为空'),
                  })}
                  error={errors.name?.message}
                />
                <TextInput
                  label="邮箱"
                  placeholder="name@example.com"
                  leftSection={<IconAt size={18} />}
                  {...register('email', {
                    required: '邮箱不能为空',
                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: '邮箱格式不正确' },
                  })}
                  error={errors.email?.message}
                />

                <Divider label="修改密码" labelPosition="left" />

                <Group grow>
                  <TextInput
                    label="当前密码"
                    type="password"
                    leftSection={<IconKey size={18} />}
                    placeholder="留空则不修改"
                    {...register('currentPassword')}
                  />
                  <TextInput
                    label="新密码"
                    type="password"
                    leftSection={<IconKey size={18} />}
                    placeholder="留空则不修改"
                    {...register('newPassword')}
                  />
                </Group>
                {(currentPassword || newPassword) && (
                  <Text size="xs" c="dimmed">
                    提示：如需修改密码，请同时填写“当前密码”和“新密码”
                  </Text>
                )}

                <Group className={styles.actions}>
                  <Button
                    type="submit"
                    loading={loading}
                    disabled={!isDirty && !currentPassword && !newPassword}
                  >
                    保存更改
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Stack>
      </Container>
    </Box>
  )
}
