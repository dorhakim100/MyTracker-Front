import { cache } from '../../assets/config/cache'
import { indexedDbService } from '../../services/indexeddb.service'

const memory = new Map<string, string>()
const listeners = new Set<() => void>()

export function tabFocusKey(options: { value: string }[]) {
  return options.map((option) => option.value).join('\n')
}

export function rememberedTab(id: string) {
  return memory.get(id) || ''
}

export function tabToOpen(options: { value: string }[]) {
  const saved = rememberedTab(tabFocusKey(options))
  if (options.some((option) => option.value === saved)) return saved
  return options[0]?.value || ''
}

export function rememberTab(id: string, value: string) {
  if (!id || !value || memory.get(id) === value) return
  memory.set(id, value)
  indexedDbService.put(cache.TAB_FOCUS, { _id: id, value }).catch(() => {})
}

export function subscribeTabFocus(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

async function hydrateTabFocus() {
  try {
    const rows = await indexedDbService.query<{ _id: string; value: string }>(
      cache.TAB_FOCUS
    )
    let changed = false
    rows.forEach((row) => {
      if (!row?._id || !row.value || memory.has(row._id)) return
      memory.set(row._id, row.value)
      changed = true
    })
    if (changed) listeners.forEach((listener) => listener())
  } catch {
    return
  }
}

hydrateTabFocus().catch(() => {})
