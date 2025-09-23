import { Route } from '../assets/routes/routes'
import { User } from '../types/user/User'

export function makeId(length: number = 6): string {
  var txt = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    txt += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return txt
}

export function makeLorem(size: number = 100): string {
  var words = [
    'The sky',
    'above',
    'the port',
    'was',
    'the color of television',
    'tuned',
    'to',
    'a dead channel',
    '.',
    'All',
    'this happened',
    'more or less',
    '.',
    'I',
    'had',
    'the story',
    'bit by bit',
    'from various people',
    'and',
    'as generally',
    'happens',
    'in such cases',
    'each time',
    'it',
    'was',
    'a different story',
    '.',
    'It',
    'was',
    'a pleasure',
    'to',
    'burn',
  ]
  var txt = ''
  while (size > 0) {
    size--
    txt += words[Math.floor(Math.random() * words.length)] + ' '
  }
  return txt
}

export function getRandomIntInclusive(min: number, max: number): number {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive
}

export function randomPastTime() {
  const HOUR = 1000 * 60 * 60
  // const DAY = 1000 * 60 * 60 * 24
  const WEEK = 1000 * 60 * 60 * 24 * 7

  const pastTime = getRandomIntInclusive(HOUR, WEEK)
  return Date.now() - pastTime
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  timeout: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this
    clearTimeout(timer)
    timer = setTimeout(() => {
      func.apply(context, args)
    }, timeout)
  }
}

// export function saveToStorage(key, value) {
//   localStorage.setGame(key, JSON.stringify(value))
// }

// export function loadFromStorage(key) {
//   const data = localStorage.getGame(key)
//   return data ? JSON.parse(data) : undefined
// }

// export function onPageNavigation(diff, filter, setFilter, maxPage) {
//   if (filter.pageIdx + diff === -1) return

//   if (filter.pageIdx + diff === maxPage) {
//     setFilter({ ...filter, pageIdx: 0 })

//     return
//   }

//   setFilter({ ...filter, pageIdx: filter.pageIdx + diff })
// }

export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function translateDayToHebrew(day: string): string {
  interface DaysInHebrew {
    [key: string]: string
  }

  const daysInHebrew: DaysInHebrew = {
    sunday: 'ראשון',
    monday: 'שני',
    tuesday: 'שלישי',
    wednesday: 'רביעי',
    thursday: 'חמישי',
    friday: 'שישי',
    saturday: 'שבת',
  }

  // Convert input to lowercase to ensure case insensitivity
  return daysInHebrew[day.toLowerCase()] || 'Invalid day'
}

export function convertToDate(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number) // Split and convert to numbers
  const now = new Date() // Get the current date
  now.setHours(hours, minutes, 0, 0) // Set hours, minutes, and reset seconds and milliseconds
  return now
}

export function getTodayDayName(): string {
  const today = new Date()
  const dayNames = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ]
  return dayNames[today.getDay()]
}

export function smoothScroll(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

export function getRoutes(routes: Route[], user: User | null) {
  let filteredRoutes = routes
  if (user) {
    filteredRoutes = filteredRoutes.filter((route) => route.path !== '/signin')
  } else {
    filteredRoutes = filteredRoutes.filter((route) => route.path !== '/user')
  }

  return filteredRoutes
}

export function getArrayOfNumbers(
  min: number,
  max: number,
  isString: boolean = false
): number[] | string[] {
  const array = Array.from({ length: max - min + 1 }, (_, i) => min + i)
  return isString ? array.map((num) => num + '') : array
}

export function getCurrMeal(): string {
  const now = new Date()
  const hour = now.getHours()
  if (hour >= 6 && hour < 12) {
    return 'Breakfast'
  } else if (hour >= 12 && hour < 18) {
    return 'Lunch'
  } else {
    return 'Dinner'
  }
}

export function getDateFromISO(isoString: string) {
  const date = new Date(isoString)
  return date.toISOString().split('T')[0]
}

export function getNewDNDArray(
  originalArray: (string | null)[],
  newIndex: number,
  itemId: string,
  originalIndex: number
) {
  const newArray: string[] = []

  // const originalArray: (string | null)[] = user?.favoriteItems || []

  newArray[newIndex] = itemId
  originalArray.splice(originalIndex, 1, null)

  originalArray.forEach((id, index) => {
    if (!id) return

    if (index < newIndex) {
      newArray[index] = id
    }

    if (index >= newIndex) {
      newArray[index + 1] = id
    }
  })

  const filteredArray = newArray.filter((id) => typeof id === 'string')

  return filteredArray
}
