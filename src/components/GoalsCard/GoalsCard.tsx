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
              protein={goal.macros?.protein}
              carbs={goal.macros?.carbs}
              fats={goal.macros?.fat}
            />
          )}
          renderSecondaryText={(goal) =>
            `${DEFAULT_GOAL_TITLE} - ${goal.dailyCalories} kcal`
          }
          renderRight={(goal) => (
            <ListItemIcon>
              <Typography variant='body2'>
                {getDateFromISO(new Date().toISOString())}
              </Typography>
            </ListItemIcon>
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
