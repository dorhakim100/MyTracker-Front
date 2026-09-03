import { useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import Collapse from '@mui/material/Collapse'
import { useTranslation } from 'react-i18next'

import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { itemSearchCategoriesNs } from '../locals'

interface RecentSearchChipsProps {
  queries: string[]
  onSelect: (query: string) => void
  onRemove: (query: string) => void
  onClearAll: () => void
}

export function RecentSearchChips({
  queries,
  onSelect,
  onRemove,
  onClearAll,
}: RecentSearchChipsProps) {
  const { t } = useTranslation(itemSearchCategoriesNs)
  const hasQueries = queries.length > 0

  // Keep the last list around so clearing collapses the whole block instead of
  // dropping to the header's height and then folding.
  const lastQueries = useRef(queries)
  if (hasQueries) lastQueries.current = queries

  return (
    <Collapse
      in={hasQueries}
      timeout={220}
      unmountOnExit
      className='recent-search-chips-collapse'
    >
      <div className='recent-search-chips'>
        <div className='recent-search-chips-header'>
          <span>{t('recent')}</span>
          <button
            type='button'
            className='recent-search-clear'
            onClick={onClearAll}
          >
            {t('clearAll')}
          </button>
        </div>
        <div className='recent-search-chips-list'>
          {lastQueries.current.map((query) => (
            <span
              key={query}
              className='recent-search-chip'
            >
              <button
                type='button'
                className='recent-search-chip-label'
                onClick={() => onSelect(query)}
              >
                {query}
              </button>
              <CustomButton
                isIcon
                icon={<CloseIcon fontSize='small' />}
                onClick={() => onRemove(query)}
                ariaLabel={t('removeRecent')}
                variant='flat'
                size='small'
              />
            </span>
          ))}
        </div>
      </div>
    </Collapse>
  )
}
