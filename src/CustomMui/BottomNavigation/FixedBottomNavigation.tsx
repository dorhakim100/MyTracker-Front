import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'

import Paper from '@mui/material/Paper'
import Fab from '@mui/material/Fab'
import AddIcon from '@mui/icons-material/Add'

import { Route } from '../../assets/routes/routes'

export function FixedBottomNavigation(props: {
  routes: Route[]
  centerAction?: {
    icon?: React.ReactNode
    onClick?: () => void
    ariaLabel?: string
  }
}) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  const midIndex = Math.floor(props.routes.length / 2)
  const leftRoutes = React.useMemo(
    () => props.routes.slice(0, midIndex),
    [props.routes, midIndex]
  )
  const rightRoutes = React.useMemo(
    () => props.routes.slice(midIndex),
    [props.routes, midIndex]
  )

  return (
    <Box sx={{ pb: 7 }} ref={ref} className='fixed-bottom-navigation'>
      <CssBaseline />

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <Box sx={{ position: 'relative' }}>
          <Fab
            color='primary'
            aria-label={props.centerAction?.ariaLabel || 'center-action'}
            onClick={props.centerAction?.onClick}
            sx={{
              position: 'absolute',
              top: -28,
              left: 0,
              right: 0,
              margin: '0 auto',
              zIndex: 1,
            }}
          >
            {props.centerAction?.icon || <AddIcon />}
          </Fab>

          <BottomNavigation
            showLabels
            value={value}
            onChange={(event, newValue) => {
              setValue(newValue)
            }}
          >
            {leftRoutes.map((route) => {
              return (
                <BottomNavigationAction
                  key={route.path}
                  label={route.title}
                  icon={<route.icon />}
                  onClick={() => {
                    navigate(route.path)
                  }}
                />
              )
            })}

            {/* Spacer to balance layout under the centered FAB */}
            <BottomNavigationAction sx={{ visibility: 'hidden' }} />

            {rightRoutes.map((route) => {
              return (
                <BottomNavigationAction
                  key={route.path}
                  label={route.title}
                  icon={<route.icon />}
                  onClick={() => {
                    navigate(route.path)
                  }}
                />
              )
            })}
          </BottomNavigation>
        </Box>
      </Paper>
    </Box>
  )
}
