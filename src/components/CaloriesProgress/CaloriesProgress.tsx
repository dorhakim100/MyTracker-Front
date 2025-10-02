import { Card, Typography } from '@mui/material'
// import {Slider} from '@mui/material'
import { CircularProgress } from '../CircularProgress/CircularProgress'

import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useState } from 'react'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { setIsLoading } from '../../store/actions/system.actions'
import { showSuccessMsg } from '../../services/event-bus.service'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CaloriesEdit } from './CaloriesEdit'

import { EditIcon } from '../EditIcon/EditIcon'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { User } from '../../types/user/User'
import { roundToNearest50 } from '../../services/macros/macros.service'
// import FlagIcon from '@mui/icons-material/Flag'

interface CaloriesProgressProps {
  percentageValue?: number
  current: number
  goal: number
  label?: string
}

export function CaloriesProgress({
  // percentageValue,
  current,
  // goal,
  label = 'Calories',
}: CaloriesProgressProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const userToEdit = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.userToEdit
  )

  // const [valueToShow, setValueToShow] = useState<number | string>(current)
  // const [isPercentage, setIsPercentage] = useState(false)

  // const onChangeDisplay = () => {
  //   const stateToSet = !isPercentage
  //   setIsPercentage(stateToSet)

  //   setValueToShow(stateToSet ? current : `${percentageValue}%`)
  // }
  const [openModal, setOpenModal] = useState(false)

  const edit = () => {
    setOpenModal(true)
  }

  const onClose = () => {
    setOpenModal(false)
  }

  const onSave = async () => {
    try {
      if (!userToEdit || !user) return
      setIsLoading(true)
      optimisticUpdateUser(userToEdit)
      onClose()
      await updateUser(userToEdit)
      showSuccessMsg(messages.success.updateCalories)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.updateCalories)
      optimisticUpdateUser(user as User)
    } finally {
      setIsLoading(false)
    }
  }

  function getPercentageValue() {
    return (current / (user?.currGoal?.dailyCalories || 1)) * 100
    // return user?.currGoal?.dailyCalories
    //   ? (current / user?.currGoal?.dailyCalories) * 100
    //   : 0
  }

  return (
    <>
      <Card
        className={`card calories-progress ${prefs.isDarkMode ? 'dark' : ''}`}
        // onClick={onChangeDisplay}
      >
        <Typography variant='h6'>{label}</Typography>
        <EditIcon onClick={edit} />
        <div className='goal-container'>
          <GoalBanner
            current={current}
            goal={roundToNearest50(user?.currGoal?.dailyCalories || 0)}
          />
        </div>
        <CircularProgress
          value={getPercentageValue()}
          // text={`${valueToShow}`}
          text={`${current}`}
        />
      </Card>
      <SlideDialog
        open={openModal}
        onClose={onClose}
        component={<CaloriesEdit />}
        title='Edit Calories'
        onSave={onSave}
      />
    </>
  )
}
