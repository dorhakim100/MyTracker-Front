import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import Box from '@mui/material/Box'
import CssBaseline from '@mui/material/CssBaseline'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'

import Paper from '@mui/material/Paper'

import { Route } from '../../assets/routes/routes'

export function FixedBottomNavigation(props: { routes: Route[] }) {
  const [value, setValue] = React.useState(0)
  const ref = React.useRef<HTMLDivElement>(null)

  const navigate = useNavigate()

  return (
    <Box sx={{ pb: 7 }} ref={ref}>
      <CssBaseline />

      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue)
          }}
        >
          {props.routes.map((route) => (
            <BottomNavigationAction
              key={route.path}
              label={route.title}
              icon={<route.icon />}
              onClick={() => {
                navigate(route.path)
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </Box>
  )
}
