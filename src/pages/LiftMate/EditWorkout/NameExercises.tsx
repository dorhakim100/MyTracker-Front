import { useRef, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Workout } from '../../../types/workout/Workout'
import { Divider, Typography } from '@mui/material'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { Dumbbell } from '../../../components/Icons/Dumbbell'
import AddIcon from '@mui/icons-material/Add'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ExercisesStage } from './ExercisesStage'
import { Exercise } from '../../../types/exercise/Exercise'
import { ExerciseFilter } from '../../../types/exerciseFilter/ExerciseFilter'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
} from '../../../services/util.service'
import { ExerciseCard } from '../../../components/ExerciseCard/ExerciseCard'

import { Instructions } from '../../../types/instructions/Instructions'
import { CustomSelect } from '../../../CustomMui/CustomSelect/CustomSelect'
import { CustomToggle } from '../../../CustomMui/CustomToggle/CustomToggle'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { WeekNumberStatus } from '../../../types/weekNumberStatus/WeekNumberStatus'
import BeenhereIcon from '@mui/icons-material/Beenhere'
import { CustomList } from '../../../CustomMui/CustomList/CustomList'
import { CustomAlertDialog } from '../../../CustomMui/CustomAlertDialog/CustomAlertDialog'
import { SaveCancel } from '../../../components/SaveCancel/SaveCancel'
import { showErrorMsg } from '../../../services/event-bus.service'
import { messages } from '../../../assets/config/messages'

type DialogType = 'add' | 'reorder' | 'alert' | null

interface DialogState {
  type: DialogType
  open: boolean
}

interface NameExercisesProps {
  workout: Workout
  onNameChange: (name: string) => void
  exerciseFilter: ExerciseFilter
  exerciseResults: Exercise[]
  onExerciseFilterChange: (exerciseFilter: ExerciseFilter) => void
  onAddExercise: (exercise: Exercise) => void
  onDeleteExercise: (exercise: Exercise) => void
  onReorderExercises: (exercises: Exercise[]) => void
  instructions: Instructions
  weeksStatus: WeekNumberStatus[]
  instructionsFilter: {
    weekNumber: number
    forUserId: string
    workoutId: string
  }
  onInstructionsFilterChange: (filter: {
    weekNumber: number
    forUserId: string
    workoutId: string
  }) => void
  setInstructions: (instructions: Instructions) => void
  onEditExerciseNotes: (exerciseId: string, notes: string) => void
  onSaveWorkout: (isClose?: boolean) => void
  onSwitchRpeRir: (exerciseId: string, value: 'rpe' | 'rir') => void
}

export function NameExercises({
  workout,
  onNameChange,

  exerciseFilter,
  exerciseResults,
  onExerciseFilterChange,
  onAddExercise,
  onDeleteExercise,
  onReorderExercises,
  instructions,
  weeksStatus,
  instructionsFilter,
  onInstructionsFilterChange,
  setInstructions,
  onEditExerciseNotes,
  onSaveWorkout,
  onSwitchRpeRir,
}: NameExercisesProps) {
  const { t } = useTranslation()
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const isDashboard = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.isDashboard
  )

  const [dialogState, setDialogState] = useState<DialogState>({
    type: null,
    open: false,
  })

  const originalInstructions = useRef<Instructions>(instructions)

  const [isSaved, setIsSaved] = useState(
    JSON.stringify(instructions) ===
      JSON.stringify(originalInstructions.current)
  )
  const [desiredWeekNumber, setDesiredWeekNumber] = useState<number>(
    instructionsFilter.weekNumber
  )

  const editWorkoutRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsSaved(
      JSON.stringify(instructions) ===
        JSON.stringify(originalInstructions.current)
    )
  }, [instructions])

  useEffect(() => {
    originalInstructions.current = instructions
    setIsSaved(
      JSON.stringify(instructions) ===
        JSON.stringify(originalInstructions.current)
    )
  }, [instructions._id])

  useEffect(() => {
    if (!dialogState.open && editWorkoutRef.current) {
      // Try to find a scrollable parent by checking overflow styles
      let scrollableParent: HTMLElement | null = null
      let current: HTMLElement | null = editWorkoutRef.current.parentElement

      while (current) {
        const style = window.getComputedStyle(current)
        if (
          style.overflowY === 'auto' ||
          style.overflowY === 'scroll' ||
          style.overflow === 'auto' ||
          style.overflow === 'scroll'
        ) {
          scrollableParent = current
          break
        }
        current = current.parentElement
      }

      const targetElement = scrollableParent || editWorkoutRef.current

      if (targetElement) {
        setTimeout(() => {
          targetElement.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
        }, 150)
      }
    }
  }, [dialogState.open, weeksStatus])

  const getWeekNumberIcon = (weekNumber: number) => {
    if (!weeksStatus) return <CloseIcon />
    const status = weeksStatus.find(
      (status) => status.weekNumber === weekNumber
    )

    return status?.isDone ? <CheckIcon /> : null
    return status?.isDone ? <CheckIcon /> : <CloseIcon />
  }

  const getIsWeekNumberDisabled = (weekNumber: number) => {
    return weekNumber > weeksStatus.length + 1

    if (weekNumber === 1) return false

    const previousStatus = weeksStatus.find(
      (status) => status.weekNumber === weekNumber - 1
    )
    if (previousStatus?.isDone) return false
    return true
  }

  const onEditTimes = (times: string) => {
    setInstructions({
      ...instructions,
      timesPerWeek: +times,
    })
  }

  const openDialog = (type: DialogType) => {
    setDialogState({ type, open: true })
  }

  const closeDialog = () => {
    setDialogState({ type: null, open: false })
  }

  const renderNoExercises = () => {
    return (
      <div className='no-exercises-container'>
        <Dumbbell />
        <Typography variant='body2'>
          {t('workout.getStartedByAdding')}
        </Typography>
      </div>
    )
  }

  const renderExercises = () => {
    return workout.exercises.map((exercise) => {
      return (
        <ExerciseCard
          key={exercise.exerciseId}
          exercise={exercise}
          onDelete={onDeleteExercise}
          onEditExerciseNotes={onEditExerciseNotes}
          setInstructions={setInstructions}
          onSwitchRpeRir={onSwitchRpeRir}
          setIsReorderExercisesOpen={(isOpen: boolean) => {
            if (isOpen) openDialog('reorder')
          }}
          showEquipment={true}
          instructions={instructions}
          exerciseInstructions={instructions.exercises.find(
            (i) => i.exerciseId === exercise.exerciseId
          )}
          isExpected={true}
        />
      )
    })
  }

  const getDialogComponent = () => {
    switch (dialogState.type) {
      case 'add':
        return (
          <ExercisesStage
            workout={workout}
            exerciseFilter={exerciseFilter}
            exerciseResults={exerciseResults}
            onExerciseFilterChange={onExerciseFilterChange}
            onAddExercise={onAddExercise}
            onDeleteExercise={onDeleteExercise}
            onReorderExercises={onReorderExercises}
            resultsMsg={
              !exerciseFilter.searchValue
                ? t('workout.mostPopularExercises')
                : t('workout.exercisesFound', { count: exerciseResults.length })
            }
          />
        )
      case 'reorder':
        return (
          <CustomList
            items={workout.exercises}
            renderPrimaryText={(exercise) =>
              capitalizeFirstLetter(exercise.name)
            }
            renderSecondaryText={(exercise) =>
              capitalizeFirstLetter(exercise.muscleGroups.join(', '))
            }
            renderLeft={(exercise) => (
              <img
                src={exercise.image}
                alt={exercise.name}
              />
            )}
            getKey={(exercise) => `${exercise.exerciseId}-selected`}
            className={`reorder-exercise-list ${
              prefs.isDarkMode ? 'dark-mode' : ''
            }`}
            noResultsMessage={t('workout.noExercisesAdded')}
            isDragable={true}
            onReorder={onReorderExercises}
          />
        )

      default:
        return <div></div>
    }
  }

  const getDialogTitle = () => {
    switch (dialogState.type) {
      case 'add':
        return t('workout.addExercises')
      case 'reorder':
        return t('workout.reorderExercises')
      default:
        return ''
    }
  }

  const handleSaveOnWeekNumberChange = async () => {
    try {
      onSaveWorkout(false)
      onInstructionsFilterChange({
        ...instructionsFilter,
        weekNumber: desiredWeekNumber,
      })
      closeDialog()
    } catch (err) {
      showErrorMsg(messages.error.saveWorkout)
    }
  }

  return (
    <>
      <div
        className='edit-workout-stage name-exercises-stage'
        ref={editWorkoutRef}
      >
        <div
          className={`settings-controls-container ${prefs.isDarkMode ? 'dark-mode' : ''} ${isDashboard ? 'dashboard' : ''}`}
        >
          <CustomInput
            value={workout.name}
            onChange={onNameChange}
            placeholder={t('workout.enterWorkoutName')}
            isRemoveIcon={true}
            className={`${prefs.favoriteColor}`}
          />

          {instructions._id && (
            <CustomToggle
              value={instructionsFilter.weekNumber.toString()}
              onChange={(weekNumber: string) => {
                if (!isSaved) {
                  openDialog('alert')
                  setDesiredWeekNumber(+weekNumber)
                  return
                }
                onInstructionsFilterChange({
                  ...instructionsFilter,
                  weekNumber: +weekNumber,
                })
              }}
              options={getArrayOfNumbers(1, 10).map((weekNumber) => ({
                label: t('workout.week'),
                value: weekNumber.toString(),
                icon: <span>{weekNumber}</span>,
                badgeIcon: getWeekNumberIcon(+weekNumber),
                getDisabled: () => {
                  // return false
                  return getIsWeekNumberDisabled(+weekNumber)
                },
              }))}
              isBadge={true}
              isReversedIcon={true}
              className={`week-number-toggle ${
                prefs.isDarkMode ? 'dark-mode' : ''
              }`}
            />
          )}
          {!instructions._id && (
            <div className='times-per-week-container'>
              <span className='bold-header'>{t('workout.timesPerWeek')}</span>
              <CustomSelect
                tooltipTitle={t('workout.editTimesPerWeek')}
                label={t('workout.times')}
                values={getArrayOfNumbers(1, 7).map(
                  (timesNumber) => timesNumber + ''
                )}
                value={instructions.timesPerWeek + ''}
                onChange={(times: string) => onEditTimes(times)}
                className={`${prefs.favoriteColor}`}
              />
            </div>
          )}
          <Divider
            className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
          />
        </div>
        {(workout.exercises.length === 0 && renderNoExercises()) || (
          <>
            {renderExercises()}
            <Divider
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
          </>
        )}
      </div>
      <div
        className={`end-buttons-container ${
          prefs.isDarkMode ? 'dark-mode' : ''
        } ${prefs.favoriteColor} ${
          workout.exercises.length > 0 ? 'has-exercises' : ''
        } ${isDashboard ? 'dashboard' : ''}`}
      >
        <CustomButton
          text={t('workout.addExercise')}
          onClick={() => openDialog('add')}
          icon={<AddIcon />}
          fullWidth={true}
        />

        {workout.exercises.length > 0 && (
          <>
            <Divider
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
              orientation='vertical'
              flexItem={true}
            />
            <CustomButton
              text={t('workout.saveWorkout')}
              onClick={() => onSaveWorkout(true)}
              icon={<BeenhereIcon />}
              fullWidth={true}
            />
          </>
        )}
      </div>
      <SlideDialog
        open={dialogState.open && dialogState.type !== 'alert'}
        onClose={closeDialog}
        component={getDialogComponent()}
        title={getDialogTitle()}
        type='full'
      />
      <CustomAlertDialog
        open={dialogState.open && dialogState.type === 'alert'}
        onClose={closeDialog}
        title={t('workout.changeWeekNumber')}
      >
        <span>{t('workout.unsavedChangesWeek')}</span>
        <SaveCancel
          onCancel={closeDialog}
          onSave={handleSaveOnWeekNumberChange}
        />
      </CustomAlertDialog>
    </>
  )
}
