import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CustomSelectProps {
  label: string
  values: string[]
  extra?: string
  value: string
  onChange: (value: string) => void
}

export function CustomSelect({
  label,
  values,
  value,
  extra,
  onChange,
}: CustomSelectProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  return (
    <FormControl sx={{ m: 1, minWidth: 140 }} size='small'>
      <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-select-label`}
        id={`${label}-select`}
        value={value}
        label={label}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            className: prefs.isDarkMode ? 'dark-mode' : '',
          },
        }}
      >
        {/* <MenuItem value=''>
          <em>None</em>
        </MenuItem> */}
        {values.map((value) => (
          <MenuItem key={`${label}-${value}-select`} value={value}>
            {value} {extra}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
