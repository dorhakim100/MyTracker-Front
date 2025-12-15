import { useMemo, useCallback, useState } from 'react'
import { Card, DialogActions, Divider, Typography } from '@mui/material'

import { Workout } from '../../../types/workout/Workout'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'

import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { capitalizeFirstLetter } from '../../../services/util.service'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'

import { CustomOptionsMenu } from '../../../CustomMui/CustomOptionsMenu/CustomOptionsMenu'
import { DropdownOption } from '../../../types/DropdownOption'

import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import Edit from '@mui/icons-material/Edit'
import Delete from '@mui/icons-material/Delete'
import IndeterminateCheckBoxIcon from '@mui/icons-material/IndeterminateCheckBox'
import ContentPasteIcon from '@mui/icons-material/ContentPaste'
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
interface WorkoutCardProps {
  workout: Workout
  className?: string
}

export function WorkoutCard({ workout, className }: WorkoutCardProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false)

  const [slideOptions, setSlideOptions] = useState<{
    open: boolean
    type: 'details' | null
  }>({ open: false, type: null })

  const onViewDetails = useCallback(() => {
    setSlideOptions({ open: true, type: 'details' })
  }, [workout._id])

  const onEdit = useCallback(() => {
    console.log('edit workout', workout._id)
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
        title: 'Edit',
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
    return null
  }

  const getSlideComponent = () => {
    if (slideOptions.type === 'details') {
      return <WorkoutDetails workout={workout} />
    }
    return null
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
          <CustomOptionsMenu
            options={options}
            triggerElement={
              <CustomButton isIcon={true} icon={<MoreHorizIcon />} />
            }
          />
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
        <CustomButton
          text="Start Routine"
          fullWidth={true}
          onClick={(ev) => {
            ev.stopPropagation()
          }}
        />
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
