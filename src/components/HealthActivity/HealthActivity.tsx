import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import CloseIcon from '@mui/icons-material/Close'
import ChartSpinner from '@mui/material/CircularProgress'
import { RootState } from '../../store/store'
import { CircularProgress } from '../CircularProgress/CircularProgress'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomSkeleton } from '../../CustomMui/CustomSkeleton/CustomSkeleton'
import { ActivityBarChart } from '../BarChart/BarChart'
import { ActivityFilter } from './ActivityFilter/ActivityFilter'
import { activityService } from '../../services/health/activity.service'
import { intakeService } from '../../services/day/intake.service'
import { CaloriesMedalIcon } from '../../CustomMui/CustomIcon/medal-icons'
import { capacitorService } from '../../services/capacitor.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { formatNumberWithCommas } from '../../services/util.service'
import {
  addIsraelDays,
  israelTodayKey,
} from '../../services/health/activity-dates'
import type {
  ActivityFrame,
  ActivityMetric,
  ActivityPage,
  ActivityVendor,
} from '../../types/health/Activity'
import { healthActivityNs } from './locals'
import './locals'

import { SlideAnimation } from '../SlideAnimation/SlideAnimation'

interface HealthActivityProps {
  metric?: ActivityMetric
  goalIcon?: ReactNode
  source?: 'activity' | 'intake'
}

export function HealthActivity({
  metric = 'steps',
  goalIcon,
  source = 'activity',
}: HealthActivityProps) {
  const { t, i18n } = useTranslation(healthActivityNs)
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const isRtl = prefs.lang === 'he'
  const userId = useSelector((state: RootState) => state.userModule.user?._id)
  const googleHealthConnected = useSelector(
    (state: RootState) => state.healthModule.googleHealthConnected
  )
  const isNative = useSelector(
    (state: RootState) => state.systemModule.isNative
  )
  const vendor: ActivityVendor =
    !isNative || googleHealthConnected || prefs.healthProvider === 'google'
      ? 'google'
      : 'native'

  const [frame, setFrame] = useState<ActivityFrame>('week')
  const [end, setEnd] = useState<string | undefined>(undefined)
  const [page, setPage] = useState<ActivityPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [direction, setDirection] = useState(1)
  const [motionKey, setMotionKey] = useState('activity')
  const hasPage = useRef(false)
  const queryRef = useRef({ userId, vendor, metric, frame, end, source })
  const requestRef = useRef(0)
  queryRef.current = { userId, vendor, metric, frame, end, source }
  const hitIcon =
    source === 'intake' ? (
      <CaloriesMedalIcon sx={{ color: 'var(--accent)' }} />
    ) : (
      goalIcon
    )

  useEffect(() => {
    if (source === 'intake' || !userId) return
    let cancelled = false

    const refreshRecent = async () => {
      const today = israelTodayKey()
      try {
        await saveOrFallback(userId, vendor, addIsraelDays(today, -1), today)
      } catch {
        return
      }
      if (!cancelled) await loadPage(queryRef.current, false)
    }

    const pullHistory = async () => {
      try {
        await activityService.backfill(userId, vendor)
      } catch {
        return
      }
      if (!cancelled) await loadPage(queryRef.current, false)
    }

    refreshRecent().catch(() => undefined)
    pullHistory().catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [userId, vendor, metric, source])

  useEffect(() => {
    const showPage = async () => {
      await loadPage(queryRef.current, true)
    }
    showPage().catch(() => undefined)
  }, [userId, vendor, metric, frame, end, source])

  function onFrame(next: ActivityFrame) {
    if (next === frame) return
    capacitorService.vibrate('Light')
    const frames: ActivityFrame[] = ['week', 'month', 'quarter', 'year']
    setDirection(frames.indexOf(next) >= frames.indexOf(frame) ? 1 : -1)
    setSelectedIndex(null)
    setEnd(undefined)
    setFrame(next)
  }

  function onPrevious() {
    if (!page) return
    setDirection(-1)
    setSelectedIndex(null)
    setEnd(previousEnd(page))
  }

  function onNext() {
    if (!page) return
    setDirection(1)
    setSelectedIndex(null)
    setEnd(nextEnd(page))
  }

  function onToday() {
    setDirection(1)
    setSelectedIndex(null)
    setEnd(undefined)
  }

  async function loadPage(
    query: {
      userId?: string
      vendor: ActivityVendor
      metric: ActivityMetric
      frame: ActivityFrame
      end?: string
      source: 'activity' | 'intake'
    },
    showLoading: boolean
  ) {
    if (!query.userId) return
    const requestId = requestRef.current + 1
    requestRef.current = requestId
    if (showLoading) setLoading(true)
    try {
      const next =
        query.source === 'intake'
          ? await intakeService.getPage(query.userId, query.frame, query.end)
          : await activityService.getPage(
              query.userId,
              query.metric,
              query.frame,
              query.vendor,
              query.end
            )
      if (requestId !== requestRef.current) return
      setPage(next)
      if (showLoading) setSelectedIndex(null)
      if (hasPage.current && showLoading) {
        setMotionKey(`${next.frame}-${next.start}-${next.end}`)
      }
      hasPage.current = true
    } catch {
      if (requestId !== requestRef.current) return
      showErrorMsg(t('loadFailed'))
    } finally {
      if (requestId === requestRef.current) setLoading(false)
    }
  }

  const selected = selectedIndex == null ? null : page?.bars[selectedIndex]
  const displayValue = selected?.value ?? page?.average ?? 0
  const anchorGoal = selected
    ? selected.goal ?? page?.goal ?? 0
    : page?.goal ?? 0
  const metricTag = metric === 'steps' ? 'steps' : 'burned'
  const anchorTarget =
    source === 'intake'
      ? selected
        ? selected.target ?? null
        : page?.target ?? null
      : anchorGoal > 0
      ? metricTag
      : null
  const goalLabel =
    anchorTarget === 'steps' || anchorTarget === 'burned'
      ? compactGoal(anchorGoal)
      : undefined
  const percent = anchorGoal > 0 ? (displayValue / anchorGoal) * 100 : 0
  const summary = selected
    ? rangeLabel(selected.start, selected.end, i18n.language)
    : t('summary', {
        days: page?.goalDays ?? 0,
        total: formatNumberWithCommas(page?.total ?? 0),
      })

  return (
    <div
      className='health-activity-container'
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      <ActivityFilter
        frame={frame}
        loading={loading}
        canGoPrevious={Boolean(page?.canGoPrevious)}
        canGoNext={Boolean(page?.canGoNext)}
        canGoCurrent={Boolean(page?.canGoCurrent)}
        onFrame={onFrame}
        onPrevious={onPrevious}
        onNext={onNext}
        onToday={onToday}
        period={
          page
            ? periodLabel(page.start, page.end, page.frame, i18n.language)
            : ''
        }
        liveStreak={page?.liveStreak}
        target={anchorTarget}
        goalLabel={goalLabel}
      />

      <SlideAnimation
        className='activity-page'
        motionKey={motionKey}
        direction={direction}
      >
        <div className='activity-ring'>
          <CircularProgress
            value={percent}
            text={String(displayValue)}
            afterText={
              anchorGoal > 0 ? goalLabel ?? String(anchorGoal) : undefined
            }
            isLoading={loading && !page}
          />
          {loading && !page ? (
            <CustomSkeleton
              variant='text'
              width='80%'
              height={28}
            />
          ) : (
            <div className='activity-summary'>
              <p className={selected ? `` : `avg-text`}>{summary}</p>
              {selected && (
                <CustomButton
                  isIcon
                  icon={<CloseIcon />}
                  variant='flat'
                  shouldVibrate={false}
                  ariaLabel={t('close')}
                  onClick={() => setSelectedIndex(null)}
                />
              )}
            </div>
          )}
        </div>

        {loading && !page ? (
          <div className='activity-chart-loading'>
            <ChartSpinner
              className={prefs.favoriteColor}
              size={100}
            />
          </div>
        ) : (
          <ActivityBarChart
            bars={(page?.bars ?? []).map((bar, index, all) => ({
              label: barAxisLabel(bar, index, all, frame, i18n.language),
              value: bar.value,
              goalHit: bar.goalHit,
              active: isCurrentBar(bar.start, bar.end),
              rangeLow: bar.rangeLow,
              rangeHigh: bar.rangeHigh,
              target: bar.target,
            }))}
            goal={anchorGoal}
            axisHeight={page?.axisHeight ?? 1}
            frame={frame}
            rtl={isRtl}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            goalMedallion
            goalLogo
            goalIcon={hitIcon}
            yellowMedal={prefs.favoriteColor === 'yellow'}
            goalTone={goalLabel ? metricTag : undefined}
          />
        )}

        {loading && !page ? (
          <CustomSkeleton
            variant='rounded'
            height={88}
            width='100%'
          />
        ) : (
          <div className='activity-streak'>
            <p className='streak-count'>
              {page && page.streak > 0
                ? t('streak', { count: page.streak })
                : t('noStreak')}
            </p>
            <p className='streak-hint'>
              {page && page.streak > 0 ? t('streakHint') : t('noStreakHint')}
            </p>
          </div>
        )}

        <div className='activity-cards'>
          {loading && !page
            ? [0, 1, 2].map((item) => (
                <CustomSkeleton
                  key={item}
                  variant='rounded'
                  height={64}
                  width='100%'
                />
              ))
            : page?.cards.map((card) => (
                <div
                  key={`${card.start}-${card.end}`}
                  className='activity-card'
                >
                  <span>{rangeLabel(card.start, card.end, i18n.language)}</span>
                  {card.logged !== false && (
                    <span className='activity-card-value'>
                      {card.goalHit && hitIcon}
                      <bdi>{formatNumberWithCommas(card.value)}</bdi>
                    </span>
                  )}
                </div>
              ))}
        </div>
      </SlideAnimation>
    </div>
  )
}

async function saveOrFallback(
  userId: string,
  vendor: ActivityVendor,
  start: string,
  end: string
) {
  try {
    const result = await activityService.saveRange(userId, vendor, start, end)
    if (result?.status === 'not_connected') {
      const other = vendor === 'google' ? 'native' : 'google'
      await activityService.saveRange(userId, other, start, end)
    }
  } catch {
    const other = vendor === 'google' ? 'native' : 'google'
    await activityService
      .saveRange(userId, other, start, end)
      .catch(() => undefined)
  }
}

function isCurrentBar(start: string, end: string) {
  const today = israelTodayKey()
  return today >= start && today <= end
}

function previousEnd(page: ActivityPage) {
  if (page.frame === 'year') return String(Number(page.start.slice(0, 4)) - 1)
  return addIsraelDays(page.start, -1)
}

function nextEnd(page: ActivityPage) {
  if (page.frame === 'year') return String(Number(page.start.slice(0, 4)) + 1)
  if (page.frame === 'month') return addIsraelDays(page.end, 30)
  if (page.frame === 'quarter') return addIsraelDays(page.end, 91)
  return addIsraelDays(page.end, 7)
}

function barAxisLabel(
  bar: { start: string; end: string },
  index: number,
  bars: { start: string }[],
  frame: ActivityFrame,
  language: string
) {
  if (frame === 'quarter') {
    const month = bar.start.slice(0, 7)
    if (bars[index - 1]?.start.slice(0, 7) === month) return ''
  }
  return barLabel(bar.start, bar.end, frame, language)
}

function barLabel(
  start: string,
  end: string,
  frame: ActivityFrame,
  language: string
) {
  const date = keyToDate(start)
  if (frame === 'week') {
    const narrow = new Intl.DateTimeFormat(language, {
      weekday: 'narrow',
      timeZone: 'Asia/Jerusalem',
    }).format(date)
    return Array.from(narrow)[0] ?? ''
  }
  if (frame === 'month') return String(date.getUTCDate())
  if (frame === 'year' || start.slice(0, 7) === end.slice(0, 7)) {
    return new Intl.DateTimeFormat(language, {
      month: 'short',
      timeZone: 'Asia/Jerusalem',
    }).format(date)
  }
  return ''
}

function periodLabel(
  start: string,
  end: string,
  frame: ActivityFrame,
  language: string
) {
  if (frame === 'year') return start.slice(0, 4)
  const startDate = keyToDate(start)
  const endDate = keyToDate(end)
  const month = new Intl.DateTimeFormat(language, {
    month: 'short',
    timeZone: 'Asia/Jerusalem',
  })
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${startDate.getUTCDate()}-${endDate.getUTCDate()} ${month.format(
      endDate
    )}`
  }
  return `${startDate.getUTCDate()} ${month.format(
    startDate
  )} - ${endDate.getUTCDate()} ${month.format(endDate)}`
}

function rangeLabel(start: string, end: string, language: string) {
  const format = new Intl.DateTimeFormat(language, {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Jerusalem',
  })
  if (start === end) return format.format(keyToDate(start))
  return `${format.format(keyToDate(start))} – ${format.format(keyToDate(end))}`
}

function compactGoal(value: number) {
  if (value < 1000) return String(Math.round(value))
  const compact = Math.round(value / 100) / 10
  return `${compact}k`
}

function keyToDate(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 12))
}
