const FAVORITE_COLOR_HEX: Record<string, string> = {
  primary: '#009688',
  blue: '#1976d2',
  yellow: '#ffd166',
  red: '#d32f2f',
  orange: '#ed6c02',
  green: '#06d6a0',
  deepPurple: '#6366f1',
  purple: '#9333ea',
  pink: '#ec4899',
}

export function getAccentHex(favoriteColor: string) {
  return FAVORITE_COLOR_HEX[favoriteColor] ?? FAVORITE_COLOR_HEX.primary
}
