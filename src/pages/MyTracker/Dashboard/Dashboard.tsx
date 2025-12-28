import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
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
import { setSlideDirection } from '../../../store/actions/system.actions'
import { WorkoutSession } from '../../../components/WorkoutSession/WorkoutSession'
import { showErrorMsg } from '../../../services/event-bus.service'
import {
  handleSessionDayChange,
  setSelectedSessionDay,
  setTodaySessionDay,
} from '../../../store/actions/workout.action'
import { messages } from '../../../assets/config/messages'
import Lottie from 'lottie-react'
import workoutAnimation from '../../../../public/gain-weight.json'

const CHECK_INTERVAL = 1000 * 60 // minute

export function Dashboard() {
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

  const navigate = useNavigate()

  const [macros, setMacros] = useState({
    protein: { percentage: 0, gram: 0 },
    carbs: { percentage: 0, gram: 0 },
    fats: { percentage: 0, gram: 0 },
  })

  const [calories, setCalories] = useState(user?.loggedToday?.calories || 0)

  const statsCarouselItems = useMemo(() => {
    if (!user) return []

    return [
      <CaloriesProgress
        key="calories"
        percentageValue={calories / user.currGoal?.dailyCalories}
        current={calories}
        goal={user.currGoal?.dailyCalories}
      />,
      <MacrosProgress
        key="macros-progress"
        protein={macros.protein}
        carbs={macros.carbs}
        fats={macros.fats}
      />,
      <MacrosDistribution
        key="macros-distribution"
        protein={macros.protein.gram}
        carbs={macros.carbs.gram}
        fats={macros.fats.gram}
      />,
    ]
  }, [user, calories, macros])
  useEffect(() => {
    updateSessionDay()
  }, [user, traineeUser])
  useEffect(() => {
    if (!user) return
    setSelectedDiaryDay(user.loggedToday)
  }, [user])

  useEffect(() => {
    if (!user) return

    const interval = setInterval(checkDiaryDayChange, CHECK_INTERVAL)
    return () => clearInterval(interval)
  }, [user])

  useEffect(() => {
    checkDiaryDayChange()
  }, [user])

  useEffect(() => {
    if (!user || !user?.loggedToday) return

    const protein = user?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.protein,
      0
    )
    const carbs = user?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.carbs,
      0
    )
    const fats = user?.loggedToday?.logs.reduce(
      (acc, log) => acc + log.macros.fat,
      0
    )
    const macrosToSet = {
      protein: {
        percentage: getPercentage(protein, user?.currGoal?.macros.protein),
        gram: user?.currGoal?.macros.protein,
      },
      carbs: {
        percentage: getPercentage(carbs, user?.currGoal?.macros.carbs),
        gram: user?.currGoal?.macros.carbs,
      },
      fats: {
        percentage: getPercentage(fats, user?.currGoal?.macros.fat),
        gram: user?.currGoal?.macros.fat,
      },
    }
    setMacros(macrosToSet)
  }, [user])

  useEffect(() => {
    const caloriesToSet = user?.loggedToday?.calories
    if (!caloriesToSet && caloriesToSet !== 0) return
    const newCalories = caloriesToSet
    setCalories(newCalories)
  }, [user?.loggedToday?.calories])

  useEffect(() => {
    if (!todaySessionDay) return

    setSelectedSessionDay(todaySessionDay)
  }, [user, traineeUser, todaySessionDay])

  function getPercentage(value: number, goal: number) {
    return (value / goal) * 100
  }

  function checkDiaryDayChange() {
    if (!user) return
    const dateToCheck = getDateFromISO(new Date().toISOString())
    handleDiaryDayChange(dateToCheck, user)
  }

  async function updateSessionDay() {
    try {
      if (!user) return
      const day = await handleSessionDayChange(
        getDateFromISO(new Date().toISOString()),
        traineeUser || user
      )
      console.log('day', day)

      setTodaySessionDay(day)
    } catch (err) {
      console.log(err)

      showErrorMsg(messages.error.getSessionDay)
    }
  }
  const renderNoSession = () => {
    if (!todaySessionDay?.workout)
      return (
        <div className="no-session-container">
          <Typography variant="h6" className="bold-header">
            No workout today
          </Typography>
          <div className="animation-container">
            <Lottie animationData={workoutAnimation} loop={true} />
          </div>
          <CustomButton
            text="Choose Workout"
            icon={<PlayArrowIcon />}
            onClick={() => {
              setSlideDirection(1)
              navigate('/lift-mate/workouts')
            }}
            // fullWidth
          />
        </div>
      )
  }

  const renderSession = () => {
    if (sessionDay?.workout)
      return (
        <div className="dashboard-session-container">
          <Typography variant="h5" className="bold-header">
            Workout Session
          </Typography>

          <WorkoutSession
            sessionDay={sessionDay}
            onExerciseInfoClick={() => {}}
            updateSessionDay={updateSessionDay}
          />
        </div>
      )
  }

  return (
    <div
      className={`page-container dashboard-container ${
        timer ? 'has-timer' : ''
      }`}
    >
      <TimesContainer
        className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${
          prefs.favoriteColor
        }`}
      />
      <StatsCarousel items={statsCarouselItems} showSkeleton={!user} />

      {renderNoSession()}
      {/* <CustomAccordion title="Workout Session" cmp={renderSession()} /> */}
      {renderSession()}
    </div>
  )
}
