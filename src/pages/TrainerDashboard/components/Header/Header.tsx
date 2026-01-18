import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Grid from '@mui/material/GridLegacy'
import HelpIcon from '@mui/icons-material/Help'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import MenuIcon from '@mui/icons-material/Menu'
import NotificationsIcon from '@mui/icons-material/Notifications'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

const lightColor = 'rgba(255, 255, 255, 0.7)'

interface HeaderProps {
  onDrawerToggle: () => void
}

export default function Header(props: HeaderProps) {
  const { onDrawerToggle } = props

  const user = useSelector((state: RootState) => state.userModule.user)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  return (
    <div className="trainer-dashboard-header-container box-shadow">
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar  className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor}`} >
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid sx={{ display: { sm: 'none', xs: 'block' } }} item>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={onDrawerToggle}
                edge="start"
              >
                <MenuIcon />
              </IconButton>
            </Grid>
            <Grid item xs />
            <Grid item>
              <Link
                href="/"
                variant="body2"
                sx={{
                  textDecoration: 'none',
                  color: lightColor,
                  '&:hover': {
                    color: 'common.white',
                  },
                }}
                rel="noopener noreferrer"
                target="_blank"
              >
                Go to docs
              </Link>
            </Grid>
            <Grid item>
              <Tooltip title="Alerts • No alerts">
                <IconButton color="inherit">
                  <NotificationsIcon />
                </IconButton>
              </Tooltip>
            </Grid>
            <Grid item>
              <IconButton color="inherit" sx={{ p: 0.5 }}>
                <Avatar
                  src={user?.details?.imgUrl || '/logo-square.png'}
                  alt={user?.details?.fullname || 'Trainer Profile'}
                />
              </IconButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        color="primary"
        position="static"
        elevation={0}
        sx={{ zIndex: 0 }}
      >
        <Toolbar className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor}`}>
          <Grid container spacing={1} sx={{ alignItems: 'center' }}>
            <Grid item xs>
              <Typography color="inherit" variant="h5" component="h1">
                Authentication
              </Typography>
            </Grid>
            <Grid item>
              <Button
                sx={{ borderColor: lightColor }}
                variant="outlined"
                color="inherit"
                size="small"
              >
                Web setup
              </Button>
            </Grid>
            <Grid item>
              <Tooltip title="Help">
                <IconButton color="inherit">
                  <HelpIcon />
                </IconButton>
              </Tooltip>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        position="static"
        elevation={0}
        sx={{ zIndex: 0 }}
        className={`tabs-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        }`}
      >
        <Tabs value={0} textColor="inherit">
          <Tab label="Users" />
          <Tab label="Sign-in method" />
          <Tab label="Templates" />
          <Tab label="Usage" />
        </Tabs>
      </AppBar>
    </div>
  )
}
