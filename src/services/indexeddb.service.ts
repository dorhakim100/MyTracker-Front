import { cache } from '../assets/config/cache'
import { makeId } from './util.service'

type WithId<T> = T & { _id?: string }

const DB_NAME = 'MyTrackerDB'

async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME)

      request.onupgradeneeded = () => {
        const db = request.result
        ensureKnownStoresOnUpgrade(db)
      }

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    } catch (error) {
      reject(error)
    }
  })
}

function ensureKnownStoresOnUpgrade(db: IDBDatabase) {
  const knownStores = Object.values(cache)
  for (const storeName of knownStores) {
    if (!db.objectStoreNames.contains(storeName)) {
      db.createObjectStore(storeName, { keyPath: '_id' })
    }
  }
}

async function openDBWithStore(storeName: string): Promise<IDBDatabase> {
  const db = await openDB()
  if (db.objectStoreNames.contains(storeName)) return db

  db.close()
  const newVersion = db.version + 1

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, newVersion)

    request.onupgradeneeded = () => {
      const upgradeDb = request.result
      if (!upgradeDb.objectStoreNames.contains(storeName)) {
        upgradeDb.createObjectStore(storeName, { keyPath: '_id' })
      }
      // Also ensure other known stores if missing
      ensureKnownStoresOnUpgrade(upgradeDb)
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function txStore(
  db: IDBDatabase,
  storeName: string,
  mode: IDBTransactionMode
): IDBObjectStore {
  const tx = db.transaction(storeName, mode)
  return tx.objectStore(storeName)
}

async function query<T = unknown>(
  storeName: string,
  _pageIdx?: number
): Promise<T[]> {
  const db = await openDBWithStore(storeName)
  try {
    void _pageIdx
    const store = txStore(db, storeName, 'readonly')

    return new Promise<T[]>((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result as unknown[] as T[])
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function get<T = unknown>(storeName: string, id: string): Promise<T> {
  const db = await openDBWithStore(storeName)
  try {
    const store = txStore(db, storeName, 'readonly')

    return new Promise<T>((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result as unknown as T)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function post<T = unknown>(
  storeName: string,
  entity: WithId<T>
): Promise<WithId<T>> {
  const db = await openDBWithStore(storeName)
  try {
    const toSave = { ...entity }
    if (!toSave._id) toSave._id = makeId()

    const store = txStore(db, storeName, 'readwrite')

    return new Promise<WithId<T>>((resolve, reject) => {
      const request = store.add(toSave)
      request.onsuccess = () => resolve(toSave)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function put<T = unknown>(
  storeName: string,
  entity: WithId<T>
): Promise<WithId<T>> {
  const db = await openDBWithStore(storeName)
  try {
    if (!entity._id) throw new Error('Cannot update entity without _id')
    const store = txStore(db, storeName, 'readwrite')

    return new Promise<WithId<T>>((resolve, reject) => {
      const request = store.put(entity)
      request.onsuccess = () => resolve(entity)
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function remove(storeName: string, id: string): Promise<void> {
  const db = await openDBWithStore(storeName)
  try {
    const store = txStore(db, storeName, 'readwrite')

    return new Promise<void>((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

async function clear(storeName: string): Promise<void> {
  const db = await openDBWithStore(storeName)
  try {
    const store = txStore(db, storeName, 'readwrite')
    return new Promise<void>((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  } finally {
    db.close()
  }
}

export const indexedDbService = {
  query,
  get,
  post,
  put,
  remove,
  clear,
}

// Optional alias for compatibility with different terminology
export const deleteEntity = remove
