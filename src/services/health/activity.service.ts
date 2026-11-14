import { httpService } from '../http.service'
import { healthService } from './health.service'
import {
  addIsraelDays,
  israelDayStartIso,
  israelDaysFrom,
  israelKeyFromDate,
  israelTodayKey,
} from './activity-dates'
import type {
  ActivityDayInput,
  ActivityFrame,
  ActivityMetric,
  ActivityPage,
  ActivityVendor,
} from '../../types/health/Activity'

export const activityService = {
  getPage,
  saveRange,
  backfill,
}

function getPage(
  userId: string,
  metric: ActivityMetric,
  frame: ActivityFrame,
  vendor: ActivityVendor,
  end?: string
) {
  return httpService.get('health/activity', {
    userId,
    metric,
    frame,
    vendor,
    end,
  }) as Promise<ActivityPage>
}

async function saveRange(
  userId: string,
  vendor: ActivityVendor,
  start: string,
  end: string
) {
  if (vendor === 'google') {
    return httpService.post('health/activity/google', { userId, start, end })
  }

  const days = await readPhoneDays(start, end, true)
  return httpService.post('health/activity/days', { userId, days })
}

function backfill(userId: string, vendor: ActivityVendor) {
  if (vendor === 'google') {
    return httpService.post('health/activity/backfill', { userId })
  }
  return backfillPhone(userId)
}

async function backfillPhone(userId: string) {
  let end = addIsraelDays(israelTodayKey(), -1)
  for (let guard = 0; guard < 200; guard += 1) {
    const start = addIsraelDays(end, -29)
    const days = await readPhoneDays(start, end, true)
    const oldest = days.find((day) => day.steps > 0 || day.calories > 0)
    if (!oldest) return
    await httpService.post('health/activity/days', {
      userId,
      days: days.filter((day) => day.date >= oldest.date),
    })
    end = addIsraelDays(start, -1)
  }
}

async function readPhoneDays(start: string, end: string, fillGaps: boolean) {
  const totals = await healthService.readDailyTotals(
    israelDayStartIso(start),
    israelDayStartIso(addIsraelDays(end, 1))
  )
  const byDate = new Map<string, ActivityDayInput>()

  if (fillGaps) {
    for (const date of israelDaysFrom(start, end)) {
      byDate.set(date, { date, steps: 0, calories: 0 })
    }
  }

  addSamples(byDate, totals.steps, 'steps')
  addSamples(byDate, totals.calories, 'calories')
  return [...byDate.values()]
}

function addSamples(
  byDate: Map<string, ActivityDayInput>,
  samples: { startDate: string; value: number }[],
  metric: 'steps' | 'calories'
) {
  for (const sample of samples) {
    const date = israelKeyFromDate(new Date(sample.startDate))
    const current = byDate.get(date) ?? { date, steps: 0, calories: 0 }
    current[metric] += Math.round(sample.value) || 0
    byDate.set(date, current)
  }
}
