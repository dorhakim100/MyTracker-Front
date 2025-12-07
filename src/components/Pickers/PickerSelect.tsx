import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

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
}

export function PickerSelect({
  openClock,
  option,
  value,
  minWidth,
  isAutoWidth = false,
}: PickerSelectProps) {
  return (
    <FormControl
      sx={{ m: 1, minWidth: isAutoWidth ? 'auto' : minWidth || 150 }}
      size='small'
      onClick={openClock}
    >
      <InputLabel id={`${option.label}-label`}>{option.label}</InputLabel>
      <Select
        labelId={`${option.label}-label`}
        label={option.label}
        value={value}
        open={false}
        onOpen={() => {}}
        renderValue={(selected) => `${selected}`}
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
  )
}
