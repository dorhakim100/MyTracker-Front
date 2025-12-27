import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import DinnerDiningIcon from '@mui/icons-material/DinnerDining'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import {
  CustomToggle,
  ToggleOption,
} from '../../CustomMui/CustomToggle/CustomToggle'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { searchTypes } from '../../assets/config/search-types'
import { CustomSelect } from '../../CustomMui/CustomSelect/CustomSelect'

type UiSearchSource = 'search' | 'meal'

interface ItemFilterProps {
  filter: { txt: string; source: UiSearchSource }
  onFilterChange: (filter: { txt: string; source: UiSearchSource }) => void
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

  const toggleOptions: ToggleOption[] = [
    {
      value: searchTypes.search,
      label: 'Food',
      icon: <SearchIcon />,
    },
    { value: searchTypes.meal, label: 'My Meals', icon: <DinnerDiningIcon /> },
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

      {filter.txt && (
        <CustomSelect
          value={filter.source}
          onChange={(val) =>
            onFilterChange({ ...filter, source: val as UiSearchSource })
          }
          label="Sort by"
          values={toggleOptions.map((opt) => opt.value)}
          className={`${prefs.favoriteColor}`}
        />
      )}
      <CustomButton
        onClick={onCustomLog}
        text="Custom"
        icon={<AddIcon />}
        className="custom-add-button"
      />
    </Box>
  )
}
