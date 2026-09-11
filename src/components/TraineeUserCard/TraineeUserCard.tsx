import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { RootState } from '../../store/store'
import { removeTraineeUser } from '../../store/actions/user.actions'

import { Typography } from '@mui/material'

import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'

import DisabledVisibleIcon from '@mui/icons-material/DisabledVisible'

import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft'
import { usePwaDetect } from '../../hooks/usePwaDetect'

export function TraineeUserCard() {
  const { t } = useTranslation()

  const { isPwaInstalled } = usePwaDetect()

  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const isRtl = prefs.lang === 'he'

  const displayName = traineeUser?.details.fullname
  const displayImage = traineeUser?.details.imgUrl

  const [isHidden, setIsHidden] = useState(true)

  const getMode = () => {
    if (prefs.isNative) {
      return 'native'
    }
    if (isPwaInstalled) {
      return 'pwa'
    }
    return 'web'
  }

  return (
    <div
      className={`trainee-user-card-container ${
        prefs.isDarkMode ? 'dark-mode' : ''
      } ${isHidden ? 'hidden' : ''} ${prefs.favoriteColor} ${
        isRtl ? 'rtl' : ''
      } ${getMode()}`}
    >
      <div className='trainee-details'>
        <img
          src={displayImage}
          alt={displayName}
        />
        <Typography variant='h6'>{displayName}</Typography>
      </div>
      <CustomButton
        icon={<DisabledVisibleIcon />}
        className='disable-button'
        onClick={() => {
          removeTraineeUser()
        }}
        sx={{
          backgroundColor: '#d32f2f',
        }}
      />

      <CustomButton
        isIcon={true}
        icon={
          isHidden ? (
            <KeyboardArrowRightIcon
              style={{ transform: isRtl ? 'scaleX(-1)' : 'scaleX(1)' }}
            />
          ) : (
            <KeyboardArrowLeftIcon
              style={{ transform: isRtl ? 'scaleX(-1)' : 'scaleX(1)' }}
            />
          )
        }
        tooltipTitle={isHidden ? t('common.show') : t('common.hide')}
        onClick={() => {
          setIsHidden(!isHidden)
        }}
      />
    </div>
  )
}
