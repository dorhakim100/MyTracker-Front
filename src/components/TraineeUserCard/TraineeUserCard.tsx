import { useState } from 'react'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { removeTraineeUser } from '../../store/actions/user.actions'

import { Typography } from '@mui/material'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import DisabledVisibleIcon from '@mui/icons-material/DisabledVisible'

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'

export function TraineeUserCard() {
  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const displayName = traineeUser?.details.fullname
  const displayImage = traineeUser?.details.imgUrl

  const [isHidden, setIsHidden] = useState(true)

  return (
    <div
      className={`trainee-user-card-container ${prefs.isDarkMode ? 'dark-mode' : ''
        } ${isHidden ? 'hidden' : ''}`}
    >
      <div className='trainee-details'>
        <img src={displayImage} alt={displayName} />
        <Typography variant='h6'>{displayName}</Typography>
      </div>
      <CustomButton
        icon={<DisabledVisibleIcon />}
        className='red'
        onClick={() => {
          removeTraineeUser()
        }}
      />

      <CustomButton
        isIcon={true}
        icon={isHidden ? <KeyboardArrowRightIcon /> : <KeyboardArrowLeftIcon />}
        tooltipTitle={isHidden ? 'Show' : 'Hide'}
        onClick={() => {
          setIsHidden(!isHidden)
        }}
      />
    </div>
  )
}
