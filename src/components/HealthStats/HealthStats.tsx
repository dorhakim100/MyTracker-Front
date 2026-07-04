import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { useTranslation } from 'react-i18next'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { getFixedNumber } from '../../services/util.service'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SpeedIcon from '@mui/icons-material/Speed'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
export interface HealthStatsProps {
  steps: number
  burnedCalories: number
  /** When set, shows current / goal like other banners. */
  stepsGoal?: number
  burnedCaloriesGoal?: number
  className?: string
  distance: number
  flightsClimbed: number
}

export function HealthStats({
  steps,
  burnedCalories,
  distance,
  flightsClimbed,
  className,
}: HealthStatsProps) {
  const { t } = useTranslation()

  const healthLoading = useSelector(
    (state: RootState) => state.healthModule.healthLoading
  )

  // steps = 21435.151
  // burnedCalories = 1252.123
  // distance = 12.52
  // heartRate = 60
  steps = getFixedNumber(steps)

  burnedCalories = getFixedNumber(burnedCalories)
  flightsClimbed = getFixedNumber(flightsClimbed)
  distance = getFixedNumber(distance, 2)

  return (
    <div className={`health-stats-container ${className ?? ''}`.trim()}>
      <GoalBanner
        current={steps}
        isGoal={false}
        icon={<DirectionsRunIcon />}
        afterValue={t('steps.steps')}
        loading={healthLoading}
      />
      <GoalBanner
        current={burnedCalories}
        isGoal={false}
        icon={<LocalFireDepartmentIcon />}
        afterValue={t('macros.kcal')}
        loading={healthLoading}
      />
      <GoalBanner
        current={distance}
        isGoal={false}
        icon={<SpeedIcon />}
        afterValue={t('distance.km')}
        loading={healthLoading}
      />
      <GoalBanner
        current={flightsClimbed}
        isGoal={false}
        icon={<TrendingUpIcon />}
        afterValue={t('floors.floors')}
        loading={healthLoading}
      />
    </div>
  )
}
