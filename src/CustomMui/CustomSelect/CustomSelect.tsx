import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { capitalizeFirstLetter } from '../../services/util.service'

interface CustomSelectProps {
  label: string
  values: string[]
  extra?: string
  value: string
  onChange: (value: string) => void
  className?: string
}

export function CustomSelect({
  label,
  values,
  value,
  extra,
  onChange,
  className,
}: CustomSelectProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  return (
    <FormControl
      sx={{ m: 1, minWidth: 140 }}
      size='small'
      className={`custom-select ${className}`}
    >
      <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-select-label`}
        id={`${label}-select`}
        value={value}
        label={label}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            className: `${prefs.isDarkMode ? 'dark-mode' : ''} ${className}`,
          },
        }}
      >
        {/* <MenuItem value=''>
          <em>None</em>
        </MenuItem> */}
        {values.map((value) => (
          <MenuItem key={`${label}-${value}-select`} value={value}>
            {capitalizeFirstLetter(value)} {extra}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
