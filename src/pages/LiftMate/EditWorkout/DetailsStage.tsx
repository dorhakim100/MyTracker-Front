import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
} from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Divider } from '@mui/material'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { CustomToggle } from '../../../CustomMui/CustomToggle/CustomToggle'
import { Exercise } from '../../../types/exercise/Exercise'
import { Workout } from '../../../types/workout/Workout'
import { Instructions } from '../../../types/instructions/Instructions'
import { WeekNumberStatus } from '../../../types/weekNumberStatus/WeekNumberStatus'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { ExpectedActual } from '../../../types/expectedActual/ExpectedActual'
import InfoOutlineIcon from '@mui/icons-material/InfoOutline'
import { CustomButton } from '../../../CustomMui/CustomButton/CustomButton'
import { ExerciseDetails } from '../../../components/ExerciseDetails/ExerciseDetails'
import { CustomSelect } from '../../../CustomMui/CustomSelect/CustomSelect'
import { ExerciseEditor } from '../../../components/ExerciseEditor/ExerciseEditor'
import { ExerciseInstructions } from '../../../types/exercise/ExerciseInstructions'

interface DetailsStageProps {
  workout: Workout
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
  onEditExerciseNotes: (exerciseId: string, notes: string) => void
  // onChangeRpeRir: (exerciseId: string, value: 'rpe' | 'rir') => void
  setInstructions: (instructions: Instructions) => void
}

const RPE_RIR_TOGGLE_OPTIONS = [
  {
    label: 'RPE',
    value: 'rpe',
  },
  {
    label: 'RIR',
    value: 'rir',
  },
]

export function DetailsStage({
  workout,
  instructions,
  weeksStatus,
  instructionsFilter,
  onInstructionsFilterChange,
  onEditExerciseNotes,
  // onChangeRpeRir,
  setInstructions,
}: DetailsStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerModal, setPickerModal] = useState({
    isOpen: false,
    type: null as string | null,
    exerciseId: null as string | null,
  })

  const [exerciseInfoDialog, setExerciseInfoDialog] = useState({
    isOpen: false,
    exercise: null as Exercise | null,
  })

  const closeSlideDialog = () => {
    setPickerModal({ isOpen: false, type: null, exerciseId: null })
    setExerciseInfoDialog({ isOpen: false, exercise: null })
  }

  const getWeekNumberIcon = (weekNumber: number) => {
    if (!weeksStatus) return <CloseIcon />
    const status = weeksStatus.find(
      (status) => status.weekNumber === weekNumber
    )

    return status?.isDone ? <CheckIcon /> : <CloseIcon />
  }

  const getIsWeekNumberDisabled = (weekNumber: number) => {
    if (weekNumber === 1) return false

    const previousStatus = weeksStatus.find(
      (status) => status.weekNumber === weekNumber - 1
    )
    if (previousStatus?.isDone) return false
    return true
  }

  const onSwitchRpeRir = (exerciseId: string, value: 'rpe' | 'rir') => {
    const exerciseInstructionToUpdate = instructions.exercises.find(
      (e) => e.exerciseId === exerciseId
    )

    const exerciseIndex = instructions.exercises.findIndex(
      (e) => e.exerciseId === exerciseId
    )
    if (!exerciseInstructionToUpdate) return

    let newExerciseInstruction = { ...exerciseInstructionToUpdate }

    if (value === 'rpe') {
      newExerciseInstruction.sets = newExerciseInstruction.sets.map((set) => {
        // Create a new set object without rir, but with rpe
        const { rir, ...setWithoutRir } = set
        return {
          ...setWithoutRir,
          rpe: {
            expected: 8,
            actual: 8,
          } as ExpectedActual<number>,
        }
      })
    }
    if (value === 'rir') {
      newExerciseInstruction.sets = newExerciseInstruction.sets.map((set) => {
        // Create a new set object without rpe, but with rir
        const { rpe, ...setWithoutRpe } = set
        return {
          ...setWithoutRpe,
          rir: {
            expected: 2,
            actual: 2,
          } as ExpectedActual<number>,
        }
      })
    }

    const newExercises = [...instructions.exercises]
    newExercises[exerciseIndex] = newExerciseInstruction

    setInstructions({
      ...instructions,
      exercises: newExercises,
    })
  }

  const getIsDialogOpen = () => {
    return pickerModal.isOpen || exerciseInfoDialog.isOpen
  }

  const getDialogTitle = () => {
    if (exerciseInfoDialog.isOpen) {
      return capitalizeFirstLetter(exerciseInfoDialog.exercise?.name || '')
    }
    return capitalizeFirstLetter(pickerModal.type || '')
  }

  const getDialogHeight = () => {
    if (exerciseInfoDialog.isOpen) return 'full'
    return 'half'
  }

  const onEditTimes = (times: string) => {
    setInstructions({
      ...instructions,
      timesPerWeek: +times,
    })
  }

  const updateExercise = (exercise: ExerciseInstructions) => {
    setInstructions({
      ...instructions,
      exercises: instructions.exercises.map((e) =>
        e.exerciseId === exercise.exerciseId ? exercise : e
      ),
    })
  }

  return (
    <>
      <CustomToggle
        value={instructionsFilter.weekNumber.toString()}
        onChange={(weekNumber: string) =>
          onInstructionsFilterChange({
            ...instructionsFilter,
            weekNumber: +weekNumber,
          })
        }
        options={getArrayOfNumbers(1, 10).map((weekNumber) => ({
          label: `Week`,
          value: weekNumber.toString(),
          icon: <span>{weekNumber}</span>,
          badgeIcon: getWeekNumberIcon(+weekNumber),
          getDisabled: () => {
            return getIsWeekNumberDisabled(+weekNumber)
          },
        }))}
        isBadge={true}
        isReversedIcon={true}
        className={`week-number-toggle ${prefs.isDarkMode ? 'dark-mode' : ''}`}
      />
      <div className='times-per-week-container'>
        <span className='bold-header'>Times per week</span>
        <CustomSelect
          label='Times'
          values={getArrayOfNumbers(1, 7).map(
            (timesNumber) => timesNumber + ''
          )}
          value={instructions.timesPerWeek + ''}
          onChange={(times: string) => onEditTimes(times)}
          className={`${prefs.favoriteColor}`}
        />
      </div>
      <div className='edit-workout-stage details-stage'>
        {instructions.exercises.map((exercise: ExerciseInstructions, index) => {
          const exerciseDetails = workout.exercises.find(
            (e) => e.exerciseId === exercise.exerciseId
          )
          if (!exerciseDetails) return null

          return (
            <div
              key={`${exercise.exerciseId}-${index}`}
              className='exercise-details-edit-container'
            >
              <div className='header-container'>
                <CustomButton
                  isIcon={true}
                  icon={<InfoOutlineIcon />}
                  onClick={(ev) => {
                    ev.stopPropagation()
                    setExerciseInfoDialog({
                      isOpen: true,
                      exercise: exerciseDetails,
                    })
                  }}
                  tooltipTitle="View exercise details"
                />
                <h4>{capitalizeFirstLetter(exerciseDetails.name)}</h4>

                <CustomToggle
                  options={RPE_RIR_TOGGLE_OPTIONS}
                  value={exercise.sets[0]?.rpe ? 'rpe' : 'rir'}
                  onChange={(value) => {
                    onSwitchRpeRir(exercise.exerciseId, value as 'rpe' | 'rir')
                  }}
                  className={`rpe-rir-toggle ${prefs.isDarkMode ? 'dark-mode' : ''
                    }`}
                />
              </div>

              <ExerciseEditor
                exercise={exercise}
                isExpected={true}
                updateExercise={updateExercise}
              />

              <CustomInput
                value={exercise?.notes?.expected || ''}
                onChange={(notes: string) =>
                  onEditExerciseNotes(exercise.exerciseId, notes)
                }
                placeholder={`${capitalizeFirstLetter(
                  exerciseDetails.name || ''
                )} notes`}
                isRemoveIcon={true}
                className={`${prefs.favoriteColor}`}
              />
              <Divider
                className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
              />
            </div>
          )
        })}
      </div>
      <SlideDialog
        open={getIsDialogOpen()}
        onClose={closeSlideDialog}
        component={<ExerciseDetails exercise={exerciseInfoDialog.exercise} />}
        title={getDialogTitle()}
        type={getDialogHeight()}
      />
    </>
  )
}
