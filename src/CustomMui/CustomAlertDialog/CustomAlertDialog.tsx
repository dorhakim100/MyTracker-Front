import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { LinearProgress } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'
import { Close } from '@mui/icons-material'

export type AlertDialogType = 'small' | 'medium' | 'large'

export interface SimpleDialogProps {
  open: boolean
  title: string
  onClose: () => void
  children: React.ReactNode
  className?: string
  type?: AlertDialogType
}

export function CustomAlertDialog(props: SimpleDialogProps) {
  const { onClose, open, children, title, className, type = 'small' } = props

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      fullWidth={type !== 'small'}
      maxWidth={type === 'large' ? false : type === 'medium' ? 'sm' : 'xs'}
      PaperProps={{
        className: `${className || ''} alert-dialog-paper alert-type-${type}`,
      }}
      sx={{
        '& .MuiPaper-root': {
          padding: '1rem',
          display: 'grid',
          gridTemplateRows: 'auto 1fr 5px',
        },

        '& h2': {
          padding: '1rem 0',
          fontSize: '1.5rem',
          fontWeight: 600,
        },
      }}
    >
      <div className='dialog-header'>
        <DialogTitle>{title}</DialogTitle>
        <Close
          onClick={handleClose}
          className='close-icon'
        />
      </div>
      <div className='dialog-content'>{children}</div>
      {isLoading && <LinearProgress className={`${prefs.favoriteColor}`} />}
    </Dialog>
  )
}
