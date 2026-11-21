import type { CSSProperties } from 'react'
import { useTranslation } from 'react-i18next'
import {
  EQUIPMENT_GROUPS,
  equipmentGroupIds,
  EquipmentGroupId,
} from '../../assets/config/equipments'
import './styles/EquipmentBadges.scss'

interface EquipmentBadgesProps {
  equipments?: string[]
  size?: 's' | 'm' | 'l'
  className?: string
}

export function EquipmentBadges({
  equipments = [],
  size = 'm',
  className = '',
}: EquipmentBadgesProps) {
  const { t } = useTranslation()
  const ids = equipmentGroupIds(equipments)
  if (!ids.length) return null

  return (
    <span className={`equipment-badges-container size-${size} ${className}`}>
      {ids.map((id) => (
        <EquipmentBadge
          key={id}
          id={id}
          label={t(`equipment.${id}`)}
          size={size}
        />
      ))}
    </span>
  )
}

function EquipmentBadge({
  id,
  label,
  size,
}: {
  id: EquipmentGroupId
  label: string
  size: 's' | 'm' | 'l'
}) {
  const group = EQUIPMENT_GROUPS.find((item) => item.id === id)
  if (!group) return null
  const style: CSSProperties & Record<string, string> = {
    '--equipment-color-light': group.color.light,
    '--equipment-color-dark': group.color.dark,
  }
  return (
    <span
      className={`equipment-badge-container size-${size}`}
      style={style}
    >
      {label}
    </span>
  )
}
