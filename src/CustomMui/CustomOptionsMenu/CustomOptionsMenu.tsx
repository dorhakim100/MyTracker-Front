import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DropdownOption } from '../../types/DropdownOption'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface CustomOptionsMenuProps {
  options: DropdownOption[]
  triggerElement: React.ReactNode
  className?: string
}

export function CustomOptionsMenu({
  options,
  triggerElement,
  className,
}: CustomOptionsMenuProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const [open, setOpen] = React.useState(false)

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation()
    event.preventDefault()
    if (open) return
    setAnchorEl(event.currentTarget)
    setOpen(true)
  }
  const handleClose = () => {
    setAnchorEl(null)
    setOpen(false)
  }

  return (
    <div className={className} onClick={handleClick}>
      {triggerElement}
      <Menu
        className={`${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${className} options-menu`}
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            'aria-labelledby': 'basic-button',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.title}
            className={`${
              prefs.isDarkMode ? 'dark-mode' : ''
            } option-menu-item`}
            onClick={(ev) => {
              ev.stopPropagation()
              option.onClick()
              handleClose()
            }}
          >
            <span className="option-menu-item-title">{option.title}</span>
            <span className="option-menu-item-icon">{option.icon}</span>
          </MenuItem>
        ))}
      </Menu>
    </div>
  )
}
