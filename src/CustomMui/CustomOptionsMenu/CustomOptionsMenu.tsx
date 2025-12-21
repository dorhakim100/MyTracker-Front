import * as React from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { DropdownOption } from '../../types/DropdownOption'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { styled, alpha } from '@mui/material/styles'
import { MenuProps } from '@mui/material/Menu'

interface CustomOptionsMenuProps {
  options: DropdownOption[]
  triggerElement: React.ReactNode
  className?: string
  onClick?: (item: any) => void
}

const StyledMenu = styled((props: MenuProps) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: 'bottom',
      horizontal: 'right',
    }}
    transformOrigin={{
      vertical: 'top',
      horizontal: 'right',
    }}
    {...props}
  />
))(({ theme }) => ({
  '& .MuiPaper-root': {
    outline: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,

    color: 'rgb(55, 65, 81)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
        ...theme.applyStyles('dark', {
          color: 'inherit',
        }),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
    ...theme.applyStyles('dark', {
      color: theme.palette.grey[300],
    }),
  },
}))

export function CustomOptionsMenu({
  options,
  triggerElement,
  className,
  onClick,
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
    if (onClick) {
      onClick(event)
    }
  }
  const handleClose = () => {
    setAnchorEl(null)
    setOpen(false)
  }

  return (
    <div className={className} onClick={handleClick}>
      {triggerElement}
      <StyledMenu
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
      </StyledMenu>
    </div>
  )
}
