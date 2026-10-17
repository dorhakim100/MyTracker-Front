import { useTranslation } from 'react-i18next'
import { GoalBanner } from '../GoalBanner/GoalBanner'
import { getFixedNumber } from '../../services/util.service'
import { FillProgress } from '../../CustomMui/FillProgress/FillProgress'
import { useCrossedGoal } from '../../hooks/useCrossedGoal'
import { DEFAULT_DAILY_STEPS_GOAL } from '../../constants/steps-goal.constants'
import {
  BurnedCaloriesGlyph,
  DistanceGlyph,
  FloorsGlyph,
  StepsGlyph,
} from '../../CustomMui/CustomIcon/glyphs'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'
import { useEffect, useState } from 'react'

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
  stepsGoal,
  distance,
  flightsClimbed,
  className,
}: HealthStatsProps) {
  const { t } = useTranslation()

  const healthLoading = useSelector(
    (state: RootState) => state.healthModule.healthLoading
  )

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const user = useSelector((state: RootState) => state.userModule.user)
  const dailyStepsGoal = useSelector(
    (state: RootState) => state.userModule.user?.details?.dailyStepsGoal
  )
  steps = getFixedNumber(steps)

  burnedCalories = getFixedNumber(burnedCalories)
  flightsClimbed = getFixedNumber(flightsClimbed)
  distance = getFixedNumber(distance, 2)

  const [caloriesGoal, setCaloriesGoal] = useState(burnedCalories)

  const isDashboard = useSelector(
    (state: RootState) => state.systemModule.isDashboard
  )

  // steps = 21435.151
  // burnedCalories = 1252.123
  // distance = 12.52
  // heartRate = 60

  useEffect(() => {
    if (!user || !user?.currGoal) return

    const targetGoal = user?.currGoal.target

    console.log('targetGoal', targetGoal)

    let diff = 0

    switch (targetGoal) {
      case 'lose':
        diff = 500
        break
      case 'gain':
        diff = -500

        break
    }

    setCaloriesGoal(user?.currGoal?.dailyCalories + diff)
  }, [user?.currGoal])

  const stepsGoalValue = stepsGoal ?? dailyStepsGoal ?? DEFAULT_DAILY_STEPS_GOAL
  const stepsPercent = stepsGoalValue > 0 ? (steps / stepsGoalValue) * 100 : 0
  const stepsGoalHit = useCrossedGoal(stepsPercent)

  return (
    <div
      className={`health-stats-container ${isDashboard ? 'dashboard' : ''} ${
        className ?? ''
      }`.trim()}
    >
      <FillProgress
        value={stepsPercent}
        className={`steps-fill${stepsGoalHit ? ' goal-hit' : ''}`}
        position='bottom'
        display={!healthLoading}
        color={prefs.favoriteColor}
      >
        <div className='steps-stat'>
          <GoalBanner
            current={steps}
            isGoal={false}
            icon={<StepsGlyph size='m' />}
            afterValue={t('steps.steps')}
            loading={healthLoading}
            size='l'
            animateCurrent
          />
        </div>
      </FillProgress>
      <FillProgress
        value={(burnedCalories / caloriesGoal) * 100}
        className={`calories-fill`}
        position='bottom'
        display={!healthLoading}
        color={prefs.favoriteColor}
      >
        <GoalBanner
          current={burnedCalories}
          isGoal={false}
          icon={<BurnedCaloriesGlyph size='m' />}
          afterValue={t('macros.kcal')}
          loading={healthLoading}
          size='l'
          animateCurrent
        />
      </FillProgress>
      <GoalBanner
        current={distance}
        isGoal={false}
        icon={<DistanceGlyph size='m' />}
        afterValue={t('distance.km')}
        loading={healthLoading}
        size='l'
        animateCurrent
      />
      <GoalBanner
        current={flightsClimbed}
        isGoal={false}
        icon={<FloorsGlyph size='m' />}
        afterValue={t('floors.floors')}
        loading={healthLoading}
        size='l'
        animateCurrent
      />
    </div>
  )
}
