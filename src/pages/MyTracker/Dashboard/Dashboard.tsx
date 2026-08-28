import { useEffect, useMemo, useState } from 'react'
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
import { getDateFromISO } from '../../../services/util.service'
import { CircularProgress, Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import {
  setActiveRoute,
  setSlideDirection,
} from '../../../store/actions/system.actions'
import { WorkoutSession } from '../../../components/WorkoutSession/WorkoutSession'
import { showErrorMsg } from '../../../services/event-bus.service'
import {
  handleSessionDayChange,
  setSelectedSessionDay,
  setTodaySessionDay,
} from '../../../store/actions/workout.action'
import { useWindowDimentions } from '../../../hooks/useWindowDimentions'
import { CustomIcon } from '../../../CustomMui/CustomIcon/CustomIcon'
import { getPercentage } from '../../../services/util.service'
import { MealCard } from '../../../components/MealCard/MealCard'
import { getMeals } from '../../../assets/config/meals'
import { useCurrMealPeriod } from '../../../hooks/useCurrMealPeriod'
import { HealthStats } from '../../../components/HealthStats/HealthStats'
import { NativeOnly } from '../../../components/NativeOnly/NativeOnly'
import { HealthConnect } from '../../../components/HealthConnect/HealthConnect'
import { healthService } from '../../../services/health/health.service'
import { setHealthData } from '../../../store/actions/health.actions'
import { PullToRefreshWrapper } from '../../../components/PullToRefreshWrapper/PullToRefreshWrapper'

// const CHECK_INTERVAL = 1000 * 60 * 10 // 10 minutes

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

  const menu = useSelector((state: RootState) => state.userModule.menu)

  const meals = getMeals(t)

  const { width } = useWindowDimentions()
  const currMealPeriod = useCurrMealPeriod()

  const todaySessionDay = useSelector(
    (state: RootState) => state.workoutModule.todaySessionDay
  )

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
  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const isDashboard = useSelector(
    (state: RootState) => state.systemModule.isDashboard
  )

  const [macros, setMacros] = useState({
    protein: { percentage: 0, gram: 0, current: 0 },
    carbs: { percentage: 0, gram: 0, current: 0 },
    fats: { percentage: 0, gram: 0, current: 0 },
  })

  const [userToCheck, setUserToCheck] = useState(traineeUser || user)

  const [calories, setCalories] = useState(
    userToCheck?.loggedToday?.calories || 0
  )
  const [isSessionLoading, setIsSessionLoading] = useState(
    Boolean(traineeUser || user)
  )
  const [hasSessionError, setHasSessionError] = useState(false)
  const [shouldLoadAgainSession, setShouldLoadAgainSession] = useState(false)

  const showStatsCarousel = useMemo(() => {
    return width < 1100
  }, [width])

  const statsCarouselItems = useMemo(() => {
    if (!userToCheck) return []

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
  }, [userToCheck?._id, calories, macros, currMealPeriod, menu])
  useEffect(() => {
    if (!userToCheck) return
    updateSessionDay()
  }, [userToCheck?._id])
  useEffect(() => {
    if (!userToCheck) return
    setSelectedDiaryDay(userToCheck.loggedToday)
  }, [userToCheck])

  useEffect(() => {
    setUserToCheck(traineeUser || user)
  }, [user, traineeUser])

  useEffect(() => {
    if (!userToCheck) return

    // const interval = setInterval(checkDiaryDayChange, CHECK_INTERVAL)
    // return () => clearInterval(interval)
  }, [userToCheck])

  useEffect(() => {
    if (!userToCheck) return

    checkDiaryDayChange()
  }, [userToCheck])

  useEffect(() => {
    if (userToCheck?.isFixedMenu) {
      try {
        loadMenus(userToCheck._id)
      } catch {
        showErrorMsg(t('messages.error.getMenus'))
      }
    }
  }, [userToCheck])

  useEffect(() => {
    if (!userToCheck || !userToCheck?.loggedToday?.date) return

    const protein = userToCheck?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.protein,
      0
    )
    const carbs = userToCheck?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.carbs,
      0
    )
    const fats = userToCheck?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.fat,
      0
    )
    const macrosToSet = {
      protein: {
        percentage: getPercentage(
          protein,
          userToCheck?.currGoal?.macros.protein
        ),
        gram: userToCheck?.currGoal?.macros.protein,
        current: protein,
      },
      carbs: {
        percentage: getPercentage(carbs, userToCheck?.currGoal?.macros.carbs),
        gram: userToCheck?.currGoal?.macros.carbs,
        current: carbs,
      },
      fats: {
        percentage: getPercentage(fats, userToCheck?.currGoal?.macros.fat),
        gram: userToCheck?.currGoal?.macros.fat,
        current: fats,
      },
    }
    setMacros(macrosToSet)
  }, [userToCheck])

  useEffect(() => {
    const caloriesToSet = userToCheck?.loggedToday?.calories
    if (!caloriesToSet && caloriesToSet !== 0) return
    const newCalories = caloriesToSet
    setCalories(newCalories)
  }, [userToCheck?.loggedToday?.calories, userToCheck?._id, traineeUser?._id])

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

  function renderHealthSection() {
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
              className='bold-header'
            >
              {t('dashboard.workoutSession')}
            </Typography>
          </div>
          <WorkoutSession
            sessionDay={sessionDay}
            updateSessionDay={updateSessionDay}
          />
        </div>
      )
    }

    if (isSessionLoading && !showRetry) {
      return (
        <div className='dashboard-session-container'>
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
        {/* <Typography variant="h5" className="bold-header">Dashboard</Typography> */}
        {showStatsCarousel ? (
          <StatsCarousel
            items={statsCarouselItems}
            showSkeleton={!user}
          />
        ) : (
          <div className='dashboard-items-container'>
            {statsCarouselItems.map((item) => item)}
          </div>
        )}
        {renderHealthSection()}
        {renderNoSession()}
        {/* <CustomAccordion title="Workout Session" cmp={renderSession()} /> */}
        {renderSession()}
      </div>
    </PullToRefreshWrapper>
  )
}
