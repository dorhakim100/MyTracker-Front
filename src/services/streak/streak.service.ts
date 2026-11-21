import { DEFAULT_DAILY_STEPS_GOAL } from '../../constants/steps-goal.constants'
import { israelTodayKey } from '../health/activity-dates'
import type { Goal } from '../../types/goal/Goal'
import type { StreakStat, User } from '../../types/user/User'

export type TodayStreakHits = {
  steps: boolean
  burned: boolean
  consumed: boolean | null
}

export function applyTodayStreaks(user: User, hits: TodayStreakHits): User {
  if (!user.streaks) return user

  const steps = addToday(user.streaks.steps, hits.steps)
  const burned = addToday(user.streaks.burned, hits.burned)
  const consumed = syncToday(user.streaks.consumed, hits.consumed)
  if (
    steps === user.streaks.steps &&
    burned === user.streaks.burned &&
    consumed === user.streaks.consumed
  ) {
    return user
  }

  return {
    ...user,
    streaks: { steps, burned, consumed },
  }
}

export function todayStreakHits(
  user: User,
  health: { ready: boolean; steps: number; burnedCalories: number }
): TodayStreakHits {
  return {
    steps: health.ready && reached(health.steps, stepsGoal(user)),
    burned: health.ready && reached(health.burnedCalories, burnedGoal(user)),
    consumed: consumedToday(user),
  }
}

function addToday(stat: StreakStat, todayHit: boolean): StreakStat {
  if (!todayHit || stat.countsToday) return stat
  return { ...stat, count: stat.count + 1, countsToday: true }
}

function syncToday(stat: StreakStat, todayHit: boolean | null): StreakStat {
  if (todayHit == null || todayHit === stat.countsToday) return stat
  return {
    ...stat,
    count: Math.max(0, stat.count + (todayHit ? 1 : -1)),
    countsToday: todayHit,
  }
}

function reached(value: number, goal: number) {
  return goal > 0 && value >= goal
}

function stepsGoal(user: User) {
  return user.details?.dailyStepsGoal ?? DEFAULT_DAILY_STEPS_GOAL
}

function burnedGoal(user: User) {
  const goal = user.currGoal
  const calories = Number(goal?.dailyCalories) || 0
  if (!calories) return 0
  if (goal?.target === 'lose') return calories + 500
  if (goal?.target === 'gain') return Math.max(0, calories - 500)
  return calories
}

function consumedToday(user: User): boolean | null {
  const today = user.loggedToday
  const goal = user.currGoal
  if (!today?.date || today.date !== israelTodayKey()) return null
  if (!isCalorieTarget(goal)) return false
  if (!today.logs?.length) return false

  const value = Math.round(Number(today.calories) || 0)
  const low = Math.max(0, goal.dailyCalories - 200)
  const high = goal.dailyCalories + 200
  return value >= low && value <= high
}

function isCalorieTarget(
  goal: Goal | undefined
): goal is Goal & { target: 'lose' | 'maintain' | 'gain' } {
  return (
    !!goal &&
    goal.dailyCalories > 0 &&
    (goal.target === 'lose' ||
      goal.target === 'maintain' ||
      goal.target === 'gain')
  )
}
