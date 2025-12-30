import { useState, useEffect, useMemo } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  handleSessionDayChange,
  loadWorkouts,
  removeWorkout,
  toggleActivateWorkout,
  setSelectedSessionDay,
  playWorkout,
  setTodaySessionDay,
  playEmptyWorkout,
} from '../../../store/actions/workout.action'

import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { EditWorkout } from '../EditWorkout/EditWorkout'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'

import { RootState } from '../../../store/store'

import { Workout } from '../../../types/workout/Workout'
import {
  capitalizeFirstLetter,
  getDateFromISO,
} from '../../../services/util.service'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { messages } from '../../../assets/config/messages'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import { WorkoutDetails } from '../../../components/WorkoutDetails/WorkoutDetails'
import { CircularProgress, Divider, Typography } from '@mui/material'
import { Add, Delete, Edit } from '@mui/icons-material'
import { workoutService } from '../../../services/workout/workout.service'
import { DAY_IN_MS, MONTH_IN_MS } from '../../../assets/config/times'
import { DateRangeController } from '../../../components/DateRangeController/DateRangeController'
import { WorkoutsList } from './WorkoutsList'
import { CustomOptionsMenu } from '../../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { DropdownOption } from '../../../types/DropdownOption'
import CheckBoxIcon from '@mui/icons-material/CheckBox'
import { DayController } from '../../../components/DayController/DayController'
import { SlideAnimation } from '../../../components/SlideAnimation/SlideAnimation'
import { WorkoutSession } from '../../../components/WorkoutSession/WorkoutSession'
import {
  setIsLoading,
  setSlideDirection,
} from '../../../store/actions/system.actions'
import CustomSkeleton from '../../../CustomMui/CustomSkeleton/CustomSkeleton'

const EDIT = 'edit'
const DETAILS = 'details'
const ROUTINES = 'routines'

const EDIT_TITLE = 'Edit Workout'
const CREATE_TITLE = 'Create Workout'
const DETAILS_TITLE = 'Workout Details'
const ROUTINES_TITLE = 'Routines'

const WORKOUTS_TITLE = 'Workouts'

const ADD_ROUTINE_BUTTON = 'Add New Routine'

type dialogType = typeof EDIT | typeof DETAILS | typeof ROUTINES

interface dialogOptions {
  open: boolean
  type: dialogType | null
}

export function Workouts() {
  const navigate = useNavigate()
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const timer = useSelector((state: RootState) => state.workoutModule.timer)

  const workouts = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.workouts
  )

  const sessionDay = useSelector(
    (state: RootState) => state.workoutModule.sessionDay
  )

  const [selectedDay, setSelectedDay] = useState(new Date())
  const [selectedDayDate] = useState(new Date().toISOString())

  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(
    null
  )

  const [sessionFilter, setSessionFilter] = useState({
    userId: traineeUser?._id || user?._id || '',
    date: selectedDayDate,
  })

  const [dialogOptions, setDialogOptions] = useState<dialogOptions>({
    open: false,
    type: null,
  })
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [emptyWorkoutLoading, setEmptyWorkoutLoading] = useState(false)
  const [direction, setDirection] = useState(1)
  const [isPageLoading, setIsPageLoading] = useState(false)
  const [selectedPastDate, setSelectedPastDate] = useState({
    from: getDateFromISO(
      new Date(new Date().getTime() - MONTH_IN_MS).toISOString()
    ),
    to: getDateFromISO(new Date().toISOString()),
  })

  const isToday = useMemo(() => {
    const isToday =
      getDateFromISO(sessionFilter?.date) ===
      getDateFromISO(new Date().toISOString())

    return isToday
  }, [sessionDay?.date, sessionFilter])

  useEffect(() => {
    if (isToday && sessionDay) {
      setTodaySessionDay(sessionDay)
    }
  }, [sessionDay])

  const [selectedWorkoutForOptions, setSelectedWorkoutForOptions] =
    useState<Workout | null>(null)

  const pastWorkoutOptions: DropdownOption[] = useMemo(
    () => [
      {
        title: 'Activate',
        icon: <CheckBoxIcon />,
        onClick: () => {
          if (selectedWorkoutForOptions) {
            toggleActivateWorkout(selectedWorkoutForOptions)
          }
        },
      },
      {
        title: 'Edit',
        icon: <Edit />,
        onClick: () => {
          if (selectedWorkoutForOptions) {
            onOpenEdit(selectedWorkoutForOptions)
          }
        },
      },
      {
        title: 'Delete',
        icon: <Delete />,
        onClick: () => {
          if (selectedWorkoutForOptions) {
            onDeleteWorkout(selectedWorkoutForOptions, false)
          }
        },
      },
    ],
    [onDeleteWorkout, onOpenEdit, selectedWorkoutForOptions]
  )

  useEffect(() => {
    if (traineeUser) {
      loadWorkouts({
        forUserId: traineeUser._id,
        from: selectedPastDate?.from,
        to: selectedPastDate?.to,
      })
    } else if (user) {
      loadWorkouts({
        forUserId: user._id,
        from: selectedPastDate?.from,
        to: selectedPastDate?.to,
      })
    }
    return () => {
      loadWorkouts({
        forUserId: traineeUser?._id || user?._id || '',
        from: selectedPastDate?.from,
        to: selectedPastDate?.to,
      })
    }
  }, [user, traineeUser, selectedPastDate])

  useEffect(() => {
    updateSessionDay()
  }, [user, traineeUser, sessionFilter])

  useEffect(() => {
    if (traineeUser) {
      loadWorkouts({ forUserId: traineeUser._id })
    } else if (user) {
      loadWorkouts({ forUserId: user._id })
    }
  }, [user, traineeUser, sessionDay?.date])

  function onOpenEdit(workout: Workout) {
    setDialogOptions({ open: true, type: EDIT })
    setSelectedWorkout(workout)
  }

  function onOpenDetails(workout: Workout) {
    setSelectedWorkout(workout)
    setDialogOptions({ open: true, type: DETAILS })
  }

  function closeEdit() {
    setDialogOptions({ open: false, type: null })
    setSelectedWorkout(null)
  }

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

  async function updateSessionDay() {
    try {
      if (!user) return

      const day = await handleSessionDayChange(
        sessionFilter.date,
        traineeUser || user
      )
      setSelectedSessionDay(day)
    } catch (err) {
      showErrorMsg(messages.error.getSessionDay)
    } finally {
      setIsPageLoading(false)
    }
  }

  async function onDeleteWorkout(
    workout: Workout,
    isSwipeable: boolean = true
  ) {
    try {
      if (!workout._id) return showErrorMsg(messages.error.deleteWorkout)

      if (!isSwipeable) {
        await removeWorkout(workout._id)
        setSelectedWorkoutForOptions(null)
      } else {
        await workoutService.remove(workout._id)
      }

      showSuccessMsg(messages.success.deleteWorkout)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.deleteWorkout)
    }
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

      if (isToday) {
        setSlideDirection(-1)

        navigate('/')
      }

      // await saveSessionDay()
    } catch (err) {
      showErrorMsg(messages.error.startWorkout)
    } finally {
      setIsLoading(false)
    }
  }

  const getDialogComponent = () => {
    switch (dialogOptions.type) {
      case EDIT:
        return (
          <EditWorkout
            selectedWorkout={selectedWorkout}
            closeDialog={closeEdit}
          />
        )
      case DETAILS:
        return <WorkoutDetails workout={selectedWorkout} />
      case ROUTINES:
        return (
          <div className="dialog-routines-container">
            {renderWorkoutLists(false)}
          </div>
        )
      default:
        return <></>
    }
  }

  const getDialogTitle = () => {
    switch (dialogOptions.type) {
      case EDIT:
        return selectedWorkout ? EDIT_TITLE : CREATE_TITLE
      case DETAILS:
        return DETAILS_TITLE
      case ROUTINES:
        return ROUTINES_TITLE

      default:
        return WORKOUTS_TITLE
    }
  }

  const renderWorkoutLists = (isRenderStartButtons: boolean = true) => {
    const activeWorkouts = workouts.filter((workout) => workout.isActive)
    const inactiveWorkouts = workouts.filter((workout) => !workout.isActive)

    if (activeWorkouts.length === 0 && inactiveWorkouts.length === 0) {
      return (
        <div className="no-workouts-container">
          <Typography variant="body1">No workouts found</Typography>
        </div>
      )
    }

    return (
      <div className="workouts-lists-container">
        {activeWorkouts.length > 0 && (
          <span className="bold-header">Active Routines</span>
        )}

        <div
          className={`workouts-list-container ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } active`}
        >
          <WorkoutsList
            workouts={activeWorkouts}
            className={`active-list`}
            onStartWorkout={onStartWorkout}
            selectedWorkoutId={selectedWorkoutId}
            isRenderStartButtons={isRenderStartButtons}
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        <div className="past-controller">
          <span className="bold-header">Past Routines</span>
          <DateRangeController
            selectedPastDate={selectedPastDate}
            onDateChange={setSelectedPastDate}
          />
        </div>

        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />

        {inactiveWorkouts.length > 0 ? (
          <CustomList
            items={inactiveWorkouts}
            className={`workouts-list inactive-list ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
            renderPrimaryText={(workout) => workout.name}
            renderSecondaryText={(workout) =>
              capitalizeFirstLetter(workout.muscleGroups.join(', '))
            }
            onItemClick={(workout) => onOpenDetails(workout)}
            renderRight={(workout) => (
              <CustomOptionsMenu
                options={pastWorkoutOptions}
                triggerElement={
                  <CustomButton isIcon={true} icon={<MoreHorizIcon />} />
                }
                onClick={() => {
                  setSelectedWorkoutForOptions(workout)
                }}
              />
            )}
            isSwipeable={true}
            renderRightSwipeActions={(workout) => (
              <DeleteAction item={workout} onDeleteItem={onDeleteWorkout} />
            )}
          />
        ) : (
          <Typography variant="body1" className="no-past-workouts-message">
            No past routines found...
          </Typography>
        )}
      </div>
    )
  }

  function renderSkeleton() {
    return (
      <div className="page-container workouts-container skeleton">
        <DayController
          selectedDay={selectedDay}
          selectedDayDate={sessionFilter.date}
          isToday={isToday}
          onDayChange={onDayChange}
          onDateChange={onDateChange}
        />

        {Array.from({ length: 7 }).map((_, index: number) => {
          return (
            <CustomSkeleton
              key={index}
              height={'300px'}
              width="100%"
              isDarkMode={prefs.isDarkMode}
            />
          )
        })}
      </div>
    )
  }

  async function onPlayEmptyWorkout() {
    try {
      setEmptyWorkoutLoading(true)
      await playEmptyWorkout(traineeUser?._id || user?._id || '')
      setSlideDirection(-1)
      navigate('/')
    } catch (err) {
      showErrorMsg(messages.error.playEmptyWorkout)
    } finally {
      setEmptyWorkoutLoading(false)
    }
  }

  if (!sessionDay || !sessionDay._id || isPageLoading) return renderSkeleton()
  return (
    <>
      <div
        className={`page-container workouts-container ${
          timer ? 'has-timer' : ''
        }`}
      >
        <>
          <div className="workouts-header routines">
            <Typography variant="h5" className="bold-header">
              Routines
            </Typography>

            <CustomButton
              text={ADD_ROUTINE_BUTTON}
              onClick={() => setDialogOptions({ open: true, type: EDIT })}
              icon={<Add />}
              fullWidth={true}
            />
          </div>
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        </>

        {renderWorkoutLists(
          !sessionDay?.workoutId || !sessionDay?.instructions
        )}
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <div className="workouts-header">
          <Typography variant="h5" className="bold-header">
            Workout
          </Typography>
          {!sessionDay.instructions && (
            <CustomButton
              text="Start Empty Workout"
              onClick={onPlayEmptyWorkout}
              icon={
                emptyWorkoutLoading ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  <Add />
                )
              }
              className={`${prefs.favoriteColor} empty-workout-button`}
              fullWidth={true}
            />
          )}
        </div>
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
          className="session-container-animation"
        >
          {!sessionDay.instructions && (
            <div className="workouts-header">
              <Typography variant="body1" className="bold-header">
                No workout session today
              </Typography>
            </div>
          )}

          <WorkoutSession
            sessionDay={sessionDay}
            onExerciseInfoClick={() => {}}
            updateSessionDay={updateSessionDay}
          />
        </SlideAnimation>
      </div>
      <SlideDialog
        open={dialogOptions.open}
        onClose={closeEdit}
        component={getDialogComponent()}
        title={getDialogTitle()}
        type="full"
      />
    </>
  )
}
