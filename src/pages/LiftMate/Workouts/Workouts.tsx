import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  loadWorkouts,
  removeWorkout,
  toggleActivateWorkout,
} from '../../../store/actions/workout.action'

import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { EditWorkout } from '../EditWorkout/EditWorkout'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'

import { RootState } from '../../../store/store'

import { Workout } from '../../../types/workout/Workout'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { EditIcon } from '../../../components/EditIcon/EditIcon'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { messages } from '../../../assets/config/messages'
import { showErrorMsg } from '../../../services/event-bus.service'
import { WorkoutDetails } from '../../../components/WorkoutDetails/WorkoutDetails'
import { Checkbox, Divider, Typography } from '@mui/material'
import { Add } from '@mui/icons-material'

const EDIT = 'edit'
const DETAILS = 'details'

const EDIT_TITLE = 'Edit Workout'
const CREATE_TITLE = 'Create Workout'
const DETAILS_TITLE = 'Workout Details'
const ADD_BUTTON = 'Add'

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

  const workouts = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.workouts
  )

  const [dialogOptions, setDialogOptions] = useState<dialogOptions>({
    open: false,
    type: null,
  })
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (user) {
      loadWorkouts({ forUserId: user._id })
    }
  }, [user])

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
      await removeWorkout(workout._id)
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
        <div className='no-workouts-container'>
          <Typography variant='body1'>No workouts found</Typography>
        </div>
      )
    }

    return (
      <div className='workouts-lists-container'>
        {activeWorkouts.length > 0 && (
          <span className='bold-header'>Active</span>
        )}
        <CustomList
          items={activeWorkouts}
          className={`workouts-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          renderPrimaryText={(workout) => workout.name}
          renderSecondaryText={(workout) =>
            capitalizeFirstLetter(workout.muscleGroups.join(', '))
          }
          onItemClick={(workout) => onOpenDetails(workout)}
          renderRight={(workout) => (
            <div className='actions-container'>
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
          noResultsMessage='No active workouts found'
        />
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {inactiveWorkouts.length > 0 && (
          <span className='bold-header'>Past</span>
        )}
        <CustomList
          items={inactiveWorkouts}
          className={`workouts-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          renderPrimaryText={(workout) => workout.name}
          renderSecondaryText={(workout) =>
            capitalizeFirstLetter(workout.muscleGroups.join(', '))
          }
          onItemClick={(workout) => onOpenDetails(workout)}
          renderRight={(workout) => (
            <div className='actions-container'>
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
      </div>
    )
  }

  return (
    <>
      <div className={`page-container workouts-container`}>
        <div className='workouts-header'>
          <Typography variant='h5' className='bold-header'>
            Workouts
          </Typography>
          <CustomButton
            text={ADD_BUTTON}
            onClick={() => setDialogOptions({ open: true, type: EDIT })}
            icon={<Add />}
          />
        </div>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {renderWorkoutLists()}
      </div>
      <SlideDialog
        open={dialogOptions.open}
        onClose={closeEdit}
        component={getDialogComponent()}
        title={getDialogTitle()}
        type='full'
      />
    </>
  )
}
