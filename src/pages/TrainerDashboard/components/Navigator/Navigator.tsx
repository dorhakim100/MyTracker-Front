import { useNavigate, useLocation } from 'react-router'
import Divider from '@mui/material/Divider'
import Drawer, { DrawerProps } from '@mui/material/Drawer'
import List from '@mui/material/List'
import Box from '@mui/material/Box'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'

import { apps } from '../../../../assets/config/apps'
import { trainerRoutes } from '../../../../assets/routes/trainer.routes'

const item = {
  py: '2px',
  px: 3,
  color: 'rgba(255, 255, 255, 0.7)',
  '&:hover, &:focus': {
    bgcolor: 'rgba(255, 255, 255, 0.08)',
  },
}

const itemCategory = {
  boxShadow: '0 -1px 0 rgb(255,255,255,0.1) inset',
  py: 1.5,
  px: 3,
}

export default function Navigator(props: DrawerProps) {
  const { ...other } = props
  const navigate = useNavigate()
  const location = useLocation()

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  return (
    <Drawer
      variant="permanent"
      {...other}
      className="trainer-dashboard-navigator-container"
    >
      <List disablePadding >
        <ListItem className='pointer' onClick={() => navigate('/trainer')}
          sx={{ ...item, ...itemCategory, fontSize: 22, color: '#fff' }}
        >
          <img src={apps.myTracker.logo} alt="logo" className="logo" />
          MyTracker
        </ListItem>

        <Box sx={{ bgcolor: '#101F33' }}>
          <ListItem sx={{ py: 2, px: 3 }}>
            <ListItemText sx={{ color: '#fff' }}>Navigation</ListItemText>
          </ListItem>
          {trainerRoutes.map((route) => {
            const isActive = location.pathname === route.path
            const Icon = route.icon

            return (
              <ListItem disablePadding key={route.path}>
                <ListItemButton
                  selected={isActive}
                  sx={item}
                  onClick={() => handleNavigation(route.path)}
                >
                  <ListItemIcon>
                    <Icon />
                  </ListItemIcon>
                  <ListItemText>{route.title}</ListItemText>
                </ListItemButton>
              </ListItem>
            )
          })}
          <Divider sx={{ mt: 2 }} />
        </Box>
      </List>
    </Drawer>
  )
}
