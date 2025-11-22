import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { DayController } from '../../../components/DayController/DayController'
import { DAY_IN_MS } from '../../../assets/config/times'
import {
  handleSessionDayChange,
  loadWorkouts,
  saveSessionDay,
  setSelectedSessionDay,
} from '../../../store/actions/workout.action'
import {
  capitalizeFirstLetter,
  getDateFromISO,
} from '../../../services/util.service'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { Typography } from '@mui/material'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { WorkoutDetails } from '../../../components/WorkoutDetails/WorkoutDetails'
import { Workout } from '../../../types/workout/Workout'
import { Exercise } from '../../../types/exercise/Exercise'

import PlayCircleFilledWhiteIcon from '@mui/icons-material/PlayCircleFilledWhite'
import { setIsLoading } from '../../../store/actions/system.actions'
import { SlideAnimation } from '../../../components/SlideAnimation/SlideAnimation'
import { CustomAccordion } from '../../../CustomMui/CustomAccordion/CustomAccordion'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import { ExerciseDetails } from '../../../components/ExerciseDetails/ExerciseDetails'

import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'

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

  const user = useSelector((state: RootState) => state.userModule.user)

  const prefs = useSelector((state: RootState) => state.systemModule.prefs)

  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedDayDate] = useState(new Date().toISOString())

  const [sessionFilter, setSessionFilter] = useState({
    userId: user?._id,
    date: selectedDayDate,
  })

  const [direction, setDirection] = useState(1)

  const [dialogOptions, setDialogOptions] = useState<SessionDialogOptions>({
    open: false,
    item: null,
    type: null,
  })

  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(
    new Set()
  )

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
        const day = await handleSessionDayChange(sessionFilter.date, user)
        setSelectedSessionDay(day)
      } catch (err) {
        showErrorMsg(messages.error.getSessionDay)
      }
    }
    updateSessionDay()
  }, [user, sessionFilter])

  useEffect(() => {
    if (user) {
      loadWorkouts({ forUserId: user._id })
    }
  }, [user])

  const onDayChange = (diff: number) => {
    const newDate = new Date(selectedDay.getTime() + diff * DAY_IN_MS)

    setDirection(diff)
    setSelectedDay(newDate)
    setSessionFilter({
      userId: user?._id,
      date: getDateFromISO(newDate?.toISOString()),
    })
  }

  const onDateChange = (date: string) => {
    setSelectedDay(new Date(date))
    setSessionFilter({
      userId: user?._id,
      date: date,
    })
  }

  const onStartWorkout = async (workout: Workout) => {
    console.log('workout', workout)
    if (!workout._id || !sessionDay) return
    try {
      setIsLoading(true)

      await saveSessionDay({
        ...sessionDay,
        workoutId: workout._id,
      })
    } catch (err) {
      showErrorMsg(messages.error.startWorkout)
    } finally {
      setIsLoading(false)
    }
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
          className={`${prefs.isDarkMode ? 'dark-mode' : ''}`}
          onItemClick={(workout) => {
            setDialogOptions({ open: true, item: workout, type: WORKOUT })
          }}
          renderRight={(workout) => (
            <PlayCircleFilledWhiteIcon
              className='start-icon'
              onClick={(ev) => {
                ev.stopPropagation()
                onStartWorkout(workout)
              }}
            />
          )}
        />
      </div>
    )
  }

  const handleAccordionChange = useCallback(
    (exerciseId: string) =>
      (_event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpandedExercises((prev) => {
          const newSet = new Set(prev)
          if (isExpanded) {
            newSet.add(exerciseId)
          } else {
            newSet.delete(exerciseId)
          }
          return newSet
        })
      },
    []
  )

  const toggleExpandAll = () => {
    if (!sessionDay?.workout?.exercises) return
    const allExerciseIds = sessionDay.workout.exercises.map(
      (ex) => ex.exerciseId
    )
    const allExpanded = allExerciseIds.every((id) => expandedExercises.has(id))

    if (allExpanded) {
      setExpandedExercises(new Set())
    } else {
      setExpandedExercises(new Set(allExerciseIds))
    }
  }

  const renderWorkout = () => {
    console.log('sessionDay', sessionDay)
    if (!sessionDay) return null

    const allExerciseIds = sessionDay.workout.exercises.map(
      (ex) => ex.exerciseId
    )
    const allExpanded =
      allExerciseIds.length > 0 &&
      allExerciseIds.every((id) => expandedExercises.has(id))

    return (
      <div className='workout-container'>
        <div className='workout-header-container'>
          <Typography variant='h5' className='bold-header'>
            {sessionDay?.workout?.name}
          </Typography>
          <CustomButton
            icon={allExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={toggleExpandAll}
          />
        </div>
        <div className='exercises-container'>
          {sessionDay.workout.exercises.map((exercise) => {
            const isExpanded = expandedExercises.has(exercise.exerciseId)

            return (
              <CustomAccordion
                key={`${exercise.exerciseId}-${sessionDay._id}`}
                title={capitalizeFirstLetter(exercise.name)}
                cmp={<div>bla</div>}
                expanded={isExpanded}
                onChange={handleAccordionChange(exercise.exerciseId)}
                icon={
                  <InfoOutlineIcon
                    onClick={(ev) => {
                      ev.stopPropagation()
                      setDialogOptions({
                        open: true,
                        item: exercise,
                        type: EXERCISE,
                      })
                    }}
                  />
                }
              />
            )
          })}
        </div>
      </div>
    )
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
        <SlideAnimation motionKey={sessionDay._id} direction={direction}>
          {!sessionDay.workoutId ? renderNoSession() : renderWorkout()}
        </SlideAnimation>
      </div>
      {dialogOptions.type && (
        <SlideDialog
          open={dialogOptions.open}
          onClose={() => {
            setDialogOptions({ open: false, item: null, type: null })
          }}
          component={getDialogComponent() as React.ReactElement}
          title={dialogOptions.item?.name}
          type='full'
        />
      )}
    </>
  )
}
