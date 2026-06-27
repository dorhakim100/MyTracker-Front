import type { Lang } from '../../types/system/Prefs'

export type StepsWidgetPayload = {
  steps: number
  goal: number
  favoriteColor: string
  accentHex: string
  isDarkMode: boolean
  lang: Lang
  updatedAt: number
}

export interface StepsWidgetPlugin {
  update(options: StepsWidgetPayload): Promise<void>
}
