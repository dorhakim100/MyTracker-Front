import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  loadWorkouts,
  toggleActivateWorkout,
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
import { EditIcon } from '../../../components/EditIcon/EditIcon'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { messages } from '../../../assets/config/messages'
import { showErrorMsg } from '../../../services/event-bus.service'
import { WorkoutDetails } from '../../../components/WorkoutDetails/WorkoutDetails'
import { Checkbox, Divider, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'
import { workoutService } from '../../../services/workout/workout.service'
import { MONTH_IN_MS } from '../../../assets/config/times'
import { DateRangeController } from '../../../components/DateRangeController/DateRangeController'
import { WorkoutCard } from './WorkoutCard'
import { WorkoutsList } from './WorkoutsList'

const EDIT = 'edit'
const DETAILS = 'details'

const EDIT_TITLE = 'Edit Workout'
const CREATE_TITLE = 'Create Workout'
const DETAILS_TITLE = 'Workout Details'
const ADD_BUTTON = 'Add'
const ADD_ROUTINE_BUTTON = 'Add Routine'

type dialogType = typeof EDIT | typeof DETAILS

interface dialogOptions {
  open: boolean
  type: dialogType | null
}

export function Workouts() {
  const user = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.user
  )

  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const traineeUser = useSelector(
    (stateSelector: RootState) => stateSelector.userModule.traineeUser
  )

  const workouts = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.workouts
  )

  const [dialogOptions, setDialogOptions] = useState<dialogOptions>({
    open: false,
    type: null,
  })
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  const [selectedPastDate, setSelectedPastDate] = useState({
    from: getDateFromISO(
      new Date(new Date().getTime() - MONTH_IN_MS).toISOString()
    ),
    to: getDateFromISO(new Date().toISOString()),
  })

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

  const onOpenEdit = (workout: Workout) => {
    setDialogOptions({ open: true, type: EDIT })
    setSelectedWorkout(workout)
  }

  function onOpenDetails(workout: Workout) {
    setSelectedWorkout(workout)
    setDialogOptions({ open: true, type: DETAILS })
  }

  const closeEdit = () => {
    setDialogOptions({ open: false, type: null })
    setSelectedWorkout(null)
  }

  async function onDeleteWorkout(workout: Workout) {
    try {
      if (!workout._id) return showErrorMsg(messages.error.deleteWorkout)
      await workoutService.remove(workout._id)
    } catch (err) {
      console.error(err)
      showErrorMsg(messages.error.deleteWorkout)
    }
  }

  const getDialogComponent = () => {
    if (dialogOptions.type === EDIT) {
      return (
        <EditWorkout
          selectedWorkout={selectedWorkout}
          closeDialog={closeEdit}
        />
      )
    }
    return <WorkoutDetails workout={selectedWorkout} />
  }

  const getDialogTitle = () => {
    if (dialogOptions.type === EDIT && selectedWorkout) {
      return EDIT_TITLE
    } else if (dialogOptions.type === EDIT && !selectedWorkout) {
      return CREATE_TITLE
    }
    return DETAILS_TITLE
  }

  const renderWorkoutLists = () => {
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
          <span className="bold-header">My Routines</span>
        )}

        <div
          className={`workouts-list-container ${
            prefs.isDarkMode ? 'dark-mode' : ''
          } active`}
        >
          <WorkoutsList workouts={activeWorkouts} className={`active-list`} />
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
            <div className="actions-container">
              <EditIcon
                onClick={() => {
                  onOpenEdit(workout)
                }}
              />
              <Checkbox
                className={`${prefs.favoriteColor}`}
                checked={workout.isActive}
                onClick={(ev) => {
                  ev.stopPropagation()
                  toggleActivateWorkout(workout)
                }}
              />
            </div>
          )}
          isSwipeable={true}
          renderRightSwipeActions={(workout) => (
            <DeleteAction item={workout} onDeleteItem={onDeleteWorkout} />
          )}
        />
        {inactiveWorkouts.length === 0 && (
          <Typography variant="body1" className="no-past-workouts-message">
            No past workouts found...
          </Typography>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={`page-container workouts-container`}>
        <div className="workouts-header">
          <Typography variant="h5" className="bold-header">
            Workout
          </Typography>
          <CustomButton
            text="Start Empty Workout"
            // onClick={() => setDialogOptions({ open: true, type: EDIT })}
            icon={<Add />}
            isIconReverse={true}
            className={`${prefs.favoriteColor} empty-workout-button`}
            fullWidth={true}
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <div className="workouts-header">
          <Typography variant="h5" className="bold-header">
            Routines
          </Typography>
          <div className="buttons-container">
            <CustomButton
              text={ADD_BUTTON}
              onClick={() => setDialogOptions({ open: true, type: EDIT })}
              icon={<Add />}
              fullWidth={true}
            />
            <CustomButton
              text={ADD_ROUTINE_BUTTON}
              onClick={() => setDialogOptions({ open: true, type: EDIT })}
              icon={<Add />}
              fullWidth={true}
            />
          </div>
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {renderWorkoutLists()}
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
