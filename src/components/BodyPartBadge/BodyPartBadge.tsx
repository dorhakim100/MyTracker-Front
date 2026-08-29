import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BODY_PARTS,
  getBodyPartsFromMuscles,
  getExerciseBodyParts,
  type BodyPartId,
} from '../../assets/config/body-parts'
import { bodyPartBadgeNs } from './locals'

export type BodyPartBadgeSize = 's' | 'm' | 'l'

interface BodyPartBadgeProps {
  bodyPart: BodyPartId
  size?: BodyPartBadgeSize
  className?: string
}

interface BodyPartBadgesProps {
  bodyParts?: BodyPartId[]
  muscles?: string[]
  exercise?: {
    mainMuscles?: string[]
    secondaryMuscles?: string[]
  } | null
  size?: BodyPartBadgeSize
  className?: string
}

export function BodyPartBadge({
  bodyPart,
  size = 's',
  className = '',
}: BodyPartBadgeProps) {
  const { t } = useTranslation(bodyPartBadgeNs)
  const def = BODY_PARTS[bodyPart]
  if (!def) return null

  const style: CSSProperties & Record<string, string> = {
    '--body-part-color-light': def.color.light,
    '--body-part-color-dark': def.color.dark,
  }

  return (
    <span
      className={`body-part-badge-container size-${size} ${className}`.trim()}
      style={style}
    >
      {t(bodyPart)}
    </span>
  )
}

export function BodyPartBadges({
  bodyParts,
  muscles,
  exercise,
  size = 's',
  className = '',
}: BodyPartBadgesProps) {
  const ids =
    bodyParts ??
    (exercise
      ? getExerciseBodyParts(exercise)
      : getBodyPartsFromMuscles(muscles))
  if (!ids.length) return null

  return (
    <span
      className={`body-part-badges-container size-${size} ${className}`.trim()}
    >
      {ids.map((id) => (
        <BodyPartBadge
          key={id}
          bodyPart={id}
          size={size}
        />
      ))}
    </span>
  )
}
