import { useState } from 'react'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Typography from '@mui/material/Typography'
import { CustomAlertDialog } from '../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

interface InfoHintProps {
  title: string
  description: string
  className?: string
}

export function InfoHint({ title, description, className }: InfoHintProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <CustomButton
        isIcon
        icon={<InfoOutlinedIcon />}
        variant='flat'
        size='small'
        ariaLabel={title}
        onClick={() => setOpen(true)}
        className={`info-hint-button ${className}`}
      />
      <CustomAlertDialog
        open={open}
        onClose={() => setOpen(false)}
        title={title}
        className={className}
      >
        <Typography variant='body2'>{description}</Typography>
      </CustomAlertDialog>
    </>
  )
}
