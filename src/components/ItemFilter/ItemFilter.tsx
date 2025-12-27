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

type UiSearchSource = 'search' | 'meal'

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
    <Box className="search-container">
      <div className="input-container">
        <CustomInput
          value={filter.txt}
          onChange={(val) => onFilterChange({ ...filter, txt: val })}
          placeholder="Search items..."
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
        value={filter.sortBy}
        onChange={(val) => onFilterChange({ ...filter, sortBy: val })}
        label="Sort by"
        values={sortByOptions}
        className={`${prefs.favoriteColor}`}
      />

      <CustomButton
        onClick={onCustomLog}
        text="Custom"
        icon={<AddIcon />}
        className="custom-add-button"
      />
    </Box>
  )
}
