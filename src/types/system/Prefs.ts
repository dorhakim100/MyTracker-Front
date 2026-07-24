import type { ChartSettings } from '../chartSettings/ChartSettings'
import type { App } from '../app/App'

export type Lang = 'en' | 'he'

export type HealthProvider = 'native' | 'google'

export type AppFont = 'font-rubik' | 'font-heebo' | 'font-assistant'

export const APP_FONTS: AppFont[] = [
  'font-rubik',
  'font-heebo',
  'font-assistant',
]

export interface Prefs {
  app: App
  lang: Lang
  isDarkMode: boolean
  favoriteColor: string
  font: AppFont
  weightChartSettings: ChartSettings
  healthProvider: HealthProvider
}
