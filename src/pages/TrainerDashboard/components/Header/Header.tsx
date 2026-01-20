import { useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../../store/store'
import { setIsLoading } from '../../../../store/actions/system.actions'
import { setTrainees } from '../../../../store/actions/user.actions'
import AppBar from '@mui/material/AppBar'
import Avatar from '@mui/material/Avatar'
import Grid from '@mui/material/GridLegacy'
import IconButton from '@mui/material/IconButton'
import MenuIcon from '@mui/icons-material/Menu'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { TrainerRequest } from '../../../../types/trainerRequest/TrainerRequest'
import { userService } from '../../../../services/user/user.service'
import { messages } from '../../../../assets/config/messages'
import { showErrorMsg } from '../../../../services/event-bus.service'
import { User } from '../../../../types/user/User'
import { TraineesTabs } from './TraineesTabs'
import { TRAINEE_ORDER_STORE_NAME } from '../../../../constants/store.constants'
import { CustomOptionsMenu } from '../../../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import { logout } from '../../../../store/actions/user.actions'
import { useNavigate } from 'react-router-dom'



interface HeaderProps {
  onDrawerToggle: () => void
}

export default function Header(props: HeaderProps) {
  const { onDrawerToggle } = props

  const user = useSelector((state: RootState) => state.userModule.user)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const trainees = useSelector((state: RootState) => state.userModule.trainees)

  const navigate = useNavigate()

  const options = useMemo(() => {
    return [
      {
        title: 'View Profile',
        onClick: () => {
          navigate('/trainer/user')
        }
      },
      {
        title: 'Logout',
        onClick: () => {
          logout()
        }
      }
    ]
  }, [user])

  useEffect(() => {
    getTrainees()
  }, [user])

  async function getTrainees() {
    try {
      if (!user) return

      setIsLoading(true)
      const requests = await userService.getRequests(user._id)

      const trainees = requests.map(
        (request: TrainerRequest) => request.trainee
      )


      trainees.unshift(user)


      let traineesOrder: string[] = JSON.parse(localStorage.getItem(TRAINEE_ORDER_STORE_NAME) || '[]')


      if (!traineesOrder.length) {
        traineesOrder = trainees.map((trainee: User) => trainee._id)
        localStorage.setItem(TRAINEE_ORDER_STORE_NAME, JSON.stringify(traineesOrder))
        setTrainees(trainees)
        return
      }

      const orderedTrainees = trainees.sort((a: User, b: User) => {
        const aIndex = traineesOrder.indexOf(a._id)
        const bIndex = traineesOrder.indexOf(b._id)
        return aIndex - bIndex
      })

      setTrainees(orderedTrainees)

    } catch (err) {
      showErrorMsg(messages.error.getRequests)
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="trainer-dashboard-header-container box-shadow">
      <AppBar color="primary" position="sticky" elevation={0}>
        <Toolbar className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor}`} >
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
              <CustomOptionsMenu
                className={`${prefs.favoriteColor}`}
                triggerElement={
                  <IconButton color="inherit" sx={{ p: 0.5 }}>
                    <Avatar
                      src={user?.details?.imgUrl || '/logo-square.png'}
                      alt={user?.details?.fullname || 'Trainer Profile'}
                    />
                  </IconButton>
                }
                options={options}


              />
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
                {`${user?.details?.fullname} ${user?.isTrainer ? '• Trainer' : ''}`}
              </Typography>
            </Grid>

          </Grid>
        </Toolbar>
      </AppBar>
      <AppBar
        component="div"
        position="static"
        elevation={0}
        sx={{ zIndex: 0 }}
        className={`tabs-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor
          }`}
      >

        <TraineesTabs trainees={trainees} />

      </AppBar>
    </div>
  )
}
