import { useTranslation } from 'react-i18next'
import { CustomInput } from '../../CustomMui/CustomInput/CustomInput'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { Divider } from '@mui/material'
import { AddTraineeForm } from '../../pages/TrainerDashboard/pages/Trainees/Trainees'

interface AddTraineeProps {
  form: AddTraineeForm
  handleChange: (field: string, value: string) => void
  errorMessage: string
  setErrorMessage: (message: string) => void
}

export function AddTrainee({
  form,
  handleChange,
  errorMessage,
  setErrorMessage,
}: AddTraineeProps) {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <div className='add-trainee-form-container'>
      <CustomInput
        placeholder={t('auth.fullName')}
        value={form.fullname}
        onChange={(value) => handleChange('fullname', value)}
        className={`${prefs.favoriteColor} ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        isRemoveIcon={true}
      />
      <Divider className={`${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <CustomInput
        placeholder={t('auth.email')}
        value={form.email}
        onChange={(value) => handleChange('email', value)}
        className={`${prefs.favoriteColor} ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        isRemoveIcon={true}
        onBlur={() => {
          if (!/\S+@\S+\.\S+/.test(form.email)) {
            setErrorMessage(t('auth.invalidEmail'))
          } else {
            setErrorMessage('')
          }
        }}
      />
      <span
        className='error-message'
        style={{
          opacity: errorMessage ? 1 : 0,
        }}
      >
        {errorMessage}
      </span>
    </div>
  )
}
