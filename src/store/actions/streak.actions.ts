import { isTodayHealthReady } from '../../services/health/today-health'
import { applyTodayStreaks, todayStreakHits } from '../../services/streak/streak.service'
import { SET_USER } from '../reducers/user.reducer'
import { store } from '../store'
import type { User } from '../../types/user/User'

export function withTodayStreaks(user: User) {
  const health = store.getState().healthModule
  return applyTodayStreaks(
    user,
    todayStreakHits(user, {
      ready: isTodayHealthReady(),
      steps: health.steps,
      burnedCalories: health.burnedCalories,
    })
  )
}

export function syncUserStreaks() {
  const user = store.getState().userModule.user
  if (!user) return

  const next = withTodayStreaks(user)
  if (next === user) return

  store.dispatch({
    type: SET_USER,
    user: next,
  })
}
