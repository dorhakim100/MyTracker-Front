import { useState, useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Badge } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'

import { RootState } from '../../store/store'
import { Set } from '../../types/exercise/Exercise'
import { ExerciseInstructions } from '../../types/exercise/ExerciseInstructions'
import { SessionDay } from '../../types/workout/SessionDay'
import { instructionsService } from '../../services/instructions/instructions.service'
import { setSelectedSessionDay } from '../../store/actions/workout.action'
import { setIsLoading } from '../../store/actions/system.actions'
import { showErrorMsg, showSuccessMsg } from '../../services/event-bus.service'
import { messages } from '../../assets/config/messages'
import { CustomButton } from '../../CustomMui/CustomButton/CustomButton'
import { PickerSelect } from '../Pickers/PickerSelect'
import { ClockPicker } from '../Pickers/ClockPicker'
import { SlideDialog } from '../SlideDialog/SlideDialog'
import { instructionsService as instructionsServiceUtil } from '../../services/instructions/instructions.service'
import { DeleteAction } from '../DeleteAction/DeleteAction'
import { SwipeableWrapper } from '../SwipeableWrapper/SwipeableWrapper'
import { EditItem } from '../../types/editItem/editItem'

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
  const sessionDay = useSelector(
    (stateSelector: RootState) => stateSelector.workoutModule.sessionDay
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

  const getPickerValue = () => {
    return currentPickerValue
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
          expected: newSet[type]?.expected || value,
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
      if (editSet.index === 0 && isExpected) return editSet
      if (index === editSet?.index) {
        return editSet
      }
      return set
    })
    updateExercise(newExercise, editSet.index)
  }, [editSet])

  const getIsAfterValue = (type: PickerType): boolean => {
    return type === 'rpe' || type === 'weight'
  }

  const getButtonsValues = useCallback((type: PickerType): number[] => {
    switch (type) {
      case 'rpe':
        return [5, 7, 9]
      case 'rir':
        return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
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
        case 'rir':
          return key === 'min' ? 1 : 3
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
                        minWidth={80}
                        // isAutoWidth={true}
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
                        minWidth={100}
                        // isAutoWidth={true}
                      />
                    </div>
                    <div className='rpe-rir-container'>
                      <PickerSelect
                        openClock={() => {
                          setPickerOptions({
                            type: set.rpe ? 'rpe' : 'rir',
                            isOpen: true,
                          })
                          setEditSet({ ...set, index })

                          setCurrentPickerValue(
                            set.rpe ? set.rpe.actual : set.rir?.actual || 0
                          )
                        }}
                        option={{
                          label: set.rpe ? 'RPE' : 'RIR',
                          key: set.rpe ? 'rpe' : 'rir',
                          type: 'number',
                        }}
                        value={set.rpe ? set.rpe.actual : set.rir?.actual || 0}
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
          {/* <PickerSelect
            openClock={() => {
              setPickerOptions({
                type: exercise.rpe ? 'rpe' : 'rir',
                isOpen: true,
              })
              setEditSet({ ...exercise.sets[0], index: -1 } as EditSet)
              setCurrentPickerValue(
                exercise.rpe ? exercise.rpe.actual : exercise.rir?.actual || 0
              )
            }}
            option={{
              label: exercise.rpe ? 'RPE' : 'RIR',
              key: exercise.rpe ? 'rpe' : 'rir',
              type: 'number',
            }}
            value={
              exercise.rpe ? exercise.rpe.actual : exercise.rir?.actual || 0
            }
            minWidth={120}
          /> */}
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
            onChange={(_, value) => onPickerChange(value)}
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
