import { Capacitor, registerPlugin } from '@capacitor/core'
import { DEFAULT_DAILY_STEPS_GOAL } from '../../constants/steps-goal.constants'
import { roundToNearest50 } from '../macros/macros.service'
import { getFixedNumber } from '../util.service'
import { store } from '../../store/store'
import { getAccentHex } from './steps-widget.colors'
import type { StepsWidgetPayload, StepsWidgetPlugin } from './steps-widget.types'

const StepsWidget = registerPlugin<StepsWidgetPlugin>('StepsWidget', {
  web: () => ({
    update: async () => undefined,
  }),
})

export const stepsWidgetService = {
  syncStepsWidget,
  buildPayload,
}

function sumLoggedMacro(
  logs: { macros: { protein: number; carbs: number; fat: number } }[],
  key: 'protein' | 'carbs' | 'fat'
) {
  return Math.round(
    logs.reduce((acc, log) => acc + log.macros[key], 0)
  )
}

function buildPayload(): StepsWidgetPayload {
  const state = store.getState()
  const { steps, burnedCalories, distance, flightsClimbed } = state.healthModule
  const { prefs } = state.systemModule
  const user = state.userModule.user
  const favoriteColor = prefs.favoriteColor || 'primary'
  const caloriesGoal = user?.currGoal?.dailyCalories ?? 2000
  const logs = user?.loggedToday?.logs ?? []

  return {
    steps: steps ?? 0,
    goal: user?.details?.dailyStepsGoal ?? DEFAULT_DAILY_STEPS_GOAL,
    calories: Math.round(user?.loggedToday?.calories ?? 0),
    caloriesGoal: roundToNearest50(caloriesGoal),
    distance: getFixedNumber(distance ?? 0, 2),
    burnedCalories: getFixedNumber(burnedCalories ?? 0),
    flightsClimbed: getFixedNumber(flightsClimbed ?? 0),
    proteinCurrent: sumLoggedMacro(logs, 'protein'),
    proteinGoal: Math.round(user?.currGoal?.macros.protein ?? 0),
    carbsCurrent: sumLoggedMacro(logs, 'carbs'),
    carbsGoal: Math.round(user?.currGoal?.macros.carbs ?? 0),
    fatsCurrent: sumLoggedMacro(logs, 'fat'),
    fatsGoal: Math.round(user?.currGoal?.macros.fat ?? 0),
    favoriteColor,
    accentHex: getAccentHex(favoriteColor),
    isDarkMode: prefs.isDarkMode ?? false,
    lang: prefs.lang ?? 'en',
    updatedAt: Date.now(),
  }
}

export async function syncStepsWidget() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return
  }

  if (!store.getState().userModule.user?._id) {
    return
  }

  try {
    const payload = buildPayload()
    await StepsWidget.update(payload)
  } catch (err) {
    console.warn('[StepsWidget] sync failed', err)
  }
}
