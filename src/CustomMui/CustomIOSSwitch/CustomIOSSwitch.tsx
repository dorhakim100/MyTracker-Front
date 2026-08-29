import { styled } from '@mui/material/styles'

import Switch, { SwitchProps } from '@mui/material/Switch'

export const CustomIOSSwitch = styled(
  ({ color: _favoriteColor, ...props }: SwitchProps & { color?: string }) => (
    <Switch
      focusVisibleClassName='.Mui-focusVisible'
      disableRipple
      {...props}
      color='default'
    />
  )
)(({ theme }) => {
  return {
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& .MuiSwitch-thumb': {
          backgroundColor: '#fff',
        },
        '& + .MuiSwitch-track': {
          backgroundColor:
            'color-mix(in srgb, var(--accent) var(--chrome-tint-strong), transparent)',
          opacity: 1,
          border: 0,
          boxShadow:
            'inset 0 0 0 1.5px color-mix(in srgb, var(--accent) var(--chrome-ring), transparent)',
        },
        '&.Mui-disabled + .MuiSwitch-track': {
          opacity: 0.5,
        },
      },
      '&.Mui-focusVisible .MuiSwitch-thumb': {
        color: 'var(--accent)',
        border: '6px solid #fff',
      },
      '&.Mui-disabled .MuiSwitch-thumb': {
        color: theme.palette.grey[100],
        ...theme.applyStyles('dark', {
          color: theme.palette.grey[600],
        }),
      },
      '&.Mui-disabled + .MuiSwitch-track': {
        opacity: 0.7,
        ...theme.applyStyles('dark', {
          opacity: 0.3,
        }),
      },
    },
    '& .MuiSwitch-thumb': {
      boxSizing: 'border-box',
      width: 22,
      height: 22,
      backgroundColor: '#fff',
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: '#E9E9EA',
      opacity: 1,
      transition: theme.transitions.create(['background-color'], {
        duration: 500,
      }),
      ...theme.applyStyles('dark', {
        backgroundColor: '#39393D',
      }),
    },
  }
})
