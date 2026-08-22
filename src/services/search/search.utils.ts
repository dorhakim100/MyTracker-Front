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

export function matchesExerciseSearch(exerciseName: string, search: string) {
  const tokens = getSearchTokens(search)
  if (tokens.length === 0) return true

  return tokens.every((token) => {
    const regex = buildWordRegex(token)
    return regex ? regex.test(exerciseName) : true
  })
}
