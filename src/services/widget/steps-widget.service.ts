import { Capacitor, registerPlugin } from '@capacitor/core'
import { DEFAULT_DAILY_STEPS_GOAL } from '../../constants/steps-goal.constants'
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

function buildPayload(): StepsWidgetPayload {
  const state = store.getState()
  const { steps } = state.healthModule
  const { prefs } = state.systemModule
  const user = state.userModule.user
  const favoriteColor = prefs.favoriteColor || 'primary'

  return {
    steps: steps ?? 0,
    goal: user?.details?.dailyStepsGoal ?? DEFAULT_DAILY_STEPS_GOAL,
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
