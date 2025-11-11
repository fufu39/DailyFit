import { useEffect, useState } from 'react'
import {
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  NumberInput,
  Table,
  Pagination,
  Modal,
  Box,
  Divider,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react'
import type {
  CardioItem,
  LogType,
  StrengthItem,
  LogbookRecord,
  FunctionalItem,
  FlexibilityItem,
} from '../../utils/logbook'
import { formatDateISO, listPaginated, saveRecord } from '../../utils/logbook'
import { IconCheck } from '@tabler/icons-react'
import classes from './LogbookPage.module.css'
import { useMediaQuery } from '@mantine/hooks'

type StrengthFormItem = Omit<StrengthItem, 'id'>
type CardioFormItem = Omit<CardioItem, 'id'>

type FormValues = {
  date: Date | null
  type: LogType
  strengthItems: StrengthFormItem[]
  cardioItems: CardioFormItem[]
  functionalItems: { activity: string; durationMinutes: number }[]
  flexibilityItems: { activity: string; durationMinutes: number }[]
}

function usePaginatedLogbook(pageSize = 5) {
  const [page, setPage] = useState(1)
  const [tick, setTick] = useState(0)
  const [data, setData] = useState<LogbookRecord[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const reload = () => setTick((v) => v + 1)

  useEffect(() => {
    let mounted = true
    setLoading(true)
    ;(async () => {
      try {
        const res = await listPaginated(page, pageSize)
        if (!mounted) return
        setData(res.data)
        setTotalPages(res.totalPages)
        setTotal(res.total)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [page, pageSize, tick])

  return { data, page, totalPages, total, setPage, reload, loading }
}

const rowVariants = {
  hidden: { opacity: 0, y: -8, height: 0 },
  show: { opacity: 1, y: 0, height: 'auto' },
  exit: { opacity: 0, height: 0 },
}

export default function LogbookPage() {
  const navigate = useNavigate()
  const [pageSize, setPageSize] = useState(5)
  const { data, page, setPage, totalPages, total, reload } = usePaginatedLogbook(pageSize)
  const isTablet = useMediaQuery('(max-width: 768px)')

  const {
    control,
    register,
    watch,
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      date: new Date(),
      type: 'strength',
      strengthItems: [{ name: '', sets: 3, reps: 10, weight: 0 }],
      cardioItems: [{ activity: '', durationMinutes: 30, distanceKm: 5 }],
      functionalItems: [{ activity: '', durationMinutes: 20 }],
      flexibilityItems: [{ activity: '', durationMinutes: 15 }],
    },
  })

  const type = watch('type')

  const {
    fields: strengthFields,
    append: strengthAppend,
    remove: strengthRemove,
  } = useFieldArray({
    control,
    name: 'strengthItems',
  })

  const {
    fields: cardioFields,
    append: cardioAppend,
    remove: cardioRemove,
  } = useFieldArray({
    control,
    name: 'cardioItems',
  })

  const {
    fields: functionalFields,
    append: functionalAppend,
    remove: functionalRemove,
  } = useFieldArray({
    control,
    name: 'functionalItems',
  })

  const {
    fields: flexibilityFields,
    append: flexibilityAppend,
    remove: flexibilityRemove,
  } = useFieldArray({
    control,
    name: 'flexibilityItems',
  })

  const [modalOpened, setModalOpened] = useState(false)

  const getTypeLabel = (t: LogType): string => {
    switch (t) {
      case 'strength':
        return '力量'
      case 'cardio':
        return '有氧'
      case 'functional':
        return '功能性'
      case 'flexibility':
        return '柔韧性'
      default:
        return t
    }
  }

  const getDetailsText = (r: LogbookRecord): string => {
    if (r.type === 'strength') {
      return (r.strengthItems || [])
        .map((s) => `${s.name || '未命名'} ${s.sets}x${s.reps}@${s.weight}kg`)
        .join('； ')
    }
    if (r.type === 'cardio') {
      return (r.cardioItems || [])
        .map((c) => `${c.activity || '未命名'} ${c.durationMinutes}min ${c.distanceKm ?? 0}km`)
        .join('； ')
    }
    if (r.type === 'functional') {
      return (r.functionalItems || [])
        .map((f) => `${f.activity || '未命名'} ${f.durationMinutes}min`)
        .join('； ')
    }
    return (r.flexibilityItems || [])
      .map((f) => `${f.activity || '未命名'} ${f.durationMinutes}min`)
      .join('； ')
  }

  const onSubmit = handleSubmit(async (values) => {
    const iso = values.date ? formatDateISO(values.date) : formatDateISO(new Date())
    if (values.type === 'strength') {
      const normalized: StrengthItem[] = values.strengthItems.map((it) => ({
        id: Math.random().toString(36).slice(2),
        ...it,
      }))
      await saveRecord({ date: iso, type: 'strength', strengthItems: normalized })
    } else if (values.type === 'cardio') {
      const normalized: CardioItem[] = values.cardioItems.map((it) => ({
        id: Math.random().toString(36).slice(2),
        ...it,
      }))
      await saveRecord({ date: iso, type: 'cardio', cardioItems: normalized })
    } else if (values.type === 'functional') {
      const normalized: FunctionalItem[] = values.functionalItems.map((it) => ({
        id: Math.random().toString(36).slice(2),
        ...it,
      }))
      await saveRecord({ date: iso, type: 'functional', functionalItems: normalized })
    } else if (values.type === 'flexibility') {
      const normalized: FlexibilityItem[] = values.flexibilityItems.map((it) => ({
        id: Math.random().toString(36).slice(2),
        ...it,
      }))
      await saveRecord({ date: iso, type: 'flexibility', flexibilityItems: normalized })
    }

    setModalOpened(true)
    // 立即重置表单并刷新列表，动画完成后自动关闭
    reset({
      date: new Date(),
      type,
      strengthItems: [{ name: '', sets: 3, reps: 10, weight: 0 }],
      cardioItems: [{ activity: '', durationMinutes: 30, distanceKm: 5 }],
      functionalItems: [{ activity: '', durationMinutes: 20 }],
      flexibilityItems: [{ activity: '', durationMinutes: 15 }],
    })
    reload()
  })

  return (
    <Stack gap="lg" className={classes.container}>
      <Card withBorder radius="md" p="lg" className={classes.card} shadow="sm">
        <Stack>
          <Group justify="space-between" wrap="wrap" className={classes.cardHeader}>
            <Text fw={700} size="lg" className={classes.title}>
              记录训练
            </Text>
            <Group gap="lg" align="center" wrap="nowrap">
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DatePickerInput
                    placeholder="选择日期"
                    size={isTablet ? 'xs' : 'sm'}
                    value={field.value}
                    onChange={field.onChange}
                    valueFormat="YYYY-MM-DD"
                    locale="en"
                    firstDayOfWeek={1}
                    monthLabelFormat="MMMM YYYY"
                    popoverProps={{ withinPortal: true }}
                    styles={{
                      calendarHeader: { padding: 8 },
                      calendarHeaderLevel: { fontSize: 14, fontWeight: 600 },
                      calendarHeaderControl: {
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                      },
                    }}
                  />
                )}
              />
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <SegmentedControl
                    className={classes.typeControl}
                    size={isTablet ? 'xs' : 'sm'}
                    radius="xl"
                    value={field.value}
                    onChange={(v) => field.onChange(v as LogType)}
                    data={[
                      { label: '力量', value: 'strength' },
                      { label: '有氧', value: 'cardio' },
                      { label: '功能性', value: 'functional' },
                      { label: '柔韧性', value: 'flexibility' },
                    ]}
                  />
                )}
              />
            </Group>
          </Group>
          <Divider className={classes.divider} />

          {type === 'strength' ? (
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">力量项目</Text>
                <Button
                  className={classes.addButton}
                  size="xs"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => strengthAppend({ name: '', sets: 3, reps: 10, weight: 0 })}
                  variant="light"
                >
                  添加训练项
                </Button>
              </Group>
              <AnimatePresence initial={false}>
                {strengthFields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                          项目名称
                        </Text>
                        <TextInput
                          placeholder="卧推/深蹲/硬拉等"
                          size="sm"
                          style={{ flex: 1 }}
                          {...register(`strengthItems.${idx}.name` as const)}
                        />
                      </Group>
                      <Controller
                        control={control}
                        name={`strengthItems.${idx}.sets`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              组数
                            </Text>
                            <NumberInput
                              min={1}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 80 : 100 }}
                              value={field.value}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`strengthItems.${idx}.reps`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              次数
                            </Text>
                            <NumberInput
                              min={1}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 80 : 100 }}
                              value={field.value}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`strengthItems.${idx}.weight`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              重量(kg)
                            </Text>
                            <NumberInput
                              min={0}
                              step={2.5}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 100 : 120 }}
                              value={field.value}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Button
                        className={classes.deleteButton}
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => strengthRemove(idx)}
                        leftSection={<IconTrash size={16} />}
                      >
                        删除
                      </Button>
                    </Group>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          ) : type === 'cardio' ? (
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">有氧项目</Text>
                <Button
                  className={classes.addButton}
                  size="xs"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => cardioAppend({ activity: '', durationMinutes: 30, distanceKm: 5 })}
                  variant="light"
                >
                  添加训练项
                </Button>
              </Group>
              <AnimatePresence initial={false}>
                {cardioFields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                          活动
                        </Text>
                        <TextInput
                          placeholder="跑步/骑行/划船等"
                          size="sm"
                          style={{ flex: 1 }}
                          {...register(`cardioItems.${idx}.activity` as const)}
                        />
                      </Group>
                      <Controller
                        control={control}
                        name={`cardioItems.${idx}.durationMinutes`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              时长(分钟)
                            </Text>
                            <NumberInput
                              min={1}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 100 : 120 }}
                              value={field.value}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Controller
                        control={control}
                        name={`cardioItems.${idx}.distanceKm`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              距离(km)
                            </Text>
                            <NumberInput
                              min={0}
                              step={0.1}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 100 : 120 }}
                              value={field.value ?? 0}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Button
                        className={classes.deleteButton}
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => cardioRemove(idx)}
                        leftSection={<IconTrash size={16} />}
                      >
                        删除
                      </Button>
                    </Group>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          ) : type === 'functional' ? (
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">功能性训练</Text>
                <Button
                  className={classes.addButton}
                  size="xs"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => functionalAppend({ activity: '', durationMinutes: 20 })}
                  variant="light"
                >
                  添加训练项
                </Button>
              </Group>
              <AnimatePresence initial={false}>
                {functionalFields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                          项目
                        </Text>
                        <TextInput
                          placeholder="核心/平衡/爆发等"
                          size="sm"
                          style={{ flex: 1 }}
                          {...register(`functionalItems.${idx}.activity` as const)}
                        />
                      </Group>
                      <Controller
                        control={control}
                        name={`functionalItems.${idx}.durationMinutes`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              时长(分钟)
                            </Text>
                            <NumberInput
                              min={1}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 100 : 120 }}
                              value={field.value}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Button
                        className={classes.deleteButton}
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => functionalRemove(idx)}
                        leftSection={<IconTrash size={16} />}
                      >
                        删除
                      </Button>
                    </Group>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          ) : (
            <Stack>
              <Group justify="space-between">
                <Text c="dimmed">柔韧性训练</Text>
                <Button
                  className={classes.addButton}
                  size="xs"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => flexibilityAppend({ activity: '', durationMinutes: 15 })}
                  variant="light"
                >
                  添加训练项
                </Button>
              </Group>
              <AnimatePresence initial={false}>
                {flexibilityFields.map((field, idx) => (
                  <motion.div
                    key={field.id}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                          项目
                        </Text>
                        <TextInput
                          placeholder="静态拉伸/动态拉伸/瑜伽等"
                          size="sm"
                          style={{ flex: 1 }}
                          {...register(`flexibilityItems.${idx}.activity` as const)}
                        />
                      </Group>
                      <Controller
                        control={control}
                        name={`flexibilityItems.${idx}.durationMinutes`}
                        render={({ field }) => (
                          <Group align="center" gap="xs">
                            <Text size="sm" fw={500} style={{ whiteSpace: 'nowrap' }}>
                              时长(分钟)
                            </Text>
                            <NumberInput
                              min={1}
                              size={isTablet ? 'xs' : 'sm'}
                              style={{ width: isTablet ? 100 : 120 }}
                              value={field.value}
                              onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                            />
                          </Group>
                        )}
                      />
                      <Button
                        className={classes.deleteButton}
                        size="xs"
                        color="red"
                        variant="subtle"
                        onClick={() => flexibilityRemove(idx)}
                        leftSection={<IconTrash size={16} />}
                      >
                        删除
                      </Button>
                    </Group>
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          )}

          <Group justify="flex-end">
            <Button loading={isSubmitting} onClick={onSubmit} size="sm" radius="sm">
              保存训练
            </Button>
          </Group>
        </Stack>
      </Card>

      <Card withBorder radius="md" p="lg" className={classes.card} shadow="sm">
        <Stack>
          <Group justify="space-between" align="center">
            <Text fw={700} size="lg" className={classes.title}>
              训练历史
            </Text>
          </Group>

          <div className={classes.tableContainer}>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead className={classes.thead}>
                <Table.Tr>
                  <Table.Th className={classes.dateCol}>日期</Table.Th>
                  <Table.Th>类型</Table.Th>
                  <Table.Th>详情</Table.Th>
                  <Table.Th className={classes.opsCol}>操作</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {data.length === 0 ? (
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Text className={classes.emptyState}>暂无记录</Text>
                    </Table.Td>
                  </Table.Tr>
                ) : (
                  data.map((r) => (
                    <Table.Tr key={r.id}>
                      <Table.Td className={classes.dateCol}>{r.date}</Table.Td>
                      <Table.Td>{getTypeLabel(r.type)}</Table.Td>
                      <Table.Td>
                        <Text
                          size={isTablet ? 'xs' : 'sm'}
                          className={classes.detailText}
                          lineClamp={isTablet ? 3 : 2}
                        >
                          {getDetailsText(r)}
                        </Text>
                      </Table.Td>
                      <Table.Td className={classes.opsCol}>
                        <Group gap="xs" justify="flex-end" wrap="nowrap">
                          {isTablet ? (
                            <>
                              <Button
                                size="xs"
                                radius="xl"
                                variant="subtle"
                                aria-label="编辑"
                                title="编辑"
                                leftSection={<IconEdit size={14} />}
                                onClick={() => navigate(`/logbook/${r.id}`)}
                              />
                              <DeleteRecordButton id={r.id} onDone={reload} iconOnly />
                            </>
                          ) : (
                            <>
                              <Button
                                size="xs"
                                radius="xl"
                                variant="light"
                                leftSection={<IconEdit size={14} />}
                                onClick={() => navigate(`/logbook/${r.id}`)}
                              >
                                编辑
                              </Button>
                              <DeleteRecordButton id={r.id} onDone={reload} />
                            </>
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))
                )}
              </Table.Tbody>
            </Table>
          </div>

          <Group justify="space-between" mt="md" className={classes.pagination}>
            <Group gap="xs">
              <Text size="sm" c="dimmed">
                每页
              </Text>
              <SegmentedControl
                size="xs"
                radius="xl"
                value={String(pageSize)}
                onChange={(v) => {
                  const next = parseInt(v, 10)
                  if (!Number.isNaN(next)) {
                    setPageSize(next)
                    setPage(1)
                  }
                }}
                data={[
                  { label: '5', value: '5' },
                  { label: '10', value: '10' },
                  { label: '20', value: '20' },
                ]}
              />
            </Group>
            <Group gap="md" align="center">
              <Pagination total={totalPages} value={page} onChange={setPage} />
              <Text size="sm" c="dimmed">
                共{total}条
              </Text>
            </Group>
          </Group>
        </Stack>
      </Card>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        withCloseButton={false}
        centered
        radius="md"
        padding="lg"
        styles={{ body: { display: 'flex', justifyContent: 'center' } }}
      >
        <Box
          className={classes.modalBox}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onAnimationComplete={() => {
              // 稍作停留后自动关闭
              setTimeout(() => setModalOpened(false), 700)
            }}
            style={{
              width: 120,
              height: 120,
              borderRadius: 999,
              background: 'var(--mantine-color-green-6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
            }}
          >
            <IconCheck size={64} color="white" stroke={3} />
          </motion.div>
        </Box>
      </Modal>
    </Stack>
  )
}

function DeleteRecordButton({
  id,
  onDone,
  iconOnly,
}: {
  id: string
  onDone: () => void
  iconOnly?: boolean
}) {
  const [loading, setLoading] = useState(false)
  const handleDelete = () => {
    if (loading) return
    modals.openConfirmModal({
      title: '删除记录',
      centered: true,
      children: <Text size="sm">确定删除该记录吗？该操作不可撤销。</Text>,
      labels: { confirm: '删除', cancel: '取消' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        setLoading(true)
        try {
          const { deleteRecord } = await import('../../utils/logbook')
          await deleteRecord(id)
          onDone()
        } finally {
          setLoading(false)
        }
      },
    })
  }
  return (
    <Button
      size="xs"
      radius="xl"
      color="red"
      variant={iconOnly ? 'subtle' : 'light'}
      aria-label="删除"
      title="删除"
      leftSection={<IconTrash size={14} />}
      onClick={handleDelete}
      loading={loading}
    >
      {iconOnly ? null : '删除'}
    </Button>
  )
}
