
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { useTranslation } from 'react-i18next'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { formatNumberWithCommas } from '../../services/util.service'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'


export interface HealthStatsProps {
  steps: number
  burnedCalories: number
  /** When set, shows current / goal like other banners. */
  stepsGoal?: number
  burnedCaloriesGoal?: number
  className?: string
}

export function HealthStats({ steps,  burnedCalories,  className }: HealthStatsProps) {
  const { t } = useTranslation()

  const formattedSteps = formatNumberWithCommas(steps)
  const formattedBurnedCalories = formatNumberWithCommas(burnedCalories)

  return (
    <div className={`health-stats-container ${className ?? ''}`.trim()}>

      <GoalBanner
        // current={steps}
        current={formattedSteps}
        isGoal={false}
        icon={<DirectionsRunIcon />}
        afterValue={t('steps.steps')}

      />
      <GoalBanner
        // current={steps}
        current={formattedBurnedCalories}
        isGoal={false}
        icon={<LocalFireDepartmentIcon />}
        afterValue={t('macros.kcal')}

      />
    </div>
  )
}
