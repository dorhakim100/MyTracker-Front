import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BODY_PARTS,
  getBodyPartsFromMuscles,
  type BodyPartId,
} from '../../assets/config/body-parts'
import { bodyPartBadgeNs } from './locals'

interface BodyPartBadgeProps {
  bodyPart: BodyPartId
  className?: string
}

interface BodyPartBadgesProps {
  bodyParts?: BodyPartId[]
  muscles?: string[]
  className?: string
}

export function BodyPartBadge({
  bodyPart,
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
      className={`body-part-badge-container ${className}`.trim()}
      style={style}
    >
      {t(bodyPart)}
    </span>
  )
}

export function BodyPartBadges({
  bodyParts,
  muscles,
  className = '',
}: BodyPartBadgesProps) {
  const ids = bodyParts ?? getBodyPartsFromMuscles(muscles)
  if (!ids.length) return null

  return (
    <span className={`body-part-badges-container ${className}`.trim()}>
      {ids.map((id) => (
        <BodyPartBadge
          key={id}
          bodyPart={id}
        />
      ))}
    </span>
  )
}
