import { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store/store'
import {
  capitalizeFirstLetter,
  getArrayOfNumbers,
} from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { Divider } from '@mui/material'
import { PickerSelect } from '../../../components/Pickers/PickerSelect'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ClockPicker } from '../../../components/Pickers/ClockPicker'
import { CustomToggle } from '../../../CustomMui/CustomToggle/CustomToggle'
import { Exercise } from '../../../types/exercise/Exercise'
import { Workout } from '../../../types/workout/Workout'
import { Instructions } from '../../../types/instructions/Instructions'
import { WeekNumberStatus } from '../../../types/weekNumberStatus/WeekNumberStatus'
import { exersiceDetailsSelects } from '../../../assets/config/exersice-details-selects'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import { ExpectedActual } from '../../../types/expectedActual/ExpectedActual'

type PickerModalType =
  | 'expectedSets'
  | 'actualSets'
  | 'rpe'
  | 'sets'
  | 'weight'
  | 'reps'

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
  onEditExerciseDetails: (
    exerciseId: string,
    type: PickerModalType,
    value: number | string
  ) => void
  onEditExerciseNotes: (exerciseId: string, notes: string) => void
}

export function DetailsStage({
  workout,
  instructions,
  weeksStatus,
  instructionsFilter,
  onInstructionsFilterChange,
  onEditExerciseDetails,
  onEditExerciseNotes,
}: DetailsStageProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerModal, setPickerModal] = useState({
    isOpen: false,
    type: null as PickerModalType | null,
    exerciseId: null as string | null,
  })
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(
    null
  )

  const openPickerModal = (exercise: Exercise, type: PickerModalType) => {
    setPickerModal({ isOpen: true, type, exerciseId: exercise.exerciseId })
    setSelectedExercise(exercise)
  }

  const closePickerModal = () => {
    setPickerModal({ isOpen: false, type: null, exerciseId: null })
    setSelectedExercise(null)
  }

  const getIsAfterValue = (type: PickerModalType | null) => {
    if (!type) return false
    return exersiceDetailsSelects.find((select) => select.name === type)
      ?.isAfterValue
  }

  const getPickerModalValue = (
    type: PickerModalType | null,
    exercise: Exercise
  ): number => {
    if (!type) return 0

    const exerciseInstruction = instructions.exercises.find(
      (e) => e.exerciseId === exercise.exerciseId
    )

    // Fallback to workout exercise details if instruction doesn't exist or has no value
    const exerciseDetails = exercise.details

    if (type === 'sets') {
      // Check instruction first (reactive - gets updated when editing)
      if (
        exerciseInstruction?.sets &&
        Array.isArray(exerciseInstruction.sets)
      ) {
        return exerciseInstruction.sets.length
      }
      // Fallback to exercise details (initial value when editing)
      if (
        (exerciseDetails?.sets as unknown as ExpectedActual<number>)
          ?.expected !== undefined
      ) {
        return (exerciseDetails?.sets as unknown as ExpectedActual<number>)
          .expected
      }
      return 0
    }

    if (type === 'rpe') {
      if (exerciseInstruction?.rpe?.expected !== undefined) {
        return exerciseInstruction.rpe.expected
      }
      return exerciseDetails?.rpe?.expected || 0
    } else if (type === 'weight') {
      if (exerciseInstruction?.sets?.[0]?.weight?.expected !== undefined) {
        return exerciseInstruction.sets[0].weight.expected
      }
      return exerciseDetails?.weight?.expected || 0
    } else if (type === 'reps') {
      if (exerciseInstruction?.sets?.[0]?.reps?.expected !== undefined) {
        return exerciseInstruction.sets[0].reps.expected
      }
      return exerciseDetails?.reps?.expected || 0
    }
    return 0
  }

  const handlePickerChange = (newValue: number) => {
    if (!pickerModal.type || !pickerModal.exerciseId) return
    // console.log(newValue)

    onEditExerciseDetails(pickerModal.exerciseId, pickerModal.type, newValue)
  }

  const getWeekNumberIcon = (weekNumber: number) => {
    if (!weeksStatus) return <CloseIcon />
    const status = weeksStatus.find(
      (status) => status.weekNumber === weekNumber
    )

    return status?.isDone ? <CheckIcon /> : <CloseIcon />
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
        }))}
        isBadge={true}
        isReversedIcon={true}
        className='week-number-toggle'
      />
      <div className='edit-workout-stage details-stage'>
        {workout.exercises.map((exercise: Exercise) => {
          const exerciseInstruction = instructions.exercises.find(
            (e) => e.exerciseId === exercise.exerciseId
          )

          return (
            <div
              key={exercise.exerciseId}
              className='exercise-details-edit-container'
            >
              <h4>{capitalizeFirstLetter(exercise.name)}</h4>

              {exersiceDetailsSelects.map((select) => (
                <PickerSelect
                  key={select.name}
                  openClock={() =>
                    openPickerModal(exercise, select.name as PickerModalType)
                  }
                  option={{
                    label: select.label,
                    key: select.name,
                    type: 'number',
                  }}
                  value={getPickerModalValue(
                    select.name as PickerModalType,
                    exercise
                  )}
                />
              ))}
              <CustomInput
                value={exerciseInstruction?.notes?.expected || ''}
                onChange={(notes: string) =>
                  onEditExerciseNotes(exercise.exerciseId, notes)
                }
                placeholder={`${capitalizeFirstLetter(
                  exercise.name || ''
                )} notes`}
                isRemoveIcon={true}
              />
              <Divider
                className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
              />
            </div>
          )
        })}
      </div>
      <SlideDialog
        open={pickerModal.isOpen}
        onClose={closePickerModal}
        component={
          <ClockPicker
            value={getPickerModalValue(
              pickerModal.type,
              selectedExercise || workout.exercises[0]
            )}
            onChange={(_, value: number) => handlePickerChange(value)}
            isAfterValue={getIsAfterValue(pickerModal.type)}
          />
        }
        title={capitalizeFirstLetter(pickerModal.type || '')}
      />
    </>
  )
}
