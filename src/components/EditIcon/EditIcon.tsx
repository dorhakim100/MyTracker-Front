import IconButton from '@mui/material/IconButton'
import EditRoundedIcon from '@mui/icons-material/EditRounded'

interface EditIconProps {
  onClick?: () => void
  ariaLabel?: string
}

export function EditIcon({ onClick, ariaLabel = 'Edit' }: EditIconProps) {
  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onClick?.()
  }

  return (
    <div className='edit-button'>
      <IconButton onClick={handleClick} aria-label={ariaLabel} size='small'>
        <EditRoundedIcon />
      </IconButton>
    </div>
  )
}
