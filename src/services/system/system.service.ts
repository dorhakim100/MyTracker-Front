import { indexedDbService } from '../indexeddb.service'
import type { AppFont, ColorMode, Lang, Prefs } from '../../types/system/Prefs'
import { APP_FONTS } from '../../types/system/Prefs'

const LS_KEY = 'my-tracker-prefs'

function toLang(value: unknown): Lang {
  if (value === 'en' || value === 'he') return value

  return 'en'
}

function toColorMode(value: unknown, isDarkMode: boolean): ColorMode {
  if (value === 'light' || value === 'dark' || value === 'system') return value
  return isDarkMode ? 'dark' : 'light'
}

function resolveIsDarkMode(colorMode: ColorMode, storedDark: boolean) {
  if (
    colorMode === 'system' &&
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function'
  ) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  if (colorMode === 'light') return false
  if (colorMode === 'dark') return true
  return storedDark
}

function toAppFont(value: unknown): AppFont {
  if (typeof value === 'string' && APP_FONTS.includes(value as AppFont)) {
    return value as AppFont
  }

  return 'font-rubik'
}

const STORE_NAME = 'prefs'
const RECORD_ID = 'prefs'

export const systemService = {
  getPrefs,
  setPrefs,
}

type StoredPrefs = {
  _id?: string
  app?: string
  isDarkMode?: boolean
  colorMode?: unknown
  usePhoneHealth?: boolean
  lang?: unknown
  isEnglish?: boolean
  favoriteColor?: string
  font?: unknown
  weightChartSettings?: Prefs['weightChartSettings']
  healthProvider?: Prefs['healthProvider']
  showDayProgress?: boolean
}

export async function getPrefs(): Promise<Prefs> {
  try {
    const entity = await indexedDbService.get<StoredPrefs>(
      STORE_NAME,
      RECORD_ID
    )
    if (
      entity &&
      (entity.isDarkMode !== undefined ||
        entity.lang !== undefined ||
        entity.isEnglish !== undefined ||
        entity.app !== undefined)
    ) {
      const lang =
        entity.lang !== undefined
          ? toLang(entity.lang)
          : toLang(entity.isEnglish)
      const defaults = getDefaultsPrefs()
      const colorMode = toColorMode(entity.colorMode, !!entity.isDarkMode)
      return {
        app: (entity.app as Prefs['app']) ?? defaults.app,
        lang,
        colorMode,
        isDarkMode: resolveIsDarkMode(colorMode, !!entity.isDarkMode),
        usePhoneHealth: entity.usePhoneHealth !== false,
        favoriteColor: entity.favoriteColor ?? defaults.favoriteColor,
        font: toAppFont(entity.font ?? defaults.font),
        weightChartSettings:
          entity.weightChartSettings ?? defaults.weightChartSettings,
        healthProvider: entity.healthProvider ?? defaults.healthProvider,
        showDayProgress:
          entity.showDayProgress ?? defaults.showDayProgress,
      }
    }
  } catch {
    // ignore and try migration or defaults
  }

  try {
    const str = localStorage.getItem(LS_KEY)
    if (str) {
      const parsed: StoredPrefs = JSON.parse(str)
      const lang =
        parsed.lang !== undefined
          ? toLang(parsed.lang)
          : toLang(parsed.isEnglish)
      const defaults = getDefaultsPrefs()
      const colorMode = toColorMode(parsed.colorMode, !!parsed.isDarkMode)
      const migrated: Prefs = {
        app: (parsed.app as Prefs['app']) ?? defaults.app,
        lang,
        colorMode,
        isDarkMode: resolveIsDarkMode(colorMode, !!parsed.isDarkMode),
        usePhoneHealth: parsed.usePhoneHealth !== false,
        favoriteColor: parsed.favoriteColor ?? defaults.favoriteColor,
        font: toAppFont(parsed.font ?? defaults.font),
        weightChartSettings:
          parsed.weightChartSettings ?? defaults.weightChartSettings,
        healthProvider: parsed.healthProvider ?? defaults.healthProvider,
        showDayProgress:
          parsed.showDayProgress ?? defaults.showDayProgress,
      }
      await indexedDbService.put(STORE_NAME, { _id: RECORD_ID, ...migrated })
      localStorage.removeItem(LS_KEY)
      return migrated
    }
  } catch {
    // ignore
  }

  try {
    await indexedDbService.put(STORE_NAME, {
      _id: RECORD_ID,
      ...getDefaultsPrefs(),
    })
  } catch {
    // ignore
  }
  return getDefaultsPrefs()
}

export async function setPrefs(prefs: Prefs): Promise<void> {
  const toSave: Prefs & { _id: string } = {
    _id: RECORD_ID,
    app: prefs.app,
    lang: prefs.lang,
    colorMode: toColorMode(prefs.colorMode, !!prefs.isDarkMode),
    isDarkMode: !!prefs.isDarkMode,
    usePhoneHealth: prefs.usePhoneHealth !== false,
    favoriteColor: prefs.favoriteColor,
    font: toAppFont(prefs.font),
    weightChartSettings: prefs.weightChartSettings,
    healthProvider: prefs.healthProvider,
    showDayProgress: !!prefs.showDayProgress,
  }
  await indexedDbService.put(STORE_NAME, toSave)
}

export function getDefaultsPrefs(): Prefs {
  return {
    app: 'my-tracker',
    isDarkMode: true,
    colorMode: 'dark',
    usePhoneHealth: true,
    lang: 'en',
    favoriteColor: 'primary',
    font: 'font-rubik',
    weightChartSettings: {
      movingAverageColor: 'orange',
      isMovingAverage: true,
      isDisplayWeeklyChange: true,
    },
    healthProvider: 'native',
    showDayProgress: false,
  }
}
