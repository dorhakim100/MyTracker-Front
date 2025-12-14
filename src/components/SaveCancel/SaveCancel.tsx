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
}

export function SaveCancel({
  onCancel,
  onSave,
  cancelText = 'Cancel',
  saveText = 'Save',
  className = '',
}: SaveCancelProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  return (
    <div className={`save-cancel-container ${className}`}>
      <CustomButton
        onClick={onCancel}
        className="delete-account-button"
        text={cancelText}
      />
      <CustomButton
        onClick={onSave}
        className={`${prefs.favoriteColor}`}
        text={saveText}
      />
    </div>
  )
}
