const ACTIVITY_TIMEZONE = 'Asia/Jerusalem'

export function israelTodayKey(now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ACTIVITY_TIMEZONE,
  }).format(now)
}

export function addIsraelDays(key: string, amount: number) {
  const [year, month, day] = key.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day + amount))
  const nextYear = date.getUTCFullYear()
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, '0')
  const nextDay = String(date.getUTCDate()).padStart(2, '0')
  return `${nextYear}-${nextMonth}-${nextDay}`
}

export function israelDaysFrom(start: string, end: string) {
  const days: string[] = []
  let cursor = start
  while (cursor <= end) {
    days.push(cursor)
    cursor = addIsraelDays(cursor, 1)
    if (days.length > 4000) break
  }
  return days
}

export function israelKeyFromDate(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: ACTIVITY_TIMEZONE,
  }).format(date)
}

export function israelDayStartIso(key: string) {
  const [year, month, day] = key.split('-').map(Number)
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: ACTIVITY_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })

  let utc = Date.UTC(year, month - 1, day) - 3 * 60 * 60 * 1000
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const parts = Object.fromEntries(
      formatter
        .formatToParts(new Date(utc))
        .map((part) => [part.type, part.value])
    )
    const got = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute)
    )
    const want = Date.UTC(year, month - 1, day)
    if (got === want) return new Date(utc).toISOString()
    utc += want - got
  }

  return new Date(utc).toISOString()
}
