import { Capacitor, registerPlugin } from '@capacitor/core'
import { DEFAULT_DAILY_STEPS_GOAL } from '../../constants/steps-goal.constants'
import { roundToNearest50 } from '../macros/macros.service'
import { getFixedNumber } from '../util.service'
import { getApiBaseUrl, getLoginToken } from '../http.service'
import { store } from '../../store/store'
import { getAccentHex } from './steps-widget.colors'
import type {
  StepsWidgetHealthOverrides,
  StepsWidgetPayload,
  StepsWidgetPlugin,
} from './steps-widget.types'

const StepsWidget = registerPlugin<StepsWidgetPlugin>('StepsWidget', {
  web: () => ({
    update: async () => undefined,
    clearAuth: async () => undefined,
    reloadTimelines: async () => undefined,
  }),
})

export const stepsWidgetService = {
  syncStepsWidget,
  clearStepsWidgetAuth,
  reloadStepsWidgetTimelines,
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

function buildPayload(
  healthOverrides?: StepsWidgetHealthOverrides
): StepsWidgetPayload {
  const state = store.getState()
  const { steps, burnedCalories, distance, flightsClimbed } = state.healthModule
  const { prefs } = state.systemModule
  const user = state.userModule.user
  const favoriteColor = prefs.favoriteColor || 'primary'
  const caloriesGoal = user?.currGoal?.dailyCalories ?? 2000
  const logs = user?.loggedToday?.logs ?? []

  return {
    steps: healthOverrides?.steps ?? steps ?? 0,
    goal: user?.details?.dailyStepsGoal ?? DEFAULT_DAILY_STEPS_GOAL,
    calories: Math.round(user?.loggedToday?.calories ?? 0),
    caloriesGoal: roundToNearest50(caloriesGoal),
    distance: getFixedNumber(healthOverrides?.distance ?? distance ?? 0, 2),
    burnedCalories: getFixedNumber(
      healthOverrides?.burnedCalories ?? burnedCalories ?? 0
    ),
    flightsClimbed: getFixedNumber(
      healthOverrides?.flightsClimbed ?? flightsClimbed ?? 0
    ),
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

export async function syncStepsWidget(
  healthOverrides?: StepsWidgetHealthOverrides
) {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return
  }

  const userId = store.getState().userModule.user?._id
  if (!userId) {
    return
  }

  try {
    const payload = buildPayload(healthOverrides)
    const authToken = await getLoginToken()
    const apiBaseUrl = getApiBaseUrl()

    await StepsWidget.update({
      ...payload,
      userId,
      authToken: authToken ?? undefined,
      apiBaseUrl,
    })
  } catch (err) {
    console.warn('[StepsWidget] sync failed', err)
  }
}

export async function clearStepsWidgetAuth() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return
  }

  try {
    await StepsWidget.clearAuth()
  } catch (err) {
    console.warn('[StepsWidget] clear auth failed', err)
  }
}

export async function reloadStepsWidgetTimelines() {
  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'ios') {
    return
  }

  try {
    await StepsWidget.reloadTimelines()
  } catch (err) {
    console.warn('[StepsWidget] reload timelines failed', err)
  }
}

export function toStepsWidgetHealthOverrides(payload: {
  steps: number
  activeCaloriesKcal: number
  distance: number
  flightsClimbed: number
}): StepsWidgetHealthOverrides {
  return {
    steps: payload.steps,
    burnedCalories: payload.activeCaloriesKcal,
    distance: payload.distance,
    flightsClimbed: payload.flightsClimbed,
  }
}
