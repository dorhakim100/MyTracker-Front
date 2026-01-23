import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Tooltip } from '@mui/material'

interface PickerSelectProps {
  openClock: () => void
  option: {
    label: string
    key: string
    values?: string[] | number[]
    type?: string
    extra?: string
  }
  value: number
  minWidth?: number
  isAutoWidth?: boolean
  className?: string
  afterString?: string
}

export function PickerSelect({
  openClock,
  option,
  value,
  minWidth,
  isAutoWidth = false,
  className,
  afterString,
}: PickerSelectProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  return (
    <Tooltip
      title={`Edit ${option.label}`}
      disableHoverListener={!isDashboard}
      disableTouchListener={!isDashboard}
      disableFocusListener={!isDashboard}
    >
      <FormControl
        sx={{ m: 1, minWidth: isAutoWidth ? 'auto' : minWidth || 150 }}
        size='small'
        onClick={openClock}
        className={`picker-select ${className}`}
      >
        <InputLabel id={`${option.label}-label`}>{option.label}</InputLabel>
        <Select
          className={`${prefs.favoriteColor}`}
          labelId={`${option.label}-label`}
          label={option.label}
          value={value}
          open={false}
          onOpen={() => {}}
          renderValue={(selected) =>
            `${selected} ${afterString ? ` ${afterString}` : ''}`
          }
        >
          <MenuItem
            sx={{
              display: 'none',
            }}
            value={value}
          >
            {value}
          </MenuItem>
        </Select>
      </FormControl>
    </Tooltip>
  )
}
