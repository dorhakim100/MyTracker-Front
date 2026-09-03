import { indexedDbService } from '../indexeddb.service'
import { cache } from '../../assets/config/cache'

const MAX_RECENT = 8
const STORE = cache.RECENT_SEARCHES

interface RecentSearchesRecord {
  _id: string
  queries: string[]
}

function normalizeQuery(query: string) {
  return query.trim().replace(/\s+/g, ' ')
}

export const recentSearchService = {
  async get(userId: string): Promise<string[]> {
    if (!userId) return []
    try {
      const record = await indexedDbService.get<RecentSearchesRecord>(
        STORE,
        userId
      )
      return record?.queries || []
    } catch {
      return []
    }
  },

  async add(userId: string, query: string): Promise<string[]> {
    const trimmed = normalizeQuery(query)
    if (!userId || !trimmed) return this.get(userId)

    const current = await this.get(userId)
    const next = [
      trimmed,
      ...current.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase()
      ),
    ].slice(0, MAX_RECENT)

    await indexedDbService.put(STORE, { _id: userId, queries: next })
    return next
  },

  async remove(userId: string, query: string): Promise<string[]> {
    const current = await this.get(userId)
    const next = current.filter(
      (item) => item.toLowerCase() !== query.toLowerCase()
    )
    await indexedDbService.put(STORE, { _id: userId, queries: next })
    return next
  },

  async clear(userId: string): Promise<string[]> {
    if (!userId) return []
    await indexedDbService.put(STORE, { _id: userId, queries: [] })
    return []
  },
}
