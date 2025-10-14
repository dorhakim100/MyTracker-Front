import * as React from 'react'
import Dialog from '@mui/material/Dialog'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import Slide from '@mui/material/Slide'
import { TransitionProps } from '@mui/material/transitions'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import CircularProgress from '@mui/material/CircularProgress'

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction='up' ref={ref} {...props} />
})

interface SlideDialogProps {
  open: boolean
  onClose: () => void
  component: React.ReactElement
  title?: string
  onSave?: () => void
  type?: 'half' | 'full'
}

export function SlideDialog({
  open,
  onClose,
  component,
  title = 'Edit',
  onSave,
  type = 'half',
}: SlideDialogProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const handleSave = async () => {
    try {
      await onSave?.()
      onClose()
    } catch (err) {
      console.log('err', err)
    }
  }

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        className={`${type === 'half' ? 'half-dialog' : 'full-dialog'}`}
        open={open}
        onClose={handleSave}
        sx={{
          // bottom: 20,

          '& .MuiDialog-paper': {
            height: type === 'half' ? '600px' : '100%',
            paddingBottom: '1.5em',
          },
        }}
        slots={{
          transition: Transition,
        }}
        slotProps={{
          paper: {
            className: `slide-dialog ${prefs.isDarkMode ? 'dark-mode' : ''}`,
          },
        }}
      >
        {/* {isLoading && <LinearProgress />} */}

        <AppBar sx={{ position: 'relative' }}>
          <Toolbar className={`${prefs.favoriteColor}`}>
            <IconButton
              edge='start'
              color='inherit'
              onClick={onClose}
              aria-label='close'
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant='h6' component='div'>
              {title}
            </Typography>
            {/* <Button autoFocus color='inherit' onClick={onClose}>
              save
            </Button> */}
            {isLoading && <CircularProgress size={20} color='inherit' />}
          </Toolbar>
        </AppBar>
        <div className='slide-dialog-content'>{component}</div>
      </Dialog>
    </React.Fragment>
  )
}
