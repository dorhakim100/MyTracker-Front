import * as React from 'react'
import { useTranslation } from 'react-i18next'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { Tooltip } from '@mui/material'
import { DropdownOption } from '../../types/DropdownOption'
import {
  CustomButton,
  type CustomButtonVariant,
} from '../CustomButton/CustomButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { styled, alpha } from '@mui/material/styles'
import { MenuProps } from '@mui/material/Menu'

interface CustomOptionsMenuProps {
  options: DropdownOption[]
  triggerElement: React.ReactNode
  className?: string
  onClick?: (item: any) => void
  variant?: CustomButtonVariant
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
    color: 'var(--ink-on-canvas)',
    boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
    '& .MuiMenu-list': {
      padding: '4px 0',
    },
    '& .MuiMenuItem-root': {
      color: 'inherit',
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: 'inherit',
        fill: 'currentColor',
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity
        ),
      },
    },
  },
}))

export function CustomOptionsMenu({
  options,
  triggerElement,
  className,
  onClick,
  variant = 'flat',
}: CustomOptionsMenuProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const isDashboard = useSelector(
    (state: RootState) => state.systemModule.isDashboard
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

  const trigger =
    React.isValidElement(triggerElement) &&
    triggerElement.type === CustomButton
      ? React.cloneElement(
          triggerElement as React.ReactElement<{ variant?: CustomButtonVariant }>,
          {
            variant:
              (triggerElement.props as { variant?: CustomButtonVariant })
                .variant ?? variant,
          }
        )
      : triggerElement

  return (
    <div
      className={`${className || ''} variant-${variant}`}
      onClick={handleClick}
    >
      <Tooltip
        title={t('common.options')}
        disableHoverListener={!isDashboard}
        disableTouchListener={!isDashboard}
        disableFocusListener={!isDashboard}
      >
        <div onClick={handleClick}>{trigger}</div>
      </Tooltip>
      <StyledMenu
        className={`${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${className || ''} options-menu variant-${variant}`}
        id='basic-menu'
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            className: `${
              prefs.isDarkMode ? 'dark-mode' : ''
            } options-menu-paper ${prefs.favoriteColor} variant-${variant}`,
          },
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
            } option-menu-item variant-${variant}`}
            onClick={(ev) => {
              ev.stopPropagation()
              option.onClick()
              handleClose()
            }}
          >
            <span className='option-menu-item-title'>{option.title}</span>
            <span className='option-menu-item-icon'>{option.icon}</span>
          </MenuItem>
        ))}
      </StyledMenu>
    </div>
  )
}
