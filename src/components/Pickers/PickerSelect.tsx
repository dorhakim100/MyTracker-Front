import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useTranslation } from 'react-i18next'
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
  readOnly?: boolean
}

export function PickerSelect({
  openClock,
  option,
  value,
  minWidth,
  isAutoWidth = false,
  className,
  afterString,
  readOnly = false,
}: PickerSelectProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  return (
    <Tooltip
      title={t('common.editOption', { option: option.label })}
      disableHoverListener={readOnly || !isDashboard}
      disableTouchListener={readOnly || !isDashboard}
      disableFocusListener={readOnly || !isDashboard}
    >
      <FormControl
        sx={{ m: readOnly ? 0 : 1, minWidth: isAutoWidth ? 'auto' : minWidth || 150 }}
        size='small'
        onClick={readOnly ? undefined : openClock}
        className={`picker-select ${readOnly ? 'read-only' : ''} ${className} ${prefs.favoriteColor} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
      >
        <InputLabel id={`${option.label}-label`}>{option.label}</InputLabel>
        <Select
          className={`${prefs.favoriteColor}`}
          labelId={`${option.label}-label`}
          label={option.label}
          value={value}
          open={false}
          onOpen={() => {}}
          IconComponent={readOnly ? () => null : undefined}
          inputProps={readOnly ? { readOnly: true } : undefined}
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
