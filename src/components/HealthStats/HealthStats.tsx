
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import { useTranslation } from 'react-i18next'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { formatNumberWithCommas, getFixedNumber } from '../../services/util.service'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
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

export function HealthStats({ steps,  burnedCalories,  distance, flightsClimbed, className }: HealthStatsProps) {
  const { t } = useTranslation()

  // steps = 21435.151
  // burnedCalories = 1252.123
  // distance = 12.52
  // heartRate = 60
  steps = getFixedNumber(steps)

  burnedCalories = getFixedNumber(burnedCalories)
  flightsClimbed = getFixedNumber(flightsClimbed)
  distance = getFixedNumber(distance, 1)


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
        <GoalBanner
          // current={steps}
          current={distance}
          isGoal={false}
          icon={<SpeedIcon />}
          afterValue={t('distance.km')}

        />
        <GoalBanner
          // current={steps}
          current={flightsClimbed}

          isGoal={false}
          icon={<TrendingUpIcon />}
          afterValue={t('floors.floors')}

        />
    </div>
  )
}
