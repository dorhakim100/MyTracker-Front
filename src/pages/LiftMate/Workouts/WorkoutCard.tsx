import { useMemo, useCallback, useState } from 'react'
import {
  Card,
  CircularProgress,
  DialogActions,
  Divider,
  Typography,
} from '@mui/material'

import { Workout } from '../../../types/workout/Workout'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { capitalizeFirstLetter } from '../../../services/util.service'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import { CustomOptionsMenu } from '../../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import { DropdownOption } from '../../../types/DropdownOption'
import { PlayArrow } from '@mui/icons-material'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import {
  removeWorkout,
  toggleActivateWorkout,
} from '../../../store/actions/workout.action'
import {
  showErrorMsg,
  showSuccessMsg,
} from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'
import { CustomAlertDialog } from '../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { WorkoutDetails } from '../../../components/WorkoutDetails/WorkoutDetails'
import { EditWorkout } from '../EditWorkout/EditWorkout'
import { Badge } from '@mui/material'

import DoneAllIcon from '@mui/icons-material/DoneAll'
interface WorkoutCardProps {
  workout: Workout
  className?: string
  onStartWorkout: (workout: Workout) => void
  selectedWorkoutId: string | null
}

export function WorkoutCard({
  workout,
  className,
  onStartWorkout,
  selectedWorkoutId,
}: WorkoutCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const [slideOptions, setSlideOptions] = useState<{
    open: boolean
    type: 'details' | 'edit' | null
  }>({ open: false, type: null })

  const onViewDetails = useCallback(() => {
    setSlideOptions({ open: true, type: 'details' })
  }, [workout._id])

  const onEdit = useCallback(() => {
    setSlideOptions({ open: true, type: 'edit' })
  }, [workout._id])

  const onDelete = useCallback(async () => {
    try {
      if (!workout._id) return showErrorMsg(messages.error.deleteWorkout)
      await removeWorkout(workout._id)
      showSuccessMsg(messages.success.deleteWorkout)
      setIsDeleteOpen(false)
    } catch (err) {
      showErrorMsg(messages.error.deleteWorkout)
    }
  }, [workout._id, setIsDeleteOpen])

  const options: DropdownOption[] = useMemo(
    () => [
      {
        title: 'View Details',
        icon: <InfoOutlineIcon />,
        onClick: onViewDetails,
      },
      {
        title: 'Edit Block',
        icon: <Edit />,
        onClick: onEdit,
      },
      {
        title: 'Deactivate',
        icon: <IndeterminateCheckBoxIcon />,
        onClick: () => toggleActivateWorkout(workout),
      },
      {
        title: 'Delete',
        icon: <Delete />,
        onClick: () => setIsDeleteOpen(true),
      },
    ],
    [onViewDetails, onEdit, setIsDeleteOpen, workout]
  )

  const getSlideTitle = () => {
    if (slideOptions.type === 'details') {
      return 'Workout Details'
    }
    if (slideOptions.type === 'edit') {
      return `Edit ${workout.name}`
    }
    return null
  }

  const getSlideComponent = () => {
    if (slideOptions.type === 'details') {
      return <WorkoutDetails workout={workout} />
    }
    if (slideOptions.type === 'edit') {
      return (
        <EditWorkout
          selectedWorkout={workout}
          closeDialog={() => setSlideOptions({ open: false, type: null })}
        />
      )
    }
    return null
  }

  function renderAvailableWorkoutButton() {
    return (
      <CustomButton
        text="Start Routine"
        fullWidth={true}
        onClick={(ev) => {
          ev.stopPropagation()
          onStartWorkout(workout)
        }}
        className="start-workout-button"
        icon={
          isLoading && selectedWorkoutId === workout._id ? (
            <CircularProgress size={20} color="inherit" />
          ) : (
            <PlayArrow />
          )
        }
      />
    )
  }

  const renderTimes = () => {
    if (workout.isNewInstructions && workout.doneTimes === 0) {
      return (
        <Badge
          badgeContent={'New'}
          className={`${prefs.favoriteColor} new-workout-badge`}
        >
          <span>
            {workout.doneTimes} / {workout.timesPerWeek}
          </span>
        </Badge>
      )
    }

    if (!workout.isNewInstructions) return <DoneAllIcon />

    return (
      <span>
        {workout.doneTimes} / {workout.timesPerWeek}
      </span>
    )
  }

  return (
    <>
      <Card
        className={`workout-card-container ${className} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
        onClick={onViewDetails}
      >
        <div className="header-container">
          <Typography variant="h6">{workout.name}</Typography>
          <div className="header-actions-container">
            {renderTimes()}
            <CustomOptionsMenu
              options={options}
              triggerElement={
                <CustomButton isIcon={true} icon={<MoreHorizIcon />} />
              }
            />
          </div>
        </div>
        <Typography
          variant="body1"
          className="muscle-groups-list hide-text-overflow"
        >
          {workout.muscleGroups
            .map((muscleGroup) => capitalizeFirstLetter(muscleGroup))
            .join(', ')}
        </Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <Typography
          variant="body2"
          className="exercises-list hide-text-overflow opacity-70"
        >
          {workout.exercises
            .map((exercise) => capitalizeFirstLetter(exercise.name))
            .join(', ')}
        </Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        {workout.isNewInstructions && renderAvailableWorkoutButton()}
      </Card>
      <CustomAlertDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Workout"
      >
        <div className="modal-delete-workout-container">
          <Typography variant="body1">
            Are you sure you want to delete this workout?
          </Typography>
          <DialogActions>
            <CustomButton
              text="Cancel"
              fullWidth={true}
              onClick={() => setIsDeleteOpen(false)}
            />
            <CustomButton
              text="Delete"
              fullWidth={true}
              onClick={onDelete}
              className={`${prefs.favoriteColor} delete-account-button`}
            />
          </DialogActions>
        </div>
      </CustomAlertDialog>
      <SlideDialog
        open={slideOptions.open}
        onClose={() => setSlideOptions({ open: false, type: null })}
        title={getSlideTitle() || ''}
        component={getSlideComponent() || <></>}
        type="full"
      />
    </>
  )
}
