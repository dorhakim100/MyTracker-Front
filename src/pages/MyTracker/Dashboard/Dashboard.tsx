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
import { useWindowDimentions } from '../../../hooks/useWindowDimentions'

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

  const { width } = useWindowDimentions()

  const todaySessionDay = useSelector(
    (state: RootState) => state.workoutModule.todaySessionDay
  )

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const isDashboard = useSelector((state: RootState) => state.systemModule.isDashboard)

  const navigate = useNavigate()

  const [macros, setMacros] = useState({
    protein: { percentage: 0, gram: 0 },
    carbs: { percentage: 0, gram: 0 },
    fats: { percentage: 0, gram: 0 },
  })

  const [calories, setCalories] = useState(user?.loggedToday?.calories || 0)

  const userToCheck = useMemo(() => {
    return traineeUser || user
  }, [user, traineeUser])

  const showStatsCarousel = useMemo(() => {
    return width < 1100
  }, [width])

  const statsCarouselItems = useMemo(() => {
    if (!userToCheck) return []


    return [
      <CaloriesProgress
        key="calories"
        percentageValue={calories / userToCheck.currGoal?.dailyCalories}
        current={calories}
        goal={userToCheck.currGoal?.dailyCalories}
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
  }, [userToCheck, calories, macros])
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
    if (!user) return

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
        percentage: getPercentage(protein, userToCheck?.currGoal?.macros.protein),
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
  }, [userToCheck?.loggedToday?.calories])

  useEffect(() => {
    if (!todaySessionDay) return

    setSelectedSessionDay(todaySessionDay)
  }, [user, traineeUser, todaySessionDay])

  function getPercentage(value: number, goal: number) {
    return (value / goal) * 100
  }

  async function checkDiaryDayChange() {
    if (!user) return
    const dateToCheck = getDateFromISO(new Date().toISOString())
    await handleDiaryDayChange(dateToCheck, user, traineeUser)
  }

  async function updateSessionDay() {
    try {
      if (!user) return
      const day = await handleSessionDayChange(
        getDateFromISO(new Date().toISOString()),
        traineeUser || user
      )

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
          <div className={`animation-container ${isDashboard ? 'dashboard' : ''}`}>
            <Lottie animationData={workoutAnimation} loop={true} />
          </div>
          {!isDashboard && <CustomButton
            text="Choose Workout"
            icon={<PlayArrowIcon />}
            onClick={() => {
              setSlideDirection(1)
              navigate('/lift-mate/workouts')
            }}

          />}
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
            updateSessionDay={updateSessionDay}
          />
        </div>
      )
  }

  return (
    <div
      className={`page-container dashboard-container ${timer ? 'has-timer' : ''
        } ${isDashboard ? 'dashboard' : ''}`}
    >
      {!isDashboard && <TimesContainer
        className={`${prefs.isDarkMode ? 'dark-mode' : ''} ${prefs.favoriteColor
          }`}
      />}
      {isDashboard && <Typography variant="h4" className='bold-header' >
        Dashboard
      </Typography>}
      {/* <Typography variant="h5" className="bold-header">Dashboard</Typography> */}
      {showStatsCarousel ? <StatsCarousel items={statsCarouselItems} showSkeleton={!user} /> :

        <div className="dashboard-items-container">
          {statsCarouselItems.map((item) => item)}

        </div>

      }

      {renderNoSession()}
      {/* <CustomAccordion title="Workout Session" cmp={renderSession()} /> */}
      {renderSession()}
    </div>
  )
}
