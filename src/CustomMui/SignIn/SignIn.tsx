import * as React from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Checkbox from '@mui/material/Checkbox'
import CssBaseline from '@mui/material/CssBaseline'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import FormLabel from '@mui/material/FormLabel'
import FormControl from '@mui/material/FormControl'
import Link from '@mui/material/Link'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import MuiCard from '@mui/material/Card'
import { styled } from '@mui/material/styles'
import ForgotPassword from './components/ForgotPassword'
import AppTheme from '../shared-theme/AppTheme'
// import { useColorScheme } from '@mui/material/styles'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { setIsLoading } from '../../store/actions/system.actions'
import { RootState } from '../../store/store'

//import logo from '../../../public/logo.png'
//import logoDark from '../../../public/logo-dark.png'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { login, signup } from '../../store/actions/user.actions'

import { usePwaDetect } from '../../hooks/usePwaDetect'
import CircularProgress from '@mui/material/CircularProgress'
import LoginIcon from '@mui/icons-material/Login'
import { useTranslation } from 'react-i18next'

const Card = styled(MuiCard)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignSelf: 'center',
  width: '100%',
  padding: theme.spacing(4),
  gap: theme.spacing(2),
  margin: 'auto',
  [theme.breakpoints.up('sm')]: {
    maxWidth: '450px',
  },
  boxShadow:
    'hsla(220, 30%, 5%, 0.05) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.05) 0px 15px 35px -5px',
  ...theme.applyStyles('dark', {
    boxShadow:
      'hsla(220, 30%, 5%, 0.5) 0px 5px 15px 0px, hsla(220, 25%, 10%, 0.08) 0px 15px 35px -5px',
  }),
}))

const SignInContainer = styled(Stack)(({ theme }) => ({
  height: 'calc((1 - var(--template-frame-height, 0)) * 100dvh)',
  minHeight: '100%',
  padding: theme.spacing(2),
  [theme.breakpoints.up('sm')]: {
    padding: theme.spacing(4),
  },
  // '&::before': {
  //   content: '""',
  //   display: 'block',
  //   position: 'absolute',
  //   zIndex: -1,
  //   inset: 0,
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   backgroundImage:
  //     'radial-gradient(ellipse at 50% 50%, hsl(174, 45%, 75%), hsl(0, 0%, 100%))',
  //   backgroundRepeat: 'no-repeat',

  //   ...theme.applyStyles('dark', {
  //     backgroundImage:
  //       'radial-gradient(at 50% 50%, hsla(174, 100%, 25%, 0.6), hsl(200, 40%, 5%))',
  //   }),
  // },
}))

export function SignIn(props: { disableCustomTheme?: boolean }) {
  const { t } = useTranslation()
  const [fullnameError, setFullnameError] = React.useState(false)
  const [fullnameErrorMessage, setFullnameErrorMessage] = React.useState('')
  const [emailError, setEmailError] = React.useState(false)
  const [emailErrorMessage, setEmailErrorMessage] = React.useState('')
  const [passwordError, setPasswordError] = React.useState(false)
  const [passwordErrorMessage, setPasswordErrorMessage] = React.useState('')
  const [validatePasswordError, setValidatePasswordError] =
    React.useState(false)
  const [validatePasswordMessage, setValidatePasswordMessage] =
    React.useState('')
  const [open, setOpen] = React.useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const credientials: any = {}

  const [isRemember, setIsRemember] = React.useState(false)

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const { platform } = usePwaDetect()

  const handleClose = () => {
    setOpen(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    const isValid = validateInputs()
    if (!isValid) {
      showErrorMsg(t('auth.fillRequired'))
      return
    }

    const data = new FormData(event.currentTarget)

    credientials.email = data.get('email')
    credientials.password = data.get('password')

    if (isSignup) {
      credientials.fullname = data.get('fullname')
    }
    try {
      setIsLoading(true)
      let user
      if (isSignup) {
        user = await signup({ ...credientials, isRemember })
      } else {
        user = await login({ ...credientials, isRemember })
      }

      if (!user) {
        showErrorMsg(t('auth.loginFailed'))
        return
      }

      let route = ''
      if (user && user.isTrainer && platform === 'desktop') {
        route = '/trainer'
      } else {
        route = '/'
      }

      navigate(`${route}`)
      showSuccessMsg(t('auth.loginSuccess'))
    } catch (err) {
      showErrorMsg(t('auth.signInError'))
    } finally {
      setIsLoading(false)
    }
  }

  const validateInputs = () => {
    const fullname = document.getElementById('fullname') as HTMLInputElement
    const email = document.getElementById('email') as HTMLInputElement
    const password = document.getElementById('password') as HTMLInputElement
    const validatePassword = document.getElementById(
      'validate-password'
    ) as HTMLInputElement

    let isValid = true

    if (isSignup && !fullname.value) {
      setFullnameError(true)
      setFullnameErrorMessage(t('auth.pleaseEnterFullName'))
      isValid = false
    }

    if (!email.value || !/\S+@\S+\.\S+/.test(email.value)) {
      setEmailError(true)
      setEmailErrorMessage(t('auth.invalidEmail'))
      isValid = false
    } else {
      setEmailError(false)
      setEmailErrorMessage('')
    }

    if (!password.value || password.value.length < 6) {
      setPasswordError(true)
      setPasswordErrorMessage(t('auth.passwordMinLength'))
      isValid = false
    } else {
      setPasswordError(false)
      setPasswordErrorMessage('')
    }

    if (isSignup && password.value !== validatePassword.value) {
      setValidatePasswordError(true)
      setValidatePasswordMessage(t('auth.validatePasswordMustMatch'))
      isValid = false
    } else {
      setValidatePasswordError(false)
      setValidatePasswordMessage('')
    }

    return isValid
  }

  // const { mode, setMode } = useColorScheme()

  const navigate = useNavigate()

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [isSignup, setIsSignup] = React.useState(false)

  // const [logoSrc, setLogoSrc] = useState(logo)

  const handleSignup = () => {
    setIsSignup(!isSignup)
  }

  useEffect(() => {
    if (prefs.isDarkMode !== undefined) {
      //setMode(prefs.isDarkMode ? 'dark' : 'light')
      // setLogoSrc(prefs.isDarkMode ? logoDark : logo)
    }
  }, [prefs.isDarkMode])

  const toggleRememberMe = () => {
    // credientials.isRemember = !credientials.isRemember || false
    setIsRemember(!isRemember)
  }

  return (
    <div
      className={`login-sign-up-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } `}
    >
      <AppTheme {...props}>
        <CssBaseline enableColorScheme />
        <SignInContainer
          direction='column'
          justifyContent='space-between'
        >
          {/* <ColorModeSelect
          sx={{ position: 'fixed', top: '1rem', right: '1rem' }}
        /> */}
          <Card variant='outlined'>
            {/* <SitemarkIcon /> */}
            {/* <img
              src={logoSrc}
              alt=''
              style={{
                width: 150,
                height: 100,
                // objectFit: 'cover',
              }}
              className='logo-img'
            /> */}
            <Typography
              component='h1'
              variant='h4'
              sx={{ width: '100%', fontSize: 'clamp(2rem, 10vw, 2.15rem)' }}
            >
              {isSignup ? t('auth.signUp') : t('auth.signIn')}
            </Typography>
            <Box
              component='form'
              onSubmit={handleSubmit}
              noValidate
              sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                gap: 2,
              }}
            >
              {isSignup && (
                <FormControl>
                  <FormLabel htmlFor='fullname'>{t('auth.fullName')}</FormLabel>
                  <TextField
                    error={fullnameError}
                    helperText={fullnameErrorMessage}
                    id='fullname'
                    type='fullname'
                    name='fullname'
                    placeholder={t('auth.fullNamePlaceholder')}
                    autoComplete='name'
                    autoFocus
                    required
                    fullWidth
                    variant='outlined'
                    color={fullnameError ? 'error' : 'primary'}
                  />
                </FormControl>
              )}
              <FormControl>
                <FormLabel htmlFor='email'>{t('auth.email')}</FormLabel>
                <TextField
                  error={emailError}
                  helperText={emailErrorMessage}
                  id='email'
                  type='email'
                  name='email'
                  placeholder={t('auth.emailPlaceholder')}
                  autoComplete='email'
                  autoFocus
                  required
                  fullWidth
                  variant='outlined'
                  color={emailError ? 'error' : 'primary'}
                />
              </FormControl>
              <FormControl>
                <FormLabel htmlFor='password'>{t('auth.password')}</FormLabel>
                <TextField
                  error={passwordError}
                  helperText={passwordErrorMessage}
                  name='password'
                  placeholder='••••••'
                  type='password'
                  id='password'
                  autoComplete='current-password'
                  autoFocus
                  required
                  fullWidth
                  variant='outlined'
                  color={passwordError ? 'error' : 'primary'}
                />
              </FormControl>
              {isSignup && (
                <FormControl>
                  <FormLabel htmlFor='password'>{t('auth.validatePassword')}</FormLabel>
                  <TextField
                    error={validatePasswordError}
                    helperText={validatePasswordMessage}
                    name='validate-password'
                    placeholder='••••••'
                    type='password'
                    id='validate-password'
                    autoComplete='current-password'
                    autoFocus
                    required
                    fullWidth
                    variant='outlined'
                    color={passwordError ? 'error' : 'primary'}
                  />
                </FormControl>
              )}
              <FormControlLabel
                control={
                  <Checkbox
                    value='remember'
                    color='primary'
                  />
                }
                label={t('auth.rememberMe')}
                onChange={toggleRememberMe}
              />
              <ForgotPassword
                open={open}
                handleClose={handleClose}
              />
              <Button
                className='login-button'
                type='submit'
                fullWidth
                variant='contained'
                // onClick={validateInputs}
              >
                {isSignup ? t('auth.signUp') : t('auth.signIn')}
                {isLoading ? (
                  <CircularProgress
                    size={isDashboard ? 28.5 : 16}
                    color='inherit'
                  />
                ) : (
                  <LoginIcon />
                )}
              </Button>
              {/* <Link
                component='button'
                type='button'
                onClick={handleClickOpen}
                variant='body2'
                sx={{ alignSelf: 'center' }}
              >
                Forgot your password?
              </Link> */}
            </Box>
            <Divider>{t('common.or')}</Divider>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* <Button
                fullWidth
                variant='outlined'
                onClick={() => alert('Sign in with Google')}
                startIcon={<GoogleIcon />}
              >
                Sign in with Google
              </Button> */}
              {/* <Button
              fullWidth
              variant='outlined'
              onClick={() => alert('Sign in with Facebook')}
              startIcon={<FacebookIcon />}
              >
              Sign in with Facebook
            </Button> */}
              <div
                className='sign-up-button-container'
                onClick={handleSignup}
              >
                {isSignup ? (
                  <Typography
                    variant='body2'
                    sx={{ textAlign: 'center', cursor: 'pointer' }}
                  >
                    {t('auth.alreadyHaveAccount')}
                    <Link style={{ alignSelf: 'center' }}>{t('auth.loginIn')}</Link>
                  </Typography>
                ) : (
                  <Typography
                    variant='body2'
                    sx={{ textAlign: 'center', cursor: 'pointer' }}
                  >
{t('auth.dontHaveAccount')}
                  <Link style={{ alignSelf: 'center' }}>{t('auth.signUp')}</Link>
                  </Typography>
                )}
              </div>
            </Box>
          </Card>
        </SignInContainer>
      </AppTheme>
    </div>
  )
}
