import { cache } from '../../assets/config/cache'
import { indexedDbService } from '../indexeddb.service'

export type ItemMacrosView = 'per100g' | 'dayProgress'

interface ItemDetailsPrefsRecord {
  _id: string
  macrosView: ItemMacrosView
}

const STORE = cache.ITEM_DETAILS_PREFS
const RECORD_ID = 'macrosView'

function isMacrosView(value: unknown): value is ItemMacrosView {
  return value === 'per100g' || value === 'dayProgress'
}

export const itemDetailsPrefsService = {
  async getMacrosView(): Promise<ItemMacrosView> {
    try {
      const record = await indexedDbService.get<ItemDetailsPrefsRecord>(
        STORE,
        RECORD_ID
      )
      if (record && isMacrosView(record.macrosView)) return record.macrosView
      return 'dayProgress'
    } catch {
      return 'dayProgress'
    }
  },

  async setMacrosView(macrosView: ItemMacrosView) {
    await indexedDbService.put(STORE, {
      _id: RECORD_ID,
      macrosView,
    })
  },
}
