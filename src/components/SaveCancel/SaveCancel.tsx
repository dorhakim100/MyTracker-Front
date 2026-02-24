import { useTranslation } from 'react-i18next'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import './styles/SaveCancel.scss'

interface SaveCancelProps {
  onCancel?: () => void
  onSave?: () => void
  cancelText?: string
  saveText?: string
  className?: string
  saveButtonClassName?: string
}

export function SaveCancel({
  onCancel,
  onSave,
  cancelText,
  saveText,
  className = '',
  saveButtonClassName = '',
}: SaveCancelProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className={`save-cancel-container ${className}`}>
      <CustomButton
        onClick={onCancel}
        className='delete-account-button'
        text={cancelText ?? t('common.cancel')}
      />
      <CustomButton
        onClick={onSave}
        className={`${prefs.favoriteColor} save-button ${saveButtonClassName}`}
        text={saveText ?? t('common.save')}
      />
    </div>
  )
}
