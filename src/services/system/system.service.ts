import { indexedDbService } from '../indexeddb.service'
import type { Prefs } from '../../types/system/Prefs'

const LS_KEY = 'my-tracker-prefs'
const STORE_NAME = 'prefs'
const RECORD_ID = 'prefs'

export const systemService = {
  getPrefs,
  setPrefs,
}

export async function getPrefs(): Promise<Prefs> {
  try {
    const entity = await indexedDbService.get<Prefs & { _id?: string }>(
      STORE_NAME,
      RECORD_ID
    )
    if (
      entity &&
      (entity.isDarkMode !== undefined || entity.isEnglish !== undefined)
    ) {
      return {
        isDarkMode: !!entity.isDarkMode,
        isEnglish: entity.isEnglish ?? false,
        favoriteColor: entity.favoriteColor,
        weightChartSettings: entity.weightChartSettings,
      }
    }
  } catch {
    // ignore and try migration or defaults
  }

  try {
    const str = localStorage.getItem(LS_KEY)
    if (str) {
      const parsed = JSON.parse(str)
      const migrated: Prefs = {
        isDarkMode: !!parsed.isDarkMode,
        isEnglish: parsed.isEnglish ?? false,
        favoriteColor: parsed.favoriteColor,
        weightChartSettings: parsed.weightChartSettings,
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
    isDarkMode: !!prefs.isDarkMode,
    isEnglish: !!prefs.isEnglish,
    favoriteColor: prefs.favoriteColor,
    weightChartSettings: prefs.weightChartSettings,
  }
  await indexedDbService.put(STORE_NAME, toSave)
}

export function getDefaultsPrefs(): Prefs {
  return {
    isDarkMode: false,
    isEnglish: false,
    favoriteColor: 'primary',
    weightChartSettings: {
      movingAverageColor: 'orange',
    },
  }
}
