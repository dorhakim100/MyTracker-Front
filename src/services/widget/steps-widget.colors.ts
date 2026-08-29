import { colors } from '../../assets/config/colors'

export function getAccentHex(favoriteColor: string) {
  if (favoriteColor in colors) {
    return colors[favoriteColor as keyof typeof colors]
  }
  return colors.primary
}
