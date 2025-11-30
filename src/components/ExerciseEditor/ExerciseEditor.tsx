import { useState, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { Divider, Badge } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { RootState } from '../../store/store'
import { Set } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { SessionDay } from '../../types/workout/SessionDay'
import { instructionsService } from '../../services/instructions/instructions.service'
import { setSelectedSessionDay } from '../../store/actions/workout.action'
import { setIsLoading } from '../../store/actions/system.actions'
import { showErrorMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { PickerSelect } from '../Pickers/PickerSelect'
import { ClockPicker } from '../Pickers/ClockPicker'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { instructionsService as instructionsServiceUtil } from '../../services/instructions/instructions.service'
import { DeleteAction } from '../DeleteAction/DeleteAction'
import { SwipeableWrapper } from '../SwipeableWrapper/SwipeableWrapper'

export interface ExerciseEditorProps {
  exercise: ExerciseInstructions
}

interface EditSet extends Set {
  index: number
}

type PickerType = 'reps' | 'weight' | 'rpe' | null

interface PickerOption {
  isOpen: boolean
  type: PickerType
}

export function ExerciseEditor({ exercise }: ExerciseEditorProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )
  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
  )

  const [pickerOptions, setPickerOptions] = useState<PickerOption>({
    isOpen: false,
    type: null,
  })

  const [editSet, setEditSet] = useState<EditSet | null>(null)
  const [currentPickerValue, setCurrentPickerValue] = useState<number>(0)

  // ========== Save Functions ==========
  const saveExerciseInstructions = useCallback(
    async (updatedExercise: ExerciseInstructions) => {
      if (!sessionDay?.instructions) return

      try {
        setIsLoading(true)

        // Extract only required fields: exerciseId, sets, rpe, notes
        const exerciseInstructionsToSave: ExerciseInstructions = {
          exerciseId: updatedExercise.exerciseId,
          sets: updatedExercise.sets,
          rpe: updatedExercise.rpe,
          notes: updatedExercise.notes,
        }

        // Update session day with new exercise instructions
        const updatedExercises = sessionDay.instructions.exercises.map((ex) =>
          ex.exerciseId === exercise.exerciseId
            ? exerciseInstructionsToSave
            : {
                exerciseId: ex.exerciseId,
                sets: [...ex.sets],
                rpe: ex.rpe,
                notes: ex.notes,
              }
        )

        const instructionsToSave = {
          ...sessionDay.instructions,
          exercises: updatedExercises,
        }

        const fullInstructions = {
          ...sessionDay.instructions,
          exercises: sessionDay.instructions.exercises.map((ex) =>
            ex.exerciseId === exercise.exerciseId
              ? { ...ex, ...updatedExercise }
              : ex
          ),
        }

        // Save to backend
        await instructionsService.save(instructionsToSave)

        // Update Redux store
        const sessionToUpdate: SessionDay = {
          ...sessionDay,
          instructions: fullInstructions,
        }
        setSelectedSessionDay(sessionToUpdate)
      } catch (err) {
        showErrorMsg(messages.error.updateSet)
      } finally {
        setIsLoading(false)
      }
    },
    [sessionDay, exercise.exerciseId]
  )

  // ========== Set Handlers ==========
  const onAddSet = useCallback(async () => {
    if (!sessionDay?.instructions) return

    const lastSet = exercise.sets[exercise.sets.length - 1]
    const newSet = instructionsServiceUtil.getEmptySet()

    // Copy values from last set if exists
    if (lastSet) {
      newSet.reps.actual = lastSet.reps.actual
      newSet.weight.actual = lastSet.weight.actual
      newSet.reps.expected = lastSet.reps.expected
      newSet.weight.expected = lastSet.weight.expected
    }

    const updatedExercise: ExerciseInstructions = {
      ...exercise,
      sets: [...exercise.sets, newSet],
    }

    await saveExerciseInstructions(updatedExercise)
  }, [sessionDay, exercise, saveExerciseInstructions])

  // ========== Picker Handlers ==========
  const onPickerChange = useCallback(
    (_: unknown, value: number) => {
      // Track current picker value
      setCurrentPickerValue(value)

      if (pickerOptions.type === 'rpe') {
        // For RPE, store marker in editSet and track value
        setEditSet({ ...exercise.sets[0], index: -1 } as EditSet)
        return
      }

      if (
        (pickerOptions.type === 'weight' || pickerOptions.type === 'reps') &&
        editSet &&
        editSet.index >= 0
      ) {
        // Update set in local state with new actual value
        const updatedSet: EditSet = {
          ...editSet,
          [pickerOptions.type]: {
            ...editSet[pickerOptions.type],
            actual: value,
          },
        }
        setEditSet(updatedSet)
      }
    },
    [pickerOptions.type, editSet, exercise]
  )

  // ========== Picker Value Helpers ==========
  const getPickerValue = useCallback((): number => {
    const type = pickerOptions.type
    if (!type) return 0

    if (type === 'rpe') {
      return exercise.rpe.actual || 0
    }

    if (editSet && editSet.index >= 0 && exercise.sets[editSet.index]) {
      const set = exercise.sets[editSet.index]
      if (type === 'weight') {
        return set.weight.actual || 0
      }
      if (type === 'reps') {
        return set.reps.actual || 0
      }
    }

    return 0
  }, [pickerOptions.type, editSet, exercise])

  const getIsAfterValue = useCallback((type: PickerType): boolean => {
    return type === 'rpe' || type === 'weight'
  }, [])

  const getButtonsValues = useCallback((type: PickerType): number[] => {
    switch (type) {
      case 'rpe':
        return [5, 7, 9]
      case 'weight':
        return [15, 45, 75, 100]
      case 'reps':
        return [5, 10, 15, 20]
      default:
        return []
    }
  }, [])

  const getPickerValues = useCallback(
    (type: PickerType, key: 'min' | 'max'): number => {
      switch (type) {
        case 'rpe':
          return key === 'min' ? 1 : 9
        case 'weight':
          return key === 'min' ? 2 : 320
        case 'reps':
          return key === 'min' ? 1 : 25
        default:
          return 0
      }
    },
    []
  )

  // ========== Picker Close Handler ==========
  const onClosePicker = useCallback(async () => {
    try {
      setIsLoading(true)

      let updatedExercise: ExerciseInstructions | null = null

      if (pickerOptions.type === 'rpe') {
        // Update RPE - use the current picker value tracked in state
        updatedExercise = {
          ...exercise,
          rpe: {
            ...exercise.rpe,
            actual: currentPickerValue,
          },
        }
      } else if (
        (pickerOptions.type === 'weight' || pickerOptions.type === 'reps') &&
        editSet &&
        editSet.index >= 0
      ) {
        // Update specific set - use editSet which has the updated value
        const updatedSets = [...exercise.sets]
        const setToUpdate = { ...updatedSets[editSet.index] }

        if (pickerOptions.type === 'weight' && editSet.weight) {
          setToUpdate.weight = {
            ...setToUpdate.weight,
            actual: editSet.weight.actual,
          }
        } else if (pickerOptions.type === 'reps' && editSet.reps) {
          setToUpdate.reps = {
            ...setToUpdate.reps,
            actual: editSet.reps.actual,
          }
        }

        updatedSets[editSet.index] = setToUpdate
        updatedExercise = {
          ...exercise,
          sets: updatedSets,
        }
      }

      // Save to backend if there are changes
      if (updatedExercise) {
        await saveExerciseInstructions(updatedExercise)
      }

      // Reset picker state
      setPickerOptions({ isOpen: false, type: null })
      setEditSet(null)
      setCurrentPickerValue(0)
    } catch (err) {
      showErrorMsg(messages.error.saveSet)
    } finally {
      setIsLoading(false)
    }
  }, [
    pickerOptions.type,
    editSet,
    exercise,
    currentPickerValue,
    saveExerciseInstructions,
  ])

  const onDeleteSet = async (index: number) => {
    try {
      setIsLoading(true)
      console.log('index', index)
      const updatedSets = [...exercise.sets]

      updatedSets.splice(index, 1)
      const updatedExercise: ExerciseInstructions = {
        ...exercise,
        sets: updatedSets,
      }
      console.log('updatedExercise', updatedExercise)
      await saveExerciseInstructions(updatedExercise)
    } catch (err) {
      showErrorMsg(messages.error.deleteSet)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className='exercise-editor-container'>
        {exercise.sets && exercise.sets.length > 0 && (
          <SwipeableWrapper
            items={exercise.sets.map((set, index) => ({
              id: `${exercise.exerciseId}-set-${index}`,
              content: (
                <div className='set-container'>
                  <div className='set-editor-container'>
                    <Badge
                      badgeContent={index + 1}
                      color='primary'
                      className={prefs.favoriteColor}
                    />
                    <div className='reps-container'>
                      <PickerSelect
                        openClock={() => {
                          setPickerOptions({
                            type: 'reps',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })
                          setCurrentPickerValue(set.reps.actual || 0)
                        }}
                        option={{
                          label: 'Reps',
                          key: 'reps',
                          type: 'number',
                        }}
                        value={set.reps.actual}
                        minWidth={120}
                      />
                    </div>
                    <div className='weight-container'>
                      <PickerSelect
                        openClock={() => {
                          setPickerOptions({
                            type: 'weight',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })
                          setCurrentPickerValue(set.weight.actual || 0)
                        }}
                        option={{
                          label: 'Weight',
                          key: 'weight',
                          type: 'number',
                        }}
                        value={set.weight.actual}
                        minWidth={150}
                      />
                    </div>
                  </div>
                  <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  />
                </div>
              ),
              renderRightSwipeActions: () => (
                <DeleteAction
                  item={set}
                  onDeleteItem={() => onDeleteSet(index)}
                />
              ),
            }))}
            listKey={`${exercise.exerciseId}-list-${exercise.sets.length}`}
            threshold={0.15}
          />
        )}
        <div className='controls-container'>
          <PickerSelect
            openClock={() => {
              setPickerOptions({
                type: 'rpe',
                isOpen: true,
              })
              setEditSet({ ...exercise.sets[0], index: -1 } as EditSet)
              setCurrentPickerValue(exercise.rpe.actual || 0)
            }}
            option={{
              label: 'RPE',
              key: 'rpe',
              type: 'number',
            }}
            value={exercise.rpe.actual}
            minWidth={120}
          />
          <CustomButton
            icon={<AddIcon />}
            text='Add Set'
            onClick={onAddSet}
            fullWidth
          />
        </div>
      </div>
      <SlideDialog
        open={pickerOptions.isOpen}
        onClose={onClosePicker}
        component={
          <ClockPicker
            value={getPickerValue()}
            onChange={onPickerChange}
            isAfterValue={getIsAfterValue(pickerOptions.type)}
            buttonsValues={getButtonsValues(pickerOptions.type)}
            minValue={getPickerValues(pickerOptions.type, 'min')}
            maxValue={getPickerValues(pickerOptions.type, 'max')}
          />
        }
      />
    </>
  )
}
