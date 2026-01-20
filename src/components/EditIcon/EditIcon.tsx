import IconButton from '@mui/material/IconButton'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Tooltip } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface EditIconProps {
  onClick?: () => void
  ariaLabel?: string
}

export function EditIcon({ onClick, ariaLabel = 'Edit' }: EditIconProps) {


  const isDashboard = useSelector((state: RootState) => state.systemModule.isDashboard)

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onClick?.()
  }




  return (

    <Tooltip title="Edit" className='edit-button' disableHoverListener={!isDashboard}>
      <IconButton onClick={handleClick} aria-label={ariaLabel} size='small'>
        <EditRoundedIcon />
      </IconButton>
    </Tooltip>

  )
}
