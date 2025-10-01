import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { CustomList } from '../../CustomMui/CustomList/CustomList'
import { MacrosDonut } from '../MacrosDonut/MacrosDonut'
import ListItemIcon from '@mui/material/ListItemIcon'
import Typography from '@mui/material/Typography'
import { getDateFromISO } from '../../services/util.service'

const DEFAULT_GOAL_TITLE = 'Loss weight'

export function GoalsCard() {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  if (!user || !user.goals) return <div>GoalsCard</div>

  return (
    <div className='goals-card'>
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
        className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
      />
    </div>
  )
}
