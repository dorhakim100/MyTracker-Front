import { useState } from 'react'
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
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <div className='add-trainee-form-container'>
      <CustomInput
        placeholder='Full Name'
        value={form.fullname}
        onChange={(value) => handleChange('fullname', value)}
        className={`${prefs.favoriteColor} ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        isRemoveIcon={true}
      />
      <Divider className={`${prefs.isDarkMode ? 'dark-mode' : ''}`} />
      <CustomInput
        placeholder='Email'
        value={form.email}
        onChange={(value) => handleChange('email', value)}
        className={`${prefs.favoriteColor} ${prefs.isDarkMode ? 'dark-mode' : ''}`}
        isRemoveIcon={true}
        onBlur={() => {
          if (!/\S+@\S+\.\S+/.test(form.email)) {
            setErrorMessage('Email must be a valid email address')
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
