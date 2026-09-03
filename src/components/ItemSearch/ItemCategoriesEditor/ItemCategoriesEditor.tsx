import Chip from '@mui/material/Chip'

import {
  ITEM_CATEGORY_IDS,
  ItemCategoryId,
} from '../../../assets/config/item-categories'
import { useTranslation } from 'react-i18next'
import { itemSearchCategoriesNs } from '../locals'

interface ItemCategoriesEditorProps {
  value: string[]
  onChange: (categories: ItemCategoryId[]) => void
}

export function ItemCategoriesEditor({ value, onChange }: ItemCategoriesEditorProps) {
  const { t } = useTranslation(itemSearchCategoriesNs)
  const selected = new Set(value)

  function toggle(category: ItemCategoryId) {
    const next = new Set(selected)
    if (next.has(category)) next.delete(category)
    else next.add(category)
    onChange([...next] as ItemCategoryId[])
  }

  return (
    <div className='item-categories-editor'>
      {ITEM_CATEGORY_IDS.map((category) => (
        <Chip
          key={category}
          label={t(`categories.${category}`)}
          color={selected.has(category) ? 'primary' : 'default'}
          variant={selected.has(category) ? 'filled' : 'outlined'}
          onClick={() => toggle(category)}
        />
      ))}
    </div>
  )
}
