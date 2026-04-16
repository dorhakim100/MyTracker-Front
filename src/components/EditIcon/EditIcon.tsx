import { useTranslation } from 'react-i18next'
import IconButton from '@mui/material/IconButton'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import { Tooltip } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Haptics, ImpactStyle } from '@capacitor/haptics'

interface EditIconProps {
  onClick?: () => void
  ariaLabel?: string
}

export function EditIcon({ onClick, ariaLabel }: EditIconProps) {
  const { t } = useTranslation()
  const label = ariaLabel ?? t('common.edit')
  const isDashboard = useSelector(
    (state: RootState) => state.systemModule.isDashboard
  )

  const isNative = useSelector(
    (state: RootState) => state.systemModule.isNative
  )

  function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation()
    onClick?.()
    if(isNative) {
      Haptics.impact({ style: ImpactStyle.Light })
    }
  }

  return (
    <Tooltip
      title={label}
      className='edit-button'
      disableHoverListener={!isDashboard}
      disableTouchListener={!isDashboard}
      disableFocusListener={!isDashboard}
    >
      <IconButton
        onClick={handleClick}
        aria-label={label}
        size='small'
      >
        <EditRoundedIcon />
      </IconButton>
    </Tooltip>
  )
}
