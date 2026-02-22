import { useTranslation } from 'react-i18next'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'
import { Filter } from '../ItemSearch/ItemSearch'

interface ItemFilterProps {
  filter: Filter
  onFilterChange: (filter: Filter) => void
  onClearQuery: () => void
  onCustomLog: () => void
}

export function ItemFilter({
  filter,
  onFilterChange,
  onClearQuery,
  onCustomLog,
}: ItemFilterProps) {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const sortByOptions = [
    'relevance',
    'calories (high to low)',
    'calories (low to high)',
    'protein (high to low)',
    'protein (low to high)',
    'carbs (high to low)',
    'carbs (low to high)',
    'fat (high to low)',
    'fat (low to high)',
  ]

  return (
    <Box className={`search-container ${prefs.isDarkMode ? 'dark-mode' : ''}`}>
      <div className="input-container">
        <CustomInput
          value={filter.txt}
          onChange={(val) => onFilterChange({ ...filter, txt: val })}
          placeholder={t('meals.searchItems')}
          startIconFn={() => <SearchIcon />}
          endIconFn={() => (
            <IconButton aria-label="close" onClick={onClearQuery}>
              <CloseIcon />
            </IconButton>
          )}
          autoFocus
          className={`${prefs.favoriteColor}`}
        />
      </div>

      <CustomSelect
        tooltipTitle={t('meals.editSortBy')}
        value={filter.sortBy}
        onChange={(val) => onFilterChange({ ...filter, sortBy: val })}
        label={t('meals.sortBy')}
        values={sortByOptions}
        className={`${prefs.favoriteColor} ${prefs.isDarkMode ? 'dark-mode' : ''
          } item-filter-select`}
      />

      <CustomButton
        onClick={onCustomLog}
        text={t('meals.custom')}
        icon={<AddIcon />}
        className="custom-add-button"
      />
    </Box>
  )
}
