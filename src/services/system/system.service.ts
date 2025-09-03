const KEY = 'my-tracker-prefs'

export const systemService = {
  getPrefs,
  setPrefs,
}

export function getPrefs() {
  const entityType = KEY
  let prefs
  if (!localStorage.getItem(entityType)) {
    prefs = { isDarkMode: false }
    localStorage.setItem(entityType, JSON.stringify(prefs))
  } else {
    const strStorage = localStorage.getItem(entityType)
    if (!strStorage) return { isDarkMode: false }
    prefs = JSON.parse(strStorage)
  }

  return prefs
}

export function setPrefs(prefs: { isDarkMode: boolean; user?: string | null }) {
  const entityType = KEY
  localStorage.setItem(entityType, JSON.stringify(prefs))
}
