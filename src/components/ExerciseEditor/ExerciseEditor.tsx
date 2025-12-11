import { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Badge } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { RootState } from '../../store/store'
import { Set } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { instructionsService } from '../../services/instructions/instructions.service'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { PickerSelect } from '../Pickers/PickerSelect'
import { ClockPicker } from '../Pickers/ClockPicker'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { DeleteAction } from '../DeleteAction/DeleteAction'
import { SwipeableWrapper } from '../SwipeableWrapper/SwipeableWrapper'
import { ExpectedActual } from '../../types/expectedActual/ExpectedActual'
import {
  pickerButtonsValues,
  pickerMinMaxValues,
} from '../../assets/config/exercise-editor-pickers'

export interface ExerciseEditorProps {
  exercise: ExerciseInstructions
  isExpected?: boolean
  updateExercise: (
    exercise: ExerciseInstructions,
    setIndex?: number,
    isNew?: boolean,
    isRemove?: boolean
  ) => void
}

interface EditSet extends Set {
  index: number
}

type PickerType = 'reps' | 'weight' | 'rpe' | 'rir' | null

interface PickerOption {
  isOpen: boolean
  type: PickerType
}

export function ExerciseEditor({
  exercise,
  isExpected,
  updateExercise,
}: ExerciseEditorProps) {
  const prefs = useSelector(
    (stateSelector: RootState) => stateSelector.systemModule.prefs
  )

  const [pickerOptions, setPickerOptions] = useState<PickerOption>({
    isOpen: false,
    type: null,
  })

  const [editSet, setEditSet] = useState<EditSet | null>(null)
  const [currentPickerValue, setCurrentPickerValue] = useState<number>(0)

  const onAddSet = () => {
    const existingSet =
      exercise.sets[exercise.sets.length - 1] ||
      instructionsService.getEmptySet()

    const newSet = {
      ...existingSet,
    }

    const newSets = [...exercise.sets, newSet]
    updateExercise(
      { ...exercise, sets: newSets },
      newSets.length - 1,
      isExpected ? false : true,
      false
    )
    showSuccessMsg(messages.success.addSet)
  }

  const onDeleteSet = (indexToRemove: number) => {
    if (indexToRemove === 0 && exercise.sets.length === 1) {
      showErrorMsg(messages.error.deleteSet)
      return
    }
    const newSets = exercise.sets.filter((_, index) => index !== indexToRemove)
    updateExercise(
      { ...exercise, sets: newSets },
      indexToRemove,
      isExpected ? false : true,
      true
    )
  }

  const onClosePicker = () => {
    setPickerOptions({
      isOpen: false,
      type: null,
    })
  }

  const onPickerChange = (value: number) => {
    if (!editSet) return

    let newSet = { ...editSet }

    const type = pickerOptions.type as keyof Set
    if (isExpected) {
      newSet = {
        ...newSet,
        [type]: {
          expected: value,
          actual: value,
        },
      }
    } else {
      newSet = {
        ...newSet,
        [type]: {
          expected: (newSet[type] as ExpectedActual<number>)?.expected || value,
          actual: value,
        },
      }
    }
    setEditSet(newSet)
  }

  useEffect(() => {
    const newExercise = { ...exercise }
    if (!newExercise || !editSet) return
    newExercise.sets = newExercise.sets.map((set, index) => {
      if (editSet.index <= index) return editSet
      return set
    })
    updateExercise(newExercise, editSet.index)
  }, [editSet])

  const getIsAfterValue = (type: PickerType): boolean => {
    return type === 'rpe' || type === 'weight'
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
                        className={`${prefs.favoriteColor}`}
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
                        minWidth={80}
                        // isAutoWidth={true}
                      />
                    </div>
                    <div className='weight-container'>
                      <PickerSelect
                        className={`${prefs.favoriteColor}`}
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
                        minWidth={100}
                        // isAutoWidth={true}
                      />
                    </div>
                    <div className='rpe-rir-container'>
                      <PickerSelect
                        className={`${prefs.favoriteColor}`}
                        openClock={() => {
                          setPickerOptions({
                            type: set.rpe ? 'rpe' : 'rir',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })

                          setCurrentPickerValue(
                            set.rpe ? set.rpe.actual : set.rir?.actual || 2
                          )
                        }}
                        option={{
                          label: set.rpe ? 'RPE' : 'RIR',
                          key: set.rpe ? 'rpe' : 'rir',
                          type: 'number',
                        }}
                        value={set.rpe ? set.rpe.actual : set.rir?.actual || 2}
                        minWidth={70}
                        // isAutoWidth={true}
                      />
                    </div>
                  </div>{' '}
                  {/* <Divider
                    className={`divider ${prefs.isDarkMode ? 'dark-mode' : ''}`}
                  /> */}
                </div>
              ),
              renderRightSwipeActions: () => (
                <DeleteAction
                  item={set}
                  onDeleteItem={() => onDeleteSet(index)}
                  destructive={
                    index === 0 && exercise.sets.length === 1 ? false : true
                  }
                />
              ),
            }))}
            listKey={`${exercise.exerciseId}-list-${exercise.sets.length}`}
            threshold={0.15}
          />
        )}
        <div className='controls-container'>
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
            value={currentPickerValue}
            onChange={(_, value) => onPickerChange(value)}
            isAfterValue={getIsAfterValue(pickerOptions.type)}
            buttonsValues={
              pickerButtonsValues[
                pickerOptions.type as keyof typeof pickerButtonsValues
              ]
            }
            minValue={
              pickerMinMaxValues[
                pickerOptions.type as keyof typeof pickerMinMaxValues
              ].min
            }
            maxValue={
              pickerMinMaxValues[
                pickerOptions.type as keyof typeof pickerMinMaxValues
              ].max
            }
          />
        }
      />
    </>
  )
}
