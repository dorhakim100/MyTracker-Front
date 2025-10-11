import DialogTitle from '@mui/material/DialogTitle'
import Dialog from '@mui/material/Dialog'
import { LinearProgress } from '@mui/material'
import { RootState } from '../../store/store'
import { useSelector } from 'react-redux'

export interface SimpleDialogProps {
  open: boolean
  title: string
  onClose: () => void

  children: React.ReactNode
}

export function CustomAlertDialog(props: SimpleDialogProps) {
  const { onClose, open, children, title } = props

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog
      onClose={handleClose}
      open={open}
      sx={{
        '& .MuiPaper-root': {
          padding: '1rem',
          display: 'grid',
          gridTemplateRows: 'auto 1fr 5px',

          //   gap: '1rem',
        },

        '& h2': {
          padding: '1rem 0',
          fontSize: '1.5rem',
          fontWeight: 600,
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <div className='dialog-content'>{children}</div>
      {isLoading && <LinearProgress />}
    </Dialog>
  )
}
