import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { capitalizeFirstLetter } from '../../services/util.service'
import { Tooltip } from '@mui/material'

interface CustomSelectProps {
  label: string
  values: string[]
  extra?: string
  value: string
  onChange: (value: string) => void
  className?: string
  imgs?: { value: string; src?: string; icon?: React.ReactNode }[]
  tooltipTitle?: string
  valueLabels?: Record<string, string>
}

export function CustomSelect({
  label,
  values,
  value,
  extra,
  onChange,
  className,
  imgs,
  tooltipTitle,
  valueLabels,
}: CustomSelectProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const handleChange = (event: SelectChangeEvent) => {
    onChange(event.target.value)
  }

  const getImg = (value: string) => {
    if (!imgs) return null

    const item = imgs.find((img) => img.value === value)
    if (!item) return null

    // Determine if it's a src (image) or icon (React component)
    const isSrc = 'src' in item && item.src !== undefined
    const isIcon = 'icon' in item && item.icon !== undefined

    if (isSrc) {
      return (
        <img
          src={(item as { value: string; src: string }).src}
          alt={value}
          className='custom-select-img'
        />
      )
    }

    if (isIcon) {
      return (
        <div className='custom-select-icon'>
          {(item as { value: string; icon: React.ReactNode }).icon}
        </div>
      )
    }

    return null
  }

  return (
    <Tooltip
      title={tooltipTitle}
      disableHoverListener={isDashboard && tooltipTitle ? false : true}
      disableTouchListener={isDashboard && tooltipTitle ? false : true}
      disableFocusListener={isDashboard && tooltipTitle ? false : true}
    >
      <FormControl
        sx={{ m: 1, minWidth: 140 }}
        size='small'
        className={`custom-select ${className} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${isDashboard ? 'dashboard' : ''}`}
      >
        <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
        <Select
          labelId={`${label}-select-label`}
          id={`${label}-select`}
          value={value}
          className={`${imgs ? 'with-imgs' : ''} ${isDashboard ? 'dashboard' : ''}`}
          label={label}
          onChange={handleChange}
          renderValue={
            valueLabels
              ? (v) => valueLabels[v as string] ?? capitalizeFirstLetter(v as string)
              : undefined
          }
          MenuProps={{
            PaperProps: {
              className: `${
                prefs.isDarkMode ? 'dark-mode' : ''
              } ${className} select-paper`,
            },
          }}
        >
          {/* <MenuItem value=''>
          <em>None</em>
          </MenuItem> */}
          {values.map((value) => (
            <MenuItem
              key={`${label}-${value}-select`}
              value={value}
            >
              {getImg(value)}
              {(valueLabels?.[value] ?? capitalizeFirstLetter(value))} {extra}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Tooltip>
  )
}
