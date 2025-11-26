import { useState } from 'react'
import { useSelector } from 'react-redux'
import { Divider } from '@mui/material'

import { RootState } from '../../../store/store'
import { capitalizeFirstLetter } from '../../../services/util.service'
import { CustomInput } from '../../../CustomMui/CustomInput/CustomInput'
import { PickerSelect } from '../../../components/Pickers/PickerSelect'
import { SlideDialog } from '../../../components/SlideDialog/SlideDialog'
import { ClockPicker } from '../../../components/Pickers/ClockPicker'
import { Exercise, ExerciseDetail } from '../../../types/exercise/Exercise'
import { exersiceDetailsSelects } from '../../../assets/config/exersice-details-selects'

type PickerModalType = 'expectedSets' | 'actualSets' | 'rpe'

interface DetailsStageProps {
  exercises: Exercise[]
  onEditExerciseDetails: (exercise: Exercise) => void
}

export function DetailsStage({
  exercises,
  onEditExerciseDetails,
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
    type: PickerModalType | null
  ): number | string => {
    if (!type) return 0

    return (
      (
        selectedExercise?.details![pickerModal.type as keyof ExerciseDetail] as
          | { expected: number | string }
          | undefined
      )?.expected || 0
    )
  }

  const onEditExerciseDetailes = (newValue: number | string) => {
    const exerciseToUpdate = exercises.find(
      (e) => e.exerciseId === pickerModal.exerciseId
    )
    if (!exerciseToUpdate) return

    const detail = exerciseToUpdate.details![
      pickerModal.type as keyof ExerciseDetail
    ] as { expected: number | string } | undefined
    if (detail) {
      detail.expected = newValue
    }

    onEditExerciseDetails(exerciseToUpdate)
  }

  const onEditExerciseNotes = (notes: string, exercise: Exercise) => {
    if (!exercise.details?.notes)
      exercise.details!.notes = { expected: '', actual: '' }
    exercise.details!.notes!.expected = notes

    onEditExerciseDetails(exercise)
  }

  return (
    <>
      <div className='edit-workout-stage details-stage'>
        {exercises.map((exercise: Exercise) => (
          <div
            key={exercise.exerciseId}
            className='exercise-details-edit-container'
          >
            <h4>{capitalizeFirstLetter(exercise.name)}</h4>

            {exersiceDetailsSelects.map((select) => {
              return (
                <PickerSelect
                  openClock={() =>
                    openPickerModal(exercise, select.name as PickerModalType)
                  }
                  option={{
                    label: select.label,
                    key: select.name,
                    type: 'number',
                  }}
                  value={
                    (
                      exercise.details?.[
                        select.name as keyof ExerciseDetail
                      ] as { expected: number } | undefined
                    )?.expected || 0
                  }
                  key={select.name}
                />
              )
            })}
            <CustomInput
              value={exercise.details?.notes?.expected || ''}
              onChange={(notes: string) => onEditExerciseNotes(notes, exercise)}
              placeholder={`${capitalizeFirstLetter(
                exercise.name || ''
              )} notes`}
              isRemoveIcon={true}
            />
            <Divider
              className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
            />
          </div>
        ))}
      </div>
      <SlideDialog
        open={pickerModal.isOpen}
        onClose={closePickerModal}
        component={
          <ClockPicker
            value={getPickerModalValue(pickerModal.type) as number}
            onChange={(_, value: number) => onEditExerciseDetailes(value)}
            isAfterValue={getIsAfterValue(pickerModal.type)}
          />
        }
        title={capitalizeFirstLetter(pickerModal.type || '')}
      />
    </>
  )
}
