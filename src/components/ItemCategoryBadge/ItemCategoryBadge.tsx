import type { CSSProperties, MouseEvent } from 'react'
import { useTranslation } from 'react-i18next'

import {
  ITEM_CATEGORY_COLORS,
  ITEM_CATEGORY_IDS,
  isItemCategoryId,
  type ItemCategoryId,
} from '../../assets/config/item-categories'
import { itemCategoryBadgeNs } from './locals'

export type ItemCategoryBadgeSize = 's' | 'm' | 'l'

interface ItemCategoryBadgeProps {
  category: ItemCategoryId
  size?: ItemCategoryBadgeSize
  className?: string
  selected?: boolean
  onClick?: () => void
}

interface ItemCategoryBadgesProps {
  categories?: string[]
  size?: ItemCategoryBadgeSize
  className?: string
  editable?: boolean
  onChange?: (categories: ItemCategoryId[]) => void
}

export function ItemCategoryBadge({
  category,
  size = 's',
  className = '',
  selected = true,
  onClick,
}: ItemCategoryBadgeProps) {
  const { t } = useTranslation(itemCategoryBadgeNs)
  const colors = ITEM_CATEGORY_COLORS[category]
  if (!colors) return null

  const style: CSSProperties & Record<string, string> = {
    '--item-category-color-light': colors.light,
    '--item-category-color-dark': colors.dark,
  }

  const classNames = `item-category-badge-container size-${size} ${
    selected ? 'selected' : 'unselected'
  } ${onClick ? 'clickable' : ''} ${className}`.trim()

  const onBadgeClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation()
    onClick?.()
  }

  if (onClick) {
    return (
      <button
        type='button'
        className={classNames}
        style={style}
        onClick={onBadgeClick}
      >
        {t(category)}
      </button>
    )
  }

  return (
    <span
      className={classNames}
      style={style}
    >
      {t(category)}
    </span>
  )
}

export function ItemCategoryBadges({
  categories,
  size = 's',
  className = '',
  editable = false,
  onChange,
}: ItemCategoryBadgesProps) {
  const selected = (categories || []).filter(isItemCategoryId)

  if (!editable && !selected.length) return null

  const ids = editable ? [...ITEM_CATEGORY_IDS] : selected

  function toggle(category: ItemCategoryId) {
    if (!onChange) return
    if (selected.includes(category)) {
      onChange(selected.filter((id) => id !== category))
      return
    }
    onChange([...selected, category])
  }

  return (
    <span
      className={`item-category-badges-container size-${size} ${className}`.trim()}
    >
      {ids.map((id) => (
        <ItemCategoryBadge
          key={id}
          category={id}
          className={`${className}`}
          size={size}
          selected={selected.includes(id)}
          onClick={editable ? () => toggle(id) : undefined}
        />
      ))}
    </span>
  )
}
