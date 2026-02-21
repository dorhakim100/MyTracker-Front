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
  setSelectedDiaryDay,
} from '../../../store/actions/user.actions'
import { getDateFromISO } from '../../../services/util.service'
import { Typography } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
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
import Lottie from 'lottie-react'
import workoutAnimation from '../../../../public/gain-weight.json'
import { useWindowDimentions } from '../../../hooks/useWindowDimentions'

const CHECK_INTERVAL = 1000 * 60 // minute

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

  const { width } = useWindowDimentions()

  const todaySessionDay = useSelector(
    (state: RootState) => state.workoutModule.todaySessionDay
  )

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const isDashboard = useSelector(
    (state: RootState) => state.systemModule.isDashboard
  )

  const [macros, setMacros] = useState({
    protein: { percentage: 0, gram: 0 },
    carbs: { percentage: 0, gram: 0 },
    fats: { percentage: 0, gram: 0 },
  })

  const [userToCheck, setUserToCheck] = useState(traineeUser || user)

  const [calories, setCalories] = useState(
    userToCheck?.loggedToday?.calories || 0
  )

  const showStatsCarousel = useMemo(() => {
    return width < 1100
  }, [width])

  const statsCarouselItems = useMemo(() => {
    if (!userToCheck) return []

    return [
      <CaloriesProgress
        key='calories'
        percentageValue={calories / userToCheck.currGoal?.dailyCalories}
        current={calories}
        goal={userToCheck.currGoal?.dailyCalories}
      />,
      <MacrosProgress
        key='macros-progress'
        protein={macros.protein}
        carbs={macros.carbs}
        fats={macros.fats}
      />,
      <MacrosDistribution
        key='macros-distribution'
        protein={macros.protein.gram}
        carbs={macros.carbs.gram}
        fats={macros.fats.gram}
      />,
    ]
  }, [userToCheck?._id, calories, macros])
  useEffect(() => {
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

    const interval = setInterval(checkDiaryDayChange, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [userToCheck])

  useEffect(() => {
    if (!userToCheck) return

    checkDiaryDayChange()
  }, [userToCheck])

  useEffect(() => {
    if (!userToCheck || !userToCheck?.loggedToday.date) return

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
      },
      carbs: {
        percentage: getPercentage(carbs, userToCheck?.currGoal?.macros.carbs),
        gram: userToCheck?.currGoal?.macros.carbs,
      },
      fats: {
        percentage: getPercentage(fats, userToCheck?.currGoal?.macros.fat),
        gram: userToCheck?.currGoal?.macros.fat,
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

  function getPercentage(value: number, goal: number) {
    return (value / goal) * 100
  }

  async function checkDiaryDayChange() {
    if (!userToCheck) return
    const dateToCheck = getDateFromISO(new Date().toISOString())
    await handleDiaryDayChange(dateToCheck, userToCheck)
  }

  async function updateSessionDay() {
    try {
      if (!userToCheck) return
      const day = await handleSessionDayChange(
        getDateFromISO(new Date().toISOString()),
        userToCheck
      )

      setTodaySessionDay(day)
    } catch (err) {
      console.log(err)

      showErrorMsg(t('messages.error.getSessionDay'))
    }
  }
  const renderNoSession = () => {
    if (!todaySessionDay?.workout)
      return (
        <div className='no-session-container'>
          <Typography
            variant='h6'
            className='bold-header'
          >
            {t('dashboard.noWorkoutToday')}
          </Typography>
          <div
            className={`animation-container ${isDashboard ? 'dashboard' : ''}`}
          >
            <Lottie
              animationData={workoutAnimation}
              loop={true}
            />
          </div>
          {!isDashboard && (
            <CustomButton
              text={t('dashboard.chooseWorkout')}
              icon={<PlayArrowIcon />}
              onClick={() => {
                setSlideDirection(1)
                setActiveRoute('/lift-mate/workouts')
              }}
            />
          )}
        </div>
      )
  }

  const renderSession = () => {
    if (sessionDay?.workout)
      return (
        <div className='dashboard-session-container'>
          <Typography
            variant='h5'
            className='bold-header'
          >
            {t('dashboard.workoutSession')}
          </Typography>

          <WorkoutSession
            sessionDay={sessionDay}
            updateSessionDay={updateSessionDay}
          />
        </div>
      )
  }

  return (
    <div
      className={`page-container dashboard-container ${
        timer ? 'has-timer' : ''
      } ${isDashboard ? 'dashboard' : ''}`}
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

      {renderNoSession()}
      {/* <CustomAccordion title="Workout Session" cmp={renderSession()} /> */}
      {renderSession()}
    </div>
  )
}
