import { useEffect, useState } from 'react'
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Drawer,
  Group,
  LoadingOverlay,
  Modal,
  NumberInput,
  Pagination,
  SegmentedControl,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { modals } from '@mantine/modals'
import { AnimatePresence, motion } from 'framer-motion'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { IconPlus, IconTrash, IconEdit } from '@tabler/icons-react'
import dayjs from 'dayjs'
import type {
  CardioItem,
  LogType,
  StrengthItem,
  LogbookRecord,
  FunctionalItem,
  FlexibilityItem,
} from '../../utils/logbook'
import {
  formatDateISO,
  listPaginated,
  saveRecord,
  updateRecord,
  parseISOToDate,
} from '../../utils/logbook'
import { IconCheck } from '@tabler/icons-react'
import classes from './LogbookPage.module.css'
import { useMediaQuery } from '@mantine/hooks'

type StrengthFormItem = Omit<StrengthItem, 'id'>
type CardioFormItem = Omit<CardioItem, 'id'>

type FormValues = {
  date: Date | string | null
  type: LogType
  strengthItems: StrengthFormItem[]
  cardioItems: CardioFormItem[]
  functionalItems: { activity: string; durationMinutes: number }[]
  flexibilityItems: { activity: string; durationMinutes: number }[]
}

type EditFormValues = {
  date: Date | string | null
  strengthItems: StrengthItem[]
  cardioItems: CardioItem[]
  functionalItems: FunctionalItem[]
  flexibilityItems: FlexibilityItem[]
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

const createEmptyEditValues = (): EditFormValues => ({
  date: null,
  strengthItems: [],
  cardioItems: [],
  functionalItems: [],
  flexibilityItems: [],
})

const createDefaultStrengthItem = (): StrengthItem => ({
  id: Math.random().toString(36).slice(2),
  name: '',
  sets: 3,
  reps: 10,
  weight: 0,
})

const createDefaultCardioItem = (): CardioItem => ({
  id: Math.random().toString(36).slice(2),
  activity: '',
  durationMinutes: 30,
  distanceKm: 5,
})

const createDefaultFunctionalItem = (): FunctionalItem => ({
  id: Math.random().toString(36).slice(2),
  activity: '',
  durationMinutes: 20,
})

const createDefaultFlexibilityItem = (): FlexibilityItem => ({
  id: Math.random().toString(36).slice(2),
  activity: '',
  durationMinutes: 15,
})

export default function LogbookPage() {
  const [pageSize, setPageSize] = useState(5)
  const { data, page, setPage, totalPages, total, reload, loading } = usePaginatedLogbook(pageSize)
  const isTablet = useMediaQuery('(max-width: 768px)')
  const [editDrawerOpened, setEditDrawerOpened] = useState(false)
  const [editingRecord, setEditingRecord] = useState<LogbookRecord | null>(null)
  const [updating, setUpdating] = useState(false)

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

  const {
    control: editControl,
    register: editRegister,
    reset: resetEditForm,
    handleSubmit: handleEditSubmit,
  } = useForm<EditFormValues>({
    defaultValues: createEmptyEditValues(),
  })

  const type = watch('type')

  const {
    fields: strengthFields,
    append: strengthAppend,
    remove: strengthRemove,
  } = useFieldArray({
    control,
    name: 'strengthItems',
    keyName: 'key', // 使用key作为React的key
  })

  const {
    fields: cardioFields,
    append: cardioAppend,
    remove: cardioRemove,
  } = useFieldArray({
    control,
    name: 'cardioItems',
    keyName: 'key', // 使用key作为React的key
  })

  const {
    fields: functionalFields,
    append: functionalAppend,
    remove: functionalRemove,
  } = useFieldArray({
    control,
    name: 'functionalItems',
    keyName: 'key', // 使用key作为React的key
  })

  const {
    fields: flexibilityFields,
    append: flexibilityAppend,
    remove: flexibilityRemove,
  } = useFieldArray({
    control,
    name: 'flexibilityItems',
    keyName: 'key', // 使用key作为React的key
  })

  const { fields: editStrengthFields } = useFieldArray({
    control: editControl,
    name: 'strengthItems',
    keyName: 'key',
  })

  const { fields: editCardioFields } = useFieldArray({
    control: editControl,
    name: 'cardioItems',
    keyName: 'key',
  })

  const { fields: editFunctionalFields } = useFieldArray({
    control: editControl,
    name: 'functionalItems',
    keyName: 'key',
  })

  const { fields: editFlexibilityFields } = useFieldArray({
    control: editControl,
    name: 'flexibilityItems',
    keyName: 'key',
  })

  const [modalOpened, setModalOpened] = useState(false)
  const editType = editingRecord?.type

  const closeEditDrawer = () => {
    setEditDrawerOpened(false)
    setEditingRecord(null)
    resetEditForm(createEmptyEditValues())
  }

  const onEditSubmit = handleEditSubmit(async (values) => {
    if (!editingRecord || !editType || !values.date) {
      return
    }
    setUpdating(true)
    try {
      const isoDate = values.date instanceof Date ? formatDateISO(values.date) : values.date
      let payload: Partial<LogbookRecord>

      if (editType === 'strength') {
        if (values.strengthItems.length === 0) {
          modals.open({
            title: '无法保存',
            children: <Text size="sm">至少保留一个力量训练项目。</Text>,
            centered: true,
          })
          return
        }
        payload = {
          date: isoDate,
          type: editType,
          strengthItems: values.strengthItems.map((item) => ({
            ...item,
            id: item.id || createDefaultStrengthItem().id,
          })),
          cardioItems: undefined,
          functionalItems: undefined,
          flexibilityItems: undefined,
        }
      } else if (editType === 'cardio') {
        if (values.cardioItems.length === 0) {
          modals.open({
            title: '无法保存',
            children: <Text size="sm">至少保留一个有氧训练项目。</Text>,
            centered: true,
          })
          return
        }
        payload = {
          date: isoDate,
          type: editType,
          strengthItems: undefined,
          cardioItems: values.cardioItems.map((item) => ({
            ...item,
            id: item.id || createDefaultCardioItem().id,
          })),
          functionalItems: undefined,
          flexibilityItems: undefined,
        }
      } else if (editType === 'functional') {
        if (values.functionalItems.length === 0) {
          modals.open({
            title: '无法保存',
            children: <Text size="sm">至少保留一个功能性训练项目。</Text>,
            centered: true,
          })
          return
        }
        payload = {
          date: isoDate,
          type: editType,
          strengthItems: undefined,
          cardioItems: undefined,
          functionalItems: values.functionalItems.map((item) => ({
            ...item,
            id: item.id || createDefaultFunctionalItem().id,
          })),
          flexibilityItems: undefined,
        }
      } else {
        if (values.flexibilityItems.length === 0) {
          modals.open({
            title: '无法保存',
            children: <Text size="sm">至少保留一个柔韧性训练项目。</Text>,
            centered: true,
          })
          return
        }
        payload = {
          date: isoDate,
          type: editType,
          strengthItems: undefined,
          cardioItems: undefined,
          functionalItems: undefined,
          flexibilityItems: values.flexibilityItems.map((item) => ({
            ...item,
            id: item.id || createDefaultFlexibilityItem().id,
          })),
        }
      }

      const updated = await updateRecord(editingRecord.id, payload)
      if (!updated) {
        modals.open({
          title: '更新失败',
          children: <Text size="sm">未找到该训练记录，请刷新后重试。</Text>,
          centered: true,
        })
        return
      }
      reload()
      closeEditDrawer()
    } catch (error) {
      console.error(error)
      modals.open({
        title: '更新失败',
        children: <Text size="sm">保存过程中出现错误，请稍后再试。</Text>,
        centered: true,
      })
    } finally {
      setUpdating(false)
    }
  })

  useEffect(() => {
    if (!editingRecord) {
      resetEditForm(createEmptyEditValues())
      return
    }
    const strengthItems = (editingRecord.strengthItems || []).map((item) => ({ ...item }))
    const cardioItems = (editingRecord.cardioItems || []).map((item) => ({ ...item }))
    const functionalItems = (editingRecord.functionalItems || []).map((item) => ({ ...item }))
    const flexibilityItems = (editingRecord.flexibilityItems || []).map((item) => ({ ...item }))
    if (editingRecord.type === 'strength' && strengthItems.length === 0) {
      strengthItems.push(createDefaultStrengthItem())
    } else if (editingRecord.type === 'cardio' && cardioItems.length === 0) {
      cardioItems.push(createDefaultCardioItem())
    } else if (editingRecord.type === 'functional' && functionalItems.length === 0) {
      functionalItems.push(createDefaultFunctionalItem())
    } else if (editingRecord.type === 'flexibility' && flexibilityItems.length === 0) {
      flexibilityItems.push(createDefaultFlexibilityItem())
    }
    resetEditForm({
      date: parseISOToDate(editingRecord.date),
      strengthItems,
      cardioItems,
      functionalItems,
      flexibilityItems,
    })
  }, [editingRecord, resetEditForm])

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

  const getTypeBadge = (t: LogType) => {
    switch (t) {
      case 'strength':
        return (
          <Badge size="lg" color="red" variant="light">
            {getTypeLabel(t)}
          </Badge>
        )
      case 'cardio':
        return (
          <Badge size="lg" color="blue" variant="light">
            {getTypeLabel(t)}
          </Badge>
        )
      case 'functional':
        return (
          <Badge size="lg" color="green" variant="light">
            {getTypeLabel(t)}
          </Badge>
        )
      case 'flexibility':
        return (
          <Badge size="lg" color="violet" variant="light">
            {getTypeLabel(t)}
          </Badge>
        )
      default:
        return <Badge size="lg">{getTypeLabel(t)}</Badge>
    }
  }

  const getDetailsText = (r: LogbookRecord): string => {
    if (r.type === 'strength') {
      return (r.strengthItems || [])
        .map(
          (s) =>
            `项目名称：${s.name || '未命名'}，组数：${s.sets}组，次数：${s.reps}次，重量：${s.weight}kg`
        )
        .join('； ')
    }
    if (r.type === 'cardio') {
      return (r.cardioItems || [])
        .map(
          (c) =>
            `项目名称：${c.activity || '未命名'}，时长：${c.durationMinutes}min，距离：${c.distanceKm ?? 0}km`
        )
        .join('； ')
    }
    if (r.type === 'functional') {
      return (r.functionalItems || [])
        .map((f) => `项目名称：${f.activity || '未命名'}，时长：${f.durationMinutes}min`)
        .join('； ')
    }
    return (r.flexibilityItems || [])
      .map((f) => `项目名称：${f.activity || '未命名'}，时长：${f.durationMinutes}min`)
      .join('； ')
  }

  const onSubmit = handleSubmit(async (values) => {
    if (!values.date) {
      return // 验证失败，不会执行后续代码
    }
    // 处理日期：如果已经是字符串格式（YYYY-MM-DD），直接使用；如果是 Date 对象，转换为字符串
    const iso = typeof values.date === 'string' ? values.date : formatDateISO(values.date)

    // 为每个训练项创建独立的记录
    if (values.type === 'strength') {
      for (const item of values.strengthItems) {
        const normalized: StrengthItem = {
          id: Math.random().toString(36).slice(2),
          ...item,
        }
        await saveRecord({ date: iso, type: 'strength', strengthItems: [normalized] })
      }
    } else if (values.type === 'cardio') {
      for (const item of values.cardioItems) {
        const normalized: CardioItem = {
          id: Math.random().toString(36).slice(2),
          ...item,
        }
        await saveRecord({ date: iso, type: 'cardio', cardioItems: [normalized] })
      }
    } else if (values.type === 'functional') {
      for (const item of values.functionalItems) {
        const normalized: FunctionalItem = {
          id: Math.random().toString(36).slice(2),
          ...item,
        }
        await saveRecord({ date: iso, type: 'functional', functionalItems: [normalized] })
      }
    } else if (values.type === 'flexibility') {
      for (const item of values.flexibilityItems) {
        const normalized: FlexibilityItem = {
          id: Math.random().toString(36).slice(2),
          ...item,
        }
        await saveRecord({ date: iso, type: 'flexibility', flexibilityItems: [normalized] })
      }
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
        <Stack gap="sm">
          <Group justify="space-between" wrap="wrap" className={classes.cardHeader}>
            <Text fw={700} size="lg" className={classes.title}>
              记录训练
            </Text>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <SegmentedControl
                  className={classes.typeControl}
                  size={isTablet ? 'sm' : 'md'}
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
          <Divider className={classes.divider} />

          {type === 'strength' ? (
            <Stack gap="xs">
              <Group justify="space-between">
                <Text className={classes.cardTitle}>力量项目</Text>
                <Group gap="md" align="center" wrap="nowrap">
                  <Group gap="xs" align="center" wrap="nowrap" style={{ marginRight: '8px' }}>
                    {!isTablet && (
                      <Text size="md" c="var(--mantine-color-text)">
                        选择日期
                      </Text>
                    )}
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: '请选择日期' }}
                      render={({ field, fieldState }) => (
                        <DatePickerInput
                          placeholder="选择日期"
                          size="sm"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="YYYY-MM-DD"
                          locale="en"
                          className={classes.datePicker}
                          firstDayOfWeek={1}
                          monthLabelFormat="MMMM YYYY"
                          popoverProps={{ withinPortal: true }}
                          error={fieldState.error?.message}
                          presets={[
                            {
                              value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                              label: 'Yesterday',
                            },
                            { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
                            {
                              value: dayjs().add(1, 'day').format('YYYY-MM-DD'),
                              label: 'Tomorrow',
                            },
                            {
                              value: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                              label: 'Next month',
                            },
                            {
                              value: dayjs().add(1, 'year').format('YYYY-MM-DD'),
                              label: 'Next year',
                            },
                            {
                              value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
                              label: 'Last month',
                            },
                            {
                              value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
                              label: 'Last year',
                            },
                          ]}
                        />
                      )}
                    />
                  </Group>
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
              </Group>
              <AnimatePresence initial={false}>
                {strengthFields.map((field, idx) => (
                  <motion.div
                    key={field.key}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text
                          size="sm"
                          className={classes.formLabel}
                          style={{ whiteSpace: 'nowrap' }}
                        >
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                        onClick={() => {
                          if (strengthFields.length > 1) {
                            strengthRemove(idx)
                          }
                        }}
                        disabled={strengthFields.length <= 1}
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
            <Stack gap="xs">
              <Group justify="space-between">
                <Text className={classes.cardTitle}>有氧项目</Text>
                <Group gap="md" align="center" wrap="nowrap">
                  <Group gap="xs" align="center" wrap="nowrap" style={{ marginRight: '8px' }}>
                    {!isTablet && (
                      <Text size="md" c="var(--mantine-color-text)">
                        选择日期
                      </Text>
                    )}
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: '请选择日期' }}
                      render={({ field, fieldState }) => (
                        <DatePickerInput
                          placeholder="选择日期"
                          size="sm"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="YYYY-MM-DD"
                          locale="en"
                          className={classes.datePicker}
                          firstDayOfWeek={1}
                          monthLabelFormat="MMMM YYYY"
                          popoverProps={{ withinPortal: true }}
                          error={fieldState.error?.message}
                          presets={[
                            {
                              value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                              label: 'Yesterday',
                            },
                            { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
                            {
                              value: dayjs().add(1, 'day').format('YYYY-MM-DD'),
                              label: 'Tomorrow',
                            },
                            {
                              value: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                              label: 'Next month',
                            },
                            {
                              value: dayjs().add(1, 'year').format('YYYY-MM-DD'),
                              label: 'Next year',
                            },
                            {
                              value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
                              label: 'Last month',
                            },
                            {
                              value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
                              label: 'Last year',
                            },
                          ]}
                        />
                      )}
                    />
                  </Group>
                  <Button
                    className={classes.addButton}
                    size="xs"
                    leftSection={<IconPlus size={16} />}
                    onClick={() =>
                      cardioAppend({ activity: '', durationMinutes: 30, distanceKm: 5 })
                    }
                    variant="light"
                  >
                    添加训练项
                  </Button>
                </Group>
              </Group>
              <AnimatePresence initial={false}>
                {cardioFields.map((field, idx) => (
                  <motion.div
                    key={field.key}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text
                          size="sm"
                          className={classes.formLabel}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          项目名称
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                        onClick={() => {
                          if (cardioFields.length > 1) {
                            cardioRemove(idx)
                          }
                        }}
                        disabled={cardioFields.length <= 1}
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
            <Stack gap="xs">
              <Group justify="space-between">
                <Text className={classes.cardTitle}>功能性训练</Text>
                <Group gap="md" align="center" wrap="nowrap">
                  <Group gap="xs" align="center" wrap="nowrap" style={{ marginRight: '8px' }}>
                    {!isTablet && (
                      <Text size="md" c="var(--mantine-color-text)">
                        选择日期
                      </Text>
                    )}
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: '请选择日期' }}
                      render={({ field, fieldState }) => (
                        <DatePickerInput
                          placeholder="选择日期"
                          size="sm"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="YYYY-MM-DD"
                          locale="en"
                          className={classes.datePicker}
                          firstDayOfWeek={1}
                          monthLabelFormat="MMMM YYYY"
                          popoverProps={{ withinPortal: true }}
                          error={fieldState.error?.message}
                          presets={[
                            {
                              value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                              label: 'Yesterday',
                            },
                            { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
                            {
                              value: dayjs().add(1, 'day').format('YYYY-MM-DD'),
                              label: 'Tomorrow',
                            },
                            {
                              value: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                              label: 'Next month',
                            },
                            {
                              value: dayjs().add(1, 'year').format('YYYY-MM-DD'),
                              label: 'Next year',
                            },
                            {
                              value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
                              label: 'Last month',
                            },
                            {
                              value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
                              label: 'Last year',
                            },
                          ]}
                        />
                      )}
                    />
                  </Group>
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
              </Group>
              <AnimatePresence initial={false}>
                {functionalFields.map((field, idx) => (
                  <motion.div
                    key={field.key}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text
                          size="sm"
                          className={classes.formLabel}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          项目名称
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                        onClick={() => {
                          if (functionalFields.length > 1) {
                            functionalRemove(idx)
                          }
                        }}
                        disabled={functionalFields.length <= 1}
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
            <Stack gap="xs">
              <Group justify="space-between">
                <Text className={classes.cardTitle}>柔韧性训练</Text>
                <Group gap="md" align="center" wrap="nowrap">
                  <Group gap="xs" align="center" wrap="nowrap" style={{ marginRight: '8px' }}>
                    {!isTablet && (
                      <Text size="md" c="var(--mantine-color-text)">
                        选择日期
                      </Text>
                    )}
                    <Controller
                      control={control}
                      name="date"
                      rules={{ required: '请选择日期' }}
                      render={({ field, fieldState }) => (
                        <DatePickerInput
                          placeholder="选择日期"
                          size="sm"
                          value={field.value}
                          onChange={field.onChange}
                          valueFormat="YYYY-MM-DD"
                          locale="en"
                          className={classes.datePicker}
                          firstDayOfWeek={1}
                          monthLabelFormat="MMMM YYYY"
                          popoverProps={{ withinPortal: true }}
                          error={fieldState.error?.message}
                          presets={[
                            {
                              value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                              label: 'Yesterday',
                            },
                            { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
                            {
                              value: dayjs().add(1, 'day').format('YYYY-MM-DD'),
                              label: 'Tomorrow',
                            },
                            {
                              value: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                              label: 'Next month',
                            },
                            {
                              value: dayjs().add(1, 'year').format('YYYY-MM-DD'),
                              label: 'Next year',
                            },
                            {
                              value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
                              label: 'Last month',
                            },
                            {
                              value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
                              label: 'Last year',
                            },
                          ]}
                        />
                      )}
                    />
                  </Group>
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
              </Group>
              <AnimatePresence initial={false}>
                {flexibilityFields.map((field, idx) => (
                  <motion.div
                    key={field.key}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    variants={rowVariants}
                    transition={{ duration: 0.2 }}
                  >
                    <Group align="center" wrap="wrap" gap="sm" className={classes.formRow}>
                      <Group align="center" gap="xs" style={{ flex: 2, minWidth: 200 }}>
                        <Text
                          size="sm"
                          className={classes.formLabel}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          项目名称
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
                            <Text
                              size="sm"
                              className={classes.formLabel}
                              style={{ whiteSpace: 'nowrap' }}
                            >
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
                        onClick={() => {
                          if (flexibilityFields.length > 1) {
                            flexibilityRemove(idx)
                          }
                        }}
                        disabled={flexibilityFields.length <= 1}
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
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Text className={classes.title}>训练历史</Text>
          </Group>

          <Box className={classes.tableContainer} style={{ position: 'relative' }}>
            <LoadingOverlay visible={loading} zIndex={5} />
            <Table striped highlightOnHover withTableBorder withColumnBorders>
              <Table.Thead className={classes.thead}>
                <Table.Tr>
                  <Table.Th className={classes.dateCol}>日期</Table.Th>
                  <Table.Th className={classes.typeCol}>类型</Table.Th>
                  <Table.Th className={classes.detailCol}>详情</Table.Th>
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
                      <Table.Td className={classes.typeCol}>{getTypeBadge(r.type)}</Table.Td>
                      <Table.Td className={classes.detailCol}>
                        <Text size={isTablet ? 'xs' : 'sm'} className={classes.detailText}>
                          {getDetailsText(r)}
                        </Text>
                      </Table.Td>
                      <Table.Td className={classes.opsCol}>
                        <Group gap="xs" justify="center" wrap="nowrap">
                          {isTablet ? (
                            <>
                              <Button
                                size="xs"
                                radius="xl"
                                variant="subtle"
                                aria-label="编辑"
                                title="编辑"
                                leftSection={<IconEdit size={14} />}
                                onClick={() => {
                                  setEditingRecord(r)
                                  setEditDrawerOpened(true)
                                }}
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
                                onClick={() => {
                                  setEditingRecord(r)
                                  setEditDrawerOpened(true)
                                }}
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
          </Box>

          <Group justify="space-between" mt="md" className={classes.pagination}>
            <Group gap="xs">
              <Text size="md" c="var(--mantine-color-text)">
                每页
              </Text>
              <SegmentedControl
                size="sm"
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
              <Text size="md" c="var(--mantine-color-text)">
                共{total}条
              </Text>
            </Group>
          </Group>
        </Stack>
      </Card>

      <Drawer
        opened={editDrawerOpened}
        onClose={() => {
          if (!updating) {
            closeEditDrawer()
          }
        }}
        title={editingRecord ? `编辑${getTypeLabel(editingRecord.type)}训练` : '编辑训练记录'}
        padding={0}
        size={isTablet ? '100%' : 'md'}
        position={isTablet ? 'bottom' : 'right'}
        closeOnClickOutside={!updating}
        closeOnEscape={!updating}
        keepMounted={false}
        classNames={{
          content: classes.drawerContent,
          header: classes.drawerHeader,
          body: classes.drawerBody,
          title: classes.drawerTitle,
          close: classes.drawerClose,
        }}
      >
        <Box className={classes.drawerInnerBox}>
          <LoadingOverlay
            visible={updating}
            zIndex={1000}
            overlayProps={{ radius: 'lg', blur: 3, color: 'var(--mantine-color-blue-0)' }}
            loaderProps={{ color: 'var(--mantine-color-blue-6)' }}
          />
          {editingRecord ? (
            <Stack gap="xl" component="form" onSubmit={onEditSubmit} className={classes.drawerForm}>
              <Stack gap="sm" className={classes.drawerSection}>
                <Text className={classes.drawerSectionTitle}>基础信息</Text>
                {/* <Text className={classes.drawerSectionSubtitle}>
                  确认训练日期，保持记录准确无误。
                </Text> */}
                <Controller
                  control={editControl}
                  name="date"
                  rules={{ required: '请选择日期' }}
                  render={({ field, fieldState }) => (
                    <DatePickerInput
                      label="训练日期"
                      placeholder="选择日期"
                      size="sm"
                      radius="md"
                      value={field.value}
                      onChange={field.onChange}
                      valueFormat="YYYY-MM-DD"
                      locale="en"
                      firstDayOfWeek={1}
                      monthLabelFormat="MMMM YYYY"
                      popoverProps={{ withinPortal: true }}
                      error={fieldState.error?.message}
                      classNames={{
                        label: classes.drawerFieldLabel,
                        input: classes.drawerInput,
                      }}
                      presets={[
                        {
                          value: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
                          label: 'Yesterday',
                        },
                        { value: dayjs().format('YYYY-MM-DD'), label: 'Today' },
                        { value: dayjs().add(1, 'day').format('YYYY-MM-DD'), label: 'Tomorrow' },
                        {
                          value: dayjs().add(1, 'month').format('YYYY-MM-DD'),
                          label: 'Next month',
                        },
                        { value: dayjs().add(1, 'year').format('YYYY-MM-DD'), label: 'Next year' },
                        {
                          value: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
                          label: 'Last month',
                        },
                        {
                          value: dayjs().subtract(1, 'year').format('YYYY-MM-DD'),
                          label: 'Last year',
                        },
                      ]}
                    />
                  )}
                />
              </Stack>

              {editType === 'strength' && (
                <Stack gap="sm" className={classes.drawerSection}>
                  <Text className={classes.drawerSectionTitle}>力量项目</Text>
                  <Text className={classes.drawerSectionSubtitle}>
                    保持组次信息整洁，便于对比历史训练。
                  </Text>
                  {editStrengthFields.map((field, idx) => (
                    <Stack key={field.key} gap="md" className={classes.drawerItemCard}>
                      <Text className={classes.drawerItemTitle}>训练项 {idx + 1}</Text>
                      <TextInput
                        label="项目名称"
                        placeholder="卧推 / 深蹲 / 硬拉等"
                        size="sm"
                        radius="md"
                        classNames={{
                          label: classes.drawerFieldLabel,
                          input: classes.drawerInput,
                        }}
                        {...editRegister(`strengthItems.${idx}.name` as const)}
                      />
                      <Controller
                        control={editControl}
                        name={`strengthItems.${idx}.sets`}
                        render={({ field }) => (
                          <NumberInput
                            label="组数"
                            min={1}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 1}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                      <Controller
                        control={editControl}
                        name={`strengthItems.${idx}.reps`}
                        render={({ field }) => (
                          <NumberInput
                            label="次数"
                            min={1}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 1}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                      <Controller
                        control={editControl}
                        name={`strengthItems.${idx}.weight`}
                        render={({ field }) => (
                          <NumberInput
                            label="重量 (kg)"
                            min={0}
                            step={2.5}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 0}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}

              {editType === 'cardio' && (
                <Stack gap="sm" className={classes.drawerSection}>
                  <Text className={classes.drawerSectionTitle}>有氧项目</Text>
                  <Text className={classes.drawerSectionSubtitle}>
                    记录每一次心肺训练，关注距离与时间。
                  </Text>
                  {editCardioFields.map((field, idx) => (
                    <Stack key={field.key} gap="md" className={classes.drawerItemCard}>
                      <Text className={classes.drawerItemTitle}>训练项 {idx + 1}</Text>
                      <TextInput
                        label="项目名称"
                        placeholder="跑步 / 骑行 / 游泳等"
                        size="sm"
                        radius="md"
                        classNames={{
                          label: classes.drawerFieldLabel,
                          input: classes.drawerInput,
                        }}
                        {...editRegister(`cardioItems.${idx}.activity` as const)}
                      />
                      <Controller
                        control={editControl}
                        name={`cardioItems.${idx}.durationMinutes`}
                        render={({ field }) => (
                          <NumberInput
                            label="时长 (分钟)"
                            min={1}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 1}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                      <Controller
                        control={editControl}
                        name={`cardioItems.${idx}.distanceKm`}
                        render={({ field }) => (
                          <NumberInput
                            label="距离 (km)"
                            min={0}
                            step={0.5}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 0}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}

              {editType === 'functional' && (
                <Stack gap="sm" className={classes.drawerSection}>
                  <Text className={classes.drawerSectionTitle}>功能性训练</Text>
                  <Text className={classes.drawerSectionSubtitle}>
                    聚焦灵活性与爆发力，保持动作标准。
                  </Text>
                  {editFunctionalFields.map((field, idx) => (
                    <Stack key={field.key} gap="md" className={classes.drawerItemCard}>
                      <Text className={classes.drawerItemTitle}>训练项 {idx + 1}</Text>
                      <TextInput
                        label="项目名称"
                        placeholder="核心 / 平衡 / 爆发等"
                        size="sm"
                        radius="md"
                        classNames={{
                          label: classes.drawerFieldLabel,
                          input: classes.drawerInput,
                        }}
                        {...editRegister(`functionalItems.${idx}.activity` as const)}
                      />
                      <Controller
                        control={editControl}
                        name={`functionalItems.${idx}.durationMinutes`}
                        render={({ field }) => (
                          <NumberInput
                            label="时长 (分钟)"
                            min={1}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 1}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}

              {editType === 'flexibility' && (
                <Stack gap="sm" className={classes.drawerSection}>
                  <Text className={classes.drawerSectionTitle}>柔韧性训练</Text>
                  <Text className={classes.drawerSectionSubtitle}>
                    循序渐进地提升柔韧，关注每次拉伸时长。
                  </Text>
                  {editFlexibilityFields.map((field, idx) => (
                    <Stack key={field.key} gap="md" className={classes.drawerItemCard}>
                      <Text className={classes.drawerItemTitle}>训练项 {idx + 1}</Text>
                      <TextInput
                        label="项目名称"
                        placeholder="静态拉伸 / 动态拉伸 / 瑜伽等"
                        size="sm"
                        radius="md"
                        classNames={{
                          label: classes.drawerFieldLabel,
                          input: classes.drawerInput,
                        }}
                        {...editRegister(`flexibilityItems.${idx}.activity` as const)}
                      />
                      <Controller
                        control={editControl}
                        name={`flexibilityItems.${idx}.durationMinutes`}
                        render={({ field }) => (
                          <NumberInput
                            label="时长 (分钟)"
                            min={1}
                            size="sm"
                            radius="md"
                            classNames={{
                              label: classes.drawerFieldLabel,
                              input: classes.drawerInput,
                            }}
                            value={field.value ?? 1}
                            onChange={(v) => field.onChange(typeof v === 'number' ? v : 0)}
                          />
                        )}
                      />
                    </Stack>
                  ))}
                </Stack>
              )}

              <Group justify="space-between" align="center" className={classes.drawerActions}>
                <Text size="sm" className={classes.drawerHint}>
                  温馨提示：保持真实记录，才能更好地追踪训练进度。
                </Text>
                <Group gap="sm">
                  <Button
                    variant="subtle"
                    color="blue"
                    onClick={closeEditDrawer}
                    type="button"
                    disabled={updating}
                    radius="md"
                  >
                    取消
                  </Button>
                  <Button type="submit" loading={updating} radius="md" color="blue">
                    保存修改
                  </Button>
                </Group>
              </Group>
            </Stack>
          ) : (
            <Text c="dimmed" size="sm">
              请选择要编辑的训练记录
            </Text>
          )}
        </Box>
      </Drawer>

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
