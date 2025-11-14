import type { ChartSettings } from '../chartSettings/ChartSettings'
import type { App } from '../app/App'

export interface Prefs {
  app: App
  isEnglish: boolean
  isDarkMode: boolean
  favoriteColor: string
  weightChartSettings: ChartSettings
}
