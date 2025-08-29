import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { CustomLinearProgress } from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'
import { getPercentageValue } from '../../services/macros/macros.service'

const caloriesColor = 'var(--primary-color)'

const proteinColor = 'var(--macro-protein)'
const carbsColor = 'var(--macro-carbs)'
const fatsColor = 'var(--macro-fats)'

interface LinearMacrosProgressProps {
  caloriesProgress?: number
  proteinProgress?: number
  carbsProgress?: number
  fatsProgress?: number
}

export function LinearMacrosProgress({
  caloriesProgress,
  proteinProgress,
  carbsProgress,
  fatsProgress,
}: LinearMacrosProgressProps) {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  if (user)
    return (
      <div className='linear-macros-progress'>
        {caloriesProgress && (
          <CustomLinearProgress
            currentValue={caloriesProgress + ''}
            goalValue={user?.currGoal?.dailyCalories + ''}
            value={getPercentageValue('calories', user)}
            header='Calories'
            color={caloriesColor}
          />
        )}
        {proteinProgress && (
          <CustomLinearProgress
            currentValue={proteinProgress + ''}
            goalValue={user?.currGoal?.macros.protein + ''}
            value={getPercentageValue('protein', user)}
            header='Protein'
            color={proteinColor}
            isGram={true}
          />
        )}
        {carbsProgress && (
          <CustomLinearProgress
            currentValue={carbsProgress + ''}
            goalValue={user?.currGoal?.macros.carbs + ''}
            value={getPercentageValue('carbs', user)}
            header='Carbs'
            color={carbsColor}
            isGram={true}
          />
        )}
        {fatsProgress && (
          <CustomLinearProgress
            currentValue={fatsProgress + ''}
            goalValue={user?.currGoal?.macros.fat + ''}
            value={getPercentageValue('fat', user)}
            header='Fats'
            color={fatsColor}
            isGram={true}
          />
        )}
      </div>
    )
}
