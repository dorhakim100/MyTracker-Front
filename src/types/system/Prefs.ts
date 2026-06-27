import type { ChartSettings } from '../chartSettings/ChartSettings'
import type { App } from '../app/App'

export type Lang = 'en' | 'he'

export type HealthProvider = 'native' | 'google'

export interface Prefs {
  app: App
  lang: Lang
  isDarkMode: boolean
  favoriteColor: string
  weightChartSettings: ChartSettings
  healthProvider: HealthProvider
}
