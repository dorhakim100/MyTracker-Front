import { useMemo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
import { getWorkoutMuscles } from '../../../services/exersice-search/exersice-search'
import EditIcon from '@mui/icons-material/Edit'
interface WorkoutCardProps {
  workout: Workout
  className?: string
  onStartWorkout: (workout: Workout) => void
  selectedWorkoutId: string | null
  isRenderStartButtons: boolean
  onReorderWorkouts: (workouts: Workout[]) => void
  workouts: Workout[]
}

export function WorkoutCard({
  workout,
  className,
  onStartWorkout,
  selectedWorkoutId,
  isRenderStartButtons = true,
  onReorderWorkouts,
  workouts,
}: WorkoutCardProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isLoading = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isLoading
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
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
        title: t('workout.viewDetails'),
        icon: <InfoOutlineIcon />,
        onClick: onViewDetails,
      },
      {
        title: t('workout.editRoutine'),
        icon: <Edit />,
        onClick: onEdit,
      },
      {
        title: t('workout.deactivate'),
        icon: <IndeterminateCheckBoxIcon />,
        onClick: () => {
          toggleActivateWorkout(workout)
          const newWorkouts = workouts.filter(
            (w: Workout) => w._id !== workout._id
          )
          onReorderWorkouts(newWorkouts)
        },
      },
      {
        title: t('common.delete'),
        icon: <Delete />,
        onClick: () => setIsDeleteOpen(true),
      },
    ],
    [onViewDetails, onEdit, setIsDeleteOpen, workout, t]
  )

  const getSlideTitle = () => {
    if (slideOptions.type === 'details') {
      return t('workout.workoutDetails')
    }
    if (slideOptions.type === 'edit') {
      return t('common.editOption', { option: workout.name })
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
    if (!isDashboard)
      return (
        <CustomButton
          text={t('workout.startRoutine')}
          fullWidth={true}
          onClick={(ev) => {
            ev.stopPropagation()
            onStartWorkout(workout)
          }}
          className='start-workout-button'
          icon={
            isLoading && selectedWorkoutId === workout._id ? (
              <CircularProgress
                size={20}
                color='inherit'
              />
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
          badgeContent={t('common.new')}
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
        className={`workout-card-container pointer ${className} ${
          prefs.isDarkMode ? 'dark-mode' : ''
        }`}
        onClick={onViewDetails}
      >
        <div className='header-container'>
          <Typography variant='h6'>{workout.name}</Typography>
          <div className='header-actions-container'>
            {renderTimes()}
            <CustomOptionsMenu
              options={options}
              triggerElement={
                <CustomButton
                  isIcon={true}
                  icon={<MoreHorizIcon />}
                />
              }
            />
          </div>
        </div>
        <Typography
          variant='body1'
          className='muscle-groups-list hide-text-overflow'
        >
          {getWorkoutMuscles(workout).join(', ')}
        </Typography>
        <Divider className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`} />
        <Typography
          variant='body2'
          className='exercises-list hide-text-overflow opacity-70'
        >
          {workout.exercises
            .map((exercise) => capitalizeFirstLetter(exercise.name))
            .join(', ')}
        </Typography>

        {workout.isNewInstructions && isRenderStartButtons && (
          <>
            <Divider
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
            {renderAvailableWorkoutButton()}
          </>
        )}
        {isDashboard && (
          <div className='dashboard-actions-container'>
            <CustomButton
              text={t('workout.editRoutine')}
              fullWidth={true}
              onClick={(ev) => {
                ev.stopPropagation()
                onEdit()
              }}
              className='start-workout-button'
              icon={<EditIcon />}
            />
          </div>
        )}
      </Card>
      <CustomAlertDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={t('workout.deleteWorkout')}
      >
        <div className='modal-delete-workout-container'>
          <Typography variant='body1'>
            {t('workout.deleteWorkoutConfirm')}
          </Typography>
          <DialogActions>
            <CustomButton
              text={t('common.cancel')}
              fullWidth={true}
              onClick={() => setIsDeleteOpen(false)}
            />
            <CustomButton
              text={t('common.delete')}
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
        type='full'
      />
    </>
  )
}
