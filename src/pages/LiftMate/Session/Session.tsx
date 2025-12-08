import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { DayController } from '../../../components/DayController/DayController'
import { DAY_IN_MS } from '../../../assets/config/times'
import {
  handleSessionDayChange,
  loadWorkouts,
  playWorkout,
  setSelectedSessionDay,
} from '../../../store/actions/workout.action'
import {
  capitalizeFirstLetter,
  getDateFromISO,
} from '../../../services/util.service'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { Badge, CircularProgress, Typography } from '@mui/material'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { WorkoutDetails } from '../../../components/WorkoutDetails/WorkoutDetails'
import { Workout } from '../../../types/workout/Workout'
import { Exercise } from '../../../types/exercise/Exercise'

import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import {
  setIsLoading,
  setSlideDirection,
} from '../../../store/actions/system.actions'
import { SlideAnimation } from '../../../components/SlideAnimation/SlideAnimation'
import { ExerciseDetails } from '../../../components/ExerciseDetails/ExerciseDetails'
import { WorkoutSession } from '../../../components/WorkoutSession/WorkoutSession'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

const WORKOUT = 'workout'
const EXERCISE = 'exercise'
type SessionDialogType = typeof WORKOUT | typeof EXERCISE
interface SessionDialogOptions {
  open: boolean
  item: Workout | Exercise | null
  type: SessionDialogType | null
}

export function Session() {
  const sessionDay = useSelector(
    (state: RootState) => state.workoutModule.sessionDay
  )

  const workouts = useSelector(
    (state: RootState) => state.workoutModule.workouts
  )

  const isLoading = useSelector(
    (state: RootState) => state.systemModule.isLoading
  )

  const user = useSelector((state: RootState) => state.userModule.user)

  const traineeUser = useSelector(
    (state: RootState) => state.userModule.traineeUser
  )

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const navigate = useNavigate()

  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedDayDate] = useState(new Date().toISOString())

  const [sessionFilter, setSessionFilter] = useState({
    userId: traineeUser?._id || user?._id || '',
    date: selectedDayDate,
  })

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  )

  const [direction, setDirection] = useState(1)

  const [dialogOptions, setDialogOptions] = useState<SessionDialogOptions>({
    open: false,
    item: null,
    type: null,
  })

  const isToday = useMemo(() => {
    const isToday =
      getDateFromISO(sessionFilter?.date) ===
      getDateFromISO(new Date().toISOString())

    return isToday
  }, [sessionDay?.date, sessionFilter])

  useEffect(() => {
    const updateSessionDay = async () => {
      try {
        if (!user) return
        const day = await handleSessionDayChange(
          sessionFilter.date,
          traineeUser || user
        )
        setSelectedSessionDay(day)
      } catch (err) {
        showErrorMsg(messages.error.getSessionDay)
      }
    }
    updateSessionDay()
  }, [user, traineeUser, sessionFilter])

  useEffect(() => {
    if (traineeUser) {
      loadWorkouts({ forUserId: traineeUser._id })
    } else if (user) {
      loadWorkouts({ forUserId: user._id })
    }
  }, [user, traineeUser, sessionDay?.date])

  const onDayChange = (diff: number) => {
    const newDate = new Date(selectedDay.getTime() + diff * DAY_IN_MS)

    setDirection(diff)
    setSelectedDay(newDate)
    setSessionFilter({
      userId: traineeUser?._id || user?._id || '',
      date: getDateFromISO(newDate?.toISOString()),
    })
  }

  const onDateChange = (date: string) => {
    setSelectedDay(new Date(date))
    setSessionFilter({
      userId: traineeUser?._id || user?._id || '',
      date: date,
    })
  }

  const onStartWorkout = async (workout: Workout) => {
    if (!workout._id || !sessionDay) return
    try {
      setIsLoading(true)

      if (!sessionDay._id) return
      setSelectedWorkoutId(workout._id)

      await playWorkout(
        {
          ...sessionDay,
          workoutId: workout._id,
        },
        traineeUser?._id || user?._id || ''
      )

      // await saveSessionDay()
    } catch (err) {
      showErrorMsg(messages.error.startWorkout)
    } finally {
      setIsLoading(false)
    }
  }

  const renderStartWorkoutIcon = (workout: Workout) => {
    return (
      <PlayCircleFilledWhiteIcon
        className='icon start'
        onClick={(ev) => {
          ev.stopPropagation()
          onStartWorkout(workout)
        }}
      />
    )
  }

  const renderAvailableWorkoutButton = (workout: Workout) => {
    return workout.doneTimes === 0 ? (
      <Badge badgeContent={'New'} className={`${prefs.favoriteColor}`}>
        {renderStartWorkoutIcon(workout)}
      </Badge>
    ) : (
      renderStartWorkoutIcon(workout)
    )
  }

  const renderNoSession = () => {
    const filteredWorkouts = workouts.filter((workout) => workout.isActive)

    return (
      <div className='no-session-container'>
        <Typography variant='h5' className='bold-header'>
          Select Your Workout
        </Typography>
        <CustomList
          items={filteredWorkouts}
          renderPrimaryText={(workout) => workout.name}
          renderSecondaryText={(workout) =>
            capitalizeFirstLetter(workout.muscleGroups.join(', '))
          }
          isDefaultLoader={false}
          className={`${
            prefs.isDarkMode ? 'dark-mode' : ''
          } selected-workout-list`}
          onItemClick={(workout) => {
            setDialogOptions({ open: true, item: workout, type: WORKOUT })
          }}
          renderRight={(workout) => {
            return isLoading && selectedWorkoutId === workout._id ? (
              <CircularProgress className={`${prefs.favoriteColor}`} />
            ) : workout.isNewInstructions ? (
              renderAvailableWorkoutButton(workout)
            ) : (
              <AddCircleOutlineIcon
                className='icon add'
                onClick={(ev) => {
                  ev.stopPropagation()
                  navigate(`/lift-mate/workouts`)
                  setSlideDirection(1)
                }}
              />
            )
          }}
          renderLeft={(workout) => {
            return !workout.isNewInstructions ? (
              <CheckCircleOutlineIcon className='icon check' />
            ) : (
              <span>
                {workout.doneTimes} / {workout.timesPerWeek}
              </span>
            )
          }}
          noResultsMessage='No active workouts found'
        />
      </div>
    )
  }

  const handleExerciseInfoClick = (exercise: Exercise) => {
    setDialogOptions({
      open: true,
      item: exercise,
      type: EXERCISE,
    })
  }

  const getDialogComponent = () => {
    if (dialogOptions.type === WORKOUT) {
      return <WorkoutDetails workout={dialogOptions.item as Workout} />
    }
    if (dialogOptions.type === EXERCISE) {
      return <ExerciseDetails exercise={dialogOptions.item as Exercise} />
    }
    return null
  }

  if (!sessionDay || !sessionDay._id) return null

  return (
    <>
      <div className='page-container session-container'>
        <DayController
          selectedDay={selectedDay}
          selectedDayDate={sessionFilter.date}
          isToday={isToday}
          onDayChange={onDayChange}
          onDateChange={onDateChange}
        />
        <SlideAnimation
          motionKey={sessionDay._id}
          direction={direction}
          className='session-container-animation'
        >
          {!sessionDay.workoutId || !sessionDay.instructions ? (
            renderNoSession()
          ) : (
            <WorkoutSession
              sessionDay={sessionDay}
              onExerciseInfoClick={handleExerciseInfoClick}
            />
          )}
        </SlideAnimation>
      </div>
      {dialogOptions.type && (
        <SlideDialog
          open={dialogOptions.open}
          onClose={() => {
            setDialogOptions({ open: false, item: null, type: null })
          }}
          component={getDialogComponent() as React.ReactElement}
          title={capitalizeFirstLetter(dialogOptions.item?.name || '')}
          type='full'
        />
      )}
    </>
  )
}
