import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { EditGoal } from '../EditGoal/EditGoal'
// import ListItemIcon from '@mui/material/ListItemIcon'
// import Typography from '@mui/material/Typography'
// import { getDateFromISO } from '../../services/util.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { Goal } from '../../types/goal/Goal'
import { Checkbox } from '@mui/material'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { goalService } from '../../services/goal/goal.service'
import {
  optimisticUpdateUser,
  updateUser,
} from '../../store/actions/user.actions'
import { User } from '../../types/user/User'

import { DeleteAction } from '../DeleteAction/DeleteAction'
// import { userService } from '../../services/user/user.service'

const DEFAULT_GOAL_TITLE = 'Loss weight'

export function GoalsCard() {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  const onCloseGoalDetails = () => {
    setIsAddGoalOpen(false)
    setSelectedGoal(null)
  }

  const openModal = () => {
    setIsAddGoalOpen(true)
  }

  const saveGoal = async (goal: Goal) => {
    try {
      if (!user) return showErrorMsg(messages.error.saveGoal)

      goal.userId = user._id

      const savedGoal = await goalService.save(goal)
      let newGoals = []

      const existingIndex = user.goals.findIndex((g) => g._id === savedGoal._id)

      if (existingIndex !== -1) {
        newGoals = user.goals.splice(existingIndex, 1, savedGoal)
      } else {
        newGoals = [savedGoal, ...user.goals]
      }

      const newUser = {
        ...user,
        goals: newGoals,
      }
      optimisticUpdateUser(newUser)
      onCloseGoalDetails()
      await updateUser(newUser)
      showSuccessMsg(messages.success.saveGoal)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.saveGoal)
    }
  }

  const onAddGoal = () => {
    setSelectedGoal(null)
    openModal()
  }

  const onSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    openModal()
  }

  const onActivateGoal = async (goal: Goal) => {
    if (!user) return showErrorMsg(messages.error.saveGoal)
    const newUser = {
      ...user,
      currGoal: goal,
      goals: user.goals.map((g) =>
        g._id === goal._id
          ? { ...g, isSelected: true }
          : { ...g, isSelected: false }
      ),
    }
    optimisticUpdateUser(newUser)
    try {
      await goalService.selectGoal(goal._id, user._id)

      showSuccessMsg(messages.success.saveGoal)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.saveGoal)
      optimisticUpdateUser(user as User)
    }
  }

  const onDeleteGoal = async (goal: Goal) => {
    if (!user || goal.isSelected) return showErrorMsg(messages.error.deleteGoal)

    try {
      await goalService.remove(goal._id)
      const newUser = {
        ...user,
        goals: user.goals.filter((g) => g._id !== goal._id),
      }
      await updateUser(newUser)

      showSuccessMsg(messages.success.deleteGoal)
    } catch (err) {
      console.log('err', err)
      showErrorMsg(messages.error.deleteGoal)
      optimisticUpdateUser(user as User)
    }
  }

  if (!user || !user.goals) return <div>GoalsCard</div>

  return (
    <>
      <div className='goals-card'>
        <CustomButton
          text='Add Goal'
          icon={<AddIcon />}
          onClick={onAddGoal}
          fullWidth
        />
        <CustomList
          items={user.goals}
          getKey={(goal) => goal._id}
          renderPrimaryText={(goal) => goal.title}
          renderLeft={(goal) => (
            <MacrosDonut
              protein={goal.macros?.protein || 0}
              carbs={goal.macros?.carbs || 0}
              fats={goal.macros?.fat || 0}
            />
          )}
          renderSecondaryText={(goal) =>
            `${DEFAULT_GOAL_TITLE} - ${goal.targetWeight || 80} kg - ${
              goal.dailyCalories
            } kcal`
          }
          renderRight={(goal) => (
            // <ListItemIcon>
            //   <Typography variant='body2'>
            //     {getDateFromISO(new Date().toISOString())}
            //   </Typography>
            // </ListItemIcon>
            <Checkbox
              className={`${prefs.favoriteColor}`}
              checked={goal.isSelected}
              onClick={(ev) => {
                ev.stopPropagation()
                if (goal.isSelected) return
                onActivateGoal(goal)
              }}
            />
          )}
          onItemClick={onSelectGoal}
          className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
          isSwipeable={(goal) => !goal.isSelected}
          // isSwipeable={true}
          renderRightSwipeActions={(goal) => (
            <DeleteAction item={goal} onDeleteItem={onDeleteGoal} />
          )}
        />
      </div>
      <SlideDialog
        open={isAddGoalOpen}
        onClose={onCloseGoalDetails}
        component={<EditGoal saveGoal={saveGoal} selectedGoal={selectedGoal} />}
        title={selectedGoal ? 'Edit Goal' : 'Add Goal'}
        onSave={() => {}}
        type='full'
      />
    </>
  )
}
