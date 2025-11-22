import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

import {
  loadWorkouts,
  removeWorkout,
} from '../../../store/actions/workout.action'

import { musclesGroup } from '../../../assets/config/muscles-group'

import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { EditWorkout } from '../EditWorkout/EditWorkout'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'

import { RootState } from '../../../store/store'

import { Workout } from '../../../types/workout/Workout'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { MuscleGroupCard } from '../../../components/LiftMate/MuscleGroupCard/MuscleGroupCard'
import { MuscleGroup } from '../../../types/muscleGroup/MuscleGroup'
import { EditIcon } from '../../../components/EditIcon/EditIcon'
import { DeleteAction } from '../../../components/DeleteAction/DeleteAction'
import { messages } from '../../../assets/config/messages'
import { showErrorMsg } from '../../../services/event-bus.service'

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

  const [openEdit, setOpenEdit] = useState(false)
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)

  useEffect(() => {
    if (user) {
      loadWorkouts({ forUserId: user._id })
    }
  }, [user])

  function onSelectWorkout(workout: Workout) {
    setSelectedWorkout(workout)
    setOpenEdit(true)
  }

  const closeEdit = () => {
    setOpenEdit(false)
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

  return (
    <>
      <div className={`page-container workouts-container`}>
        <CustomList
          items={workouts}
          className={`workouts-list ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          renderPrimaryText={(workout) => workout.name}
          renderSecondaryText={(workout) =>
            capitalizeFirstLetter(workout.muscleGroups.join(', '))
          }
          onItemClick={() => console.log('hello')}
          renderRight={(workout) => (
            <EditIcon
              onClick={() => {
                onSelectWorkout(workout)
              }}
            />
          )}
          isSwipeable={true}
          renderRightSwipeActions={(workout) => (
            <DeleteAction item={workout} onDeleteItem={onDeleteWorkout} />
          )}
        />

        <CustomButton text="Create Workout" onClick={() => setOpenEdit(true)} />
      </div>
      <SlideDialog
        open={openEdit}
        onClose={closeEdit}
        component={
          <EditWorkout
            selectedWorkout={selectedWorkout}
            closeDialog={closeEdit}
          />
        }
        title="Create Workout"
        type="full"
      />
    </>
  )
}
