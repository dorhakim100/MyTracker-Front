function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildWordRegex(word: string) {
  const normalized = word.toLowerCase().replace(/[\s-]+/g, '')
  if (!normalized) return null

  const pattern = normalized
    .split('')
    .map(escapeRegex)
    .join('[\\s-]*')

  return new RegExp(pattern, 'i')
}

function getSearchTokens(search: string) {
  return search
    .trim()
    .toLowerCase()
    .split(/[\s-]+/)
    .filter(Boolean)
}

const HEBREW_CLITICS = 'והבלמכש'

function normalizeFoodQuery(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0591-\u05C7]/g, '')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[״׳'"]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function expandFoodToken(token: string) {
  const forms = new Set<string>([token])
  const queue = [{ word: token, prefixed: false }]
  while (queue.length) {
    const current = queue.pop() as { word: string; prefixed: boolean }
    if (current.word.length < 4 || !/[\u0590-\u05FF]/.test(current.word)) continue
    const prefix = current.word[0]
    if (!HEBREW_CLITICS.includes(prefix)) continue
    const rest = current.word.slice(1)
    if (rest.length < 3) continue
    const stripsArticle = prefix === 'ה' || rest.startsWith('ה')
    const stripsOnePrefix =
      !current.prefixed && current.word.length >= 7 && rest.length >= 5
    if (!stripsArticle && !stripsOnePrefix) continue
    if (forms.has(rest)) continue
    forms.add(rest)
    if (stripsArticle) queue.push({ word: rest, prefixed: true })
  }

  for (const form of [...forms]) {
    if (form.length < 4 || !/[\u0590-\u05FF]/.test(form)) continue
    if (form.endsWith('ות')) forms.add(`${form.slice(0, -2)}ה`)
    else if (form.endsWith('ים')) forms.add(form.slice(0, -2))
    else if (form.endsWith('ה')) forms.add(`${form.slice(0, -1)}ות`)
  }

  if (/[a-z]/.test(token)) {
    if (token.endsWith('ies') && token.length > 4) forms.add(`${token.slice(0, -3)}y`)
    if (token.endsWith('es') && token.length > 4) forms.add(token.slice(0, -2))
    if (token.endsWith('s') && token.length > 3) forms.add(token.slice(0, -1))
    if (token.endsWith('y') && token.length > 3) forms.add(`${token.slice(0, -1)}ies`)
    if (!token.endsWith('s')) forms.add(`${token}s`)
  }

  return [...forms]
}

export function foodQueryForms(query: string) {
  const normalized = normalizeFoodQuery(query)
  if (!normalized) return []
  const words = normalized.split(' ').filter(Boolean)
  const phrases = new Set<string>([normalized])
  words.forEach((word, index) => {
    for (const form of expandFoodToken(word)) {
      if (form === word) continue
      const next = words.slice()
      next[index] = form
      phrases.add(next.join(' '))
    }
  })
  return [...phrases]
}

export function matchesFoodQuery(haystack: string, query: string) {
  const forms = foodQueryForms(query)
  if (!forms.length) return true
  const text = normalizeFoodQuery(haystack)
  return forms.some((form) => form && text.includes(form))
}

export function foodTextMatchScore(query: string, value: string) {
  const queryForms = foodQueryForms(query)
  const valueForms = foodQueryForms(value)
  let best = 0
  for (const q of queryForms) {
    for (const n of valueForms) {
      if (!q || !n) continue
      if (q === n) best = Math.max(best, 100)
      else if (n.startsWith(q)) best = Math.max(best, 60)
      else if (n.includes(q)) best = Math.max(best, 40)
    }
  }
  return best
}

export function matchesExerciseSearch(exerciseName: string, search: string) {
  const tokens = getSearchTokens(search)
  if (tokens.length === 0) return true

  return tokens.every((token) => {
    const regex = buildWordRegex(token)
    return regex ? regex.test(exerciseName) : true
  })
}
