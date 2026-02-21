import { indexedDbService } from '../indexeddb.service'
import type { Lang, Prefs } from '../../types/system/Prefs'

const LS_KEY = 'my-tracker-prefs'

function toLang(value: unknown): Lang {
  if (value === 'en' || value === 'he') return value

  return 'en'
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
  lang?: unknown
  isEnglish?: boolean
  favoriteColor?: string
  weightChartSettings?: Prefs['weightChartSettings']
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
      return {
        app: (entity.app as Prefs['app']) ?? defaults.app,
        lang,
        isDarkMode: !!entity.isDarkMode,
        favoriteColor: entity.favoriteColor ?? defaults.favoriteColor,
        weightChartSettings:
          entity.weightChartSettings ?? defaults.weightChartSettings,
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
      const migrated: Prefs = {
        app: (parsed.app as Prefs['app']) ?? defaults.app,
        lang,
        isDarkMode: !!parsed.isDarkMode,
        favoriteColor: parsed.favoriteColor ?? defaults.favoriteColor,
        weightChartSettings:
          parsed.weightChartSettings ?? defaults.weightChartSettings,
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
    isDarkMode: !!prefs.isDarkMode,
    favoriteColor: prefs.favoriteColor,
    weightChartSettings: prefs.weightChartSettings,
  }
  await indexedDbService.put(STORE_NAME, toSave)
}

export function getDefaultsPrefs(): Prefs {
  return {
    app: 'my-tracker',
    isDarkMode: true,
    lang: 'en',
    favoriteColor: 'primary',
    weightChartSettings: {
      movingAverageColor: 'orange',
      isMovingAverage: true,
      isDisplayWeeklyChange: true,
    },
  }
}
