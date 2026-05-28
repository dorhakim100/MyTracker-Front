import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

import { CustomLinearProgress } from '../../CustomMui/CustomLinearProgress/CustomLinearProgress'
import { Divider } from '@mui/material'

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
  const { t } = useTranslation()
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  if (user)
    return (
      <div className='linear-macros-progress'>
        {caloriesProgress !== undefined && (
          <CustomLinearProgress
            currentValue={caloriesProgress + ''}
            goalValue={user?.currGoal?.dailyCalories + ''}
            value={(caloriesProgress / user?.currGoal?.dailyCalories) * 100}
            header={t('macros.calories')}
            color={caloriesColor}
          />
        )}
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {proteinProgress !== undefined && (
          <CustomLinearProgress
            currentValue={proteinProgress + ''}
            goalValue={user?.currGoal?.macros.protein + ''}
            value={(proteinProgress / user.currGoal.macros.protein) * 100}
            header={t('macros.protein')}
            color={proteinColor}
            isGram={true}
          />
        )}
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {carbsProgress !== undefined && (
          <CustomLinearProgress
            currentValue={carbsProgress + ''}
            goalValue={user?.currGoal?.macros.carbs + ''}
            value={(carbsProgress / user?.currGoal?.macros.carbs) * 100}
            header={t('macros.carbs')}
            color={carbsColor}
            isGram={true}
          />
        )}
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {fatsProgress !== undefined && (
          <CustomLinearProgress
            currentValue={fatsProgress + ''}
            goalValue={user?.currGoal?.macros.fat + ''}
            value={(fatsProgress / user?.currGoal?.macros.fat) * 100}
            header={t('macros.fats')}
            color={fatsColor}
            isGram={true}
          />
        )}
      </div>
    )
}
