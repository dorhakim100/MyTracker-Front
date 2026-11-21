import { useTranslation } from 'react-i18next'
import { Card, Typography } from '@mui/material'
// import {Slider} from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import { useSelector } from 'react-redux'
import { RootState, store } from '../../store/store'
import { useMemo, useState } from 'react'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { setIsLoading } from '../../store/actions/system.actions'
import { showSuccessMsg, showErrorMsg } from '../../services/event-bus.service'
import { CaloriesEdit } from './CaloriesEdit'

import { EditIcon } from '../EditIcon/EditIcon'
import { CustomIcon } from '../../CustomMui/CustomIcon/CustomIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { HealthActivity } from '../HealthActivity/HealthActivity'
// import { GoalBanner } from '../GoalBanner/GoalBanner'
import { streakTypes, type User } from '../../types/user/User'
import { roundToNearest50 } from '../../services/macros/macros.service'
import { goalService } from '../../services/goal/goal.service'
import { LiveStreak } from '../LiveStreak/LiveStreak'
// import FlagIcon from '@mui/icons-material/Flag'

interface CaloriesProgressProps {
  percentageValue?: number
  current: number
  goal: number
  isEditButton?: boolean
  enableHistory?: boolean
}

export function CaloriesProgress({
  current,
  isEditButton = true,
  goal,
  enableHistory = false,
}: CaloriesProgressProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  console.log('user', user)

  const [openModal, setOpenModal] = useState(false)
  const [openHistory, setOpenHistory] = useState(false)

  const { streaks } = user || {}

  const activeStreaks = useMemo(() => {
    return Object.values(streaks || {}).filter((streak) => streak.count > 0)
  }, [streaks])

  console.log('activeStreaks', activeStreaks)

  const currentValue = useMemo(() => {
    return +current.toFixed(0)
  }, [current])

  const edit = () => {
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  const onSave = async () => {
    const userToEdit = store.getState().userModule.userToEdit
    try {
      if (!userToEdit || !user) return
      setIsLoading(true)
      optimisticUpdateUser(userToEdit)
      onClose()
      const savedGoal = await goalService.save({ ...userToEdit.currGoal })
      await updateUser({ ...userToEdit, currGoal: savedGoal })
      showSuccessMsg(t('messages.success.updateCalories'))
    } catch {
      showErrorMsg(t('messages.error.updateCalories'))
      optimisticUpdateUser(user as User)
    } finally {
      setIsLoading(false)
    }
  }

  function getPercentageValue() {
    return (currentValue / (goal || 1)) * 100
  }

  return (
    <>
      <Card
        className={`card calories-progress ${
          enableHistory ? 'is-history' : ''
        } ${prefs.isDarkMode ? 'dark' : ''} ${prefs.favoriteColor}`}
        onClick={enableHistory ? () => setOpenHistory(true) : undefined}
      >
        <div className='title-row'>
          <CustomIcon
            name='calories'
            size='m'
            padded={false}
          />
          <Typography
            variant='h5'
            className='bold-header'
          >
            {t('macros.calories')}
          </Typography>
          {activeStreaks.length === 1 &&
            activeStreaks[0].type === streakTypes.consumed && (
              <LiveStreak
                count={activeStreaks[0].count || 0}
                size='large'
              />
            )}
        </div>
        {isEditButton && <EditIcon onClick={edit} />}
        <div className='goal-container'>
          {/* <GoalBanner
            current={currentValue}
            goal={roundToNearest50(goal || 0)}
          />
    */}
        </div>
        <CircularProgress
          value={getPercentageValue()}
          // text={`${valueToShow}`}
          text={`${currentValue}`}
          afterText={`${roundToNearest50(goal || 0)}`}
        />
      </Card>
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={
          <CaloriesEdit
            onCancel={onClose}
            onSave={onSave}
          />
        }
        title={t('macros.editCalories')}
        // onSave={onSave}
      />
      {enableHistory && (
        <SlideDialog
          open={openHistory}
          onClose={() => setOpenHistory(false)}
          type='full'
          title={t('macros.calories')}
          component={<HealthActivity source='intake' />}
        />
      )}
    </>
  )
}
