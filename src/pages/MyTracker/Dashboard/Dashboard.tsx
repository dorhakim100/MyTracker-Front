import { lazy, memo, Suspense, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { TimesContainer } from '../../../components/TimesContainer/TimesContainer'
import { StatsCarousel } from '../../../components/StatsCarousel/StatsCarousel'

import { CaloriesProgress } from '../../../components/CaloriesProgress/CaloriesProgress'
import { MacrosDistribution } from '../../../components/MacrosDistribution/MacrosDistribution'
import { MacrosProgress } from '../../../components/MacrosProgress/MacrosProgress'
import {
  handleDiaryDayChange,
  loadMenus,
  // logout,
  // setRemembered,
  setSelectedDiaryDay,
} from '../../../store/actions/user.actions'
import { getDateFromISO, getPercentage } from '../../../services/util.service'
import { CircularProgress, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import {
  setActiveRoute,
  setSlideDirection,
} from '../../../store/actions/system.actions'
import { showErrorMsg } from '../../../services/event-bus.service'
import {
  handleSessionDayChange,
  setSelectedSessionDay,
  setTodaySessionDay,
} from '../../../store/actions/workout.action'
import { useWindowDimentions } from '../../../hooks/useWindowDimentions'
import { CustomIcon } from '../../../CustomMui/CustomIcon/CustomIcon'
import { MealCard } from '../../../components/MealCard/MealCard'
import { getMeals } from '../../../assets/config/meals'
import { useCurrMealPeriod } from '../../../hooks/useCurrMealPeriod'
import { HealthStats } from '../../../components/HealthStats/HealthStats'
import { NativeOnly } from '../../../components/NativeOnly/NativeOnly'
import { HealthConnect } from '../../../components/HealthConnect/HealthConnect'
import { healthService } from '../../../services/health/health.service'
import { setHealthData } from '../../../store/actions/health.actions'
import { PullToRefreshWrapper } from '../../../components/PullToRefreshWrapper/PullToRefreshWrapper'

const WorkoutSession = lazy(() =>
  import('../../../components/WorkoutSession/WorkoutSession').then(
    (module) => ({
      default: module.WorkoutSession,
    })
  )
)

const DashboardNutrition = memo(function DashboardNutrition() {
  const { t } = useTranslation()
  const user = useSelector((state: RootState) => state.userModule.user)
  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )
  const menu = useSelector((state: RootState) => state.userModule.menu)
  const userToCheck = traineeUser || user
  const { width } = useWindowDimentions()
  const currMealPeriod = useCurrMealPeriod()
  const showStatsCarousel = width < 1100

  const calories = userToCheck?.loggedToday?.calories ?? 0

  const macros = useMemo(() => {
    const logs = userToCheck?.loggedToday?.logs ?? []
    let protein = 0
    let carbs = 0
    let fats = 0

    for (const log of logs) {
      protein += log.macros.protein
      carbs += log.macros.carbs
      fats += log.macros.fat
    }

    const proteinGoal = userToCheck?.currGoal?.macros.protein ?? 0
    const carbsGoal = userToCheck?.currGoal?.macros.carbs ?? 0
    const fatsGoal = userToCheck?.currGoal?.macros.fat ?? 0

    return {
      protein: {
        percentage: getPercentage(protein, proteinGoal),
        gram: proteinGoal,
        current: protein,
      },
      carbs: {
        percentage: getPercentage(carbs, carbsGoal),
        gram: carbsGoal,
        current: carbs,
      },
      fats: {
        percentage: getPercentage(fats, fatsGoal),
        gram: fatsGoal,
        current: fats,
      },
    }
  }, [userToCheck])

  const statsCarouselItems = useMemo(() => {
    if (!userToCheck) return []

    const meals = getMeals(t)

    if (userToCheck.isFixedMenu) {
      const currLogs = menu?.menuLogs.filter(
        (log) => log.meal?.toLowerCase() === currMealPeriod.toLowerCase()
      )
      const caloriesToSet =
        currLogs?.reduce((acc, log) => acc + log.macros.calories, 0) || 0

      const meal = meals.find((meal) => meal.period === currMealPeriod)

      if (!meal)
        return [
          <MacrosDistribution
            key='macros-distribution'
            protein={macros.protein.gram}
            carbs={macros.carbs.gram}
            fats={macros.fats.gram}
            currentProtein={macros.protein.current}
            currentCarbs={macros.carbs.current}
            currentFats={macros.fats.current}
            currentCalories={calories}
            goalCalories={userToCheck.currGoal?.dailyCalories}
          />,
        ]
      return [
        <MealCard
          key='meal-card'
          meal={meal}
          caloriesToSet={caloriesToSet}
          showEmptyCardAddButton={false}
          isAddButton={false}
          logsToShow={[]}
          logsSource='menu'
          noEdit={true}
          className='card'
        />,
        <MacrosDistribution
          key='macros-distribution'
          protein={macros.protein.gram}
          carbs={macros.carbs.gram}
          fats={macros.fats.gram}
          currentProtein={macros.protein.current}
          currentCarbs={macros.carbs.current}
          currentFats={macros.fats.current}
          currentCalories={calories}
          goalCalories={userToCheck.currGoal?.dailyCalories}
        />,
      ]
    }

    return [
      <CaloriesProgress
        key='calories'
        percentageValue={calories / userToCheck.currGoal?.dailyCalories}
        current={calories}
        goal={userToCheck.currGoal?.dailyCalories}
      />,
      <MacrosDistribution
        key='macros-distribution'
        protein={macros.protein.gram}
        carbs={macros.carbs.gram}
        fats={macros.fats.gram}
        currentProtein={macros.protein.current}
        currentCarbs={macros.carbs.current}
        currentFats={macros.fats.current}
        currentCalories={calories}
        goalCalories={userToCheck.currGoal?.dailyCalories}
      />,
      <MacrosProgress
        key='macros-progress'
        protein={macros.protein}
        carbs={macros.carbs}
        fats={macros.fats}
      />,
    ]
  }, [userToCheck, calories, macros, currMealPeriod, menu, t])

  return showStatsCarousel ? (
    <StatsCarousel
      items={statsCarouselItems}
      showSkeleton={!user}
      // deferInactiveSlides
    />
  ) : (
    <div className='dashboard-items-container'>
      {statsCarouselItems.map((item) => item)}
    </div>
  )
})

const DashboardHealth = memo(() => {
  const steps = useSelector((state: RootState) => state.healthModule.steps)
  const burnedCalories = useSelector(
    (state: RootState) => state.healthModule.burnedCalories
  )
  const distance = useSelector(
    (state: RootState) => state.healthModule.distance
  )
  const flightsClimbed = useSelector(
    (state: RootState) => state.healthModule.flightsClimbed
  )
  const googleHealthConnected = useSelector(
    (state: RootState) => state.healthModule.googleHealthConnected
  )
  const usesGoogleHealth = healthService.isGoogleHealthPlatform()

  if (usesGoogleHealth) {
    if (!googleHealthConnected) {
      return <HealthConnect />
    }

    return (
      <HealthStats
        steps={steps || 0}
        burnedCalories={burnedCalories || 0}
        distance={distance || 0}
        flightsClimbed={flightsClimbed || 0}
      />
    )
  }

  return (
    <NativeOnly>
      <HealthStats
        steps={steps || 0}
        burnedCalories={burnedCalories || 0}
        distance={distance || 0}
        flightsClimbed={flightsClimbed || 0}
      />
    </NativeOnly>
  )
})

function SessionSpinner() {
  const { t } = useTranslation()
  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  return (
    <div
      className={`session-retry-container loading subtle-bg ${
        prefs.isDarkMode ? 'dark-mode' : ''
      }`}
    >
      <CircularProgress
        size={28}
        className={prefs.favoriteColor}
        aria-label={t('common.loading')}
      />
    </div>
  )
}

export function Dashboard() {
  const { t } = useTranslation()

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)
  const user = useSelector((state: RootState) => state.userModule.user)
  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )
  const sessionDay = useSelector(
    (state: RootState) => state.workoutModule.sessionDay
  )
  const todaySessionDay = useSelector(
    (state: RootState) => state.workoutModule.todaySessionDay
  )
  const timer = useSelector((state: RootState) => state.workoutModule.timer)
  const isDashboard = useSelector(
    (state: RootState) => state.systemModule.isDashboard
  )

  const [userToCheck, setUserToCheck] = useState(traineeUser || user)
  const [isSessionLoading, setIsSessionLoading] = useState(
    Boolean(traineeUser || user)
  )
  const [hasSessionError, setHasSessionError] = useState(false)
  const [shouldLoadAgainSession, setShouldLoadAgainSession] = useState(false)

  useEffect(() => {
    if (!userToCheck?._id) return
    updateSessionDay()
  }, [userToCheck?._id])

  useEffect(() => {
    if (!userToCheck?.loggedToday) return
    setSelectedDiaryDay(userToCheck.loggedToday)
  }, [userToCheck?.loggedToday])

  useEffect(() => {
    setUserToCheck(traineeUser || user)
  }, [user, traineeUser])

  useEffect(() => {
    if (!userToCheck?._id) return
    checkDiaryDayChange()
  }, [userToCheck?._id, userToCheck?.loggedToday?.date])

  useEffect(() => {
    if (!userToCheck?.isFixedMenu || !userToCheck._id) return

    try {
      loadMenus(userToCheck._id)
    } catch {
      showErrorMsg(t('messages.error.getMenus'))
    }
  }, [userToCheck?._id, userToCheck?.isFixedMenu])

  useEffect(() => {
    if (!todaySessionDay) return

    setSelectedSessionDay(todaySessionDay)
  }, [userToCheck, todaySessionDay])

  useEffect(() => {
    const isIncompleteSession = Boolean(
      sessionDay && sessionDay.workout && !sessionDay.instructions
    )
    if (!(hasSessionError || isIncompleteSession)) return
    setShouldLoadAgainSession(true)
  }, [hasSessionError, sessionDay])

  async function checkDiaryDayChange() {
    if (!userToCheck) return
    const dateToCheck = getDateFromISO(new Date().toISOString())
    await handleDiaryDayChange(dateToCheck, userToCheck)
  }

  async function updateSessionDay() {
    try {
      if (!userToCheck) {
        setIsSessionLoading(false)
        return
      }
      setIsSessionLoading(true)
      const day = await handleSessionDayChange(
        getDateFromISO(new Date().toISOString()),
        userToCheck
      )

      setTodaySessionDay(day)
      setHasSessionError(false)
    } catch (err) {
      console.log(err)
      setHasSessionError(true)
      showErrorMsg(t('messages.error.getSessionDay'))
      // await logout(false)
      // setRemembered()
    } finally {
      setIsSessionLoading(false)
    }
  }

  async function handleRefreshHealthData() {
    try {
      await setHealthData()
      if (shouldLoadAgainSession) {
        setShouldLoadAgainSession(false)
        await updateSessionDay()
      }
    } catch {
      showErrorMsg(t('messages.error.refreshHealthData'))
    }
  }

  const renderNoSession = () => {
    if (isSessionLoading || hasSessionError) return
    if (!todaySessionDay?.workout)
      return (
        <div
          className={`no-session-panel subtle-bg ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${isDashboard ? 'dashboard' : ''}`}
          role='status'
        >
          <CustomIcon
            name='workout'
            size='xl'
            variant='medium'
          />
          <Typography
            variant='h6'
            className='bold-header'
          >
            {t('dashboard.noWorkoutToday')}
          </Typography>
          <Typography
            variant='body2'
            className='no-session-hint'
          >
            {t('dashboard.noWorkoutTodayHint')}
          </Typography>
          {/* <div
            className={`animation-container ${isDashboard ? 'dashboard' : ''}`}
          >
            <Lottie
              animationData={workoutAnimation}
              loop={true}
            />
          </div> */}
          {!isDashboard && (
            <CustomButton
              text={t('dashboard.chooseWorkout')}
              icon={<PlayArrowIcon />}
              onClick={() => {
                setSlideDirection(1)
                setActiveRoute('/lift-mate/workouts')
              }}
              isIconReverse={prefs.lang === 'he'}
              fullWidth={true}
            />
          )}
        </div>
      )
  }

  const renderSession = () => {
    const hasUsableSession = Boolean(
      sessionDay && sessionDay?.workout && sessionDay.instructions
    )
    const isIncompleteSession = Boolean(
      sessionDay && sessionDay?.workout && !sessionDay.instructions
    )
    const showRetry = hasSessionError || isIncompleteSession

    if (hasUsableSession && sessionDay) {
      return (
        <div className='dashboard-session-container'>
          <div className='header-container'>
            <CustomIcon
              name='workout'
              size='l'
              variant='medium'
            />
            <Typography
              variant='h5'
              className='bold-header dashboard-session-title'
            >
              {t('dashboard.workoutSession')}
            </Typography>
          </div>
          <Suspense fallback={<SessionSpinner />}>
            <WorkoutSession
              sessionDay={sessionDay}
              updateSessionDay={updateSessionDay}
            />
          </Suspense>
        </div>
      )
    }

    if (isSessionLoading && !showRetry) {
      return (
        <div className='dashboard-session-container'>
          <SessionSpinner />
        </div>
      )
    }

    if (!showRetry) return

    return (
      <div className='dashboard-session-container'>
        <div
          className={`session-retry-container subtle-bg ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } ${prefs.favoriteColor}`}
          role='status'
          aria-live='polite'
        >
          <div
            className='session-retry-indicator'
            aria-hidden='true'
          >
            <ReplayIcon />
          </div>
          <Typography
            variant='body1'
            className='session-retry-message'
          >
            {t('dashboard.sessionLoadFailed')}
          </Typography>
          <CustomButton
            text={t('common.tryAgain')}
            icon={
              isSessionLoading ? (
                <CircularProgress
                  size={20}
                  color='inherit'
                />
              ) : (
                <ReplayIcon />
              )
            }
            onClick={updateSessionDay}
            disabled={isSessionLoading}
            isIconReverse={prefs.lang === 'he'}
          />
        </div>
      </div>
    )
  }

  return (
    <PullToRefreshWrapper
      onRefresh={handleRefreshHealthData}
      className={`'dashboard-container' ${isDashboard ? 'page-container' : ''}`}
      //  className={`page-container dashboard-container ${
      //     timer ? 'has-timer' : ''
      //   } ${isDashboard ? 'dashboard' : ''}`}
    >
      <div
        className={`page ${timer ? 'has-timer' : ''} ${
          isDashboard ? 'dashboard' : ''
        }`}
      >
        {!isDashboard && (
          <TimesContainer
            className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
              prefs.favoriteColor
            }`}
          />
        )}
        {isDashboard && (
          <Typography
            variant='h4'
            className='bold-header'
          >
            {t('dashboard.title')}
          </Typography>
        )}
        <DashboardNutrition />
        <DashboardHealth />
        {renderNoSession()}
        {renderSession()}
      </div>
    </PullToRefreshWrapper>
  )
}
