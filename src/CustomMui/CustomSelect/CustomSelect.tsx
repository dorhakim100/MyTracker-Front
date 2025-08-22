import * as React from 'react'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'

interface CustomSelectProps {
  label: string
  values: any[]
  extra?: string
}

export function CustomSelect({ label, values, extra }: CustomSelectProps) {
  const [value, setValue] = React.useState('')

  const handleChange = (event: SelectChangeEvent) => {
    setValue(event.target.value)
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
