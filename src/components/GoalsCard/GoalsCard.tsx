import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import { EditGoal } from '../EditGoal/EditGoal'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import { getDateFromISO } from '../../services/util.service'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import AddIcon from '@mui/icons-material/Add'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { Goal } from '../../types/goal/Goal'
import { Checkbox } from '@mui/material'

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

  const saveGoal = (goal: Goal) => {
    console.log('saveGoal', goal)
  }

  const onAddGoal = () => {
    setSelectedGoal(null)
    openModal()
  }

  const onSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal)
    openModal()
  }

  const onActivateGoal = (goal: Goal) => {
    console.log('onActivateGoal', goal)
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
                onActivateGoal(goal)
              }}
            />
          )}
          onItemClick={onSelectGoal}
          className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
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
